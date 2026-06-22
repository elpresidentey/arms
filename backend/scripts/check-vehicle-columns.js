const { Client } = require('pg');
require('dotenv').config();

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const { rows } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vehicles' 
      ORDER BY ordinal_position
    `);
    
    console.log('Vehicles table columns:');
    rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));
    
  } finally {
    await client.end();
  }
}

check();
