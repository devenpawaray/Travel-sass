const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TENANT_ID = 'fbad0720-6cfa-40c9-aeea-e5cb33347946';

async function seed() {
  console.log('🚀 Initializing Tenant and Admin...');

  // 0. Create Tenant
  const { data: tenant, error: tError } = await supabase.from('tenants').insert({
    id: TENANT_ID,
    name: 'Travel Lounge Mauritius',
    plan: 'enterprise'
  }).select().single();

  if (tError && tError.code !== '23505') {
    console.error('Error creating tenant:', tError);
    return;
  }

  // 1. Create Admin User (linking to auth.users - assuming id exists or using a dummy)
  // For MVP testing, we often use a hardcoded UUID that matches our testing auth user
  const ADMIN_ID = '7ddefd14-b6e6-4c9e-9b33-3ba52519cc45';
  await supabase.from('users').upsert({
    id: ADMIN_ID,
    tenant_id: TENANT_ID,
    role: 'admin'
  });

  console.log('🚀 Seeding Production Scenarios...');

  // 1. Seed Hotels into System State
  const hotels = [
    {
      tenant_id: TENANT_ID,
      service_id: '00000000-0000-0000-0000-000000000001',
      state: 'active',
      data: {
        name: "Ocean Breeze Resort",
        price: 800,
        volatility: "low",
        margin_min: 5
      }
    },
    {
      tenant_id: TENANT_ID,
      service_id: '00000000-0000-0000-0000-000000000002',
      state: 'active',
      data: {
        name: "Coral Bay Hotel",
        price: 1200,
        volatility: "high",
        margin_min: 8
      }
    }
  ];

  for (const hotel of hotels) {
    await supabase.from('system_state').upsert(hotel, { onConflict: 'service_id' });
  }
  console.log('✅ Hotels initialized in system state.');

  // 2. Seed Sample Events
  const events = [
    {
      tenant_id: TENANT_ID,
      type: "PRICE_UPDATED",
      payload: {
        service_id: "00000000-0000-0000-0000-000000000001",
        new_price: 950
      },
      status: 'processed'
    },
    {
      tenant_id: TENANT_ID,
      type: "SERVICE_PAUSED",
      payload: {
        service_id: "00000000-0000-0000-0000-000000000002"
      },
      status: 'processed'
    }
  ];

  await supabase.from('events').insert(events);
  console.log('✅ Operational events seeded.');

  // 3. Seed Alerts (Simulating Dispatcher Reactions)
  const alerts = [
    {
      tenant_id: TENANT_ID,
      severity: "red",
      type: "pricing",
      message: "Margin violation detected: Coral Bay Hotel price spike."
    },
    {
      tenant_id: TENANT_ID,
      severity: "critical",
      type: "system",
      message: "Kill switch triggered by automated risk detection."
    }
  ];

  await supabase.from('alerts').insert(alerts);
  console.log('✅ Intelligence alerts seeded.');

  // 4. Seed Test Quotes
  const { data: quote, error: quoteError } = await supabase.from('quotes').insert({
    tenant_id: TENANT_ID,
    customer_name: "John Doe",
    package_id: '00000000-0000-0000-0000-000000000001',
    status: "draft",
    total_price: 1500,
    margin: 14.5
  }).select().single();

  if (quoteError) {
    console.error('❌ Error creating test quote:', quoteError);
  } else {
    console.log(`✅ Test quote created for John Doe (ID: ${quote.id})`);
  }

  console.log('🏁 Production seeding complete!');
}

seed().catch(console.error);
