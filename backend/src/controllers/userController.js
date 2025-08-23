// C:\Users\Life PC\Documents\autopolit-service\backend\src\controllers\userController.js

const { User } = require('../../models');

// Создать пользователя
exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.create({ username, email, password });
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при создании пользователя' });
  }
};

// Получить всех пользователей
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении пользователей' });
  }
};

// Получить пользователя по id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении пользователя' });
  }
};
