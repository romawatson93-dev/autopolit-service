// config/database.js
const { Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");

const SKIP_DB = (process.env.SKIP_DB || "false").toLowerCase() === "true";
let sequelize = null;

if (!SKIP_DB) {
  const ssl =
    (process.env.PGSSL || "false").toLowerCase() === "true"
      ? { require: true, rejectUnauthorized: false }
      : false;

  sequelize = new Sequelize(
    process.env.PG_DATABASE,
    process.env.PG_USER,
    process.env.PG_PASSWORD,
    {
      host: process.env.PG_HOST || "localhost",
      port: Number(process.env.PG_PORT || 5432),
      dialect: "postgres",
      dialectOptions: ssl ? { ssl } : {},
      logging: false,
    }
  );
}

/**
 * Загружает все модели из backend/models, поддерживает сигнатуру:
 *   module.exports = (sequelize, DataTypes) => { class Model extends Sequelize.Model {...}; return Model; }
 * и вызывает Model.associate(models), если есть.
 */
function loadModels() {
  if (!sequelize) return {};

  const modelsDir = path.join(__dirname, "..", "backend", "models"); // ВАЖНО: твоя папка
  if (!fs.existsSync(modelsDir)) return sequelize.models;

  const files = fs
    .readdirSync(modelsDir)
    .filter((f) => f.endsWith(".js"));

  for (const file of files) {
    const def = require(path.join(modelsDir, file));
    if (typeof def === "function") {
      // стиль sequelize-cli: (sequelize, DataTypes) => Model
      def(sequelize, require("sequelize").DataTypes);
    }
  }

  // ассоциации
  const { models } = sequelize;
  Object.values(models).forEach((m) => {
    if (typeof m.associate === "function") {
      m.associate(models);
    }
  });

  return models;
}

async function testConnectionIfNeeded() {
  if (SKIP_DB) {
    console.log("SKIP_DB=true - пропускаю подключение к БД");
    return;
  }
  try {
    await sequelize.authenticate();
    console.log("✅ Успешное подключение к PostgreSQL");
  } catch (e) {
    console.error("❌ Ошибка подключения к PostgreSQL:", e.message);
    throw e;
  }
}

module.exports = { sequelize, SKIP_DB, loadModels, testConnectionIfNeeded };
