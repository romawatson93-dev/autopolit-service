const express = require("express");
const router = express.Router();

const { verifyInitData, makeDevInitData, parseInitData } = require("../utils/telegramAuth");
const requireClientAuth = require("../middleware/requireClientAuth");
const { createSession, refreshSession, getViewerData } = require("../services/sessionService");
const { ensureRendered, listPages, makeSvg } = require("../services/renderService");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOW_DEV = (process.env.ALLOW_DEV_INITDATA || "false").toLowerCase() === "true";
const INITDATA_TTL_SECONDS = Number(process.env.INITDATA_TTL_SECONDS || 86400);

// DEV-хелпер для генерации initData
router.get("/tg/dev-initdata", (_q, r) => {
  if (!ALLOW_DEV) return r.status(403).json({ ok: false, error: "dev_disabled" });
  return r.json({ ok: true, initData: makeDevInitData() });
});

// Основной вход по initData из Telegram Mini App
router.post("/tg", (q, r) => {
  try {
    const { initData } = q.body || {};
    if (!initData) return r.status(400).json({ ok: false, error: "no_init" });

    // dev-обход подписи для локальной разработки
    if (ALLOW_DEV) {
      const parsed = parseInitData(initData);
      if (parsed.hash === "FAKEHASH_DEV_ONLY") {
        const sub = parsed.user?.id || "dev";
        const session = createSession(sub);
        return r.json({ ok: true, sub, ...session });
      }
    }

    // Валидация подписи Telegram
    const v = verifyInitData(initData, BOT_TOKEN, INITDATA_TTL_SECONDS);
    if (!v.ok) return r.status(401).json({ ok: false, error: v.reason });

    const sub = v.data.user?.id || "unknown";
    const session = createSession(sub);
    return r.json({ ok: true, sub, ...session });
  } catch (e) {
    return r.status(500).json({ ok: false, error: e.message });
  }
});

// Выдать refreshToken по access-токену (клиент аутентифицирован)
router.post("/session/start", requireClientAuth, (q, r) => {
  const { sub } = q.user;
  const session = createSession(sub);
  return r.json({ ok: true, refreshToken: session.refreshToken }); // <-- двоеточие (:) корректно
});

// Обновить access-токен по refreshToken
router.post("/session/refresh", (q, r) => {
  const { refreshToken } = q.body || {};
  if (!refreshToken) return r.status(400).json({ ok: false, error: "no_refresh" });
  try {
    const out = refreshSession(refreshToken);
    return r.json({ ok: true, ...out });
  } catch (e) {
    return r.status(e.status || 500).json({ ok: false, error: e.message });
  }
});

// Данные для viewer (пример)
router.get("/viewer/data/:token", requireClientAuth, (q, r) => {
  const { sub } = q.user;
  return r.json({ ok: true, sub, data: getViewerData(sub), token: q.params.token });
});

// Список страниц контента
router.get("/content/pages/:token", requireClientAuth, (q, r) => {
  ensureRendered(q.params.token);
  return r.json({ ok: true, pages: listPages(q.params.token) });
});

// Отдать SVG «страницы»
router.get("/content/page-svg/:token/:n", requireClientAuth, (q, r) => {
  const n = Number(q.params.n || 1);
  r.type("image/svg+xml").send(makeSvg(n, q.user?.sub));
});

// PNG пока не реализован
router.get("/content/page-png/:token/:n", requireClientAuth, (_q, r) =>
  r.status(501).json({ ok: false, error: "png_not_implemented" })
);

// Лог скриншота из клиента
router.post("/viewer/screenshot", requireClientAuth, (q, r) => {
  console.log("screenshot", q.body);
  r.json({ ok: true });
});

module.exports = router;
