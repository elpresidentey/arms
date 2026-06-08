#!/usr/bin/env node
/**
 * NUCLEAR OPTION: Delete ALL users from both Supabase Auth and PostgreSQL
 * 
 * ⚠️  EXTREME WARNING: This deletes EVERYTHING!
 * 
 * Use this when you want a complete fresh start for testing.
 * This will:
 * 1. Delete all users from Supabase Auth
 * 2. Delete all users from PostgreSQL (including all related data)
 * 
 * Run: node backend/scripts/reset-all-users.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log('\n💥💥💥 NUCLEAR RESET: Delete ALL Users 💥💥💥\n');
  console.log('⚠️⚠️⚠️  THIS WILL DELETE ALL USER DATA! ⚠️⚠️⚠️\n');
  console.log('================================\n');

  console.log('This will delete:');
  console.log('   ✗ All Supabase Auth users');
  console.log('   ✗ All PostgreSQL user profiles');
  console.log('   ✗ All wallets and transactions');
  console.log('   ✗ All reports and recyclables');
  console.log('   ✗ All service requests');
  console.log('   ✗ All bills and payments');
  console.log('   ✗ All collection requests\n');

  console.log('Waiting 3 seconds... Press Ctrl+C to cancel!\n');
  await new Promise(resolve => setTimeout(resolve, 3000));

  const dbClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await dbClient.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Step 1: Get all Supabase Auth users
    console.log('📊 Fetching Supabase Auth users...\n');
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      throw new Error(`Failed to list Supabase users: ${authError.message}`);
    }

    console.log(`Found ${authData.users.length} Supabase Auth users\n`);

    // Step 2: Delete from Supabase Auth
    if (authData.users.length > 0) {
      console.log('🗑️  Deleting from Supabase Auth...\n');
      
      let authDeletedCount = 0;
      for (const user of authData.users) {
        try {
          await supabase.auth.admin.deleteUser(user.id);
          console.log(`   ✅ Deleted from Auth: ${user.email}`);
          authDeletedCount++;
        } catch (error) {
          console.error(`   ❌ Failed to delete ${user.email}: ${error.message}`);
        }
      }
      
      console.log(`\n   Total deleted from Auth: ${authDeletedCount}\n`);
    }

    // Step 3: Get all PostgreSQL users
    const { rows: dbUsers } = await dbClient.query(
      'SELECT id, email, role FROM users'
    );

    console.log(`📊 Found ${dbUsers.length} users in PostgreSQL\n`);

    // Step 4: Delete from PostgreSQL
    if (dbUsers.length > 0) {
      console.log('🗑️  Deleting from PostgreSQL (this will cascade to all related data)...\n');
      
      const result = await dbClient.query('DELETE FROM users');
      console.log(`   ✅ Deleted ${result.rowCount} users from PostgreSQL\n`);
    }

    // Step 5: Verify cleanup
    const { rows: remainingUsers } = await dbClient.query('SELECT COUNT(*) FROM users');
    const remainingCount = parseInt(remainingUsers[0].count);

    console.log('================================\n');
    console.log('✅ RESET COMPLETE!\n');
    console.log(`Remaining users in database: ${remainingCount}\n`);
    
    if (remainingCount === 0) {
      console.log('🎉 Database is now completely clean!\n');
      console.log('You can now:');
      console.log('   1. Create bootstrap admin:');
      console.log('      curl -X POST http://localhost:3001/auth/bootstrap ...\n');
      console.log('   2. Register new test users\n');
    } else {
      console.log('⚠️  Some users remain in the database. This might be due to foreign key constraints.\n');
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await dbClient.end();
  }
}

main();
