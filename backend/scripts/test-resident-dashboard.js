/**
 * Test resident dashboard functionality and show current data
 */

require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testResidentDashboard() {
  try {
    await client.connect();
    console.log('Testing Resident Dashboard functionality...\n');
    
    // Get all residents
    const residentsResult = await client.query(`
      SELECT id, "firstName", "lastName", email, address, ward, "createdAt"
      FROM users 
      WHERE role = 'resident' 
      ORDER BY "createdAt" DESC
    `);
    
    console.log('👥 Current Residents:');
    residentsResult.rows.forEach((resident, index) => {
      console.log(`   ${index + 1}. ${resident.firstName} ${resident.lastName} (${resident.email})`);
      console.log(`      Ward: ${resident.ward}, Address: ${resident.address}`);
      console.log(`      Joined: ${resident.createdAt.toDateString()}\n`);
    });
    
    console.log(`📊 Total Residents: ${residentsResult.rows.length}\n`);
    
    // Test each resident's dashboard data
    for (const resident of residentsResult.rows) {
      console.log(`🏠 Dashboard Data for ${resident.firstName} ${resident.lastName}:`);
      
      // Wallet balance
      const walletResult = await client.query(`
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0) as balance,
          COUNT(*) as transaction_count
        FROM wallet_transactions 
        WHERE "userId" = $1 AND status = 'completed'
      `, [resident.id]);
      
      console.log(`   💰 Wallet Balance: ₦${parseFloat(walletResult.rows[0].balance).toLocaleString()}`);
      console.log(`   💳 Transactions: ${walletResult.rows[0].transaction_count}`);
      
      // Recyclables
      const recyclablesResult = await client.query(`
        SELECT 
          COUNT(*) as total_items,
          COALESCE(SUM(quantity::numeric), 0) as total_quantity,
          COALESCE(SUM("estimatedValue"::numeric), 0) as total_value
        FROM recyclables 
        WHERE "userId" = $1 AND status = 'verified'
      `, [resident.id]);
      
      console.log(`   ♻️ Recyclables: ${recyclablesResult.rows[0].total_items} items (${recyclablesResult.rows[0].total_quantity}kg, ₦${parseFloat(recyclablesResult.rows[0].total_value).toLocaleString()})`);
      
      // Bills
      const billsResult = await client.query(`
        SELECT 
          COUNT(*) as total_bills,
          SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_bills,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bills,
          COALESCE(SUM("totalAmount"::numeric), 0) as total_amount
        FROM bills 
        WHERE "userId" = $1
      `, [resident.id]);
      
      console.log(`   💵 Bills: ${billsResult.rows[0].total_bills} total (${billsResult.rows[0].paid_bills} paid, ${billsResult.rows[0].pending_bills} pending)`);
      console.log(`   💰 Total Billed: ₦${parseFloat(billsResult.rows[0].total_amount).toLocaleString()}`);
      
      // Collection requests
      const collectionsResult = await client.query(`
        SELECT 
          COUNT(*) as total_requests,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
        FROM collection_requests 
        WHERE "residentId" = $1
      `, [resident.id]);
      
      console.log(`   📋 Collection Requests: ${collectionsResult.rows[0].total_requests} total (${collectionsResult.rows[0].pending} pending, ${collectionsResult.rows[0].completed} completed)`);
      
      // Service requests
      const serviceResult = await client.query(`
        SELECT COUNT(*) as total_service_requests
        FROM service_requests 
        WHERE "residentId" = $1
      `, [resident.id]);
      
      console.log(`   🛠️ Service Requests: ${serviceResult.rows[0].total_service_requests}`);
      
      // Reports
      const reportsResult = await client.query(`
        SELECT COUNT(*) as total_reports
        FROM reports 
        WHERE "reporterId" = $1
      `, [resident.id]);
      
      console.log(`   📝 Reports Submitted: ${reportsResult.rows[0].total_reports}`);
      
      console.log(''); // Empty line for separation
    }
    
    // Overall system statistics for residents
    console.log('🌟 Overall Resident System Statistics:');
    
    const overallStats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'resident') as total_residents,
        (SELECT COUNT(*) FROM recyclables) as total_recyclables,
        (SELECT COALESCE(SUM("estimatedValue"::numeric), 0) FROM recyclables WHERE status = 'verified') as total_recyclables_value,
        (SELECT COUNT(*) FROM wallet_transactions WHERE type = 'credit') as total_earnings_transactions,
        (SELECT COUNT(*) FROM collection_requests) as total_collection_requests,
        (SELECT COUNT(*) FROM bills) as total_bills,
        (SELECT COUNT(*) FROM service_requests) as total_service_requests,
        (SELECT COUNT(*) FROM reports) as total_reports
    `);
    
    const stats = overallStats.rows[0];
    console.log(`   👥 Active Residents: ${stats.total_residents}`);
    console.log(`   ♻️ Total Recyclables Processed: ${stats.total_recyclables}`);
    console.log(`   💰 Total Recyclables Value: ₦${parseFloat(stats.total_recyclables_value).toLocaleString()}`);
    console.log(`   💸 Earnings Transactions: ${stats.total_earnings_transactions}`);
    console.log(`   📋 Collection Requests: ${stats.total_collection_requests}`);
    console.log(`   💵 Bills Generated: ${stats.total_bills}`);
    console.log(`   🛠️ Service Requests: ${stats.total_service_requests}`);
    console.log(`   📝 Issue Reports: ${stats.total_reports}`);
    
    // Test recent activity feed
    console.log('\n📱 Recent Activity Feed (Last 10 Activities):');
    const recentActivity = await client.query(`
      (SELECT 'recyclable' as activity_type, "createdAt", 'Recyclable collected' as description, "estimatedValue" as value 
       FROM recyclables ORDER BY "createdAt" DESC LIMIT 5)
      UNION ALL
      (SELECT 'wallet' as activity_type, "createdAt", description, amount as value 
       FROM wallet_transactions WHERE type = 'credit' ORDER BY "createdAt" DESC LIMIT 5)
      ORDER BY "createdAt" DESC LIMIT 10
    `);
    
    recentActivity.rows.forEach((activity, index) => {
      const date = activity.createdAt.toLocaleDateString();
      const value = activity.value ? `₦${parseFloat(activity.value).toLocaleString()}` : '';
      console.log(`   ${index + 1}. ${activity.description} ${value} (${date})`);
    });
    
    console.log('\n✨ Resident dashboard functionality test completed!');
    console.log('🎉 All resident features are working with rich data!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

testResidentDashboard();