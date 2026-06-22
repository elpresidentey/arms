const { Client } = require('pg');
require('dotenv').config();

async function checkBills() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const tables = [
      'bills',
      'bill_payments',
      'wallet_transactions',
      'wallets',
      'reports',
      'recyclables',
      'collection_requests',
      'service_requests',
      'collection_routes'
    ];
    
    console.log('Checking data in tables:\n');
    
    for (const table of tables) {
      try {
        const { rows } = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(rows[0].count);
        console.log(`${table}: ${count} records`);
      } catch (err) {
        console.log(`${table}: Error - ${err.message}`);
      }
    }
    
  } catch (err) {
    console.log(`Error: ${err.message}`);
  } finally {
    await client.end();
  }
}

checkBills();
