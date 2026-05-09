@echo off

echo ==========================================
echo Deteniendo RedNorte...
echo ==========================================

docker compose down

taskkill /F /IM java.exe
taskkill /F /IM node.exe

echo.
echo Todo detenido correctamente.

pause