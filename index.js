require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const { testConnectionIfNeeded, sequelize } = require("./config/database");
const accessRoutes = require("./routes/accessRoutes");

// NEW: CORS + rate-limit
const makeCors = require("./middleware/corsAllowlist");
const { baseLimiter } = require("./middleware/rateLimit");

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(helmet());
app.use(makeCors());                      // CORS с белым списком из .env (CORS_ORIGINS)
app.use(baseLimiter);                     // общий rate limit
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// healthcheck
app.get("/ping", (_req, res) => res.json({ ok: true, t: Date.now() }));

// роуты приложения
app.use(accessRoutes);

// обработчик ошибок (последним)
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ ok: false, error: err.message || "Internal error" });
});

// запуск
(async () => {
  await testConnectionIfNeeded();           // логика подключения/пропуска внутри config/database.js
  if (sequelize) {
    await sequelize.sync({ alter: true });  // создаст/обновит таблицы
    console.log("Схема БД синхронизирована");
  }
  app.listen(PORT, () => {
    console.log("Сервер запущен на порту " + PORT);
    console.log("GET    /ping");
    console.log("GET    /tg/dev-initdata");
    console.log("POST   /tg");
    console.log("POST   /session/start");
    console.log("POST   /session/refresh");
    console.log("DELETE /session");
    console.log("DELETE /sessions");
    console.log("GET    /me");
    console.log("GET    /content/pages/:token");
    console.log("GET    /content/page-svg/:token/:n");
    console.log("GET    /content/page-png/:token/:n (501 пока)");
    console.log("POST   /viewer/screenshot");
  });
})();
