@echo off
REM Apex Auto-Trader CLI - Trading Statistics
title Apex Auto-Trader - Statistics
cd /d "%~dp0"

echo ===========================================
echo   Apex Auto-Trader - Trading Statistics
echo ===========================================
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please run install.bat first.
    pause
    exit /b 1
)

python cli.py stats

echo.
echo Data location: %USERPROFILE%\.apex_trader\
echo.
pause
