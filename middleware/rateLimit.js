// middleware/rateLimit.js
const rateLimit = require("express-rate-limit");

const isDev = (process.env.NODE_ENV || "development") !== "production";

// базовый лимит: 100 запросов за 15 минут с одного IP
const baseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "too_many_requests" }
});

// более строгий лимит для авторизационных точек
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: isDev ? 200 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "too_many_auth_requests" }
});

module.exports = { baseLimiter, authLimiter };
