#!/usr/bin/env node
/**
 * ARMS Onboarding Diagnostics Script
 * 
 * This script helps diagnose why users cannot complete registration.
 * Run with: node diagnose-onboarding.js
 */

const https = require('https');

const config = {
  supabaseUrl: 'https://vnkvdnagnkvlyrnkeczh.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZua3ZkbmFnbmt2bHlybmtlY3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjU2NDYsImV4cCI6MjA5MzIwMTY0Nn0.hiQj72oMfM4smSzbDBKcxIJnIdcUZ9RrGVdOpq8lSbE',
  backendUrl: 'http://localhost:3001',
};

console.log('\n🔍 ARMS Onboarding Diagnostics\n');
console.log('================================\n');

// Check 1: Supabase Connection
console.log('1️⃣  Checking Supabase connection...');
const supabaseUrl = new URL(config.supabaseUrl);
https.get({
  hostname: supabaseUrl.hostname,
  path: '/auth/v1/health',
  headers: {
    'apikey': config.supabaseAnonKey
  }
}, (res) => {
  if (res.statusCode === 200) {
    console.log('   ✅ Supabase is reachable\n');
  } else {
    console.log(`   ❌ Supabase returned status ${res.statusCode}\n`);
  }
}).on('error', (err) => {
  console.log(`   ❌ Cannot connect to Supabase: ${err.message}\n`);
});

// Check 2: Backend Connection
console.log('2️⃣  Checking backend connection...');
const http = require('http');
http.get(`${config.backendUrl}/health`, (res) => {
  if (res.statusCode === 200) {
    console.log('   ✅ Backend is running\n');
  } else {
    console.log(`   ❌ Backend returned status ${res.statusCode}\n`);
  }
}).on('error', (err) => {
  console.log(`   ❌ Cannot connect to backend: ${err.message}\n`);
  console.log('   💡 Make sure the backend is running: cd backend && npm run start:dev\n');
});

// Check 3: Common Issues
console.log('3️⃣  Common onboarding issues:\n');
console.log('   📧 Email Confirmation');
console.log('      - Supabase may require email confirmation by default');
console.log('      - Check if emails are being sent');
console.log('      - Check spam folder for confirmation emails\n');

console.log('   🔐 Admin Invites');
console.log('      - Admin accounts require valid invite tokens');
console.log('      - Invite tokens expire after 72 hours by default');
console.log('      - Check that you have a valid invite link\n');

console.log('   🗄️  Database');
console.log('      - Verify PostgreSQL connection is working');
console.log('      - Check that users table exists');
console.log('      - Check admin_invites table for admin registration\n');

// Instructions
console.log('4️⃣  Next steps:\n');
console.log('   For Resident Registration:');
console.log('   1. Try registering at: http://localhost:3000/register');
console.log('   2. Check browser console (F12) for errors');
console.log('   3. Check if you receive a confirmation email');
console.log('   4. If no email, disable email confirmation in Supabase\n');

console.log('   For Admin Registration:');
console.log('   1. First, create the bootstrap admin:');
console.log('      curl -X POST http://localhost:3001/auth/bootstrap \\');
console.log('        -H "Content-Type: application/json" \\');
console.log('        -d \'{"bootstrapToken":"arms_bootstrap_2026_secure_token_xyz","email":"admin@arms.local","password":"Admin123!","firstName":"Admin","lastName":"User","phoneNumber":"+1234567890","address":"Admin Office","ward":"Operations","houseNumber":"1","street":"Admin"}\'');
console.log('   2. Login as admin and create an invite');
console.log('   3. Use the invite link to register new admin\n');

console.log('   Quick Fix (Development Only):');
console.log('   - Go to Supabase Dashboard → Authentication → Providers → Email');
console.log('   - Disable "Confirm email"');
console.log('   - This allows immediate registration without email confirmation\n');

console.log('📖 For detailed instructions, see: ONBOARDING_FIX.md\n');
console.log('================================\n');
