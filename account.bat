@echo off
REM Apex Auto-Trader CLI - Account Management
title Apex Auto-Trader - Account Manager
cd /d "%~dp0"

echo ===========================================
echo   Apex Auto-Trader - Account Manager
echo ===========================================
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please run install.bat first.
    pause
    exit /b 1
)

if "%~1"=="add" goto add
if "%~1"=="list" goto list
if "%~1"=="delete" goto delete
if "%~1"=="toggle" goto toggle

:menu
echo.
echo Available commands:
echo   account.bat add     - Add new account
echo   account.bat list    - List all accounts
echo   account.bat delete  - Delete an account
echo   account.bat toggle  - Toggle account active/inactive
echo.
echo Running interactive account manager...
echo.

python cli.py account
goto end

:add
python cli.py account --add
goto end

:list
python cli.py account --list
goto end

:delete
python cli.py account --delete
goto end

:toggle
python cli.py account --toggle
goto end

:end
pause
