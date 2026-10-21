import React, { useState, useEffect } from 'react';
import {
  AssetSymbol,
  PaperAccount,
  PaperOrder,
  PaperPosition,
  StrategyConfig,
  TradeDirection,
} from '../../types';
import { ASSETS, formatPrice } from '../../data/assets';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  RotateCcw,
  PlusCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Activity,
  Zap,
} from 'lucide-react';

interface PaperTradingViewProps {
  config: StrategyConfig;
  currentPrice: number;
  priceDelta: number;
  account: PaperAccount;
  positions: PaperPosition[];
  onOpenPosition: (direction: TradeDirection, lots: number, sl: number, tp: number) => void;
  onClosePosition: (id: string) => void;
  onMoveToBreakEven: (id: string) => void;
  onResetAccount: (amount: number) => void;
  autoExecuteSignals: boolean;
  onToggleAutoExecute: (enabled: boolean) => void;
  closedTrades: any[];
}

export const PaperTradingView: React.FC<PaperTradingViewProps> = ({
  config,
  currentPrice,
  priceDelta,
  account,
  positions,
  onOpenPosition,
  onClosePosition,
  onMoveToBreakEven,
  onResetAccount,
  autoExecuteSignals,
  onToggleAutoExecute,
  closedTrades,
}) => {
  const asset = ASSETS[config.symbol];
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [lotSize, setLotSize] = useState<number>(0.5);
  const [customSl, setCustomSl] = useState<number>(0);
  const [customTp, setCustomTp] = useState<number>(0);

  // Auto-calculate suggested SL & TP based on current price and strategy config
  useEffect(() => {
    const slDist = currentPrice * 0.0025; // ~25 pips default
    setCustomSl(Number((currentPrice - slDist).toFixed(asset.pipSize < 0.01 ? 4 : 2)));
    setCustomTp(
      Number((currentPrice + slDist * config.riskReward).toFixed(asset.pipSize < 0.01 ? 4 : 2))
    );
  }, [currentPrice, config.riskReward, config.symbol]);

  const handleBuy = () => {
    const sl = customSl || currentPrice - currentPrice * 0.003;
    const tp = customTp || currentPrice + (currentPrice - sl) * config.riskReward;
    onOpenPosition('LONG', lotSize, sl, tp);
  };

  const handleSell = () => {
    const sl = currentPrice + currentPrice * 0.003;
    const tp = currentPrice - (sl - currentPrice) * config.riskReward;
    onOpenPosition('SHORT', lotSize, sl, tp);
  };

  const totalFloatingPnl = positions.reduce((acc, p) => acc + p.openPnl, 0);
  const isPnlPositive = totalFloatingPnl >= 0;

  return (
    <div className="space-y-6">
      {/* Account Balance & Portfolio Summary Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100/80 text-teal-700 flex items-center justify-center">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-slate-900 text-lg">
                  Paper Trading Virtual Account
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  LIVE TICK EXECUTION
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Institutional order matching engine with zero financial risk
              </p>
            </div>
          </div>

          {/* Reset Account Options */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Reset Capital:</span>
            {[10000, 25000, 50000, 100000].map((amt) => (
              <button
                key={amt}
                onClick={() => onResetAccount(amt)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  account.initialDeposit === amt
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                ${amt / 1000}k
              </button>
            ))}
          </div>
        </div>

        {/* Account KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
              Account Balance
            </span>
            <div className="font-mono text-xl font-bold text-slate-900">
              ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
              Floating Equity
            </span>
            <div
              className={`font-mono text-xl font-bold ${
                isPnlPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              ${account.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
              Open Floating P&L
            </span>
            <div
              className={`font-mono text-xl font-bold ${
                isPnlPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isPnlPositive ? '+' : ''}${totalFloatingPnl.toFixed(2)}
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
              Margin In Use
            </span>
            <div className="font-mono text-xl font-bold text-slate-700">
              ${account.marginUsed.toFixed(2)}
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
              Realized Strategy P&L
            </span>
            <div
              className={`font-mono text-xl font-bold ${
                account.realizedPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {account.realizedPnl >= 0 ? '+' : ''}${account.realizedPnl.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Placement Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              <h4 className="font-display font-bold text-slate-900 text-sm">
                Place Virtual Order
              </h4>
            </div>
            <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              {config.symbol}
            </span>
          </div>

          {/* Auto-execution toggle */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 p-3.5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-950 block">
                Auto-Trade Strategy Signals
              </span>
              <span className="text-[11px] text-indigo-700">
                Auto-execute when {config.name.split(' ')[0]} triggers
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoExecuteSignals}
                onChange={(e) => onToggleAutoExecute(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Current Mark Ticker */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Live Real-Time Price
            </span>
            <div className="font-mono text-2xl font-bold text-slate-900 tracking-tight my-0.5">
              {formatPrice(config.symbol, currentPrice)}
            </div>
            <span
              className={`text-xs font-semibold ${
                priceDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {priceDelta >= 0 ? '▲' : '▼'} {priceDelta.toFixed(2)}% Intraday
            </span>
          </div>

          {/* Lot Size Slider */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Lot Size / Volume:</span>
              <span className="font-bold text-slate-900 font-mono">{lotSize} Lots</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={lotSize}
              onChange={(e) => setLotSize(parseFloat(e.target.value) || 0.1)}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
              <span>0.1L</span>
              <span>1.0L</span>
              <span>2.5L</span>
              <span>5.0L</span>
            </div>
          </div>

          {/* SL & TP Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Stop Loss ($)
              </label>
              <input
                type="number"
                step={asset.pipSize}
                value={customSl}
                onChange={(e) => setCustomSl(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-mono bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Take Profit ($)
              </label>
              <input
                type="number"
                step={asset.pipSize}
                value={customTp}
                onChange={(e) => setCustomTp(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-mono bg-white"
              />
            </div>
          </div>

          {/* Buy & Sell Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleBuy}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-sm transition-all flex flex-col items-center justify-center gap-0.5"
            >
              <span className="flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4 stroke-[3]" /> BUY / LONG
              </span>
              <span className="text-[10px] opacity-80 font-mono">
                Ask: {formatPrice(config.symbol, currentPrice + asset.spread / 2)}
              </span>
            </button>

            <button
              onClick={handleSell}
              className="py-3 px-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-sm transition-all flex flex-col items-center justify-center gap-0.5"
            >
              <span className="flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4 stroke-[3]" /> SELL / SHORT
              </span>
              <span className="text-[10px] opacity-80 font-mono">
                Bid: {formatPrice(config.symbol, currentPrice - asset.spread / 2)}
              </span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            Standard 1:{asset.leverage} Virtual Leverage Applied
          </div>
        </div>

        {/* Active Positions Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <h4 className="font-display font-bold text-slate-900 text-sm">
                  Active Virtual Positions ({positions.length})
                </h4>
              </div>
              <span className="text-xs text-slate-500">
                P&L ticks live against market quote
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Symbol</th>
                    <th className="py-2.5 px-3">Entry</th>
                    <th className="py-2.5 px-3">Mark Price</th>
                    <th className="py-2.5 px-3">SL / TP</th>
                    <th className="py-2.5 px-3 text-right">Floating PnL</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {positions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                        No active open positions. Place an order or enable Auto-Trade to simulate!
                      </td>
                    </tr>
                  ) : (
                    positions.map((pos) => {
                      const isLong = pos.direction === 'LONG';
                      const isWin = pos.openPnl >= 0;

                      return (
                        <tr key={pos.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-sans ${
                                isLong
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {pos.direction} {pos.lotSize}L
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-800">
                            {pos.symbol}
                          </td>
                          <td className="py-3 px-3 text-slate-700">
                            {pos.entryPrice}
                          </td>
                          <td className="py-3 px-3 font-bold text-indigo-700">
                            {pos.currentPrice}
                          </td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            <div>SL: <span className="text-rose-600">{pos.stopLoss}</span></div>
                            <div>TP: <span className="text-emerald-600">{pos.takeProfit}</span></div>
                          </td>
                          <td
                            className={`py-3 px-3 text-right font-bold text-sm ${
                              isWin ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isWin ? '+' : ''}${pos.openPnl.toFixed(2)}
                            <div className="text-[10px] font-medium font-sans">
                              {isWin ? '+' : ''}{pos.openPnlPercent.toFixed(2)}%
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center space-x-1.5 font-sans">
                              <button
                                onClick={() => onMoveToBreakEven(pos.id)}
                                title="Set Stop Loss to Entry"
                                className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                              >
                                BE
                              </button>
                              <button
                                onClick={() => onClosePosition(pos.id)}
                                className="px-2 py-1 text-[11px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded transition-colors"
                              >
                                Close
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Fills History Footer */}
          {closedTrades.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Recent Paper Simulator Fills
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {closedTrades.slice(-4).map((tr, idx) => (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold border ${
                      tr.pnl >= 0
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {tr.direction} {tr.symbol}: {tr.pnl >= 0 ? '+' : ''}${tr.pnl.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
