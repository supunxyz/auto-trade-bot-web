@echo off
echo ========================================
echo Apex Auto-Trader Starter
echo ========================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python not found in PATH
    exit /b 1
)

:: Initialize database if needed
echo Initializing database...
python scripts\init_db.py
if errorlevel 1 (
    echo Error: Database initialization failed
    exit /b 1
)

echo.
echo Starting backend server...
echo API will be available at: http://localhost:8000
echo Documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop
echo.

:: Start backend
python backend\main.py

pause
