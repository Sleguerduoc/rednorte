@echo off

echo ==========================================
echo Iniciando entorno RedNorte...
echo ==========================================

cd /d C:\Proyectos\rednorte

echo.
echo Levantando Docker Compose...
start cmd /k "cd /d C:\Proyectos\rednorte && docker compose up -d"

timeout /t 10

echo.
echo Iniciando servicio-pacientes...
start cmd /k "cd /d C:\Proyectos\rednorte\servicio-pacientes && mvnw.cmd spring-boot:run"

echo.
echo Iniciando servicio-lista-espera...
start cmd /k "cd /d C:\Proyectos\rednorte\servicio-lista-espera && mvnw.cmd spring-boot:run"

echo.
echo Iniciando servicio-reasignacion...
start cmd /k "cd /d C:\Proyectos\rednorte\servicio-reasignacion && mvnw.cmd spring-boot:run"

echo.
echo Iniciando servicio-notificaciones...
start cmd /k "cd /d C:\Proyectos\rednorte\servicio-notificaciones && mvnw.cmd spring-boot:run"

echo.
echo Iniciando API Gateway...
start cmd /k "cd /d C:\Proyectos\rednorte\api-gateway && mvnw.cmd spring-boot:run"

echo.
echo Esperando servicios backend...
timeout /t 20

echo.
echo Iniciando frontend React...
start cmd /k "cd /d C:\Proyectos\rednorte\frontend && npm run dev"

echo.
echo ==========================================
echo RedNorte iniciado correctamente
echo ==========================================

pause