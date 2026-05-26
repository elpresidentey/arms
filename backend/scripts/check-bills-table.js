const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const backendRoot = path.resolve(__dirname, '..');
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

const client = new Client({
  connectionString: env.DATABASE_URL,
  ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

async function main() {
  await client.connect();
  const columns = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'bills' ORDER BY 1`,
  );
  console.log('bills columns:', columns.rows.map((row) => row.column_name).join(', '));
  const count = await client.query('SELECT COUNT(*)::int AS count FROM bills');
  console.log('bills count:', count.rows[0].count);

  const resident = await client.query(
    `SELECT id, email, role FROM users WHERE role = 'resident' LIMIT 1`,
  );
  if (resident.rows[0]) {
    const userBills = await client.query('SELECT id, "billNumber", status FROM bills WHERE "userId" = $1', [
      resident.rows[0].id,
    ]);
    console.log('sample resident:', resident.rows[0].email);
    console.log('resident bills:', userBills.rows.length);
  }
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => client.end().catch(() => undefined));
