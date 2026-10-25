@echo off
setlocal
chcp 65001 >nul
title Davonium Technologies V41 - Deployment Hotfix
rem Run from the extracted website folder. Do not pass %~dp0 as a quoted script argument.
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Deploy-V41.ps1"
set "RESULT=%ERRORLEVEL%"
echo.
if not "%RESULT%"=="0" echo Deployment stopped or failed. Any completed safety backups were retained.
echo.
pause
exit /b %RESULT%
