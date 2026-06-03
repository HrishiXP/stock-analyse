'use client';
import { QuickSignal } from '../../types/signal';
import { OpportunityScore } from './OpportunityScore';
import { useRouter } from 'next/navigation';

export function ScannerTable({ rows }: { rows: QuickSignal[] }) {
  const router = useRouter();
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
      <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-200">
        <thead className="bg-slate-900">
          <tr>
            <th className="px-4 py-3 text-left uppercase tracking-[0.2em] text-slate-500">Symbol</th>
            <th className="px-4 py-3 text-left uppercase tracking-[0.2em] text-slate-500">Signal</th>
            <th className="px-4 py-3 text-left uppercase tracking-[0.2em] text-slate-500">Confidence</th>
            <th className="px-4 py-3 text-left uppercase tracking-[0.2em] text-slate-500">Opportunity</th>
            <th className="px-4 py-3 text-left uppercase tracking-[0.2em] text-slate-500">Sector</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {rows.map((row) => (
            <tr 
              key={row.symbol} 
              className="group cursor-pointer hover:bg-slate-900 transition-colors" 
              onClick={() => router.push(`/dashboard?symbol=${row.symbol}`)}
            >
              <td className="px-4 py-4 font-bold text-slate-100 group-hover:text-emerald-400">
                {row.symbol}
              </td>
              <td className="px-4 py-4">
                <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${
                  row.signal.includes('BUY') || row.signal.includes('BULL') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                  row.signal.includes('SELL') || row.signal.includes('BEAR') ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                  'bg-slate-800 text-slate-400'
                }`}>
                  {row.signal.replaceAll('_', ' ')}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-12 rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${row.confidence}%` }} />
                  </div>
                  <span>{row.confidence}%</span>
                </div>
              </td>
              <td className="px-4 py-4"><OpportunityScore score={row.opportunity_score} /></td>
              <td className="px-4 py-4 text-slate-400">{row.sector}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
