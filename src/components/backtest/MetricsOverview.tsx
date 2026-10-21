import React from 'react';
import { BacktestMetrics } from '../../types';
import {
  TrendingUp,
  Percent,
  Activity,
  Award,
  ArrowDownRight,
  Shield,
  Zap,
  DollarSign,
  TrendingDown,
  BarChart2,
} from 'lucide-react';

interface MetricsOverviewProps {
  metrics: BacktestMetrics;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  const isProfitable = metrics.netProfit >= 0;

  return (
    <div className="space-y-4">
      {/* Primary KPI Hero Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Net Profit */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Net Profit
            </span>
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div
            className={`text-xl font-bold font-mono ${
              isProfitable ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isProfitable ? '+' : ''}${metrics.netProfit.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
            <span
              className={`px-1.5 py-0.2 rounded ${
                isProfitable
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {isProfitable ? '+' : ''}
              {metrics.netProfitPercent}%
            </span>
            <span className="text-slate-400">ROI</span>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Win Rate %
            </span>
            <Award className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {metrics.winRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-600 font-semibold">{metrics.winCount}W</span>
            <span className="text-slate-300 mx-1">/</span>
            <span className="text-rose-600 font-semibold">{metrics.lossCount}L</span>
          </div>
        </div>

        {/* Profit Factor */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Profit Factor
            </span>
            <Activity className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div
            className={`text-xl font-bold font-mono ${
              metrics.profitFactor >= 1.5 ? 'text-indigo-600' : 'text-slate-900'
            }`}
          >
            {metrics.profitFactor}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics.profitFactor >= 1.75 ? 'Institutional Edge' : 'Viable Scalp'}
          </div>
        </div>

        {/* Total Trades */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Trades
            </span>
            <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {metrics.totalTrades}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics.longCount} Long • {metrics.shortCount} Short
          </div>
        </div>

        {/* Max Drawdown */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Max Drawdown
            </span>
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-600">
            -{metrics.maxDrawdownPercent}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            -${metrics.maxDrawdown.toLocaleString()} peak-to-trough
          </div>
        </div>

        {/* Sharpe Ratio */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Sharpe Ratio
            </span>
            <Shield className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-xl font-bold font-mono text-teal-700">
            {metrics.sharpeRatio}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics.sharpeRatio > 1.8 ? 'Excellent Risk-Adj' : 'Acceptable'}
          </div>
        </div>
      </div>

      {/* Secondary Depth Statistics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center justify-between px-2">
          <span className="text-slate-500">Avg Trade Expectancy:</span>
          <span className="font-mono font-bold text-slate-800">
            ${metrics.expectancy} / trade
          </span>
        </div>
        <div className="flex items-center justify-between px-2 border-l border-slate-200">
          <span className="text-slate-500">Avg Win / Avg Loss:</span>
          <span className="font-mono font-bold text-slate-800">
            <span className="text-emerald-600">+${metrics.avgWin}</span> /{' '}
            <span className="text-rose-600">-${metrics.avgLoss}</span>
          </span>
        </div>
        <div className="flex items-center justify-between px-2 border-l border-slate-200">
          <span className="text-slate-500">Best / Worst Trade:</span>
          <span className="font-mono font-bold text-slate-800">
            <span className="text-emerald-600">+${metrics.bestTrade}</span> /{' '}
            <span className="text-rose-600">${metrics.worstTrade}</span>
          </span>
        </div>
        <div className="flex items-center justify-between px-2 border-l border-slate-200">
          <span className="text-slate-500">Long / Short Win %:</span>
          <span className="font-mono font-bold text-slate-800">
            {metrics.longWinRate}% / {metrics.shortWinRate}%
          </span>
        </div>
      </div>
    </div>
  );
};
