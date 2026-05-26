const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const backendRoot = path.resolve(__dirname, '..');
const sqlPath = process.argv[2] ? path.resolve(backendRoot, process.argv[2]) : null;

if (!sqlPath) {
  console.error('Usage: node scripts/apply-sql.js <sql-file>');
  process.exit(1);
}

const envPath = path.join(backendRoot, '.env');
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith('#') && line.includes('='))
    .map((line) => {
      const separatorIndex = line.indexOf('=');
      return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
    }),
);

if (!env.DATABASE_URL) {
  console.error('DATABASE_URL is required in backend/.env');
  process.exit(1);
}

const client = new Client({
  connectionString: env.DATABASE_URL,
  ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 30000,
});

async function main() {
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await client.connect();
  await client.query(sql);
  console.log(`Applied ${path.relative(backendRoot, sqlPath)}`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end().catch(() => undefined);
  });
