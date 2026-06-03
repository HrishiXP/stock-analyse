'use client';
import { FOSignal } from '../../types/signal';
import { ConfidenceGauge } from '../charts/ConfidenceGauge';
import { SignalRadarChart } from '../charts/SignalRadarChart';
import { GreeksPanel } from './GreeksPanel';
import { CatalystsTimeline } from './CatalystsTimeline';
import { RiskScenariosPanel } from './RiskScenariosPanel';

export function SignalCard({ signal }: { signal: FOSignal }) {
  const formatNumber = (value: number | undefined | null) => (typeof value === 'number' ? value.toFixed(2) : 'N/A');
  const entryRange = signal.entry_range ?? { min: null, max: null };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl shadow-slate-950/20">
      <div className="mb-5 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="text-3xl font-bold text-slate-100">{signal.symbol}</div>
          <div className="mt-2 inline-flex rounded-full bg-slate-800 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-emerald-400 border border-emerald-500/20">{signal.signal}</div>
          <blockquote className="mt-4 rounded-3xl border border-slate-800 bg-slate-950 px-5 py-4 italic text-slate-200 leading-relaxed shadow-inner">
            {signal.one_liner || 'No signal summary available.'}
          </blockquote>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
          <ConfidenceGauge value={signal.confidence} />
          {signal.analytics && <SignalRadarChart data={signal.analytics} />}
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-center items-center text-center">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Primary Strike</div>
          <div className={`text-4xl font-black tracking-tighter ${signal.signal.includes('CALL') ? 'text-emerald-400' : signal.signal.includes('PUT') ? 'text-rose-400' : 'text-blue-400'}`}>
            {signal.suggested_strike}
          </div>
          <div className="mt-2 text-xs font-mono text-slate-500 uppercase">{signal.option_type} • {signal.expiry}</div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Entry Range</div>
          <div className="mt-2 text-lg font-semibold text-slate-100">{formatNumber(entryRange.min)} - {formatNumber(entryRange.max)}</div>
          <div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">Stop Loss</div>
          <div className="mt-1 text-lg font-semibold text-rose-400">{formatNumber(signal.stop_loss)}</div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Profit Targets</div>
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20">T1</span>
              <span className="text-lg font-bold text-slate-100">{formatNumber(signal.target_1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20">T2</span>
              <span className="text-lg font-bold text-slate-100">{formatNumber(signal.target_2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20">T3</span>
              <span className="text-lg font-bold text-slate-100">{formatNumber(signal.target_3)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Risk:Reward', signal.risk_reward_ratio],
          ['Max Loss %', `${signal.max_loss_percent}%`],
          ['Option Type', signal.option_type],
          ['Conviction', signal.conviction],
          ['Thesis', signal.thesis_strength ?? 'N/A'],
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
        {signal.strategy_rationale && (
          <div className="mb-4">
            <div className="text-sm font-semibold text-emerald-400 font-mono uppercase tracking-wider">Strategy Rationale</div>
            <p className="mt-2 text-slate-400 leading-relaxed">{signal.strategy_rationale}</p>
          </div>
        )}
        {signal.direct_buy_alternative && (
          <div className="mb-4 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 shadow-lg shadow-blue-500/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Naked Buy Suggestion</div>
                <div className="mt-1 text-2xl font-black text-blue-50 text-shadow-sm font-mono">{signal.direct_buy_alternative}</div>
              </div>
              <div className="rounded-full bg-blue-500/20 px-3 py-1 text-[10px] font-bold text-blue-400 border border-blue-500/30 uppercase">DIRECT ENTRY</div>
            </div>
          </div>
        )}
        <div className="text-sm font-semibold">Position sizing</div>
        <p className="mt-2 text-slate-400">{signal.position_sizing}</p>
        <div className="mt-4 text-sm font-semibold">Holding guidance</div>
        <p className="mt-2 text-slate-400">{signal.holding_till}</p>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4 text-slate-200">
          <div className="text-sm font-semibold text-slate-100">Execution Framework</div>
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Setup Quality</div>
              <p className="mt-1 text-sm text-slate-300">{signal.setup_quality ?? 'N/A'}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Price Structure</div>
              <p className="mt-1 text-sm text-slate-300">{signal.price_structure ?? 'N/A'}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Entry Trigger</div>
              <p className="mt-1 text-sm text-slate-300">{signal.entry_trigger ?? 'N/A'}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Invalidation</div>
              <p className="mt-1 text-sm text-rose-300">{signal.invalidation_rule ?? 'N/A'}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">What Changes My Mind</div>
              <p className="mt-1 text-sm text-amber-300">{signal.what_changes_my_mind ?? 'N/A'}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Liquidity Note</div>
              <p className="mt-1 text-sm text-slate-300">{signal.liquidity_note ?? 'N/A'}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Hedge Plan</div>
              <p className="mt-1 text-sm text-slate-300">{signal.hedge_plan ?? 'N/A'}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4 text-slate-200">
          <div className="text-sm font-semibold text-slate-100">Checklist And Watchlist</div>
          <div className="mt-4 grid gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Confirmation Signals</div>
              <div className="mt-2 space-y-2">
                {(signal.confirmation_signals?.length ? signal.confirmation_signals : ['No confirmation signals provided.']).map((item, index) => (
                  <div key={`${item}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300">{item}</div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Execution Checklist</div>
              <div className="mt-2 space-y-2">
                {(signal.execution_checklist?.length ? signal.execution_checklist : ['No execution checklist provided.']).map((item, index) => (
                  <div key={`${item}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300">{item}</div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Event Watchlist</div>
              <div className="mt-2 space-y-2">
                {(signal.event_watchlist?.length ? signal.event_watchlist : ['No event watchlist items provided.']).map((item, index) => (
                  <div key={`${item}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">{signal.disclaimer}</p>
    </section>
  );
}
