/**
 * Script to seed fleet data via API endpoints (no direct database access needed)
 * Run with: node scripts/seed-fleet-via-api.js
 * 
 * Prerequisites:
 * - Backend server must be running
 * - You must have an admin account to get authentication token
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@arms.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

let authToken = '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

async function login() {
  console.log('🔐 Logging in as admin...');
  try {
    const response = await api.post('/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    authToken = response.data.accessToken;
    console.log('✅ Login successful!\n');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    console.error('Make sure the backend is running and admin credentials are correct.');
    return false;
  }
}

async function createUser(userData) {
  try {
    const response = await api.post('/auth/register', {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: '+2348000000000',
      address: 'Test Address',
      street: 'Test Street',
      ward: 'Ward 1',
      houseNumber: '1',
      role: userData.role,
    });
    console.log(`✅ Created user: ${userData.firstName} ${userData.lastName} (${userData.email})`);
    return response.data.user;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log(`⚠️  User already exists: ${userData.email}`);
      // Try to get user by email via login
      const loginResponse = await api.post('/auth/login', {
        email: userData.email,
        password: userData.password,
      });
      return loginResponse.data.user;
    } else {
      console.error(`❌ Failed to create user ${userData.email}:`, error.response?.data?.message || error.message);
      return null;
    }
  }
}

async function createDriver(driverData) {
  try {
    const response = await api.post('/drivers', driverData);
    console.log(`✅ Created driver: ${response.data.driverCode} - ${driverData.licenseNumber}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to create driver:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function createVehicle(vehicleData) {
  try {
    const response = await api.post('/vehicles', vehicleData);
    console.log(`✅ Created vehicle: ${response.data.vehicleCode} - ${vehicleData.plateNumber}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to create vehicle:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function assignVehicle(driverId, vehicleId) {
  try {
    await api.post(`/drivers/${driverId}/assign-vehicle`, {
      vehicleId: vehicleId,
      reason: 'Initial fleet setup',
    });
    console.log(`✅ Assigned vehicle to driver`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to assign vehicle:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function seedFleetData() {
  console.log('🚀 Starting fleet data seeding via API...\n');

  // Login first
  const loggedIn = await login();
  if (!loggedIn) {
    console.error('\n❌ Cannot proceed without authentication');
    process.exit(1);
  }

  // Sample users
  const sampleUsers = [
    { firstName: 'John', lastName: 'Driver', email: 'john.driver@arms.com', role: 'supervisor', password: 'Driver@123' },
    { firstName: 'Sarah', lastName: 'Wheeler', email: 'sarah.wheeler@arms.com', role: 'supervisor', password: 'Wheeler@123' },
    { firstName: 'Mike', lastName: 'Collins', email: 'mike.collins@arms.com', role: 'dispatcher', password: 'Collins@123' },
    { firstName: 'Emma', lastName: 'Rodriguez', email: 'emma.rodriguez@arms.com', role: 'dispatcher', password: 'Rodriguez@123' },
    { firstName: 'David', lastName: 'Chen', email: 'david.chen@arms.com', role: 'dispatcher', password: 'Chen@123' },
  ];

  console.log('👥 Creating users...');
  const users = [];
  for (const userData of sampleUsers) {
    const user = await createUser(userData);
    if (user) users.push(user);
  }
  console.log(`\n📊 Created/Found ${users.length} users\n`);

  if (users.length === 0) {
    console.error('❌ No users available to create drivers');
    process.exit(1);
  }

  // Sample drivers
  const driverTemplates = [
    {
      licenseNumber: 'DL-A1234567',
      licenseClass: 'CLASS_A',
      licenseExpiryDate: '2027-12-31',
      emergencyContact: 'Jane Driver',
      emergencyPhone: '+2348012345678',
      hireDate: '2023-01-15',
      specializations: ['Compactor Trucks', 'Long Distance'],
      notes: 'Experienced driver with 10+ years in waste management'
    },
    {
      licenseNumber: 'DL-B2345678',
      licenseClass: 'CLASS_B',
      licenseExpiryDate: '2028-06-30',
      emergencyContact: 'Robert Wheeler',
      emergencyPhone: '+2348123456789',
      hireDate: '2023-03-20',
      specializations: ['Tipper Trucks', 'Urban Routes'],
      notes: 'Excellent safety record, knows all city routes'
    },
    {
      licenseNumber: 'DL-C3456789',
      licenseClass: 'CDL',
      licenseExpiryDate: '2027-09-15',
      emergencyContact: 'Lisa Collins',
      emergencyPhone: '+2348234567890',
      hireDate: '2023-05-10',
      specializations: ['Recycling Trucks', 'Hazardous Materials'],
      notes: 'Certified for hazardous waste handling'
    },
    {
      licenseNumber: 'DL-D4567890',
      licenseClass: 'CLASS_B',
      licenseExpiryDate: '2028-03-20',
      emergencyContact: 'Carlos Rodriguez',
      emergencyPhone: '+2348345678901',
      hireDate: '2023-07-01',
      specializations: ['Compactor Trucks', 'Night Shifts'],
      notes: 'Prefers night shifts, very reliable'
    },
    {
      licenseNumber: 'DL-E5678901',
      licenseClass: 'CLASS_A',
      licenseExpiryDate: '2027-11-30',
      emergencyContact: 'Wei Chen',
      emergencyPhone: '+2348456789012',
      hireDate: '2023-09-15',
      specializations: ['Roll-off Trucks', 'Construction Sites'],
      notes: 'Specializes in construction waste collection'
    },
  ];

  console.log('🚗 Creating drivers...');
  const drivers = [];
  for (let i = 0; i < Math.min(driverTemplates.length, users.length); i++) {
    const driverData = {
      ...driverTemplates[i],
      userId: users[i].id,
    };
    const driver = await createDriver(driverData);
    if (driver) drivers.push(driver);
  }
  console.log(`\n📊 Created ${drivers.length} drivers\n`);

  // Sample vehicles
  const vehicleTemplates = [
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
      vehicleType: 'recycling_truck',
      fuelType: 'diesel',
      capacity: 8,
      capacityUnit: 'tons',
      purchaseDate: '2020-09-15',
      purchasePrice: 72000,
      insuranceExpiry: '2026-09-15',
      registrationExpiry: '2026-09-15',
      currentMileage: 78000,
      currentLocation: 'Recycling Center',
      notes: 'Dedicated recycling collection vehicle'
    },
    {
      plateNumber: 'LAG-005-TR',
      make: 'Scania',
      model: 'P 320',
      year: 2022,
      vehicleType: 'roll_off',
      fuelType: 'diesel',
      capacity: 20,
      capacityUnit: 'cubic_meters',
      purchaseDate: '2022-11-05',
      purchasePrice: 92000,
      insuranceExpiry: '2027-11-05',
      registrationExpiry: '2027-11-05',
      currentMileage: 35000,
      currentLocation: 'Main Depot - Bay D',
      notes: 'Roll-off truck for large containers and construction sites'
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
  ];

  console.log('🚛 Creating vehicles...');
  const vehicles = [];
  for (const vehicleData of vehicleTemplates) {
    const vehicle = await createVehicle(vehicleData);
    if (vehicle) vehicles.push(vehicle);
  }
  console.log(`\n📊 Created ${vehicles.length} vehicles\n`);

  // Assign vehicles to drivers
  console.log('🔗 Creating vehicle assignments...');
  let assignmentCount = 0;
  for (let i = 0; i < Math.min(drivers.length, vehicles.length); i++) {
    const success = await assignVehicle(drivers[i].id, vehicles[i].id);
    if (success) assignmentCount++;
  }
  console.log(`\n📊 Created ${assignmentCount} assignments\n`);

  console.log('✨ Fleet data seeding completed!\n');
  console.log('📊 Summary:');
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Drivers: ${drivers.length}`);
  console.log(`   - Vehicles: ${vehicles.length}`);
  console.log(`   - Assignments: ${assignmentCount}`);
  console.log('\n🎉 You can now view the fleet in the Fleet Management page!');
}

// Run the seeder
seedFleetData().catch((error) => {
  console.error('\n❌ Seeding failed:', error.message);
  process.exit(1);
});
