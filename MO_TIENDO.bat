@echo off
title Mo app Tiendo
cd /d "E:\OpenCode\projects\appst1_tiendo"
set "PATH=C:\Program Files\nodejs;%PATH%"

rem Neu server chua chay thi mo them mot cua so chay Vite
netstat -ano | findstr /R /C:":3000 .*LISTENING" >nul
if %errorlevel%==0 goto OPEN_BROWSER

start "Tiendo - Server" cmd /k "cd /d E:\OpenCode\projects\appst1_tiendo && set PATH=C:\Program Files\nodejs;%%PATH%% && npm run dev"
timeout /t 4 /nobreak >nul

:OPEN_BROWSER
start "" "http://localhost:3000"
exit /b
