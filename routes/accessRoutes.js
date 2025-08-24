const express = require("express");
const router = express.Router();

const { verifyInitData, makeDevInitData, parseInitData } = require("../utils/telegramAuth");
const requireClientAuth = require("../middleware/requireClientAuth");
const {
  createSession,
  refreshSession,
  revokeRefreshToken,
  revokeAllForUser,
  getViewerData
} = require("../services/sessionService");
const { SKIP_DB, loadModels } = require("../config/database");

// viewer/рендер если используешь
const { ensureRendered, listPages, makeSvg } = require("../services/renderService");

// NEW: лимит и валидация
const { authLimiter } = require("../middleware/rateLimit");
const { validateBody, z } = require("../utils/validate");

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const ALLOW_DEV = (process.env.ALLOW_DEV_INITDATA || "true").toLowerCase() === "true";
const INITDATA_TTL_SECONDS = Number(process.env.INITDATA_TTL_SECONDS || 86400);

// DEV initData (имитация)
router.get("/tg/dev-initdata", (_q, r) =>
  ALLOW_DEV ? r.json({ ok: true, initData: makeDevInitData() }) : r.status(403).json({ ok: false, error: "dev_disabled" })
);

async function upsertUserFromInitData(userObj) {
  if (SKIP_DB) return;
  const { User } = loadModels();
  if (!User) return;
  const payload = {
    id: userObj.id,
    username: userObj.username || null,
    first_name: userObj.first_name || null,
    last_name: userObj.last_name || null,
    language_code: userObj.language_code || null
  };
  const existing = await User.findByPk(payload.id);
  if (existing) return existing.update(payload);
  return User.create(payload);
}

// Логин через Telegram initData (dev-ветка или валидированная подпись)
router.post(
  "/tg",
  authLimiter,
  validateBody(z.object({ initData: z.string().min(10, "initData is required") })),
  async (q, r) => {
    try {
      const { initData } = q.valid.body;

      // dev-ветка без подписи
      if (ALLOW_DEV) {
        const parsed = parseInitData(initData);
        if (parsed.hash === "FAKEHASH_DEV_ONLY") {
          const sub = parsed.user?.id || "dev";
          if (parsed.user) await upsertUserFromInitData(parsed.user).catch(() => {});
          const session = await createSession(sub, { userAgent: q.headers["user-agent"], ip: q.ip });
          return r.json({ ok: true, sub, ...session });
        }
      }

      // нормальная валидация подписи Telegram
      const v = verifyInitData(initData, BOT_TOKEN, INITDATA_TTL_SECONDS);
      if (!v.ok) return r.status(401).json({ ok: false, error: v.reason });

      const sub = v.data.user?.id || "unknown";
      if (v.data.user) await upsertUserFromInitData(v.data.user).catch(() => {});
      const session = await createSession(sub, { userAgent: q.headers["user-agent"], ip: q.ip });
      return r.json({ ok: true, sub, ...session });
    } catch (e) {
      return r.status(500).json({ ok: false, error: e.message });
    }
  }
);

// Выдать refreshToken по access-токену
router.post("/session/start", requireClientAuth, async (q, r) => {
  const { sub } = q.user;
  const session = await createSession(sub, { userAgent: q.headers["user-agent"], ip: q.ip });
  return r.json({ ok: true, refreshToken: session.refreshToken });
});

// Обновить access-токен по refreshToken
router.post(
  "/session/refresh",
  authLimiter,
  validateBody(z.object({ refreshToken: z.string().min(10, "refreshToken is required") })),
  async (q, r) => {
    try {
      const { refreshToken } = q.valid.body;
      const out = await refreshSession(refreshToken);
      return r.json({ ok: true, ...out });
    } catch (e) {
      return r.status(e.status || 500).json({ ok: false, error: e.message });
    }
  }
);

// Текущий пользователь (по accessToken)
router.get("/me", requireClientAuth, async (q, r) => {
  const { sub } = q.user;
  if (SKIP_DB) return r.json({ ok: true, user: { id: sub } });

  try {
    const { User } = loadModels();
    const user = await (User ? User.findByPk(sub) : null);
    return r.json({ ok: true, user: user ? user.toJSON() : { id: sub } });
  } catch (e) {
    return r.status(500).json({ ok: false, error: e.message });
  }
});

// Логаут: отозвать ОДИН refreshToken
router.delete(
  "/session",
  validateBody(z.object({ refreshToken: z.string().min(10, "refreshToken is required") })),
  async (q, r) => {
    const { refreshToken } = q.valid.body;
    await revokeRefreshToken(refreshToken);
    return r.json({ ok: true });
  }
);

// Логаут везде: отозвать ВСЕ refreshToken пользователя
router.delete("/sessions", requireClientAuth, async (q, r) => {
  await revokeAllForUser(q.user.sub);
  return r.json({ ok: true });
});

// -------- viewer/контент (если используешь рендер) --------
router.get("/content/pages/:token", requireClientAuth, (q, r) => {
  ensureRendered(q.params.token);
  return r.json({ ok: true, pages: listPages(q.params.token) });
});

router.get("/content/page-svg/:token/:n", requireClientAuth, (q, r) => {
  const n = Number(q.params.n || 1);
  r.type("image/svg+xml").send(makeSvg(n, q.user?.sub));
});

router.get("/content/page-png/:token/:n", requireClientAuth, (_q, r) =>
  r.status(501).json({ ok: false, error: "png_not_implemented" })
);

router.post("/viewer/screenshot", requireClientAuth, (q, r) => {
  console.log("screenshot", q.body);
  r.json({ ok: true });
});

module.exports = router;
