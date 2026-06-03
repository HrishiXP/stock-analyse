'use client';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function NewsVolumeChart({ news }: { news: any[] }) {
  const sources = news.reduce((acc: any, curr: any) => {
    const s = curr.source || 'Other';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(sources).map(([source, count]) => ({ source, count }));

  if (!news.length) return null;

  return (
    <div className="h-48 rounded-3xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="text-sm font-semibold text-slate-400 mb-2">Sources Distribution</div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <XAxis dataKey="source" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }} 
            itemStyle={{ color: '#fff' }} 
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
