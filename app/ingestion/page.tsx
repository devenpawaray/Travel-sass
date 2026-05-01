'use client';

import { useState } from 'react';
import { useAuthStore } from '@/state/auth.store';

export default function IngestionPage() {
  const [loading, setLoading] = useState(false);
  const { tenantId } = useAuthStore();
  const [payload, setPayload] = useState('{\n  "hotel": "Lux Grand Gaube",\n  "price": 15500,\n  "currency": "MUR"\n}');

  const handleImport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          source_type: 'Manual JSON Entry',
          raw_payload: JSON.parse(payload)
        })
      });
      if (res.ok) {
        alert('Mission Data Ingested Successfully');
      }
    } catch (e) {
      alert('Ingestion Error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-300 font-mono text-sm p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Data Ingestion Terminal</h1>
          <p className="text-slate-500 uppercase text-[10px] tracking-widest mt-2">Source: MANUAL_OVERRIDE_ENABLED</p>
        </header>

        <div className="grid gap-8">
          {/* IMPORT OPTIONS */}
          <div className="grid grid-cols-3 gap-4">
            <button className="p-8 border border-[#222] rounded-xl bg-[#0f0f12] hover:border-indigo-500/50 transition group">
              <span className="block text-[10px] text-slate-600 mb-2 uppercase font-bold tracking-widest group-hover:text-indigo-400">Sync API</span>
              <span className="text-white font-bold uppercase tracking-tight">Partner Feed</span>
            </button>
            <button className="p-8 border border-indigo-500/30 rounded-xl bg-indigo-500/5 hover:border-indigo-500 transition group ring-1 ring-indigo-500/10">
              <span className="block text-[10px] text-indigo-400 mb-2 uppercase font-bold tracking-widest">Active Input</span>
              <span className="text-white font-bold uppercase tracking-tight">Manual Payload</span>
            </button>
            <button className="p-8 border border-[#222] rounded-xl bg-[#0f0f12] hover:border-indigo-500/50 transition group">
              <span className="block text-[10px] text-slate-600 mb-2 uppercase font-bold tracking-widest group-hover:text-indigo-400">Process PDF</span>
              <span className="text-white font-bold uppercase tracking-tight">Document OCR</span>
            </button>
          </div>

          {/* PAYLOAD EDITOR */}
          <div className="bg-[#0f0f12] border border-[#222] rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-white/5 border-b border-[#222] flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">RAW_PAYLOAD_EDITOR</span>
              <span className="text-[10px] text-slate-600 font-mono">STATUS: VALID_JSON</span>
            </div>
            <div className="p-0">
              <textarea 
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="w-full h-64 bg-transparent p-6 font-mono text-indigo-300 outline-none resize-none placeholder:text-slate-800"
                spellCheck="false"
              />
            </div>
            <div className="p-6 border-t border-[#222] bg-white/5">
              <button 
                onClick={handleImport}
                disabled={loading}
                className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-200 transition disabled:opacity-50"
              >
                {loading ? 'Processing Mission Data...' : 'Commit to Ingestion Pipeline'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
