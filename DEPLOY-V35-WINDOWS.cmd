@echo off
setlocal
chcp 65001 >nul
title Davonium Technologies V35 - Complete Website Deployment
rem Do not pass %~dp0 as an argument: it ends in a backslash and can corrupt a quoted path.
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Deploy-V35.ps1"
set "RESULT=%ERRORLEVEL%"
echo.
if not "%RESULT%"=="0" echo Deployment stopped or failed. Read the message above; local safety backups are retained.
echo.
pause
exit /b %RESULT%
