import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  BarSeries,
  HistogramSeries,
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

    // 3. Add Trade Invalidation & Target Price Lines (SL / TP)
    priceLinesRef.current = [];
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
  }, [candles, chartType, height, activeTrade, trades, symbol]);

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
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
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
            </div>
          )}
        </div>

        {/* Right: Candlestick vs Bar Chart Toggle + Zoom */}
        <div className="flex items-center space-x-2">
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
        <div className="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-2 bg-white/85 backdrop-blur px-2.5 py-1 rounded-md border border-slate-200 text-[10px] font-medium text-slate-600 shadow-sm">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Take Profit Level
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Stop Loss Level
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Entry Level
          </span>
        </div>
      </div>
    </div>
  );
};
