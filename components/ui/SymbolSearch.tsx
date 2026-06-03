'use client';
import { useState } from 'react';
import { FNO_SYMBOLS } from '../../lib/nseSymbols';

export function SymbolSearch({ onSelect }: { onSelect: (symbol: string) => void }) {
  const [query, setQuery] = useState('');
  const filtered = FNO_SYMBOLS.filter((symbol) => symbol.includes(query.toUpperCase())).slice(0, 12);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
      <label className="text-sm uppercase tracking-[0.24em] text-slate-400">Symbol lookup</label>
      <div className="mt-3 flex gap-2">
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-slate-500" placeholder="Search RELIANCE, NIFTY..." />
        <button onClick={() => onSelect(query.toUpperCase())} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-slate-950">Go</button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {filtered.map((symbol) => (
          <button key={symbol} onClick={() => onSelect(symbol)} className="rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800">
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
}
