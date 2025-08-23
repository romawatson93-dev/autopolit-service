#!/bin/bash
set -e

echo "🔄 Обновляем систему..."
apt update && apt upgrade -y

echo "👤 Создаём пользователя dev..."
adduser --disabled-password --gecos "" dev
usermod -aG sudo dev

echo "🔐 Настраиваем SSH-ключи..."
mkdir -p /home/dev/.ssh
# сюда скопируй содержимое своего id_rsa.pub с ПК
echo "SSH_PUBLIC_KEY_HERE" >> /home/dev/.ssh/authorized_keys
chown -R dev:dev /home/dev/.ssh
chmod 700 /home/dev/.ssh
chmod 600 /home/dev/.ssh/authorized_keys

echo "🔐 Устанавливаем UFW (фаервол)..."
apt install -y ufw
ufw allow OpenSSH
ufw allow http
ufw allow https
ufw --force enable

echo "🐳 Устанавливаем Docker и Compose..."
curl -fsSL https://get.docker.com | sh
usermod -aG docker dev
apt install -y docker-compose-plugin

echo "📦 Устанавливаем Git..."
apt install -y git

echo "✅ Готово! Теперь можно заходить как 'dev':"
echo "ssh dev@<IP_сервера>"
