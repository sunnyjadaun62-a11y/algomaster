import { StrategyConfig } from '../types';

export type PineScriptMode = 'indicator' | 'strategy';

export function generatePineScript(config: StrategyConfig, mode: PineScriptMode = 'strategy'): string {
  const isNeeraj = config.model === 'neeraj-15m';
  const scriptTitle = isNeeraj
    ? 'AlgoMaster Pro - Neeraj Joshi 15M Scalping Bot'
    : 'AlgoMaster Pro - Gold 15M CHoCH Smart Money Bot';

  const shortTitle = isNeeraj ? 'NJ_15M_Bot' : 'SMC_CHoCH_Bot';

  const headerDeclaration = mode === 'strategy'
    ? `strategy("${scriptTitle} (Strategy)", shorttitle="${shortTitle}_Strat", overlay=true, 
     initial_capital=10000, default_qty_type=strategy.percent_of_equity, default_qty_value=${config.riskPerTradePercent},
     commission_type=strategy.commission.cash_per_contract, commission_value=0.5,
     slippage=2)`
    : `indicator("${scriptTitle} (Overlay & Alerts)", shorttitle="${shortTitle}_Overlay", overlay=true)`;

  return `//@version=5
${headerDeclaration}

// ==========================================================
// 🚀 AlgoMaster Pro - Institutional TradingView Bot
// Model: ${config.name}
// Symbol: ${config.symbol} | Default TF: ${config.timeframe}
// Mode: ${mode === 'strategy' ? 'Automated Backtester & Strategy' : 'Visual Overlay & Real-Time Alerts'}
// Risk-to-Reward: 1:${config.riskReward} | Session: ${config.sessionWindow}
// ==========================================================

// --- Group: Strategy & Risk Parameters ---
rrRatio        = input.float(${config.riskReward}, title="🎯 Risk to Reward Ratio (1:X)", step=0.5, minval=1.0, group="Risk Management")
useTrailing    = input.bool(${config.trailingStop}, title="🛡️ Enable Trailing Stop / Break-Even", group="Risk Management")
beTriggerRR    = input.float(${config.breakEvenTriggerRR}, title="Break-Even Trigger (in R multiples)", step=0.5, group="Risk Management")
atrMultiplier  = input.float(${config.atrMultiplier}, title="ATR Stop Loss Multiplier", step=0.1, group="Risk Management")

// --- Group: Session Time Window ---
useSession     = input.bool(${config.sessionFilterEnabled}, title="⏰ Enable Trading Session Filter", group="Session Filters")
sessionRange   = input.session("${config.sessionStart}-${config.sessionEnd}", title="Trading Session Window", group="Session Filters")
inSession      = not useSession or not na(time(timeframe.period, sessionRange + ":1234567"))
bgcolor(useSession and inSession ? color.new(color.teal, 94) : na, title="Session Active Highlight")

// --- Group: Indicators (EMA 9 & EMA 21 Ribbon) ---
emaFastLen     = input.int(${config.emaFast}, title="⚡ Fast EMA (9) Period", minval=3, group="Trend & Momentum")
emaSlowLen     = input.int(${config.emaSlow}, title="🌊 Slow EMA (21) Period", minval=10, group="Trend & Momentum")
emaFast        = ta.ema(close, emaFastLen)
emaSlow        = ta.ema(close, emaSlowLen)
atrVal         = ta.atr(14)

pEmaFast       = plot(emaFast, color=color.rgb(2, 132, 199), linewidth=2, title="Fast EMA 9 (Sky Blue)")
pEmaSlow       = plot(emaSlow, color=color.rgb(245, 158, 11), linewidth=2, title="Slow EMA 21 (Amber Orange)")
fill(pEmaFast, pEmaSlow, color=emaFast > emaSlow ? color.new(color.teal, 88) : color.new(color.rose, 88), title="EMA Ribbon Dynamic Cloud")

${
  isNeeraj
    ? `
// --- Neeraj Joshi 15M Scalping Logic ---
rsiPeriod      = input.int(${config.rsiPeriod}, title="RSI Period", minval=2, group="Neeraj Joshi Filters")
rsiLongThresh  = input.int(${config.rsiLongLevel}, title="RSI Long Threshold (Bullish Momentum)", minval=50, group="Neeraj Joshi Filters")
rsiShortThresh = input.int(${config.rsiShortLevel}, title="RSI Short Threshold (Bearish Momentum)", maxval=50, group="Neeraj Joshi Filters")
volMultiplier  = input.float(${config.volumeSurgeMultiplier}, title="Volume Surge Multiplier (> 20 SMA)", step=0.1, group="Neeraj Joshi Filters")

rsiVal         = ta.rsi(close, rsiPeriod)
volSma         = ta.sma(volume, 20)

// Signals:
bullCross      = emaFast > emaSlow
bullPullback   = low <= emaFast * 1.002 and close > emaFast and close > open
bullMomentum   = rsiVal >= rsiLongThresh
bullVolume     = volume >= (volSma * volMultiplier)
longCondition  = inSession and bullCross and bullPullback and bullMomentum and bullVolume

bearCross      = emaFast < emaSlow
bearPullback   = high >= emaFast * 0.998 and close < emaFast and close < open
bearMomentum   = rsiVal <= rsiShortThresh
bearVolume     = volume >= (volSma * volMultiplier)
shortCondition = inSession and bearCross and bearPullback and bearMomentum and bearVolume
`
    : `
// --- Smart Money Concepts (SMC & CHoCH) Logic ---
swingLookback  = input.int(${config.swingLookback}, title="Structure Swing Lookback Bars", minval=3, group="Smart Money Concepts")
useLiqSweep    = input.bool(${config.liquiditySweepFilter}, title="Require Liquidity Sweep Confirmation", group="Smart Money Concepts")

hPivot         = ta.pivothigh(high, swingLookback, swingLookback)
lPivot         = ta.pivotlow(low, swingLookback, swingLookback)

var float lastSwingHigh = na
var float lastSwingLow  = na

if not na(hPivot)
    lastSwingHigh := high[swingLookback]
if not na(lPivot)
    lastSwingLow  := low[swingLookback]

// Change of Character (CHoCH) Breakout detection:
liqSweepLow    = low < lastSwingLow and close > lastSwingLow
chochBull      = ta.crossover(close, lastSwingHigh) and (not useLiqSweep or liqSweepLow[1] or liqSweepLow)
longCondition  = inSession and chochBull

liqSweepHigh   = high > lastSwingHigh and close < lastSwingHigh
chochBear      = ta.crossunder(close, lastSwingLow) and (not useLiqSweep or liqSweepHigh[1] or liqSweepHigh)
shortCondition = inSession and chochBear
`
}

// --- Tracking Levels for Entry, TP, and SL ---
var float liveEntry = na
var float liveSL    = na
var float liveTP    = na
var int activePos   = 0 // 1 for Long, -1 for Short, 0 for Flat

if (longCondition and activePos == 0)
    liveEntry := close
    slDist     = atrVal * atrMultiplier
    liveSL    := liveEntry - slDist
    liveTP    := liveEntry + (slDist * rrRatio)
    activePos := 1

if (shortCondition and activePos == 0)
    liveEntry := close
    slDist     = atrVal * atrMultiplier
    liveSL    := liveEntry + slDist
    liveTP    := liveEntry - (slDist * rrRatio)
    activePos := -1

// Close position logic
if (activePos == 1 and (high >= liveTP or low <= liveSL))
    activePos := 0
if (activePos == -1 and (low <= liveTP or high >= liveSL))
    activePos := 0

// --- Visual Overlay Elements (Labels & Arrows) ---
plotshape(longCondition, title="🟢 Long Entry Signal", location=location.belowbar, color=color.rgb(16, 185, 129), style=shape.labelup, size=size.normal, text="BUY", textcolor=color.white)
plotshape(shortCondition, title="🔴 Short Entry Signal", location=location.abovebar, color=color.rgb(239, 68, 68), style=shape.labeldown, size=size.normal, text="SELL", textcolor=color.white)

// Target & Stop Loss Lines on Active Position
plot(activePos != 0 ? liveTP : na, title="🎯 Take Profit Level", color=color.rgb(16, 185, 129), linewidth=2, style=plot.style_linebr)
plot(activePos != 0 ? liveSL : na, title="🛑 Stop Loss Level", color=color.rgb(239, 68, 68), linewidth=2, style=plot.style_linebr)
plot(activePos != 0 ? liveEntry : na, title="🔵 Entry Price Level", color=color.rgb(59, 130, 246), linewidth=1, style=plot.style_linebr)

${
  mode === 'strategy'
    ? `
// ==========================================================
// ⚙️ Strategy Backtesting Execution Engine
// ==========================================================
if (longCondition and strategy.position_size == 0)
    strategy.entry("Long_Entry", strategy.long)
    strategy.exit("Exit_Long", "Long_Entry", stop=liveSL, limit=liveTP)

if (shortCondition and strategy.position_size == 0)
    strategy.entry("Short_Entry", strategy.short)
    strategy.exit("Exit_Short", "Short_Entry", stop=liveSL, limit=liveTP)

// Break-Even / Trailing Adjustment
if (useTrailing and strategy.position_size > 0)
    if (high >= liveEntry + (liveEntry - liveSL) * beTriggerRR)
        strategy.exit("Exit_Long", "Long_Entry", stop=liveEntry, limit=liveTP)

if (useTrailing and strategy.position_size < 0)
    if (low <= liveEntry - (liveSL - liveEntry) * beTriggerRR)
        strategy.exit("Exit_Short", "Short_Entry", stop=liveEntry, limit=liveTP)
`
    : `
// ==========================================================
// 🔔 Real-Time Audio & Push Notifications
// ==========================================================
alertcondition(longCondition, title="AlgoMaster Pro BUY Triggered", message="🟢 [AlgoMaster Pro] BUY Signal on {{ticker}} at {{close}}! TP: {{plot_0}}, SL: {{plot_1}}")
alertcondition(shortCondition, title="AlgoMaster Pro SELL Triggered", message="🔴 [AlgoMaster Pro] SELL Signal on {{ticker}} at {{close}}! TP: {{plot_0}}, SL: {{plot_1}}")
`
}
`;
}

