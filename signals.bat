@echo off
REM Apex Auto-Trader CLI - Signal Analysis Mode
title Apex Auto-Trader - Signal Analysis
cd /d "%~dp0"

echo ===========================================
echo   Apex Auto-Trader - Signal Analysis
echo ===========================================
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please run install.bat first.
    pause
    exit /b 1
)

REM Default to forex if no argument
if "%~1"=="" (
    set MODE=forex
    set PAIRS=EURUSD=X,GBPUSD=X,XAUUSD=X
) else (
    if "%~1"=="crypto" (
        set MODE=crypto
        set PAIRS=BTCUSDT,ETHUSDT
    ) else (
        set MODE=forex
        set PAIRS=EURUSD=X,GBPUSD=X,XAUUSD=X
    )
)

echo Mode: %MODE%
echo Pairs: %PAIRS%
echo.
echo Press Ctrl+C to stop
echo.

python cli.py signal --mode %MODE% --pairs %PAIRS% --interval 5

pause
