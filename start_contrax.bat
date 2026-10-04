@echo off
setlocal enabledelayedexpansion
title CONTRAX - Smart Contract Security Platform
color 0B

echo ===============================================================================
echo   CONTRAX - Automated Vulnerability Scanner ^& Audit Visualizer
echo   "See the flaw before they do."
echo ===============================================================================
echo.

set "CONTRAX_DIR=%~dp0"
cd /d "%CONTRAX_DIR%"

echo [*] Verifying environment prerequisites...

where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] ERROR: Python is not installed or not in PATH.
    echo Please install Python 3.10+ and re-run.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] ERROR: Node.js / npm is not installed or not in PATH.
    echo Please install Node.js 18+ and re-run.
    pause
    exit /b 1
)

echo [OK] Python and Node.js detected.
echo.

echo [*] Launching CONTRAX Backend Server (FastAPI on http://127.0.0.1:8000)...
start "CONTRAX Backend [FastAPI]" /D "%CONTRAX_DIR%backend" cmd /k "title CONTRAX Backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

ping 127.0.0.1 -n 3 >nul

echo [*] Launching CONTRAX Frontend (Next.js on http://localhost:3000)...
start "CONTRAX Frontend [Next.js]" /D "%CONTRAX_DIR%frontend" cmd /k "title CONTRAX Frontend && npm run dev"

ping 127.0.0.1 -n 4 >nul

echo [*] Opening CONTRAX Dashboard in browser...
start http://localhost:3000

echo.
echo ===============================================================================
echo   CONTRAX is running!
echo   -----------------------------------------------------------------------------
echo   - Web Console:       http://localhost:3000
echo   - API Swagger Docs:  http://127.0.0.1:8000/docs
echo   - OpenAPI Spec:      http://127.0.0.1:8000/openapi.json
echo.
echo   To stop the platform, run stop_contrax.bat or close the opened terminal windows.
echo ===============================================================================
echo.
