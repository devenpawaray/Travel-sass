import { supabaseAdmin } from '@/lib/supabase';
import { eventService } from './event.service';
import { EVENT_TYPES } from '@/constants/eventTypes';

export interface RawImportData {
  tenant_id: string;
  source_type: string;
  raw_payload: any;
}

export const importService = {
  /**
   * Processes raw data ingestion.
   * 1. Stores in raw_imports
   * 2. Emits RAW_IMPORT_CREATED event
   */
  async processImport({ tenant_id, source_type, raw_payload }: RawImportData) {
    // Simulate AI parsing (placeholder for actual logic)
    const ai_data = { ...raw_payload, _simulated_parsing: true };
    const confidence = 0.95;

    const { data: approval, error } = await supabaseAdmin
      .from('approvals')
      .insert({
        tenant_id,
        source_type,
        raw_data: raw_payload,
        ai_data,
        confidence,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Emit Event
    await eventService.emitEvent({
      tenant_id,
      event_type: EVENT_TYPES.RAW_IMPORT_CREATED,
      payload: approval
    });

    return approval;
  }
};
