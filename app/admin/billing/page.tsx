'use client';

import { useState } from 'react';

export default function BillingPage() {
  const plans = [
    { name: 'Starter', price: 49, features: ['100 Quotes/mo', 'Email Alerts', 'Basic Review Inbox'] },
    { name: 'Growth', price: 199, features: ['Unlimited Quotes', 'WhatsApp Alerts', 'Business Rules Engine', 'Emergency Stop'] },
    { name: 'Enterprise', price: 799, features: ['Multi-Branch Control', 'Custom Audit Logs', 'SLA Support', 'Dedicated Manager'] },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-mono text-sm p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-slate-200 pb-8">
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Subscription & Billing</h1>
          <p className="text-slate-500 uppercase text-[10px] tracking-widest mt-2">Manage your agency's SaaS tier</p>
        </header>

        <div className="grid grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className={`border rounded-lg p-6 flex flex-col ${plan.name === 'Growth' ? 'border-indigo-500 shadow-lg' : 'border-slate-200'}`}>
              <div className="mb-6">
                <h2 className="text-lg font-black uppercase">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black">${plan.price}</span>
                  <span className="text-slate-500 text-xs uppercase font-bold">/ month</span>
                </div>
              </div>
              
              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    {f}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 rounded uppercase text-[10px] font-black tracking-widest transition ${plan.name === 'Growth' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                {plan.name === 'Growth' ? 'Current Plan' : 'Upgrade Now'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-slate-50 border border-slate-200 rounded-lg p-6">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Payment Methods</h3>
          <div className="flex items-center gap-4 text-slate-400 italic text-xs">
            <span>Stripe Integration Pending...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
