import React from 'react';
import {
  AssetCategory,
  AssetSymbol,
  RiskRewardRatio,
  SessionWindow,
  StrategyConfig,
  Timeframe,
} from '../../types';
import { ASSETS } from '../../data/assets';
import {
  Clock,
  Crosshair,
  Percent,
  SlidersHorizontal,
  Layers,
  TrendingUp,
  Box,
  ArrowRight,
  ShieldAlert,
  Coins,
  DollarSign,
  BarChart4,
  Flame,
} from 'lucide-react';

interface StrategyConfigPanelProps {
  config: StrategyConfig;
  onUpdateConfig: (updated: Partial<StrategyConfig>) => void;
  onRunBacktest: () => void;
  isSimulating: boolean;
}

export const StrategyConfigPanel: React.FC<StrategyConfigPanelProps> = ({
  config,
  onUpdateConfig,
  onRunBacktest,
  isSimulating,
}) => {
  const isNeeraj = config.model === 'neeraj-15m';

  const assetClasses: { id: AssetCategory; label: string; icon: any; symbols: AssetSymbol[] }[] = [
    {
      id: 'Indices',
      label: 'Indices & Stocks',
      icon: BarChart4,
      symbols: ['NIFTY50', 'BANKNIFTY'],
    },
    {
      id: 'Forex/Metals',
      label: 'Forex & Gold',
      icon: DollarSign,
      symbols: ['XAUUSD', 'EURUSD'],
    },
    {
      id: 'Crypto',
      label: 'Crypto Assets',
      icon: Coins,
      symbols: ['BTCUSDT'],
    },
  ];

  const timeframes: Timeframe[] = ['5m', '15m', '1h', '4h', '1D'];
  const rrRatios: RiskRewardRatio[] = [1.5, 2.0, 2.5, 3.0, 4.0];
  const sessions: { id: SessionWindow; label: string; desc: string }[] = [
    { id: 'london', label: 'London Session', desc: '08:00 - 16:30 UTC' },
    { id: 'ny', label: 'New York Session', desc: '13:00 - 21:00 UTC' },
    { id: 'asia', label: 'Asian Session', desc: '00:00 - 08:00 UTC' },
    { id: 'all', label: 'Full 24H Day', desc: 'No Session Filtering' },
    { id: 'custom', label: 'Custom Range', desc: 'Set explicit start/end' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Visual Pipeline Header */}
      <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-indigo-600" />
            <h3 className="font-display font-bold text-slate-900 text-base">
              No-Code Visual Strategy Constructor
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              MODULAR CARDS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Assemble algorithmic market filters, entry breakout triggers, and risk execution rules visually
          </p>
        </div>

        <button
          onClick={onRunBacktest}
          disabled={isSimulating}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSimulating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Compiling Engine...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Run Backtest Simulation
            </>
          )}
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* Visual Block 1: Asset Class & Symbol Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[11px] font-bold">1</span>
              Asset Class & Instrument Selection
            </span>
            <span className="text-xs text-slate-400">Supported: Crypto, Forex/Gold, Nifty/Indices</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {assetClasses.map((ac) => {
              const Icon = ac.icon;
              const hasActiveSymbol = ac.symbols.includes(config.symbol);

              return (
                <div
                  key={ac.id}
                  className={`p-4 rounded-xl border transition-all ${
                    hasActiveSymbol
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2 font-bold text-xs text-slate-800">
                    <Icon className="w-4 h-4 text-indigo-600" />
                    <span>{ac.label}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {ac.symbols.map((sym) => {
                      const isSelected = config.symbol === sym;
                      return (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => onUpdateConfig({ symbol: sym })}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {sym}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Block 2: Timeframe & Candle Window Validation */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[11px] font-bold">2</span>
              Timeframe & Candle Structure Window
            </span>
            <span className="text-xs text-slate-500">2-3 Candle Breakout / Retest Window</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-xs font-medium text-slate-600 block mb-2">
                Execution Timeframe:
              </span>
              <div className="grid grid-cols-5 gap-1.5 bg-slate-100 p-1 rounded-lg">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => onUpdateConfig({ timeframe: tf })}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                      config.timeframe === tf
                        ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/90'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-600 block mb-2">
                Breakout Validation Window:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4].map((window) => (
                  <button
                    key={window}
                    type="button"
                    onClick={() => onUpdateConfig({ candleWindow: window })}
                    className={`p-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      config.candleWindow === window
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {window} Candles Window
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Block 3: Risk-to-Reward & Invalidation Controls */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[11px] font-bold">3</span>
              Risk-to-Reward & Daily Discipline Controls
            </span>
            <span className="text-xs text-slate-500">1:2 / 1:3 RR & Daily Limits</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Target RR */}
            <div>
              <span className="text-xs font-medium text-slate-600 block mb-2">
                Target Risk-to-Reward (1 : R)
              </span>
              <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-lg">
                {rrRatios.map((rr) => (
                  <button
                    key={rr}
                    type="button"
                    onClick={() => onUpdateConfig({ riskReward: rr })}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                      config.riskReward === rr
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    1:{rr}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Daily Trades */}
            <div>
              <span className="text-xs font-medium text-slate-600 block mb-2">
                Max Daily Trades Limit (Discipline Guard)
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[2, 3, 4, 6].map((limit) => (
                  <button
                    key={limit}
                    type="button"
                    onClick={() => onUpdateConfig({ maxDailyTrades: limit })}
                    className={`py-1.5 text-xs font-semibold rounded-lg border text-center transition-all ${
                      config.maxDailyTrades === limit
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {limit} Trades
                  </button>
                ))}
              </div>
            </div>

            {/* Move to BE toggle */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">
                  Move SL to Break-Even at 1R
                </span>
                <input
                  type="checkbox"
                  checked={config.trailingStop}
                  onChange={(e) => onUpdateConfig({ trailingStop: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Protects capital by locking trade to entry as soon as 1R profit is touched.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Block 4: Session Filter Windows */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[11px] font-bold">4</span>
              Session Windows (London, New York, Asian, Full Day)
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <span>Filter Session</span>
              <input
                type="checkbox"
                checked={config.sessionFilterEnabled}
                onChange={(e) => onUpdateConfig({ sessionFilterEnabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {sessions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onUpdateConfig({ sessionWindow: s.id })}
                className={`p-3 rounded-lg text-left border transition-all ${
                  config.sessionWindow === s.id
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold text-xs text-slate-900">{s.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
