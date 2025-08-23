# 🚀 Autopolit Service — Проектовый чекпоинт
**Обновлено:** 2025-08-23 16:55:00  
**Машина:** DESKTOP-PGO628T  
**Node:** v22.18.0

## 1) Концепция (кратко)
- Подрядчик создаёт защищённые ссылки (срок, лимиты, устройства).
- Клиент входит через Telegram Mini App или web-OTP.
- Все открытия логируются (IP/UA/успех).
- Подрядчик видит статистику.

## 2) Текущее состояние
- ✅ Express + Sequelize + PostgreSQL.
- ✅ Генерация ссылки: `POST /api/links` (возвращает `fullUrl`).
- ✅ Открытие: `GET /open/:token` (проверка условий, логирование, редирект).
- ✅ Логи по ссылке: `GET /api/links/:id/logs`.
- 🔜 Авторизация клиента (Telegram initData / SMS OTP).
- 🔜 Ограничения по устройствам (ClientDevice/ClientSession).
- 🔜 Viewer (мини-апп) вместо прямого редиректа.

## 3) ENV (без секретов)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=autopolit
DB_USER=postgres
APP_URL=http://localhost:3000
PORT=3000
BOT_TOKEN=[set]
JWT_SECRET=[set]
```

## 4) Роуты
- `POST` /  _(из backend/src/routes/userRoutes.js)_
- `GET` /  _(из backend/src/routes/userRoutes.js)_
- `GET` /:id/logs  _(из backend/src/routes/linkRoutes.js)_
- `GET` /open/:token  _(из backend/src/index.js)_
- `POST` /open/send-otp  _(из backend/src/routes/accessRoutes.js)_
- `POST` /open/tg  _(из backend/src/routes/accessRoutes.js)_
- `POST` /open/verify-otp  _(из backend/src/routes/accessRoutes.js)_
- `GET` /ping  _(из backend/src/index.js)_

## 5) Модели
- **model?** → table: `?`  _(файл backend/models/index.js)_
- **AccessLink** → table: `?`  _(файл backend/models/accesslink.js)_
- **AccessLog** → table: `AccessLogs`  _(файл backend/models/accesslog.js)_
- **ClientDevice** → table: `?`  _(файл backend/models/clientdevice.js)_
- **ClientSession** → table: `?`  _(файл backend/models/clientsession.js)_
- **Link** → table: `Links`  _(файл backend/models/link.js)_
- **OpenEvent** → table: `?`  _(файл backend/models/openevent.js)_
- **User** → table: `?`  _(файл backend/models/user.js)_

## 6) Миграции
- backend/migrations/20250822195340-create-user.js
- backend/migrations/20250822205731-create-access-links.js
- backend/migrations/20250822205839-create-client-devices.js
- backend/migrations/20250822205920-create-client-sessions.js
- backend/migrations/20250822205945-create-open-events.js
- backend/migrations/20250822212149-create-link.js
- backend/migrations/20250822213000-create-accesslog.js
- backend/migrations/20250822220000-create-client-devices.js

## 7) Сводка по БД
- Users: **3**
- Links: **3**
- OpenEvents: **0**
- Применённые миграции (8):
- 20250822195340-create-user.js
- 20250822205731-create-access-links.js
- 20250822205839-create-client-devices.js
- 20250822205920-create-client-sessions.js
- 20250822205945-create-open-events.js
- 20250822212149-create-link.js
- 20250822213000-create-accesslog.js
- 20250822220000-create-client-devices.js

## 8) Git
_git-репозиторий не обнаружен или git недоступен_

## 9) Что дальше
1. Telegram авторизация (initData).
2. Web-OTP как fallback.
3. ClientDevice/ClientSession → refresh/access JWT.
4. Мини-апп viewer (PDF/изображения, защита от скриншота).
5. UI подрядчика (список ссылок, фильтры, логи).
6. Nginx + HTTPS, домен, CI/CD, резервные копии.
