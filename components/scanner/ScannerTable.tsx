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
        <tbody className="divide-y divide-slate-800">
          {rows.map((row) => (
            <tr key={row.symbol} className="cursor-pointer hover:bg-slate-900" onClick={() => router.push(`/analysis/${row.symbol}`)}>
              <td className="px-4 py-4 font-medium text-slate-100">{row.symbol}</td>
              <td className="px-4 py-4">{row.signal}</td>
              <td className="px-4 py-4">{row.confidence}%</td>
              <td className="px-4 py-4"><OpportunityScore score={row.opportunity_score} /></td>
              <td className="px-4 py-4">{row.sector}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
