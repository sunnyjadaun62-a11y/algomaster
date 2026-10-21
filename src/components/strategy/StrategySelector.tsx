import React from 'react';
import { StrategyType } from '../../types';
import { STRATEGY_DETAILS } from '../../data/presets';
import { Zap, Crown, CheckCircle2, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

interface StrategySelectorProps {
  selectedModel: StrategyType;
  onSelectModel: (model: StrategyType) => void;
}

export const StrategySelector: React.FC<StrategySelectorProps> = ({
  selectedModel,
  onSelectModel,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Neeraj Joshi 15M Scalping Card */}
      <div
        onClick={() => onSelectModel('neeraj-15m')}
        className={`relative rounded-xl p-6 cursor-pointer transition-all border ${
          selectedModel === 'neeraj-15m'
            ? 'bg-gradient-to-br from-white via-indigo-50/30 to-indigo-50/60 border-indigo-600 shadow-md ring-2 ring-indigo-600/20'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        {selectedModel === 'neeraj-15m' && (
          <span className="absolute -top-3 right-6 bg-indigo-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE STRATEGY
          </span>
        )}

        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100/80 text-indigo-700 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-slate-900 text-lg">
                Neeraj Joshi 15M Scalping
              </h3>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-100 text-indigo-800 rounded">
                Trend Pullback
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Intraday High-Volume Momentum Engine
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {STRATEGY_DETAILS['neeraj-15m'].description}
        </p>

        {/* Core Pillars */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 mb-4 text-center">
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Core Filter
            </span>
            <span className="text-xs font-semibold text-slate-800">EMA 9 / 21 Cross</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Momentum
            </span>
            <span className="text-xs font-semibold text-slate-800">RSI &gt; 55 / &lt; 45</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Volume Surge
            </span>
            <span className="text-xs font-semibold text-slate-800">&gt; 1.3x 20-SMA</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Optimal for Nifty, BankNifty & Indices
          </span>
          <button
            type="button"
            className={`font-semibold flex items-center gap-1 ${
              selectedModel === 'neeraj-15m' ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            {selectedModel === 'neeraj-15m' ? 'Configuring' : 'Select'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Gold 15M CHoCH Card */}
      <div
        onClick={() => onSelectModel('gold-choch-15m')}
        className={`relative rounded-xl p-6 cursor-pointer transition-all border ${
          selectedModel === 'gold-choch-15m'
            ? 'bg-gradient-to-br from-white via-teal-50/30 to-teal-50/60 border-teal-600 shadow-md ring-2 ring-teal-600/20'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        {selectedModel === 'gold-choch-15m' && (
          <span className="absolute -top-3 right-6 bg-teal-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE STRATEGY
          </span>
        )}

        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-teal-100/80 text-teal-700 flex items-center justify-center font-bold">
            <Crown className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-slate-900 text-lg">
                Gold 15M CHoCH (SMC)
              </h3>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-teal-100 text-teal-800 rounded">
                Smart Money Concepts
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Institutional Liquidity Sweep & Structure Shift
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {STRATEGY_DETAILS['gold-choch-15m'].description}
        </p>

        {/* Core Pillars */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 mb-4 text-center">
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Liquidity
            </span>
            <span className="text-xs font-semibold text-slate-800">Asian Range Sweep</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Trigger
            </span>
            <span className="text-xs font-semibold text-slate-800">15M CHoCH Break</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Entry Zone
            </span>
            <span className="text-xs font-semibold text-slate-800">50% Order Block</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Tailored for XAUUSD & High-Vol FX
          </span>
          <button
            type="button"
            className={`font-semibold flex items-center gap-1 ${
              selectedModel === 'gold-choch-15m' ? 'text-teal-600' : 'text-slate-500'
            }`}
          >
            {selectedModel === 'gold-choch-15m' ? 'Configuring' : 'Select'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
