@echo off
echo ========================================
echo   NetDashboard - Starting all services
echo ========================================
echo.

REM Install root dependencies
if not exist node_modules (
    echo [1/3] Installing root dependencies...
    call npm install
)

REM Install server dependencies
if not exist server\node_modules (
    echo [2/3] Installing server dependencies...
    cd server && call npm install && cd ..
)

REM Install client dependencies
if not exist client\node_modules (
    echo [3/3] Installing client dependencies...
    cd client && call npm install && cd ..
)

echo.
echo Starting backend on port 3001...
start "NetDashboard-Server" cmd /k "cd server && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting frontend on port 5173...
start "NetDashboard-Client" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo   Both services starting...
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:5173
echo   Close the terminal windows to stop
echo ========================================
echo.

timeout /t 3

start http://localhost:5173

pause