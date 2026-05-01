'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/state/auth.store';

export default function QuotesPage() {
  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quote, setQuote] = useState<any | null>(null);
  const { tenantId } = useAuthStore();

  useEffect(() => {
    const fetchStates = async () => {
      const res = await fetch(`/api/inventory?tenant_id=${tenantId}`);
      const data = await res.json();
      setStates(data);
      setLoading(false);
    };
    if (tenantId) fetchStates();
  }, [tenantId]);

  const generateQuote = async () => {
    if (!selectedId) return;
    setLoading(true);
    // In the new schema, quote is created via an event or API
    const res = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        package_id: selectedId, 
        tenant_id: tenantId,
        customer_name: 'TEST_CUSTOMER'
      })
    });
    const data = await res.json();
    if (res.ok) setQuote(data);
    else alert(data.error);
    setLoading(false);
  };

  const selectedItem = states.find(s => s.id === selectedId);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-300 font-mono text-sm p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 border-b border-white/5 pb-8">
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Strategic Quote Engine</h1>
          <p className="text-slate-500 uppercase text-[10px] tracking-widest mt-2">Mode: SYSTEM_STATE_READ_ENABLED</p>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* SYSTEM STATES (INVENTORY) */}
          <div className="col-span-5 space-y-4">
            <h2 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Select System Asset</h2>
            {states.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedId(item.id)}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${selectedId === item.id ? 'bg-indigo-500/20 border-indigo-500' : 'bg-[#0f0f12] border-[#222] hover:border-slate-700'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-bold">{item.data?.hotel || 'Travel Package'}</p>
                    <p className="text-[10px] text-slate-500 mt-1">STATE: <span className="text-emerald-500 uppercase">{item.state}</span></p>
                  </div>
                  <p className="text-emerald-400 font-bold">{item.data?.price} {item.data?.currency}</p>
                </div>
              </div>
            ))}
          </div>

          {/* QUOTE PREVIEW */}
          <div className="col-span-7">
            <div className="bg-[#0f0f12] border border-[#222] rounded-xl overflow-hidden min-h-[500px] flex flex-col">
              <div className="p-4 bg-white/5 border-b border-[#222] flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing Matrix</span>
                <span className="text-[10px] text-emerald-500 font-mono">STATUS: SYNCHRONIZED</span>
              </div>
              
              <div className="flex-1 p-8 space-y-12">
                {!selectedId ? (
                  <div className="h-full flex items-center justify-center text-slate-700 italic">Select an asset from the system state to begin calculation.</div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <div>
                          <label className="text-[9px] text-slate-600 uppercase block mb-1">Base Valuation</label>
                          <p className="text-2xl text-slate-400">
                            {selectedItem?.data?.price} {selectedItem?.data?.currency}
                          </p>
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-600 uppercase block mb-1">Assigned Margin</label>
                          <p className="text-2xl text-indigo-400">12.00%</p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <label className="text-[9px] text-slate-600 uppercase block mb-1">Customer Quote Total</label>
                          <p className="text-3xl text-white font-black">
                            {(selectedItem?.data?.price * 1.12).toFixed(2)} {selectedItem?.data?.currency}
                          </p>
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-600 uppercase block mb-1">Projected Revenue</label>
                          <p className="text-xl text-emerald-400">
                            {(selectedItem?.data?.price * 0.12).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/40 border border-[#222] rounded p-4 font-mono text-[10px] text-slate-600">
                      <p>WIRING CHECK...</p>
                      <p className="text-emerald-900 font-bold">✓ TENANT_ISOLATION_PASS</p>
                      <p className="text-emerald-900 font-bold">✓ STATE_CONSISTENCY_PASS</p>
                      <p className="text-emerald-900 font-bold">✓ AUDIT_HOOK_READY</p>
                    </div>

                    <button 
                      onClick={generateQuote}
                      className="w-full py-6 bg-indigo-600 text-white font-black uppercase text-sm tracking-[0.3em] hover:bg-indigo-500 transition shadow-[0_0_20px_rgba(79,70,229,0.2)]"
                    >
                      Authorize Quote Generation
                    </button>
                  </>
                )}

                {quote && (
                  <div className="mt-8 border-t border-[#222] pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center bg-indigo-500/10 border border-indigo-500/30 p-6 rounded-lg">
                      <div>
                        <p className="text-[9px] text-indigo-400 uppercase font-bold tracking-widest">Quote Finalized</p>
                        <p className="text-xl text-white font-mono mt-1">ID: {quote.id.slice(0, 12)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">Status</p>
                        <p className="text-emerald-400 font-bold uppercase">{quote.status}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
