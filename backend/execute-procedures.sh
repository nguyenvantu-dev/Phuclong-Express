#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================================"
echo "SQL Server Stored Procedure Executor"
echo "============================================================"
echo

# Check if sqlcmd exists
SQLCMD_PATH=""
if command -v sqlcmd > /dev/null 2>&1; then
    SQLCMD_PATH="sqlcmd"
elif [ -f /opt/mssql-tools18/bin/sqlcmd ]; then
    SQLCMD_PATH="/opt/mssql-tools18/bin/sqlcmd"
elif [ -f /opt/mssql-tools/bin/sqlcmd ]; then
    SQLCMD_PATH="/opt/mssql-tools/bin/sqlcmd"
fi

if [ -z "$SQLCMD_PATH" ]; then
    echo "ERROR: sqlcmd not found."
    exit 1
fi

echo "Found sqlcmd: $SQLCMD_PATH"

# Database config
DB_HOST="localhost"
DB_USERNAME="sa"
DB_PASSWORD="123456a@"
DB_DATABASE="PLELOGISTICS_OrderMan_1ST_01Jun2023"

echo "Database: $DB_DATABASE@$DB_HOST"
echo

count=0
success=0
fail=0

# Read note.txt line by line and extract procedures
NOTE_FILE="$SCRIPT_DIR/note.txt"

# Get all procedure names first
PROC_LIST=$(grep -oP 'CREATE PROCEDURE \[dbo\]\.\[\K[^\]]+' "$NOTE_FILE")

for procName in $PROC_LIST; do
    count=$((count + 1))
    echo "[$count] Executing: $procName"

    # Add DROP IF EXISTS at the beginning with GO
    echo "IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = '$procName') DROP PROCEDURE [dbo].[$procName];
GO" > "temp_sp.sql"
    awk -v proc="$procName" '
    BEGIN { found=0 }
    /CREATE PROCEDURE/ && index($0, "[dbo].[" proc "]") > 0 { found=1 }
    found { print }
    found && /CREATE PROCEDURE/ && index($0, "[dbo].[" proc "]") == 0 { exit }
    ' "$NOTE_FILE" | head -n -1 >> "temp_sp.sql"

    # Execute and show error if any
    output=$($SQLCMD_PATH -S "$DB_HOST" -U "$DB_USERNAME" -P "$DB_PASSWORD" -d "$DB_DATABASE" -i "temp_sp.sql" 2>&1)
    ret=$?

    rm -f "temp_sp.sql"

    if [ $ret -eq 0 ]; then
        echo "  [OK] $procName"
        success=$((success + 1))
    else
        echo "  [FAIL] $procName"
        echo "  Error: $output" | head -3
        fail=$((fail + 1))
    fi
done

echo
echo "============================================================"
echo "Summary: $success succeeded, $fail failed"
echo "============================================================"

# Show procedures count
echo
echo "Total procedures in database:"
$SQLCMD_PATH -S "$DB_HOST" -U "$DB_USERNAME" -P "$DB_PASSWORD" -d "$DB_DATABASE" -Q "SELECT COUNT(*) as total FROM sys.procedures" 2>&1
