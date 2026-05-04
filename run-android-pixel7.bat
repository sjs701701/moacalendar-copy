@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"

set "PROJECT_DIR=%CD%"
set "AVD_NAME=Pixel_7"
set "ANDROID_SDK=%LOCALAPPDATA%\Android\Sdk"
set "ANDROID_HOME=%ANDROID_SDK%"
set "ANDROID_SDK_ROOT=%ANDROID_SDK%"
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ADB=%ANDROID_SDK%\platform-tools\adb.exe"
set "EMULATOR=%ANDROID_SDK%\emulator\emulator.exe"
set "PATH=%JAVA_HOME%\bin;%ANDROID_SDK%\platform-tools;%ANDROID_SDK%\emulator;%PATH%"

if not exist "%ADB%" (
  echo [ERROR] adb.exe not found at "%ADB%"
  if not "%NO_PAUSE%"=="1" pause
  exit /b 1
)

if not exist "%EMULATOR%" (
  echo [ERROR] emulator.exe not found at "%EMULATOR%"
  if not "%NO_PAUSE%"=="1" pause
  exit /b 1
)

if not exist "%JAVA_HOME%\bin\java.exe" (
  echo [ERROR] JAVA_HOME is invalid: "%JAVA_HOME%"
  if not "%NO_PAUSE%"=="1" pause
  exit /b 1
)

where node.exe >nul 2>nul
if errorlevel 1 (
  echo [ERROR] node.exe was not found. Install Node.js and try again.
  if not "%NO_PAUSE%"=="1" pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm.cmd was not found. Install Node.js and try again.
  if not "%NO_PAUSE%"=="1" pause
  exit /b 1
)

where npx.cmd >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npx.cmd was not found. Install Node.js and try again.
  if not "%NO_PAUSE%"=="1" pause
  exit /b 1
)

if not exist "node_modules" (
  echo [INFO] Installing npm dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    if not "%NO_PAUSE%"=="1" pause
    exit /b 1
  )
)

if not exist "android\gradlew.bat" (
  echo [INFO] Generating Android native project...
  call npx.cmd expo prebuild --platform android --no-install
  if errorlevel 1 (
    echo [ERROR] Expo prebuild failed.
    if not "%NO_PAUSE%"=="1" pause
    exit /b 1
  )
)

set "SDK_DIR_ESCAPED=%ANDROID_SDK:\=\\%"
set "SDK_DIR_ESCAPED=%SDK_DIR_ESCAPED::=\:%"
if not exist "android" mkdir "android"
> "android\local.properties" echo sdk.dir=%SDK_DIR_ESCAPED%

set "AVD_FOUND="
for /f "delims=" %%i in ('"%EMULATOR%" -list-avds') do (
  if /i "%%i"=="%AVD_NAME%" set "AVD_FOUND=1"
)

if not defined AVD_FOUND (
  echo [ERROR] Android Virtual Device "%AVD_NAME%" was not found.
  echo [INFO] Open Android Studio Device Manager and create an emulator named "%AVD_NAME%".
  if not "%NO_PAUSE%"=="1" pause
  exit /b 1
)

set "ANDROID_SERIAL="
for /f "tokens=1" %%i in ('"%ADB%" devices ^| findstr /r "^emulator-[0-9].*device$"') do (
  set "ANDROID_SERIAL=%%i"
  goto emulator_ready
)

echo [INFO] Starting %AVD_NAME% emulator...
start "" "%EMULATOR%" -avd "%AVD_NAME%"

echo [INFO] Waiting for emulator device...
for /l %%a in (1,1,60) do (
  for /f "tokens=1" %%i in ('"%ADB%" devices ^| findstr /r "^emulator-[0-9].*device$"') do (
    set "ANDROID_SERIAL=%%i"
    goto emulator_ready
  )
  ping 127.0.0.1 -n 6 >nul
)

echo [ERROR] No running Android emulator was found after waiting.
if not "%NO_PAUSE%"=="1" pause
exit /b 1

:emulator_ready
echo [INFO] Using device %ANDROID_SERIAL%
echo [INFO] Waiting for Android to finish booting...

for /l %%a in (1,1,120) do (
  set "BOOT_DONE="
  for /f "delims=" %%i in ('"%ADB%" -s "!ANDROID_SERIAL!" shell getprop sys.boot_completed 2^>nul') do set "BOOT_DONE=%%i"
  if "!BOOT_DONE!"=="1" goto boot_ready
  ping 127.0.0.1 -n 6 >nul
)

echo [ERROR] Android did not finish booting in time.
if not "%NO_PAUSE%"=="1" pause
exit /b 1

:boot_ready
echo [INFO] %AVD_NAME% is ready.
echo [INFO] Launching MoaCalendar on Android...
call npx.cmd expo run:android --variant debug

if errorlevel 1 (
  echo [ERROR] Android launch failed.
  if not "%NO_PAUSE%"=="1" pause
  exit /b 1
)

echo [INFO] Done.
if not "%NO_PAUSE%"=="1" pause
