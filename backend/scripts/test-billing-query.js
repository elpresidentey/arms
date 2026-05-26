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
  const resident = await client.query(
    `SELECT id FROM users WHERE role = 'resident' ORDER BY "createdAt" DESC LIMIT 1`,
  );
  const userId = resident.rows[0]?.id;
  if (!userId) {
    console.log('No resident found');
    return;
  }

  const bills = await client.query(
    `SELECT id, "billNumber", "billingPeriod", "propertyType", amount, "lateFee", "totalAmount", status, "dueDate"
     FROM bills WHERE "userId" = $1 ORDER BY "billingPeriod" DESC, "createdAt" DESC`,
    [userId],
  );
  console.log('query ok, rows:', bills.rows.length);
  console.log(JSON.stringify(bills.rows, null, 2));
}

main()
  .catch((error) => {
    console.error('query failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => client.end().catch(() => undefined));
