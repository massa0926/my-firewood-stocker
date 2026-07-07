@echo off
chcp 65001 >nul
echo ============================================
echo   MyFirewoodStocker - 開発サーバー起動
echo ============================================
echo.

cd /d "%~dp0"

echo [INFO] 開発サーバーを起動します...
echo [INFO] ブラウザで http://localhost:5175 を開いてください
echo [INFO] 停止するには Ctrl+C を押してください
echo.

npm run dev

pause
