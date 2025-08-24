@echo off
setlocal

if "%PORT%"=="" set PORT=3000
chcp 65001 >NUL

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
  taskkill /F /PID %%a >NUL 2>&1
  echo Освободил порт %PORT% (PID %%a)
)

echo Запускаю nodemon на порту %PORT%...
npx nodemon index.js
