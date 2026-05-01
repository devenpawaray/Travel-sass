'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/state/auth.store';

export default function ApprovalsPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenantId } = useAuthStore();

  const fetchQueue = async () => {
    setLoading(true);
    const res = await fetch(`/api/approve/queue?tenant_id=${tenantId}`);
    const data = await res.json();
    setQueue(data);
    setLoading(false);
  };

  useEffect(() => {
    if (tenantId) fetchQueue();
  }, [tenantId]);

  const handleApprove = async (approvalId: string) => {
    // In the new architecture, approval is a state change
    await fetch('/api/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approval_id: approvalId, reviewer_id: 'SYSTEM_OPERATOR' })
    });
    fetchQueue();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-300 font-mono text-sm p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 border-b border-white/5 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Validation Gateway</h1>
            <p className="text-slate-500 uppercase text-[10px] tracking-widest mt-2">Status: Awaiting Human Oversight</p>
          </div>
          <div className="text-right">
            <span className="text-slate-600 block text-[9px] uppercase tracking-widest mb-1">Queue Depth</span>
            <span className="text-3xl font-light text-white">{queue.length}</span>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 opacity-50 animate-pulse uppercase tracking-widest">Scanning Queue...</div>
        ) : (
          <div className="grid gap-4">
            {queue.map((item) => (
              <div key={item.id} className="bg-[#0f0f12] border border-[#222] rounded-lg overflow-hidden flex divide-x divide-[#222]">
                {/* SOURCE DATA */}
                <div className="w-1/2 p-6 bg-black/20">
                  <span className="text-[9px] text-slate-600 uppercase font-bold tracking-widest block mb-4">RAW DATA SOURCE</span>
                  <div className="bg-slate-900/50 rounded p-4 border border-slate-800 font-mono text-[11px] text-slate-500 overflow-x-auto">
                    <pre>{JSON.stringify(item.raw_data, null, 2)}</pre>
                  </div>
                </div>

                {/* AI INTERPRETATION & ACTIONS */}
                <div className="w-1/2 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[9px] text-indigo-500 uppercase font-bold tracking-widest">Parsed Entity Identity</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">CONFIDENCE:</span>
                        <span className="text-emerald-400 font-bold">{Math.round(item.confidence * 100)}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] text-slate-600 uppercase block mb-1">Type</label>
                        <p className="text-xl text-white font-bold">{item.source_type || 'Unknown'}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-[9px] text-slate-600 uppercase block mb-1">Extracted Metadata</label>
                          <div className="bg-slate-900/30 p-3 rounded border border-slate-800 text-[11px] text-indigo-300">
                             <pre>{JSON.stringify(item.ai_data, null, 2)}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button className="flex-1 px-4 py-3 border border-slate-800 text-slate-500 uppercase text-[10px] font-black tracking-widest hover:bg-white/5 transition rounded">
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(item.id)}
                      className="flex-1 px-4 py-3 bg-white text-black uppercase text-[10px] font-black tracking-widest hover:bg-slate-200 transition rounded"
                    >
                      Authorize
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
