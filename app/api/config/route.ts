import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenant_id = searchParams.get('tenant_id');

    if (!tenant_id) {
      return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 });
    }

    let { data: config, error } = await supabaseAdmin
      .from('org_config')
      .select('*')
      .eq('tenant_id', tenant_id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Create default config if missing
      const { data: newConfig, error: createError } = await supabaseAdmin
        .from('org_config')
        .insert({
          tenant_id,
          commission_rules: { hotels: 12, flights: 5, packages: 15 },
          risk_rules: { max_volatility: 10 },
          timing_rules: { quote_expiry: 48 }
        })
        .select()
        .single();
      
      if (createError) throw createError;
      config = newConfig;
    } else if (error) {
      throw error;
    }

    return NextResponse.json(config);
  } catch (error: any) {
    console.error('[API Config] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { tenant_id, config } = await req.json();

    const { data, error } = await supabaseAdmin
      .from('org_config')
      .update(config)
      .eq('tenant_id', tenant_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
