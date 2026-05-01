import { supabaseAdmin } from '@/lib/supabase';

export interface CreateAuditLogParams {
  tenant_id: string;
  entity_type: string;
  entity_id: string;
  snapshot: any;
}

export const auditService = {
  /**
   * Generates an immutable snapshot of an entity for auditing purposes.
   * Required for every confirmed booking or financial state change.
   */
  async createSnapshot({ tenant_id, entity_type, entity_id, snapshot }: CreateAuditLogParams) {
    console.log(`[AuditService] Creating snapshot for ${entity_type}:${entity_id}`);
    
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        tenant_id,
        entity_type,
        entity_id,
        snapshot
      })
      .select()
      .single();

    if (error) {
      console.error(`[AuditService] Error creating audit log: ${error.message}`);
      throw error;
    }

    return data;
  }
};
