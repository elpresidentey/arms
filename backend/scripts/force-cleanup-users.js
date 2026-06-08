#!/usr/bin/env node
/**
 * FORCE Cleanup Script: Remove ALL orphaned user profiles
 * 
 * ⚠️  WARNING: This script WILL DELETE DATA!
 * 
 * This removes all user profiles from PostgreSQL whose Supabase Auth
 * accounts have been deleted. Use this when you've deleted users from
 * Supabase and need to clean up the database.
 * 
 * Run: node backend/scripts/force-cleanup-users.js
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
  console.log('\n💥 FORCE CLEANUP: Remove Orphaned Users\n');
  console.log('================================\n');

  const dbClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await dbClient.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Get all users from PostgreSQL
    const { rows: dbUsers } = await dbClient.query(
      'SELECT id, email, role, "firstName", "lastName", "createdAt" FROM users ORDER BY "createdAt" DESC'
    );

    console.log(`📊 Found ${dbUsers.length} users in database\n`);

    if (dbUsers.length === 0) {
      console.log('✨ Database is clean - no users found\n');
      return;
    }

    // Get all auth users from Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      throw new Error(`Failed to list Supabase users: ${authError.message}`);
    }

    const authUserIds = new Set(authData.users.map(u => u.id));

    console.log(`📊 Found ${authData.users.length} users in Supabase Auth\n`);

    // Find orphaned users
    const orphanedUsers = dbUsers.filter(user => !authUserIds.has(user.id));

    if (orphanedUsers.length === 0) {
      console.log('✅ No orphaned users found - database is in sync!\n');
      return;
    }

    console.log(`⚠️  Found ${orphanedUsers.length} orphaned user(s) to delete:\n`);

    orphanedUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`      Role: ${user.role}`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Created: ${new Date(user.createdAt).toLocaleString()}\n`);
    });

    console.log('🗑️  Deleting orphaned users and all related data...\n');

    let deletedCount = 0;
    let failedCount = 0;

    for (const user of orphanedUsers) {
      try {
        // Delete user and all related data (CASCADE should handle this)
        const result = await dbClient.query('DELETE FROM users WHERE id = $1', [user.id]);
        
        if (result.rowCount > 0) {
          console.log(`   ✅ Deleted ${user.email}`);
          deletedCount++;
        } else {
          console.log(`   ⚠️  User ${user.email} already deleted`);
        }
      } catch (error) {
        console.error(`   ❌ Failed to delete ${user.email}: ${error.message}`);
        failedCount++;
      }
    }

    console.log('\n================================\n');
    console.log(`✅ Cleanup complete!`);
    console.log(`   Deleted: ${deletedCount}`);
    console.log(`   Failed: ${failedCount}`);
    console.log(`   Remaining in DB: ${dbUsers.length - deletedCount}\n`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await dbClient.end();
  }
}

main();
