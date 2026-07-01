/**
 * Create additional sample data to populate dashboard
 */

require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createSampleData() {
  try {
    await client.connect();
    console.log('Creating sample data for dashboard...');
    
    // Get user IDs
    const usersResult = await client.query('SELECT id, email FROM users');
    const users = usersResult.rows;
    
    // Create additional service requests
    console.log('\n📋 Creating service requests...');
    const serviceTypes = ['bulk_pickup', 'missed_collection', 'bin_replacement', 'special_collection'];
    
    for (let i = 0; i < 10; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
      const statuses = ['pending', 'in_progress', 'completed'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const requestNumber = `SR-${Date.now()}-${i.toString().padStart(3, '0')}`;
      
      await client.query(`
        INSERT INTO service_requests (
          id, "requestNumber", "residentId", type, description, status, priority,
          title, address, "preferredDate", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, 'medium',
          $6, 'Sample Address', NOW() + INTERVAL '1 day', NOW(), NOW()
        )
      `, [
        requestNumber,
        user.id,
        serviceType,
        `Sample ${serviceType} request description`,
        status,
        `${serviceType.replace('_', ' ')} request`
      ]);
    }
    console.log('✅ Created 10 service requests');
    
    // Create additional recyclables
    console.log('\n♻️ Creating recyclables...');
    const recyclableTypes = ['plastic', 'paper', 'metal', 'glass', 'electronics'];
    
    for (let i = 0; i < 15; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const type = recyclableTypes[Math.floor(Math.random() * recyclableTypes.length)];
      const weight = Math.random() * 5 + 0.5; // 0.5 to 5.5 kg
      const value = weight * (Math.random() * 50 + 10); // Random value per kg
      
      await client.query(`
        INSERT INTO recyclables (
          id, "userId", type, "weightKg", "estimatedValue", "collectionDate",
          status, "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days',
          'verified', NOW(), NOW()
        )
      `, [user.id, type, weight.toFixed(2), value.toFixed(2)]);
    }
    console.log('✅ Created 15 recyclables');
    
    // Create wallet transactions
    console.log('\n💰 Creating wallet transactions...');
    for (const user of users) {
      // Create some earnings from recyclables
      for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
        const amount = Math.random() * 500 + 50;
        await client.query(`
          INSERT INTO wallet_transactions (
            id, "userId", type, amount, description, status,
            "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, 'credit', $2, 'Recyclable collection earnings', 'completed',
            NOW() - INTERVAL '${Math.floor(Math.random() * 20)} days', NOW()
          )
        `, [user.id, amount.toFixed(2)]);
      }
    }
    console.log('✅ Created wallet transactions');
    
    // Create some reports
    console.log('\n📋 Creating reports...');
    const reportTypes = ['illegal_dumping', 'overflowing_bin', 'damaged_infrastructure', 'service_complaint'];
    
    for (let i = 0; i < 8; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const type = reportTypes[Math.floor(Math.random() * reportTypes.length)];
      const statuses = ['pending', 'investigating', 'resolved'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      await client.query(`
        INSERT INTO reports (
          id, "reporterId", type, title, description, location, status, priority,
          "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, 'Sample Location', $5, 'medium',
          NOW() - INTERVAL '${Math.floor(Math.random() * 15)} days', NOW()
        )
      `, [
        user.id,
        type,
        `${type.replace('_', ' ')} report`,
        `Sample description for ${type}`,
        status
      ]);
    }
    console.log('✅ Created 8 reports');
    
    console.log('\n✨ Sample data creation completed successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

createSampleData();