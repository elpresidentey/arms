const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function resetAdmin() {
  const dbClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await dbClient.connect();
    
    // Get admin from database
    const { rows } = await dbClient.query(
      "SELECT id, email FROM users WHERE role = 'admin' LIMIT 1"
    );
    
    if (rows.length === 0) {
      console.log('No admin found in database!');
      process.exit(1);
    }
    
    const admin = rows[0];
    const newPassword = 'Admin123!@#';
    
    console.log(`Resetting password for ${admin.email} (ID: ${admin.id})`);
    
    // Update in Supabase Auth
    const { error } = await supabase.auth.admin.updateUserById(
      admin.id,
      { password: newPassword }
    );
    
    if (error) {
      console.log(`Error: ${error.message}`);
      process.exit(1);
    }
    
    console.log(`? Password reset successfully!`);
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${newPassword}`);
    
  } catch (err) {
    console.log(`Error: ${err.message}`);
  } finally {
    await dbClient.end();
  }
}

resetAdmin();
