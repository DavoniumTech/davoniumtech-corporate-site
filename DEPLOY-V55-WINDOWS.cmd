@echo off
setlocal EnableExtensions
cd /d "%~dp0"
echo.
echo === Davonium V55 deploy helper ===
echo This script prepares the GitHub repo and requires you to type PUSH.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0DEPLOY-V55.ps1"
