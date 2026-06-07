/**
 * Check Database State
 * 
 * This script shows current database state for all users
 * 
 * Usage: node scripts/check-database-state.js
 */

require('dotenv').config();
const { Client } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Missing DATABASE_URL environment variable');
  process.exit(1);
}

async function checkDatabaseState() {
  const pgClient = new Client({
    connectionString: databaseUrl,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await pgClient.connect();
    console.log('✅ Connected to PostgreSQL\n');
    console.log('=' .repeat(80));
    console.log('DATABASE STATE REPORT');
    console.log('=' .repeat(80));

    // Get all users
    const usersResult = await pgClient.query('SELECT id, email, "firstName", "lastName", role, "createdAt" FROM users ORDER BY email');
    console.log(`\n📊 USERS (${usersResult.rows.length} total):\n`);
    
    for (const user of usersResult.rows) {
      console.log(`${user.email} (${user.role})`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.firstName} ${user.lastName}`);
      console.log(`  Created: ${user.createdAt}`);
      
      // Count related records for this user
      const tables = [
        { name: 'bills', column: 'userId' },
        { name: 'bill_payments', column: 'userId' },
        { name: 'wallet_transactions', column: 'userId' },
        { name: 'recyclables', column: 'userId' },
        { name: 'reports', column: 'reporterId' },
        { name: 'collection_requests', column: 'residentId' },
        { name: 'service_requests', column: 'residentId' },
      ];
      
      const counts = {};
      for (const table of tables) {
        try {
          const tableExists = await pgClient.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_name = $1
            )
          `, [table.name]);
          
          if (tableExists.rows[0].exists) {
            const result = await pgClient.query(
              `SELECT COUNT(*) as count FROM ${table.name} WHERE "${table.column}" = $1`,
              [user.id]
            );
            counts[table.name] = parseInt(result.rows[0].count);
          }
        } catch (err) {
          // Table doesn't exist or column not found
          counts[table.name] = 0;
        }
      }
      
      console.log(`  Data:`);
      console.log(`    - Bills: ${counts.bills || 0}`);
      console.log(`    - Bill Payments: ${counts.bill_payments || 0}`);
      console.log(`    - Wallet Transactions: ${counts.wallet_transactions || 0}`);
      console.log(`    - Recyclables: ${counts.recyclables || 0}`);
      console.log(`    - Reports: ${counts.reports || 0}`);
      console.log(`    - Collection Requests: ${counts.collection_requests || 0}`);
      console.log(`    - Service Requests: ${counts.service_requests || 0}`);
      console.log('');
    }

    // Overall statistics
    console.log('=' .repeat(80));
    console.log('OVERALL STATISTICS');
    console.log('=' .repeat(80));
    console.log('');

    const stats = {};
    const allTables = [
      'users',
      'bills',
      'bill_payments',
      'wallet_transactions',
      'recyclables',
      'reports',
      'collection_requests',
      'service_requests',
      'admin_invites',
    ];

    for (const table of allTables) {
      try {
        const tableExists = await pgClient.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = $1
          )
        `, [table]);
        
        if (tableExists.rows[0].exists) {
          const result = await pgClient.query(`SELECT COUNT(*) as count FROM ${table}`);
          stats[table] = parseInt(result.rows[0].count);
        } else {
          stats[table] = 0;
        }
      } catch (err) {
        stats[table] = 0;
      }
    }

    console.log(`Total Users: ${stats.users}`);
    console.log(`Total Bills: ${stats.bills}`);
    console.log(`Total Bill Payments: ${stats.bill_payments}`);
    console.log(`Total Wallet Transactions: ${stats.wallet_transactions}`);
    console.log(`Total Recyclables: ${stats.recyclables}`);
    console.log(`Total Reports: ${stats.reports}`);
    console.log(`Total Collection Requests: ${stats.collection_requests}`);
    console.log(`Total Service Requests: ${stats.service_requests}`);
    console.log(`Total Admin Invites: ${stats.admin_invites}`);
    
    console.log('\n' + '=' .repeat(80));
    console.log('✅ Database state check complete!');
    console.log('=' .repeat(80));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pgClient.end();
  }
}

checkDatabaseState();
