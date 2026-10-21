import { AssetSymbol, Candle, Timeframe } from '../types';
import { ASSETS } from '../data/assets';
import { calculateATR, calculateEMA, calculateRSI } from './indicators';

// Generate realistic candle feed based on chosen symbol and timeframe
export function generateCandles(
  symbol: AssetSymbol,
  timeframe: Timeframe = '15m',
  candleCount: number = 280
): Candle[] {
  const asset = ASSETS[symbol];
  let currentPrice = asset.basePrice;
  const candles: Candle[] = [];

  // Volatility scale relative to base price
  const volatility = currentPrice * 0.0016; 
  
  // Starting date (approx 12-14 trading days ago)
  const now = new Date('2026-10-21T14:30:00Z').getTime();
  const stepMinutes = timeframe === '1m' ? 1 : timeframe === '5m' ? 5 : timeframe === '15m' ? 15 : timeframe === '1h' ? 60 : 240;
  const stepMs = stepMinutes * 60 * 1000;
  const startTime = now - candleCount * stepMs;

  // Multi-phase trending and liquidity cycles
  let trend = 1;
  let cycleCounter = 0;

  for (let i = 0; i < candleCount; i++) {
    cycleCounter++;
    if (cycleCounter % 32 === 0) {
      // Shift trend regime
      trend = trend === 1 ? -1 : 1;
    }

    const candleTimeMs = startTime + i * stepMs;
    const dateObj = new Date(candleTimeMs);
    const hour = dateObj.getUTCHours();
    const minute = dateObj.getUTCMinutes();
    const timeFormatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    // Session volatility multiplier (London 08-16, NY 13-21 higher volatility, Asian lower)
    const isLondon = hour >= 8 && hour < 16;
    const isNY = hour >= 13 && hour < 21;
    const sessionMultiplier = isNY ? 1.4 : isLondon ? 1.25 : 0.75;

    // Price walk with mean reversion + momentum shock waves
    const noise = (Math.random() - 0.485) * volatility * sessionMultiplier;
    const trendDrift = trend * volatility * 0.35 * (Math.sin(i / 10) + 0.5);
    const delta = noise + trendDrift;

    const open = currentPrice;
    let close = open + delta;

    // Intraday wicks
    const maxHighWick = Math.random() * volatility * sessionMultiplier * 0.9;
    const maxLowWick = Math.random() * volatility * sessionMultiplier * 0.9;

    let high = Math.max(open, close) + maxHighWick;
    let low = Math.min(open, close) - maxLowWick;

    // Periodic sweep wicks (especially during London open around 08:00 UTC)
    if (hour === 8 && minute === 15 && Math.random() > 0.4) {
      if (trend === 1) {
        low -= volatility * 2.2; // Liquidity sweep down before bull surge
      } else {
        high += volatility * 2.2; // Liquidity sweep up before bear drop
      }
    }

    // Volume calculation (surge in London / NY open)
    const baseVolume = 1200 + Math.random() * 800;
    const volSurge = (isLondon && (hour === 8 || hour === 9) || isNY && (hour === 13 || hour === 14)) ? 2.1 : 1.0;
    const volume = Math.round(baseVolume * volSurge * (1 + Math.abs(delta) / volatility));

    candles.push({
      time: timeFormatted,
      timestamp: candleTimeMs,
      open: Number(open.toFixed(asset.pipSize < 0.01 ? 4 : 2)),
      high: Number(high.toFixed(asset.pipSize < 0.01 ? 4 : 2)),
      low: Number(low.toFixed(asset.pipSize < 0.01 ? 4 : 2)),
      close: Number(close.toFixed(asset.pipSize < 0.01 ? 4 : 2)),
      volume,
    });

    currentPrice = close;
  }

  // Calculate indicator overlays
  const closes = candles.map((c) => c.close);
  const ema9 = calculateEMA(closes, 9);
  const ema21 = calculateEMA(closes, 21);
  const rsi14 = calculateRSI(closes, 14);

  // Assign indicators
  for (let i = 0; i < candles.length; i++) {
    candles[i].emaFast = Number(ema9[i].toFixed(2));
    candles[i].emaSlow = Number(ema21[i].toFixed(2));
    candles[i].rsi = rsi14[i];
  }

  return candles;
}
