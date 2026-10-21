import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { EquityPoint } from '../../types';
import { TrendingUp, Maximize2 } from 'lucide-react';

interface EquityCurveChartProps {
  data: EquityPoint[];
  initialCapital: number;
}

export const EquityCurveChart: React.FC<EquityCurveChartProps> = ({
  data,
  initialCapital,
}) => {
  const currentEquity = data.length > 0 ? data[data.length - 1].equity : initialCapital;
  const netGain = currentEquity - initialCapital;
  const isPositive = netGain >= 0;

  // Min and max for domain
  const equities = data.map((d) => d.equity);
  const minEquity = Math.min(...equities, initialCapital);
  const maxEquity = Math.max(...equities, initialCapital);
  const padding = (maxEquity - minEquity) * 0.1 || 500;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h3 className="font-display font-bold text-slate-900 text-base">
              Cumulative Strategy Equity Curve
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Compounded portfolio value simulation across historical 15M candle sequence
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Ending Portfolio Value
            </span>
            <span
              className={`font-mono text-lg font-bold ${
                isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              ${currentEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              domain={[Math.floor(minEquity - padding), Math.ceil(maxEquity + padding)]}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as EquityPoint;
                  return (
                    <div className="bg-white/95 backdrop-blur p-3 rounded-xl border border-slate-200 shadow-dropdown text-xs min-w-[190px]">
                      <div className="font-semibold text-slate-500 border-b border-slate-100 pb-1.5 mb-1.5 flex justify-between">
                        <span>Timestamp:</span>
                        <span className="font-mono text-slate-800">{pt.date}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-600">Portfolio Value:</span>
                        <span className="font-mono font-bold text-slate-900">
                          ${pt.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-600">Drawdown:</span>
                        <span className="font-mono font-semibold text-rose-600">
                          -{pt.drawdownPercent}%
                        </span>
                      </div>
                      {pt.tradeEvent && (
                        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] font-medium text-indigo-700 bg-indigo-50/70 p-1.5 rounded">
                          {pt.tradeEvent}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="#4f46e5"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#equityGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
