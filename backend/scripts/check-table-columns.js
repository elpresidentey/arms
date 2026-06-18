/**
 * Check actual column names in database tables
 */

require('dotenv').config();
const { Client } = require('pg');

async function checkColumns() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('🔍 Checking table columns...\n');

    // Check users table
    const usersColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    console.log('Users table columns:');
    usersColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    // Check drivers table
    const driversColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'drivers' 
      ORDER BY ordinal_position
    `);
    console.log('\nDrivers table columns:');
    driversColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    // Check vehicles table
    const vehiclesColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vehicles' 
      ORDER BY ordinal_position
    `);
    console.log('\nVehicles table columns:');
    vehiclesColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkColumns();
