import React, { useState } from 'react';
import {
  BacktestMetrics,
  Candle,
  EquityPoint,
  PaperAccount,
  PaperPosition,
  StrategyConfig,
  Trade,
} from '../../types';
import { MetricsOverview } from '../backtest/MetricsOverview';
import { EquityCurveChart } from '../backtest/EquityCurveChart';
import { DrawdownChart } from '../backtest/DrawdownChart';
import { TradeHistoryTable } from '../backtest/TradeHistoryTable';
import { PaperTradingView } from '../papertrading/PaperTradingView';
import { LearningExplainerView } from '../learning/LearningExplainerView';
import {
  Wallet,
  BarChart3,
  GraduationCap,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface SimulationCoreViewProps {
  config: StrategyConfig;
  currentPrice: number;
  priceDelta: number;
  paperAccount: PaperAccount;
  positions: PaperPosition[];
  closedTrades: any[];
  onOpenPosition: (direction: 'LONG' | 'SHORT', lotSize: number) => void;
  onClosePosition: (id: string) => void;
  onMoveToBreakEven: (id: string) => void;
  onResetAccount: () => void;
  autoExecuteSignals: boolean;
  onToggleAutoExecute: (val: boolean) => void;
  metrics: BacktestMetrics;
  equityCurve: EquityPoint[];
  trades: Trade[];
  candles: Candle[];
  onRunBacktest: () => void;
  isSimulating: boolean;
}

export const SimulationCoreView: React.FC<SimulationCoreViewProps> = ({
  config,
  currentPrice,
  priceDelta,
  paperAccount,
  positions,
  closedTrades,
  onOpenPosition,
  onClosePosition,
  onMoveToBreakEven,
  onResetAccount,
  autoExecuteSignals,
  onToggleAutoExecute,
  metrics,
  equityCurve,
  trades,
  candles,
  onRunBacktest,
  isSimulating,
}) => {
  const [subTab, setSubTab] = useState<'paper' | 'backtest' | 'learning'>('paper');

  return (
    <div className="space-y-6">
      {/* Module 4 Sub-Tabs Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-slate-900 text-lg">
              Module 4: Paper Trading & Backtesting Simulation Core
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
              $10,000 VIRTUAL CORE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time virtual order execution, historical OHLCV simulation analytics, and educational trade breakdown
          </p>
        </div>

        {/* Sub-Tabs Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSubTab('paper')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'paper'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Paper Trading Simulator</span>
            {positions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                {positions.length} Live
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('backtest')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'backtest'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Backtesting Analytics</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
              {trades.length} Trades
            </span>
          </button>

          <button
            onClick={() => setSubTab('learning')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'learning'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Learning Mode (Hinglish)</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Real-Time Paper Trading Simulator */}
      {subTab === 'paper' && (
        <div className="space-y-6">
          <PaperTradingView
            config={config}
            currentPrice={currentPrice}
            priceDelta={priceDelta}
            account={paperAccount}
            positions={positions}
            onOpenPosition={onOpenPosition}
            onClosePosition={onClosePosition}
            onMoveToBreakEven={onMoveToBreakEven}
            onResetAccount={onResetAccount}
            autoExecuteSignals={autoExecuteSignals}
            onToggleAutoExecute={onToggleAutoExecute}
            closedTrades={closedTrades}
          />
        </div>
      )}

      {/* Sub-Tab 2: Comprehensive Backtesting Analytics */}
      {subTab === 'backtest' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm">
                Historical Simulation on {candles.length} Candles ({config.symbol} {config.timeframe})
              </h3>
              <p className="text-xs text-slate-500">
                Performance computed against active strategy model conditions with zero lookahead bias
              </p>
            </div>

            <button
              onClick={onRunBacktest}
              disabled={isSimulating}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              {isSimulating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running Simulation Engine...
                </>
              ) : (
                <>
                  <TrendingUp className="w-3.5 h-3.5" />
                  Re-Execute Backtest
                </>
              )}
            </button>
          </div>

          {/* Metrics KPI Overview */}
          <MetricsOverview metrics={metrics} />

          {/* Equity Curve & Underwater Drawdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <EquityCurveChart
                data={equityCurve}
                initialCapital={metrics.initialCapital}
              />
            </div>
            <div>
              <DrawdownChart
                data={equityCurve}
                maxDrawdownPercent={metrics.maxDrawdownPercent}
              />
            </div>
          </div>

          {/* Trade History Log Table */}
          <TradeHistoryTable trades={trades} />
        </div>
      )}

      {/* Sub-Tab 3: Learning Explainer Mode (Hinglish/English) */}
      {subTab === 'learning' && (
        <div className="space-y-6">
          <LearningExplainerView
            trades={trades}
            candles={candles}
            config={config}
          />
        </div>
      )}
    </div>
  );
};
