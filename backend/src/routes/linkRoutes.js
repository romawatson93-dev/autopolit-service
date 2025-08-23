// C:\Users\Life PC\Documents\autopolit-service\backend\src\routes\linkRoutes.js

const express = require("express");
const router = express.Router();
const { Link } = require("../../models");
const linkController = require("../controllers/linkController");

// создать ссылку
router.post("/", linkController.createLink);

// список ссылок (простая выдача для теста)
router.get("/", async (req, res) => {
  const links = await Link.findAll({ order: [["createdAt", "DESC"]] });
  // добавим удобства: вернём fullUrl
  const base = process.env.APP_URL || "http://localhost:3000";
  const withFull = links.map((l) => ({
    ...l.toJSON(),
    fullUrl: `${base}/open/${l.token}`,
  }));
  res.json(withFull);
});

// открыть/логировать/редиректить
router.get("/open/:token", linkController.openAndRedirect);

// статистика по linkId
router.get("/:id/logs", linkController.getOpenEvents);

module.exports = router;
