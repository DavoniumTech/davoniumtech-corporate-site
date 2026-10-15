@echo off
setlocal
cd /d "%~dp0"
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo ERROR: Run this script from inside the existing davoniumtech-corporate-site Git repository.
  pause
  exit /b 1
)
set "BRAND_COMMIT=520e212"
git cat-file -e %BRAND_COMMIT%:assets/images/davonium-d-icon.png 2>nul
if errorlevel 1 (
  echo ERROR: The original logo commit was not found in this repository.
  echo Do not push yet. Restore the original files from GitHub history first.
  pause
  exit /b 1
)
git restore --source=%BRAND_COMMIT% -- assets/images/davonium-d-icon.png assets/icons/favicon-32.png assets/icons/apple-touch-icon.png assets/icons/icon-192.png assets/icons/icon-512.png
if errorlevel 1 (
  echo ERROR: Could not restore one or more brand assets. Do not push yet.
  pause
  exit /b 1
)
echo Original Davonium Technologies logo, favicon, touch icon, and PWA icons restored successfully.
echo These are the original files from commit %BRAND_COMMIT%.
if exist "assets\img\davonium-mark.svg" del /q "assets\img\davonium-mark.svg"
if exist "assets\img\icon-192.png" del /q "assets\img\icon-192.png"
if exist "assets\img\icon-512.png" del /q "assets\img\icon-512.png"
echo Removed the temporary generated icon assets so the original brand mark is used everywhere.
