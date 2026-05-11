@echo off
REM Windows test script to check server response

echo Testing server login endpoint...
echo.
echo Sending request to http://192.168.3.19:3000/login
echo.

curl -X POST http://192.168.3.19:3000/login ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\":\"bhanu\",\"password\":\"bhanu@1234\"}" ^
  -s

echo.
echo.
echo If you see accessToken and refreshToken above, server is working.
echo If not, there's an issue with the server or database.
pause
