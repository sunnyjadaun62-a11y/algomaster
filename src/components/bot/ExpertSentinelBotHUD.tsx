import React, { useState } from 'react';
import { AssetSymbol, StrategyConfig, TradeDirection } from '../../types';
import { ASSETS, formatPrice } from '../../data/assets';
import { soundAlerts } from '../../utils/audioAlerts';
import {
  Activity,
  Bot,
  Volume2,
  VolumeX,
  Radio,
  Zap,
  TrendingUp,
  ShieldCheck,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Terminal,
  Play,
  Pause,
  AlertCircle,
  BellRing,
} from 'lucide-react';

export interface BotLogEntry {
  id: string;
  timestamp: string;
  type: 'SCAN' | 'SIGNAL' | 'EXECUTION' | 'TP_HIT' | 'SL_HIT' | 'INFO';
  message: string;
  details?: string;
  hinglish?: string;
}

export interface BotAlert {
  id: string;
  timestamp: string;
  direction: TradeDirection;
  symbol: AssetSymbol;
  price: number;
  stopLoss: number;
  takeProfit: number;
  lotSize: number;
  reason: string;
  hinglishReason: string;
}

interface ExpertSentinelBotHUDProps {
  config: StrategyConfig;
  currentPrice: number;
  priceDelta: number;
  autoExecute: boolean;
  onToggleAutoExecute: (enabled: boolean) => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  botLogs: BotLogEntry[];
  latestAlert: BotAlert | null;
  onDismissAlert: () => void;
  onManualTriggerBot: (direction: TradeDirection) => void;
  showVisualizer?: boolean;
  onToggleVisualizer?: () => void;
}

export const ExpertSentinelBotHUD: React.FC<ExpertSentinelBotHUDProps> = ({
  config,
  currentPrice,
  priceDelta,
  autoExecute,
  onToggleAutoExecute,
  soundEnabled,
  onToggleSound,
  botLogs,
  latestAlert,
  onDismissAlert,
  onManualTriggerBot,
  showVisualizer = true,
  onToggleVisualizer,
}) => {
  const [showLogs, setShowLogs] = useState(false);
  const isNeeraj = config.model === 'neeraj-15m';
  const asset = ASSETS[config.symbol];

  const handleTestSound = () => {
    soundAlerts.playBuyTradeSound();
  };

  return (
    <div className="space-y-3">
      {/* 24/7 AI Trading Sentinel Command Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-indigo-900/60 shadow-xl relative overflow-hidden">
        {/* Ambient Glow & Grid Backdrop */}
        <div className="absolute top-0 right-0 w-96 h-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 left-10 w-72 h-32 bg-teal-500/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          {/* Left: Bot Identity & 24/7 Pulse Status */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Bot className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              {/* Radar Live Beacon */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-white">
                  AlgoMaster <span className="text-teal-400">Sentinel AI</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  24/7 ACTIVE CHART SCANNER
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-0.5 flex items-center gap-1.5">
                <span>Monitoring {config.symbol} {config.timeframe} order flow</span>
                <span className="text-slate-500">•</span>
                <span className="text-indigo-300 font-mono">
                  Model: {isNeeraj ? 'Neeraj 15M Scalping' : 'Gold 15M CHoCH (SMC)'}
                </span>
              </p>
            </div>
          </div>

          {/* Right: Master Bot Controls (Auto-Pilot & Sound Toggles) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sound Notification Alert Toggle */}
            <button
              onClick={() => onToggleSound(!soundEnabled)}
              title={soundEnabled ? 'Sound Alerts: Enabled' : 'Sound Alerts: Muted'}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                soundEnabled
                  ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/50 hover:bg-indigo-600/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Sound Alerts ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-500" />
                  <span>Sound Muted</span>
                </>
              )}
            </button>

            {/* Test Chime Button */}
            <button
              onClick={handleTestSound}
              title="Test Web Audio Chime"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <BellRing className="w-4 h-4 text-amber-400" />
            </button>

            {/* 24/7 Autonomous Bot Execution Switch */}
            <button
              onClick={() => onToggleAutoExecute(!autoExecute)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
                autoExecute
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold shadow-emerald-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
              }`}
            >
              {autoExecute ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                  <span>24/7 AUTONOMOUS BOT: ACTIVE</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>ENABLE 24/7 AUTO-PILOT</span>
                </>
              )}
            </button>

            {/* View Bot Decision Stream Toggle */}
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-teal-400" />
              <span>AI Logs ({botLogs.length})</span>
              {showLogs ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Entry & Profit Roadmap Toggle */}
            {onToggleVisualizer && (
              <button
                onClick={onToggleVisualizer}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                  showVisualizer
                    ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white border-teal-400/80 shadow-teal-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-teal-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                <span>Profit Target Roadmap ({showVisualizer ? 'Hide' : 'Show'})</span>
              </button>
            )}
          </div>
        </div>

        {/* Deep Institutional Knowledge HUD Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Market Structure
              </span>
              <span className="font-bold text-slate-200 text-xs truncate">
                {priceDelta >= 0 ? 'Bullish Order Flow ↑' : 'Bearish Distribution ↓'}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Momentum Filter
              </span>
              <span className="font-bold text-indigo-300 text-xs font-mono">
                EMA {config.emaFast}/{config.emaSlow} • RSI {isNeeraj ? '>55' : 'Mitigation'}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Target Risk / Reward
              </span>
              <span className="font-bold text-amber-300 text-xs font-mono">
                1 : {config.riskReward} R:R ({config.stopLossMethod === 'atr_multiplier' ? `${config.atrMultiplier}x ATR` : 'Wick SL'})
              </span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Trading Session
              </span>
              <span className="font-bold text-teal-300 text-xs">
                {config.sessionWindow.toUpperCase()} ({config.sessionStart}-{config.sessionEnd} UTC)
              </span>
            </div>
          </div>
        </div>

        {/* Live Bot Decision & Scanning Feed (Expandable) */}
        {showLogs && (
          <div className="mt-4 pt-3 border-t border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                24/7 Sentinel Deep Knowledge Stream
              </span>
              <span className="text-[11px] text-slate-500">Live tick evaluations</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto space-y-2">
              {botLogs.length === 0 ? (
                <div className="text-slate-500 py-2 text-center text-xs">
                  Bot is actively monitoring {config.symbol} chart in real time...
                </div>
              ) : (
                botLogs.map((log) => {
                  let badge = 'text-slate-400';
                  if (log.type === 'SIGNAL') badge = 'text-amber-400 font-bold';
                  if (log.type === 'EXECUTION') badge = 'text-emerald-400 font-bold';
                  if (log.type === 'TP_HIT') badge = 'text-teal-400 font-bold';
                  if (log.type === 'SL_HIT') badge = 'text-rose-400 font-bold';

                  return (
                    <div key={log.id} className="text-[11px] leading-relaxed">
                      <span className="text-slate-600 mr-2">[{log.timestamp}]</span>
                      <span className={`mr-2 [${log.type}] ${badge}`}>
                        [{log.type}]
                      </span>
                      <span className="text-slate-200">{log.message}</span>
                      {log.details && (
                        <div className="text-slate-400 ml-16 mt-0.5 text-[10px] italic">
                          ↳ {log.details}
                        </div>
                      )}
                      {log.hinglish && (
                        <div className="text-emerald-300/80 ml-16 text-[10px]">
                          🇮🇳 {log.hinglish}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* AUDIO + VISUAL HIGH-PRIORITY BOT TRADE EXECUTION NOTIFICATION */}
      {latestAlert && (
        <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-2xl p-5 relative animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden">
          {/* Top colored accent stripe */}
          <div
            className={`absolute top-0 left-0 right-0 h-1.5 ${
              latestAlert.direction === 'LONG' ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-md ${
                  latestAlert.direction === 'LONG'
                    ? 'bg-emerald-600'
                    : 'bg-rose-600'
                }`}
              >
                <Bot className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                    🔊 SOUND ALERT • BOT TRADE EXECUTED
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {latestAlert.timestamp}
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-slate-900 text-base sm:text-lg mt-1">
                  {latestAlert.direction === 'LONG' ? 'BUY / LONG' : 'SELL / SHORT'} {latestAlert.lotSize} Lot {latestAlert.symbol} @ {formatPrice(latestAlert.symbol, latestAlert.price)}
                </h3>

                {/* SL / TP Summary */}
                <div className="flex flex-wrap gap-2 mt-2 font-mono text-xs">
                  <span className="px-2 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-semibold">
                    Stop Loss (SL): {formatPrice(latestAlert.symbol, latestAlert.stopLoss)}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                    Take Profit (TP): {formatPrice(latestAlert.symbol, latestAlert.takeProfit)}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold font-sans">
                    1 : {config.riskReward} R:R Target
                  </span>
                </div>

                {/* Deep Institutional Reasoning */}
                <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Deep Quant Reasoning (Chart Analysis):</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-sans">
                    {latestAlert.reason}
                  </p>
                  <p className="text-emerald-800 font-medium pt-1 border-t border-slate-200/80">
                    🇮🇳 <strong>Hinglish Guide:</strong> {latestAlert.hinglishReason}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onDismissAlert}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Acknowledge & Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
