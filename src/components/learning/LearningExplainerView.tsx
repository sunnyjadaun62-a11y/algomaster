import React, { useState } from 'react';
import { AssetSymbol, Candle, StrategyConfig, Trade } from '../../types';
import { formatPrice } from '../../data/assets';
import {
  GraduationCap,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Languages,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layers,
  Compass,
} from 'lucide-react';

interface LearningExplainerViewProps {
  trades: Trade[];
  candles: Candle[];
  config: StrategyConfig;
}

export const LearningExplainerView: React.FC<LearningExplainerViewProps> = ({
  trades,
  candles,
  config,
}) => {
  const [selectedTradeId, setSelectedTradeId] = useState<string>(
    trades[0]?.id || ''
  );
  const [language, setLanguage] = useState<'hinglish' | 'english'>('hinglish');

  const selectedTrade = trades.find((t) => t.id === selectedTradeId) || trades[0];

  return (
    <div className="space-y-8">
      {/* Module Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-elevated relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-teal-300 border border-white/10 mb-3 backdrop-blur">
            <GraduationCap className="w-4 h-4 text-teal-400" />
            Beginner Trading Academy & Simulation Explainer
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-white mb-2">
            "Why Did This Trade Trigger?" — Learning Mode
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            Har trade ke peeche ki candle mechanics, breakout validation, support/resistance levels, aur
            invalidation rules ko aasan Hindi/Hinglish me samjhein. Zero guesswork, pure algorithmic clarity.
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white/10 p-1 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => setLanguage('hinglish')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                  language === 'hinglish'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                Hinglish (हिंदी + English)
              </button>
              <button
                onClick={() => setLanguage('english')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                  language === 'english'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Selected: <span className="font-bold text-white">{config.name}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Trade Breakdown & Explanation Engine */}
      {selectedTrade ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Trade Selector List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-fit">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Select Simulated Trade
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {trades.length} Total Trades
              </span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {trades.map((t) => {
                const isSelected = t.id === selectedTrade.id;
                const isLong = t.direction === 'LONG';
                const isWin = t.status === 'WIN';

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTradeId(t.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                        : 'border-slate-100 bg-slate-50/60 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 font-mono">
                        {t.id} • {t.entryTime}
                      </span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          isWin ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isWin ? '+' : ''}${t.pnl}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span
                        className={`font-semibold ${
                          isLong ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {t.direction} @ {t.entryPrice}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {t.rMultiple >= 0 ? `+${t.rMultiple}R` : `${t.rMultiple}R`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center & Right: Detailed Educational Explainer Box */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                      selectedTrade.direction === 'LONG'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {selectedTrade.direction === 'LONG' ? (
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                    )}
                    {selectedTrade.direction} TRADE ({selectedTrade.id})
                  </span>
                  <span className="font-mono text-xs text-slate-500">
                    Timestamp: {selectedTrade.entryTime}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs font-bold">
                  <span className="text-slate-500">Result:</span>
                  <span
                    className={`px-2 py-0.5 rounded ${
                      selectedTrade.status === 'WIN'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {selectedTrade.status} ({selectedTrade.pnl >= 0 ? '+' : ''}$
                    {selectedTrade.pnl})
                  </span>
                </div>
              </div>

              {/* Learning Mode Callout Box */}
              <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-3 text-indigo-950 font-bold text-sm">
                  <Lightbulb className="w-4 h-4 text-indigo-600 fill-indigo-200" />
                  <span>
                    {language === 'hinglish'
                      ? '💡 ट्रेड ट्रिगर होने का पूरा विश्लेषण (Step-by-Step Explanation):'
                      : '💡 Trade Invalidation & Execution Rationale:'}
                  </span>
                </div>

                <div className="text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans">
                  {language === 'hinglish'
                    ? selectedTrade.hinglishExplanation
                    : selectedTrade.englishExplanation}
                </div>
              </div>

              {/* Candle Mechanics & Mathematics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Entry Level
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {selectedTrade.entryPrice}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Triggered on 15M close
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Breakout / Sweep Level
                  </span>
                  <span className="font-mono text-sm font-bold text-indigo-700">
                    {selectedTrade.mechanics?.breakoutLevel || selectedTrade.entryPrice}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Structure Tested
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Invalidation (SL)
                  </span>
                  <span className="font-mono text-sm font-bold text-rose-600">
                    {selectedTrade.stopLoss}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Strict Cut-off
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Risk-Reward Target
                  </span>
                  <span className="font-mono text-sm font-bold text-emerald-600">
                    {selectedTrade.takeProfit}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    1:{config.riskReward} R:R Target
                  </span>
                </div>
              </div>

              {/* Rule Validation Checklist */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Algorithmic Verification Checklist for this Trade:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2 p-2 rounded bg-emerald-50/50 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Trend Alignment (9/21 EMA or HTF POI verified)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-emerald-50/50 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>2-3 Candle Structure Window Respected</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-emerald-50/50 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Volume Confirmation ({selectedTrade.mechanics?.volumeRatio} surge)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-emerald-50/50 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Session Window Active ({config.sessionWindow})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
          Run backtest simulation to view trade explanations.
        </div>
      )}

      {/* Beginner Core Concept Cards (Hindi / Hinglish Educational Guide) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Compass className="w-5 h-5 text-indigo-600" />
          <h3 className="font-display font-bold text-slate-900 text-base">
            Core Algorithmic Trading Concepts Explained (Beginners Guide)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <span className="font-bold text-indigo-600 text-sm block">
              1. 2-3 Candle Window Rule
            </span>
            <p className="text-slate-600 leading-relaxed">
              Neeraj Joshi scalping me jab price 9 EMA support par aata hai, toh breakout 2 se 3 candles ke andar
              hi aana chahiye. Agar price wahi consolidate karta rahe toh fakeout ka risk badh jata hai.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <span className="font-bold text-teal-600 text-sm block">
              2. Liquidity Sweep & Stop Hunt
            </span>
            <p className="text-slate-600 leading-relaxed">
              Retail traders support ke theek neeche stop loss lagate hain. Smart money pehle unke stops ko
              trigger karne ke liye wick banata hai (Liquidity Grab), phir asli trend start karta hai.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <span className="font-bold text-emerald-600 text-sm block">
              3. Change of Character (CHoCH)
            </span>
            <p className="text-slate-600 leading-relaxed">
              Jab market downtrend me lower highs bana raha ho, aur achanak ek 15M candle pichle swing high ke
              upar body close de de, toh use CHoCH kehte hain. Yeh trend reversal ka pehla pukhta signal hai.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
