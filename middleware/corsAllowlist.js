// middleware/corsAllowlist.js
const cors = require("cors");

/**
 * CORS_ORIGINS в .env:
 *   CORS_ORIGINS=http://localhost:5173,https://orbitsend.ru
 */
function makeCors() {
  const raw = process.env.CORS_ORIGINS || "";
  const allowlist = raw
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  return cors({
    origin(origin, cb) {
      // Разрешаем запросы без Origin (например, curl/Postman) и localhost, если явно указан
      if (!origin) return cb(null, true);
      if (allowlist.includes(origin)) return cb(null, true);
      return cb(new Error("CORS: origin not allowed"), false);
    },
    credentials: true,
    methods: ["GET","POST","DELETE","PUT","PATCH","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization","X-Requested-With"]
  });
}

module.exports = makeCors;
