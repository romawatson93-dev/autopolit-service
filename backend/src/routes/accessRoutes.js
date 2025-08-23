const express = require('express');
const router = express.Router();
const accessController = require('../controllers/accessController');

// 🔹 Открыть ссылку через Telegram WebApp
router.post('/open/tg', accessController.openViaTelegram);

// 🔹 Fallback: запросить SMS-код
router.post('/open/send-otp', accessController.sendOtp);

// 🔹 Fallback: подтвердить SMS-код
router.post('/open/verify-otp', accessController.verifyOtp);

module.exports = router;
