import React from 'react';
import { AssetSymbol, StrategyConfig } from '../../types';
import { ASSETS, formatPrice } from '../../data/assets';
import {
  Activity,
  Cpu,
  Sparkles,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface HeaderProps {
  config: StrategyConfig;
  onUpdateConfig: (updated: Partial<StrategyConfig>) => void;
  currentPrice: number;
  priceDelta: number;
  onResetDefaults: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onUpdateConfig,
  currentPrice,
  priceDelta,
  onResetDefaults,
}) => {
  const asset = ASSETS[config.symbol];
  const isPositive = priceDelta >= 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand: AlgoMaster Pro */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-teal-500 flex items-center justify-center shadow-sm text-white">
              <Cpu className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-extrabold text-xl text-slate-900 tracking-tight">
                  AlgoMaster <span className="text-indigo-600">Pro</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" /> Daylight SaaS
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Professional Algorithmic Strategy Builder, Backtesting & Paper Trading
              </p>
            </div>
          </div>

          {/* Asset & Live Ticker Pill */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1">
              {(['XAUUSD', 'NIFTY50', 'BANKNIFTY', 'BTCUSDT', 'EURUSD'] as AssetSymbol[]).map(
                (sym) => (
                  <button
                    key={sym}
                    onClick={() => onUpdateConfig({ symbol: sym })}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      config.symbol === sym
                        ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    {sym}
                  </button>
                )
              )}
            </div>

            {/* Live Ticker display */}
            <div className="flex items-center space-x-2.5 bg-slate-100/70 border border-slate-200/90 rounded-lg px-3 py-1.5">
              <div className="flex flex-col text-right">
                <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                  {config.symbol} • {asset.unit}
                </div>
                <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-slate-900">
                  <span>{formatPrice(config.symbol, currentPrice)}</span>
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.2 rounded ${
                      isPositive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {priceDelta.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>

            {/* Reset */}
            <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-200">
              <button
                onClick={onResetDefaults}
                title="Reset to Strategy Defaults"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
