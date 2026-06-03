'use client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export function SignalRadarChart({ data }: { data?: { momentum: number; volatility: number; liquidity: number; trend: number; event_risk: number; macro: number } }) {
  const chartData = [
    { subject: 'Momentum', A: data?.momentum ?? 50 },
    { subject: 'Volatility', A: data?.volatility ?? 50 },
    { subject: 'Liquidity', A: data?.liquidity ?? 50 },
    { subject: 'Trend', A: data?.trend ?? 50 },
    { subject: 'Event Risk', A: data?.event_risk ?? 50 },
    { subject: 'Macro', A: data?.macro ?? 50 },
  ];

  return (
    <div className="h-80 rounded-3xl border border-slate-800 bg-slate-950 p-4 shadow-lg">
      <div className="mb-2 text-sm font-semibold text-slate-100 uppercase tracking-widest">Signal Intelligence Radar</div>
      <ResponsiveContainer width="100%" height="85%">
        <RadarChart data={chartData} outerRadius="75%">
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
          <Radar dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
