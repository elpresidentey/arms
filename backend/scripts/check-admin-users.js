const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function checkAdminUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking for admin users in database...\n');
    
    // Check users table
    const result = await client.query(`
      SELECT id, email, role, "firstName", "lastName", "createdAt"
      FROM users 
      WHERE role IN ('admin', 'supervisor', 'dispatcher')
      ORDER BY "createdAt" DESC
    `);
    
    console.log(`Found ${result.rows.length} admin/staff users in database:\n`);
    
    if (result.rows.length === 0) {
      console.log('❌ No admin users found in database!');
      console.log('\n📝 To create an admin, use one of these methods:');
      console.log('   1. Visit: http://localhost:3000/bootstrap?token=bootstrap123456789012345678901234567890');
      console.log('   2. Or use the /auth/bootstrap API endpoint');
      return;
    }
    
    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
    // Now check Supabase Auth
    if (supabaseServiceKey) {
      console.log('🔐 Checking Supabase Auth users...\n');
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      
      for (const user of result.rows) {
        try {
          const { data, error } = await supabase.auth.admin.getUserById(user.id);
          
          if (error || !data.user) {
            console.log(`❌ ${user.email} - NOT FOUND in Supabase Auth`);
            console.log(`   Database ID: ${user.id}`);
            console.log(`   This user won't be able to login!`);
          } else {
            console.log(`✅ ${user.email} - EXISTS in Supabase Auth`);
            console.log(`   Auth ID: ${data.user.id}`);
            console.log(`   Email Confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);
          }
          console.log('');
        } catch (err) {
          console.log(`❌ Error checking ${user.email}: ${err.message}`);
        }
      }
    } else {
      console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY not set, cannot check Supabase Auth users');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAdminUsers();
