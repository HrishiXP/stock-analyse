'use client';
import { FOSignal } from '../../types/signal';
import { ConfidenceGauge } from '../charts/ConfidenceGauge';
import { GreeksPanel } from './GreeksPanel';
import { CatalystsTimeline } from './CatalystsTimeline';
import { RiskScenariosPanel } from './RiskScenariosPanel';

export function SignalCard({ signal }: { signal: FOSignal }) {
  const formatNumber = (value: number | undefined | null) => (typeof value === 'number' ? value.toFixed(2) : 'N/A');
  const entryRange = signal.entry_range ?? { min: null, max: null };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl shadow-slate-950/20">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-2xl font-semibold text-slate-100">{signal.symbol}</div>
          <div className="mt-2 inline-flex rounded-full bg-slate-800 px-3 py-1 text-sm uppercase tracking-[0.24em] text-slate-300">{signal.signal}</div>
        </div>
        <ConfidenceGauge value={signal.confidence} />
      </div>
      <blockquote className="rounded-3xl border border-slate-800 bg-slate-950 px-5 py-4 italic text-slate-200">
        {signal.one_liner || 'No signal summary available.'}
      </blockquote>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Entry</div>
          <div className="mt-2 text-lg font-semibold text-slate-100">{formatNumber(entryRange.min)} - {formatNumber(entryRange.max)}</div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Targets</div>
          <div className="mt-2 space-y-1 text-slate-100">
            <div>{formatNumber(signal.target_1)}</div>
            <div>{formatNumber(signal.target_2)}</div>
            <div>{formatNumber(signal.target_3)}</div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Stop Loss</div>
          <div className="mt-2 text-lg font-semibold text-slate-100">{formatNumber(signal.stop_loss)}</div>
          <div className="mt-2 text-slate-400">R:R {signal.risk_reward_ratio ?? 'N/A'}</div>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Strike', signal.suggested_strike],
          ['Expiry', signal.expiry],
          ['Option Type', signal.option_type],
          ['Conviction', signal.conviction],
          ['VIX', signal.india_vix_view],
          ['Regime', signal.market_regime],
          ['PoS', `${signal.probability_of_success ?? 0}%`],
          ['Volatility', signal.expected_volatility_range ?? 'N/A'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
            <div className="mt-2 text-slate-100">{value}</div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <GreeksPanel
          greeks={
            signal.greeks ?? {
              delta_sensitivity: 'UNKNOWN',
              gamma_risk: 'UNKNOWN',
              theta_impact: 'UNKNOWN',
              vega_bias: 'UNKNOWN',
            }
          }
        />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <CatalystsTimeline catalysts={(signal.key_catalysts ?? []).slice(0, 4)} />
        <RiskScenariosPanel scenarios={(signal.risk_scenarios ?? []).slice(0, 3)} />
      </div>
      <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950 p-4 text-slate-200">
        <div className="text-sm font-semibold">Position sizing</div>
        <p className="mt-2 text-slate-400">{signal.position_sizing}</p>
        <div className="mt-4 text-sm font-semibold">Holding guidance</div>
        <p className="mt-2 text-slate-400">{signal.holding_till}</p>
      </div>
      <p className="mt-4 text-xs text-slate-500">{signal.disclaimer}</p>
    </section>
  );
}
