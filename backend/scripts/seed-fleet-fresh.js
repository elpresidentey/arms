/**
 * Fresh Fleet Data Seeding Script
 * Creates additional drivers, vehicles, and assignments
 * Skips existing records and only adds new ones
 */

require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function seedFleetFresh() {
  try {
    await client.connect();
    console.log('🔌 Connected to database\n');

    // Check current fleet status
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM drivers) as driver_count,
        (SELECT COUNT(*) FROM vehicles) as vehicle_count,
        (SELECT COUNT(*) FROM vehicle_assignments WHERE status = 'active') as active_assignments
    `);
    
    console.log('📊 Current Fleet Status:');
    console.log(`   Drivers: ${stats.rows[0].driver_count}`);
    console.log(`   Vehicles: ${stats.rows[0].vehicle_count}`);
    console.log(`   Active Assignments: ${stats.rows[0].active_assignments}\n`);

    // Additional Vehicles to Add
    const newVehicles = [
      {
        plateNumber: 'LAG-009-TR',
        make: 'Hino',
        model: '500 Series',
        year: 2022,
        vehicleType: 'compactor_truck',
        fuelType: 'diesel',
        capacity: 10,
        capacityUnit: 'tons',
        purchaseDate: '2022-07-15',
        purchasePrice: 64000,
        insuranceExpiry: '2027-07-15',
        registrationExpiry: '2027-07-15',
        currentMileage: 42000,
        currentLocation: 'Main Depot - Bay C',
        notes: 'Efficient for residential routes, good fuel economy'
      },
      {
        plateNumber: 'LAG-010-TR',
        make: 'Fuso',
        model: 'Canter FE85',
        year: 2023,
        vehicleType: 'open_truck',
        fuelType: 'diesel',
        capacity: 6,
        capacityUnit: 'tons',
        purchaseDate: '2023-03-10',
        purchasePrice: 52000,
        insuranceExpiry: '2028-03-10',
        registrationExpiry: '2028-03-10',
        currentMileage: 18000,
        currentLocation: 'Recycling Center',
        notes: 'Dedicated to recyclables collection in residential areas'
      },
      {
        plateNumber: 'LAG-011-TR',
        make: 'Mercedes-Benz',
        model: 'Arocs 3340',
        year: 2021,
        vehicleType: 'tipper_truck',
        fuelType: 'diesel',
        capacity: 18,
        capacityUnit: 'tons',
        purchaseDate: '2021-09-20',
        purchasePrice: 95000,
        insuranceExpiry: '2026-09-20',
        registrationExpiry: '2026-09-20',
        currentMileage: 68000,
        currentLocation: 'Main Depot - Bay D',
        notes: 'Heavy-duty for landfill operations and bulk transport'
      },
      {
        plateNumber: 'LAG-012-TR',
        make: 'Volvo',
        model: 'FE 280',
        year: 2023,
        vehicleType: 'compactor_truck',
        fuelType: 'diesel',
        capacity: 11,
        capacityUnit: 'tons',
        purchaseDate: '2023-05-12',
        purchasePrice: 73000,
        insuranceExpiry: '2028-05-12',
        registrationExpiry: '2028-05-12',
        currentMileage: 22000,
        currentLocation: 'Main Depot - Bay A',
        notes: 'Latest model with advanced safety features'
      },
      {
        plateNumber: 'LAG-013-TR',
        make: 'Isuzu',
        model: 'Giga FVZ',
        year: 2020,
        vehicleType: 'tipper_truck',
        fuelType: 'diesel',
        capacity: 16,
        capacityUnit: 'tons',
        purchaseDate: '2020-11-08',
        purchasePrice: 82000,
        insuranceExpiry: '2025-11-08',
        registrationExpiry: '2025-11-08',
        currentMileage: 95000,
        currentLocation: 'Main Depot - Bay B',
        notes: 'High mileage but well maintained, reliable for bulk waste'
      }
    ];

    console.log('🚛 Adding New Vehicles...\n');
    const createdVehicles = [];

    for (const vehicle of newVehicles) {
      // Check if vehicle already exists
      const existing = await client.query(
        'SELECT id FROM vehicles WHERE plate_number = $1',
        [vehicle.plateNumber]
      );

      if (existing.rows.length > 0) {
        console.log(`⏭️  Skipping ${vehicle.plateNumber} (already exists)`);
        continue;
      }

      // Generate vehicle code
      const codeResult = await client.query(`
        SELECT COALESCE(MAX(CAST(SUBSTRING(vehicle_code FROM 3) AS INTEGER)), 0) + 1 as next_number
        FROM vehicles
      `);
      const vehicleCode = `TR${codeResult.rows[0].next_number.toString().padStart(3, '0')}`;

      const result = await client.query(`
        INSERT INTO vehicles (
          id, vehicle_code, plate_number, make, model, year, vehicle_type, fuel_type,
          capacity, capacity_unit, status, purchase_date, purchase_price,
          insurance_expiry, registration_expiry, current_mileage, current_location,
          fuel_efficiency, notes, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, 'operational', $10, $11,
          $12, $13, $14, $15, 8.5, $16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING id, vehicle_code, plate_number
      `, [
        vehicleCode, vehicle.plateNumber, vehicle.make, vehicle.model, vehicle.year,
        vehicle.vehicleType, vehicle.fuelType, vehicle.capacity, vehicle.capacityUnit,
        vehicle.purchaseDate, vehicle.purchasePrice, vehicle.insuranceExpiry,
        vehicle.registrationExpiry, vehicle.currentMileage, vehicle.currentLocation,
        vehicle.notes
      ]);

      createdVehicles.push(result.rows[0]);
      console.log(`✅ Created ${vehicleCode}: ${vehicle.plateNumber} (${vehicle.make} ${vehicle.model})`);
    }

    // Check for unassigned vehicles
    console.log('\n🔗 Checking Vehicle Assignments...\n');
    
    const unassignedVehicles = await client.query(`
      SELECT v.id, v.vehicle_code, v.plate_number
      FROM vehicles v
      WHERE v.status = 'operational'
      AND v.id NOT IN (
        SELECT vehicle_id FROM vehicle_assignments WHERE status = 'active'
      )
      LIMIT 5
    `);

    const availableDrivers = await client.query(`
      SELECT d.id, d.driver_code, u."firstName", u."lastName"
      FROM drivers d
      JOIN users u ON d.user_id = u.id
      WHERE d.status = 'active'
      AND d.id NOT IN (
        SELECT driver_id FROM vehicle_assignments WHERE status = 'active'
      )
      LIMIT 5
    `);

    console.log(`Found ${unassignedVehicles.rows.length} unassigned vehicles`);
    console.log(`Found ${availableDrivers.rows.length} available drivers\n`);

    // Create assignments
    const assignmentsToCreate = Math.min(unassignedVehicles.rows.length, availableDrivers.rows.length);
    
    for (let i = 0; i < assignmentsToCreate; i++) {
      const vehicle = unassignedVehicles.rows[i];
      const driver = availableDrivers.rows[i];

      await client.query(`
        INSERT INTO vehicle_assignments (
          id, driver_id, vehicle_id, assigned_date, status,
          reason, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, CURRENT_TIMESTAMP, 'active',
          'Route assignment for operational efficiency', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `, [driver.id, vehicle.id]);

      console.log(`✅ Assigned ${vehicle.vehicle_code} to ${driver.driver_code} (${driver.firstName} ${driver.lastName})`);
    }

    // Add some maintenance records for realism
    console.log('\n🔧 Adding Maintenance Records...\n');
    
    const vehiclesForMaintenance = await client.query(`
      SELECT id, vehicle_code, current_mileage
      FROM vehicles
      WHERE id NOT IN (SELECT vehicle_id FROM maintenance_records WHERE status = 'scheduled')
      LIMIT 3
    `);

    for (const vehicle of vehiclesForMaintenance.rows) {
      const maintenanceDate = new Date();
      maintenanceDate.setDate(maintenanceDate.getDate() + Math.floor(Math.random() * 30) + 7); // 7-37 days from now

      await client.query(`
        INSERT INTO maintenance_records (
          id, vehicle_id, maintenance_type, status, priority, title, description,
          scheduled_date, mileage_at_maintenance, estimated_cost, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), $1, 'routine', 'scheduled', 'medium',
          'Scheduled Preventive Maintenance', 
          'Regular maintenance service including oil change, filter replacement, and safety inspection',
          $2, $3, 500, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `, [vehicle.id, maintenanceDate.toISOString(), vehicle.current_mileage]);

      console.log(`✅ Scheduled maintenance for ${vehicle.vehicle_code}`);
    }

    // Final statistics
    const finalStats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM drivers) as driver_count,
        (SELECT COUNT(*) FROM vehicles) as vehicle_count,
        (SELECT COUNT(*) FROM vehicle_assignments WHERE status = 'active') as active_assignments,
        (SELECT COUNT(*) FROM maintenance_records WHERE status = 'scheduled') as scheduled_maintenance
    `);

    console.log('\n✨ Fleet Seeding Complete!\n');
    console.log('📊 Final Fleet Status:');
    console.log(`   Drivers: ${finalStats.rows[0].driver_count}`);
    console.log(`   Vehicles: ${finalStats.rows[0].vehicle_count}`);
    console.log(`   Active Assignments: ${finalStats.rows[0].active_assignments}`);
    console.log(`   Scheduled Maintenance: ${finalStats.rows[0].scheduled_maintenance}\n`);
    
    console.log('🎉 Your fleet is ready! Visit the Fleet Management page to see the data.\n');

  } catch (error) {
    console.error('❌ Error seeding fleet data:', error);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

seedFleetFresh();
