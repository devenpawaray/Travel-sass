'use client';

import { useEffect, useState } from 'react';
import { useSystemStore } from '@/state/system.store';
import { useAuthStore } from '@/state/auth.store';
import { useRealtimeEvents } from '@/hooks/useRealtimeEvents';

export default function AdminDashboard() {
  const { events, setEvents, killSwitch, riskLevel } = useSystemStore();
  const [alerts, setAlerts] = useState<any[]>([]);
  const { tenantId } = useAuthStore();
  
  // Connect to live stream
  useRealtimeEvents();

  const fetchData = async () => {
    const [eventsRes, alertsRes] = await Promise.all([
      fetch(`/api/events?tenant_id=${tenantId}`),
      fetch(`/api/alerts?tenant_id=${tenantId}`)
    ]);
    const eventsData = await eventsRes.json();
    const alertsData = await alertsRes.json();
    setEvents(eventsData);
    setAlerts(alertsData);
  };

  useEffect(() => {
    if (tenantId) fetchData();
  }, [tenantId]);

  const triggerKillSwitch = async () => {
    if (confirm('CRITICAL: Execute System Freeze?')) {
      await fetch('/api/kill-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId, reason: 'Emergency Shutdown' })
      });
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-mono text-sm p-4">
      {/* SYSTEM STATUS BAR */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 bg-slate-50 p-4 rounded-lg">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Events</span>
            <span className="text-xl font-bold text-slate-900">{events.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">System Alerts</span>
            <span className="text-xl font-bold text-red-400">{alerts.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Risk Level</span>
            <span className={`text-xl font-bold ${riskLevel === 'LOW' ? 'text-emerald-400' : 'text-red-400'}`}>{riskLevel}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Kill Switch</span>
            <span className={`text-xl font-bold ${killSwitch ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>{killSwitch ? 'ACTIVE' : 'READY'}</span>
          </div>
        </div>
        <button 
          onClick={triggerKillSwitch}
          className="bg-red-950/30 border border-red-500/50 text-red-500 px-6 py-2 rounded uppercase text-xs font-black tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]"
        >
          Terminate Operations
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* EVENT STREAM (Left) */}
        <div className="col-span-8 bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col h-[700px]">
          <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="uppercase font-black text-xs tracking-widest text-slate-500">Live Mission Logs</h2>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[10px] text-slate-600">CONNECTED</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto font-mono text-[11px] p-2 space-y-1">
            {events.map((e) => (
              <div key={e.id} className="flex gap-4 p-2 hover:bg-slate-50 group border-b border-slate-100 transition-colors">
                <span className="text-slate-400">[{new Date(e.created_at).toLocaleTimeString()}]</span>
                <span className="text-indigo-400 font-bold w-40">{e.event_type}</span>
                <span className="text-slate-600 truncate flex-1">{JSON.stringify(e.payload)}</span>
                <span className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase text-[9px] cursor-pointer hover:text-indigo-600">Expand</span>
              </div>
            ))}
          </div>
        </div>

        {/* METRICS & ALERTS (Right) */}
        <div className="col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-4 h-[400px] flex flex-col">
            <h2 className="uppercase font-black text-xs tracking-widest text-slate-500 mb-4">Intelligence Alerts</h2>
            <div className="space-y-3 overflow-y-auto flex-1">
              {alerts.length === 0 ? (
                <p className="text-slate-700 italic text-center py-10">No active alerts.</p>
              ) : (
                alerts.map((a) => (
                  <div key={a.id} className={`border-l-2 ${a.severity === 'red' ? 'border-red-500 bg-red-500/5' : 'border-amber-500 bg-amber-500/5'} p-3 rounded-r`}>
                    <p className={`text-[11px] ${a.severity === 'red' ? 'text-red-200' : 'text-amber-200'}`}>{a.message}</p>
                    <span className="text-[9px] text-slate-600 uppercase font-bold">{new Date(a.created_at).toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h2 className="uppercase font-black text-xs tracking-widest text-slate-500 mb-4">Commercial Pulse</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-500">CONVERSION RATE</span>
                  <span className="text-emerald-400">8.4%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[64%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-500">MARGIN HEALTH</span>
                  <span className="text-indigo-400">14.2%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[78%] shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
