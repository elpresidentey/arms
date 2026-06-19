/**
 * Check Fleet Data in Database
 */

require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function checkFleetData() {
  try {
    await client.connect();
    console.log('🔌 Connected to database\n');

    // Check Drivers
    console.log('👥 DRIVERS:');
    const drivers = await client.query(`
      SELECT d.driver_code, d.license_number, d.status, u."firstName", u."lastName"
      FROM drivers d
      JOIN users u ON d.user_id = u.id
      ORDER BY d.driver_code
    `);
    console.log(`   Total: ${drivers.rows.length}`);
    drivers.rows.forEach(d => {
      console.log(`   - ${d.driver_code}: ${d.firstName} ${d.lastName} (${d.status})`);
    });

    // Check Vehicles
    console.log('\n🚛 VEHICLES:');
    const vehicles = await client.query(`
      SELECT vehicle_code, plate_number, make, model, vehicle_type, status
      FROM vehicles
      ORDER BY vehicle_code
    `);
    console.log(`   Total: ${vehicles.rows.length}`);
    vehicles.rows.forEach(v => {
      console.log(`   - ${v.vehicle_code}: ${v.plate_number} - ${v.make} ${v.model} (${v.status})`);
    });

    // Check Assignments
    console.log('\n🔗 ACTIVE ASSIGNMENTS:');
    const assignments = await client.query(`
      SELECT 
        va.id,
        d.driver_code,
        u."firstName",
        u."lastName",
        v.vehicle_code,
        v.plate_number,
        va.assigned_date,
        va.status
      FROM vehicle_assignments va
      JOIN drivers d ON va.driver_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN vehicles v ON va.vehicle_id = v.id
      WHERE va.status = 'active'
      ORDER BY va.assigned_date DESC
    `);
    console.log(`   Total: ${assignments.rows.length}`);
    assignments.rows.forEach(a => {
      console.log(`   - ${a.vehicle_code} ← ${a.driver_code} (${a.firstName} ${a.lastName})`);
    });

    console.log('\n✅ Fleet data check complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkFleetData();
