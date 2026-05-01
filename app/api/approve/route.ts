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

    // 1. Update Import Status
    const { data: importRecord, error: importError } = await supabaseAdmin
      .from('raw_imports')
      .update({ status: 'approved' })
      .eq('id', import_id)
      .select()
      .single();

    if (importError || !importRecord) throw importError || new Error('Import record not found');

    // 2. Update Approvals Queue
    await supabaseAdmin.from('approvals_queue')
      .update({ status: 'approved', reviewer_id })
      .eq('raw_import_id', import_id);

    // 3. Move to Inventory Master
    const { data: inventory, error: invError } = await supabaseAdmin
      .from('inventory_master')
      .insert({
        tenant_id: importRecord.tenant_id,
        service_type: importRecord.source_type,
        base_price: importRecord.parsed_json.price || 0,
        currency: importRecord.parsed_json.currency || 'USD',
        status: 'active'
      })
      .select()
      .single();

    if (invError || !inventory) throw invError || new Error('Inventory creation failed');

    // 4. Emit Event
    await eventService.emitEvent({
      tenant_id: importRecord.tenant_id,
      event_type: EVENT_TYPES.IMPORT_APPROVED,
      payload: { import_id, inventory_id: inventory.id }
    });

    return NextResponse.json({ success: true, inventory_id: inventory.id });
  } catch (error: any) {
    console.error('[API Approve] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
