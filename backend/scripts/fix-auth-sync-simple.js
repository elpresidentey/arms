/**
 * Fix Auth Sync Issues - Simple Version
 * 
 * This script simply deletes the old user and creates a new one.
 * Historical data will be lost, but the user can log in and start fresh.
 * 
 * Usage: node scripts/fix-auth-sync-simple.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !supabaseServiceKey || !databaseUrl) {
  console.error('❌ Missing required environment variables');
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
    console.log('✅ Connected to PostgreSQL\n');

    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      throw new Error(`Failed to fetch Supabase users: ${authError.message}`);
    }

    console.log(`📋 Found ${authUsers.users.length} Supabase auth users\n`);

    const fixes = [];

    for (const authUser of authUsers.users) {
      const email = authUser.email?.toLowerCase();
      if (!email) continue;

      const result = await pgClient.query(
        'SELECT * FROM users WHERE LOWER(email) = $1',
        [email]
      );

      if (result.rows.length === 0) {
        console.log(`⚠️  ${email}: Has auth but no database profile`);
        continue;
      }

      const dbUser = result.rows[0];
      
      if (dbUser.id !== authUser.id) {
        console.log(`🔧 MISMATCH: ${email}`);
        console.log(`   Auth: ${authUser.id}`);
        console.log(`   DB:   ${dbUser.id}\n`);
        
        fixes.push({
          email,
          oldId: dbUser.id,
          newId: authUser.id,
          userData: dbUser,
        });
      } else {
        console.log(`✅ ${email}: IDs match`);
      }
    }

    if (fixes.length === 0) {
      console.log('\n✨ No sync issues found!');
      return;
    }

    console.log(`\n\n🔧 Fixing ${fixes.length} account(s)...\n`);
    console.log('⚠️  Note: Historical data (bills, payments, reports) will be removed.');
    console.log('   The user profile will be preserved and can log in fresh.\n');

    for (const fix of fixes) {
      await pgClient.query('BEGIN');
      
      try {
        const { email, oldId, newId, userData } = fix;
        
        // Delete old user (cascades to related tables via ON DELETE CASCADE)
        await pgClient.query('DELETE FROM users WHERE id = $1', [oldId]);
        console.log(`   ✓ Removed old user and related data`);
        
        // Create new user with correct auth ID
        const insertQuery = `
          INSERT INTO users (
            id, email, "firstName", "lastName", "phoneNumber", 
            address, ward, "houseNumber", street, latitude, longitude,
            "serviceZone", "propertyType", landmark, "householdSize",
            role, password, "createdAt", "updatedAt"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
          )
        `;
        
        await pgClient.query(insertQuery, [
          newId,
          userData.email,
          userData.firstName,
          userData.lastName,
          userData.phoneNumber,
          userData.address,
          userData.ward,
          userData.houseNumber,
          userData.street,
          userData.latitude,
          userData.longitude,
          userData.serviceZone,
          userData.propertyType,
          userData.landmark,
          userData.householdSize,
          userData.role,
          userData.password,
          userData.createdAt,
          userData.updatedAt,
        ]);
        
        console.log(`   ✓ Created new user record with correct ID`);
        
        await pgClient.query('COMMIT');
        console.log(`✅ Fixed ${email}\n`);
        
      } catch (error) {
        await pgClient.query('ROLLBACK');
        console.error(`❌ Failed to fix ${fix.email}: ${error.message}\n`);
        throw error;
      }
    }
    
    console.log('✅ All fixes applied successfully!');
    console.log('🎉 Users can now log in without sync errors.');
    console.log('\n💡 Note: Users will start with a clean slate.');
    console.log('   Previous bills, payments, and reports have been removed.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pgClient.end();
  }
}

fixAuthSync();
