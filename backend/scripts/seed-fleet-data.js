/**
 * Script to seed the database with mock fleet data (drivers and vehicles)
 * Run with: node scripts/seed-fleet-data.js
 */

require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function seedFleetData() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Get existing users that are not already drivers
    const usersResult = await client.query(`
      SELECT u.id, u."firstName", u."lastName", u.email
      FROM users u
      WHERE u.role IN ('admin', 'supervisor', 'dispatcher')
      AND u.id NOT IN (SELECT user_id FROM drivers)
      LIMIT 10
    `);

    if (usersResult.rows.length === 0) {
      console.log('No eligible users found. Creating sample users first...');
      
      // Create sample users for drivers
      const sampleUsers = [
        { firstName: 'John', lastName: 'Driver', email: 'john.driver@arms.com', role: 'supervisor' },
        { firstName: 'Sarah', lastName: 'Wheeler', email: 'sarah.wheeler@arms.com', role: 'supervisor' },
        { firstName: 'Mike', lastName: 'Collins', email: 'mike.collins@arms.com', role: 'dispatcher' },
        { firstName: 'Emma', lastName: 'Rodriguez', email: 'emma.rodriguez@arms.com', role: 'dispatcher' },
        { firstName: 'David', lastName: 'Chen', email: 'david.chen@arms.com', role: 'dispatcher' },
      ];

      for (const user of sampleUsers) {
        const result = await client.query(`
          INSERT INTO users (
            id, email, password, "firstName", "lastName", "phoneNumber", address, street, "houseNumber", role, 
            "isActive", ward, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), $1, '$2b$10$dummy.hash.for.testing', $2, $3, $4, 'Test Address', 'Test Street', '1', $5,
            true, 'Ward 1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
          RETURNING id
        `, [user.email, user.firstName, user.lastName, '+2348000000000', user.role]);
        
        console.log(`Created user: ${user.firstName} ${user.lastName}`);
        usersResult.rows.push({
          id: result.rows[0].id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        });
      }
    }

    console.log(`\nFound ${usersResult.rows.length} users for driver creation`);

    // Sample driver data
    const drivers = [
      {
        licenseNumber: 'DL-A1234567',
        licenseClass: 'class_a',
        licenseExpiryDate: '2027-12-31',
        emergencyContact: 'Jane Driver',
        emergencyPhone: '+2348012345678',
        hireDate: '2023-01-15',
        specializations: ['Compactor Trucks', 'Long Distance'],
        notes: 'Experienced driver with 10+ years in waste management'
      },
      {
        licenseNumber: 'DL-B2345678',
        licenseClass: 'class_b',
        licenseExpiryDate: '2028-06-30',
        emergencyContact: 'Robert Wheeler',
        emergencyPhone: '+2348123456789',
        hireDate: '2023-03-20',
        specializations: ['Tipper Trucks', 'Urban Routes'],
        notes: 'Excellent safety record, knows all city routes'
      },
      {
        licenseNumber: 'DL-C3456789',
        licenseClass: 'class_a',
        licenseExpiryDate: '2027-09-15',
        emergencyContact: 'Lisa Collins',
        emergencyPhone: '+2348234567890',
        hireDate: '2023-05-10',
        specializations: ['Recycling Trucks', 'Hazardous Materials'],
        notes: 'Certified for hazardous waste handling'
      },
      {
        licenseNumber: 'DL-D4567890',
        licenseClass: 'class_b',
        licenseExpiryDate: '2028-03-20',
        emergencyContact: 'Carlos Rodriguez',
        emergencyPhone: '+2348345678901',
        hireDate: '2023-07-01',
        specializations: ['Compactor Trucks', 'Night Shifts'],
        notes: 'Prefers night shifts, very reliable'
      },
      {
        licenseNumber: 'DL-E5678901',
        licenseClass: 'class_a',
        licenseExpiryDate: '2027-11-30',
        emergencyContact: 'Wei Chen',
        emergencyPhone: '+2348456789012',
        hireDate: '2023-09-15',
        specializations: ['Roll-off Trucks', 'Construction Sites'],
        notes: 'Specializes in construction waste collection'
      },
    ];

    console.log('\n🚗 Creating drivers...');
    const createdDrivers = [];

    for (let i = 0; i < Math.min(drivers.length, usersResult.rows.length); i++) {
      const user = usersResult.rows[i];
      const driver = drivers[i];

      // Generate driver code
      const driverCodeResult = await client.query(`
        SELECT COALESCE(MAX(CAST(SUBSTRING(driver_code FROM 3) AS INTEGER)), 0) + 1 as next_number
        FROM drivers
      `);
      const nextNumber = driverCodeResult.rows[0].next_number;
      const driverCode = `DR${nextNumber.toString().padStart(3, '0')}`;

      const result = await client.query(`
        INSERT INTO drivers (
          id, user_id, driver_code, license_number, license_class, license_expiry_date,
          emergency_contact, emergency_phone, hire_date, status, performance_rating,
          specializations, notes, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, 'active', 4.5, $9, $10,
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING id, driver_code
      `, [
        user.id,
        driverCode,
        driver.licenseNumber,
        driver.licenseClass,
        driver.licenseExpiryDate,
        driver.emergencyContact,
        driver.emergencyPhone,
        driver.hireDate,
        JSON.stringify(driver.specializations),
        driver.notes
      ]);

      createdDrivers.push(result.rows[0]);
      console.log(`✅ Created driver ${driverCode}: ${user.firstName} ${user.lastName}`);
    }

    // Sample vehicle data
    const vehicles = [
      {
        plateNumber: 'LAG-001-TR',
        make: 'Mercedes-Benz',
        model: 'Econic 2630',
        year: 2022,
        vehicleType: 'compactor_truck',
        fuelType: 'diesel',
        capacity: 12,
        capacityUnit: 'tons',
        purchaseDate: '2022-01-15',
        purchasePrice: 85000,
        insuranceExpiry: '2027-01-15',
        registrationExpiry: '2027-01-15',
        currentMileage: 45000,
        currentLocation: 'Main Depot - Bay A',
        notes: 'Primary collection vehicle for Ward 1-5'
      },
      {
        plateNumber: 'LAG-002-TR',
        make: 'Volvo',
        model: 'FM 440',
        year: 2021,
        vehicleType: 'tipper_truck',
        fuelType: 'diesel',
        capacity: 15,
        capacityUnit: 'tons',
        purchaseDate: '2021-06-20',
        purchasePrice: 78000,
        insuranceExpiry: '2026-06-20',
        registrationExpiry: '2026-06-20',
        currentMileage: 62000,
        currentLocation: 'Main Depot - Bay B',
        notes: 'Heavy-duty tipper for landfill transport'
      },
      {
        plateNumber: 'LAG-003-TR',
        make: 'Isuzu',
        model: 'FVR 34',
        year: 2023,
        vehicleType: 'compactor_truck',
        fuelType: 'diesel',
        capacity: 10,
        capacityUnit: 'tons',
        purchaseDate: '2023-02-10',
        purchasePrice: 65000,
        insuranceExpiry: '2028-02-10',
        registrationExpiry: '2028-02-10',
        currentMileage: 28000,
        currentLocation: 'Main Depot - Bay C',
        notes: 'Newest addition to fleet, excellent fuel efficiency'
      },
      {
        plateNumber: 'LAG-004-TR',
        make: 'MAN',
        model: 'TGM 18.290',
        year: 2020,
        vehicleType: 'open_truck',
        fuelType: 'diesel',
        capacity: 8,
        capacityUnit: 'tons',
        purchaseDate: '2020-09-15',
        purchasePrice: 72000,
        insuranceExpiry: '2026-09-15',
        registrationExpiry: '2026-09-15',
        currentMileage: 78000,
        currentLocation: 'Recycling Center',
        notes: 'Dedicated recycling and bulk waste collection vehicle'
      },
      {
        plateNumber: 'LAG-005-TR',
        make: 'Scania',
        model: 'P 320',
        year: 2022,
        vehicleType: 'tipper_truck',
        fuelType: 'diesel',
        capacity: 20,
        capacityUnit: 'm³',
        purchaseDate: '2022-11-05',
        purchasePrice: 92000,
        insuranceExpiry: '2027-11-05',
        registrationExpiry: '2027-11-05',
        currentMileage: 35000,
        currentLocation: 'Main Depot - Bay D',
        notes: 'Large tipper for construction waste and bulk materials'
      },
      {
        plateNumber: 'LAG-006-TR',
        make: 'Mercedes-Benz',
        model: 'Atego 1218',
        year: 2021,
        vehicleType: 'compactor_truck',
        fuelType: 'diesel',
        capacity: 9,
        capacityUnit: 'tons',
        purchaseDate: '2021-04-12',
        purchasePrice: 68000,
        insuranceExpiry: '2026-04-12',
        registrationExpiry: '2026-04-12',
        currentMileage: 55000,
        currentLocation: 'Main Depot - Bay A',
        notes: 'Backup vehicle for high-demand routes'
      },
      {
        plateNumber: 'LAG-007-TR',
        make: 'DAF',
        model: 'LF 180',
        year: 2023,
        vehicleType: 'tipper_truck',
        fuelType: 'diesel',
        capacity: 12,
        capacityUnit: 'tons',
        purchaseDate: '2023-08-20',
        purchasePrice: 71000,
        insuranceExpiry: '2028-08-20',
        registrationExpiry: '2028-08-20',
        currentMileage: 15000,
        currentLocation: 'Main Depot - Bay B',
        notes: 'Recently acquired, undergoing driver familiarization'
      },
      {
        plateNumber: 'LAG-008-TR',
        make: 'Iveco',
        model: 'Eurocargo 150E28',
        year: 2020,
        vehicleType: 'compactor_truck',
        fuelType: 'diesel',
        capacity: 11,
        capacityUnit: 'tons',
        purchaseDate: '2020-03-18',
        purchasePrice: 66000,
        insuranceExpiry: '2025-03-18',
        registrationExpiry: '2025-03-18',
        currentMileage: 82000,
        currentLocation: 'Service Center',
        status: 'maintenance',
        notes: 'Scheduled for regular maintenance service'
      },
    ];

    console.log('\n🚛 Creating vehicles...');
    const createdVehicles = [];

    for (const vehicle of vehicles) {
      // Generate vehicle code
      const vehicleCodeResult = await client.query(`
        SELECT COALESCE(MAX(CAST(SUBSTRING(vehicle_code FROM 3) AS INTEGER)), 0) + 1 as next_number
        FROM vehicles
      `);
      const nextNumber = vehicleCodeResult.rows[0].next_number;
      const vehicleCode = `TR${nextNumber.toString().padStart(3, '0')}`;

      const result = await client.query(`
        INSERT INTO vehicles (
          id, vehicle_code, plate_number, make, model, year, vehicle_type, fuel_type,
          capacity, capacity_unit, status, purchase_date, purchase_price,
          insurance_expiry, registration_expiry, current_mileage, current_location,
          fuel_efficiency, notes, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, 8.5, $17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING id, vehicle_code, plate_number
      `, [
        vehicleCode,
        vehicle.plateNumber,
        vehicle.make,
        vehicle.model,
        vehicle.year,
        vehicle.vehicleType,
        vehicle.fuelType,
        vehicle.capacity,
        vehicle.capacityUnit,
        vehicle.status || 'operational',
        vehicle.purchaseDate,
        vehicle.purchasePrice,
        vehicle.insuranceExpiry,
        vehicle.registrationExpiry,
        vehicle.currentMileage,
        vehicle.currentLocation,
        vehicle.notes
      ]);

      createdVehicles.push(result.rows[0]);
      console.log(`✅ Created vehicle ${vehicleCode}: ${vehicle.plateNumber} (${vehicle.make} ${vehicle.model})`);
    }

    // Create some vehicle assignments
    console.log('\n🔗 Creating vehicle assignments...');
    
    for (let i = 0; i < Math.min(createdDrivers.length, createdVehicles.length - 1); i++) {
      const driver = createdDrivers[i];
      const vehicle = createdVehicles[i];

      await client.query(`
        INSERT INTO vehicle_assignments (
          id, driver_id, vehicle_id, assigned_date, status,
          reason, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, CURRENT_TIMESTAMP, 'active',
          'Daily route assignment', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `, [driver.id, vehicle.id]);

      console.log(`✅ Assigned ${vehicle.vehicle_code} to ${driver.driver_code}`);
    }

    console.log('\n✨ Fleet data seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Drivers created: ${createdDrivers.length}`);
    console.log(`   - Vehicles created: ${createdVehicles.length}`);
    console.log(`   - Assignments created: ${Math.min(createdDrivers.length, createdVehicles.length - 1)}`);
    console.log(`\n🎉 You can now view the fleet in the Fleet Management page!`);

  } catch (error) {
    console.error('Error seeding fleet data:', error);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

seedFleetData();
