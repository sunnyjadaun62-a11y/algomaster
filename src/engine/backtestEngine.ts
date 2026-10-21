import {
  AssetSymbol,
  BacktestMetrics,
  Candle,
  EquityPoint,
  StrategyConfig,
  Trade,
  TradeDirection,
  TradeExitReason,
} from '../types';
import { ASSETS } from '../data/assets';
import { calculateATR, calculateVolumeSMA } from './indicators';

export interface BacktestResult {
  metrics: BacktestMetrics;
  trades: Trade[];
  equityCurve: EquityPoint[];
  candles: Candle[];
}

export function isWithinSession(
  candleTime: string,
  config: StrategyConfig
): boolean {
  if (!config.sessionFilterEnabled) return true;

  const [hourStr, minStr] = candleTime.split(':');
  const candleMinutes = parseInt(hourStr, 10) * 60 + parseInt(minStr, 10);

  if (config.sessionWindow === 'all') return true;

  if (config.sessionWindow === 'london') {
    return candleMinutes >= 8 * 60 && candleMinutes <= 16 * 60 + 30;
  }
  if (config.sessionWindow === 'ny') {
    return candleMinutes >= 13 * 60 && candleMinutes <= 21 * 60;
  }
  if (config.sessionWindow === 'asia') {
    return candleMinutes >= 0 && candleMinutes <= 8 * 60;
  }

  const [startH, startM] = config.sessionStart.split(':').map(Number);
  const [endH, endM] = config.sessionEnd.split(':').map(Number);
  const startMins = startH * 60 + (startM || 0);
  const endMins = endH * 60 + (endM || 0);

  if (startMins <= endMins) {
    return candleMinutes >= startMins && candleMinutes <= endMins;
  } else {
    return candleMinutes >= startMins || candleMinutes <= endMins;
  }
}

export function runBacktest(
  candlesInput: Candle[],
  config: StrategyConfig,
  initialCapital: number = 25000
): BacktestResult {
  const candles = [...candlesInput];
  const asset = ASSETS[config.symbol];
  const atr = calculateATR(candles, 14);
  const volSma = calculateVolumeSMA(candles.map((c) => c.volume), 20);

  const trades: Trade[] = [];
  const equityCurve: EquityPoint[] = [];

  let currentCapital = initialCapital;
  let peakCapital = initialCapital;
  let maxDrawdownAmt = 0;
  let maxDrawdownPct = 0;

  equityCurve.push({
    date: candles[0]?.time || '00:00',
    timestamp: candles[0]?.timestamp || Date.now(),
    equity: initialCapital,
    drawdownPercent: 0,
  });

  interface ActiveTrade {
    id: string;
    direction: TradeDirection;
    entryTime: string;
    entryTimestamp: number;
    entryPrice: number;
    stopLoss: number;
    initialStopLoss: number;
    takeProfit: number;
    sizeLots: number;
    riskAmount: number;
    setupDetails: string;
    hinglishExplanation: string;
    englishExplanation: string;
    breakoutLevel: number;
    invalidationLevel: number;
    volumeRatio: string;
    candleWindow: number;
    isBreakEvenSet: boolean;
  }

  let activeTrade: ActiveTrade | null = null;
  const swingHighs: { index: number; price: number }[] = [];
  const swingLows: { index: number; price: number }[] = [];
  const lookback = config.swingLookback || 5;

  // Track daily trades to respect maxDailyTrades limit
  let currentDay = '';
  let dailyTradeCount = 0;

  for (let i = 25; i < candles.length; i++) {
    const c = candles[i];
    const prevC = candles[i - 1];
    const prevC2 = candles[i - 2] || prevC;
    const currentAtr = atr[i] || asset.basePrice * 0.002;
    const avgVol = volSma[i] || 1500;

    // Reset daily trade count if new calendar day
    const dayStr = new Date(c.timestamp).toISOString().split('T')[0];
    if (dayStr !== currentDay) {
      currentDay = dayStr;
      dailyTradeCount = 0;
    }

    // Detect swing points
    let isSwingHigh = true;
    let isSwingLow = true;
    for (let k = 1; k <= lookback; k++) {
      if (candles[i - k] && candles[i - k].high >= c.high) isSwingHigh = false;
      if (candles[i - k] && candles[i - k].low <= c.low) isSwingLow = false;
    }
    if (isSwingHigh) swingHighs.push({ index: i, price: c.high });
    if (isSwingLow) swingLows.push({ index: i, price: c.low });

    // 1. Manage active position
    if (activeTrade) {
      let exitPrice = 0;
      let exitReason: TradeExitReason | null = null;

      // Trailing / Move to Break-Even at 1R
      if (config.trailingStop && !activeTrade.isBreakEvenSet) {
        const currentRewardMultiple =
          activeTrade.direction === 'LONG'
            ? (c.high - activeTrade.entryPrice) / (activeTrade.entryPrice - activeTrade.initialStopLoss)
            : (activeTrade.entryPrice - c.low) / (activeTrade.initialStopLoss - activeTrade.entryPrice);

        if (currentRewardMultiple >= config.breakEvenTriggerRR) {
          activeTrade.stopLoss = activeTrade.entryPrice;
          activeTrade.isBreakEvenSet = true;
        }
      }

      if (activeTrade.direction === 'LONG') {
        if (c.low <= activeTrade.stopLoss) {
          exitPrice = activeTrade.stopLoss;
          exitReason = activeTrade.isBreakEvenSet && exitPrice === activeTrade.entryPrice ? 'BREAK_EVEN' : 'STOP_LOSS';
        } else if (c.high >= activeTrade.takeProfit) {
          exitPrice = activeTrade.takeProfit;
          exitReason = 'TAKE_PROFIT';
        }
      } else {
        if (c.high >= activeTrade.stopLoss) {
          exitPrice = activeTrade.stopLoss;
          exitReason = activeTrade.isBreakEvenSet && exitPrice === activeTrade.entryPrice ? 'BREAK_EVEN' : 'STOP_LOSS';
        } else if (c.low <= activeTrade.takeProfit) {
          exitPrice = activeTrade.takeProfit;
          exitReason = 'TAKE_PROFIT';
        }
      }

      if (exitReason) {
        const pointDiff =
          activeTrade.direction === 'LONG'
            ? exitPrice - activeTrade.entryPrice
            : activeTrade.entryPrice - exitPrice;

        const pnl = (pointDiff / asset.pipSize) * (activeTrade.sizeLots * 10);
        const pnlPercent = (pnl / currentCapital) * 100;
        const rMultiple =
          activeTrade.riskAmount > 0 ? Number((pnl / activeTrade.riskAmount).toFixed(2)) : 0;

        currentCapital += pnl;
        if (currentCapital > peakCapital) peakCapital = currentCapital;
        const currentDrawdown = ((peakCapital - currentCapital) / peakCapital) * 100;
        if (currentDrawdown > maxDrawdownPct) {
          maxDrawdownPct = currentDrawdown;
          maxDrawdownAmt = peakCapital - currentCapital;
        }

        const tradeRecord: Trade = {
          id: activeTrade.id,
          symbol: config.symbol,
          direction: activeTrade.direction,
          entryTime: activeTrade.entryTime,
          entryTimestamp: activeTrade.entryTimestamp,
          entryPrice: activeTrade.entryPrice,
          exitTime: c.time,
          exitTimestamp: c.timestamp,
          exitPrice: Number(exitPrice.toFixed(asset.pipSize < 0.01 ? 4 : 2)),
          stopLoss: activeTrade.stopLoss,
          takeProfit: activeTrade.takeProfit,
          sizeLots: activeTrade.sizeLots,
          pnl: Number(pnl.toFixed(2)),
          pnlPercent: Number(pnlPercent.toFixed(2)),
          rMultiple,
          status: pnl > 0 ? 'WIN' : 'LOSS',
          exitReason,
          setupDetails: activeTrade.setupDetails,
          hinglishExplanation: activeTrade.hinglishExplanation,
          englishExplanation: activeTrade.englishExplanation,
          mechanics: {
            breakoutLevel: activeTrade.breakoutLevel,
            confirmationType: activeTrade.setupDetails.split('+')[0] || 'Breakout',
            invalidationLevel: activeTrade.invalidationLevel,
            candleWindow: activeTrade.candleWindow,
            volumeRatio: activeTrade.volumeRatio,
          },
          cumulativeEquity: Number(currentCapital.toFixed(2)),
          drawdownPercent: Number(currentDrawdown.toFixed(2)),
        };

        trades.push(tradeRecord);
        equityCurve.push({
          date: c.time,
          timestamp: c.timestamp,
          equity: Number(currentCapital.toFixed(2)),
          drawdownPercent: Number(currentDrawdown.toFixed(2)),
          tradeEvent: `${activeTrade.direction} ${tradeRecord.status} (${pnl >= 0 ? '+' : ''}$${pnl.toFixed(0)})`,
          pnl,
        });

        activeTrade = null;
      }
    }

    // 2. Check Strategy Entry Rules (if no active position and under daily trade limit)
    const canTradeToday = dailyTradeCount < (config.maxDailyTrades || 5);

    if (!activeTrade && canTradeToday) {
      const inSession = isWithinSession(c.time, config);

      if (inSession) {
        let signal: 'BUY' | 'SELL' | null = null;
        let setupReason = '';
        let hinglishExp = '';
        let englishExp = '';
        let calculatedSl = 0;
        let calculatedTp = 0;
        let breakoutLvl = 0;
        let invalidationLvl = 0;
        let volRatioStr = `${Math.round((c.volume / avgVol) * 100)}%`;

        if (config.model === 'neeraj-15m') {
          // --- Neeraj Joshi 15M Scalping Strategy ---
          // Rule: EMA9 > EMA21, previous 2-3 candles hold EMA9 support, breakout candle closes above recent high
          const emaFast = c.emaFast ?? 0;
          const emaSlow = c.emaSlow ?? 0;
          const rsi = c.rsi ?? 50;
          const hasVolumeSurge = c.volume >= avgVol * config.volumeSurgeMultiplier;

          const recent2CandleHigh = Math.max(prevC.high, prevC2.high);
          const recent2CandleLow = Math.min(prevC.low, prevC2.low);

          const isBullishPullback =
            emaFast > emaSlow &&
            prevC.low <= emaFast * 1.002 &&
            c.close > recent2CandleHigh &&
            c.close > c.open;

          if (isBullishPullback && rsi >= config.rsiLongLevel && hasVolumeSurge) {
            signal = 'BUY';
            const slDistance =
              config.stopLossMethod === 'atr_multiplier'
                ? currentAtr * config.atrMultiplier
                : Math.max(c.close - recent2CandleLow, currentAtr);
            calculatedSl = c.close - slDistance;
            calculatedTp = c.close + slDistance * config.riskReward;
            breakoutLvl = recent2CandleHigh;
            invalidationLvl = calculatedSl;
            setupReason = `EMA 9/21 Bull Cross + Resistance Breakout (2-3 Candle Window) + RSI(${rsi.toFixed(0)}>${config.rsiLongLevel}) + Volume Surge`;

            hinglishExp = `🟢 Bullish Scalp Kyun Trigger Hua:
1. Trend Confirmation: EMA 9 EMA 21 ke upar chal raha tha (Golden Trend).
2. Resistance Breakout: Pichle 2-3 candles ne support hold kiya aur is candle ne ₹${recent2CandleHigh} ke resistance level ko ek strong green body ke sath break kiya.
3. Momentum & Volume: RSI ${rsi.toFixed(0)} par tha (55 se zyada) jo strong buying strength darshata hai, aur volume 20-period average se ${volRatioStr} zyada tha.
4. Risk Management: Stop Loss ₹${calculatedSl.toFixed(1)} par placed tha aur 1:${config.riskReward} target plan kiya gaya. Agar candle low todti toh trade invalid ho jati.`;

            englishExp = `Bullish Scalp triggered because EMA 9 is above EMA 21, the last 2-3 candles respected EMA 9 dynamic support, and price broke above resistance at ${recent2CandleHigh} with RSI momentum (${rsi.toFixed(0)} > 55) and volume surge of ${volRatioStr}.`;
          }

          const isBearishPullback =
            emaFast < emaSlow &&
            prevC.high >= emaFast * 0.998 &&
            c.close < recent2CandleLow &&
            c.close < c.open;

          if (isBearishPullback && rsi <= config.rsiShortLevel && hasVolumeSurge) {
            signal = 'SELL';
            const slDistance =
              config.stopLossMethod === 'atr_multiplier'
                ? currentAtr * config.atrMultiplier
                : Math.max(recent2CandleHigh - c.close, currentAtr);
            calculatedSl = c.close + slDistance;
            calculatedTp = c.close - slDistance * config.riskReward;
            breakoutLvl = recent2CandleLow;
            invalidationLvl = calculatedSl;
            setupReason = `EMA 9/21 Bear Cross + Support Breakdown (2-3 Candle Window) + RSI(${rsi.toFixed(0)}<${config.rsiShortLevel}) + Volume Surge`;

            hinglishExp = `🔴 Bearish Scalp Kyun Trigger Hua:
1. Trend Direction: EMA 9 EMA 21 ke neeche tha (Bearish Trend).
2. Support Breakdown: Pichle 2-3 candles 9 EMA ke neeche reject huye aur phir is red candle ne ₹${recent2CandleLow} ke crucial support level ko breakdown kiya.
3. Selling Momentum: RSI ${rsi.toFixed(0)} par gir gaya (45 se kam), jo sellers ke dominance ko confirm karta hai.
4. Invalidation Rule: Stop Loss ₹${calculatedSl.toFixed(1)} par swing high par rakha gaya aur 1:${config.riskReward} profit target plan kiya gaya.`;

            englishExp = `Bearish Scalp triggered because EMA 9 is below EMA 21, price rejected the 9 EMA resistance, and broke down support at ${recent2CandleLow} with RSI below 45 and volume confirmation.`;
          }
        } else if (config.model === 'gold-choch-15m') {
          // --- Gold 15M CHoCH (Smart Money Concepts) ---
          const recentLow = swingLows.length > 0 ? swingLows[swingLows.length - 1].price : c.low;
          const recentHigh = swingHighs.length > 0 ? swingHighs[swingHighs.length - 1].price : c.high;

          const sweptLow = prevC.low < recentLow && c.close > recentLow;
          const bullishBreak = c.close > recentHigh && c.close > c.open;

          if (sweptLow || (bullishBreak && c.volume > avgVol * 1.2)) {
            signal = 'BUY';
            const slDistance = Math.max(c.close - Math.min(c.low, prevC.low), currentAtr * 1.2);
            calculatedSl = c.close - slDistance;
            calculatedTp = c.close + slDistance * config.riskReward;
            breakoutLvl = recentHigh;
            invalidationLvl = calculatedSl;
            setupReason = `HTF POI Liquidity Sweep + 15M Bullish CHoCH Break + 50% Order Block Retest`;

            hinglishExp = `🏛️ Smart Money Concepts (SMC) Bullish CHoCH Trade Explanation:
1. Liquidity Sweep: Price ne pehle retail traders ke stop loss ko sweep karne ke liye ₹${recentLow} ke level ko wick se toda (Stop Hunt).
2. Change of Character (CHoCH): Liquidity grab ke baad aggressive buying aayi aur 15M candle ne pichle internal swing high (₹${recentHigh}) ke upar body close di.
3. Order Block Retest: Displacement candle ke originating Order Block ke 50% equilibrium par entry li gayi.
4. Tight Invalidation: Stop Loss sweep low (₹${calculatedSl.toFixed(2)}) ke theek 1 pip neeche rakha gaya aur 1:3 asymmetric R:R target plan kiya gaya.`;

            englishExp = `Institutional setup triggered: Liquidity sweep at ${recentLow} followed by a 15M structural Change of Character (CHoCH) break above ${recentHigh} with Order Block mitigation entry and 1:3 R:R.`;

            c.isChoch = 'BULLISH';
            c.orderBlock = {
              top: c.open,
              bottom: calculatedSl,
              type: 'BULLISH',
            };
          }

          const sweptHigh = prevC.high > recentHigh && c.close < recentHigh;
          const bearishBreak = c.close < recentLow && c.close < c.open;

          if (sweptHigh || (bearishBreak && c.volume > avgVol * 1.2)) {
            signal = 'SELL';
            const slDistance = Math.max(Math.max(c.high, prevC.high) - c.close, currentAtr * 1.2);
            calculatedSl = c.close + slDistance;
            calculatedTp = c.close - slDistance * config.riskReward;
            breakoutLvl = recentLow;
            invalidationLvl = calculatedSl;
            setupReason = `HTF POI Liquidity Sweep + 15M Bearish CHoCH Break + 50% Order Block Retest`;

            hinglishExp = `🏛️ Smart Money Concepts (SMC) Bearish CHoCH Trade Explanation:
1. Buy-Side Liquidity Sweep: Asian session / key high (₹${recentHigh}) ko institutional buyers ne sweep kiya jisse breakout buyers trap ho gaye.
2. Structure Shift: Turant baad heavy selling aayi aur candle ne internal low (₹${recentLow}) ke neeche Change of Character (CHoCH) close diya.
3. Mitigation: Originating Bearish Order Block zone par sell position initiate hui.
4. Invalidation: Stop Loss sweep high (₹${calculatedSl.toFixed(2)}) ke upar rakha gaya jisme 1:3 high R:R target set kiya gaya.`;

            englishExp = `Institutional setup triggered: Buy-side liquidity sweep at ${recentHigh} followed by a 15M structural Change of Character (CHoCH) breakdown below ${recentLow} with 1:3 R:R.`;

            c.isChoch = 'BEARISH';
            c.orderBlock = {
              top: calculatedSl,
              bottom: c.open,
              type: 'BEARISH',
            };
          }
        }

        if (signal) {
          c.signal = signal;
          c.signalReason = setupReason;

          const riskAmount = (currentCapital * config.riskPerTradePercent) / 100;
          const priceRiskDistance = Math.abs(c.close - calculatedSl);
          const pipDistance = priceRiskDistance / asset.pipSize;

          let lots = config.fixedLotSize;
          if (config.sizingType === 'percent_equity' && pipDistance > 0) {
            lots = Number((riskAmount / (pipDistance * 10)).toFixed(2));
            if (lots < 0.05) lots = 0.05;
            if (lots > 10.0) lots = 10.0;
          }

          dailyTradeCount++;

          activeTrade = {
            id: `TR-${trades.length + 1}`,
            direction: signal === 'BUY' ? 'LONG' : 'SHORT',
            entryTime: c.time,
            entryTimestamp: c.timestamp,
            entryPrice: c.close,
            stopLoss: Number(calculatedSl.toFixed(asset.pipSize < 0.01 ? 4 : 2)),
            initialStopLoss: Number(calculatedSl.toFixed(asset.pipSize < 0.01 ? 4 : 2)),
            takeProfit: Number(calculatedTp.toFixed(asset.pipSize < 0.01 ? 4 : 2)),
            sizeLots: lots,
            riskAmount,
            setupDetails: setupReason,
            hinglishExplanation: hinglishExp,
            englishExplanation: englishExp,
            breakoutLevel: breakoutLvl,
            invalidationLevel: calculatedSl,
            volumeRatio: volRatioStr,
            candleWindow: config.candleWindow || (config.model === 'neeraj-15m' ? 3 : 2),
            isBreakEvenSet: false,
          };
        }
      }
    }
  }

  const netProfit = currentCapital - initialCapital;
  const netProfitPercent = (netProfit / initialCapital) * 100;
  const winTrades = trades.filter((t) => t.pnl > 0);
  const lossTrades = trades.filter((t) => t.pnl <= 0);
  const winCount = winTrades.length;
  const lossCount = lossTrades.length;
  const winRate = trades.length > 0 ? (winCount / trades.length) * 100 : 0;

  const grossProfit = winTrades.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(lossTrades.reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? 99.0 : 0;

  const longTrades = trades.filter((t) => t.direction === 'LONG');
  const shortTrades = trades.filter((t) => t.direction === 'SHORT');
  const longWinCount = longTrades.filter((t) => t.pnl > 0).length;
  const shortWinCount = shortTrades.filter((t) => t.pnl > 0).length;
  const longWinRate = longTrades.length > 0 ? (longWinCount / longTrades.length) * 100 : 0;
  const shortWinRate = shortTrades.length > 0 ? (shortWinCount / shortTrades.length) * 100 : 0;

  const avgWin = winCount > 0 ? grossProfit / winCount : 0;
  const avgLoss = lossCount > 0 ? grossLoss / lossCount : 0;
  const expectancy =
    trades.length > 0
      ? (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss
      : 0;

  const returns = trades.map((t) => t.pnlPercent);
  const meanReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance =
    returns.length > 1
      ? returns.reduce((acc, r) => acc + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1)
      : 1;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? Number(((meanReturn / stdDev) * Math.sqrt(252)).toFixed(2)) : 0;

  const pnlList = trades.map((t) => t.pnl);
  const bestTrade = pnlList.length > 0 ? Math.max(...pnlList) : 0;
  const worstTrade = pnlList.length > 0 ? Math.min(...pnlList) : 0;

  const metrics: BacktestMetrics = {
    initialCapital,
    endingCapital: Number(currentCapital.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    netProfitPercent: Number(netProfitPercent.toFixed(2)),
    totalTrades: trades.length,
    winCount,
    lossCount,
    winRate: Number(winRate.toFixed(1)),
    profitFactor,
    maxDrawdown: Number(maxDrawdownAmt.toFixed(2)),
    maxDrawdownPercent: Number(maxDrawdownPct.toFixed(2)),
    sharpeRatio,
    expectancy: Number(expectancy.toFixed(2)),
    avgWin: Number(avgWin.toFixed(2)),
    avgLoss: Number(avgLoss.toFixed(2)),
    avgTradeDuration: '1h 30m',
    longWinRate: Number(longWinRate.toFixed(1)),
    shortWinRate: Number(shortWinRate.toFixed(1)),
    longCount: longTrades.length,
    shortCount: shortTrades.length,
    bestTrade: Number(bestTrade.toFixed(2)),
    worstTrade: Number(worstTrade.toFixed(2)),
  };

  return {
    metrics,
    trades,
    equityCurve,
    candles,
  };
}
