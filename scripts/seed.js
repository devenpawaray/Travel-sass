const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  console.log('🌱 Seeding database...');

  // 1. Create Tenant
  const { data: tenant, error: tError } = await supabase
    .from('tenants')
    .insert({
      name: 'Travel Lounge Mauritius',
      settings_json: {
        currency: 'MUR',
        timezone: 'Indian/Mauritius'
      }
    })
    .select()
    .single();

  if (tError) {
    console.error('Error creating tenant:', tError);
    return;
  }
  console.log('✅ Tenant created:', tenant.id);

  // 2. Create Admin User
  const { data: user, error: uError } = await supabase
    .from('users')
    .insert({
      tenant_id: tenant.id,
      email: 'admin@travellounge.mu',
      role: 'admin'
    })
    .select()
    .single();

  if (uError) {
    console.error('Error creating user:', uError);
    return;
  }
  console.log('✅ Admin user created:', user.id);

  // 3. Create System Config
  const { error: cError } = await supabase
    .from('system_config')
    .insert({
      tenant_id: tenant.id,
      commission_rules: {
        default_margin: 0.12,
        min_margin: 5
      },
      risk_rules: {
        high_risk_partners: []
      }
    });

  if (cError) {
    console.error('Error creating config:', cError);
    return;
  }
  console.log('✅ System config initialized');

  console.log('🚀 Seeding complete!');
  console.log('\n--- Credentials for Testing ---');
  console.log('Tenant ID:', tenant.id);
  console.log('Admin Email: admin@travellounge.mu');
  console.log('-------------------------------');
}

seed();
