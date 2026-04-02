import * as fs from 'fs';
import * as path from 'path';
import mssql from 'mssql';

/**
 * Script to execute stored procedures from note.txt to SQL Server
 * Usage: npx ts-node scripts/execute-procedures.ts
 */

interface Config {
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
}

async function loadConfig(): Promise<Config> {
  const envPath = path.join(__dirname, '../.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');

  const config: Config = {} as Config;

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (key === 'DB_HOST') config.DB_HOST = value;
        if (key === 'DB_PORT') config.DB_PORT = parseInt(value);
        if (key === 'DB_USERNAME') config.DB_USERNAME = value;
        if (key === 'DB_PASSWORD') config.DB_PASSWORD = value;
        if (key === 'DB_DATABASE') config.DB_DATABASE = value;
      }
    }
  });

  return config;
}

async function parseProcedures(filePath: string): Promise<string[]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const procedures: string[] = [];

  // Match CREATE PROCEDURE blocks - handle both with and without GO separator
  const createProcRegex = /CREATE\s+PROCEDURE\s+\[dbo\]\.\[([^\]]+)\][\s\S]*?(?=CREATE\s+PROCEDURE\s+\[dbo\]\.|CREATE\s+PROC\s+\[dbo\]\.|$)/gi;

  let match;
  while ((match = createProcRegex.exec(content)) !== null) {
    const procText = match[0].trim();
    if (procText.length > 10) {
      procedures.push(procText);
    }
  }

  return procedures;
}

async function executeProcedure(
  pool: mssql.ConnectionPool,
  procedureSql: string
): Promise<{ success: boolean; name: string; error?: string }> {
  try {
    // Extract procedure name
    const nameMatch = procedureSql.match(/CREATE\s+PROCEDURE\s+\[dbo\]\.\[([^\]]+)\]/i);
    const name = nameMatch ? nameMatch[1] : 'Unknown';

    // Drop if exists
    const dropSql = `IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = '${name}') DROP PROCEDURE [dbo].[${name}]`;
    await pool.request().query(dropSql);

    // Create the procedure
    await pool.request().query(procedureSql);

    return { success: true, name };
  } catch (error: any) {
    const nameMatch = procedureSql.match(/CREATE\s+PROCEDURE\s+\[dbo\]\.\[([^\]]+)\]/i);
    const name = nameMatch ? nameMatch[1] : 'Unknown';

    return {
      success: false,
      name,
      error: error.message?.substring(0, 500)
    };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('SQL Server Stored Procedure Executor');
  console.log('='.repeat(60));

  try {
    // Load config
    const config = await loadConfig();
    console.log(`\nDatabase: ${config.DB_DATABASE}@${config.DB_HOST}:${config.DB_PORT}`);

    // Connect to SQL Server
    console.log('\nConnecting to SQL Server...');
    const pool = await mssql.connect({
      server: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USERNAME,
      password: config.DB_PASSWORD,
      database: config.DB_DATABASE,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    });
    console.log('Connected successfully!\n');

    // Parse procedures
    const notePath = path.join(__dirname, '../note.txt');
    const procedures = await parseProcedures(notePath);
    console.log(`Found ${procedures.length} procedures to execute\n`);

    // Execute each procedure
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < procedures.length; i++) {
      const result = await executeProcedure(pool, procedures[i]);

      if (result.success) {
        successCount++;
        console.log(`[${i + 1}/${procedures.length}] ✓ ${result.name}`);
      } else {
        failCount++;
        console.log(`[${i + 1}/${procedures.length}] ✗ ${result.name}`);
        console.log(`  Error: ${result.error?.substring(0, 200)}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log(`Summary: ${successCount} succeeded, ${failCount} failed`);
    console.log('='.repeat(60));

    await pool.close();

  } catch (error: any) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();
