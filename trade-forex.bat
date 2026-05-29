@echo off
REM Apex Auto-Trader CLI - Quick Forex Trading
title Apex Auto-Trader - Forex Trading
cd /d "%~dp0"

echo ===========================================
echo   Apex Auto-Trader - Forex Mode
echo ===========================================
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please run install.bat first.
    pause
    exit /b 1
)

REM Check if accounts exist
python -c "import json, os; f=os.path.join(os.path.expanduser('~'), '.apex_trader', 'accounts.json'); exit(0 if os.path.exists(f) else 1)" 2>nul
if errorlevel 1 (
    echo [INFO] No accounts configured yet.
    echo.
    echo Please add an account first:
    echo   python cli.py account --add
    echo.
    pause
    exit /b 1
)

REM Check for dry run argument
if "%~1"=="--dry-run" (
    echo Starting FOREX trading in DRY-RUN mode...
    echo.
    python cli.py trade --mode forex --dry-run
) else (
    echo Starting FOREX trading...
    echo.
    echo Use: trade-forex.bat --dry-run  for simulation mode
    echo.
    python cli.py trade --mode forex
)

pause
