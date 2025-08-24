// services/sessionService.js
const jwt = require("jsonwebtoken");
const { sequelize, SKIP_DB, loadModels } = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const ACCESS_TTL = "15m";
const REFRESH_TTL_DAYS = 30;

const memoryStore = new Map(); // fallback если SKIP_DB=true

function signAccess(sub) {
  return jwt.sign({ sub, typ: "access" }, JWT_SECRET, { expiresIn: ACCESS_TTL });
}
function expDateDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}
async function signRefresh(sub, meta = {}) {
  const token = jwt.sign({ sub, typ: "refresh" }, JWT_SECRET, { expiresIn: `${REFRESH_TTL_DAYS}d` });
  if (SKIP_DB || !sequelize) {
    memoryStore.set(token, sub);
    return token;
  }
  const { Session } = loadModels();
  await Session.create({
    userId: sub,
    refreshToken: token,
    userAgent: meta.userAgent || null,
    ip: meta.ip || null,
    expiresAt: expDateDays(REFRESH_TTL_DAYS),
  });
  return token;
}

async function createSession(sub, meta = {}) {
  return { accessToken: signAccess(sub), refreshToken: await signRefresh(sub, meta) };
}

async function refreshSession(refreshToken) {
  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET);
    if (payload.typ !== "refresh") throw new Error();

    if (SKIP_DB || !sequelize) {
      if (!memoryStore.has(refreshToken)) throw new Error();
      return { accessToken: signAccess(payload.sub) };
    }

    const { Session } = loadModels();
    const row = await Session.findOne({ where: { refreshToken } });
    if (!row) throw new Error();
    if (row.expiresAt && row.expiresAt < new Date()) {
      await row.destroy().catch(() => {});
      throw new Error("expired");
    }
    return { accessToken: signAccess(payload.sub) };
  } catch {
    const err = new Error("invalid_refresh_token");
    err.status = 401;
    throw err;
  }
}

async function revokeRefreshToken(refreshToken) {
  if (SKIP_DB || !sequelize) {
    memoryStore.delete(refreshToken);
    return;
  }
  const { Session } = loadModels();
  await Session.destroy({ where: { refreshToken } });
}

async function revokeAllForUser(sub) {
  if (SKIP_DB || !sequelize) {
    for (const [tok, s] of memoryStore.entries()) if (s === sub) memoryStore.delete(tok);
    return;
  }
  const { Session } = loadModels();
  await Session.destroy({ where: { userId: sub } });
}

function getViewerData(sub) {
  return { userId: sub, role: "client", features: { viewer: true, screenshot: true }, pagesCount: 2 };
}

module.exports = {
  createSession,
  refreshSession,
  revokeRefreshToken,
  revokeAllForUser,
  getViewerData,
};
