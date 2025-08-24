// C:\Users\Life PC\Documents\autopolit-service\backend\src\sequelize.js

const { Sequelize } = require('sequelize');

// создаём подключение
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;
