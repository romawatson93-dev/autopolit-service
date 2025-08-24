const { Sequelize } = require("sequelize");
const SKIP_DB = (process.env.SKIP_DB || "true").toLowerCase() === "true";
let sequelize = null;

if (!SKIP_DB) {
  const ssl = String(process.env.PGSSL || "false").toLowerCase() === "true"
    ? { require: true, rejectUnauthorized: false }
    : false;
  sequelize = new Sequelize(
    process.env.PGDATABASE,
    process.env.PGUSER,
    process.env.PGPASSWORD,
    {
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT || 5432),
      dialect: "postgres",
      dialectOptions: ssl ? { ssl } : {},
      logging: false
    }
  );
}

async function testConnectionIfNeeded() {
  if (SKIP_DB) {
    console.log("SKIP_DB=true - пропускаю подключение к ");
    return;
  }
  try {
    await sequelize.authenticate();
    console.log("спешное подключение к Postgres");
  } catch (e) {
    console.error("шибка подключения к Postgres:", e.message);
  }
}
module.exports = { sequelize, testConnectionIfNeeded };
