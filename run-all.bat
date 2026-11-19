@echo off
setlocal enabledelayedexpansion

:: ===================================================================
::  ArogyaAI Full-Stack One-Click Launcher (Windows)
:: ===================================================================

title ArogyaAI Platform - One-Click Launcher
cd /d "%~dp0"

cls
echo ===================================================================
echo             ArogyaAI Clinical Decision Support Platform
echo ===================================================================
echo.
echo Checking environment and Docker daemon status...
echo.

:: 1. Verify if Docker daemon is responsive
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Docker Desktop is not currently running or not found in PATH.
    echo.
    echo How would you like to proceed?
    echo   [1] Retry connecting to Docker Desktop
    echo   [2] Launch services in Native Local Dev Mode (Node + Python)
    echo   [3] Exit
    echo.
    set /p CHOICE="Enter choice [1-3]: "
    if "!CHOICE!"=="1" goto retry_docker
    if "!CHOICE!"=="2" goto native_dev
    exit /b 0
)

:start_docker
echo [+] Docker daemon detected.
echo [+] Starting all platform services via Docker Compose...
echo.

docker compose up -d

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to start Docker Compose containers.
    echo Please review error messages above.
    pause
    exit /b 1
)

echo.
echo ===================================================================
echo  All Services Running Successfully!
echo ===================================================================
echo  - Frontend Client:      http://localhost:3000
echo  - Backend API:          http://localhost:5000/api/health
echo  - AI Processing Engine: http://localhost:8000
echo  - MongoDB Database:     localhost:27017
echo ===================================================================
echo.

:: Launch default web browser
echo Launching client interface in browser...
start http://localhost:3000

:menu
echo.
echo Select an option:
echo   [1] View real-time streaming logs (Ctrl+C to return)
echo   [2] Stop all platform containers (docker compose down)
echo   [3] Re-open client in browser (http://localhost:3000)
echo   [4] Check service status (docker compose ps)
echo   [5] Exit launcher (containers will keep running in background)
echo.

set /p OPT="Select option [1-5]: "

if "%OPT%"=="1" (
    cls
    echo Streaming live logs across all containers. Press Ctrl+C to exit...
    docker compose logs -f
    goto menu
)
if "%OPT%"=="2" (
    echo.
    echo Stopping and removing platform containers...
    docker compose down
    echo [+] All containers successfully stopped.
    pause
    exit /b 0
)
if "%OPT%"=="3" (
    start http://localhost:3000
    goto menu
)
if "%OPT%"=="4" (
    cls
    echo Active Platform Containers:
    echo -------------------------------------------------------------
    docker compose ps
    goto menu
)
if "%OPT%"=="5" (
    echo.
    echo Services are running in background. Run 'stop-all.bat' to stop them.
    timeout /t 3 >nul
    exit /b 0
)

goto menu

:retry_docker
cls
echo Retrying Docker connection...
timeout /t 2 >nul
docker info >nul 2>&1
if %errorlevel% equ 0 goto start_docker
echo [!] Docker is still not reachable. Please start Docker Desktop first.
pause
exit /b 1

:native_dev
cls
echo ===================================================================
echo  Starting ArogyaAI in Native Development Mode
echo ===================================================================
echo.

:: Launch Express Backend API
echo [+] Launching Express API Server on port 5000...
start "ArogyaAI - Express API (Port 5000)" cmd /k "cd /d %~dp0server && npm run dev"

:: Launch AI FastAPI Microservice
echo [+] Launching AI Python Microservice on port 8000...
start "ArogyaAI - FastAPI Service (Port 8000)" cmd /k "cd /d %~dp0ai-service && python app/main.py"

:: Launch React Frontend Client
echo [+] Launching React Client on port 5173...
start "ArogyaAI - React Client (Port 5173)" cmd /k "cd /d %~dp0client && npm run dev"

timeout /t 5 >nul
echo.
echo Opening local frontend in default browser...
start http://localhost:5173

echo.
echo All native processes spawned in separate windows.
pause
exit /b 0
