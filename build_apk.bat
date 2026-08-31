@echo off
echo ========================================================
echo   TurnoYa - Generador Automatico de APK (Capacitor)
echo ========================================================
echo.

:: 1. Verificar si Node.js esta instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado. Por favor instale Node.js de https://nodejs.org/
    pause
    exit /b
)

:: 2. Instalar dependencias web de Node
echo [1/6] Instalando dependencias del proyecto...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Error al instalar dependencias del proyecto.
    pause
    exit /b
)

:: 3. Instalar Capacitor
echo [2/6] Instalando Capacitor Core, CLI y Android...
call npm install @capacitor/core @capacitor/cli @capacitor/android --save-dev
if %errorlevel% neq 0 (
    echo [ERROR] Error al instalar dependencias de Capacitor.
    pause
    exit /b
)

:: 4. Compilar aplicacion React (Vite)
echo [3/6] Compilando aplicacion web React/TypeScript...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Error en la compilacion de React.
    pause
    exit /b
)

:: 5. Agregar plataforma Android si no existe
echo [4/6] Configurando plataforma nativa Android...
if not exist android (
    echo Inicializando plataforma Android en Capacitor...
    call npx cap add android
) else (
    echo La plataforma Android ya esta configurada.
)

:: 6. Sincronizar codigo compilado con Android
echo [5/6] Sincronizando codigo web con la carpeta Android...
call npx cap sync
if %errorlevel% neq 0 (
    echo [ERROR] Error al sincronizar con Capacitor.
    pause
    exit /b
)

echo.
echo ========================================================
echo   Como deseas compilar el archivo APK?
echo ========================================================
echo [1] Compilar APK automaticamente usando Gradle - Requiere JDK y Android SDK
echo [2] Abrir en Android Studio - Recomendado para compilar visualmente sin variables de entorno
echo [3] Salir
echo ========================================================
set /p opcion="Selecciona una opcion (1-3): "

if "%opcion%"=="1" (
    echo.
    echo [6/6] Compilando APK con Gradle...
    cd android
    call gradlew assembleDebug
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] La compilacion con Gradle fallo. Esto suele ocurrir si no tienes configurado
        echo el Android SDK o la variable ANDROID_HOME en tu sistema.
        echo Se recomienda usar la Opcion 2 - Android Studio.
        cd ..
        pause
    ) else (
        echo.
        echo [EXITO] APK compilado correctamente!
        echo Puedes encontrar tu APK en:
        echo android\app\build\outputs\apk\debug\app-debug.apk
        cd ..
        explorer android\app\build\outputs\apk\debug\
        pause
    )
) else if "%opcion%"=="2" (
    echo.
    echo [6/6] Abriendo proyecto en Android Studio...
    echo Una vez abierto, ve a: Build -^> Build Bundle -^> Build APKs
    call npx cap open android
    pause
) else (
    echo Proceso terminado.
)
