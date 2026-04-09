@echo off
setlocal

cd /d "%~dp0"

set "PROJECT_DIR=%CD%"
set "ANDROID_SDK=%LOCALAPPDATA%\Android\Sdk"
set "ANDROID_HOME=%ANDROID_SDK%"
set "ANDROID_SDK_ROOT=%ANDROID_SDK%"
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%ANDROID_SDK%\platform-tools;%ANDROID_SDK%\emulator;%PATH%"

if not exist "%ANDROID_SDK%\platform-tools\adb.exe" (
  echo [ERROR] adb.exe not found at "%ANDROID_SDK%\platform-tools\adb.exe"
  pause
  exit /b 1
)

if not exist "%ANDROID_SDK%\emulator\emulator.exe" (
  echo [ERROR] emulator.exe not found at "%ANDROID_SDK%\emulator\emulator.exe"
  pause
  exit /b 1
)

if not exist "%JAVA_HOME%\bin\java.exe" (
  echo [ERROR] JAVA_HOME is invalid: "%JAVA_HOME%"
  pause
  exit /b 1
)

set "SDK_DIR_ESCAPED=%ANDROID_SDK:\=\\%"
set "SDK_DIR_ESCAPED=%SDK_DIR_ESCAPED::=\:%"
if not exist "android" mkdir "android"
> "android\local.properties" echo sdk.dir=%SDK_DIR_ESCAPED%

set "PIXEL_RUNNING="
for /f "tokens=1" %%i in ('adb devices ^| findstr "emulator-"') do (
  set "PIXEL_RUNNING=1"
)

if not defined PIXEL_RUNNING (
  echo [INFO] Starting Pixel_7 emulator...
  start "" "%ANDROID_SDK%\emulator\emulator.exe" -avd Pixel_7
) else (
  echo [INFO] Emulator already running.
)

echo [INFO] Waiting for Android to finish booting...
:wait_boot
timeout /t 5 /nobreak >nul
for /f %%i in ('adb shell getprop sys.boot_completed 2^>nul') do set "BOOT_DONE=%%i"
if not "%BOOT_DONE%"=="1" goto wait_boot

for /f "tokens=1" %%i in ('adb devices ^| findstr "emulator-"') do (
  set "ANDROID_SERIAL=%%i"
  goto serial_ready
)

:serial_ready
if not defined ANDROID_SERIAL (
  echo [ERROR] No running Android emulator was found after boot.
  pause
  exit /b 1
)

echo [INFO] Pixel_7 is ready.
echo [INFO] Using device %ANDROID_SERIAL%
echo [INFO] Launching MoaCalendar on Android...
call npx expo run:android --variant debug

if errorlevel 1 (
  echo [ERROR] Android launch failed.
  pause
  exit /b 1
)

echo [INFO] Done.
pause
