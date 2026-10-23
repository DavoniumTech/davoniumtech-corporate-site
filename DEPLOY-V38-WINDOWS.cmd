@echo off
setlocal
chcp 65001 >nul
title Davonium Technologies V38 - Complete Website Deployment
rem Uses this script's own folder and never passes the trailing-slash %~dp0 as a parameter.
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Deploy-V38.ps1"
set "RESULT=%ERRORLEVEL%"
echo.
if not "%RESULT%"=="0" echo Deployment stopped or failed. Read the message above; local safety backups are retained.
echo.
pause
exit /b %RESULT%
