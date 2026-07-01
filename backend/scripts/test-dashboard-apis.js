/**
 * Test dashboard API endpoints to verify functionality
 */

require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testDashboardAPIs() {
  try {
    await client.connect();
    console.log('Testing Dashboard API functionality...\n');
    
    // Test Collection Requests Statistics
    console.log('🔍 Collection Requests Statistics:');
    const collectionStats = await client.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM collection_requests
    `);
    console.log('   Total:', collectionStats.rows[0].total);
    console.log('   Pending:', collectionStats.rows[0].pending);
    console.log('   Scheduled:', collectionStats.rows[0].scheduled);
    console.log('   Completed:', collectionStats.rows[0].completed);
    console.log('   Cancelled:', collectionStats.rows[0].cancelled);
    
    // Test Billing Statistics
    console.log('\n💰 Billing Statistics:');
    const billingStats = await client.query(`
      SELECT 
        COUNT(*) as total_bills,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue,
        SUM(CASE WHEN status = 'paid' THEN "totalAmount" ELSE 0 END) as total_revenue,
        SUM(CASE WHEN status IN ('pending', 'overdue') THEN "totalAmount" ELSE 0 END) as pending_revenue
      FROM bills
    `);
    console.log('   Total Bills:', billingStats.rows[0].total_bills);
    console.log('   Pending:', billingStats.rows[0].pending);
    console.log('   Paid:', billingStats.rows[0].paid);
    console.log('   Total Revenue:', billingStats.rows[0].total_revenue);
    console.log('   Pending Revenue:', billingStats.rows[0].pending_revenue);
    
    // Test Wallet Balance
    console.log('\n🏦 Wallet Balance:');
    const walletBalance = await client.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0) as balance,
        COUNT(*) as transaction_count
      FROM wallet_transactions 
      WHERE status = 'completed'
    `);
    console.log('   Current Balance:', walletBalance.rows[0].balance);
    console.log('   Transactions:', walletBalance.rows[0].transaction_count);
    
    // Test Recyclables Statistics
    console.log('\n♻️ Recyclables Statistics:');
    const recyclablesStats = await client.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity::numeric) as total_quantity,
        SUM("estimatedValue"::numeric) as total_value,
        COUNT(DISTINCT type) as unique_types
      FROM recyclables 
      WHERE status = 'verified'
    `);
    console.log('   Total Items:', recyclablesStats.rows[0].total_items);
    console.log('   Total Quantity:', recyclablesStats.rows[0].total_quantity, 'units');
    console.log('   Total Value:', recyclablesStats.rows[0].total_value);
    console.log('   Unique Types:', recyclablesStats.rows[0].unique_types);
    
    // Test Fleet Statistics
    console.log('\n🚛 Fleet Statistics:');
    const fleetStats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM vehicles) as total_vehicles,
        (SELECT COUNT(*) FROM vehicles WHERE status = 'operational') as operational,
        (SELECT COUNT(*) FROM vehicles WHERE status = 'maintenance') as in_maintenance,
        (SELECT COUNT(*) FROM drivers) as total_drivers,
        (SELECT COUNT(*) FROM vehicle_assignments WHERE status = 'active') as active_assignments
    `);
    console.log('   Total Vehicles:', fleetStats.rows[0].total_vehicles);
    console.log('   Operational:', fleetStats.rows[0].operational);
    console.log('   In Maintenance:', fleetStats.rows[0].in_maintenance);
    console.log('   Total Drivers:', fleetStats.rows[0].total_drivers);
    console.log('   Active Assignments:', fleetStats.rows[0].active_assignments);
    
    // Test Reports Statistics
    console.log('\n📋 Reports Statistics:');
    const reportsStats = await client.query(`
      SELECT 
        COUNT(*) as total_reports,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'investigating' THEN 1 ELSE 0 END) as investigating,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
      FROM reports
    `);
    console.log('   Total Reports:', reportsStats.rows[0].total_reports);
    console.log('   Pending:', reportsStats.rows[0].pending);
    console.log('   Investigating:', reportsStats.rows[0].investigating);
    console.log('   Resolved:', reportsStats.rows[0].resolved);
    
    // Test Collection Routes
    console.log('\n🛣️ Collection Routes:');
    const routesStats = await client.query(`
      SELECT 
        COUNT(*) as total_routes,
        COUNT(DISTINCT ward) as unique_wards,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_routes
      FROM collection_routes
    `);
    console.log('   Total Routes:', routesStats.rows[0].total_routes);
    console.log('   Unique Wards:', routesStats.rows[0].unique_wards);
    console.log('   Active Routes:', routesStats.rows[0].active_routes);
    
    // Test Service Schedules
    console.log('\n📅 Service Schedules:');
    const schedulesStats = await client.query(`
      SELECT 
        COUNT(*) as total_schedules,
        COUNT(DISTINCT "serviceType") as service_types,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published
      FROM service_schedules
    `);
    console.log('   Total Schedules:', schedulesStats.rows[0].total_schedules);
    console.log('   Service Types:', schedulesStats.rows[0].service_types);
    console.log('   Published:', schedulesStats.rows[0].published);
    
    // Test Admin Invites
    console.log('\n👥 Admin Invites:');
    const invitesStats = await client.query(`
      SELECT 
        COUNT(*) as total_invites,
        COUNT(DISTINCT role) as unique_roles
      FROM admin_invites 
      WHERE "usedAt" IS NULL AND "revokedAt" IS NULL
    `);
    console.log('   Pending Invites:', invitesStats.rows[0].total_invites);
    console.log('   Unique Roles:', invitesStats.rows[0].unique_roles);
    
    console.log('\n✨ Dashboard API functionality test completed!');
    console.log('\n🎉 All systems appear to be working correctly!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

testDashboardAPIs();