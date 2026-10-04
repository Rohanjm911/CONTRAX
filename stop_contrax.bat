@echo off
title Stopping CONTRAX Platform...
color 0C

echo ===============================================================================
echo   Stopping CONTRAX Services...
echo ===============================================================================
echo.

echo [*] Terminating FastAPI backend on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [*] Terminating Next.js frontend dev server on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [OK] All CONTRAX servers stopped successfully.
pause
