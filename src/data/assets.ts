import { AssetInfo, AssetSymbol } from '../types';

export const ASSETS: Record<AssetSymbol, AssetInfo> = {
  XAUUSD: {
    symbol: 'XAUUSD',
    name: 'Gold vs US Dollar',
    category: 'Forex/Metals',
    pipSize: 0.1, // $0.10 price move per pip
    basePrice: 2384.50,
    spread: 0.25,
    leverage: 100,
    unit: 'oz',
  },
  BTCUSDT: {
    symbol: 'BTCUSDT',
    name: 'Bitcoin / Tether USD',
    category: 'Crypto',
    pipSize: 1.0,
    basePrice: 67420.00,
    spread: 3.50,
    leverage: 50,
    unit: 'BTC',
  },
  NIFTY50: {
    symbol: 'NIFTY50',
    name: 'NSE Nifty 50 Index',
    category: 'Indices',
    pipSize: 0.5,
    basePrice: 24780.00,
    spread: 1.00,
    leverage: 20,
    unit: 'pts',
  },
  BANKNIFTY: {
    symbol: 'BANKNIFTY',
    name: 'NSE Nifty Bank Index',
    category: 'Indices',
    pipSize: 1.0,
    basePrice: 51240.00,
    spread: 2.50,
    leverage: 20,
    unit: 'pts',
  },
  EURUSD: {
    symbol: 'EURUSD',
    name: 'Euro vs US Dollar',
    category: 'Forex/Metals',
    pipSize: 0.0001,
    basePrice: 1.0845,
    spread: 0.00015,
    leverage: 100,
    unit: 'EUR',
  },
};

export const formatPrice = (symbol: AssetSymbol, price: number): string => {
  if (symbol === 'EURUSD') return price.toFixed(4);
  if (symbol === 'XAUUSD') return price.toFixed(2);
  if (symbol === 'BTCUSDT') return price.toFixed(2);
  return price.toFixed(1);
};
