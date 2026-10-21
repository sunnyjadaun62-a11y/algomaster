import React, { useState } from 'react';
import { Trade } from '../../types';
import {
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  GraduationCap,
  Languages,
} from 'lucide-react';

interface TradeHistoryTableProps {
  trades: Trade[];
  onOpenLearningMode?: (tradeId: string) => void;
}

export const TradeHistoryTable: React.FC<TradeHistoryTableProps> = ({
  trades,
  onOpenLearningMode,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'WIN' | 'LOSS' | 'LONG' | 'SHORT'>('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [langMode, setLangMode] = useState<Record<string, 'hinglish' | 'english'>>({});

  const filteredTrades = trades.filter((t) => {
    if (filter === 'WIN' && t.status !== 'WIN') return false;
    if (filter === 'LOSS' && t.status !== 'LOSS') return false;
    if (filter === 'LONG' && t.direction !== 'LONG') return false;
    if (filter === 'SHORT' && t.direction !== 'SHORT') return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.setupDetails.toLowerCase().includes(q) ||
        t.exitReason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportCSV = () => {
    const headers = [
      'Trade ID',
      'Symbol',
      'Direction',
      'Entry Time',
      'Entry Price',
      'Exit Time',
      'Exit Price',
      'Stop Loss',
      'Take Profit',
      'Size Lots',
      'PnL ($)',
      'PnL (%)',
      'R-Multiple',
      'Status',
      'Exit Reason',
      'Setup Reasoning',
    ];

    const rows = trades.map((t) => [
      t.id,
      t.symbol,
      t.direction,
      t.entryTime,
      t.entryPrice,
      t.exitTime,
      t.exitPrice,
      t.stopLoss,
      t.takeProfit,
      t.sizeLots,
      t.pnl,
      t.pnlPercent,
      t.rMultiple,
      t.status,
      t.exitReason,
      `"${t.setupDetails.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `algomaster_pro_trades_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header and Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-slate-900 text-base">
              Trade Execution Journal & Audit Log
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              LEARNING AUDIT
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Chronological audit of fills, exits, and expandable "Why did this trade trigger?" Hinglish learning drawers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search trade or rule..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
            {(['ALL', 'WIN', 'LOSS', 'LONG', 'SHORT'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filter === opt
                    ? 'bg-white text-indigo-700 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* CSV Export */}
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Trade ID</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Entry</th>
              <th className="py-3 px-4">Exit</th>
              <th className="py-3 px-4">SL / TP</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4 text-right">PnL ($)</th>
              <th className="py-3 px-4 text-right">R-Mult</th>
              <th className="py-3 px-4">Exit Reason</th>
              <th className="py-3 px-4 text-center">Why Triggered?</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-10 text-center text-slate-400 font-sans">
                  No trades found matching current filter.
                </td>
              </tr>
            ) : (
              filteredTrades.map((t) => {
                const isWin = t.status === 'WIN';
                const isLong = t.direction === 'LONG';
                const isExpanded = expandedId === t.id;
                const curLang = langMode[t.id] || 'hinglish';

                return (
                  <React.Fragment key={t.id}>
                    <tr
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isExpanded ? 'bg-indigo-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 font-sans">
                        {t.id}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-sans ${
                            isLong
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                          }`}
                        >
                          {isLong ? (
                            <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                          )}
                          {t.direction}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-bold">{t.entryPrice}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{t.entryTime}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-bold">{t.exitPrice}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{t.exitTime}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        <div>SL: <span className="text-rose-600 font-semibold">{t.stopLoss}</span></div>
                        <div>TP: <span className="text-emerald-600 font-semibold">{t.takeProfit}</span></div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {t.sizeLots} L
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold text-sm ${
                          isWin ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isWin ? '+' : ''}${t.pnl}
                        <div className="text-[10px] font-medium font-sans">
                          {isWin ? '+' : ''}{t.pnlPercent}%
                        </div>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          isWin ? 'text-indigo-600' : 'text-slate-500'
                        }`}
                      >
                        {t.rMultiple >= 0 ? `+${t.rMultiple}R` : `${t.rMultiple}R`}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold font-sans uppercase tracking-wide ${
                            t.exitReason === 'TAKE_PROFIT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.exitReason === 'STOP_LOSS'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.exitReason.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : t.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            isExpanded
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                          }`}
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>{isExpanded ? 'Hide' : 'Explain'}</span>
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Trade Reasoning Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-50/70 border-b border-slate-200">
                        <td colSpan={10} className="p-4 font-sans text-xs">
                          <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                                <Lightbulb className="w-4 h-4 text-indigo-600" />
                                <span>Why Did This Trade Trigger? (Learning Mode / सिखने का मोड)</span>
                              </div>

                              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
                                <button
                                  onClick={() =>
                                    setLangMode((prev) => ({ ...prev, [t.id]: 'hinglish' }))
                                  }
                                  className={`px-2.5 py-1 rounded font-semibold transition-all ${
                                    curLang === 'hinglish'
                                      ? 'bg-indigo-600 text-white shadow-sm'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  Hinglish
                                </button>
                                <button
                                  onClick={() =>
                                    setLangMode((prev) => ({ ...prev, [t.id]: 'english' }))
                                  }
                                  className={`px-2.5 py-1 rounded font-semibold transition-all ${
                                    curLang === 'english'
                                      ? 'bg-indigo-600 text-white shadow-sm'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  English
                                </button>
                              </div>
                            </div>

                            <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                              {curLang === 'hinglish'
                                ? t.hinglishExplanation || t.setupDetails
                                : t.englishExplanation || t.setupDetails}
                            </div>

                            {/* Micro-mechanics strip */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono text-slate-500">
                              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                                Breakout Level: <span className="font-bold text-indigo-700">{t.mechanics?.breakoutLevel || t.entryPrice}</span>
                              </div>
                              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                                Volume Surge: <span className="font-bold text-slate-900">{t.mechanics?.volumeRatio || '135%'}</span>
                              </div>
                              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                                Strict Invalidation: <span className="font-bold text-rose-600">{t.stopLoss}</span>
                              </div>
                              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                                Trade Result: <span className={`font-bold ${t.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{t.status} (${t.pnl})</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
