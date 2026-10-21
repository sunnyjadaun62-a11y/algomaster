import React, { useState } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AssetSymbol, Candle } from '../../types';
import { formatPrice } from '../../data/assets';
import { LineChart as ChartIcon, Eye, Zap, Layers } from 'lucide-react';

interface CandleStrategyChartProps {
  candles: Candle[];
  symbol: AssetSymbol;
}

export const CandleStrategyChart: React.FC<CandleStrategyChartProps> = ({
  candles,
  symbol,
}) => {
  const [rangeCount, setRangeCount] = useState<number>(70);
  const displayCandles = candles.slice(-rangeCount);

  // Compute price min/max
  const lows = displayCandles.map((c) => c.low);
  const highs = displayCandles.map((c) => c.high);
  const minPrice = Math.min(...lows);
  const maxPrice = Math.max(...highs);
  const pad = (maxPrice - minPrice) * 0.08 || 5;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <ChartIcon className="w-4 h-4 text-indigo-600" />
            <h3 className="font-display font-bold text-slate-900 text-base">
              Market Execution & Indicator Overlay Chart
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Realized 15M price candles with dynamic Fast/Slow EMAs and algorithmic Buy/Sell signal markers
          </p>
        </div>

        {/* Legend & Zoom options */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-indigo-600 rounded"></span>
              <span className="text-slate-600 font-medium">Fast EMA (9)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-teal-600 rounded"></span>
              <span className="text-slate-600 font-medium">Slow EMA (21)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-emerald-700 font-medium">Buy Signal</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-rose-700 font-medium">Sell Signal</span>
            </span>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            {[40, 70, 120].map((bars) => (
              <button
                key={bars}
                onClick={() => setRangeCount(bars)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  rangeCount === bars
                    ? 'bg-white text-indigo-700 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {bars}b
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={displayCandles} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              domain={[minPrice - pad, maxPrice + pad]}
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => formatPrice(symbol, val)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const candle = payload[0].payload as Candle;
                  const isBull = candle.close >= candle.open;
                  return (
                    <div className="bg-white/95 backdrop-blur p-3 rounded-xl border border-slate-200 shadow-dropdown text-xs min-w-[200px]">
                      <div className="font-semibold text-slate-700 border-b border-slate-100 pb-1 mb-1.5 flex justify-between">
                        <span>Time: {candle.time}</span>
                        <span className={isBull ? 'text-emerald-600' : 'text-rose-600'}>
                          {isBull ? 'Bullish' : 'Bearish'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[11px]">
                        <div>O: <span className="font-semibold">{candle.open}</span></div>
                        <div>H: <span className="font-semibold">{candle.high}</span></div>
                        <div>L: <span className="font-semibold">{candle.low}</span></div>
                        <div>C: <span className="font-semibold">{candle.close}</span></div>
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
                        <span>EMA9: <span className="font-mono text-indigo-600 font-bold">{candle.emaFast}</span></span>
                        <span>EMA21: <span className="font-mono text-teal-600 font-bold">{candle.emaSlow}</span></span>
                        <span>RSI: <span className="font-mono font-bold text-slate-700">{candle.rsi}</span></span>
                      </div>
                      {candle.signal && (
                        <div
                          className={`mt-2 p-1.5 rounded text-[11px] font-bold text-center ${
                            candle.signal === 'BUY'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          ⚡ {candle.signal} SIGNAL TRIGGERED
                          <div className="text-[10px] font-normal text-slate-700 mt-0.5">
                            {candle.signalReason}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Candle Price Line */}
            <Line
              type="monotone"
              dataKey="close"
              stroke="#0f172a"
              strokeWidth={1.5}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.signal === 'BUY') {
                  return (
                    <svg
                      key={`buy-${payload.time}`}
                      x={cx - 7}
                      y={cy - 16}
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                    >
                      <polygon points="12 2 22 20 2 20" />
                    </svg>
                  );
                }
                if (payload.signal === 'SELL') {
                  return (
                    <svg
                      key={`sell-${payload.time}`}
                      x={cx - 7}
                      y={cy + 4}
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="#f43f5e"
                      stroke="#ffffff"
                      strokeWidth="2"
                    >
                      <polygon points="12 22 2 4 22 4" />
                    </svg>
                  );
                }
                return null;
              }}
            />

            {/* Fast EMA */}
            <Line
              type="monotone"
              dataKey="emaFast"
              stroke="#4f46e5"
              strokeWidth={1.8}
              dot={false}
            />

            {/* Slow EMA */}
            <Line
              type="monotone"
              dataKey="emaSlow"
              stroke="#0d9488"
              strokeWidth={1.8}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
