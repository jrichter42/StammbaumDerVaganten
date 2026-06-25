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

if not exist "%LIVE%\data" (
    echo Error: %LIVE%\data does not exist!
    exit /b 1
)

REM Mirror live object data into staging.
call :run %ROBO% "%LIVE%\data" "%DEST%\data" /MIR || exit /b 1

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
