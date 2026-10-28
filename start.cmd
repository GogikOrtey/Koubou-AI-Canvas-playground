@echo off
REM Запуск Koubou в этом окне: Vite на http://127.0.0.1:5173/ и вкладка в браузере.
REM Сервер — дочерний процесс этой консоли. Закрытие окна его останавливает.
cd /d "%~dp0"
if /i "%~1"=="--open" goto open

chcp 65001 >nul
title Koubou
echo Koubou: http://127.0.0.1:5173/
echo Закройте это окно, чтобы остановить сервер.
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js не найден в PATH.
  pause
  exit /b 1
)

if not exist "node_modules\vite\bin\vite.js" (
  echo Ставлю зависимости...
  call npm install
  if errorlevel 1 (
    echo npm install не удался.
    pause
    exit /b 1
  )
)

start "Koubou browser" /MIN cmd.exe /c ""%~f0" --open"
node "%~dp0node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 5173
set "code=%errorlevel%"
if not "%code%"=="0" (
  echo.
  echo Сервер остановлен, код %code%.
  pause
)
exit /b %code%

:open
set /a tries=0
:wait
curl.exe -fsS -o NUL "http://127.0.0.1:5173/" 2>nul
if not errorlevel 1 (
  start "" "http://127.0.0.1:5173/"
  exit /b 0
)
set /a tries+=1
if %tries% geq 45 exit /b 1
timeout /t 1 /nobreak >nul
goto wait
