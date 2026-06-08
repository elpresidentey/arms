require('dotenv').config();
const https = require('https');

// You'll need to login first and get a token
// For now, let's just check if the endpoint responds

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/collection-routes',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
};

console.log('Testing collection-routes endpoint...\n');

const req = require('http').request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, JSON.stringify(res.headers, null, 2));
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();
