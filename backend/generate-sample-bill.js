const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSampleBill() {
  try {
    // Get the first resident user
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'resident')
      .limit(1);

    if (userError) throw userError;
    if (!users || users.length === 0) {
      console.log('No resident users found');
      return;
    }

    const user = users[0];
    console.log(`Found user: ${user.email}`);

    // Get current billing period (YYYY-MM format)
    const now = new Date();
    const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Check if bill already exists
    const { data: existingBills } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', user.id)
      .eq('billing_period', billingPeriod);

    if (existingBills && existingBills.length > 0) {
      console.log(`Bill already exists for ${billingPeriod}`);
      console.log('Existing bills:', existingBills);
      return;
    }

    // Determine property type and amount
    const propertyType = user.property_type || 'residential';
    const baseAmount = propertyType === 'commercial' ? 3500 : 2000;

    // Calculate due date (7 days after month end)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const dueDate = new Date(lastDayOfMonth);
    dueDate.setDate(dueDate.getDate() + 7);

    // Generate bill number
    const billNumber = `BILL-${billingPeriod}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    // Create the bill
    const { data: bill, error: billError } = await supabase
      .from('bills')
      .insert({
        userId: user.id,
        billNumber: billNumber,
        billingPeriod: billingPeriod,
        propertyType: propertyType,
        amount: baseAmount,
        lateFee: 0,
        totalAmount: baseAmount,
        status: 'pending',
        dueDate: dueDate.toISOString(),
        createdAt: now.toISOString(),
      })
      .select()
      .single();

    if (billError) throw billError;

    console.log('✅ Sample bill created successfully!');
    console.log('Bill details:', {
      billNumber: bill.billNumber,
      period: bill.billingPeriod,
      amount: bill.totalAmount,
      dueDate: bill.dueDate,
      status: bill.status,
    });

  } catch (error) {
    console.error('Error generating sample bill:', error.message);
    if (error.details) console.error('Details:', error.details);
    if (error.hint) console.error('Hint:', error.hint);
  }
}

generateSampleBill();
