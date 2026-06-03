'use client';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const sampleData = [
  { time: '08:00', score: 0.2 },
  { time: '10:00', score: 0.35 },
  { time: '12:00', score: 0.1 },
  { time: '14:00', score: 0.4 },
  { time: '16:00', score: 0.28 },
];

export function SentimentTrendChart() {
  return (
    <div className="h-72 rounded-3xl border border-slate-800 bg-slate-950 p-4">
      <div className="text-sm font-semibold text-slate-100">Sentiment Trend</div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={sampleData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sentiment" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#334155" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: '#94a3b8' }} />
          <YAxis tick={{ fill: '#94a3b8' }} domain={[0, 1]} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} itemStyle={{ color: '#fff' }} />
          <Area type="monotone" dataKey="score" stroke="#22c55e" fillOpacity={1} fill="url(#sentiment)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
