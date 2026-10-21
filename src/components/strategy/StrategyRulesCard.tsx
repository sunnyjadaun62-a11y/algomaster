import React from 'react';
import { StrategyConfig } from '../../types';
import { STRATEGY_DETAILS } from '../../data/presets';
import { BookOpen, Check, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface StrategyRulesCardProps {
  config: StrategyConfig;
}

export const StrategyRulesCard: React.FC<StrategyRulesCardProps> = ({ config }) => {
  const details = STRATEGY_DETAILS[config.model];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <h4 className="font-display font-bold text-slate-900 text-sm">
            {details.title} — Operational Rules
          </h4>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {details.badge}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Long Setup Rules */}
        <div className="bg-emerald-50/40 border border-emerald-200/60 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 text-emerald-800 font-bold text-sm">
            <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span>BULLISH / LONG ENTRY BLUEPRINT</span>
          </div>
          <ul className="space-y-2.5">
            {details.rules[0].conditions.map((cond, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                  ✓
                </span>
                <span>{cond}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Short Setup Rules */}
        <div className="bg-rose-50/40 border border-rose-200/60 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 text-rose-800 font-bold text-sm">
            <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span>BEARISH / SHORT ENTRY BLUEPRINT</span>
          </div>
          <ul className="space-y-2.5">
            {details.rules[1].conditions.map((cond, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                  ✓
                </span>
                <span>{cond}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
