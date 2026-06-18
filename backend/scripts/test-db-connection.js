/**
 * Quick database connection test
 */

require('dotenv').config();
const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔌 Testing database connection...');
    console.log('Database URL:', process.env.DATABASE_URL ? '✓ Found' : '✗ Not found');
    
    await client.connect();
    console.log('✅ Database connection successful!');
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, current_database() as database_name');
    console.log('📅 Current time:', result.rows[0].current_time);
    console.log('🗄️  Database name:', result.rows[0].database_name);
    
    // Check if required tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'drivers', 'vehicles', 'vehicle_assignments')
      ORDER BY table_name
    `);
    
    console.log('\n📋 Required tables:');
    const requiredTables = ['users', 'drivers', 'vehicles', 'vehicle_assignments'];
    requiredTables.forEach(tableName => {
      const exists = tables.rows.some(row => row.table_name === tableName);
      console.log(`   ${exists ? '✓' : '✗'} ${tableName}`);
    });
    
    if (tables.rows.length === requiredTables.length) {
      console.log('\n✨ All required tables exist! Ready to seed data.');
      return true;
    } else {
      console.log('\n⚠️  Some tables are missing. Run migrations first:');
      console.log('   npm run apply:sql sql/2026-06-13-fleet-management-system.sql');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if PostgreSQL is running');
    console.error('2. Verify DATABASE_URL in .env file');
    console.error('3. Ensure database exists and is accessible');
    return false;
  } finally {
    await client.end();
  }
}

testConnection();
