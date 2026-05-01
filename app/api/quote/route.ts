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

    // 1. Fetch System State (Inventory)
    const { data: state, error: stateError } = await supabaseAdmin
      .from('system_state')
      .select('*')
      .eq('id', inventory_id)
      .single();

    if (stateError || !state) throw stateError || new Error('System state not found');

    // 2. Pricing Calculation (Simplified for MVP)
    const basePrice = state.data?.price || 0;
    const marginPercent = 0.12;
    const totalPrice = basePrice * (1 + marginPercent);
    const margin = totalPrice - basePrice;

    // 3. Create Quote (matching schema: customer_name, package_id, status, total_price, margin, snapshot)
    const { data: quote, error: quoteError } = await supabaseAdmin
      .from('quotes')
      .insert({
        tenant_id,
        package_id: state.id,
        total_price: totalPrice,
        margin: margin,
        status: 'created',
        customer_name: 'Walk-in Customer', // Default for MVP
        snapshot: {
          original_state: state,
          pricing: { basePrice, marginPercent, totalPrice }
        }
      })
      .select()
      .single();

    if (quoteError || !quote) throw quoteError || new Error('Quote creation failed');

    // 4. Emit Event
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
