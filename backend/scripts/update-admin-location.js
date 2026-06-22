const { Client } = require('pg');
require('dotenv').config();

async function updateLocation() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Update admin location to Amuwo Odofin
    await client.query(`
      UPDATE users 
      SET latitude = '6.4478', 
          longitude = '3.2945',
          ward = 'Amuwo',
          street = 'Amuwo Odofin Housing Estate'
      WHERE email = 'admin@arms.com'
    `);
    
    console.log('? Updated admin location to Amuwo Odofin');
    
    const { rows } = await client.query("SELECT email, latitude, longitude, ward, street FROM users WHERE email = 'admin@arms.com'");
    console.log('\nNew location:');
    console.log(JSON.stringify(rows[0], null, 2));
    
  } finally {
    await client.end();
  }
}

updateLocation();
