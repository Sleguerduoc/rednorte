@echo off
REM Lanzador del calculo de cobertura global (ver cobertura-global.ps1).
REM Uso: cobertura-global.bat            -> solo lee los CSV existentes
REM      cobertura-global.bat -RunTests  -> corre "mvn test" en los 5 servicios primero
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0cobertura-global.ps1" %*
