@echo off
REM Apex Auto-Trader CLI - Installation Script
title Installing Apex Auto-Trader CLI...

echo ===========================================
echo   Apex Auto-Trader CLI - Installation
echo ===========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo [OK] Python found
echo.

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install Python dependencies
    pause
    exit /b 1
)

echo.
echo [OK] Python dependencies installed
echo.

REM Check for optional MT5 package
echo Checking MetaTrader5 package...
python -c "import MetaTrader5" 2>nul
if errorlevel 1 (
    echo [INFO] MetaTrader5 package not installed (optional - only for MT5 trading)
    echo To install: pip install MetaTrader5
) else (
    echo [OK] MetaTrader5 package found
)

REM Check for optional Binance package
echo.
echo Checking python-binance package...
python -c "import binance" 2>nul
if errorlevel 1 (
    echo [INFO] python-binance package not installed (optional - only for Binance trading)
    echo To install: pip install python-binance
) else (
    echo [OK] python-binance package found
)

echo.
echo ===========================================
echo   Installation Complete!
echo ===========================================
echo.
echo Next steps:
echo   1. Run: start.bat
echo   2. Or: python cli.py
echo.
pause
