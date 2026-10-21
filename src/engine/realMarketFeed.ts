import { Candle, Timeframe } from '../types';
import { calculateEMA, calculateRSI } from './indicators';

// Binance interval mapping
export const TIMEFRAME_TO_BINANCE: Record<Timeframe, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1h': '1h',
  '4h': '4h',
  '1d': '1d',
  '1D': '1d',
};

export interface RealMarketStatus {
  isConnected: boolean;
  source: 'BINANCE_PUBLIC_API';
  symbol: string;
  interval: string;
  lastUpdated: string;
  latencyMs: number;
  livePrice: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

/**
 * Fetch real live candlestick (kline) data directly from Binance Public REST API.
 * No API key required. Accessible directly from browser with CORS support.
 */
export async function fetchBinanceKlines(
  symbol: string = 'BTCUSDT',
  timeframe: Timeframe = '15m',
  limit: number = 150
): Promise<{ candles: Candle[]; status: RealMarketStatus }> {
  const startTime = Date.now();
  const binanceInterval = TIMEFRAME_TO_BINANCE[timeframe] || '15m';
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${binanceInterval}&limit=${limit}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Binance data: ${response.status} ${response.statusText}`);
  }

  const rawKlines = await response.json();
  const latencyMs = Date.now() - startTime;

  const candles: Candle[] = rawKlines.map((item: any[]) => {
    const timestamp = Number(item[0]);
    const date = new Date(timestamp);
    const timeFormatted = `${String(date.getUTCHours()).padStart(2, '0')}:${String(
      date.getUTCMinutes()
    ).padStart(2, '0')}`;

    return {
      time: timeFormatted,
      timestamp,
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5]),
    };
  });

  // Calculate Indicator Overlays (EMA 9, EMA 21, RSI 14)
  const closes = candles.map((c) => c.close);
  const ema9 = calculateEMA(closes, 9);
  const ema21 = calculateEMA(closes, 21);
  const rsi14 = calculateRSI(closes, 14);

  // Assign indicators & identify Order Blocks and CHoCH levels
  for (let i = 0; i < candles.length; i++) {
    candles[i].emaFast = Number(ema9[i].toFixed(2));
    candles[i].emaSlow = Number(ema21[i].toFixed(2));
    candles[i].rsi = rsi14[i];

    // Detect Bullish Order Block (Last down candle before strong up move)
    if (i >= 2) {
      const prev2 = candles[i - 2];
      const prev1 = candles[i - 1];
      const curr = candles[i];
      if (prev2.close < prev2.open && curr.close > prev2.high && curr.volume > prev2.volume * 1.2) {
        candles[i].orderBlock = {
          type: 'BULLISH',
          top: prev2.high,
          bottom: prev2.low,
        };
      } else if (prev2.close > prev2.open && curr.close < prev2.low && curr.volume > prev2.volume * 1.2) {
        candles[i].orderBlock = {
          type: 'BEARISH',
          top: prev2.high,
          bottom: prev2.low,
        };
      }
    }
  }

  const latestCandle = candles[candles.length - 1];
  const firstCandle = candles[0];
  const priceChange = ((latestCandle.close - firstCandle.open) / firstCandle.open) * 100;
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const totalVol = candles.reduce((acc, c) => acc + c.volume, 0);

  const status: RealMarketStatus = {
    isConnected: true,
    source: 'BINANCE_PUBLIC_API',
    symbol: symbol.toUpperCase(),
    interval: binanceInterval,
    lastUpdated: new Date().toLocaleTimeString(),
    latencyMs,
    livePrice: latestCandle.close,
    priceChangePercent24h: Number(priceChange.toFixed(2)),
    high24h: Math.max(...highs),
    low24h: Math.min(...lows),
    volume24h: Math.round(totalVol),
  };

  return { candles, status };
}
