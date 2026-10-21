import React, { useState } from 'react';
import { AssetSymbol, Candle, StrategyConfig, Timeframe, Trade, TradeDirection } from '../../types';
import { ASSETS, formatPrice } from '../../data/assets';
import { TradingViewChart } from './TradingViewChart';
import { NextTradeOpportunityRadar } from '../learning/NextTradeOpportunityRadar';
import {
  CandlestickChart,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Sliders,
  Sparkles,
  Maximize2,
  Clock,
  Target,
  ShieldAlert,
  Flame,
  Crown,
} from 'lucide-react';

interface TradingViewModuleViewProps {
  candles: Candle[];
  config: StrategyConfig;
  trades: Trade[];
  onUpdateConfig: (updated: Partial<StrategyConfig>) => void;
  onRunSimulation?: () => void;
  currentPrice: number;
  onTriggerPlannedTrade: (
    direction: TradeDirection,
    entryPrice: number,
    slPrice: number,
    tpPrice: number,
    reason: string,
    hinglish: string
  ) => void;
}

export const TradingViewModuleView: React.FC<TradingViewModuleViewProps> = ({
  candles,
  config,
  trades,
  onUpdateConfig,
  onRunSimulation,
  currentPrice,
  onTriggerPlannedTrade,
}) => {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const assetList: AssetSymbol[] = ['NIFTY50', 'XAUUSD', 'BTCUSDT', 'EURUSD', 'BANKNIFTY'];
  const timeframeList: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

  const isNeeraj = config.model === 'neeraj-15m';
  const latestTrade = selectedTrade || (trades.length > 0 ? trades[trades.length - 1] : null);

  const winningTrades = trades.filter((t) => t.status === 'WIN');
  const winRate = trades.length > 0 ? Math.round((winningTrades.length / trades.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar: Asset & Timeframe Switchers */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Asset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Asset:
          </span>
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg">
            {assetList.map((sym) => {
              const isSelected = config.symbol === sym;
              return (
                <button
                  key={sym}
                  onClick={() => onUpdateConfig({ symbol: sym })}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sym}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Timeframe Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Timeframe:
          </span>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {timeframeList.map((tf) => {
              const isSelected = config.timeframe === tf;
              return (
                <button
                  key={tf}
                  onClick={() => onUpdateConfig({ timeframe: tf })}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tf}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Model Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
              isNeeraj
                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                : 'bg-teal-50 text-teal-800 border-teal-200'
            }`}
          >
            {isNeeraj ? <Flame className="w-3.5 h-3.5 text-amber-500" /> : <Crown className="w-3.5 h-3.5 text-teal-600" />}
            <span>{isNeeraj ? 'Neeraj 15M Scalping' : 'Gold 15M CHoCH'}</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">1:{config.riskReward} R:R</span>
        </div>
      </div>

      {/* Main Lightweight Charts Embed */}
      <TradingViewChart
        candles={candles}
        symbol={config.symbol}
        trades={trades}
        activeTrade={latestTrade}
        height={520}
      />

      {/* Next Trade Opportunity Radar & Decision Engine */}
      <NextTradeOpportunityRadar
        config={config}
        currentPrice={currentPrice}
        candles={candles}
        onTriggerPlannedTrade={onTriggerPlannedTrade}
      />

      {/* Strategy Overlay Trade Stats & Legend Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Simulated Trade Markers Summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Simulated Trade Markers
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700">
              {trades.length} Signals Plotted
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Long Entry Arrows:
              </span>
              <span className="font-bold text-slate-900">
                {trades.filter((t) => t.direction === 'LONG').length} Orders
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                Short Entry Arrows:
              </span>
              <span className="font-bold text-slate-900">
                {trades.filter((t) => t.direction === 'SHORT').length} Orders
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <span className="text-slate-600">Simulated Strategy Win Rate:</span>
              <span className="font-bold text-emerald-600 font-mono">{winRate}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Trade SL/TP Invalidation Levels */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Target & Invalidation Levels
            </span>
            {latestTrade && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  latestTrade.direction === 'LONG'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {latestTrade.direction}
              </span>
            )}
          </div>

          {latestTrade ? (
            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center bg-indigo-50/60 p-2 rounded border border-indigo-200/60">
                <span className="text-indigo-900 font-sans font-semibold">Entry Level:</span>
                <span className="font-bold text-indigo-700">
                  {formatPrice(config.symbol, latestTrade.entryPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50/60 p-2 rounded border border-emerald-200/60">
                <span className="text-emerald-900 font-sans font-semibold">Take-Profit (TP):</span>
                <span className="font-bold text-emerald-700">
                  {formatPrice(config.symbol, latestTrade.takeProfit)}
                </span>
              </div>
              <div className="flex justify-between items-center bg-rose-50/60 p-2 rounded border border-rose-200/60">
                <span className="text-rose-900 font-sans font-semibold">Stop-Loss (SL):</span>
                <span className="font-bold text-rose-700">
                  {formatPrice(config.symbol, latestTrade.stopLoss)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">
              No simulated trades active yet
            </p>
          )}
        </div>

        {/* Card 3: Execution Rules on Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Chart Overlay Controls
            </span>
            <span className="text-[10px] text-slate-400 font-mono">v5 Lightweight</span>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <p className="leading-relaxed">
              • Toggle between <strong>Candlestick</strong> and <strong>OHLC Bars</strong> using top right selector.
            </p>
            <p className="leading-relaxed">
              • Volume histogram at bottom is dynamically synchronized with candle direction (green/red).
            </p>
            <p className="leading-relaxed">
              • Crosshair reveals instantaneous Open, High, Low, and Close price values.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
