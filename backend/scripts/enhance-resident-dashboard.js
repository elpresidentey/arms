/**
 * Enhance resident dashboard with additional users and realistic data
 */

require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function enhanceResidentDashboard() {
  try {
    await client.connect();
    console.log('Enhancing resident dashboard with realistic data...\n');
    
    // Create additional resident users
    console.log('👥 Creating additional resident users...');
    const newResidents = [
      {
        firstName: 'Sarah', 
        lastName: 'Johnson',
        email: 'sarah.johnson@gmail.com',
        phone: '+2348123456789',
        address: 'Block A, Flat 12, Festac Town',
        street: '1st Avenue',
        houseNumber: 'A12',
        ward: 'Festac Town'
      },
      {
        firstName: 'Michael', 
        lastName: 'Adebayo',
        email: 'michael.adebayo@yahoo.com',
        phone: '+2348234567890',
        address: 'House 24, Satellite Town',
        street: 'Alakija Road',
        houseNumber: '24',
        ward: 'Satellite Town'
      },
      {
        firstName: 'Fatima', 
        lastName: 'Ibrahim',
        email: 'fatima.ibrahim@outlook.com',
        phone: '+2348345678901',
        address: '15 Okota Road, Amuwo',
        street: 'Okota Road',
        houseNumber: '15',
        ward: 'Amuwo'
      },
      {
        firstName: 'Emmanuel', 
        lastName: 'Okafor',
        email: 'emmanuel.okafor@hotmail.com',
        phone: '+2348456789012',
        address: 'Plot 7, Phase 2, Festac',
        street: '23 Road',
        houseNumber: '7',
        ward: 'Festac Town'
      },
      {
        firstName: 'Grace', 
        lastName: 'Eze',
        email: 'grace.eze@gmail.com',
        phone: '+2348567890123',
        address: '32 Trade Fair Complex',
        street: 'Badagry Expressway',
        houseNumber: '32',
        ward: 'Trade Fair'
      }
    ];

    const createdUsers = [];
    
    for (const resident of newResidents) {
      // Check if user already exists
      const existingUser = await client.query(`SELECT id FROM users WHERE email = $1`, [resident.email]);
      
      if (existingUser.rows.length === 0) {
        const result = await client.query(`
          INSERT INTO users (
            id, email, password, "firstName", "lastName", "phoneNumber", 
            address, street, "houseNumber", ward, role, "isActive", 
            "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, '$2b$10$dummy.hash.for.testing', $2, $3, $4,
            $5, $6, $7, $8, 'resident', true, 
            NOW() - INTERVAL '${Math.floor(Math.random() * 60)} days', NOW()
          ) RETURNING id, email, "firstName", "lastName"
        `, [
          resident.email, resident.firstName, resident.lastName, resident.phone,
          resident.address, resident.street, resident.houseNumber, resident.ward
        ]);
        
        createdUsers.push(result.rows[0]);
        console.log(`✅ Created resident: ${result.rows[0].firstName} ${result.rows[0].lastName}`);
      } else {
        console.log(`⚠️ User ${resident.email} already exists, skipping...`);
      }
    }
    
    // Get all residents (including existing ones)
    const allResidentsResult = await client.query(`SELECT id, "firstName", "lastName" FROM users WHERE role = 'resident'`);
    const allResidents = allResidentsResult.rows;
    
    console.log(`\n📊 Working with ${allResidents.length} total residents...\n`);
    
    // Create diverse recyclables for each resident
    console.log('♻️ Creating recyclables collection history...');
    const recyclableTypes = ['plastic', 'paper', 'metal', 'glass', 'electronics'];
    
    for (const resident of allResidents) {
      const recyclablesCount = Math.floor(Math.random() * 15) + 5; // 5-20 items per resident
      
      for (let i = 0; i < recyclablesCount; i++) {
        const type = recyclableTypes[Math.floor(Math.random() * recyclableTypes.length)];
        const quantity = (Math.random() * 4 + 0.5).toFixed(2); // 0.5 to 4.5 units
        const baseValue = type === 'electronics' ? 100 : type === 'metal' ? 50 : 20;
        const value = (parseFloat(quantity) * (baseValue + Math.random() * 30)).toFixed(2);
        const daysAgo = Math.floor(Math.random() * 90); // Within last 90 days
        
        await client.query(`
          INSERT INTO recyclables (
            id, "userId", type, quantity, unit, "estimatedValue", 
            status, description, "collectionDate", "createdAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, 'kg', $4, 
            'verified', $5, NOW() - INTERVAL '${daysAgo} days', NOW() - INTERVAL '${daysAgo} days'
          )
        `, [
          resident.id, 
          type, 
          quantity, 
          value,
          `${type.charAt(0).toUpperCase() + type.slice(1)} recyclables collected`
        ]);
      }
    }
    console.log(`✅ Created recyclables for all residents`);
    
    // Create wallet transaction history for each resident
    console.log('\n💰 Creating wallet transaction history...');
    for (const resident of allResidents) {
      let runningBalance = 0;
      const transactionCount = Math.floor(Math.random() * 12) + 8; // 8-20 transactions per resident
      
      // Create earnings from recyclables
      for (let i = 0; i < transactionCount; i++) {
        const isCredit = Math.random() > 0.25; // 75% credits, 25% debits
        const amount = isCredit 
          ? (Math.random() * 400 + 50).toFixed(2)  // Credits: ₦50-450
          : (Math.random() * 200 + 20).toFixed(2); // Debits: ₦20-220
        
        if (isCredit) {
          runningBalance += parseFloat(amount);
        } else {
          runningBalance -= parseFloat(amount);
        }
        
        const description = isCredit 
          ? 'Recyclable collection earnings'
          : Math.random() > 0.5 ? 'Withdrawal request' : 'Service fee payment';
          
        const daysAgo = Math.floor(Math.random() * 60); // Within last 60 days
        
        await client.query(`
          INSERT INTO wallet_transactions (
            id, "userId", type, amount, "balanceAfter", description, status,
            source, "createdAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, 'completed',
            $6, NOW() - INTERVAL '${daysAgo} days'
          )
        `, [
          resident.id, 
          isCredit ? 'credit' : 'debit', 
          amount, 
          runningBalance.toFixed(2), 
          description,
          isCredit ? 'recyclables' : 'withdrawal'
        ]);
      }
    }
    console.log(`✅ Created wallet transactions for all residents`);
    
    // Create collection requests for residents
    console.log('\n📋 Creating collection requests...');
    const requestTypes = ['routine', 'urgent', 'bulky'];
    const statuses = ['pending', 'scheduled', 'in_progress', 'completed'];
    
    for (const resident of allResidents) {
      const requestCount = Math.floor(Math.random() * 8) + 2; // 2-10 requests per resident
      
      for (let i = 0; i < requestCount; i++) {
        const type = requestTypes[Math.floor(Math.random() * requestTypes.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const daysAgo = Math.floor(Math.random() * 45); // Within last 45 days
        
        // Get user's address info for the request
        const userInfo = await client.query(`
          SELECT address, ward, street FROM users WHERE id = $1
        `, [resident.id]);
        
        const user = userInfo.rows[0];
        
        await client.query(`
          INSERT INTO collection_requests (
            id, "residentId", type, status, address, ward, street,
            "scheduledDate", description, "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6,
            NOW() + INTERVAL '${Math.floor(Math.random() * 14)} days',
            $7, NOW() - INTERVAL '${daysAgo} days', NOW()
          )
        `, [
          resident.id,
          type,
          status,
          user.address,
          user.ward,
          user.street,
          `${type.charAt(0).toUpperCase() + type.slice(1)} collection request for household waste`
        ]);
      }
    }
    console.log(`✅ Created collection requests for all residents`);
    
    // Create bills for all residents
    console.log('\n💳 Creating bills for residents...');
    for (const resident of allResidents) {
      const billCount = Math.floor(Math.random() * 6) + 2; // 2-8 bills per resident
      
      for (let i = 0; i < billCount; i++) {
        const monthsAgo = i;
        const amount = (Math.random() * 1000 + 1500).toFixed(2); // ₦1,500-2,500
        const status = Math.random() > 0.3 ? 'paid' : Math.random() > 0.5 ? 'pending' : 'overdue';
        
        // Generate bill period
        const billDate = new Date();
        billDate.setMonth(billDate.getMonth() - monthsAgo);
        const period = `${billDate.getFullYear()}-${(billDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        // Generate unique bill number
        const billNumber = `BILL-${period}-${resident.id.slice(-4)}-${i.toString().padStart(2, '0')}`;
        
        await client.query(`
          INSERT INTO bills (
            id, "billNumber", "userId", "billingPeriod", "propertyType", amount,
            "totalAmount", status, "dueDate", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, 'residential', $4, $5, $6,
            NOW() + INTERVAL '30 days',
            NOW() - INTERVAL '${monthsAgo * 30} days', NOW()
          )
        `, [
          billNumber, resident.id, period, 
          amount, amount, status
        ]);
        
        // Create payment record if bill is paid
        if (status === 'paid') {
          await client.query(`
            INSERT INTO bill_payments (
              id, "billId", "userId", amount, "paymentMethod", status, "createdAt"
            ) VALUES (
              gen_random_uuid(), 
              (SELECT id FROM bills WHERE "billNumber" = $1),
              $2, $3, 'bank_transfer', 'successful',
              NOW() - INTERVAL '${(monthsAgo * 30) - Math.floor(Math.random() * 20)} days'
            )
          `, [billNumber, resident.id, amount]);
        }
      }
    }
    console.log(`✅ Created bills and payments for all residents`);
    
    // Create service requests
    console.log('\n🛠️ Creating service requests...');
    const serviceTypes = ['bulk_pickup', 'missed_collection', 'bin_replacement', 'complaint'];
    
    for (const resident of allResidents) {
      const serviceCount = Math.floor(Math.random() * 5) + 1; // 1-5 service requests per resident
      
      for (let i = 0; i < serviceCount; i++) {
        const type = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
        const status = ['pending', 'in_progress', 'completed'][Math.floor(Math.random() * 3)];
        const daysAgo = Math.floor(Math.random() * 30); // Within last 30 days
        
        const requestNumber = `SR-${Date.now()}-${resident.id.slice(-4)}-${i}`;
        
        // Get user's address info for the request
        const userInfo = await client.query(`
          SELECT address, ward, street FROM users WHERE id = $1
        `, [resident.id]);
        
        const user = userInfo.rows[0];
        
        await client.query(`
          INSERT INTO service_requests (
            id, "requestNumber", "residentId", type, status, priority,
            title, description, address, ward, street, "preferredDate", "createdAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, 'medium',
            $5, $6, $7, $8, $9,
            NOW() + INTERVAL '${Math.floor(Math.random() * 7)} days',
            NOW() - INTERVAL '${daysAgo} days'
          )
        `, [
          requestNumber, resident.id, type, status,
          `${type.replace('_', ' ')} request`,
          `Request for ${type.replace('_', ' ')} service`,
          user.address, user.ward, user.street
        ]);
      }
    }
    console.log(`✅ Created service requests for all residents`);
    
    // Create reports from residents
    console.log('\n📝 Creating issue reports...');
    const reportTypes = ['illegal_dumping', 'overflowing_bin', 'damaged_infrastructure', 'service_complaint'];
    
    for (const resident of allResidents) {
      const reportCount = Math.floor(Math.random() * 4) + 1; // 1-4 reports per resident
      
      for (let i = 0; i < reportCount; i++) {
        const type = reportTypes[Math.floor(Math.random() * reportTypes.length)];
        const status = ['pending', 'investigating', 'resolved'][Math.floor(Math.random() * 3)];
        const daysAgo = Math.floor(Math.random() * 60); // Within last 60 days
        
        const ticketNumber = `TK-${Date.now()}-${resident.id.slice(-4)}-${i}`;
        
        // Get user's address info for the report
        const userInfo = await client.query(`
          SELECT address, ward, street FROM users WHERE id = $1
        `, [resident.id]);
        
        const user = userInfo.rows[0];
        
        await client.query(`
          INSERT INTO reports (
            id, "ticketNumber", "reporterId", type, title, description, 
            address, ward, street, status, priority, "createdAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5,
            $6, $7, $8, $9, 'medium',
            NOW() - INTERVAL '${daysAgo} days'
          )
        `, [
          ticketNumber, resident.id, type,
          `${type.replace(/_/g, ' ')} report`,
          `Report about ${type.replace(/_/g, ' ')} issue in the area`,
          user.address, user.ward, user.street, status
        ]);
      }
    }
    console.log(`✅ Created issue reports for all residents`);
    
    console.log('\n✨ Resident dashboard enhancement completed!\n');
    
    // Show final statistics
    const finalStats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'resident') as total_residents,
        (SELECT COUNT(*) FROM recyclables) as total_recyclables,
        (SELECT COUNT(*) FROM wallet_transactions) as total_transactions,
        (SELECT COUNT(*) FROM collection_requests) as total_collection_requests,
        (SELECT COUNT(*) FROM bills) as total_bills,
        (SELECT COUNT(*) FROM bill_payments) as total_payments,
        (SELECT COUNT(*) FROM service_requests) as total_service_requests,
        (SELECT COUNT(*) FROM reports) as total_reports,
        (SELECT COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0) FROM wallet_transactions WHERE status = 'completed') as total_wallet_balance
    `);
    
    const stats = finalStats.rows[0];
    
    console.log('📊 Final Resident Dashboard Statistics:');
    console.log(`   👥 Total Residents: ${stats.total_residents}`);
    console.log(`   ♻️ Total Recyclables: ${stats.total_recyclables}`);
    console.log(`   💰 Total Wallet Transactions: ${stats.total_transactions}`);
    console.log(`   💳 Total Bills: ${stats.total_bills}`);
    console.log(`   ✅ Total Payments: ${stats.total_payments}`);
    console.log(`   📋 Total Collection Requests: ${stats.total_collection_requests}`);
    console.log(`   🛠️ Total Service Requests: ${stats.total_service_requests}`);
    console.log(`   📝 Total Reports: ${stats.total_reports}`);
    console.log(`   💵 Total Wallet Balance: ₦${parseFloat(stats.total_wallet_balance).toLocaleString()}`);
    
    console.log('\n🎉 Resident dashboards now have rich, realistic data!');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

enhanceResidentDashboard();