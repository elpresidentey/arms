/**
 * Create simple sample data for dashboard stats
 */

require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createSimpleSampleData() {
  try {
    await client.connect();
    console.log('Creating simple sample data...');
    
    // Get resident user ID
    const residentResult = await client.query(`SELECT id FROM users WHERE role = 'resident'`);
    const residentId = residentResult.rows[0].id;
    
    // Create some recyclables for earnings
    console.log('\n♻️ Creating recyclables...');
    const recyclableTypes = ['plastic', 'paper', 'metal', 'glass'];
    
    for (let i = 0; i < 10; i++) {
      const type = recyclableTypes[Math.floor(Math.random() * recyclableTypes.length)];
      const quantity = Math.random() * 3 + 0.5; // 0.5 to 3.5 units
      const value = quantity * (Math.random() * 30 + 15); // 15-45 per unit
      
      await client.query(`
        INSERT INTO recyclables (
          id, "userId", type, quantity, unit, "estimatedValue", 
          status, description, "collectionDate", "createdAt"
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, 'kg', $4, 
          'verified', $5, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days', NOW()
        )
      `, [
        residentId, 
        type, 
        quantity.toFixed(2), 
        value.toFixed(2),
        `${type} recyclables collected`
      ]);
    }
    console.log('✅ Created 10 recyclables');
    
    // Create wallet transactions for earnings
    console.log('\n💰 Creating wallet transactions...');
    let runningBalance = 0;
    
    for (let i = 0; i < 5; i++) {
      const amount = Math.random() * 300 + 50;
      const type = Math.random() > 0.7 ? 'debit' : 'credit'; // Mostly credits
      const description = type === 'credit' ? 'Recyclable collection earnings' : 'Withdrawal request';
      
      if (type === 'credit') {
        runningBalance += amount;
      } else {
        runningBalance -= amount;
      }
      
      await client.query(`
        INSERT INTO wallet_transactions (
          id, "userId", type, amount, "balanceAfter", description, status,
          source, "createdAt"
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, 'completed',
          'recyclables', NOW() - INTERVAL '${Math.floor(Math.random() * 25)} days'
        )
      `, [residentId, type, amount.toFixed(2), runningBalance.toFixed(2), description]);
    }
    console.log('✅ Created 5 wallet transactions');
    
    // Create some reports
    console.log('\n📋 Creating reports...');
    const reportTypes = ['illegal_dumping', 'overflowing_bin', 'damaged_infrastructure'];
    
    for (let i = 0; i < 6; i++) {
      const type = reportTypes[Math.floor(Math.random() * reportTypes.length)];
      const statuses = ['pending', 'investigating', 'resolved'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const ticketNumber = `TK-${Date.now()}-${i.toString().padStart(3, '0')}`;
      
      await client.query(`
        INSERT INTO reports (
          id, "ticketNumber", "reporterId", type, title, description, address, ward, street, status, priority,
          "createdAt"
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, 'Sample Address Location', 'Festac Town', '1st Avenue', $6, 'medium',
          NOW() - INTERVAL '${Math.floor(Math.random() * 20)} days'
        )
      `, [
        ticketNumber,
        residentId,
        type,
        `${type.replace(/_/g, ' ')} report #${i + 1}`,
        `Sample description for ${type.replace(/_/g, ' ')} issue`,
        status
      ]);
    }
    console.log('✅ Created 6 reports');
    
    console.log('\n✨ Sample data creation completed!');
    
    // Show final stats
    const statsQueries = [
      ['Collection Routes', 'SELECT COUNT(*) FROM collection_routes'],
      ['Service Schedules', 'SELECT COUNT(*) FROM service_schedules'],
      ['Vehicles', 'SELECT COUNT(*) FROM vehicles'],
      ['Drivers', 'SELECT COUNT(*) FROM drivers'],
      ['Admin Invites', 'SELECT COUNT(*) FROM admin_invites'],
      ['Bills', 'SELECT COUNT(*) FROM bills'],
      ['Recyclables', 'SELECT COUNT(*) FROM recyclables'],
      ['Reports', 'SELECT COUNT(*) FROM reports'],
      ['Wallet Transactions', 'SELECT COUNT(*) FROM wallet_transactions']
    ];
    
    console.log('\n📊 Final Database Stats:');
    for (const [name, query] of statsQueries) {
      const result = await client.query(query);
      console.log(`   ${name}: ${result.rows[0].count}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

createSimpleSampleData();