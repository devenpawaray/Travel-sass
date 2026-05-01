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

    // 1. Update Import Status
    await supabaseAdmin.from('raw_imports')
      .update({ status: 'rejected' })
      .eq('id', import_id);

    // 2. Update Approvals Queue
    await supabaseAdmin.from('approvals_queue')
      .update({ status: 'rejected', reviewer_id, notes })
      .eq('raw_import_id', import_id);

    // 3. Emit Event
    const { data: importRecord, error: importRecordError } = await supabaseAdmin.from('raw_imports').select('tenant_id').eq('id', import_id).single();

    if (importRecordError || !importRecord) {
      return NextResponse.json({ error: 'Import record not found' }, { status: 404 });
    }

    await eventService.emitEvent({
      tenant_id: importRecord.tenant_id,
      event_type: EVENT_TYPES.IMPORT_REJECTED,
      payload: { import_id, reviewer_id, notes }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Reject] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
