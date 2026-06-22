const { Client } = require('pg');
require('dotenv').config();

async function cleanupAll() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Cleaning up all data...\n');
    
    const tables = [
      'bill_payments',
      'bills',
      'wallet_transactions',
      'recyclables',
      'reports',
      'collection_requests',
      'service_requests',
      'collection_routes',
      'admin_invites',
      'payout_requests'
    ];
    
    for (const table of tables) {
      try {
        const result = await client.query(`DELETE FROM ${table}`);
        console.log(`? Deleted ${result.rowCount} records from ${table}`);
      } catch (err) {
        console.log(`? ${table}: ${err.message}`);
      }
    }
    
    console.log('\n? Cleanup complete!');
    
  } catch (err) {
    console.log(`Error: ${err.message}`);
  } finally {
    await client.end();
  }
}

cleanupAll();
