import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { eventService } from '@/services/event.service';
import { EVENT_TYPES } from '@/constants/eventTypes';

export async function POST(req: Request) {
  try {
    const { tenant_id, reason } = await req.json();

    if (!tenant_id) {
      return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 });
    }

    // 1. Lock all Inventory
    await supabaseAdmin
      .from('inventory_master')
      .update({ status: 'locked' })
      .eq('tenant_id', tenant_id);

    // 2. Lock all Quotes
    await supabaseAdmin
      .from('quotes')
      .update({ status: 'locked' })
      .eq('tenant_id', tenant_id);

    // 3. Emit System-wide Event
    await eventService.emitEvent({
      tenant_id,
      event_type: EVENT_TYPES.KILL_SWITCH_TRIGGERED,
      payload: { reason, timestamp: new Date().toISOString() }
    });

    return NextResponse.json({ success: true, status: 'SYSTEM_FROZEN' });
  } catch (error: any) {
    console.error('[API Kill Switch] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
