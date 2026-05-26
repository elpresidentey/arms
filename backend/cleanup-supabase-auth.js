/**
 * Cleanup Script: Remove all Supabase Auth users
 * 
 * This script removes all authentication users from Supabase.
 * Run this when you need to start fresh with a clean auth state.
 * 
 * Usage: node cleanup-supabase-auth.js
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

async function cleanupSupabaseAuth() {
  console.log('🧹 Starting Supabase Auth cleanup...\n');

  try {
    // List all users
    console.log('📋 Fetching all auth users...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      throw listError;
    }

    if (!users || users.length === 0) {
      console.log('✅ No auth users found. Supabase Auth is already clean!\n');
      return;
    }

    console.log(`📊 Found ${users.length} auth user(s) to delete:\n`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email || 'No email'} (ID: ${user.id})`);
    });
    console.log('');

    // Delete each user
    console.log('🗑️  Deleting auth users...\n');
    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
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
    console.log(`✅ Successfully deleted: ${successCount} user(s)`);
    if (errorCount > 0) {
      console.log(`❌ Failed to delete: ${errorCount} user(s)`);
    }
    console.log('='.repeat(60));

    if (successCount > 0) {
      console.log('\n✨ Supabase Auth cleanup complete!');
      console.log('\n💡 Next steps:');
      console.log('   1. Clear browser localStorage (or use incognito mode)');
      console.log('   2. Register a new account at http://localhost:3000/register');
      console.log('   3. Test the onboarding flow\n');
    }

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

// Run the cleanup
cleanupSupabaseAuth()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
