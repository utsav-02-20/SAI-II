@echo off
title ArogyaAI Platform - Stop All Services
cd /d "%~dp0"

echo ===================================================================
echo  Stopping ArogyaAI Platform Services
echo ===================================================================
echo.

docker compose down

echo.
echo [+] All platform services and containers have been stopped.
timeout /t 3
exit /b 0
