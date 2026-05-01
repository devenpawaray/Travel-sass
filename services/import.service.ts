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
    const parsed_json = { ...raw_payload, _simulated_parsing: true };
    const confidence_score = 0.95;

    const { data: rawImport, error } = await supabaseAdmin
      .from('raw_imports')
      .insert({
        tenant_id,
        source_type,
        raw_payload,
        parsed_json,
        confidence_score,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Emit Event
    await eventService.emitEvent({
      tenant_id,
      event_type: EVENT_TYPES.RAW_IMPORT_CREATED,
      payload: rawImport
    });

    // Create Approvals Queue record
    await supabaseAdmin
      .from('approvals_queue')
      .insert({
        tenant_id,
        raw_import_id: rawImport.id,
        status: 'pending'
      });

    return rawImport;
  }
};
