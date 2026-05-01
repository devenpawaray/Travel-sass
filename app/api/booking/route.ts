import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { eventService } from '@/services/event.service';
import { stateMachineService } from '@/services/stateMachine.service';
import { auditService } from '@/services/audit.service';
import { EVENT_TYPES } from '@/constants/eventTypes';
import { BOOKING_STATES } from '@/constants/states';

export async function POST(req: Request) {
  try {
    const { quote_id, tenant_id } = await req.json();

    if (!quote_id || !tenant_id) {
      return NextResponse.json({ error: 'Missing quote_id or tenant_id' }, { status: 400 });
    }

    // 1. Fetch Quote
    const { data: quote, error: quoteError } = await supabaseAdmin
      .from('quotes')
      .select('*, inventory_master(*)')
      .eq('id', quote_id)
      .single();

    if (quoteError) throw quoteError;

    if (quote.status === 'locked') {
        // Enforce state transition if already locked
    }

    // 2. Create Booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        tenant_id,
        quote_id,
        status: 'pending'
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // 3. Emit Event
    await eventService.emitEvent({
      tenant_id,
      event_type: EVENT_TYPES.BOOKING_CREATED,
      payload: booking
    });

    // 4. Create Audit Snapshot (Mandatory for transactions)
    await auditService.createSnapshot({
      tenant_id,
      entity_type: 'booking',
      entity_id: booking.id,
      snapshot: { booking, quote }
    });

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error('[API Booking] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
