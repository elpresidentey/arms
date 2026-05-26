/**
 * Generate current-month bills for all active users (dev helper).
 * Usage: node scripts/generate-sample-bills.js
 */
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

function currentPeriod() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
}

function dueDateForPeriod(period) {
  const [year, month] = period.split('-').map(Number);
  const lastDay = new Date(year, month, 0);
  const due = new Date(lastDay);
  due.setDate(due.getDate() + 7);
  return due;
}

async function main() {
  const period = currentPeriod();
  await client.connect();

  const users = await client.query(`SELECT id, "propertyType" FROM users WHERE "isActive" = true`);
  let created = 0;

  for (const user of users.rows) {
    const existing = await client.query(
      `SELECT id FROM bills WHERE "userId" = $1 AND "billingPeriod" = $2`,
      [user.id, period],
    );
    if (existing.rows.length > 0) {
      continue;
    }

    const countResult = await client.query(`SELECT COUNT(*)::int AS count FROM bills WHERE "billingPeriod" = $1`, [
      period,
    ]);
    const sequence = String(countResult.rows[0].count + 1).padStart(4, '0');
    const billNumber = `BILL-${period}-${sequence}`;
    const propertyType = user.propertyType === 'commercial' ? 'commercial' : 'residential';
    const amount = propertyType === 'commercial' ? 3500 : 2000;

    await client.query(
      `INSERT INTO bills (
        "billNumber", "userId", "billingPeriod", "propertyType",
        amount, "lateFee", "totalAmount", status, "dueDate"
      ) VALUES ($1, $2, $3, $4, $5, 0, $5, 'pending', $6)`,
      [billNumber, user.id, period, propertyType, amount, dueDateForPeriod(period)],
    );
    created += 1;
  }

  console.log(`Billing period ${period}: created ${created} bill(s) for ${users.rows.length} active user(s).`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => client.end().catch(() => undefined));
