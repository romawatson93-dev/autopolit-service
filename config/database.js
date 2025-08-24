const { Sequelize } = require("sequelize");
const SKIP_DB = (process.env.SKIP_DB || "true").toLowerCase() === "true";
let sequelize = null;

if (!SKIP_DB) {
  const ssl = String(process.env.PGSSL || "false").toLowerCase() === "true"
    ? { require: true, rejectUnauthorized: false }
    : false;
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
      dialect: "postgres",
      dialectOptions: ssl ? { ssl } : {},
      logging: false
    }
  );
}

async function testConnectionIfNeeded() {
  if (SKIP_DB) {
    console.log("SKIP_DB=true - пропускаю подключение к БД");
    return;
  }
  try {
    await sequelize.authenticate();
    console.log("успешное подключение к Postgres");
  } catch (e) {
    console.error(`ошибка подключения к Postgres: ${e.message}. Прекращаю запуск.`);
    process.exit(1);
  }
}
module.exports = { sequelize, testConnectionIfNeeded };