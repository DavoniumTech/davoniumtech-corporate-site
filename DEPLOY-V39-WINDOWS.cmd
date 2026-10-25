@echo off
setlocal
chcp 65001 >nul
title Davonium Technologies V39 - Complete Website Deployment
rem Run the PowerShell script from this extracted folder; never pass a quoted path with a trailing slash.
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Deploy-V39.ps1"
set "RESULT=%ERRORLEVEL%"
echo.
if not "%RESULT%"=="0" echo Deployment stopped or failed. Read the message above; safety backups are retained.
echo.
pause
exit /b %RESULT%
