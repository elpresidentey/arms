const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const adminEmail = 'admin@arms.com';
const adminId = 'f31d5e32-1f72-4d03-95ef-4efe660bdd45';

// Get new password from command line or use default
const newPassword = process.argv[2] || 'Admin123!';

async function resetAdminPassword() {
  try {
    console.log(`🔐 Resetting password for ${adminEmail}...\n`);
    
    // Update password in Supabase Auth
    const { data, error } = await supabase.auth.admin.updateUserById(
      adminId,
      { password: newPassword }
    );
    
    if (error) {
      console.error('❌ Failed to update password:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Password updated successfully!\n');
    console.log('📝 Login credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${newPassword}`);
    console.log('\n🌐 Login at:');
    console.log('   Local: http://localhost:3000/login');
    console.log('   Production: https://arms-roan.vercel.app/login');
    console.log('\n⚠️  IMPORTANT: Change this password after logging in!\n');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

console.log('╔════════════════════════════════════════════════════╗');
console.log('║         ARMS Admin Password Reset Tool            ║');
console.log('╚════════════════════════════════════════════════════╝\n');

if (process.argv[2]) {
  console.log(`Using custom password: ${newPassword}\n`);
} else {
  console.log(`Using default password: ${newPassword}`);
  console.log('(Pass custom password as argument: node reset-admin-password.js YourPassword123)\n');
}

resetAdminPassword();
