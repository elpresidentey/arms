/**
 * Cleanup Script: Remove orphaned Supabase Auth users
 * 
 * This script removes auth users that don't have a corresponding profile in the database.
 * This fixes the "out of sync" issue where auth succeeds but profile is missing.
 * 
 * Usage: node cleanup-orphaned-auth.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function cleanupOrphanedAuth() {
  console.log('🧹 Starting orphaned auth user cleanup...\n');

  try {
    // Get all auth users
    console.log('📋 Fetching all auth users...');
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      throw authError;
    }

    if (!authUsers || authUsers.length === 0) {
      console.log('✅ No auth users found.\n');
      return;
    }

    console.log(`📊 Found ${authUsers.length} auth user(s)\n`);

    // Get all database users
    console.log('📋 Fetching all database users...');
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('id, email, role');

    if (dbError) {
      throw dbError;
    }

    console.log(`📊 Found ${dbUsers?.length || 0} database user(s)\n`);

    // Find orphaned users (in auth but not in database)
    const dbUserIds = new Set((dbUsers || []).map(u => u.id));
    const orphanedUsers = authUsers.filter(u => !dbUserIds.has(u.id));

    if (orphanedUsers.length === 0) {
      console.log('✅ No orphaned users found. All auth users have database profiles!\n');
      console.log('📊 Synced users:');
      authUsers.forEach((user, index) => {
        const dbUser = dbUsers?.find(u => u.id === user.id);
        console.log(`   ${index + 1}. ${user.email} (${dbUser?.role || 'unknown role'})`);
      });
      console.log('');
      return;
    }

    console.log('⚠️  Found orphaned auth users (in Auth but NOT in Database):\n');
    orphanedUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email || 'No email'} (ID: ${user.id})`);
      console.log(`      Created: ${user.created_at}`);
      console.log(`      Last sign in: ${user.last_sign_in_at || 'Never'}`);
      console.log('');
    });

    // Delete orphaned users
    console.log('🗑️  Deleting orphaned auth users...\n');
    let successCount = 0;
    let errorCount = 0;

    for (const user of orphanedUsers) {
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.log(`   ❌ Failed to delete ${user.email || user.id}: ${deleteError.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Deleted ${user.email || user.id}`);
          successCount++;
        }
      } catch (err) {
        console.log(`   ❌ Error deleting ${user.email || user.id}: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Cleanup Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully deleted: ${successCount} orphaned user(s)`);
    if (errorCount > 0) {
      console.log(`❌ Failed to delete: ${errorCount} user(s)`);
    }
    console.log(`📊 Remaining auth users: ${authUsers.length - successCount}`);
    console.log('='.repeat(60));

    if (successCount > 0) {
      console.log('\n✨ Orphaned auth cleanup complete!');
      console.log('\n💡 Next steps:');
      console.log('   1. Clear browser storage: localStorage.clear(); sessionStorage.clear();');
      console.log('   2. Try logging in again or register a new account');
      console.log('   3. The 401 error should be resolved\n');
    }

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

// Run the cleanup
cleanupOrphanedAuth()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
