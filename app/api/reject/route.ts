import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { eventService } from '@/services/event.service';
import { EVENT_TYPES } from '@/constants/eventTypes';

export async function POST(req: Request) {
  try {
    const { import_id, reviewer_id, notes } = await req.json();

    if (!import_id || !reviewer_id) {
      return NextResponse.json({ error: 'Missing import_id or reviewer_id' }, { status: 400 });
    }

    // 1. Update Approval Record
    const { data: approval, error: approvalError } = await supabaseAdmin
      .from('approvals')
      .update({ status: 'rejected', reviewed_by: reviewer_id })
      .eq('id', import_id)
      .select()
      .single();

    if (approvalError || !approval) throw approvalError || new Error('Approval record not found');

    // 2. Emit Event
    await eventService.emitEvent({
      tenant_id: approval.tenant_id,
      event_type: EVENT_TYPES.IMPORT_REJECTED,
      payload: { approval_id: approval.id, reviewer_id, notes }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Reject] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
