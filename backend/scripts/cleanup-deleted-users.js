#!/usr/bin/env node
/**
 * Cleanup Script: Remove orphaned user profiles
 * 
 * This script identifies and removes user profiles from PostgreSQL
 * whose corresponding Supabase Auth accounts have been deleted.
 * 
 * USE WITH CAUTION - This permanently deletes user data!
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
  console.log('\n🧹 ARMS User Cleanup Script\n');
  console.log('================================\n');

  // Connect to PostgreSQL
  const dbClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await dbClient.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Get all users from PostgreSQL
    const { rows: dbUsers } = await dbClient.query(
      'SELECT id, email, role, "createdAt" FROM users ORDER BY "createdAt" DESC'
    );

    console.log(`📊 Found ${dbUsers.length} users in database\n`);

    if (dbUsers.length === 0) {
      console.log('✨ Database is clean - no users to check\n');
      return;
    }

    // Get all auth users from Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      throw new Error(`Failed to list Supabase users: ${authError.message}`);
    }

    const authUserIds = new Set(authData.users.map(u => u.id));
    const authEmails = new Set(authData.users.map(u => u.email?.toLowerCase()));

    console.log(`📊 Found ${authData.users.length} users in Supabase Auth\n`);

    // Find orphaned users (in DB but not in Supabase Auth)
    const orphanedUsers = dbUsers.filter(user => !authUserIds.has(user.id));

    if (orphanedUsers.length === 0) {
      console.log('✅ No orphaned users found - database is in sync!\n');
      return;
    }

    console.log(`⚠️  Found ${orphanedUsers.length} orphaned user(s):\n`);

    orphanedUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role})`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Created: ${new Date(user.createdAt).toLocaleString()}`);
      
      // Check if email exists in auth but with different ID
      if (authEmails.has(user.email.toLowerCase())) {
        console.log(`      ⚠️  EMAIL EXISTS IN AUTH WITH DIFFERENT ID!`);
      }
      console.log('');
    });

    // Ask for confirmation
    console.log('⚠️  WARNING: This will permanently delete user profiles and all related data!\n');
    console.log('Related data that will be deleted:');
    console.log('   - User profile');
    console.log('   - Wallet and transactions');
    console.log('   - Reports and recyclable submissions');
    console.log('   - Service requests');
    console.log('   - Bills and payments');
    console.log('   - Collection requests\n');

    // In a real scenario, you'd want to prompt for confirmation
    // For now, we'll do a dry run
    console.log('🔍 DRY RUN MODE - No data will be deleted\n');
    console.log('To actually delete these users, uncomment the deletion code in the script.\n');

    // UNCOMMENT THE CODE BELOW TO ACTUALLY DELETE THE ORPHANED USERS
    /*
    console.log('🗑️  Deleting orphaned users...\n');
    
    for (const user of orphanedUsers) {
      try {
        // Delete user and all related data (CASCADE should handle this)
        await dbClient.query('DELETE FROM users WHERE id = $1', [user.id]);
        console.log(`   ✅ Deleted ${user.email}`);
      } catch (error) {
        console.error(`   ❌ Failed to delete ${user.email}: ${error.message}`);
      }
    }
    
    console.log('\n✅ Cleanup complete!\n');
    */

  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
  } finally {
    await dbClient.end();
  }

  console.log('================================\n');
  console.log('💡 Tips:');
  console.log('   - Always backup your database before deleting data');
  console.log('   - Consider exporting user data before cleanup');
  console.log('   - Test with a few users first\n');
}

main();
