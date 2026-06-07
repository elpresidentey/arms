/**
 * Fix Auth Sync Issues - Auto Mode
 * 
 * This script automatically fixes auth sync issues without prompting.
 * Use with caution - it will immediately apply fixes.
 * 
 * Usage: node scripts/fix-auth-sync-auto.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !supabaseServiceKey || !databaseUrl) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('   - DATABASE_URL');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAuthSync() {
  const pgClient = new Client({
    connectionString: databaseUrl,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await pgClient.connect();
    console.log('✅ Connected to PostgreSQL');

    // Get all Supabase auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      throw new Error(`Failed to fetch Supabase users: ${authError.message}`);
    }

    console.log(`\n📋 Found ${authUsers.users.length} Supabase auth users\n`);

    const fixes = [];

    for (const authUser of authUsers.users) {
      const email = authUser.email?.toLowerCase();
      if (!email) continue;

      // Check if there's a database user with this email but different ID
      const result = await pgClient.query(
        'SELECT id, email, role FROM users WHERE LOWER(email) = $1',
        [email]
      );

      if (result.rows.length === 0) {
        console.log(`⚠️  ${email}: Has Supabase auth but no database profile`);
        continue;
      }

      const dbUser = result.rows[0];
      
      if (dbUser.id !== authUser.id) {
        console.log(`🔧 MISMATCH FOUND:`);
        console.log(`   Email: ${email}`);
        console.log(`   Auth ID: ${authUser.id}`);
        console.log(`   DB ID: ${dbUser.id}`);
        
        fixes.push({
          email,
          oldId: dbUser.id,
          newId: authUser.id,
          role: dbUser.role,
        });
      } else {
        console.log(`✅ ${email}: IDs match`);
      }
    }

    if (fixes.length === 0) {
      console.log('\n✨ No sync issues found! All accounts are in sync.');
      return;
    }

    console.log(`\n\n🔧 Fixing ${fixes.length} account(s)...\n`);

    await pgClient.query('BEGIN');

    for (const fix of fixes) {
      try {
        // Temporarily disable triggers
        await pgClient.query('SET CONSTRAINTS ALL DEFERRED');
        
        // Update all related tables first, then update users table
        const tablesToUpdate = [
          'bills',
          'bill_payments',
          'wallet',
          'wallet_transactions',
          'wallet_withdrawal_requests',
          'recyclables',
          'reports',
          'collection_requests',
          'service_requests',
          'admin_invites',
        ];
        
        for (const table of tablesToUpdate) {
          try {
            await pgClient.query(
              `UPDATE ${table} SET "userId" = $1 WHERE "userId" = $2`,
              [fix.newId, fix.oldId]
            );
          } catch (err) {
            // Table might not have userId column, that's okay
            console.log(`   Skipped ${table} (no userId column or already updated)`);
          }
        }
        
        // Now update the users table
        await pgClient.query(
          'UPDATE users SET id = $1 WHERE id = $2',
          [fix.newId, fix.oldId]
        );
        
        console.log(`✅ Fixed ${fix.email}`);
        console.log(`   ${fix.oldId} → ${fix.newId}`);
      } catch (error) {
        console.error(`❌ Failed to fix ${fix.email}: ${error.message}`);
        throw error;
      }
    }

    await pgClient.query('COMMIT');
    
    console.log('\n✅ All fixes applied successfully!');
    console.log('\n🎉 Auth sync issues resolved. Users can now log in.');

  } catch (error) {
    await pgClient.query('ROLLBACK').catch(() => {});
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 The transaction was rolled back. No changes were made.');
    process.exit(1);
  } finally {
    await pgClient.end();
  }
}

fixAuthSync();
