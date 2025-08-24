diff --git a/config/database.js b/config/database.js
index c0414ef3782e9940cd577b813114ad13b97e3c10..5b2070a89b438504c67f8b1dd8c5534aca3f8f92 100644
--- a/config/database.js
+++ b/config/database.js
@@ -1,35 +1,35 @@
 ﻿const { Sequelize } = require("sequelize");
 const SKIP_DB = (process.env.SKIP_DB || "true").toLowerCase() === "true";
 let sequelize = null;
 
 if (!SKIP_DB) {
   const ssl = String(process.env.PGSSL || "false").toLowerCase() === "true"
     ? { require: true, rejectUnauthorized: false }
     : false;
   sequelize = new Sequelize(
-    process.env.PGDATABASE,
-    process.env.PGUSER,
-    process.env.PGPASSWORD,
+    process.env.DB_NAME,
+    process.env.DB_USER,
+    process.env.DB_PASSWORD,
     {
-      host: process.env.PGHOST || "localhost",
-      port: Number(process.env.PGPORT || 5432),
+      host: process.env.DB_HOST || "localhost",
+      port: Number(process.env.DB_PORT || 5432),
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
