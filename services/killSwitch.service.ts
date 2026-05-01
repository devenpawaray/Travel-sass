import { supabaseAdmin } from '@/lib/supabase';
import { eventService } from './event.service';
import { EVENT_TYPES } from '@/constants/eventTypes';

export const killSwitchService = {
  /**
   * Triggers the global kill switch for a tenant.
   * This immediately:
   * 1. Sets kill_switch_active to true in org_config.
   * 2. Invalidates all active quotes (sets them to 'invalidated').
   * 3. Pauses all system states.
   * 4. Emits a KILL_SWITCH_TRIGGERED event.
   */
  async activate(tenant_id: string) {
    try {
      // 1. Update Org Config
      await supabaseAdmin
        .from('org_config')
        .update({ kill_switch_active: true })
        .eq('tenant_id', tenant_id);

      // 2. Invalidate Quotes
      await supabaseAdmin
        .from('quotes')
        .update({ status: 'invalidated' })
        .eq('tenant_id', tenant_id)
        .eq('status', 'created');

      // 3. Pause System States
      await supabaseAdmin
        .from('system_state')
        .update({ state: 'paused' })
        .eq('tenant_id', tenant_id)
        .eq('state', 'active');

      // 4. Emit Event
      await eventService.emitEvent({
        tenant_id,
        event_type: 'KILL_SWITCH_TRIGGERED',
        payload: { timestamp: new Date().toISOString() }
      });

      return { success: true };
    } catch (error) {
      console.error('[KillSwitch] Error:', error);
      throw error;
    }
  },

  async deactivate(tenant_id: string) {
    await supabaseAdmin
      .from('org_config')
      .update({ kill_switch_active: false })
      .eq('tenant_id', tenant_id);

    return { success: true };
  }
};
