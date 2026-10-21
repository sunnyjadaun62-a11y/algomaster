import { Candle } from '../types';

export function calculateEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const emaArray: number[] = new Array(data.length);

  // Simple moving average for the first point
  let sum = 0;
  for (let i = 0; i < period && i < data.length; i++) {
    sum += data[i];
  }
  let prevEma = sum / Math.min(period, data.length);
  emaArray[Math.min(period, data.length) - 1] = prevEma;

  for (let i = period; i < data.length; i++) {
    const currentEma = data[i] * k + prevEma * (1 - k);
    emaArray[i] = currentEma;
    prevEma = currentEma;
  }

  // Backfill early values for continuity
  for (let i = 0; i < Math.min(period - 1, data.length); i++) {
    emaArray[i] = data[i];
  }

  return emaArray;
}

export function calculateRSI(closes: number[], period: number = 14): number[] {
  const rsi: number[] = new Array(closes.length).fill(50);
  if (closes.length <= period) return rsi;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  rsi[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = Number((100 - 100 / (1 + rs)).toFixed(2));
    }
  }

  return rsi;
}

export function calculateATR(candles: Candle[], period: number = 14): number[] {
  const atr: number[] = new Array(candles.length).fill(0);
  if (candles.length < 2) return atr;

  const trs: number[] = [];
  trs.push(candles[0].high - candles[0].low);

  for (let i = 1; i < candles.length; i++) {
    const h = candles[i].high;
    const l = candles[i].low;
    const prevC = candles[i - 1].close;
    const tr = Math.max(h - l, Math.abs(h - prevC), Math.abs(l - prevC));
    trs.push(tr);
  }

  let sum = 0;
  for (let i = 0; i < period && i < trs.length; i++) {
    sum += trs[i];
  }
  let prevAtr = sum / Math.min(period, trs.length);
  atr[Math.min(period, trs.length) - 1] = prevAtr;

  for (let i = period; i < trs.length; i++) {
    const currentAtr = (prevAtr * (period - 1) + trs[i]) / period;
    atr[i] = currentAtr;
    prevAtr = currentAtr;
  }

  for (let i = 0; i < period; i++) {
    atr[i] = trs[i] || candles[0].high - candles[0].low;
  }

  return atr;
}

export function calculateVolumeSMA(volumes: number[], period: number = 20): number[] {
  const sma: number[] = new Array(volumes.length).fill(0);
  for (let i = 0; i < volumes.length; i++) {
    if (i < period) {
      const sub = volumes.slice(0, i + 1);
      sma[i] = sub.reduce((a, b) => a + b, 0) / (i + 1);
    } else {
      const sub = volumes.slice(i - period + 1, i + 1);
      sma[i] = sub.reduce((a, b) => a + b, 0) / period;
    }
  }
  return sma;
}
