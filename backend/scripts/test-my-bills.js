const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const backendRoot = path.resolve(__dirname, '..');
const envPath = path.join(backendRoot, '.env');
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith('#') && line.includes('='))
    .map((line) => {
      const separatorIndex = line.indexOf('=');
      return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
    }),
);

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node scripts/test-my-bills.js <email> <password>');
  process.exit(1);
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
const apiBase = process.env.API_BASE || 'http://localhost:3001';

async function main() {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(`Sign in failed: ${error.message}`);
  }

  const token = data.session?.access_token;
  if (!token) {
    throw new Error('No access token returned');
  }

  const response = await fetch(`${apiBase}/billing/my-bills`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await response.text();
  console.log('status:', response.status);
  console.log('body:', body);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
