'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/state/auth.store';

export default function ConfigPage() {
  const { tenantId } = useAuthStore();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      fetch(`/api/config?tenant_id=${tenantId}`)
        .then(res => res.json())
        .then(data => {
          setConfig(data);
          setLoading(false);
        });
    }
  }, [tenantId]);

  const handleSave = async () => {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId, config })
    });
    alert('System Constitution Updated');
  };

  if (loading) return <div className="p-8 font-mono text-slate-500">Initializing Core Engine...</div>;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-mono text-sm p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 border-b border-slate-200 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">System Constitution</h1>
            <p className="text-slate-500 uppercase text-[10px] tracking-widest mt-2">Governance & Rule Engine Controller</p>
          </div>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest hover:bg-slate-800 transition rounded"
          >
            Update Constitution
          </button>
        </header>

        <div className="grid gap-8">
          {/* COMMISSION RULES */}
          <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h2 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Financial Rules (Commission 2)</h2>
            </div>
            <div className="p-6 space-y-4">
              {Object.entries(config.commission_rules || {}).map(([key, val]: [string, any]) => (
                <div key={key} className="flex items-center gap-4">
                  <span className="w-32 uppercase text-xs font-bold text-slate-500">{key}</span>
                  <input 
                    type="number" 
                    value={val}
                    step="0.01"
                    onChange={(e) => setConfig({
                      ...config,
                      commission_rules: { ...config.commission_rules, [key]: parseFloat(e.target.value) }
                    })}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded p-2 outline-none focus:border-indigo-500"
                  />
                  <span className="text-slate-400">%</span>
                </div>
              ))}
            </div>
          </section>

          {/* RISK THRESHOLDS */}
          <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h2 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Risk & Anomaly Detection</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2">Max Price Volatility (%)</label>
                <input 
                  type="number" 
                  value={config.risk_rules?.max_volatility || 10}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2">Auto-Invalidate Quoted After (Hours)</label>
                <input 
                  type="number" 
                  value={config.timing_rules?.quote_expiry || 48}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2"
                />
              </div>
            </div>
          </section>

          {/* SYSTEM STATE */}
          <section className={`border rounded-lg p-6 flex justify-between items-center ${config.kill_switch_active ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div>
              <h3 className={`font-bold uppercase ${config.kill_switch_active ? 'text-red-900' : 'text-emerald-900'}`}>
                System Operational Status: {config.kill_switch_active ? 'FREEZE' : 'ACTIVE'}
              </h3>
              <p className="text-xs text-slate-600 mt-1">Status affects all live quotes and state transitions.</p>
            </div>
            <div className={`h-3 w-3 rounded-full ${config.kill_switch_active ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
          </section>
        </div>
      </div>
    </div>
  );
}
