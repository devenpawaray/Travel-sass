import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { eventService } from '@/services/event.service';
import { pricingService } from '@/services/pricing.service';
import { rulesEngineService } from '@/services/rulesEngine.service';
import { EVENT_TYPES } from '@/constants/eventTypes';

export async function POST(req: Request) {
  try {
    const { inventory_id, tenant_id } = await req.json();

    if (!inventory_id || !tenant_id) {
      return NextResponse.json({ error: 'Missing inventory_id or tenant_id' }, { status: 400 });
    }

    // 1. Fetch Inventory & Config
    const { data: inventory, error: invError } = await supabaseAdmin
      .from('inventory_master')
      .select('*, partners(*)')
      .eq('id', inventory_id)
      .single();

    if (invError) throw invError;

    const { data: config } = await supabaseAdmin
      .from('system_config')
      .select('*')
      .eq('tenant_id', tenant_id)
      .single();

    // 2. Rules Engine Validation
    const evaluation = rulesEngineService.evaluateQuote(
      inventory, 
      inventory.partners || { risk_level: 'medium' }, 
      config || { min_margin: 10, risk_rules: { high_risk_partners: [] } }
    );

    if (!evaluation.allowed) {
      return NextResponse.json({ error: evaluation.reason }, { status: 400 });
    }

    // 3. Pricing Calculation
    const { price, profit_margin } = pricingService.calculatePrice(
      inventory, 
      config || { min_margin: 10 }
    );

    // 4. Create Quote
    const { data: quote, error: quoteError } = await supabaseAdmin
      .from('quotes')
      .insert({
        tenant_id,
        inventory_id,
        price,
        profit_margin,
        status: 'created'
      })
      .select()
      .single();

    if (quoteError) throw quoteError;

    // 5. Emit Event
    await eventService.emitEvent({
      tenant_id,
      event_type: EVENT_TYPES.QUOTE_CREATED,
      payload: quote
    });

    return NextResponse.json(quote);
  } catch (error: any) {
    console.error('[API Quote] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
