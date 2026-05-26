/**
 * Cleanup Script: Postgres Database
 * 
 * This script removes all data from the Postgres database.
 * Use this when you need to start fresh with production database.
 * 
 * Usage: node cleanup-postgres.js
 */

require('dotenv').config();
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not found in .env file');
  process.exit(1);
}

async function cleanupPostgres() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         ARMS Postgres Database Cleanup                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to Postgres database...\n');
    await client.connect();
    console.log('✅ Connected!\n');

    const tables = [
      'wallet_transactions',
      'recyclables',
      'waste_collections',
      'collection_routes',
      'service_requests',
      'reports',
      'payout_requests',
      'admin_invites',
      'users',
    ];

    console.log('🗑️  Clearing tables...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const table of tables) {
      try {
        const result = await client.query(`DELETE FROM ${table}`);
        console.log(`   ✅ Cleared ${table} (${result.rowCount} rows deleted)`);
        successCount++;
      } catch (err) {
        console.log(`   ❌ Failed to clear ${table}: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Cleanup Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully cleared: ${successCount} table(s)`);
    if (errorCount > 0) {
      console.log(`❌ Failed to clear: ${errorCount} table(s)`);
    }
    console.log('='.repeat(60));

    console.log('\n✨ Postgres database cleanup complete!\n');

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the cleanup
cleanupPostgres()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
