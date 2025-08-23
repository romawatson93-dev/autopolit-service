// C:\Users\Life PC\Documents\autopolit-service\backend\src\index.js

const linkController = require("./controllers/linkController");
const express = require('express');
const cors = require('cors');
const sequelize = require('./sequelize'); // здесь сам объект Sequelize
require('dotenv').config({ path: '../.env' });

const userRoutes = require('./routes/userRoutes'); // 🔹 роуты пользователей
const linkRoutes = require('./routes/linkRoutes'); // 🔹 роуты ссылок
const accessRoutes = require('./routes/accessRoutes'); // 🔹 роуты доступа

const app = express(); // ✅ сначала создаём приложение

app.get("/open/:token", linkController.openAndRedirect);
app.use(cors());
app.use(express.json());

// 🔹 Регистрируем все роуты
app.use('/api/users', userRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/access', accessRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключение к БД успешно!');

    await sequelize.sync({ alter: true });
    console.log('✅ Таблицы синхронизированы!');

    // 🔹 Тестовый маршрут
    app.get('/ping', (req, res) => {
      res.json({ message: 'pong' });
    });

    app.listen(PORT, () => {
      console.log(`✅ Backend запущен на порту ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Ошибка подключения к БД:', err);
  }
}

start();
