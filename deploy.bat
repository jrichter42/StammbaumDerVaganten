@echo off
echo Deploying to W:\stammbaumdervaganten...

REM Check if destination exists
if not exist "W:\stammbaumdervaganten" (
    echo Error: W:\stammbaumdervaganten does not exist!
    exit /b 1
)

REM Copy all files from web directory, excluding mutable data/runtime directories
robocopy "web" "W:\stammbaumdervaganten" /E /PURGE /XD "web\data" "web\var" /NDL /NC /NS

echo Deployment complete!
