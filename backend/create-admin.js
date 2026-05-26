/**
 * Bootstrap Admin Creation Script
 * 
 * This script creates the first admin account for ARMS.
 * It uses the bootstrap endpoint which bypasses normal registration.
 * 
 * Usage: node create-admin.js
 */

require('dotenv').config();
const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const BOOTSTRAP_TOKEN = process.env.BOOTSTRAP_ADMIN_TOKEN;

if (!BOOTSTRAP_TOKEN) {
  console.error('❌ Error: BOOTSTRAP_ADMIN_TOKEN not found in .env file');
  console.error('   Add this line to backend/.env:');
  console.error('   BOOTSTRAP_ADMIN_TOKEN=arms_bootstrap_2026_secure_token_xyz\n');
  process.exit(1);
}

// Admin account details
const adminData = {
  bootstrapToken: BOOTSTRAP_TOKEN,
  email: 'admin@arms.com',
  password: 'Admin@2026',
  firstName: 'System',
  lastName: 'Administrator',
  phoneNumber: '+2348012345678',
  address: 'ARMS Headquarters',
  ward: 'Central',
  houseNumber: '1',
  street: 'Admin Street',
};

async function createBootstrapAdmin() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           ARMS Bootstrap Admin Creation                     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log('📋 Admin Account Details:');
  console.log('   Email:', adminData.email);
  console.log('   Password:', adminData.password);
  console.log('   Name:', `${adminData.firstName} ${adminData.lastName}`);
  console.log('   Phone:', adminData.phoneNumber);
  console.log('');

  try {
    console.log('🔄 Creating admin account...\n');

    const response = await axios.post(
      `${BACKEND_URL}/auth/bootstrap`,
      adminData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Admin account created successfully!\n');
    console.log('='.repeat(60));
    console.log('📊 Account Information:');
    console.log('='.repeat(60));
    console.log('Email:', response.data.user.email);
    console.log('Role:', response.data.user.role);
    console.log('Name:', `${response.data.user.firstName} ${response.data.user.lastName}`);
    console.log('User ID:', response.data.user.id);
    console.log('='.repeat(60));

    console.log('\n✨ Bootstrap complete!\n');
    console.log('💡 Next steps:');
    console.log('   1. Go to http://localhost:3000/admin/login');
    console.log('   2. Sign in with:');
    console.log('      Email: admin@arms.com');
    console.log('      Password: Admin@2026');
    console.log('   3. Create admin invites for other staff members');
    console.log('   4. Change your password after first login\n');

    console.log('🔐 Security Note:');
    console.log('   The bootstrap token can only be used once.');
    console.log('   After this, use admin invites to add more admins.\n');

  } catch (error) {
    console.error('\n❌ Failed to create admin account\n');

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error || 'Unknown error';

      console.error('Status:', status);
      console.error('Error:', message);
      console.error('');

      if (status === 403) {
        if (message.includes('already exists')) {
          console.error('💡 An admin already exists. To create a new admin:');
          console.error('   1. Log in as an existing admin');
          console.error('   2. Go to Admin Invites section');
          console.error('   3. Create an invite for the new admin\n');
        } else if (message.includes('Bootstrap admin token')) {
          console.error('💡 Bootstrap token is invalid or not configured.');
          console.error('   Check BOOTSTRAP_ADMIN_TOKEN in backend/.env\n');
        } else {
          console.error('💡 Bootstrap is only for creating the first admin.');
          console.error('   Use admin invites for additional admins.\n');
        }
      } else if (status === 400) {
        console.error('💡 Check that all required fields are provided.\n');
      } else if (error.code === 'ECONNREFUSED') {
        console.error('💡 Backend server is not running.');
        console.error('   Start it with: cd backend && npm run start:dev\n');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Cannot connect to backend server.');
      console.error('   Make sure the backend is running on', BACKEND_URL);
      console.error('   Start it with: cd backend && npm run start:dev\n');
    } else {
      console.error('Error:', error.message);
      console.error('');
    }

    process.exit(1);
  }
}

// Run the script
createBootstrapAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  });
