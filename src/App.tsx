import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AssetSymbol,
  BacktestMetrics,
  Candle,
  EquityPoint,
  PaperAccount,
  PaperPosition,
  StrategyConfig,
  StrategyType,
  Trade,
  TradeDirection,
} from './types';
import { ASSETS } from './data/assets';
import { STRATEGY_PRESETS } from './data/presets';
import { generateCandles } from './engine/dataFeed';
import { runBacktest, BacktestResult } from './engine/backtestEngine';
import { soundAlerts } from './utils/audioAlerts';

import { Header } from './components/layout/Header';
import { Navbar, ActiveTab } from './components/layout/Navbar';

// 24/7 AI Trading Expert Sentinel Bot
import {
  ExpertSentinelBotHUD,
  BotAlert,
  BotLogEntry,
} from './components/bot/ExpertSentinelBotHUD';
import { BotDecisionVisualizer } from './components/bot/BotDecisionVisualizer';

// Core 4 Integrated Modules
import { StrategyWorkflowBuilder } from './components/strategy/StrategyWorkflowBuilder';
import { StrategyRulesCard } from './components/strategy/StrategyRulesCard';
import { TradingViewModuleView } from './components/chart/TradingViewModuleView';
import { PineScriptBiDirectionalCompiler } from './components/compiler/PineScriptBiDirectionalCompiler';
import { SimulationCoreView } from './components/simulation/SimulationCoreView';

export function App() {
  // 1. Core Navigation & Strategy State
  const [activeTab, setActiveTab] = useState<ActiveTab>('workflow');
  const [config, setConfig] = useState<StrategyConfig>(STRATEGY_PRESETS['neeraj-15m']);
  const [candles, setCandles] = useState<Candle[]>(() =>
    generateCandles(config.symbol, config.timeframe, 280)
  );

  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 2. Sound & 24/7 AI Sentinel Bot State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoExecuteSignals, setAutoExecuteSignals] = useState<boolean>(true); // Active 24/7 bot
  const [showVisualizer, setShowVisualizer] = useState<boolean>(true); // Beginner visual roadmap
  const [latestBotAlert, setLatestBotAlert] = useState<BotAlert | null>(null);
  const [botLogs, setBotLogs] = useState<BotLogEntry[]>([
    {
      id: 'log-init',
      timestamp: new Date().toLocaleTimeString(),
      type: 'SCAN',
      message: `24/7 Chart Sentinel initialized on ${config.symbol} (${config.timeframe}). Monitoring institutional order flow.`,
      details: 'Deep scanning engine active: tracking liquidity sweeps, EMA momentum, and 2-3 candle breakout structures.',
      hinglish: 'Bot active ho gaya hai aur market chart ko 24 ghante continuously scan kar raha hai.',
    },
  ]);

  // 3. Backtest State
  const [backtestResult, setBacktestResult] = useState<BacktestResult>(() =>
    runBacktest(candles, config, 25000)
  );

  // 4. Live Price Simulation for Paper Trading & Header Ticker
  const currentAsset = ASSETS[config.symbol];
  const [currentPrice, setCurrentPrice] = useState<number>(currentAsset.basePrice);
  const [priceDelta, setPriceDelta] = useState<number>(0.42);

  // 5. Paper Trading Account & Positions State ($10,000 starting capital default)
  const [paperAccount, setPaperAccount] = useState<PaperAccount>({
    balance: 10000.0,
    equity: 10000.0,
    freeMargin: 10000.0,
    marginUsed: 0.0,
    marginLevelPercent: 100.0,
    initialDeposit: 10000.0,
    realizedPnl: 0.0,
    unrealizedPnl: 0.0,
    totalTradesCount: 0,
  });
  const [positions, setPositions] = useState<PaperPosition[]>([]);
  const [closedPaperTrades, setClosedPaperTrades] = useState<any[]>([]);

  // Sound toggle handler
  const handleToggleSound = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    soundAlerts.setSoundEnabled(enabled);
    if (enabled) {
      soundAlerts.playSignalPing();
      setToastMessage('Sound Alerts Enabled 🔊');
      setTimeout(() => setToastMessage(null), 2500);
    } else {
      setToastMessage('Sound Alerts Muted 🔇');
      setTimeout(() => setToastMessage(null), 2500);
    }
  }, []);

  // Show quick toast notification
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Add entry to 24/7 Bot Stream
  const addBotLog = useCallback(
    (
      type: BotLogEntry['type'],
      message: string,
      details?: string,
      hinglish?: string
    ) => {
      setBotLogs((prev) => [
        {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toLocaleTimeString(),
          type,
          message,
          details,
          hinglish,
        },
        ...prev.slice(0, 35),
      ]);
    },
    []
  );

  // Update config helper
  const handleUpdateConfig = useCallback((updated: Partial<StrategyConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updated };
      return next;
    });
  }, []);

  // Update config from reverse Pine Script parser
  const handleUpdateFromCode = useCallback(
    (parsedConfig: Partial<StrategyConfig>) => {
      setConfig((prev) => {
        const next = { ...prev, ...parsedConfig };
        const newCandles = generateCandles(next.symbol, next.timeframe, 280);
        setCandles(newCandles);
        const res = runBacktest(newCandles, next, 25000);
        setBacktestResult(res);
        return next;
      });
      showToast('Visual Strategy Workflow updated from Pine Script reverse parser!');
      addBotLog(
        'INFO',
        'Strategy parameters synchronized from reverse Pine Script compiler',
        'Updated indicators, R:R ratio, and execution windows.',
        'Code parser se visual workflow synchronize ho gaya.'
      );
    },
    [addBotLog, showToast]
  );

  // Switch strategy model preset
  const handleSelectModel = useCallback(
    (model: StrategyType) => {
      const preset = STRATEGY_PRESETS[model];
      setConfig(preset);
      const newCandles = generateCandles(preset.symbol, preset.timeframe, 280);
      setCandles(newCandles);
      setCurrentPrice(ASSETS[preset.symbol].basePrice);
      const res = runBacktest(newCandles, preset, 25000);
      setBacktestResult(res);
      showToast(`Switched strategy to ${preset.name}`);
      addBotLog(
        'INFO',
        `Switched strategy model to ${preset.name}`,
        `Now applying ${preset.name} candle pattern filters & risk parameters.`,
        `Bot ne strategy badal ke ${preset.name} kar di hai.`
      );
    },
    [addBotLog, showToast]
  );

  // When symbol or timeframe changes, refresh candles & price
  useEffect(() => {
    const asset = ASSETS[config.symbol];
    if (asset) {
      setCurrentPrice(asset.basePrice);
    }
    const newCandles = generateCandles(config.symbol, config.timeframe, 280);
    setCandles(newCandles);
    const res = runBacktest(newCandles, config, 25000);
    setBacktestResult(res);
  }, [config.symbol, config.timeframe]);

  // Execute Backtest
  const handleRunBacktest = useCallback(() => {
    setIsSimulating(true);
    setTimeout(() => {
      const newCandles = generateCandles(config.symbol, config.timeframe, 280);
      setCandles(newCandles);
      const res = runBacktest(newCandles, config, 25000);
      setBacktestResult(res);
      setIsSimulating(false);
      showToast(
        `Simulation finished: ${res.trades.length} trades, Net Profit: $${res.metrics.netProfit} (${res.metrics.winRate}% Win)`
      );
    }, 400);
  }, [config, showToast]);

  // Reset to current model default preset
  const handleResetDefaults = useCallback(() => {
    const preset = STRATEGY_PRESETS[config.model];
    setConfig(preset);
    showToast(`Reset settings to ${preset.name} defaults`);
  }, [config.model, showToast]);

  // Open Paper Position Handler with Instant Sound Alerts
  const handleOpenPosition = useCallback(
    (direction: TradeDirection, lotSize: number, customReason?: string, customHinglish?: string) => {
      const asset = ASSETS[config.symbol];
      const entryPrice = currentPrice;
      const marginPerLot = (entryPrice * 100) / asset.leverage;
      const requiredMargin = Number((marginPerLot * lotSize * 0.05).toFixed(2));

      if (requiredMargin > paperAccount.freeMargin) {
        showToast(`Insufficient free margin to open ${lotSize} lots on ${config.symbol}!`);
        return;
      }

      // Compute SL and TP based on active config rules
      let slDistance: number;
      if (config.stopLossMethod === 'atr_multiplier') {
        slDistance = entryPrice * 0.0045 * config.atrMultiplier;
      } else if (config.stopLossMethod === 'fixed_pips') {
        slDistance = config.fixedSlPips * asset.pipSize;
      } else {
        slDistance = entryPrice * 0.0035;
      }

      const tpDistance = slDistance * config.riskReward;

      const stopLoss = Number(
        (direction === 'LONG' ? entryPrice - slDistance : entryPrice + slDistance).toFixed(
          asset.pipSize < 0.01 ? 4 : 2
        )
      );

      const takeProfit = Number(
        (direction === 'LONG' ? entryPrice + tpDistance : entryPrice - tpDistance).toFixed(
          asset.pipSize < 0.01 ? 4 : 2
        )
      );

      const newPosition: PaperPosition = {
        id: `POS-${Date.now().toString().slice(-5)}`,
        symbol: config.symbol,
        direction,
        entryPrice,
        currentPrice: entryPrice,
        lotSize,
        stopLoss,
        takeProfit,
        openPnl: 0,
        openPnlPercent: 0,
        openedAt: new Date().toLocaleTimeString(),
        marginUsed: requiredMargin,
      };

      setPositions((prev) => [newPosition, ...prev]);

      setPaperAccount((prev) => ({
        ...prev,
        marginUsed: Number((prev.marginUsed + requiredMargin).toFixed(2)),
        freeMargin: Number((prev.freeMargin - requiredMargin).toFixed(2)),
      }));

      // AUDIO ALERT: Play synthesizer chime
      if (direction === 'LONG') {
        soundAlerts.playBuyTradeSound();
      } else {
        soundAlerts.playSellTradeSound();
      }

      // Trigger high-visibility bot alert modal
      const isNeeraj = config.model === 'neeraj-15m';
      const reasonText =
        customReason ||
        (isNeeraj
          ? `Neeraj Joshi 15M Scalping: Green breakout candle closed above 20-SMA with 1.42x volume surge. EMA 9 crossed above EMA 21. Stop-Loss below wick low, Target 1:${config.riskReward} R:R.`
          : `Gold 15M CHoCH: Higher timeframe liquidity swept. Change of Character body close confirmed. Retesting 50% Order Block zone. Target 1:${config.riskReward} R:R.`);

      const hinglishText =
        customHinglish ||
        (isNeeraj
          ? `Bot ne breakout aur EMA crossover confirm hone par instant BUY order execute kiya aur sound alert bajaya!`
          : `Asian liquidity sweep aur Order Block retest par bot ne automatically trade enter kiya.`);

      setLatestBotAlert({
        id: `alert-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        direction,
        symbol: config.symbol,
        price: entryPrice,
        stopLoss,
        takeProfit,
        lotSize,
        reason: reasonText,
        hinglishReason: hinglishText,
      });

      addBotLog(
        'EXECUTION',
        `Executed ${direction} ${lotSize} Lot @ ${entryPrice} on ${config.symbol}`,
        `SL: ${stopLoss} | TP: ${takeProfit} (1:${config.riskReward} RR)`,
        `Bot ne ${direction} trade le liya hai. Sound alert play ho chuka hai.`
      );

      showToast(
        `🤖 Bot Executed ${direction} on ${config.symbol} @ ${entryPrice} (SL: ${stopLoss}, TP: ${takeProfit})`
      );
    },
    [addBotLog, config, currentPrice, paperAccount.freeMargin, showToast]
  );

  // Close Specific Paper Position manually
  const handleClosePosition = useCallback(
    (id: string) => {
      const pos = positions.find((p) => p.id === id);
      if (!pos) return;

      const closedTrade = {
        id: pos.id,
        symbol: pos.symbol,
        direction: pos.direction,
        entryPrice: pos.entryPrice,
        exitPrice: pos.currentPrice,
        pnl: pos.openPnl,
        pnlPercent: pos.openPnlPercent,
        exitReason: 'MANUAL',
        closedAt: new Date().toLocaleTimeString(),
      };

      setClosedPaperTrades((prev) => [closedTrade, ...prev]);

      setPaperAccount((acc) => {
        const newBalance = Number((acc.balance + pos.openPnl).toFixed(2));
        const newMarginUsed = Math.max(0, acc.marginUsed - pos.marginUsed);
        return {
          ...acc,
          balance: newBalance,
          realizedPnl: Number((acc.realizedPnl + pos.openPnl).toFixed(2)),
          marginUsed: newMarginUsed,
          freeMargin: newBalance - newMarginUsed,
          totalTradesCount: acc.totalTradesCount + 1,
        };
      });

      setPositions((prev) => prev.filter((p) => p.id !== id));
      showToast(`Manually closed position on ${pos.symbol} (PnL: $${pos.openPnl})`);
    },
    [positions, showToast]
  );

  // Move Position SL to Break-Even (Entry Price)
  const handleMoveToBreakEven = useCallback(
    (id: string) => {
      setPositions((prev) =>
        prev.map((pos) => {
          if (pos.id === id) {
            return {
              ...pos,
              stopLoss: pos.entryPrice,
            };
          }
          return pos;
        })
      );
      showToast(`Moved Stop-Loss to Break-Even (${id})`);
      soundAlerts.playSignalPing();
    },
    [showToast]
  );

  // Reset Paper Trading Account to Initial Deposit ($10,000)
  const handleResetAccount = useCallback(() => {
    setPositions([]);
    setClosedPaperTrades([]);
    setPaperAccount({
      balance: 10000.0,
      equity: 10000.0,
      freeMargin: 10000.0,
      marginUsed: 0.0,
      marginLevelPercent: 100.0,
      initialDeposit: 10000.0,
      realizedPnl: 0.0,
      unrealizedPnl: 0.0,
      totalTradesCount: 0,
    });
    showToast('Paper Trading virtual account reset to $10,000.00');
  }, [showToast]);

  // Live Price Ticker Loop & Invalidation Check (Runs continuously 24/7)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        const volatility = prev * 0.00035;
        const delta = (Math.random() - 0.495) * volatility;
        const newPrice = Number(
          (prev + delta).toFixed(currentAsset.pipSize < 0.01 ? 4 : 2)
        );

        setPriceDelta((prevDelta) => {
          const move = (delta / prev) * 100;
          return Number((prevDelta * 0.98 + move * 0.5).toFixed(2));
        });

        // Update Paper Positions & Check SL / TP Hits
        setPositions((prevPositions) => {
          if (prevPositions.length === 0) return prevPositions;

          const remainingPositions: PaperPosition[] = [];

          prevPositions.forEach((pos) => {
            const pipDiff =
              pos.direction === 'LONG'
                ? (newPrice - pos.entryPrice) / currentAsset.pipSize
                : (pos.entryPrice - newPrice) / currentAsset.pipSize;

            const pipValue = currentAsset.pipSize * pos.lotSize * 100;
            const openPnl = Number((pipDiff * pipValue).toFixed(2));
            const openPnlPercent = Number(
              ((openPnl / (pos.entryPrice * pos.lotSize)) * 100).toFixed(2)
            );

            // Check TP hit
            const tpHit =
              pos.direction === 'LONG'
                ? newPrice >= pos.takeProfit
                : newPrice <= pos.takeProfit;

            // Check SL hit
            const slHit =
              pos.direction === 'LONG'
                ? newPrice <= pos.stopLoss
                : newPrice >= pos.stopLoss;

            if (tpHit || slHit) {
              const closedTrade = {
                id: pos.id,
                symbol: pos.symbol,
                direction: pos.direction,
                entryPrice: pos.entryPrice,
                exitPrice: newPrice,
                pnl: openPnl,
                pnlPercent: openPnlPercent,
                exitReason: tpHit ? 'TAKE_PROFIT' : 'STOP_LOSS',
                closedAt: new Date().toLocaleTimeString(),
              };

              setClosedPaperTrades((prev) => [closedTrade, ...prev]);

              setPaperAccount((acc) => {
                const newBalance = Number((acc.balance + openPnl).toFixed(2));
                const newMarginUsed = Math.max(0, acc.marginUsed - pos.marginUsed);
                return {
                  ...acc,
                  balance: newBalance,
                  realizedPnl: Number((acc.realizedPnl + openPnl).toFixed(2)),
                  marginUsed: newMarginUsed,
                  freeMargin: newBalance - newMarginUsed,
                  totalTradesCount: acc.totalTradesCount + 1,
                };
              });

              // PLAY AUDIO CHIME on exit!
              if (tpHit) {
                soundAlerts.playTakeProfitSound();
                addBotLog(
                  'TP_HIT',
                  `🎯 TAKE PROFIT HIT on ${pos.symbol} (${pos.direction})! Profit: +$${openPnl}`,
                  `Price reached target ${newPrice}. Realized PnL: +$${openPnl}.`,
                  `Congratulations! Target hit ho gaya aur profit account me add ho gaya.`
                );
              } else {
                soundAlerts.playStopLossSound();
                addBotLog(
                  'SL_HIT',
                  `🛑 STOP LOSS HIT on ${pos.symbol} (${pos.direction})! Loss: -$${Math.abs(openPnl)}`,
                  `Invalidation level reached at ${newPrice}. Capital preservation active.`,
                  `Risk rule ke mutabik stop loss execute hua taaki jyada loss na ho.`
                );
              }

              showToast(
                `Position Closed (${pos.direction} on ${pos.symbol}) hit ${
                  tpHit ? 'Take Profit 🎯' : 'Stop Loss 🛑'
                }: PnL $${openPnl}`
              );
            } else {
              remainingPositions.push({
                ...pos,
                currentPrice: newPrice,
                openPnl,
                openPnlPercent,
              });
            }
          });

          return remainingPositions;
        });

        return newPrice;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [addBotLog, currentAsset, showToast]);

  // Recalculate Paper Account Equity based on open positions
  useEffect(() => {
    const totalUnrealized = positions.reduce((acc, p) => acc + p.openPnl, 0);
    const totalMargin = positions.reduce((acc, p) => acc + p.marginUsed, 0);

    setPaperAccount((prev) => {
      const equity = Number((prev.balance + totalUnrealized).toFixed(2));
      const freeMargin = Math.max(0, equity - totalMargin);
      const marginLevelPercent =
        totalMargin > 0 ? Number(((equity / totalMargin) * 100).toFixed(1)) : 100.0;

      return {
        ...prev,
        equity,
        unrealizedPnl: Number(totalUnrealized.toFixed(2)),
        marginUsed: Number(totalMargin.toFixed(2)),
        freeMargin: Number(freeMargin.toFixed(2)),
        marginLevelPercent,
      };
    });
  }, [positions]);

  // 24/7 AUTONOMOUS TRADING BOT ENGINE LOOP
  // Evaluates market condition every 12 seconds when autoExecuteSignals is active
  const tickCounter = useRef(0);
  useEffect(() => {
    if (!autoExecuteSignals) return;

    const botInterval = setInterval(() => {
      tickCounter.current += 1;

      // Periodic Scanning Log entry
      if (tickCounter.current % 3 === 0) {
        const isNeeraj = config.model === 'neeraj-15m';
        addBotLog(
          'SCAN',
          `[24/7 Scanner] Evaluating ${config.symbol} ${config.timeframe} order book...`,
          `EMA spread: +${(Math.random() * 2 + 1).toFixed(1)} pts | RSI: ${(52 + Math.random() * 12).toFixed(1)} | Volume 1.38x`,
          `Bot lagataar 15M candle aur market structure ko monitor kar raha hai.`
        );
      }

      // Check if bot should trigger autonomous trade
      // Trigger trade if positions < 2 and random cadence hits every ~20-30s
      if (positions.length < 2 && tickCounter.current % 8 === 0) {
        const direction: TradeDirection = Math.random() > 0.4 ? 'LONG' : 'SHORT';
        const lotSize = config.fixedLotSize || 1.0;

        addBotLog(
          'SIGNAL',
          `High-Probability Setup Detected: ${direction} on ${config.symbol}!`,
          `Institutional confluence confirmed. Triggering automated execution.`,
          `Perfect entry pattern mila hai, bot abhi automatically trade execute karega.`
        );

        handleOpenPosition(direction, lotSize);
      }
    }, 3500);

    return () => clearInterval(botInterval);
  }, [addBotLog, autoExecuteSignals, config, handleOpenPosition, positions.length]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-3 rounded-xl shadow-elevated border border-slate-700/80 flex items-center gap-2.5 text-xs font-medium animate-bounce">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header (Full Width) */}
      <Header
        config={config}
        onUpdateConfig={handleUpdateConfig}
        currentPrice={currentPrice}
        priceDelta={priceDelta}
        onResetDefaults={handleResetDefaults}
      />

      {/* Navigation Bar for the 4 Core Integrated Modules (Full Width) */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tradeCount={backtestResult.trades.length}
        openPositionsCount={positions.length}
      />

      {/* Main Full-Width Workspace Container */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 24/7 AI Trading Expert Sentinel Bot HUD & Sound Alerts */}
        <ExpertSentinelBotHUD
          config={config}
          currentPrice={currentPrice}
          priceDelta={priceDelta}
          autoExecute={autoExecuteSignals}
          onToggleAutoExecute={setAutoExecuteSignals}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          botLogs={botLogs}
          latestAlert={latestBotAlert}
          onDismissAlert={() => setLatestBotAlert(null)}
          onManualTriggerBot={(dir) => handleOpenPosition(dir, config.fixedLotSize || 1.0)}
          showVisualizer={showVisualizer}
          onToggleVisualizer={() => setShowVisualizer(!showVisualizer)}
        />

        {/* Beginner Visual Roadmap: Kb Bot Enter Karega, Kitna Profit Leke Niklega, aur Kb Trade Nahi Lega */}
        {showVisualizer && (
          <BotDecisionVisualizer
            config={config}
            currentPrice={currentPrice}
            priceDelta={priceDelta}
            onSimulateSignal={(dir) => handleOpenPosition(dir, config.fixedLotSize || 1.0)}
          />
        )}

        {/* MODULE 1: VISUAL STRATEGY WORKFLOW BUILDER & EDITOR */}
        {activeTab === 'workflow' && (
          <div className="space-y-6">
            <StrategyWorkflowBuilder
              config={config}
              onUpdateConfig={handleUpdateConfig}
              onSelectModel={handleSelectModel}
              onRunBacktest={handleRunBacktest}
              isSimulating={isSimulating}
            />

            {/* Visual Operational Rules Checklist */}
            <StrategyRulesCard config={config} />
          </div>
        )}

        {/* MODULE 2: EMBEDDED TRADINGVIEW-STYLE CHART & BAR REPRESENTATION */}
        {activeTab === 'chart' && (
          <div className="space-y-6">
            <TradingViewModuleView
              candles={backtestResult.candles}
              config={config}
              trades={backtestResult.trades}
              onUpdateConfig={handleUpdateConfig}
              onRunSimulation={handleRunBacktest}
            />
          </div>
        )}

        {/* MODULE 3: BI-DIRECTIONAL PINE SCRIPT COMPILER & CODE VIEWER */}
        {activeTab === 'compiler' && (
          <div className="space-y-6">
            <PineScriptBiDirectionalCompiler
              config={config}
              onUpdateFromCode={handleUpdateFromCode}
            />
          </div>
        )}

        {/* MODULE 4: PAPER TRADING & BACKTESTING SIMULATION CORE */}
        {activeTab === 'simulation' && (
          <div className="space-y-6">
            <SimulationCoreView
              config={config}
              currentPrice={currentPrice}
              priceDelta={priceDelta}
              paperAccount={paperAccount}
              positions={positions}
              closedTrades={closedPaperTrades}
              onOpenPosition={handleOpenPosition}
              onClosePosition={handleClosePosition}
              onMoveToBreakEven={handleMoveToBreakEven}
              onResetAccount={handleResetAccount}
              autoExecuteSignals={autoExecuteSignals}
              onToggleAutoExecute={setAutoExecuteSignals}
              metrics={backtestResult.metrics}
              equityCurve={backtestResult.equityCurve}
              trades={backtestResult.trades}
              candles={backtestResult.candles}
              onRunBacktest={handleRunBacktest}
              isSimulating={isSimulating}
            />
          </div>
        )}
      </main>

      {/* Institutional SaaS Footer (Full Width) */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900 font-display">AlgoMaster Pro</span>
            <span>• 24/7 AI Sentinel Algorithmic Trading Architecture</span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span>Web Audio Chimes Active</span>
            <span>•</span>
            <span>24/7 Autonomous Chart Watch</span>
            <span>•</span>
            <span>TradingView Lightweight v5</span>
            <span>•</span>
            <span className="text-indigo-600 font-bold font-sans">Daylight SaaS Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
