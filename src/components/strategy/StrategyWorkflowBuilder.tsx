import React, { useState } from 'react';
import {
  AssetCategory,
  AssetSymbol,
  RiskRewardRatio,
  SessionWindow,
  StopLossMethod,
  StrategyConfig,
  StrategyType,
  Timeframe,
} from '../../types';
import { ASSETS } from '../../data/assets';
import { STRATEGY_DETAILS } from '../../data/presets';
import {
  Layers,
  ArrowRight,
  TrendingUp,
  Shield,
  Clock,
  Sparkles,
  GripVertical,
  CheckCircle2,
  Sliders,
  DollarSign,
  BarChart4,
  Coins,
  Flame,
  Crown,
  ChevronDown,
  ChevronUp,
  Check,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface StrategyWorkflowBuilderProps {
  config: StrategyConfig;
  onUpdateConfig: (updated: Partial<StrategyConfig>) => void;
  onSelectModel: (model: StrategyType) => void;
  onRunBacktest: () => void;
  isSimulating: boolean;
}

export const StrategyWorkflowBuilder: React.FC<StrategyWorkflowBuilderProps> = ({
  config,
  onUpdateConfig,
  onSelectModel,
  onRunBacktest,
  isSimulating,
}) => {
  const isNeeraj = config.model === 'neeraj-15m';

  // State to track block expansion
  const [expandedBlocks, setExpandedBlocks] = useState<{ [key: string]: boolean }>({
    assetTimeframe: true,
    entryRules: true,
    riskManagement: true,
  });

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks((prev) => ({ ...prev, [blockId]: !prev[blockId] }));
  };

  const assetList: { symbol: AssetSymbol; label: string; sub: string; category: AssetCategory }[] = [
    { symbol: 'NIFTY50', label: 'NIFTY 50', sub: 'Indian Benchmark Index', category: 'Indices' },
    { symbol: 'XAUUSD', label: 'XAUUSD Gold', sub: 'Spot Gold / USD ($/oz)', category: 'Forex/Metals' },
    { symbol: 'BTCUSDT', label: 'BTCUSDT', sub: 'Bitcoin / Tether USD', category: 'Crypto' },
    { symbol: 'EURUSD', label: 'EURUSD', sub: 'Euro / US Dollar', category: 'Forex/Metals' },
    { symbol: 'BANKNIFTY', label: 'BANK NIFTY', sub: 'Indian Banking Index', category: 'Indices' },
  ];

  const timeframes: { tf: Timeframe; label: string; desc: string }[] = [
    { tf: '1m', label: '1m', desc: 'Ultra-fast Scalp' },
    { tf: '5m', label: '5m', desc: 'Momentum Scalp' },
    { tf: '15m', label: '15m', desc: 'Core Setup' },
    { tf: '1h', label: '1h', desc: 'Swing Intraday' },
    { tf: '4h', label: '4h', desc: 'High Timeframe' },
    { tf: '1d', label: '1d', desc: 'Daily Structure' },
  ];

  const rrRatios: RiskRewardRatio[] = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0];

  const stopLossOptions: { id: StopLossMethod; label: string; desc: string }[] = [
    {
      id: 'swing_structure',
      label: 'Wick High/Low (Swing)',
      desc: 'Invalidates at high/low wick of recent breakout candle',
    },
    {
      id: 'atr_multiplier',
      label: 'ATR Dynamic Buffer',
      desc: 'Adaptive volatility buffer (1.5x - 2.5x 14-period ATR)',
    },
    {
      id: 'fixed_pips',
      label: 'Fixed Invalidation Pips',
      desc: 'Preset stop-loss distance in asset price units/pips',
    },
  ];

  const sessionPresets: { id: SessionWindow; label: string; hours: string; desc: string }[] = [
    { id: 'london', label: 'London Session', hours: '08:00 - 16:30 UTC', desc: 'High FX liquidity' },
    { id: 'ny', label: 'New York Session', hours: '13:00 - 21:00 UTC', desc: 'US Market open' },
    { id: 'asia', label: 'Asian Session', hours: '00:00 - 08:00 UTC', desc: 'Tokyo & Sydney' },
    { id: 'all', label: '24-Hour Day', hours: '00:00 - 23:59 UTC', desc: 'Unfiltered 24H' },
    { id: 'custom', label: 'Custom Window', hours: `${config.sessionStart} - ${config.sessionEnd}`, desc: 'User-defined hours' },
  ];

  return (
    <div className="space-y-6">
      {/* Workflow Visual Pipeline Flow Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h2 className="font-display font-bold text-slate-900 text-lg">
                Visual Strategy Workflow Pipeline
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                MODULAR BLOCKS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag, configure, and link algorithm building blocks to generate institutional execution logic
            </p>
          </div>

          <button
            onClick={onRunBacktest}
            disabled={isSimulating}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Simulating Feed...</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                <span>Simulate Workflow Feed</span>
              </>
            )}
          </button>
        </div>

        {/* Visual Pipeline Node Connectors */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative pt-2">
          {/* Node 1 */}
          <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/50 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              1
            </span>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-indigo-700 block tracking-wider">
                Asset & Frame
              </span>
              <span className="font-bold text-xs text-slate-900 truncate block">
                {config.symbol} • {config.timeframe}
              </span>
            </div>
          </div>

          {/* Node 2 */}
          <div className="p-3 rounded-lg border border-teal-200 bg-teal-50/50 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              2
            </span>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-teal-700 block tracking-wider">
                Entry Rule Block
              </span>
              <span className="font-bold text-xs text-slate-900 truncate block">
                {isNeeraj ? 'Neeraj 15M Scalp' : 'Gold 15M CHoCH'}
              </span>
            </div>
          </div>

          {/* Node 3 */}
          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              3
            </span>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-amber-700 block tracking-wider">
                Risk & Invalidation
              </span>
              <span className="font-bold text-xs text-slate-900 truncate block">
                1:{config.riskReward} R:R • {config.stopLossMethod === 'atr_multiplier' ? `${config.atrMultiplier}x ATR` : 'Wick Low/High'}
              </span>
            </div>
          </div>

          {/* Node 4 */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
              4
            </span>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-600 block tracking-wider">
                Execution Output
              </span>
              <span className="font-bold text-xs text-slate-900 truncate block">
                TradingView / Backtest
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BLOCK 1: ASSET & TIMEFRAME SELECTOR BLOCK */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div
          onClick={() => toggleBlock('assetTimeframe')}
          className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <GripVertical className="w-4 h-4 text-slate-400" />
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
              1
            </span>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm">
                Asset & Timeframe Selector Block
              </h3>
              <p className="text-xs text-slate-500">
                Select target trading asset (NIFTY50, Gold XAUUSD, BTCUSDT, EURUSD) and execution candle interval
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              {config.symbol} • {config.timeframe}
            </span>
            {expandedBlocks.assetTimeframe ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </div>

        {expandedBlocks.assetTimeframe && (
          <div className="p-6 space-y-6">
            {/* Asset Instrument Selection Grid */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2.5">
                Target Trading Asset:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {assetList.map((asset) => {
                  const isSelected = config.symbol === asset.symbol;
                  return (
                    <button
                      key={asset.symbol}
                      type="button"
                      onClick={() => onUpdateConfig({ symbol: asset.symbol })}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-sm ring-1 ring-indigo-600/30'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">{asset.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 stroke-[3]" />}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{asset.sub}</p>
                      <span className="mt-2 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {asset.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timeframe Selection */}
            <div className="border-t border-slate-100 pt-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2.5">
                Candle Timeframe (Resolution):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {timeframes.map(({ tf, label, desc }) => {
                  const isSelected = config.timeframe === tf;
                  return (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => onUpdateConfig({ timeframe: tf })}
                      className={`py-2 px-3 rounded-lg border text-center transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs block font-bold">{label}</span>
                      <span
                        className={`text-[10px] block ${
                          isSelected ? 'text-indigo-100' : 'text-slate-400'
                        }`}
                      >
                        {desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BLOCK 2: ENTRY RULE BLOCKS (CANDLE PATTERN & SMC CHOCH) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div
          onClick={() => toggleBlock('entryRules')}
          className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <GripVertical className="w-4 h-4 text-slate-400" />
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
              2
            </span>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm">
                Entry Rule Blocks & Signal Filters
              </h3>
              <p className="text-xs text-slate-500">
                Choose between Candle Pattern Filters (Neeraj Joshi 15M Scalping) or Smart Money Concepts (Gold 15M CHoCH)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
              {isNeeraj ? 'Candle Breakout Scalper' : 'Smart Money CHoCH'}
            </span>
            {expandedBlocks.entryRules ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </div>

        {expandedBlocks.entryRules && (
          <div className="p-6 space-y-6">
            {/* Strategy Model Selector Radio Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Neeraj Joshi 15M Scalping */}
              <div
                onClick={() => onSelectModel('neeraj-15m')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isNeeraj
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-600/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-xs text-slate-900">
                      Candle Pattern Filters (Neeraj Joshi 15M Scalping)
                    </span>
                  </div>
                  {isNeeraj && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  Green/Red candle support/resistance breakout with 2-3 candle window. Confirms with EMA 9/21 cross & volume surge.
                </p>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">
                    2-3 Candle Window
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">
                    EMA 9/21 Pullback
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">
                    RSI 55/45
                  </span>
                </div>
              </div>

              {/* Option 2: Smart Money Concepts CHoCH */}
              <div
                onClick={() => onSelectModel('gold-choch-15m')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  !isNeeraj
                    ? 'border-teal-600 bg-teal-50/40 shadow-sm ring-1 ring-teal-600/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-teal-600" />
                    <span className="font-bold text-xs text-slate-900">
                      Smart Money Concepts (Gold 15M CHoCH Model)
                    </span>
                  </div>
                  {!isNeeraj && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  Higher-timeframe liquidity sweep, structure break (Change of Character), and 50% Order Block retest zone.
                </p>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">
                    Asian Sweep
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">
                    Structure CHoCH
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">
                    Order Block 50%
                  </span>
                </div>
              </div>
            </div>

            {/* Model-Specific Parameter Adjustments */}
            {isNeeraj ? (
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Neeraj Joshi Candle Pattern & Indicator Filters
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Calibrated for 15M Intraday Momentum
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Candle Breakout Window (2 vs 3 candles) */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                      Breakout Window:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[2, 3, 4].map((window) => (
                        <button
                          key={window}
                          type="button"
                          onClick={() => onUpdateConfig({ candleWindow: window })}
                          className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            config.candleWindow === window
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {window} Bars
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-2">
                      Breakout candle must hold within 2-3 bars
                    </span>
                  </div>

                  {/* Fast & Slow EMA Cross */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-800">
                        EMA Filter Lengths:
                      </label>
                      <span className="text-[11px] font-mono text-indigo-700 font-bold">
                        {config.emaFast} / {config.emaSlow}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Fast EMA:</span>
                        <input
                          type="number"
                          value={config.emaFast}
                          onChange={(e) => onUpdateConfig({ emaFast: Number(e.target.value) })}
                          className="w-full mt-1 px-2.5 py-1 text-xs font-mono rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Slow EMA:</span>
                        <input
                          type="number"
                          value={config.emaSlow}
                          onChange={(e) => onUpdateConfig({ emaSlow: Number(e.target.value) })}
                          className="w-full mt-1 px-2.5 py-1 text-xs font-mono rounded border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* RSI Thresholds */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-800">
                        RSI Momentum Levels:
                      </label>
                      <span className="text-[11px] font-mono text-indigo-700 font-bold">
                        Long &gt; {config.rsiLongLevel}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Long Threshold:</span>
                        <input
                          type="number"
                          value={config.rsiLongLevel}
                          onChange={(e) => onUpdateConfig({ rsiLongLevel: Number(e.target.value) })}
                          className="w-full mt-1 px-2.5 py-1 text-xs font-mono rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Short Threshold:</span>
                        <input
                          type="number"
                          value={config.rsiShortLevel}
                          onChange={(e) => onUpdateConfig({ rsiShortLevel: Number(e.target.value) })}
                          className="w-full mt-1 px-2.5 py-1 text-xs font-mono rounded border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Smart Money Concepts (SMC) Execution Zones
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Higher-Timeframe Liquidity & Order Block Retest
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Asian Range Sweep Toggle */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-800">
                          Liquidity Sweep Filter
                        </span>
                        <input
                          type="checkbox"
                          checked={config.asianRangeSweep}
                          onChange={(e) => onUpdateConfig({ asianRangeSweep: e.target.checked })}
                          className="w-4 h-4 text-teal-600 rounded border-slate-300"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Requires price to sweep Asian range liquidity high/low prior to signal formation.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 mt-2">
                      Active: {config.asianRangeSweep ? 'Sweep Required' : 'Unfiltered'}
                    </span>
                  </div>

                  {/* CHoCH Structure Confirmation */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                      CHoCH Confirmation Rule:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => onUpdateConfig({ chochConfirmation: 'body_close' })}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          config.chochConfirmation === 'body_close'
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Body Close
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateConfig({ chochConfirmation: 'wick_break' })}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          config.chochConfirmation === 'wick_break'
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Wick Break
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-2">
                      Body close ensures zero fake-out structure shift
                    </span>
                  </div>

                  {/* Order Block Retest Zone Depth */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-800">
                        Order Block Mitigation:
                      </label>
                      <span className="text-[11px] font-mono text-teal-700 font-bold">
                        {config.obMitigationDepth}% Depth
                      </span>
                    </div>
                    <input
                      type="range"
                      min={25}
                      max={75}
                      step={5}
                      value={config.obMitigationDepth}
                      onChange={(e) =>
                        onUpdateConfig({ obMitigationDepth: Number(e.target.value) })
                      }
                      className="w-full accent-teal-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                      <span>25% Shallow</span>
                      <span>50% Equilibrium</span>
                      <span>75% Deep</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BLOCK 3: RISK MANAGEMENT & SESSION WINDOWS BLOCK */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div
          onClick={() => toggleBlock('riskManagement')}
          className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <GripVertical className="w-4 h-4 text-slate-400" />
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
              3
            </span>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm">
                Risk Management & Session Windows Block
              </h3>
              <p className="text-xs text-slate-500">
                Fixed Risk-to-Reward ratio (1:1 to 1:5), Stop-Loss rules (wick or ATR), and trading session time windows (08:00 to 23:59)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              1:{config.riskReward} R:R • {config.sessionStart}-{config.sessionEnd}
            </span>
            {expandedBlocks.riskManagement ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </div>

        {expandedBlocks.riskManagement && (
          <div className="p-6 space-y-6">
            {/* 1. Risk-to-Reward Ratio (1:1 to 1:5) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Fixed Risk-to-Reward Ratio (1:1 to 1:5):
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  Target: 1 : {config.riskReward}
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {rrRatios.map((rr) => (
                  <button
                    key={rr}
                    type="button"
                    onClick={() => onUpdateConfig({ riskReward: rr })}
                    className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                      config.riskReward === rr
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    1:{rr.toFixed(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Stop Loss Calculation Rules */}
            <div className="border-t border-slate-100 pt-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2.5">
                Stop-Loss Placement Method:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {stopLossOptions.map((opt) => {
                  const isSelected = config.stopLossMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onUpdateConfig({ stopLossMethod: opt.id })}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600/30'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 stroke-[3]" />}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Sub-control for ATR */}
              {config.stopLossMethod === 'atr_multiplier' && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-4">
                  <span className="text-xs font-medium text-slate-700">
                    ATR Stop Buffer Multiplier:
                  </span>
                  <div className="flex items-center gap-2">
                    {[1.2, 1.5, 1.8, 2.0, 2.5].map((mult) => (
                      <button
                        key={mult}
                        type="button"
                        onClick={() => onUpdateConfig({ atrMultiplier: mult })}
                        className={`px-2.5 py-1 text-xs font-bold rounded-md border ${
                          config.atrMultiplier === mult
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {mult}x ATR
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Trading Session Time Windows */}
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Trading Session Time Windows:
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <span>Enforce Session Filter</span>
                  <input
                    type="checkbox"
                    checked={config.sessionFilterEnabled}
                    onChange={(e) => onUpdateConfig({ sessionFilterEnabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-4">
                {sessionPresets.map((preset) => {
                  const isSelected = config.sessionWindow === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onUpdateConfig({ sessionWindow: preset.id });
                        if (preset.id === 'london') onUpdateConfig({ sessionStart: '08:00', sessionEnd: '16:30' });
                        if (preset.id === 'ny') onUpdateConfig({ sessionStart: '13:00', sessionEnd: '21:00' });
                        if (preset.id === 'asia') onUpdateConfig({ sessionStart: '00:00', sessionEnd: '08:00' });
                        if (preset.id === 'all') onUpdateConfig({ sessionStart: '00:00', sessionEnd: '23:59' });
                      }}
                      className={`p-3 rounded-lg text-left border transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-semibold text-xs text-slate-900">{preset.label}</div>
                      <div className="text-[11px] font-mono text-indigo-700 font-medium mt-0.5">
                        {preset.hours}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">{preset.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Explicit Start and End Hours */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-800">
                    Active Execution Time Window (UTC):
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500">From:</span>
                    <input
                      type="time"
                      value={config.sessionStart}
                      onChange={(e) =>
                        onUpdateConfig({
                          sessionStart: e.target.value,
                          sessionWindow: 'custom',
                        })
                      }
                      className="px-2.5 py-1 text-xs font-mono rounded border border-slate-300 bg-white shadow-sm"
                    />
                  </div>

                  <span className="text-slate-400">to</span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500">To:</span>
                    <input
                      type="time"
                      value={config.sessionEnd}
                      onChange={(e) =>
                        onUpdateConfig({
                          sessionEnd: e.target.value,
                          sessionWindow: 'custom',
                        })
                      }
                      className="px-2.5 py-1 text-xs font-mono rounded border border-slate-300 bg-white shadow-sm"
                    />
                  </div>

                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    UTC
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
