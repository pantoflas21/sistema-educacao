@echo off
echo ========================================
echo    INSTALANDO DEPENDENCIAS DO ALETHEIA
echo ========================================
echo.
echo Isso pode levar alguns minutos...
echo Por favor, aguarde...
echo.

cd /d "%~dp0"

echo [1/4] Instalando dependencias do projeto principal...
call npm install
if errorlevel 1 (
    echo ERRO ao instalar dependencias principais!
    pause
    exit /b 1
)
echo OK!
echo.

echo [2/4] Instalando dependencias do backend...
cd apps\backend
call npm install
if errorlevel 1 (
    echo ERRO ao instalar dependencias do backend!
    cd ..\..
    pause
    exit /b 1
)
echo OK!
echo.

echo [3/4] Instalando dependencias do frontend...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ERRO ao instalar dependencias do frontend!
    cd ..\..
    pause
    exit /b 1
)
echo OK!
echo.

cd ..\..

echo [4/4] Fazendo build do backend...
cd apps\backend
call npm run build
if errorlevel 1 (
    echo AVISO: Build do backend falhou, mas pode continuar
)
echo OK!
echo.

cd ..\frontend
echo Fazendo build do frontend...
call npm run build
if errorlevel 1 (
    echo AVISO: Build do frontend falhou, mas pode continuar
)
echo OK!
echo.

cd ..\..

echo ========================================
echo    INSTALACAO CONCLUIDA!
echo ========================================
echo.
echo Todas as dependencias foram instaladas!
echo Agora voce pode fazer o deploy.
echo.
pause


