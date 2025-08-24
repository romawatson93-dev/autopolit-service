require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { testConnectionIfNeeded } = require("./config/database");
const accessRoutes = require("./routes/accessRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/ping", (_req, res) => res.json({ ok: true, t: Date.now() }));
app.use(accessRoutes);

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ ok: false, error: err.message || "Internal error" });
});

(async () => {
  await testConnectionIfNeeded();
  app.listen(PORT, () => {
    console.log("SKIP_DB=true - пропускаю подключение к ");
    console.log("Сервер запущен на порту " + PORT);
    console.log("GET    /ping");
    console.log("GET    /tg/dev-initdata");
    console.log("POST   /tg");
    console.log("POST   /session/start");
    console.log("POST   /session/refresh");
    console.log("GET    /viewer/data/:token");
    console.log("GET    /content/pages/:token");
    console.log("GET    /content/page-svg/:token/:n");
    console.log("GET    /content/page-png/:token/:n (501 пока)");
    console.log("POST   /viewer/screenshot");
  });
})();
