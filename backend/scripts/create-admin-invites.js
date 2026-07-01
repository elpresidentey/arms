/**
 * Create admin invites for onboarding new staff
 */

require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createAdminInvites() {
  try {
    await client.connect();
    console.log('Creating admin invites for onboarding...');
    
    // Get admin user ID first
    const adminResult = await client.query(`SELECT id FROM users WHERE email = 'admin@arms.com'`);
    const adminId = adminResult.rows[0].id;
    
    const invites = [
      { email: 'supervisor@arms.ng', role: 'supervisor' },
      { email: 'dispatcher@arms.ng', role: 'dispatcher' },
      { email: 'staff@arms.ng', role: 'staff' }
    ];
    
    for (const invite of invites) {
      const result = await client.query(
        `INSERT INTO admin_invites (
          id, "tokenHash", email, role, "createdByUserId", "expiresAt", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), 
          encode(gen_random_bytes(32), 'hex'), 
          $1, $2, $3, 
          NOW() + INTERVAL '7 days', 
          NOW(), 
          NOW()
        ) RETURNING email, role`,
        [invite.email, invite.role, adminId]
      );
      console.log('✅ Created invite for', result.rows[0].email, 'as', result.rows[0].role);
    }
    
    console.log('\n✨ Admin invites created successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

createAdminInvites();