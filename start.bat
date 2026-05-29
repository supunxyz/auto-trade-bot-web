@echo off
REM Apex Auto-Trader CLI - Interactive Mode
title Apex Auto-Trader CLI
cd /d "%~dp0"

echo ===========================================
echo   Apex Auto-Trader CLI v2.0
echo ===========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please run install.bat first.
    pause
    exit /b 1
)

REM Run CLI in interactive mode
python cli.py
