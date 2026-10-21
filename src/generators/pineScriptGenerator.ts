import { StrategyConfig } from '../types';

export function generatePineScript(config: StrategyConfig): string {
  const isNeeraj = config.model === 'neeraj-15m';
  const scriptTitle = isNeeraj
    ? 'AlgoMaster Pro - Neeraj Joshi 15M Scalping Strategy'
    : 'AlgoMaster Pro - Gold 15M CHoCH Smart Money Strategy';

  const shortTitle = isNeeraj ? 'NJ_15M_Scalp' : 'Gold_15M_CHoCH';

  return `//@version=5
strategy("${scriptTitle}", shorttitle="${shortTitle}", overlay=true, 
     initial_capital=10000, default_qty_type=strategy.percent_of_equity, default_qty_value=${config.riskPerTradePercent},
     commission_type=strategy.commission.cash_per_contract, commission_value=0.5,
     slippage=2)

// ==========================================================
// AlgoMaster Pro Automated Code Exporter (Pine Script v5)
// Model: ${config.name}
// Symbol: ${config.symbol} | Timeframe: ${config.timeframe}
// Risk-to-Reward: 1:${config.riskReward} | Session: ${config.sessionWindow}
// ==========================================================

// --- General Parameters ---
rrRatio        = input.float(${config.riskReward}, title="Risk to Reward Ratio (1:X)", step=0.5, minval=1.0)
useTrailing    = input.bool(${config.trailingStop}, title="Enable Trailing Stop / Break-Even")
beTriggerRR    = input.float(${config.breakEvenTriggerRR}, title="Break-Even Trigger (in R multiples)", step=0.5)

// --- Session Filter ---
useSession     = input.bool(${config.sessionFilterEnabled}, title="Enable Session Time Filter")
sessionRange   = input.session("${config.sessionStart}-${config.sessionEnd}", title="Trading Session Window")
inSession      = not useSession or not na(time(timeframe.period, sessionRange + ":1234567"))
bgcolor(useSession and inSession ? color.new(color.teal, 93) : na, title="Session Active Highlight")
${
  isNeeraj
    ? `
// --- Neeraj Joshi 15M Scalping Parameters ---
emaFastLen     = input.int(${config.emaFast}, title="Fast EMA Period (Default: 9)", minval=3)
emaSlowLen     = input.int(${config.emaSlow}, title="Slow EMA Period (Default: 21)", minval=10)
rsiPeriod      = input.int(${config.rsiPeriod}, title="RSI Period", minval=2)
rsiLongThresh  = input.int(${config.rsiLongLevel}, title="RSI Long Threshold (Bullish Momentum)", minval=50)
rsiShortThresh = input.int(${config.rsiShortLevel}, title="RSI Short Threshold (Bearish Momentum)", maxval=50)
volMultiplier  = input.float(${config.volumeSurgeMultiplier}, title="Volume Surge Multiplier (> 20 SMA)", step=0.1)
atrMultiplier  = input.float(${config.atrMultiplier}, title="ATR Stop Loss Multiplier", step=0.1)

// --- Indicator Calculations ---
emaFast        = ta.ema(close, emaFastLen)
emaSlow        = ta.ema(close, emaSlowLen)
rsiVal         = ta.rsi(close, rsiPeriod)
volSma         = ta.sma(volume, 20)
atrVal         = ta.atr(14)

plot(emaFast, color=color.rgb(79, 70, 229), linewidth=2, title="Fast EMA (9)")
plot(emaSlow, color=color.rgb(13, 148, 136), linewidth=2, title="Slow EMA (21)")

// --- Strategy Entry Conditions ---
// Long: EMA9 > EMA21, previous bar low touched EMA9, green close, RSI > threshold, Volume Surge
bullCross      = emaFast > emaSlow
bullPullback   = low <= emaFast * 1.002 and close > emaFast and close > open
bullMomentum   = rsiVal >= rsiLongThresh
bullVolume     = volume >= (volSma * volMultiplier)
longCondition  = inSession and bullCross and bullPullback and bullMomentum and bullVolume and strategy.position_size == 0

// Short: EMA9 < EMA21, previous bar high tested EMA9, red close, RSI < threshold, Volume Surge
bearCross      = emaFast < emaSlow
bearPullback   = high >= emaFast * 0.998 and close < emaFast and close < open
bearMomentum   = rsiVal <= rsiShortThresh
bearVolume     = volume >= (volSma * volMultiplier)
shortCondition = inSession and bearCross and bearPullback and bearMomentum and bearVolume and strategy.position_size == 0

// --- Trade Sizing & Execution ---
var float entryPrice = na
var float slPrice    = na
var float tpPrice    = na

if (longCondition)
    entryPrice := close
    slDist      = atrVal * atrMultiplier
    slPrice    := entryPrice - slDist
    tpPrice    := entryPrice + (slDist * rrRatio)
    strategy.entry("NJ_Long", strategy.long)
    strategy.exit("Exit_NJ_Long", "NJ_Long", stop=slPrice, limit=tpPrice)

if (shortCondition)
    entryPrice := close
    slDist      = atrVal * atrMultiplier
    slPrice    := entryPrice + slDist
    tpPrice    := entryPrice - (slDist * rrRatio)
    strategy.entry("NJ_Short", strategy.short)
    strategy.exit("Exit_NJ_Short", "NJ_Short", stop=slPrice, limit=tpPrice)

// Trailing / Move to Break-Even at 1R
if (useTrailing and strategy.position_size > 0)
    if (high >= entryPrice + (entryPrice - slPrice) * beTriggerRR)
        strategy.exit("Exit_NJ_Long", "NJ_Long", stop=entryPrice, limit=tpPrice)

if (useTrailing and strategy.position_size < 0)
    if (low <= entryPrice - (slPrice - entryPrice) * beTriggerRR)
        strategy.exit("Exit_NJ_Short", "NJ_Short", stop=entryPrice, limit=tpPrice)

plotshape(longCondition, title="Long Signal", location=location.belowbar, color=color.teal, style=shape.triangleup, size=size.small, text="BUY SCALP")
plotshape(shortCondition, title="Short Signal", location=location.abovebar, color=color.rose, style=shape.triangledown, size=size.small, text="SELL SCALP")
`
    : `
// --- Gold 15M CHoCH (Smart Money Concepts) Parameters ---
swingLookback  = input.int(${config.swingLookback}, title="Structure Swing Lookback Bars", minval=3)
fvgMinPips     = input.float(${config.fvgThresholdPips}, title="Min FVG Size (in Pips/Points)", step=1.0)
useLiqSweep    = input.bool(${config.liquiditySweepFilter}, title="Require Liquidity Sweep Filter")
atrVal         = ta.atr(14)

// --- Swing High/Low Detection ---
hPivot         = ta.pivothigh(high, swingLookback, swingLookback)
lPivot         = ta.pivotlow(low, swingLookback, swingLookback)

var float lastSwingHigh = na
var float lastSwingLow  = na

if not na(hPivot)
    lastSwingHigh := high[swingLookback]
if not na(lPivot)
    lastSwingLow  := low[swingLookback]

// --- Change of Character (CHoCH) Breakouts ---
// Bullish CHoCH: price swept recent swing low, then closed aggressively above recent swing high
liqSweepLow    = low < lastSwingLow and close > lastSwingLow
chochBull      = ta.crossover(close, lastSwingHigh) and (not useLiqSweep or liqSweepLow[1] or liqSweepLow)
longCondition  = inSession and chochBull and strategy.position_size == 0

// Bearish CHoCH: price swept recent swing high, then closed aggressively below recent swing low
liqSweepHigh   = high > lastSwingHigh and close < lastSwingHigh
chochBear      = ta.crossunder(close, lastSwingLow) and (not useLiqSweep or liqSweepHigh[1] or liqSweepHigh)
shortCondition = inSession and chochBear and strategy.position_size == 0

// --- Execution with Order Block / Invalidation Stop ---
var float entryPrice = na
var float slPrice    = na
var float tpPrice    = na

if (longCondition)
    entryPrice := close
    slDist      = math.max(close - lastSwingLow, atrVal * 1.5)
    slPrice    := entryPrice - slDist
    tpPrice    := entryPrice + (slDist * rrRatio)
    strategy.entry("CHoCH_Long", strategy.long)
    strategy.exit("Exit_CHoCH_Long", "CHoCH_Long", stop=slPrice, limit=tpPrice)

if (shortCondition)
    entryPrice := close
    slDist      = math.max(lastSwingHigh - close, atrVal * 1.5)
    slPrice    := entryPrice + slDist
    tpPrice    := entryPrice - (slDist * rrRatio)
    strategy.entry("CHoCH_Short", strategy.short)
    strategy.exit("Exit_CHoCH_Short", "CHoCH_Short", stop=slPrice, limit=tpPrice)

// Break-Even Invalidation
if (useTrailing and strategy.position_size > 0)
    if (high >= entryPrice + (entryPrice - slPrice) * beTriggerRR)
        strategy.exit("Exit_CHoCH_Long", "CHoCH_Long", stop=entryPrice, limit=tpPrice)

if (useTrailing and strategy.position_size < 0)
    if (low <= entryPrice - (slPrice - entryPrice) * beTriggerRR)
        strategy.exit("Exit_CHoCH_Short", "CHoCH_Short", stop=entryPrice, limit=tpPrice)

plotshape(longCondition, title="Bullish CHoCH", location=location.belowbar, color=color.green, style=shape.labelup, size=size.normal, text="CHoCH BUY")
plotshape(shortCondition, title="Bearish CHoCH", location=location.abovebar, color=color.red, style=shape.labeldown, size=size.normal, text="CHoCH SELL")
`
}
`;
}
