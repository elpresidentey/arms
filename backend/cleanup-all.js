/**
 * Complete Cleanup Script: Database + Supabase Auth
 * 
 * This script performs a complete cleanup:
 * 1. Removes all data from the SQLite database
 * 2. Removes all Supabase authentication users
 * 
 * Usage: node cleanup-all.js
 */

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { createClient } = require('@supabase/supabase-js');

const DB_PATH = './arms-dev.sqlite';
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment
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

// Database cleanup
async function cleanupDatabase() {
  return new Promise((resolve, reject) => {
    console.log('🗄️  Starting database cleanup...\n');
    
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
    });

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

    let completed = 0;
    let errors = [];

    tables.forEach((table) => {
      db.run(`DELETE FROM ${table}`, (err) => {
        if (err) {
          console.log(`   ❌ Failed to clear ${table}: ${err.message}`);
          errors.push({ table, error: err.message });
        } else {
          console.log(`   ✅ Cleared ${table}`);
        }
        
        completed++;
        
        if (completed === tables.length) {
          db.close((closeErr) => {
            if (closeErr) {
              reject(closeErr);
            } else if (errors.length > 0) {
              reject(new Error(`Failed to clear ${errors.length} table(s)`));
            } else {
              resolve();
            }
          });
        }
      });
    });
  });
}

// Supabase Auth cleanup
async function cleanupSupabaseAuth() {
  console.log('\n🔐 Starting Supabase Auth cleanup...\n');

  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    throw listError;
  }

  if (!users || users.length === 0) {
    console.log('   ℹ️  No auth users found (already clean)\n');
    return { deleted: 0, failed: 0 };
  }

  console.log(`   📊 Found ${users.length} auth user(s) to delete\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        console.log(`   ❌ Failed to delete ${user.email || user.id}`);
        errorCount++;
      } else {
        console.log(`   ✅ Deleted ${user.email || user.id}`);
        successCount++;
      }
    } catch (err) {
      console.log(`   ❌ Error deleting ${user.email || user.id}`);
      errorCount++;
    }
  }

  return { deleted: successCount, failed: errorCount };
}

// Main cleanup function
async function performCompleteCleanup() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         ARMS COMPLETE CLEANUP - Database + Auth             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Clean database
    await cleanupDatabase();
    
    // Step 2: Clean Supabase auth
    const authResult = await cleanupSupabaseAuth();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Complete Cleanup Summary:');
    console.log('='.repeat(60));
    console.log('✅ Database: All tables cleared');
    console.log(`✅ Supabase Auth: ${authResult.deleted} user(s) deleted`);
    if (authResult.failed > 0) {
      console.log(`⚠️  Auth failures: ${authResult.failed} user(s)`);
    }
    console.log('='.repeat(60));

    console.log('\n✨ Complete cleanup finished!\n');
    console.log('💡 Next steps:');
    console.log('   1. Clear browser localStorage (or use incognito mode)');
    console.log('   2. Go to http://localhost:3000/register');
    console.log('   3. Register a new account');
    console.log('   4. Test the onboarding flow');
    console.log('   5. Enjoy your clean ARMS system! 🚀\n');

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    console.error('\nPlease check the error above and try again.\n');
    process.exit(1);
  }
}

// Run the complete cleanup
performCompleteCleanup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
