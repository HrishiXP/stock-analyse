'use client';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const sampleData = [
  { source: 'MC', count: 6 },
  { source: 'ET', count: 8 },
  { source: 'BS', count: 4 },
  { source: 'LM', count: 5 },
  { source: 'NSE', count: 7 },
];

export function NewsVolumeChart() {
  return (
    <div className="h-72 rounded-3xl border border-slate-800 bg-slate-950 p-4">
      <div className="text-sm font-semibold text-slate-100">News Volume</div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={sampleData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#334155" vertical={false} />
          <XAxis dataKey="source" tick={{ fill: '#94a3b8' }} />
          <YAxis tick={{ fill: '#94a3b8' }} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} itemStyle={{ color: '#fff' }} />
          <Bar dataKey="count" fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
