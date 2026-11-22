@echo off
cd /d "%~dp0"
echo Starting Delhi Real-Time Bus Traffic Model ^& Journey Planner...
if exist "%APPDATA%\Antigravity\bin\agy-node.cmd" (
    call "%APPDATA%\Antigravity\bin\agy-node.cmd" server.js
) else (
    node server.js
)
pause
