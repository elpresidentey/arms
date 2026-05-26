require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n');

    // Check Postgres database users
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('id, email, role, firstName, lastName, createdAt')
      .order('createdAt', { ascending: false });

    if (dbError) {
      console.error('❌ Database error:', dbError);
      return;
    }

    console.log('📊 Users in Postgres database:');
    if (dbUsers && dbUsers.length > 0) {
      dbUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Created: ${user.createdAt}`);
      });
      console.log(`\n✅ Total users: ${dbUsers.length}`);
    } else {
      console.log('⚠️  No users found in database');
    }

    // Check Supabase Auth users
    console.log('\n\n🔐 Checking Supabase Auth users...\n');
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Auth error:', authError);
      return;
    }

    console.log('📊 Users in Supabase Auth:');
    if (authData && authData.users && authData.users.length > 0) {
      authData.users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Last Sign In: ${user.last_sign_in_at || 'Never'}`);
      });
      console.log(`\n✅ Total auth users: ${authData.users.length}`);
    } else {
      console.log('⚠️  No users found in Supabase Auth');
    }

    // Check for mismatches
    console.log('\n\n🔄 Checking for sync issues...\n');
    const dbEmails = new Set(dbUsers?.map(u => u.email) || []);
    const authEmails = new Set(authData?.users?.map(u => u.email) || []);

    const inAuthNotDb = [...authEmails].filter(email => !dbEmails.has(email));
    const inDbNotAuth = [...dbEmails].filter(email => !authEmails.has(email));

    if (inAuthNotDb.length > 0) {
      console.log('⚠️  Users in Auth but NOT in Database:');
      inAuthNotDb.forEach(email => console.log(`   - ${email}`));
    }

    if (inDbNotAuth.length > 0) {
      console.log('⚠️  Users in Database but NOT in Auth:');
      inDbNotAuth.forEach(email => console.log(`   - ${email}`));
    }

    if (inAuthNotDb.length === 0 && inDbNotAuth.length === 0) {
      console.log('✅ All users are in sync between Auth and Database');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUsers();
