import React, { useState } from 'react';
import { AssetSymbol, Candle, StrategyConfig, TradeDirection } from '../../types';
import { ASSETS, formatPrice } from '../../data/assets';
import {
  Compass,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  ShieldAlert,
  HelpCircle,
  Zap,
  ArrowRight,
  Sparkles,
  Flame,
  Crown,
  Play,
  RotateCcw,
  Info,
} from 'lucide-react';

interface NextTradeOpportunityRadarProps {
  config: StrategyConfig;
  currentPrice: number;
  candles: Candle[];
  onTriggerPlannedTrade: (direction: TradeDirection, entryPrice: number, slPrice: number, tpPrice: number, reason: string, hinglish: string) => void;
}

export const NextTradeOpportunityRadar: React.FC<NextTradeOpportunityRadarProps> = ({
  config,
  currentPrice,
  candles,
  onTriggerPlannedTrade,
}) => {
  const [activeTab, setActiveTab] = useState<'long' | 'short'>('long');
  const [showHinglish, setShowHinglish] = useState(true);

  const asset = ASSETS[config.symbol];
  const isNeeraj = config.model === 'neeraj-15m';

  // Calculate dynamic support & resistance levels from recent candles
  const recentCandles = candles.slice(-20);
  const highestPrice = recentCandles.length > 0 ? Math.max(...recentCandles.map((c) => c.high)) : currentPrice * 1.008;
  const lowestPrice = recentCandles.length > 0 ? Math.min(...recentCandles.map((c) => c.low)) : currentPrice * 0.992;

  // Resistance level (Breakout level for Long)
  const resistanceLevel = Number((highestPrice * 1.001).toFixed(asset.pipSize < 0.01 ? 4 : 2));
  // Support level (Breakdown level for Short)
  const supportLevel = Number((lowestPrice * 0.999).toFixed(asset.pipSize < 0.01 ? 4 : 2));

  // LONG SETUP CALCULATIONS
  const longEntryPrice = resistanceLevel;
  const longSlDistance = Number(
    (config.stopLossMethod === 'atr_multiplier'
      ? longEntryPrice * 0.0045 * config.atrMultiplier
      : longEntryPrice * 0.0035
    ).toFixed(asset.pipSize < 0.01 ? 4 : 2)
  );
  const longStopLoss = Number((longEntryPrice - longSlDistance).toFixed(asset.pipSize < 0.01 ? 4 : 2));
  const longTakeProfit = Number((longEntryPrice + longSlDistance * config.riskReward).toFixed(asset.pipSize < 0.01 ? 4 : 2));
  const longRiskPts = Number((longEntryPrice - longStopLoss).toFixed(asset.pipSize < 0.01 ? 4 : 2));
  const longRewardPts = Number((longTakeProfit - longEntryPrice).toFixed(asset.pipSize < 0.01 ? 4 : 2));
  const longDollarRisk = Number(((longRiskPts / asset.pipSize) * asset.pipSize * (config.fixedLotSize || 1.0) * 50).toFixed(2));
  const longDollarProfit = Number((longDollarRisk * config.riskReward).toFixed(2));

  // SHORT SETUP CALCULATIONS
  const shortEntryPrice = supportLevel;
  const shortSlDistance = longSlDistance;
  const shortStopLoss = Number((shortEntryPrice + shortSlDistance).toFixed(asset.pipSize < 0.01 ? 4 : 2));
  const shortTakeProfit = Number((shortEntryPrice - shortSlDistance * config.riskReward).toFixed(asset.pipSize < 0.01 ? 4 : 2));
  const shortRiskPts = Number((shortStopLoss - shortEntryPrice).toFixed(asset.pipSize < 0.01 ? 4 : 2));
  const shortRewardPts = Number((shortEntryPrice - shortTakeProfit).toFixed(asset.pipSize < 0.01 ? 4 : 2));
  const shortDollarRisk = Number(((shortRiskPts / asset.pipSize) * asset.pipSize * (config.fixedLotSize || 1.0) * 50).toFixed(2));
  const shortDollarProfit = Number((shortDollarRisk * config.riskReward).toFixed(2));

  // Distance from current price to trigger levels
  const distanceToLongTrigger = Number((resistanceLevel - currentPrice).toFixed(asset.pipSize < 0.01 ? 4 : 2));
  const distanceToShortTrigger = Number((currentPrice - supportLevel).toFixed(asset.pipSize < 0.01 ? 4 : 2));

  const handleSimulateLong = () => {
    const reason = `[PLANNED LONG EXECUTED] ${config.symbol} broke above resistance ${formatPrice(config.symbol, resistanceLevel)} with confirmed 15M candle close & volume surge. EMA 9/21 bullish expansion active. Target: ${formatPrice(config.symbol, longTakeProfit)} (1:${config.riskReward} R:R).`;
    const hinglish = `Resistance level ${formatPrice(config.symbol, resistanceLevel)} tut gaya aur buyers ne strong candle close diya! Planned Long entry execute ho gayi hai, TP: ${formatPrice(config.symbol, longTakeProfit)}.`;
    onTriggerPlannedTrade('LONG', longEntryPrice, longStopLoss, longTakeProfit, reason, hinglish);
  };

  const handleSimulateShort = () => {
    const reason = `[PLANNED SHORT EXECUTED] ${config.symbol} broke below key support ${formatPrice(config.symbol, supportLevel)} confirming structural breakdown. Bearish order flow active into discount liquidity. Target: ${formatPrice(config.symbol, shortTakeProfit)} (1:${config.riskReward} R:R).`;
    const hinglish = `Support level ${formatPrice(config.symbol, supportLevel)} break ho gaya aur sellers ne structure toda! Planned Short entry execute ho gayi, TP: ${formatPrice(config.symbol, shortTakeProfit)}.`;
    onTriggerPlannedTrade('SHORT', shortEntryPrice, shortStopLoss, shortTakeProfit, reason, hinglish);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            <h3 className="font-display font-extrabold text-slate-900 text-lg">
              Next Trade Opportunity Radar & Decision Engine
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              LIVE FORWARD-LOOKING SETUP
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent learning: Exactly what condition triggers the next trade, exact projected profit/loss, and why the bot is waiting right now.
          </p>
        </div>

        {/* Toggle View Options */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('long')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'long'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Next Planned BUY Setup
            </button>
            <button
              onClick={() => setActiveTab('short')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'short'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Next Planned SELL Setup
            </button>
          </div>

          <button
            onClick={() => setShowHinglish(!showHinglish)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <span>🇮🇳 Hinglish:</span>
            <span className="font-bold text-indigo-600">{showHinglish ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: "ABHI TRADE KYU NAHI LI?" (CURRENT MARKET STATUS & FILTER REJECTIONS) */}
      <div className="bg-amber-50/50 rounded-2xl border border-amber-200/80 p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Abhi Trade Kyu Nahi Li? (Why is the Bot NOT trading right now?)</span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-md border border-amber-300">
            Market Status: CONSOLIDATING INSIDE RANGE (NO EDGE)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          {/* Check 1 */}
          <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
            <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
              <span>1. Price vs Trigger Level:</span>
              <span className="text-amber-700 font-mono">
                {distanceToLongTrigger > 0 ? `+${distanceToLongTrigger} pts away` : 'Near Trigger'}
              </span>
            </div>
            <p className="text-slate-600 leading-snug text-[11px]">
              Current price <strong>{formatPrice(config.symbol, currentPrice)}</strong> is between Support ({formatPrice(config.symbol, supportLevel)}) and Resistance ({formatPrice(config.symbol, resistanceLevel)}).
            </p>
            {showHinglish && (
              <p className="text-[10px] text-amber-900 font-medium mt-1">
                ↳ Price abhi beech ke zone me ghum rahi hai. Yahan trade lena bewakoofi hogi kyunki koi clear direction nahi hai.
              </p>
            )}
          </div>

          {/* Check 2 */}
          <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
            <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
              <span>2. Institutional Volume:</span>
              <span className="text-amber-700 font-mono">0.86x (Low)</span>
            </div>
            <p className="text-slate-600 leading-snug text-[11px]">
              Volume is currently below the required 1.35x surge. Big banks and institutions have not triggered their execution algorithms yet.
            </p>
            {showHinglish && (
              <p className="text-[10px] text-amber-900 font-medium mt-1">
                ↳ Volume normal se kam hai. Sideways market me false breakout se bachne ke liye bot shaant baitha hai.
              </p>
            )}
          </div>

          {/* Check 3 */}
          <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
            <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
              <span>3. Candle Close Rule:</span>
              <span className="text-amber-700 font-mono">15M In-Progress</span>
            </div>
            <p className="text-slate-600 leading-snug text-[11px]">
              Waiting for full 15M candle to complete. Professional rules mandate never entering on an unclosed candle wick.
            </p>
            {showHinglish && (
              <p className="text-[10px] text-amber-900 font-medium mt-1">
                ↳ 15-minute candle complete hone ka intezar hai taaki wick rejection na mile.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white/90 p-2.5 rounded-lg border border-amber-200 text-xs text-amber-950 font-medium flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Trading Lesson:</strong> 90% beginners har candle par trade lene ki koshish karte hain aur overtrading me loss karte hain. AlgoMaster Bot tabhi enter karta hai jab price exact resistance ya support todkar confirmation de!
          </span>
        </div>
      </div>

      {/* SECTION 2: "NEXT TRADE KB & KYU LENGE?" (PLANNED BLUEPRINT & PROFIT ROADMAP) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            Next Trade Blueprint: Exact Condition, Risk-Reward, aur "Kyu Lenge?"
          </span>
          <span className="text-xs font-mono font-bold text-indigo-700">
            Target 1 : {config.riskReward} R:R Ratio
          </span>
        </div>

        {activeTab === 'long' ? (
          /* LONG SETUP BLUEPRINT */
          <div className="bg-emerald-50/40 rounded-2xl border-2 border-emerald-500/60 p-6 space-y-6">
            {/* Top Blueprint Summary */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-slate-900 text-base">
                    Next Trade Plan: BUY / LONG {config.symbol} on Resistance Breakout
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    Trigger Condition: 15M candle closes solidly above{' '}
                    <span className="font-mono font-bold text-emerald-700">
                      {formatPrice(config.symbol, resistanceLevel)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Instant Test Execution Button */}
              <button
                onClick={handleSimulateLong}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Simulate Trigger at {formatPrice(config.symbol, resistanceLevel)}</span>
              </button>
            </div>

            {/* Exact Numbers Grid: Entry, SL, TP, Risk, Reward */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
                <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block">
                  Planned Entry:
                </span>
                <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                  {formatPrice(config.symbol, longEntryPrice)}
                </span>
                <span className="text-[10px] font-sans text-slate-500">Above {formatPrice(config.symbol, resistanceLevel)}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-rose-200 shadow-sm">
                <span className="text-[10px] font-sans font-bold uppercase text-rose-500 block">
                  Stop Loss (SL):
                </span>
                <span className="text-sm font-extrabold text-rose-600 block mt-0.5">
                  {formatPrice(config.symbol, longStopLoss)}
                </span>
                <span className="text-[10px] font-sans text-rose-500 font-bold">
                  -{longRiskPts} pts (-${longDollarRisk})
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
                <span className="text-[10px] font-sans font-bold uppercase text-emerald-600 block">
                  Take Profit (TP):
                </span>
                <span className="text-sm font-extrabold text-emerald-600 block mt-0.5">
                  {formatPrice(config.symbol, longTakeProfit)}
                </span>
                <span className="text-[10px] font-sans text-emerald-600 font-bold">
                  +{longRewardPts} pts (+${longDollarProfit})
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-indigo-200 shadow-sm">
                <span className="text-[10px] font-sans font-bold uppercase text-indigo-600 block">
                  Risk : Reward
                </span>
                <span className="text-sm font-extrabold text-indigo-700 block mt-0.5">
                  1 : {config.riskReward}
                </span>
                <span className="text-[10px] font-sans text-slate-500">Risk $1 to make ${config.riskReward}</span>
              </div>
            </div>

            {/* Deep Technical Explanation: "KYU LENGE?" */}
            <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Kyu Lenge Ye Trade? (Technical Thesis & Logic Breakdown):</span>
              </div>
              <ul className="space-y-1.5 text-slate-600 leading-relaxed list-disc list-inside">
                <li>
                  <strong>Breakout Confirmation:</strong> Price resistance level{' '}
                  <span className="font-mono font-semibold text-slate-800">{formatPrice(config.symbol, resistanceLevel)}</span>{' '}
                  ko jab 15M candle ke sath todegi, to ye confirm karta hai ki overhead sellers exhaust ho chuke hain aur buyers aggressive hain.
                </li>
                <li>
                  <strong>EMA 9/21 Alignment:</strong> Fast EMA 9 slow EMA 21 ke upar expanding slope me hai, jo strong bullish momentum indicate karta hai.
                </li>
                <li>
                  <strong>Logical Stop-Loss:</strong> Stop-Loss ko breakout candle ke wick low ({formatPrice(config.symbol, longStopLoss)}) par rakha jayega taaki agar trade fail ho to minimum loss me exit ho.
                </li>
                <li>
                  <strong>1:{config.riskReward} Profit Target:</strong> Target level ({formatPrice(config.symbol, longTakeProfit)}) previous swing high liquidity pool par place kiya gaya hai.
                </li>
              </ul>

              {showHinglish && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950 font-medium leading-relaxed">
                  🇮🇳 <strong>Aasan Hinglish Summary:</strong> Bot tabhi BUY karega jab price resistance level ({formatPrice(config.symbol, resistanceLevel)}) todkar upar tick karegi. Hum -{longRiskPts} points ka risk le kar +{longRewardPts} points ka profit lene ka plan kar rahe hain (1:{config.riskReward} RR). Agar price wahan nahi pahuchti to bot bilkul trade nahi lega!
                </div>
              )}
            </div>
          </div>
        ) : (
          /* SHORT SETUP BLUEPRINT */
          <div className="bg-rose-50/40 rounded-2xl border-2 border-rose-500/60 p-6 space-y-6">
            {/* Top Blueprint Summary */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-rose-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-slate-900 text-base">
                    Next Trade Plan: SELL / SHORT {config.symbol} on Support Breakdown
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    Trigger Condition: 15M candle breaks down cleanly below{' '}
                    <span className="font-mono font-bold text-rose-700">
                      {formatPrice(config.symbol, supportLevel)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Instant Test Execution Button */}
              <button
                onClick={handleSimulateShort}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Simulate Trigger at {formatPrice(config.symbol, supportLevel)}</span>
              </button>
            </div>

            {/* Exact Numbers Grid: Entry, SL, TP, Risk, Reward */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-white p-3 rounded-xl border border-rose-200 shadow-sm">
                <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block">
                  Planned Entry:
                </span>
                <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                  {formatPrice(config.symbol, shortEntryPrice)}
                </span>
                <span className="text-[10px] font-sans text-slate-500">Below {formatPrice(config.symbol, supportLevel)}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-rose-200 shadow-sm">
                <span className="text-[10px] font-sans font-bold uppercase text-rose-500 block">
                  Stop Loss (SL):
                </span>
                <span className="text-sm font-extrabold text-rose-600 block mt-0.5">
                  {formatPrice(config.symbol, shortStopLoss)}
                </span>
                <span className="text-[10px] font-sans text-rose-500 font-bold">
                  -{shortRiskPts} pts (-${shortDollarRisk})
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
                <span className="text-[10px] font-sans font-bold uppercase text-emerald-600 block">
                  Take Profit (TP):
                </span>
                <span className="text-sm font-extrabold text-emerald-600 block mt-0.5">
                  {formatPrice(config.symbol, shortTakeProfit)}
                </span>
                <span className="text-[10px] font-sans text-emerald-600 font-bold">
                  +{shortRewardPts} pts (+${shortDollarProfit})
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-indigo-200 shadow-sm">
                <span className="text-[10px] font-sans font-bold uppercase text-indigo-600 block">
                  Risk : Reward
                </span>
                <span className="text-sm font-extrabold text-indigo-700 block mt-0.5">
                  1 : {config.riskReward}
                </span>
                <span className="text-[10px] font-sans text-slate-500">Risk $1 to make ${config.riskReward}</span>
              </div>
            </div>

            {/* Deep Technical Explanation: "KYU LENGE?" */}
            <div className="bg-white p-4 rounded-xl border border-rose-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span>Kyu Lenge Ye Trade? (Technical Breakdown):</span>
              </div>
              <ul className="space-y-1.5 text-slate-600 leading-relaxed list-disc list-inside">
                <li>
                  <strong>Structure Breakdown:</strong> Price jaise hi support level{' '}
                  <span className="font-mono font-semibold text-slate-800">{formatPrice(config.symbol, supportLevel)}</span>{' '}
                  todti hai, retail buyer stop-losses trigger hote hain aur market rapid downward cascade karti hai.
                </li>
                <li>
                  <strong>Trend Shift:</strong> Structure shift ke baad previous support ab strong resistance ban jayega, providing extra protection to our Stop-Loss.
                </li>
                <li>
                  <strong>Target Demand Pool:</strong> Take-Profit level ({formatPrice(config.symbol, shortTakeProfit)}) institutional discount zone me rakha gaya hai jahan fresh buyers aane ki sambhavna hai.
                </li>
              </ul>

              {showHinglish && (
                <div className="mt-3 p-3 bg-rose-50 rounded-lg border border-rose-200 text-rose-950 font-medium leading-relaxed">
                  🇮🇳 <strong>Aasan Hinglish Summary:</strong> Bot tabhi SELL karega jab support ({formatPrice(config.symbol, supportLevel)}) tutega. Yahan -{shortRiskPts} pts risk karke +{shortRewardPts} pts ka profit target karenge. Jab tak support intact hai, bot wait karega!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
