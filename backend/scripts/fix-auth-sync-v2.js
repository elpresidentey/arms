/**
 * Fix Auth Sync Issues - Version 2
 * 
 * This script fixes auth sync by creating a new user with the correct ID
 * and migrating all data, then deleting the old user.
 * 
 * Usage: node scripts/fix-auth-sync-v2.js
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

    // Get all Supabase auth users
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

    for (const fix of fixes) {
      await pgClient.query('BEGIN');
      
      try {
        const { email, oldId, newId, userData } = fix;
        
        // Step 1: Temporarily store data that needs migration
        console.log(`   📦 Preparing data migration...`);
        
        // Get all related data that will be lost on delete
        const relatedData = {};
        const tables = [
          { name: 'bills', userColumn: 'userId' },
          { name: 'bill_payments', userColumn: 'userId' },
          { name: 'wallet_transactions', userColumn: 'userId' },
          { name: 'recyclables', userColumn: 'userId' },
          { name: 'reports', userColumn: 'reporterId' },
          { name: 'collection_requests', userColumn: 'residentId' },
          { name: 'service_requests', userColumn: 'residentId' },
        ];
        
        for (const table of tables) {
          // Check if table exists first
          const tableCheck = await pgClient.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_name = $1
            )
          `, [table.name]);
          
          if (!tableCheck.rows[0].exists) {
            console.log(`   ⏭️  Skipped ${table.name} (table does not exist)`);
            continue;
          }
          
          const result = await pgClient.query(
            `SELECT * FROM ${table.name} WHERE "${table.userColumn}" = $1`,
            [oldId]
          );
          
          if (result.rows.length > 0) {
            relatedData[table.name] = {
              rows: result.rows,
              userColumn: table.userColumn
            };
            console.log(`   📋 Found ${result.rows.length} records in ${table.name}`);
          }
        }
        
        // Step 2: Delete old user (cascades to related tables)
        await pgClient.query('DELETE FROM users WHERE id = $1', [oldId]);
        console.log(`   ✓ Removed old user record`);
        
        // Step 3: Create new user with correct auth ID
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
        
        // Step 4: Restore related data with new user ID
        for (const [tableName, tableData] of Object.entries(relatedData)) {
          const rows = tableData.rows;
          const userColumn = tableData.userColumn;
          
          if (rows.length === 0) continue;
          
          for (const row of rows) {
            // Update user ID column to new ID
            row[userColumn] = newId;
            
            // Remove the primary key ID to let the database generate a new one
            delete row.id;
            
            // Build insert query dynamically
            const columns = Object.keys(row);
            const values = Object.values(row);
            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
            
            await pgClient.query(
              `INSERT INTO ${tableName} (${columns.map(c => `"${c}"`).join(', ')}) 
               VALUES (${placeholders})`,
              values
            );
          }
          
          console.log(`   ✓ Restored ${rows.length} records to ${tableName}`);
        }
        
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

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pgClient.end();
  }
}

fixAuthSync();
