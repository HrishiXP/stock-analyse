'use client';

const cues = [
  { label: 'SGX', value: 'Nifty +0.4%' },
  { label: 'Crude', value: '86.8 USD' },
  { label: 'DXY', value: '105.2' },
  { label: 'US500', value: '+0.7%' },
];

export function GlobalCuesStrip() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {cues.map((item) => (
        <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300">
          <div className="font-semibold text-slate-100">{item.label}</div>
          <div>{item.value}</div>
        </div>
      ))}
    </div>
  );
}
