const crypto = require('crypto');
const querystring = require('querystring');

function verifyTelegramInitData(initData, botToken) {
  // initData — строка query (из Telegram.WebApp.initData)
  const data = querystring.parse(initData);
  const hash = data.hash;
  delete data.hash;

  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const dataCheckString = Object.keys(data)
    .sort()
    .map(k => `${k}=${data[k]}`)
    .join('\n');

  const calcHash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

  if (calcHash !== hash) return null;

  // data['user'] — это JSON-строка
  const user = data.user ? JSON.parse(data.user) : null;
  return { user, auth_date: data.auth_date };
}

module.exports = { verifyTelegramInitData };
