const express = require('express');
const router = express.Router();
const { User } = require('../../models'); // тянем модель из sequelize-cli

// Создание пользователя
router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.create({ username, email, password });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при создании пользователя' });
  }
});

// Получение всех пользователей
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении пользователей' });
  }
});

module.exports = router;
