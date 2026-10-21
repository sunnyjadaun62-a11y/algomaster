export type StrategyType = 'neeraj-15m' | 'gold-choch-15m';

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1D';

export type AssetSymbol = 'XAUUSD' | 'BTCUSDT' | 'NIFTY50' | 'BANKNIFTY' | 'EURUSD';

export type AssetCategory = 'Forex/Metals' | 'Crypto' | 'Indices';

export type SessionWindow = 'all' | 'london' | 'ny' | 'asia' | 'custom';

export type RiskRewardRatio = 1.0 | 1.5 | 2.0 | 2.5 | 3.0 | 3.5 | 4.0 | 5.0;

export type SizingType = 'percent_equity' | 'fixed_lots';

export type StopLossMethod = 'swing_structure' | 'atr_multiplier' | 'fixed_pips';

export interface StrategyConfig {
  id: string;
  name: string;
  model: StrategyType;
  symbol: AssetSymbol;
  timeframe: Timeframe;
  riskReward: RiskRewardRatio;
  sessionWindow: SessionWindow;
  sessionStart: string; // e.g. "08:00"
  sessionEnd: string;   // e.g. "16:00"
  sessionFilterEnabled: boolean;
  sizingType: SizingType;
  riskPerTradePercent: number; // e.g. 1.5%
  fixedLotSize: number;       // e.g. 0.5
  stopLossMethod: StopLossMethod;
  atrMultiplier: number;      // e.g. 1.5
  fixedSlPips: number;        // e.g. 25
  breakEvenTriggerRR: number; // e.g. 1.0 (Move to BE when at 1R)
  trailingStop: boolean;
  maxDailyTrades: number;     // e.g. 4 trades max per day
  candleWindow: number;       // 2 or 3 candles validation window
  
  // Neeraj Joshi 15M Scalping strategy parameters
  emaFast: number;            // 9
  emaSlow: number;            // 21
  rsiPeriod: number;          // 14
  rsiLongLevel: number;       // 55
  rsiShortLevel: number;      // 45
  volumeSurgeMultiplier: number; // 1.35x
  vwapFilter: boolean;

  // Gold 15M CHoCH (Smart Money Concepts) parameters
  swingLookback: number;      // 5 bars
  chochConfirmation: 'body_close' | 'wick_break';
  obMitigationDepth: number;  // 50% equilibrium
  fvgThresholdPips: number;   // 8 pips
  liquiditySweepFilter: boolean;
  asianRangeSweep: boolean;
}

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  emaFast?: number;
  emaSlow?: number;
  rsi?: number;
  vwap?: number;
  signal?: 'BUY' | 'SELL';
  signalReason?: string;
  isChoch?: 'BULLISH' | 'BEARISH';
  orderBlock?: { top: number; bottom: number; type: 'BULLISH' | 'BEARISH' };
}

export type TradeDirection = 'LONG' | 'SHORT';
export type TradeStatus = 'WIN' | 'LOSS' | 'OPEN';
export type TradeExitReason = 'TAKE_PROFIT' | 'STOP_LOSS' | 'TRAILING_STOP' | 'SESSION_CLOSE' | 'BREAK_EVEN' | 'MANUAL';

export interface CandleMechanics {
  breakoutLevel: number;
  confirmationType: string;
  invalidationLevel: number;
  candleWindow: number;
  volumeRatio: string;
}

export interface Trade {
  id: string;
  symbol: AssetSymbol;
  direction: TradeDirection;
  entryTime: string;
  entryTimestamp: number;
  entryPrice: number;
  exitTime: string;
  exitTimestamp: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  sizeLots: number;
  pnl: number;
  pnlPercent: number;
  rMultiple: number;
  status: TradeStatus;
  exitReason: TradeExitReason;
  setupDetails: string;
  hinglishExplanation: string; // Beginner-friendly Hindi/Hinglish breakdown
  englishExplanation: string;
  mechanics?: CandleMechanics;
  cumulativeEquity: number;
  drawdownPercent: number;
}

export interface BacktestMetrics {
  initialCapital: number;
  endingCapital: number;
  netProfit: number;
  netProfitPercent: number;
  totalTrades: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  expectancy: number;
  avgWin: number;
  avgLoss: number;
  avgTradeDuration: string;
  longWinRate: number;
  shortWinRate: number;
  longCount: number;
  shortCount: number;
  bestTrade: number;
  worstTrade: number;
}

export interface EquityPoint {
  date: string;
  timestamp: number;
  equity: number;
  drawdownPercent: number;
  tradeEvent?: string;
  pnl?: number;
}

export interface PaperPosition {
  id: string;
  symbol: AssetSymbol;
  direction: TradeDirection;
  entryPrice: number;
  currentPrice: number;
  lotSize: number;
  stopLoss: number;
  takeProfit: number;
  openPnl: number;
  openPnlPercent: number;
  openedAt: string;
  marginUsed: number;
}

export interface PaperOrder {
  id: string;
  symbol: AssetSymbol;
  type: 'MARKET' | 'LIMIT';
  direction: 'BUY' | 'SELL';
  price: number;
  lotSize: number;
  stopLoss?: number;
  takeProfit?: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
  createdAt: string;
}

export interface PaperAccount {
  balance: number;
  equity: number;
  freeMargin: number;
  marginUsed: number;
  marginLevelPercent: number;
  initialDeposit: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalTradesCount: number;
}

export interface AssetInfo {
  symbol: AssetSymbol;
  name: string;
  category: AssetCategory;
  pipSize: number;
  basePrice: number;
  spread: number;
  leverage: number;
  unit: string;
}
