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
import { ArrowDownRight } from 'lucide-react';

interface DrawdownChartProps {
  data: EquityPoint[];
  maxDrawdownPercent: number;
}

export const DrawdownChart: React.FC<DrawdownChartProps> = ({
  data,
  maxDrawdownPercent,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
            <h3 className="font-display font-bold text-slate-900 text-sm">
              Underwater Drawdown Profile
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Peak-to-trough equity decline percentage across trading timeline
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Worst Drawdown Peak
          </span>
          <span className="font-mono text-sm font-bold text-rose-600">
            -{maxDrawdownPercent}%
          </span>
        </div>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="drawdownGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.05} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.35} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              domain={[0, Math.max(Math.ceil(maxDrawdownPercent * 1.2), 5)]}
              reversed={true}
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `-${val}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as EquityPoint;
                  return (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm text-xs">
                      <div className="text-slate-500 font-mono text-[11px] mb-1">{pt.date}</div>
                      <div className="font-semibold text-rose-600">
                        Drawdown: -{pt.drawdownPercent}%
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="drawdownPercent"
              stroke="#f43f5e"
              strokeWidth={1.8}
              fillOpacity={1}
              fill="url(#drawdownGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
