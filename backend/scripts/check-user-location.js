const { Client } = require('pg');
require('dotenv').config();

async function checkUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const { rows } = await client.query("SELECT email, latitude, longitude, ward, street FROM users WHERE email = 'admin@arms.com'");
    console.log(JSON.stringify(rows[0], null, 2));
  } finally {
    await client.end();
  }
}

checkUser();
