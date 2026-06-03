'use client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const sampleData = [
  { subject: 'Momentum', A: 70 },
  { subject: 'Volatility', A: 50 },
  { subject: 'Liquidity', A: 60 },
  { subject: 'Trend', A: 65 },
  { subject: 'Event Risk', A: 55 },
  { subject: 'Macro', A: 60 },
];

export function SignalRadarChart() {
  return (
    <div className="h-80 rounded-3xl border border-slate-800 bg-slate-950 p-4">
      <div className="text-sm font-semibold text-slate-100">Signal Radar</div>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={sampleData} outerRadius="80%">
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
          <Radar dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
