@echo off
title ArogyaAI Platform - Project Integrity Check
cd /d "%~dp0"

cls
echo ===================================================================
echo             ArogyaAI Platform - Integrity and System Check
echo ===================================================================
echo.
echo Running non-Docker local system integrity verification...
echo.

node scripts\check-project.js

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Project verification encountered issues.
    echo.
) else (
    echo.
    echo [OK] Whole project verification complete without errors.
    echo.
)

pause
