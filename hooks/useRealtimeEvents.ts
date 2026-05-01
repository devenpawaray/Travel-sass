import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSystemStore } from '@/state/system.store';
import { useAuthStore } from '@/state/auth.store';

export function useRealtimeEvents() {
  const addEvent = useSystemStore((state) => state.addEvent);
  const tenantId = useAuthStore((state) => state.tenantId);

  useEffect(() => {
    if (!tenantId) return;

    console.log('[Realtime] Subscribing to events for tenant:', tenantId);

    const channel = supabase
      .channel('system_events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
          filter: `tenant_id=eq.${tenantId}`
        },
        (payload) => {
          console.log('[Realtime] New event received:', payload.new);
          addEvent(payload.new as any);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, addEvent]);
}
