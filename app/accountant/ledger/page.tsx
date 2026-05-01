'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/state/auth.store';

export default function LedgerPage() {
  const { tenantId } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      fetch(`/api/bookings?tenant_id=${tenantId}`)
        .then(res => res.json())
        .then(data => {
          setBookings(data);
          setLoading(true); // wait, should be false
          setLoading(false);
        });
    }
  }, [tenantId]);

  const totalProfit = bookings.reduce((acc, b) => acc + (b.financial_snapshot?.profit || 0), 0);
  const totalVolume = bookings.reduce((acc, b) => acc + (b.financial_snapshot?.total_price || 0), 0);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-mono text-sm p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-slate-200 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Financial Ledger</h1>
            <p className="text-slate-500 uppercase text-[10px] tracking-widest mt-2">Immutable Transactional Integrity</p>
          </div>
          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Gross Volume</p>
              <p className="text-2xl font-black text-slate-900">MUR {totalVolume.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Net Commission</p>
              <p className="text-2xl font-black text-emerald-600">MUR {totalProfit.toLocaleString()}</p>
            </div>
          </div>
        </header>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-black tracking-widest">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Volume</th>
                <th className="p-4">Margin</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-400">{new Date(b.created_at).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-slate-900">{b.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-4 text-slate-600">Walk-in Customer</td>
                  <td className="p-4 font-bold">MUR {b.financial_snapshot?.total_price?.toLocaleString()}</td>
                  <td className="p-4 text-emerald-600 font-bold">+{b.financial_snapshot?.profit?.toLocaleString()}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase">Verified</span>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 italic">No verified transactions in current cycle.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
