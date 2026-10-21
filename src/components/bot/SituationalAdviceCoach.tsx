import React, { useState } from 'react';
import { AssetSymbol, Candle, StrategyConfig } from '../../types';
import { ASSETS, formatPrice } from '../../data/assets';
import {
  BrainCircuit,
  Compass,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Target,
  Flame,
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SituationalAdviceCoachProps {
  config: StrategyConfig;
  currentPrice: number;
  candles: Candle[];
  isRealMarket: boolean;
}

export const SituationalAdviceCoach: React.FC<SituationalAdviceCoachProps> = ({
  config,
  currentPrice,
  candles,
  isRealMarket,
}) => {
  const [showHinglish, setShowHinglish] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  const asset = ASSETS[config.symbol];
  const latestCandle = candles[candles.length - 1] || {
    close: currentPrice,
    open: currentPrice,
    high: currentPrice,
    low: currentPrice,
    volume: 1000,
    emaFast: currentPrice,
    emaSlow: currentPrice,
    rsi: 50,
  };

  const emaFast = latestCandle.emaFast || currentPrice * 1.001;
  const emaSlow = latestCandle.emaSlow || currentPrice * 0.999;
  const rsi = latestCandle.rsi || 52;
  const isEmaBullish = emaFast > emaSlow;
  const emaDiff = Number((emaFast - emaSlow).toFixed(asset.pipSize < 0.01 ? 4 : 2));

  // Determine recent Order Block & Support/Resistance
  const recentCandles = candles.slice(-25);
  const highest = Math.max(...recentCandles.map((c) => c.high));
  const lowest = Math.min(...recentCandles.map((c) => c.low));
  const obTop = Number((lowest * 1.004).toFixed(asset.pipSize < 0.01 ? 4 : 2));
  const obBottom = lowest;

  // Determine market regime & situation
  let regime: 'BULLISH_EXPANSION' | 'BEARISH_EXPANSION' | 'CHOP_CONSOLIDATION' = 'CHOP_CONSOLIDATION';
  if (isEmaBullish && Math.abs(emaDiff) > (asset.pipSize < 0.01 ? 0.001 : 1.5)) {
    regime = 'BULLISH_EXPANSION';
  } else if (!isEmaBullish && Math.abs(emaDiff) > (asset.pipSize < 0.01 ? 0.001 : 1.5)) {
    regime = 'BEARISH_EXPANSION';
  }

  // Generate Situational Advice
  let situationTitle = '';
  let entryAdvice = '';
  let entryAdviceHinglish = '';
  let exitAdvice = '';
  let exitAdviceHinglish = '';
  let beginnerWarning = '';
  let beginnerWarningHinglish = '';

  if (regime === 'BULLISH_EXPANSION') {
    situationTitle = `BULLISH MOMENTUM (EMA 9 > EMA 21 by +${emaDiff} pts)`;
    entryAdvice = `Trend is Bullish. However, do NOT buy at current market price if price is far from EMA 9. Wait for a healthy pullback to the Demand/Order Block zone (${formatPrice(config.symbol, obTop)}) and look for a green rejection candle before entering LONG.`;
    entryAdviceHinglish = `Trend UP hai (EMA 9 EMA 21 ke upar hai). Lekin chalte hue teer ko mat pakdo (FOMO mat karo)! Price ko thoda neeche Order Block zone (${formatPrice(config.symbol, obTop)}) tak wapas aane do. Jab wahan green candle bane tabhi BUY lena.`;
    exitAdvice = `Take-Profit: Place at recent liquidity high ${formatPrice(config.symbol, highest)} (1:${config.riskReward} R:R). Stop-Loss: Place below Order Block invalidation at ${formatPrice(config.symbol, obBottom)}.`;
    exitAdviceHinglish = `Target: Upar ke swing high ${formatPrice(config.symbol, highest)} par profit book karein. Stop-Loss: ${formatPrice(config.symbol, obBottom)} ke theek neeche lagayein.`;
    beginnerWarning = `Avoid buying at the top of a big green candle. Retail traders buy highs and institutional algorithms sell into them.`;
    beginnerWarningHinglish = `Badi green candle dekh kar excited hoke upar buy mat karo. Smart Money retail ko fasa kar dump kar sakti hai.`;
  } else if (regime === 'BEARISH_EXPANSION') {
    situationTitle = `BEARISH DOWNTREND (EMA 9 < EMA 21 by -${Math.abs(emaDiff)} pts)`;
    entryAdvice = `Trend is Bearish. Look only for SHORT / SELL opportunities on pullbacks to the declining EMA 21 or Supply zone. Do not try to catch falling knives with counter-trend longs.`;
    entryAdviceHinglish = `Trend DOWN hai (EMA 9 EMA 21 ke neeche hai). Girti hui market me 'sasta mil raha hai' soch kar BUY mat karo! Price jab EMA 21 tak thoda bounce kare tab SELL ki opportunity dekho.`;
    exitAdvice = `Take-Profit: Target the discount liquidity pool at ${formatPrice(config.symbol, lowest)}. Stop-Loss: Strictly above the swing high at ${formatPrice(config.symbol, highest)}.`;
    exitAdviceHinglish = `Target: Neeche ke support level ${formatPrice(config.symbol, lowest)} par exit karein. Stop-Loss: Swing high ${formatPrice(config.symbol, highest)} ke upar rakhein.`;
    beginnerWarning = `Never average down a losing long position in a confirmed bearish breakdown.`;
    beginnerWarningHinglish = `Loss wali trade me aur paisa daal kar average mat karo. Agar SL hit ho to accept karo.`;
  } else {
    situationTitle = `CHOPPY CONSOLIDATION / NO DIRECTIONAL EDGE`;
    entryAdvice = `Market is in a sideways squeeze. Fast EMA 9 and Slow EMA 21 are tangled together. SIT ON YOUR HANDS. High-probability algorithms stay flat until a clean breakout occurs above ${formatPrice(config.symbol, highest)} or below ${formatPrice(config.symbol, lowest)}.`;
    entryAdviceHinglish = `Market sideways phansi hui hai. EMA 9 aur EMA 21 aapas me uljhe hue hain. ABHI KOI TRADE MAT LO. Shanti se baitho jab tak price ${formatPrice(config.symbol, highest)} ke upar ya ${formatPrice(config.symbol, lowest)} ke neeche clean candle close na de.`;
    exitAdvice = `If you have existing positions, tighten trailing stops to break-even to prevent chop decay.`;
    exitAdviceHinglish = `Agar purani trade open hai to SL ko Cost Price (Break-Even) par shift kar do taaki sideways market me loss na ho.`;
    beginnerWarning = `Overtrading in sideways markets is the #1 cause of beginner account blowups.`;
    beginnerWarningHinglish = `Sideways market me baar-baar trade lene se brokerage aur chop me sara capital khatam ho jata hai.`;
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-500/30 shadow-elevated overflow-hidden">
      {/* Top Banner / Coach Header */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-teal-400 p-0.5 flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-teal-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-white text-base">
                Bot's Live Situational Coach & Chart Reading Advice
              </h3>
              {isRealMarket ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  LIVE BINANCE EXCHANGE FEED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-mono">
                  SIMULATED HIGH-SPEED ENGINE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Live market situation ko candle-by-candle analyze karke beginner-friendly Entry aur Exit ki salah
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHinglish(!showHinglish)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5"
          >
            <span>🇮🇳 Hinglish Explanation:</span>
            <span className="font-bold text-teal-300">{showHinglish ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-white/10 hover:bg-white/15 rounded-lg text-slate-300 hover:text-white"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Coach Advice Body */}
      {isExpanded && (
        <div className="p-5 space-y-4">
          {/* Active Situation Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Current Market Phase:
              </span>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md font-mono ${
                  regime === 'BULLISH_EXPANSION'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : regime === 'BEARISH_EXPANSION'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {situationTitle}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-300">
                Price: <strong className="text-white">{formatPrice(config.symbol, currentPrice)}</strong>
              </span>
              <span className="text-sky-400">
                EMA 9: <strong>{formatPrice(config.symbol, emaFast)}</strong>
              </span>
              <span className="text-amber-400">
                EMA 21: <strong>{formatPrice(config.symbol, emaSlow)}</strong>
              </span>
              <span className="text-teal-300">
                RSI 14: <strong>{rsi}</strong>
              </span>
            </div>
          </div>

          {/* 3 Main Advice Cards: ENTRY SALAH, EXIT SALAH, WARNING */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Card 1: Entry Salah */}
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Target className="w-4 h-4" />
                <span>1. Entry Ki Salah (When & How to Enter)</span>
              </div>
              <p className="text-slate-200 leading-relaxed font-sans">{entryAdvice}</p>
              {showHinglish && (
                <div className="p-2.5 bg-emerald-900/30 rounded-lg border border-emerald-500/20 text-emerald-200 font-medium leading-relaxed">
                  💡 <strong>Aasan Bhasha:</strong> {entryAdviceHinglish}
                </div>
              )}
            </div>

            {/* Card 2: Exit Salah */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>2. Exit Ki Salah (Stop Loss & Target)</span>
              </div>
              <p className="text-slate-200 leading-relaxed font-sans">{exitAdvice}</p>
              {showHinglish && (
                <div className="p-2.5 bg-indigo-900/30 rounded-lg border border-indigo-500/20 text-indigo-200 font-medium leading-relaxed">
                  🎯 <strong>Aasan Bhasha:</strong> {exitAdviceHinglish}
                </div>
              )}
            </div>

            {/* Card 3: Beginner Trap Warning */}
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>3. Galti Mat Karna (Common Retail Trap)</span>
              </div>
              <p className="text-slate-200 leading-relaxed font-sans">{beginnerWarning}</p>
              {showHinglish && (
                <div className="p-2.5 bg-amber-900/30 rounded-lg border border-amber-500/20 text-amber-200 font-medium leading-relaxed">
                  ⚠️ <strong>Aasan Bhasha:</strong> {beginnerWarningHinglish}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
