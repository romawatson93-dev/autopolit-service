// C:\Users\Life PC\Documents\autopolit-service\backend\src\controllers\linkController.js

const { v4: uuidv4 } = require("uuid");
const { Link, OpenEvent } = require("../../models");

// Создать ссылку (подрядчик)
exports.createLink = async (req, res) => {
  try {
    const { url, expiresAt, contractorId, clientName, maxOpens } = req.body;
    const token = uuidv4();

    const link = await Link.create({
      token,
      url,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      contractorId,
      clientName,
      maxOpens: maxOpens || null,
      openCount: 0,
    });

    // отдаём сразу «готовую ссылку»
    const base = process.env.APP_URL || "http://localhost:3000";
    const fullUrl = `${base}/open/${token}`;

    return res.status(201).json({
      message: "✅ Ссылка создана",
      fullUrl,
      link,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Ошибка при создании ссылки" });
  }
};

// Открыть ссылку по токену (логируем событие) и РЕДИРЕКТ
exports.openAndRedirect = async (req, res) => {
  try {
    const { token } = req.params;
    const link = await Link.findOne({ where: { token } });
    if (!link) {
      await OpenEvent.create({ linkId: null, ip: req.ip, ua: req.headers["user-agent"], success: false, reason: "not_found" });
      return res.status(404).send("Ссылка не найдена");
    }

    // срок жизни
    if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
      await OpenEvent.create({ linkId: link.id, ip: req.ip, ua: req.headers["user-agent"], success: false, reason: "expired" });
      return res.status(410).send("Срок действия ссылки истёк");
    }

    // лимит открытий
    if (link.maxOpens && link.openCount >= link.maxOpens) {
      await OpenEvent.create({ linkId: link.id, ip: req.ip, ua: req.headers["user-agent"], success: false, reason: "limit_reached" });
      return res.status(429).send("Превышен лимит открытий");
    }

    // лог и инкремент счётчика
    await OpenEvent.create({ linkId: link.id, ip: req.ip, ua: req.headers["user-agent"], success: true, reason: null });
    link.openCount += 1;
    await link.save();

    // 302 Redirect на защищаемый ресурс (позже тут будет MiniApp / viewer)
    return res.redirect(302, link.url);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Ошибка сервера");
  }
};

// Статистика открытий по linkId (для подрядчика)
exports.getOpenEvents = async (req, res) => {
  try {
    const { id } = req.params; // linkId
    const events = await OpenEvent.findAll({
      where: { linkId: id },
      order: [["createdAt", "DESC"]],
    });
    return res.json({ linkId: id, count: events.length, events });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Ошибка при получении статистики" });
  }
};
