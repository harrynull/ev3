@ECHO OFF
echo Deploying "%~1". Waiting for EV3 to respond...
:CheckForFile
IF EXIST E:\Projects\ GOTO FoundIt
TIMEOUT /T 1 >nul
GOTO CheckForFile
:FoundIt
copy "%~1" E:\Projects\
echo Deployed!
TIMEOUT /T 2 >nul