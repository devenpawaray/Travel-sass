import { supabaseAdmin } from '@/lib/supabase';
import { EventType } from '@/constants/eventTypes';

export interface CreateEventParams {
  tenant_id: string;
  event_type: EventType;
  payload: any;
}

export const eventService = {
  /**
   * Every mutation MUST call this.
   * Logs an event to the events table for traceability and downstream processing.
   */
  async emitEvent({ tenant_id, event_type, payload }: CreateEventParams) {
    console.log(`[EventService] Emitting event: ${event_type} for tenant: ${tenant_id}`);
    
    const { data, error } = await supabaseAdmin
      .from('events')
      .insert({
        tenant_id,
        event_type,
        payload
      })
      .select()
      .single();

    if (error) {
      console.error(`[EventService] Error emitting event: ${error.message}`);
      throw error;
    }

    return data;
  }
};
