const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const UAParser = require('ua-parser-js');
const { AccessLink, ClientDevice, ClientSession, OpenEvent, User } = require('../../models');
const { verifyTelegramInitData } = require('../utils/verifyTelegram');

const ACCESS_TTL_MIN = 15;     // мин на access JWT
const REFRESH_TTL_DAYS = 30;   // дней на refresh

function nowPlusMinutes(min) {
  return new Date(Date.now() + min * 60 * 1000);
}
function nowPlusDays(d) {
  return new Date(Date.now() + d * 24 * 60 * 60 * 1000);
}

exports.openViaTelegram = async (req, res) => {
  const { token, initData } = req.body;
  try {
    const link = await AccessLink.findOne({ where: { token, isActive: true }});
    if (!link) return res.status(404).json({ ok:false, error:'link_not_found' });

    if (link.expiresAt && new Date() > link.expiresAt) {
      await OpenEvent.create({ linkId: link.id, ip:req.ip, ua:req.headers['user-agent'], success:false, reason:'expired' });
      return res.status(410).json({ ok:false, error:'expired' });
    }

    const tg = verifyTelegramInitData(initData, process.env.BOT_TOKEN);
    if (!tg || !tg.user) {
      await OpenEvent.create({ linkId: link.id, ip:req.ip, ua:req.headers['user-agent'], success:false, reason:'tg_invalid' });
      return res.status(403).json({ ok:false, error:'tg_invalid' });
    }

    // тут можно сопоставлять phone/username при необходимости (если ты храните phone у client)
    // const client = await User.findByPk(link.clientId);
    // if (client.phone && tg.user.phone_number && normalize(client.phone) !== normalize(tg.user.phone_number)) { ... }

    // проверяем лимит устройств
    const deviceCount = await ClientDevice.count({ where: { clientId: link.clientId, linkId: link.id } });
    if (link.maxDevices && deviceCount >= link.maxDevices) {
      await OpenEvent.create({ linkId: link.id, ip:req.ip, ua:req.headers['user-agent'], success:false, reason:'devices_limit' });
      return res.status(403).json({ ok:false, error:'devices_limit' });
    }

    const parser = new UAParser(req.headers['user-agent']);
    const label = `${parser.getOS().name || ''} ${parser.getBrowser().name || ''}`.trim();

    // регистрируем/находим устройство
    const device = await ClientDevice.create({
      clientId: link.clientId,
      linkId: link.id,
      ua: req.headers['user-agent'] || '',
      label,
      lastSeenAt: new Date()
    });

    // создаём refresh-session
    const refreshToken = uuidv4();
    const refreshExp = nowPlusDays(REFRESH_TTL_DAYS);
    await ClientSession.create({
      clientId: link.clientId,
      deviceId: device.id,
      refreshToken,
      expiresAt: refreshExp
    });

    // выдаём access JWT
    const accessToken = jwt.sign(
      { clientId: link.clientId, deviceId: device.id, linkId: link.id },
      process.env.JWT_SECRET,
      { expiresIn: `${ACCESS_TTL_MIN}m` }
    );

    await OpenEvent.create({ linkId: link.id, clientId: link.clientId, deviceId: device.id, ip:req.ip, ua:req.headers['user-agent'], success:true });

    // httpOnly cookie для refresh (в реальном проде поставить secure:true и sameSite:'none')
    res.cookie('refresh', refreshToken, { httpOnly:true, maxAge: REFRESH_TTL_DAYS*24*60*60*1000 });
    res.json({ ok:true, accessToken, expiresAt: nowPlusMinutes(ACCESS_TTL_MIN), deviceId: device.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, error:'server_error' });
  }
};

// Веб-фолбэк: сначала /send-otp (смс), потом /verify-otp
// Ниже — заглушки; интеграцию с SMS-провайдером подключим позже.
exports.sendOtp = async (req, res) => {
  // req.body: { token, phone }
  // 1) найти ссылку; 2) проверить активность/срок; 3) сгенерировать код; 4) отправить SMS; 5) временно сохранить код (Redis/DB)
  res.json({ ok:true, message:'otp_sent_stub' });
};

exports.verifyOtp = async (req, res) => {
  // req.body: { token, phone, code }
  // 1) сверить код; 2) зарегистрировать устройство; 3) выдать access/refresh как в openViaTelegram
  res.json({ ok:true, message:'otp_verified_stub' });
};
