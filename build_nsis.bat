@echo off
echo Terminating running application instances to prevent file lockups...
taskkill /f /im "DownTime Management.exe" 2>nul
taskkill /f /im "electron.exe" 2>nul

echo.
echo Cleaning old build artifacts...
if exist release (
    echo Deleting release folder...
    rmdir /s /q release
)

echo.
echo Building DownTime Management NSIS Installer...
call npm run package

echo.
echo Build finished. The installer can be found in the release directory.
pause
