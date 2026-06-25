@echo off
setlocal

set "LIVE=W:\stammbaumdervaganten"
set "DEST=W:\stammbaumdervaganten.staging"
set "ROBO=robocopy /NDL /NS /NJH /NJS /NP"

if not exist "%LIVE%" (
    echo Error: %LIVE% does not exist!
    exit /b 1
)

if not exist "%DEST%" (
    echo Error: %DEST% does not exist!
    exit /b 1
)

REM Copy root files without purging mutable destination directories.
call :run %ROBO% "web" "%DEST%" *.* /LEV:1 /XF "bootstrap_setup.txt" /XD "app" "assets" "config" "data" "var" || exit /b 1

REM Mirror app-owned code and asset directories from the repository.
for %%D in (app assets) do call :run %ROBO% "web\%%D" "%DEST%\%%D" /MIR || exit /b 1

REM Keep staging config/runtime access protection, but refresh repository .htaccess files.
for %%D in (config var) do call :run %ROBO% "web\%%D" "%DEST%\%%D" ".htaccess" || exit /b 1

REM Staging data is live-derived and handled by the dedicated script.
call "%~dp0deploy-data-staging.bat" || exit /b 1

exit /b 0

:run
set "LOG=%TEMP%\stammbaum-deploy-%RANDOM%-%RANDOM%.log"
%* > "%LOG%"
set "RC=%ERRORLEVEL%"

findstr /R /V /C:"^[ ]*$" "%LOG%" | findstr /L /V /C:"*EXTRA"

if %RC% GEQ 8 (
    echo Robocopy failed with exit code %RC%.
    type "%LOG%"
    del "%LOG%" >nul 2>nul
    exit /b %RC%
)
del "%LOG%" >nul 2>nul
exit /b 0
