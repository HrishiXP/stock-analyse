'use client';
import { FOSignal } from '../../types/signal';

export function RiskScenariosPanel({ scenarios }: { scenarios: FOSignal['risk_scenarios'] }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
      <div className="text-sm font-semibold text-slate-100">Risk Scenarios</div>
      <div className="mt-4 space-y-3">
        {scenarios.length ? scenarios.map((scenario, index) => (
          <div key={`${scenario.scenario}-${index}`} className="rounded-3xl border border-slate-800 bg-slate-900 p-3">
            <div className="font-semibold text-slate-100">{scenario.scenario}</div>
            <div className="mt-1 text-xs text-slate-400">Probability: {scenario.probability}</div>
            <div className="mt-1 text-xs text-slate-400">Impact: {scenario.signal_impact}</div>
          </div>
        )) : <div className="text-slate-500">No risk scenarios detected.</div>}
      </div>
    </div>
  );
}
