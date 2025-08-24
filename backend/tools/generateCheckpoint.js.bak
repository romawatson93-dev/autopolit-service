// C:\Users\Life PC\Documents\autopolit-service\backend\tools\generateCheckpoint.js
const fs = require('fs');
const path = require('path');
const os = require('os');
const child = require('child_process');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const { Client } = require('pg');

const BACKEND_DIR = path.resolve(__dirname, '..');
const ROOT_DIR = path.resolve(__dirname, '..', '..');

function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } }
function list(dir) { try { return fs.readdirSync(dir).map(n => path.join(dir, n)); } catch { return []; } }
function listRecursive(dir) {
  const out = [];
  (function walk(d){
    let ents = [];
    try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full); else out.push(full);
    }
  })(dir);
  return out;
}
function rel(p){ return p.replace(ROOT_DIR + path.sep, '').split(path.sep).join('/'); }
function ts(){ return new Date().toISOString().replace('T',' ').split('.')[0]; }

// ------- ENV SUMMARY (без секретов) -------
const env = {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  APP_URL: process.env.APP_URL,
  PORT: process.env.PORT,
  BOT_TOKEN: process.env.BOT_TOKEN ? '[set]' : '[not set]',
  JWT_SECRET: process.env.JWT_SECRET ? '[set]' : '[not set]',
};

// ------- Git info (best-effort) -------
function gitCmd(args) {
  try { return child.execSync(`git ${args}`, { cwd: ROOT_DIR, stdio: ['ignore','pipe','ignore'] }).toString().trim(); }
  catch { return null; }
}
const gitInfo = {
  branch: gitCmd('rev-parse --abbrev-ref HEAD'),
  lastCommit: gitCmd('log -1 --pretty=%h%x20%ad%x20%s --date=short'),
  statusShort: gitCmd('status --porcelain') || ''
};

// ------- Parse routes (method + path) -------
function parseRoutes() {
  const routesDir = path.join(BACKEND_DIR, 'src', 'routes');
  const files = list(routesDir).filter(p => p.endsWith('.js'));
  const routes = [];
  const routeRegex = /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/ig;
  for (const f of files) {
    const src = readSafe(f) || '';
    let m;
    while ((m = routeRegex.exec(src)) !== null) {
      routes.push({ file: rel(f), method: m[1].toUpperCase(), path: m[2] });
    }
  }
  // index.js public routes like app.get('/open/:token', ...)
  const indexSrc = readSafe(path.join(BACKEND_DIR, 'src', 'index.js')) || '';
  const appRouteRegex = /app\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/ig;
  let m2;
  while ((m2 = appRouteRegex.exec(indexSrc)) !== null) {
    routes.push({ file: 'backend/src/index.js', method: m2[1].toUpperCase(), path: m2[2] });
  }
  // Deduplicate
  const key = r => `${r.method} ${r.path}`;
  return Object.values(Object.fromEntries(routes.map(r => [key(r), r]))).sort((a,b) => (a.path||'').localeCompare(b.path));
}

// ------- Parse models (modelName, tableName) -------
function parseModels() {
  const modelsDir = path.join(BACKEND_DIR, 'models');
  const files = list(modelsDir).filter(p => p.endsWith('.js'));
  const out = [];
  for (const f of files) {
    const src = readSafe(f) || '';
    // modelName: 'Link' | modelName:"Link"
    const modelName = (src.match(/modelName\s*:\s*['"`]([\w-]+)['"`]/) || [])[1] || null;
    // tableName: 'Links'
    const tableName = (src.match(/tableName\s*:\s*['"`]([\w-]+)['"`]/) || [])[1] || null;
    out.push({ file: rel(f), modelName, tableName });
  }
  return out.sort((a,b) => (a.modelName||'').localeCompare(b.modelName||''));
}

// ------- Parse migrations (just list file names) -------
function parseMigrations() {
  const migDir = path.join(BACKEND_DIR, 'migrations');
  return list(migDir).filter(p => p.endsWith('.js')).map(rel).sort();
}

// ------- DB stats -------
async function dbStats() {
  if (!env.DB_HOST || !env.DB_NAME || !env.DB_USER) return { ok:false, error:'DB env not set' };
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
  });
  try {
    await client.connect();
    const qCount = async (table) => {
      try { const r = await client.query(`SELECT COUNT(*)::int AS c FROM "${table}"`); return r.rows[0]?.c ?? 0; }
      catch { return 0; }
    };
    const users = await qCount('Users');
    const links = await qCount('Links');
    const openEvents = await qCount('OpenEvents');

    let appliedMigrations = [];
    try {
      const r = await client.query('SELECT name FROM "SequelizeMeta" ORDER BY name ASC');
      appliedMigrations = r.rows.map(x => x.name);
    } catch { /* ignore */ }

    await client.end();
    return { ok:true, users, links, openEvents, appliedMigrations };
  } catch (e) {
    return { ok:false, error:e.message };
  }
}

function codeBlock(obj) {
  return '```\n' + obj + '\n```';
}

function mdList(arr) {
  if (!arr || arr.length === 0) return '_нет_';
  return arr.map(x => `- ${x}`).join('\n');
}

function mdRoutes(routes) {
  if (!routes.length) return '_нет_';
  return routes.map(r => `- \`${r.method}\` ${r.path}  _(из ${r.file})_`).join('\n');
}

function mdModels(models) {
  if (!models.length) return '_нет_';
  return models.map(m => `- **${m.modelName || 'model?'}** → table: \`${m.tableName || '?'}\`  _(файл ${m.file})_`).join('\n');
}

function makeMarkdown({ routes, models, migrations, db }) {
  const envStr =
`DB_HOST=${env.DB_HOST}
DB_PORT=${env.DB_PORT}
DB_NAME=${env.DB_NAME}
DB_USER=${env.DB_USER}
APP_URL=${env.APP_URL}
PORT=${env.PORT}
BOT_TOKEN=${env.BOT_TOKEN}
JWT_SECRET=${env.JWT_SECRET}`;

  const gitStr = gitInfo.branch
    ? `- Ветка: \`${gitInfo.branch}\`
- Последний коммит: \`${gitInfo.lastCommit || 'n/a'}\`
- Изменения (short):\n${gitInfo.statusShort ? codeBlock(gitInfo.statusShort) : '_нет_'}`
    : '_git-репозиторий не обнаружен или git недоступен_';

  const dbStr = db.ok
    ? `- Users: **${db.users}**
- Links: **${db.links}**
- OpenEvents: **${db.openEvents}**
- Применённые миграции (${db.appliedMigrations?.length || 0}):\n${mdList(db.appliedMigrations || [])}`
    : `_не удалось подключиться к БД: ${db.error || 'нет env'}_`;

  return `# 🚀 Autopolit Service — Проектовый чекпоинт
**Обновлено:** ${ts()}  
**Машина:** ${os.hostname()}  
**Node:** ${process.version}

## 1) Концепция (кратко)
- Подрядчик создаёт защищённые ссылки (срок, лимиты, устройства).
- Клиент входит через Telegram Mini App или web-OTP.
- Все открытия логируются (IP/UA/успех).
- Подрядчик видит статистику.

## 2) Текущее состояние
- ✅ Express + Sequelize + PostgreSQL.
- ✅ Генерация ссылки: \`POST /api/links\` (возвращает \`fullUrl\`).
- ✅ Открытие: \`GET /open/:token\` (проверка условий, логирование, редирект).
- ✅ Логи по ссылке: \`GET /api/links/:id/logs\`.
- 🔜 Авторизация клиента (Telegram initData / SMS OTP).
- 🔜 Ограничения по устройствам (ClientDevice/ClientSession).
- 🔜 Viewer (мини-апп) вместо прямого редиректа.

## 3) ENV (без секретов)
${codeBlock(envStr)}

## 4) Роуты
${mdRoutes(routes)}

## 5) Модели
${mdModels(models)}

## 6) Миграции
${mdList(migrations)}

## 7) Сводка по БД
${dbStr}

## 8) Git
${gitStr}

## 9) Что дальше
1. Telegram авторизация (initData).
2. Web-OTP как fallback.
3. ClientDevice/ClientSession → refresh/access JWT.
4. Мини-апп viewer (PDF/изображения, защита от скриншота).
5. UI подрядчика (список ссылок, фильтры, логи).
6. Nginx + HTTPS, домен, CI/CD, резервные копии.
`;
}

(async () => {
  const routes = parseRoutes();
  const models = parseModels();
  const migrations = parseMigrations();
  const db = await dbStats();

  const md = makeMarkdown({ routes, models, migrations, db });

  const OUT_ROOT = path.join(ROOT_DIR, 'PROJECT_CHECKPOINT.md');
  const OUT_BACK = path.join(BACKEND_DIR, 'CHECKPOINT.md');
  fs.writeFileSync(OUT_ROOT, md, 'utf8');
  fs.writeFileSync(OUT_BACK, md, 'utf8');

  console.log(`✅ Checkpoint updated:\n- ${OUT_ROOT}\n- ${OUT_BACK}`);
})();
