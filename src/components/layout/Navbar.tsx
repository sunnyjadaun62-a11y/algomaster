import React from 'react';
import {
  Layers,
  CandlestickChart,
  ArrowRightLeft,
  Cpu,
} from 'lucide-react';

export type ActiveTab = 'workflow' | 'chart' | 'compiler' | 'simulation';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  tradeCount: number;
  openPositionsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  tradeCount,
  openPositionsCount,
}) => {
  const tabs = [
    {
      id: 'workflow' as ActiveTab,
      label: '1. Strategy Workflow Builder',
      icon: Layers,
      badge: 'Visual No-Code',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    },
    {
      id: 'chart' as ActiveTab,
      label: '2. TradingView Chart & Bars',
      icon: CandlestickChart,
      badge: 'Candles & OHLC',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200/80',
    },
    {
      id: 'compiler' as ActiveTab,
      label: '3. Pine Script Bi-Directional Compiler',
      icon: ArrowRightLeft,
      badge: 'v5 Generator & Parser',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200/80',
    },
    {
      id: 'simulation' as ActiveTab,
      label: '4. Paper Trading & Backtesting Core',
      icon: Cpu,
      badge:
        openPositionsCount > 0
          ? `${openPositionsCount} Live Positions`
          : `${tradeCount} Historical Trades`,
      badgeColor:
        openPositionsCount > 0
          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold animate-pulse'
          : 'bg-slate-100 text-slate-700 border-slate-200',
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <nav className="flex space-x-1.5 sm:space-x-3 lg:space-x-5 overflow-x-auto py-2.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-3 sm:px-3.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-50/90 text-indigo-900 border border-indigo-200/80 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-indigo-600 stroke-[2.3]' : 'text-slate-400'
                    }`}
                  />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};
