@echo off
setlocal

set "DEST=W:\stammbaumdervaganten"
set "ROBO=robocopy /NDL /NS /NJH /NJS /NP"

if not exist "%DEST%" (
    echo Error: %DEST% does not exist!
    exit /b 1
)

if not exist "web\var\auth" (
    echo Error: web\var\auth does not exist!
    exit /b 1
)

REM Mirror auth state. /MIR purges destination auth files not present locally.
call :run %ROBO% "web\var\auth" "%DEST%\var\auth" /MIR || exit /b 1

REM Keep runtime access protection current when deploying auth independently.
call :run %ROBO% "web\var" "%DEST%\var" ".htaccess" || exit /b 1

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
