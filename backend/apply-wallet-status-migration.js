/**
 * Apply wallet status column migration
 * Adds the status column to wallet_transactions table
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyMigration() {
  console.log('🔧 Applying wallet status column migration...\n');

  // Parse DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in .env file');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false, // Required for Supabase
    },
  });

  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database\n');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'add-wallet-status-column.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Executing migration SQL...');
    console.log('---');
    console.log(sql);
    console.log('---\n');

    // Execute migration
    await client.query(sql);
    console.log('✅ Migration applied successfully!\n');

    // Verify the column was added
    console.log('🔍 Verifying column exists...');
    const result = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'wallet_transactions'
      AND column_name = 'status';
    `);

    if (result.rows.length > 0) {
      console.log('✅ Column verified:');
      console.log(`   Name: ${result.rows[0].column_name}`);
      console.log(`   Type: ${result.rows[0].data_type}`);
      console.log(`   Default: ${result.rows[0].column_default}`);
    } else {
      console.log('⚠️  Column not found after migration');
    }

    console.log('\n🎉 Migration complete!');
    console.log('You can now restart the backend server.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
