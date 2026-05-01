import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export interface SystemEvent {
  tenant_id: string;
  event_type: string;
  payload: any;
  created_by?: string;
}

export const eventService = {
  /**
   * The Central Nervous System for all mutations.
   * Ensures:
   * 1. Event is recorded in append-only log.
   * 2. Audit log is created with hash chaining.
   * 3. State update is triggered (optionally).
   */
  async emitEvent(event: SystemEvent) {
    try {
      // 1. Record the Event
      const { data: eventData, error: eventError } = await supabaseAdmin
        .from('events')
        .insert({
          tenant_id: event.tenant_id,
          event_type: event.event_type,
          payload: event.payload,
          created_by: event.created_by
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // 2. Hash Chaining for Audit Log
      // Fetch the last audit log for this tenant
      const { data: lastAudit } = await supabaseAdmin
        .from('audit_logs')
        .select('current_hash')
        .eq('tenant_id', event.tenant_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const previousHash = lastAudit?.current_hash || '0'.repeat(64);
      const contentToHash = JSON.stringify({
        tenant_id: event.tenant_id,
        action: event.event_type,
        payload: event.payload,
        previous_hash: previousHash,
        timestamp: new Date().toISOString()
      });

      const currentHash = crypto.createHash('sha256').update(contentToHash).digest('hex');

      // 3. Create Audit Log
      await supabaseAdmin.from('audit_logs').insert({
        tenant_id: event.tenant_id,
        action: event.event_type,
        entity_type: 'event',
        entity_id: eventData.id,
        after: event.payload,
        previous_hash: previousHash,
        current_hash: currentHash
      });

      return eventData;
    } catch (error) {
      console.error('[EventService] Fatal Error:', error);
      throw error;
    }
  }
};
