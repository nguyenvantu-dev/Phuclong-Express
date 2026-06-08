import * as fs from 'fs';
import * as path from 'path';
import mssql from 'mssql';

/**
 * Chạy 1 file migration .sql (trong src/database/migrations) lên SQL Server.
 *
 * Tách batch theo dòng `GO` (vốn chỉ là batch separator của sqlcmd/SSMS, KHÔNG phải
 * T-SQL) rồi gửi từng batch riêng — nên file .sql vẫn giữ `GO` đúng chuẩn mà chạy
 * được qua node mssql driver.
 *
 * Usage:
 *   npx ts-node scripts/execute-migration.ts src/database/migrations/<file>.sql
 */

interface Config {
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
}

function loadConfig(): Config {
  const envPath = path.join(__dirname, '../.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');

  const config: Config = {} as Config;

  envContent.split('\n').forEach((line) => {
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

/**
 * Tách nội dung .sql thành các batch theo dòng chỉ chứa `GO` (không phân biệt hoa thường).
 * Bỏ qua batch rỗng/chỉ có comment.
 */
function splitBatches(sql: string): string[] {
  return sql
    .split(/^\s*GO\s*$/gim)
    .map((b) => b.trim())
    .filter((b) => b.length > 0 && !/^(--[^\n]*\s*)+$/.test(b));
}

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Usage: npx ts-node scripts/execute-migration.ts <path-to-.sql>');
    process.exit(1);
  }

  const filePath = path.isAbsolute(fileArg)
    ? fileArg
    : path.join(process.cwd(), fileArg);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('SQL Server Migration Runner');
  console.log('='.repeat(60));
  console.log(`\nMigration: ${filePath}`);

  const config = loadConfig();
  console.log(`Database: ${config.DB_DATABASE}@${config.DB_HOST}:${config.DB_PORT}`);

  const sql = fs.readFileSync(filePath, 'utf-8');
  const batches = splitBatches(sql);
  console.log(`Batches to run: ${batches.length}\n`);

  console.log('Connecting to SQL Server...');
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

  try {
    for (let i = 0; i < batches.length; i++) {
      const preview = batches[i].split('\n')[0].slice(0, 60);
      await pool.request().query(batches[i]);
      console.log(`[${i + 1}/${batches.length}] ✓ ${preview}`);
    }
    console.log('\n' + '='.repeat(60));
    console.log('Migration applied successfully.');
    console.log('='.repeat(60));
  } catch (error: any) {
    console.error('\n✗ Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.close();
  }
}

main().catch((err) => {
  console.error('\nError:', err.message);
  process.exit(1);
});
