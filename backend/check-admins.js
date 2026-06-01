require('dotenv').config();
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required in backend/.env');
  process.exit(1);
}

async function checkAdmins() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  await client.connect();

  try {
    const result = await client.query(`
      SELECT id, email, role, "firstName", "lastName"
      FROM users
      WHERE role = 'admin'
      ORDER BY "createdAt" DESC
    `);

    console.log('Admin users in Supabase Postgres:');
    console.log(JSON.stringify(result.rows, null, 2));
  } finally {
    await client.end();
  }
}

checkAdmins().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
