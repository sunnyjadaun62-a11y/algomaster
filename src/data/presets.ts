import { StrategyConfig } from '../types';

export const STRATEGY_PRESETS: Record<string, StrategyConfig> = {
  'neeraj-15m': {
    id: 'neeraj-15m',
    name: 'Neeraj Joshi 15M Scalping Strategy',
    model: 'neeraj-15m',
    symbol: 'NIFTY50',
    timeframe: '15m',
    riskReward: 2.0,
    sessionWindow: 'london',
    sessionStart: '09:15',
    sessionEnd: '15:30',
    sessionFilterEnabled: true,
    sizingType: 'percent_equity',
    riskPerTradePercent: 1.5,
    fixedLotSize: 1.0,
    stopLossMethod: 'atr_multiplier',
    atrMultiplier: 1.5,
    fixedSlPips: 30,
    breakEvenTriggerRR: 1.0,
    trailingStop: true,
    maxDailyTrades: 4,
    candleWindow: 3,

    // Specific Scalping params
    emaFast: 9,
    emaSlow: 21,
    rsiPeriod: 14,
    rsiLongLevel: 55,
    rsiShortLevel: 45,
    volumeSurgeMultiplier: 1.3,
    vwapFilter: true,

    // CHoCH dummy defaults
    swingLookback: 5,
    chochConfirmation: 'body_close',
    obMitigationDepth: 50,
    fvgThresholdPips: 8,
    liquiditySweepFilter: false,
    asianRangeSweep: false,
  },

  'gold-choch-15m': {
    id: 'gold-choch-15m',
    name: 'Gold 15M CHoCH (Change of Character / SMC)',
    model: 'gold-choch-15m',
    symbol: 'XAUUSD',
    timeframe: '15m',
    riskReward: 3.0,
    sessionWindow: 'london',
    sessionStart: '08:00',
    sessionEnd: '17:00',
    sessionFilterEnabled: true,
    sizingType: 'percent_equity',
    riskPerTradePercent: 2.0,
    fixedLotSize: 0.5,
    stopLossMethod: 'swing_structure',
    atrMultiplier: 1.8,
    fixedSlPips: 25,
    breakEvenTriggerRR: 1.0,
    trailingStop: true,
    maxDailyTrades: 3,
    candleWindow: 2,

    // Neeraj dummy defaults
    emaFast: 9,
    emaSlow: 21,
    rsiPeriod: 14,
    rsiLongLevel: 55,
    rsiShortLevel: 45,
    volumeSurgeMultiplier: 1.2,
    vwapFilter: false,

    // CHoCH specific params
    swingLookback: 5,
    chochConfirmation: 'body_close',
    obMitigationDepth: 50,
    fvgThresholdPips: 8,
    liquiditySweepFilter: true,
    asianRangeSweep: true,
  },
};

export const STRATEGY_DETAILS = {
  'neeraj-15m': {
    title: 'Neeraj Joshi 15M Scalping Strategy',
    subtitle: 'Green/Red Resistance & Support Breakout with 2-3 Candle Validation',
    badge: 'Trend & Scalping',
    tagline: 'EMA 9/21 Dynamic Cross + Resistance Breakout Confirmation + 1:2 R:R',
    description:
      'Renowned intraday methodology designed by Neeraj Joshi for liquid index and stock charts. Trades green/red candle breakouts at key support/resistance zones within a 2-3 candle window after a 9/21 EMA trend alignment, verified by RSI expansion beyond 55/45 and high volume surge.',
    rules: [
      {
        type: 'LONG',
        conditions: [
          'EMA 9 is actively trading above EMA 21 (Bullish trend confirmed)',
          'Previous 2-3 candles test and hold support near the 9 EMA dynamic zone',
          'Breakout Candle closes strongly above the high of the last 2 candles',
          'RSI (14) expands above 55 confirming genuine buying momentum',
          'Volume on breakout candle is > 1.3x 20-period Volume SMA',
          'Stop Loss placed below the swing low / 1.5x ATR with 1:2 R:R target',
        ],
      },
      {
        type: 'SHORT',
        conditions: [
          'EMA 9 is actively trading below EMA 21 (Bearish trend confirmed)',
          'Previous 2-3 candles test and reject resistance underneath the 9 EMA',
          'Breakout Candle breaks and closes below the low of the last 2 candles',
          'RSI (14) drops below 45 confirming downward displacement',
          'Volume on breakdown candle is > 1.3x 20-period Volume SMA',
          'Stop Loss placed above the swing high / 1.5x ATR with 1:2 R:R target',
        ],
      },
    ],
  },
  'gold-choch-15m': {
    title: 'Gold 15M CHoCH Model (Smart Money Concepts)',
    subtitle: 'HTF POI + Liquidity Sweep + CHoCH Candle Close + Order Block Retest',
    badge: 'Smart Money / SMC',
    tagline: 'Institutional Liquidity Raid + 15M Change of Character + 1:3 R:R',
    description:
      'Engineered specifically for the high-volatility dynamics of Gold (XAU/USD). Identifies institutional liquidity sweeps at Higher Timeframe Points of Interest (POI) or Asian session highs/lows, followed by an aggressive structural Change of Character (CHoCH) candle close and a precise limit entry at the 50% Order Block retest.',
    rules: [
      {
        type: 'LONG',
        conditions: [
          'Higher Timeframe POI Alignment: Asian low or key internal swing low is swept with a wick',
          '15M Bullish CHoCH: Price displaces upward and closes above the recent swing high',
          'Originating Bullish Order Block (last down-candle before displacement) identified',
          'Limit entry executed upon 50% equilibrium retest of the Order Block zone',
          'Stop Loss placed 1-2 pips below the liquidity sweep low (strict invalidation)',
          'Take Profit set at 1:3 Risk-to-Reward targeting opposing liquidity pool',
        ],
      },
      {
        type: 'SHORT',
        conditions: [
          'Higher Timeframe POI Alignment: Asian high or key internal swing high is swept with a wick',
          '15M Bearish CHoCH: Price displaces downward and closes below the recent swing low',
          'Originating Bearish Order Block (last up-candle before displacement) identified',
          'Limit entry executed upon 50% equilibrium retest of the Order Block zone',
          'Stop Loss placed 1-2 pips above the liquidity sweep high (strict invalidation)',
          'Take Profit set at 1:3 Risk-to-Reward targeting opposing liquidity pool',
        ],
      },
    ],
  },
};
