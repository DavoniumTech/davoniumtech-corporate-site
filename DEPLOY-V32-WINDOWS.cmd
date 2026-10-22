@echo off
setlocal
chcp 65001 >nul
title Davonium Technologies V32 - Full Website Deployment
echo.
echo DAVONIUM TECHNOLOGIES V32 - COMPLETE WEBSITE DEPLOYMENT
echo Source folder: %~dp0
echo.
rem IMPORTANT: append dot so the source argument never ends in a backslash before a quote.
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Deploy-V32.ps1" -Source "%~dp0."
set "RESULT=%ERRORLEVEL%"
echo.
if not "%RESULT%"=="0" echo Deployment did not complete. Read the error above; backups are retained.
echo.
pause
exit /b %RESULT%
