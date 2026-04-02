@echo off
setlocal

echo ============================================================
echo SQL Server Stored Procedure Executor
echo ============================================================
echo.

REM Check if sqlcmd exists
where sqlcmd >nul 2>&1
if errorlevel 1 (
    echo ERROR: sqlcmd not found. Please install SQL Server Command Line Tools
    pause
    exit /b 1
)

REM Load .env variables
for /f "tokens=1,* delims==" %%a in ('findstr /i "^DB_" .env') do set %%a=%%b

if not defined DB_HOST set DB_HOST=localhost
if not defined DB_PORT set DB_PORT=1433
if not defined DB_DATABASE set DB_DATABASE=PLELOGISTICS_OrderMan_1ST_01Jun2023

echo Database: %DB_DATABASE%@%DB_HOST%:%DB_PORT%
echo.

set count=0
set success=0
set fail=0

REM Loop through each CREATE PROCEDURE in note.txt
for /f "tokens=2 delims=[]" %%p in ('findstr /i "^CREATE PROCEDURE" note.txt') do (
    set /a count+=1
    echo [!count!] Executing: %%p

    REM Extract procedure body using PowerShell
    powershell -NoProfile -Command ^
        "$content = Get-Content 'note.txt' -Raw -Encoding UTF8; " ^
        "$pattern = '(?s)CREATE PROCEDURE \[dbo\]\.\[%%p\][^']*?(?=CREATE PROCEDURE|$)'; " ^
        "$proc = [regex]::Match($content, $pattern).Value; " ^
        "if ($proc -ne '') { " ^
        "    $proc = $proc -replace 'CREATE PROCEDURE', " ^
        "        'IF EXISTS (SELECT * FROM sys.objects WHERE type = ''P'' AND name = ''%%p'') DROP PROCEDURE [dbo].[%%p]; CREATE PROCEDURE'; " ^
        "    $proc | Out-File -FilePath 'temp_sp.sql' -Encoding UTF8 -NoNewline" ^
        "}"

    REM Execute the procedure
    sqlcmd -S %DB_HOST%,%DB_PORT% -U %DB_USERNAME% -P %DB_PASSWORD% -d %DB_DATABASE% -i temp_sp.sql -E -b >nul 2>&1

    if errorlevel 0 (
        echo   [OK] %%p
        set /a success+=1
    ) else (
        echo   [FAIL] %%p
        set /a fail+=1
    )

    del temp_sp.sql >nul 2>&1
    echo.
)

echo ============================================================
echo Summary: !success! succeeded, !fail! failed
echo ============================================================
pause
endlocal
