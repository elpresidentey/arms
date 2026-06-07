/**
 * Fix Auth Sync Issues
 * 
 * This script fixes the "account profile out of sync" error by updating
 * user IDs in the database to match their Supabase auth IDs.
 * 
 * Usage: node scripts/fix-auth-sync.js
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
        console.log(`✅ ${email}: IDs match (${authUser.id})`);
      }
    }

    if (fixes.length === 0) {
      console.log('\n✨ No sync issues found! All accounts are in sync.');
      return;
    }

    console.log(`\n\n🔧 Found ${fixes.length} account(s) that need fixing:\n`);
    fixes.forEach(fix => {
      console.log(`   ${fix.email}`);
      console.log(`   ${fix.oldId} → ${fix.newId}`);
    });

    console.log('\n⚠️  WARNING: This will update user IDs in the database.');
    console.log('   Related records (wallet, recyclables, etc.) will be updated via CASCADE.');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      rl.question('\nProceed with fixes? (yes/no): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Aborted. No changes made.');
      return;
    }

    console.log('\n🔧 Applying fixes...\n');

    await pgClient.query('BEGIN');

    for (const fix of fixes) {
      try {
        // Update user ID (will cascade to related tables)
        await pgClient.query(
          'UPDATE users SET id = $1 WHERE id = $2',
          [fix.newId, fix.oldId]
        );
        
        console.log(`✅ Fixed ${fix.email}`);
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
