require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function checkRoutes() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'collection_routes'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ collection_routes table does not exist!');
      return;
    }

    console.log('✅ collection_routes table exists\n');

    // Count routes
    const countResult = await client.query('SELECT COUNT(*) FROM collection_routes');
    console.log(`📊 Total collection routes: ${countResult.rows[0].count}\n`);

    // Get sample routes
    const routesResult = await client.query(`
      SELECT id, name, ward, street, status, "nextCollectionDate"
      FROM collection_routes
      LIMIT 5
    `);

    if (routesResult.rows.length > 0) {
      console.log('Sample routes:');
      routesResult.rows.forEach((route, index) => {
        console.log(`${index + 1}. ${route.name} (${route.ward}, ${route.street})`);
        console.log(`   Status: ${route.status}`);
        console.log(`   Next collection: ${route.nextCollectionDate}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No routes found in database');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkRoutes();
