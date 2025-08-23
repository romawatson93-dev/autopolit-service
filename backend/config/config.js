// C:\Users\Life PC\Documents\autopolit-service\backend\config\config.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('🔎 DB_USER:', process.env.DB_USER);
console.log('🔎 DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('🔎 DB_NAME:', process.env.DB_NAME);
console.log('🔎 DB_HOST:', process.env.DB_HOST);
console.log('🔎 DB_PORT:', process.env.DB_PORT);

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : '',
    database: process.env.DB_NAME || 'autopolit',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres'
  }
};
