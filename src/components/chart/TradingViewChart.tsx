import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  BarSeries,
  HistogramSeries,
  LineSeries,
  LineStyle,
  ColorType,
  UTCTimestamp,
  createSeriesMarkers,
} from 'lightweight-charts';
import { AssetSymbol, Candle, Trade } from '../../types';
import { formatPrice } from '../../data/assets';
import {
  CandlestickChart,
  BarChart3,
  Maximize2,
  TrendingUp,
  Crosshair,
  Layers,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from 'lucide-react';

export type ChartType = 'candlestick' | 'bar';

interface TradingViewChartProps {
  candles: Candle[];
  symbol: AssetSymbol;
  trades?: Trade[];
  activeTrade?: Trade | null;
  height?: number;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  candles,
  symbol,
  trades = [],
  activeTrade = null,
  height = 460,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Bar'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const priceLinesRef = useRef<any[]>([]);

  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [showEma9, setShowEma9] = useState<boolean>(true);
  const [showEma21, setShowEma21] = useState<boolean>(true);
  const [showSmc, setShowSmc] = useState<boolean>(true);

  // Initialize and update Lightweight Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up previous chart instance
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;

    // Create TradingView Lightweight Chart instance with daylight SaaS styling
    const chart = createChart(container, {
      width: container.clientWidth,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#475569',
        fontFamily: '"JetBrains Mono", Inter, -apple-system, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#f1f5f9', style: LineStyle.Dotted },
        horzLines: { color: '#f1f5f9', style: LineStyle.Dotted },
      },
      crosshair: {
        vertLine: {
          color: '#6366f1',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#4f46e5',
        },
        horzLine: {
          color: '#6366f1',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#4f46e5',
        },
      },
      rightPriceScale: {
        borderColor: '#e2e8f0',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2, // Leave space for volume histogram
        },
      },
      timeScale: {
        borderColor: '#e2e8f0',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // 1. Add Price Series (Candlestick or OHLC Bar)
    let series: ISeriesApi<'Candlestick'> | ISeriesApi<'Bar'>;

    if (chartType === 'candlestick') {
      series = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#f43f5e',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#f43f5e',
      });
    } else {
      series = chart.addSeries(BarSeries, {
        upColor: '#10b981',
        downColor: '#f43f5e',
        thinBars: false,
      });
    }
    mainSeriesRef.current = series;

    // Format candle data for lightweight-charts
    const chartData = candles.map((c) => ({
      time: Math.floor(c.timestamp / 1000) as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    series.setData(chartData);

    // 2. Add Volume Histogram Series overlay at bottom
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Separate price scale overlay
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    const volumeData = candles.map((c) => ({
      time: Math.floor(c.timestamp / 1000) as UTCTimestamp,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)',
    }));
    volumeSeries.setData(volumeData);
    volumeSeriesRef.current = volumeSeries;

    // 2a. Add EMA 9 Line Series (Fast Trend Compass)
    if (showEma9) {
      const ema9Series = chart.addSeries(LineSeries, {
        color: '#0284c7', // Sky Blue
        lineWidth: 2,
        priceLineVisible: false,
        crosshairMarkerVisible: true,
        title: 'EMA 9 (Fast)',
      });
      const ema9Data = candles
        .filter((c) => c.emaFast !== undefined)
        .map((c) => ({
          time: Math.floor(c.timestamp / 1000) as UTCTimestamp,
          value: c.emaFast!,
        }));
      if (ema9Data.length > 0) {
        ema9Series.setData(ema9Data);
      }
    }

    // 2b. Add EMA 21 Line Series (Slow Baseline Trend)
    if (showEma21) {
      const ema21Series = chart.addSeries(LineSeries, {
        color: '#f59e0b', // Amber Orange
        lineWidth: 2,
        priceLineVisible: false,
        crosshairMarkerVisible: true,
        title: 'EMA 21 (Slow)',
      });
      const ema21Data = candles
        .filter((c) => c.emaSlow !== undefined)
        .map((c) => ({
          time: Math.floor(c.timestamp / 1000) as UTCTimestamp,
          value: c.emaSlow!,
        }));
      if (ema21Data.length > 0) {
        ema21Series.setData(ema21Data);
      }
    }

    // 2c. Add Smart Money Concepts (SMC) Overlays (Order Block, Liquidity Sweep, CHoCH)
    priceLinesRef.current = [];
    if (showSmc && series && candles.length > 5) {
      const recentCandles = candles.slice(-25);
      const recentHigh = Math.max(...recentCandles.map((c) => c.high));
      const recentLow = Math.min(...recentCandles.map((c) => c.low));

      const obCandles = candles.filter((c) => c.orderBlock);
      const latestOB = obCandles[obCandles.length - 1]?.orderBlock || {
        type: 'BULLISH',
        top: Number((recentLow * 1.003).toFixed(symbol === 'EURUSD' ? 4 : 2)),
        bottom: recentLow,
      };

      // Bullish Order Block (Demand / Institutional Re-entry Zone)
      const obTopLine = series.createPriceLine({
        price: latestOB.top,
        color: '#10b981',
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: '🟢 Order Block Zone (Demand)',
      });
      priceLinesRef.current.push(obTopLine);

      const obBottomLine = series.createPriceLine({
        price: latestOB.bottom,
        color: '#059669',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'OB Invalidation (SL)',
      });
      priceLinesRef.current.push(obBottomLine);

      // Liquidity Sweep Level (Retail Trap Line)
      const sweepLine = series.createPriceLine({
        price: recentHigh,
        color: '#ec4899',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: '⚡ Liquidity Sweep Level (Retail Trap)',
      });
      priceLinesRef.current.push(sweepLine);

      // CHoCH / BOS (Trend Change Line)
      const chochLine = series.createPriceLine({
        price: Number(((recentHigh + recentLow) / 2).toFixed(symbol === 'EURUSD' ? 4 : 2)),
        color: '#8b5cf6',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: true,
        title: '🔄 CHoCH (Trend Shift Line)',
      });
      priceLinesRef.current.push(chochLine);
    }

    // 3. Add Trade Invalidation & Target Price Lines (SL / TP)
    const targetTrade = activeTrade || (trades.length > 0 ? trades[trades.length - 1] : null);

    if (targetTrade && series) {
      // Entry Price Line
      const entryLine = series.createPriceLine({
        price: targetTrade.entryPrice,
        color: '#6366f1',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `Entry (${targetTrade.direction})`,
      });
      priceLinesRef.current.push(entryLine);

      // Take Profit Line
      const tpLine = series.createPriceLine({
        price: targetTrade.takeProfit,
        color: '#10b981',
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: `Take Profit (TP)`,
      });
      priceLinesRef.current.push(tpLine);

      // Stop Loss Line
      const slLine = series.createPriceLine({
        price: targetTrade.stopLoss,
        color: '#f43f5e',
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: `Stop Loss (SL)`,
      });
      priceLinesRef.current.push(slLine);
    }

    // 4. Add Simulated Trade Markers (Green/Red Entry arrows)
    try {
      const firstTime = candles[0]?.timestamp;
      const lastTime = candles[candles.length - 1]?.timestamp;

      if (firstTime && lastTime && trades.length > 0) {
        const markers = trades
          .filter((t) => t.entryTimestamp >= firstTime && t.entryTimestamp <= lastTime)
          .slice(-30)
          .map((t) => ({
            time: Math.floor(t.entryTimestamp / 1000) as UTCTimestamp,
            position: (t.direction === 'LONG' ? 'belowBar' : 'aboveBar') as any,
            color: t.direction === 'LONG' ? '#10b981' : '#f43f5e',
            shape: (t.direction === 'LONG' ? 'arrowUp' : 'arrowDown') as any,
            text: `${t.direction} @ ${formatPrice(symbol, t.entryPrice)}${
              t.status !== 'OPEN' ? ` (${t.status === 'WIN' ? `+$${t.pnl}` : `-$${Math.abs(t.pnl)}`})` : ''
            }`,
            size: 1.2,
          }));

        if (markers.length > 0 && series) {
          createSeriesMarkers(series, markers);
        }
      }
    } catch (e) {
      console.warn('Trade markers initialization note:', e);
    }

    // 5. Crosshair move handler to update inspection bar
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setHoveredCandle(null);
        return;
      }
      const data = param.seriesData.get(series) as any;
      if (data) {
        setHoveredCandle({
          time: new Date((param.time as number) * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          timestamp: (param.time as number) * 1000,
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          volume: 0,
        });
      }
    });

    // 5. Responsive Resize Observer
    const handleResize = () => {
      if (chartRef.current && container) {
        chartRef.current.applyOptions({
          width: container.clientWidth,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    // Initial fit
    chart.timeScale().fitContent();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candles, chartType, height, activeTrade, trades, symbol, showEma9, showEma21, showSmc]);

  const latestCandle = candles[candles.length - 1];
  const displayCandle = hoveredCandle || latestCandle;
  const isUp = displayCandle ? displayCandle.close >= displayCandle.open : true;

  const handleFitContent = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Chart Top Bar Controls & OHLC Inspection */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Symbol & OHLC readout */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 font-display text-sm">{symbol}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              TRADINGVIEW ENGINE
            </span>
          </div>

          {displayCandle && (
            <div className="flex flex-wrap items-center gap-2.5 font-mono text-[11px] text-slate-500">
              <span>
                O: <span className="font-semibold text-slate-800">{displayCandle.open}</span>
              </span>
              <span>
                H: <span className="font-semibold text-slate-800">{displayCandle.high}</span>
              </span>
              <span>
                L: <span className="font-semibold text-slate-800">{displayCandle.low}</span>
              </span>
              <span>
                C:{' '}
                <span className={`font-bold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {displayCandle.close}
                </span>
              </span>
              {displayCandle.emaFast && (
                <span className="text-sky-600 font-semibold border-l border-slate-200 pl-2">
                  EMA9: {displayCandle.emaFast}
                </span>
              )}
              {displayCandle.emaSlow && (
                <span className="text-amber-600 font-semibold">
                  EMA21: {displayCandle.emaSlow}
                </span>
              )}
              {displayCandle.rsi && (
                <span className="text-teal-600 font-semibold">
                  RSI: {displayCandle.rsi}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Overlay Toggles + Candlestick vs Bar Chart Toggle + Zoom */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Overlay Indicators Toggles */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setShowEma9(!showEma9)}
              className={`px-2 py-1 rounded transition-all flex items-center gap-1 ${
                showEma9
                  ? 'bg-sky-50 text-sky-700 border border-sky-300 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              EMA 9
            </button>
            <button
              onClick={() => setShowEma21(!showEma21)}
              className={`px-2 py-1 rounded transition-all flex items-center gap-1 ${
                showEma21
                  ? 'bg-amber-50 text-amber-700 border border-amber-300 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              EMA 21
            </button>
            <button
              onClick={() => setShowSmc(!showSmc)}
              className={`px-2 py-1 rounded transition-all flex items-center gap-1 ${
                showSmc
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              SMC Zones
            </button>
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setChartType('candlestick')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-semibold ${
                chartType === 'candlestick'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5" />
              Candles
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-semibold ${
                chartType === 'bar'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              OHLC Bars
            </button>
          </div>

          {/* Reset View Button */}
          <button
            onClick={handleFitContent}
            title="Reset Chart View & Fit Content"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Lightweight Chart Render Canvas */}
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <div ref={chartContainerRef} className="w-full h-full" />

        {/* Overlay Legend Badge */}
        <div className="absolute top-3 left-3 pointer-events-none z-10 flex flex-wrap items-center gap-2.5 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-medium text-slate-700 shadow-sm">
          {showEma9 && (
            <span className="flex items-center gap-1 font-semibold text-sky-700">
              <span className="w-2.5 h-1 rounded bg-sky-500"></span>
              EMA 9 (Fast)
            </span>
          )}
          {showEma21 && (
            <span className="flex items-center gap-1 font-semibold text-amber-700">
              <span className="w-2.5 h-1 rounded bg-amber-500"></span>
              EMA 21 (Slow)
            </span>
          )}
          {showSmc && (
            <>
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded bg-emerald-500"></span>
                Order Block (Demand)
              </span>
              <span className="flex items-center gap-1 font-semibold text-pink-600">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                Liquidity Sweep
              </span>
              <span className="flex items-center gap-1 font-semibold text-purple-600">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                CHoCH Line
              </span>
            </>
          )}
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Take Profit
          </span>
          <span className="flex items-center gap-1 text-rose-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Stop Loss
          </span>
        </div>
      </div>
    </div>
  );
};
