import React, { useState } from 'react';
import { AssetSymbol, StrategyConfig, TradeDirection } from '../../types';
import { ASSETS, formatPrice } from '../../data/assets';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  ArrowRight,
  Flame,
  Crown,
  Volume2,
  Sliders,
  DollarSign,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface BotDecisionVisualizerProps {
  config: StrategyConfig;
  currentPrice: number;
  priceDelta: number;
  onSimulateSignal: (direction: TradeDirection) => void;
}

export const BotDecisionVisualizer: React.FC<BotDecisionVisualizerProps> = ({
  config,
  currentPrice,
  priceDelta,
  onSimulateSignal,
}) => {
  const [selectedDirection, setSelectedDirection] = useState<TradeDirection>('LONG');
  const [showHinglish, setShowHinglish] = useState(true);

  const asset = ASSETS[config.symbol];
  const isNeeraj = config.model === 'neeraj-15m';

  // Calculate live dollar profit and loss projections
  const entryPrice = currentPrice;

  // Approximate Stop Loss distance
  let slPoints: number;
  if (config.stopLossMethod === 'atr_multiplier') {
    slPoints = Number((entryPrice * 0.0045 * config.atrMultiplier).toFixed(asset.pipSize < 0.01 ? 4 : 2));
  } else if (config.stopLossMethod === 'fixed_pips') {
    slPoints = Number((config.fixedSlPips * asset.pipSize).toFixed(asset.pipSize < 0.01 ? 4 : 2));
  } else {
    slPoints = Number((entryPrice * 0.0035).toFixed(asset.pipSize < 0.01 ? 4 : 2));
  }

  const tpPoints = Number((slPoints * config.riskReward).toFixed(asset.pipSize < 0.01 ? 4 : 2));

  const slPrice = selectedDirection === 'LONG' ? entryPrice - slPoints : entryPrice + slPoints;
  const tpPrice = selectedDirection === 'LONG' ? entryPrice + tpPoints : entryPrice - tpPoints;
  const bePrice = selectedDirection === 'LONG' ? entryPrice + slPoints : entryPrice - slPoints;

  // Approximate dollar values for a standard 1.0 Lot size
  const lotSize = config.fixedLotSize || 1.0;
  const dollarRisk = Number(((slPoints / asset.pipSize) * asset.pipSize * lotSize * 50).toFixed(2));
  const dollarProfit = Number((dollarRisk * config.riskReward).toFixed(2));
  const beProfit = dollarRisk;

  // 4 Live Conditions Checklist
  const conditions = [
    {
      id: 1,
      title: '1. Trend & Moving Average Bias',
      rule: isNeeraj
        ? selectedDirection === 'LONG'
          ? `EMA ${config.emaFast} > EMA ${config.emaSlow} (Bullish Expansion)`
          : `EMA ${config.emaFast} < EMA ${config.emaSlow} (Bearish Pullback)`
        : 'Asian Range High/Low Liquidity Sweep Confirmed',
      passed: true,
      desc: isNeeraj
        ? 'Fast EMA is aligned above Slow EMA, confirming momentum in entry direction.'
        : 'Market has swept retail stops above/below key session range before shifting.',
      hinglish: isNeeraj
        ? 'EMA 9 EMA 21 ke upar chal raha hai, matlab trend strong bullish hai.'
        : 'Asian session ke high/low liquidity ko institutional smart money ne sweep kiya hai.',
    },
    {
      id: 2,
      title: '2. Candle Pattern & Structure Window',
      rule: isNeeraj
        ? `Green/Red Breakout holding within ${config.candleWindow} Candles`
        : `15M Structure CHoCH Break (${config.chochConfirmation.replace('_', ' ')})`,
      passed: true,
      desc: isNeeraj
        ? `Price cleanly broke resistance and stayed above for ${config.candleWindow} consecutive bars.`
        : 'Change of Character candle body closed beyond previous swing high/low.',
      hinglish: isNeeraj
        ? `${config.candleWindow} candles ke andar breakout candle ne resistance ko tod kar hold kiya.`
        : '15-minute timeframe pe market structure break (CHoCH) confirm ho chuka hai.',
    },
    {
      id: 3,
      title: '3. Volume & Momentum Filter',
      rule: isNeeraj
        ? `Volume > 1.35x 20-SMA & RSI (${config.rsiLongLevel}/${config.rsiShortLevel})`
        : `50% Order Block Equilibrium Retest (${config.obMitigationDepth}%)`,
      passed: true,
      desc: isNeeraj
        ? 'Heavy volume surge confirms institutional participation; avoids low-volume traps.'
        : 'Price pulled back into the discount order block zone for optimal entry.',
      hinglish: isNeeraj
        ? 'Normal se 35% jyada trading volume aya hai, matlab bade institutions khareed rahe hain.'
        : 'Price 50% discount Order Block zone me wapas aya hai, jahan se bounce expected hai.',
    },
    {
      id: 4,
      title: '4. Trading Session & Discipline Window',
      rule: config.sessionFilterEnabled
        ? `Session Time: ${config.sessionStart} - ${config.sessionEnd} UTC`
        : 'Session Filter: 24-Hour Active Mode',
      passed: true,
      desc: `Max Daily Trades Limit: ${config.maxDailyTrades} trades to prevent overtrading.`,
      hinglish: `Trading window active hai (${config.sessionStart}-${config.sessionEnd} UTC). Daily 4 se jyada trade bot kabhi nahi lega.`,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
      {/* Top Header & Direction Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-display font-extrabold text-slate-900 text-lg">
              Bot Entry Conditions & Exact Profit Target Roadmap
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              BEGINNER EXPLAINER
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Clear visual guide: exactly when the bot enters, how much profit it takes before exiting, and when it refuses to trade.
          </p>
        </div>

        {/* Direction Toggle & Language Switch */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedDirection('LONG')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDirection === 'LONG'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              BUY / LONG Setup
            </button>
            <button
              onClick={() => setSelectedDirection('SHORT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDirection === 'SHORT'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              SELL / SHORT Setup
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

      {/* 2-COLUMN VISUAL GRID: LEFT = ENTRY CHECKLIST, RIGHT = EXACT PROFIT ROADMAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: LIVE ENTRY CHECKLIST & READINESS (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-extrabold">
                ✓
              </span>
              Kb Bot Enter Karega? (4 Core Verification Pillars)
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              100% Signal Readiness (All 4 Met)
            </span>
          </div>

          {/* Checklist Cards */}
          <div className="space-y-2.5">
            {conditions.map((cond) => (
              <div
                key={cond.id}
                className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs text-slate-900">{cond.title}</div>
                      <div className="text-[11px] font-mono font-bold text-indigo-700 mt-0.5">
                        {cond.rule}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                        {cond.desc}
                      </p>
                      {showHinglish && (
                        <p className="text-[11px] text-emerald-800 font-medium mt-1 bg-white/70 p-1.5 rounded border border-emerald-100/80">
                          🇮🇳 <strong>Aasan Bhasha me:</strong> {cond.hinglish}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                    PASSED
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Simulation Trigger Button */}
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="text-xs text-indigo-900 font-medium">
                Try out bot execution instantly with sound alert:
              </span>
            </div>
            <button
              onClick={() => onSimulateSignal(selectedDirection)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Execute Sample {selectedDirection} Trade
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: EXACT PROFIT LADDER & ROADMAP (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px] font-extrabold">
                $
              </span>
              Kitna Profit Leke Nikal Jaayega?
            </span>
            <span className="text-xs font-mono font-bold text-indigo-700">
              1 : {config.riskReward} R:R Target
            </span>
          </div>

          {/* Visual Profit & Loss Ladder */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4 font-mono text-xs">
            {/* 1. Take Profit Node */}
            <div className="bg-emerald-950/70 border border-emerald-500/50 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-emerald-300 font-sans font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-400" />
                  TAKE PROFIT (TP EXIT)
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  +{config.riskReward}R Gain
                </span>
              </div>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-slate-300 font-sans text-xs">Target Price:</span>
                <span className="font-extrabold text-emerald-400 text-base">
                  {formatPrice(config.symbol, tpPrice)}
                </span>
              </div>
              <div className="flex justify-between items-baseline mt-1 pt-1 border-t border-emerald-900/80">
                <span className="text-slate-400 font-sans text-[11px]">Estimated Payout:</span>
                <span className="font-bold text-emerald-300">
                  +{formatPrice(config.symbol, tpPoints)} pts ({'+$' + dollarProfit})
                </span>
              </div>
              <p className="text-[10px] text-emerald-200/80 font-sans mt-1.5">
                🎯 <strong>Bot Rule:</strong> Jaise hi price is level ko touch karegi, bot sound chime bajayega aur pura profit automatically lock kar lega!
              </p>
            </div>

            {/* Connecting Pipe */}
            <div className="flex justify-center -my-2">
              <div className="w-0.5 h-4 bg-slate-700"></div>
            </div>

            {/* 2. Break-Even Safe Node */}
            <div className="bg-indigo-950/50 border border-indigo-500/40 p-3 rounded-xl">
              <div className="flex items-center justify-between text-indigo-300 font-sans font-bold mb-1">
                <span>BREAK-EVEN LOCK (+1R)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                  Risk-Free Phase
                </span>
              </div>
              <div className="flex justify-between items-baseline text-[11px]">
                <span className="text-slate-300 font-sans">Trigger Price:</span>
                <span className="font-bold text-indigo-200">
                  {formatPrice(config.symbol, bePrice)}
                </span>
              </div>
              <p className="text-[10px] text-indigo-200/70 font-sans mt-1">
                🛡️ 1R profit aate hi bot Stop Loss ko Entry price par move kar deta hai taaki trade risk-free ho jaye.
              </p>
            </div>

            {/* Connecting Pipe */}
            <div className="flex justify-center -my-2">
              <div className="w-0.5 h-4 bg-slate-700"></div>
            </div>

            {/* 3. Entry Node */}
            <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl">
              <div className="flex items-center justify-between text-slate-300 font-sans font-bold mb-1">
                <span>ENTRY PRICE</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                  Execution Point
                </span>
              </div>
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-slate-400 font-sans">Current Market:</span>
                <span className="font-bold text-white text-sm">
                  {formatPrice(config.symbol, entryPrice)}
                </span>
              </div>
            </div>

            {/* Connecting Pipe */}
            <div className="flex justify-center -my-2">
              <div className="w-0.5 h-4 bg-slate-700"></div>
            </div>

            {/* 4. Stop Loss Node */}
            <div className="bg-rose-950/70 border border-rose-500/50 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-rose-300 font-sans font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  STOP LOSS (CAPITAL GUARD)
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  -1.0R Max Risk
                </span>
              </div>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-slate-300 font-sans text-xs">Stop Price:</span>
                <span className="font-extrabold text-rose-400 text-base">
                  {formatPrice(config.symbol, slPrice)}
                </span>
              </div>
              <div className="flex justify-between items-baseline mt-1 pt-1 border-t border-rose-900/80">
                <span className="text-slate-400 font-sans text-[11px]">Capped Loss:</span>
                <span className="font-bold text-rose-300">
                  -{formatPrice(config.symbol, slPoints)} pts ({'-$' + dollarRisk})
                </span>
              </div>
              <p className="text-[10px] text-rose-200/80 font-sans mt-1.5">
                🛑 <strong>Bot Rule:</strong> Agar market setup ke against chali gayi, to bot bina kisi emotion ke turant exit karke capital bacha lega.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: KB BOT TRADE NAHI LEGA? (NO-TRADE FILTERS & DISCIPLINE) */}
      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Kb Bot Trade NAHI Lega? (False-Signal & Capital Protection Guard)
          </span>
          <span className="text-[11px] text-slate-400">
            Zero emotional trading • Only high-probability setups
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Reason 1 */}
          <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-200/80">
            <div className="flex items-center gap-1.5 text-rose-900 font-bold mb-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Low Volume / Chop Market</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-snug">
              Agar volume 20-period average se 1.35x kam hai, to bot sideways market me trap nahi hoga aur trade avoid karega.
            </p>
          </div>

          {/* Reason 2 */}
          <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-200/80">
            <div className="flex items-center gap-1.5 text-rose-900 font-bold mb-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Session Ke Bahar (Outside Hours)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-snug">
              Session window (08:00 - 23:59 UTC) ke alawa bot trade nahi leta, taaki midnight high broker spreads se bacha ja sake.
            </p>
          </div>

          {/* Reason 3 */}
          <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-200/80">
            <div className="flex items-center gap-1.5 text-rose-900 font-bold mb-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Counter-Trend Trap</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-snug">
              Bot kabhi bhi EMA 21 ke neeche BUY nahi karega, aur EMA 21 ke upar SELL nahi karega. Trend ke against entry strictly banned hai.
            </p>
          </div>

          {/* Reason 4 */}
          <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-200/80">
            <div className="flex items-center gap-1.5 text-rose-900 font-bold mb-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Max Daily Limit Reached</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-snug">
              Ek din me maximum 4 trades ka discipline guard laga hai. Limit hit hone ke baad bot din bhar ke liye automated trade band kar deta hai.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
