@echo off
echo.
echo ========================================
echo   ARMS - Start Local Development
echo ========================================
echo.
echo Starting backend and frontend servers...
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C in each window to stop servers
echo.

REM Start backend in new window
start "ARMS Backend" cmd /k "cd backend && npm run start:dev"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
start "ARMS Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✓ Servers starting in separate windows
echo ✓ Wait a few seconds for servers to be ready
echo ✓ Then open: http://localhost:3000
echo.
pause
