# setup.ps1 — безопасное создание структуры проекта
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function WriteFile($path, $content) {
    if (Test-Path $path) {
        Write-Host "⚠ файл $path уже существует — пропущен"
    } else {
        $folder = Split-Path $path -Parent
        if ($folder -and -not (Test-Path $folder)) {
            New-Item -ItemType Directory -Force -Path $folder | Out-Null
        }
        $content | Set-Content -Path $path -Encoding UTF8
        Write-Host "✔ создан файл $path"
    }
}

Write-Host "==> создаю папки (если нет)…"
$dirs = @(".vscode", "config", "routes", "services", "utils", "middleware")
$dirs | ForEach-Object { New-Item -ItemType Directory -Force -Path $_ | Out-Null }

# файлы
WriteFile ".gitignore" @'
node_modules
.env
.DS_Store
dist
'@

WriteFile "package.json" @'
{
  "name": "tma-backend",
  "version": "1.0.0",
  "private": true,
  "type": "commonjs",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "pg": "^8.12.0",
    "sequelize": "^6.37.3"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
'@

WriteFile ".vscode/tasks.json" @'
{
  "version": "2.0.0",
  "tasks": [
    { "label": "dev", "type": "shell", "command": "npm run dev", "problemMatcher": [] },
    { "label": "start", "type": "shell", "command": "npm start", "problemMatcher": [] }
  ]
}
'@

WriteFile "nodemon.json" @'
{
  "watch": ["*.js", "routes", "services", "utils", "middleware", "config"],
  "ext": "js,json",
  "ignore": ["node_modules", "dist"]
}
'@

WriteFile ".env.example" @'
# СЕРВЕР
PORT=3000
SKIP_DB=true

# JWT
JWT_SECRET=replace_me_with_strong_secret

# TELEGRAM
TELEGRAM_BOT_TOKEN=123456789:AA...
ALLOW_DEV_INITDATA=true
INITDATA_TTL_SECONDS=86400
'@

WriteFile "index.js" @'
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { sequelize, testConnectionIfNeeded } = require("./config/database");
const accessRoutes = require("./routes/accessRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/ping", (_req, res) => res.json({ ok: true, t: Date.now() }));
app.use(accessRoutes);

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ ok: false, error: err.message || "Internal error" });
});

(async () => {
  await testConnectionIfNeeded();
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
  });
})();
'@

WriteFile "config/database.js" @'
const { Sequelize } = require("sequelize");
const SKIP_DB = (process.env.SKIP_DB || "true").toLowerCase() === "true";
let sequelize = null;

if (!SKIP_DB) {
  const ssl = String(process.env.PGSSL || "false").toLowerCase() === "true"
    ? { require: true, rejectUnauthorized: false }
    : false;
  sequelize = new Sequelize(
    process.env.PGDATABASE,
    process.env.PGUSER,
    process.env.PGPASSWORD,
    {
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT || 5432),
      dialect: "postgres",
      dialectOptions: ssl ? { ssl } : {},
      logging: false
    }
  );
}

async function testConnectionIfNeeded() {
  if (SKIP_DB) {
    console.log("ℹ SKIP_DB=true — пропускаю подключение к БД");
    return;
  }
  try {
    await sequelize.authenticate();
    console.log("✔ Подключение к Postgres успешно");
  } catch (e) {
    console.error("✖ Ошибка подключения к Postgres:", e.message);
  }
}
module.exports = { sequelize, testConnectionIfNeeded };
'@

WriteFile "utils/telegramAuth.js" @'
const crypto = require("crypto");
function parseInitData(raw) {
  const params = new URLSearchParams(raw);
  const map = {}; for (const [k,v] of params.entries()) map[k]=v;
  if (map.user) { try { map.user = JSON.parse(map.user); } catch{} }
  return map;
}
function verifyInitData(rawInitData, botToken, ttlSec=86400) {
  if (!rawInitData||!botToken) throw new Error("Missing initData or bot token");
  const data=parseInitData(rawInitData);
  const receivedHash=data.hash;
  if(!receivedHash) return {ok:false,reason:"no_hash"};
  const items=Object.keys(data).filter(k=>k!=="hash").sort()
    .map(k=>`${k}=${typeof data[k]==="object"?JSON.stringify(data[k]):data[k]}`);
  const dataCheckString=items.join("\n");
  const secretKey=crypto.createHmac("sha256","WebAppData").update(botToken).digest();
  const computedHash=crypto.createHmac("sha256",secretKey).update(dataCheckString).digest("hex");
  if(computedHash!==receivedHash) return {ok:false,reason:"bad_hash"};
  if(ttlSec && data.auth_date){
    const ageSec=Math.floor(Date.now()/1000)-Number(data.auth_date);
    if(ageSec>ttlSec) return {ok:false,reason:"expired"};
  }
  return {ok:true,data};
}
function makeDevInitData(sampleUser={id:777,first_name:"Dev",username:"devuser"}){
  const params=new URLSearchParams();
  params.set("query_id","AADevQueryId");
  params.set("user",JSON.stringify(sampleUser));
  params.set("auth_date",String(Math.floor(Date.now()/1000)));
  params.set("hash","FAKEHASH_DEV_ONLY");
  return params.toString();
}
module.exports={verifyInitData,makeDevInitData,parseInitData};
'@

WriteFile "services/sessionService.js" @'
const jwt=require("jsonwebtoken");
const JWT_SECRET=process.env.JWT_SECRET||"dev_secret";
const ACCESS_TTL="15m", REFRESH_TTL="30d";
const refreshStore=new Map();
function signAccess(sub){return jwt.sign({sub,typ:"access"},JWT_SECRET,{expiresIn:ACCESS_TTL});}
function signRefresh(sub){const t=jwt.sign({sub,typ:"refresh"},JWT_SECRET,{expiresIn:REFRESH_TTL});refreshStore.set(t,sub);return t;}
function createSession(sub){return {accessToken:signAccess(sub),refreshToken:signRefresh(sub)};}
function refreshSession(rt){try{const p=jwt.verify(rt,JWT_SECRET);if(p.typ!=="refresh")throw Error();if(!refreshStore.has(rt))throw Error();return {accessToken:signAccess(p.sub)};}catch{let e=new Error("invalid_refresh_token");e.status=401;throw e;}}
function getViewerData(sub){return {userId:sub,role:"client",features:{viewer:true,screenshot:true},pagesCount:2};}
module.exports={createSession,refreshSession,getViewerData};
'@

WriteFile "services/renderService.js" @'
function ensureRendered(_t){return true;}
function listPages(t){return [1,2].map(n=>({n,svg:`/content/page-svg/${t}/${n}`,png:`/content/page-png/${t}/${n}`}));}
function makeSvg(n,sub){const w=800,h=1131;return `<?xml version="1.0"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
<rect width="${w}" height="${h}" fill="#f5f5f5"/>
<text x="40" y="80" font-size="36">Demo Page ${n}</text>
<text x="40" y="140" font-size="18" fill="#555">User: ${sub??"anonymous"}</text>
</svg>`;}
module.exports={ensureRendered,listPages,makeSvg};
'@

WriteFile "middleware/requireClientAuth.js" @'
const jwt=require("jsonwebtoken");
const JWT_SECRET=process.env.JWT_SECRET||"dev_secret";
module.exports=function(req,res,next){
  const h=req.headers.authorization||"";const [,t]=h.split(" ");
  if(!t) return res.status(401).json({ok:false,error:"no_token"});
  try{const p=jwt.verify(t,JWT_SECRET);if(p.typ!=="access")return res.status(401).json({ok:false,error:"wrong_type"});
    req.user={sub:p.sub};next();}catch{res.status(401).json({ok:false,error:"invalid_token"});}
};
'@

WriteFile "routes/accessRoutes.js" @'
const express=require("express");const router=express.Router();
const {verifyInitData,makeDevInitData,parseInitData}=require("../utils/telegramAuth");
const requireClientAuth=require("../middleware/requireClientAuth");
const {createSession,refreshSession,getViewerData}=require("../services/sessionService");
const {ensureRendered,listPages,makeSvg}=require("../services/renderService");
const BOT_TOKEN=process.env.TELEGRAM_BOT_TOKEN;
const ALLOW_DEV=(process.env.ALLOW_DEV_INITDATA||"false").toLowerCase()==="true";
const INITDATA_TTL_SECONDS=Number(process.env.INITDATA_TTL_SECONDS||86400);

router.get("/tg/dev-initdata",(_q,r)=>ALLOW_DEV?r.json({ok:true,initData:makeDevInitData()}):r.status(403).json({ok:false,error:"dev_disabled"}));
router.post("/tg",(q,r)=>{try{const {initData}=q.body||{};if(!initData)return r.status(400).json({ok:false,error:"no_init"});if(ALLOW_DEV){const p=parseInitData(initData);if(p.hash==="FAKEHASH_DEV_ONLY"){const s=p.user?.id||"dev";return r.json({ok:true,sub:s,...createSession(s)});}}
const v=verifyInitData(initData,BOT_TOKEN,INITDATA_TTL_SECONDS);if(!v.ok)return r.status(401).json({ok:false,error:v.reason});const s=v.data.user?.id||"unknown";r.json({ok:true,sub:s,...createSession(s)});}catch(e){r.status(500).json({ok:false,error:e.message});}});
router.post("/session/start",requireClientAuth,(q,r)=>{const {sub}=q.user;r.json({ok:true,refreshToken:createSession(sub).refreshToken});});
router.post("/session/refresh",(q,r)=>{const {refreshToken}=q.body||{};if(!refreshToken)return r.status(400).json({ok:false,error:"no_refresh"});try{r.json({ok:true,...refreshSession(refreshToken)});}catch(e){r.status(e.status||500).json({ok:false,error:e.message});}});
router.get("/viewer/data/:token",requireClientAuth,(q,r)=>{const {sub}=q.user;r.json({ok:true,sub,data:getViewerData(sub),token:q.params.token});});
router.get("/content/pages/:token",requireClientAuth,(q,r)=>{ensureRendered(q.params.token);r.json({ok:true,pages:listPages(q.params.token)});});
router.get("/content/page-svg/:token/:n",requireClientAuth,(q,r)=>{const n=Number(q.params.n||1);r.type("image/svg+xml").send(makeSvg(n,q.user?.sub));});
router.get("/content/page-png/:token/:n",requireClientAuth,(_q,r)=>r.status(501).json({ok:false,error:"png_not_implemented"}));
router.post("/viewer/screenshot",requireClientAuth,(q,r)=>{console.log("screenshot",q.body);r.json({ok:true});});
module.exports=router;
'@

Write-Host "==> Установка npm зависимостей…"
npm install | Out-Host

Write-Host "==> Done! Create .env from .env.example and in VS Code: Terminal -> Run Task -> dev"


