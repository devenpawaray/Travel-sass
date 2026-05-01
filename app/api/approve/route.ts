import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { eventService } from '@/services/event.service';
import { EVENT_TYPES } from '@/constants/eventTypes';

export async function POST(req: Request) {
  try {
    const { import_id, reviewer_id } = await req.json();

    if (!import_id || !reviewer_id) {
      return NextResponse.json({ error: 'Missing import_id or reviewer_id' }, { status: 400 });
    }

    // 1. Update Approval Record
    const { data: approval, error: approvalError } = await supabaseAdmin
      .from('approvals')
      .update({ status: 'approved', reviewed_by: reviewer_id })
      .eq('id', import_id)
      .select()
      .single();

    if (approvalError || !approval) throw approvalError || new Error('Approval record not found');

    // 2. Insert into System State (Inventory)
    const { data: state, error: stateError } = await supabaseAdmin
      .from('system_state')
      .insert({
        tenant_id: approval.tenant_id,
        service_id: approval.id, // Linking back to the approval that created it
        state: 'active',
        data: approval.ai_data,
        version: 1
      })
      .select()
      .single();

    if (stateError || !state) throw stateError || new Error('State creation failed');

    // 3. Emit Event
    await eventService.emitEvent({
      tenant_id: approval.tenant_id,
      event_type: EVENT_TYPES.IMPORT_APPROVED,
      payload: { approval_id: approval.id, state_id: state.id }
    });

    return NextResponse.json({ success: true, state_id: state.id });
  } catch (error: any) {
    console.error('[API Approve] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
