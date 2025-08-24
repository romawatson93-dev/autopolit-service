// middleware/requireClientAuth.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

module.exports = function requireClientAuth(req, res, next) {
  try {
    const h = String(req.headers.authorization || "");
    const m = h.match(/^Bearer\s+(.+)$/i);
    if (!m) return res.status(401).json({ ok: false, error: "no_auth_header" });

    const token = m[1];
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload?.sub) return res.status(401).json({ ok: false, error: "bad_token" });

    req.user = { sub: payload.sub, tokenType: payload.typ || "access" };
    return next();
  } catch (e) {
    return res.status(401).json({ ok: false, error: "invalid_token" });
  }
};
