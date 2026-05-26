const fs = require('fs');
const path = require('path');
const { DataSource } = require('typeorm');

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

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: env.DATABASE_URL,
    ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    entities: [path.join(backendRoot, 'dist/billing/entities/*.js')],
    synchronize: false,
  });

  await dataSource.initialize();
  const resident = await dataSource.query(
    `SELECT id FROM users WHERE role = 'resident' ORDER BY "createdAt" DESC LIMIT 1`,
  );
  const userId = resident[0]?.id;
  const bills = await dataSource.query(
    `SELECT * FROM bills WHERE "userId" = $1 ORDER BY "billingPeriod" DESC, "createdAt" DESC`,
    [userId],
  );
  console.log('typeorm raw query ok:', bills.length);
  await dataSource.destroy();
}

main().catch((error) => {
  console.error('typeorm failed:', error.message);
  process.exitCode = 1;
});
