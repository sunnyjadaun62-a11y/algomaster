import React, { useState } from 'react';
import { StrategyConfig } from '../../types';
import { generatePineScript, PineScriptMode } from '../../generators/pineScriptGenerator';
import { generatePythonBacktrader } from '../../generators/pythonBacktraderGenerator';
import {
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  ArrowRightLeft,
  Sparkles,
  Upload,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Tv,
  BellRing,
  BarChart2,
  ExternalLink,
} from 'lucide-react';

interface PineScriptBiDirectionalCompilerProps {
  config: StrategyConfig;
  onUpdateFromCode: (parsedConfig: Partial<StrategyConfig>) => void;
}

export const PineScriptBiDirectionalCompiler: React.FC<PineScriptBiDirectionalCompilerProps> = ({
  config,
  onUpdateFromCode,
}) => {
  const [activeTab, setActiveTab] = useState<'generator' | 'parser'>('generator');
  const [activeLang, setActiveLang] = useState<'pine' | 'python'>('pine');
  const [pineMode, setPineMode] = useState<PineScriptMode>('indicator');
  const [copied, setCopied] = useState(false);

  // Reverse Parser State
  const [pastedCode, setPastedCode] = useState<string>('');
  const [parseStatus, setParseStatus] = useState<{
    success: boolean;
    message: string;
    extractedProps: string[];
  } | null>(null);

  const pineCode = generatePineScript(config, pineMode);
  const pythonCode = generatePythonBacktrader(config);
  const activeCode = activeLang === 'pine' ? pineCode : pythonCode;
  const fileName =
    activeLang === 'pine'
      ? `${config.model}_${config.symbol}_${pineMode === 'indicator' ? 'overlay' : 'strategy'}.pine`
      : `${config.model}_${config.symbol}.py`;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([activeCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Sample Pine Script template for testing the reverse parser
  const sampleCustomPine = `//@version=5
strategy("Custom Scalper Strategy from YouTube", overlay=true, initial_capital=10000)

// Parameters
rrRatio = input.float(2.5, title="Risk to Reward")
useSession = input.bool(true, title="Session Filter")
sessionRange = input.session("09:15-15:30", title="Trading Session")
emaFastLen = input.int(9, title="Fast EMA")
emaSlowLen = input.int(21, title="Slow EMA")
rsiPeriod = input.int(14, title="RSI Length")
rsiLongThresh = input.int(60, title="RSI Long Level")
rsiShortThresh = input.int(40, title="RSI Short Level")
atrMultiplier = input.float(1.8, title="ATR Stop Loss Multiplier")

// Indicators
emaFast = ta.ema(close, emaFastLen)
emaSlow = ta.ema(close, emaSlowLen)
rsiVal = ta.rsi(close, rsiPeriod)
`;

  // Reverse Parser: Parses pasted Pine Script into StrategyConfig parameters
  const handleParsePineScript = () => {
    if (!pastedCode.trim()) {
      setParseStatus({
        success: false,
        message: 'Please paste valid Pine Script code in the input area below.',
        extractedProps: [],
      });
      return;
    }

    const code = pastedCode;
    const extracted: Partial<StrategyConfig> = {};
    const report: string[] = [];

    // 1. Detect Strategy Model
    if (
      code.toLowerCase().includes('choch') ||
      code.toLowerCase().includes('smart money') ||
      code.toLowerCase().includes('orderblock') ||
      code.toLowerCase().includes('pivothigh')
    ) {
      extracted.model = 'gold-choch-15m';
      report.push('Model: Smart Money Concepts (Gold 15M CHoCH)');
    } else if (
      code.toLowerCase().includes('scalp') ||
      code.toLowerCase().includes('neeraj') ||
      code.toLowerCase().includes('ema')
    ) {
      extracted.model = 'neeraj-15m';
      report.push('Model: Neeraj Joshi 15M Scalping');
    }

    // 2. Risk-to-Reward Ratio: rrRatio = input.float(X, ...)
    const rrMatch = code.match(/rrRatio\s*=\s*input\.float\s*\(\s*([\d.]+)/i) ||
                    code.match(/riskReward\s*=\s*input\.float\s*\(\s*([\d.]+)/i);
    if (rrMatch && rrMatch[1]) {
      const parsedRR = parseFloat(rrMatch[1]);
      extracted.riskReward = (parsedRR >= 4.0 ? 4.0 : parsedRR >= 3.0 ? 3.0 : parsedRR >= 2.5 ? 2.5 : parsedRR >= 2.0 ? 2.0 : 1.5) as any;
      report.push(`Risk-to-Reward Ratio: 1:${extracted.riskReward}`);
    }

    // 3. Fast EMA: emaFastLen = input.int(X, ...) or ta.ema(..., X)
    const emaFastMatch = code.match(/emaFastLen\s*=\s*input\.int\s*\(\s*(\d+)/i) ||
                         code.match(/ta\.ema\s*\(\s*close\s*,\s*(\d+)\s*\)/i);
    if (emaFastMatch && emaFastMatch[1]) {
      extracted.emaFast = parseInt(emaFastMatch[1], 10);
      report.push(`Fast EMA Period: ${extracted.emaFast}`);
    }

    // 4. Slow EMA: emaSlowLen = input.int(X, ...) or ta.ema(..., 21)
    const emaSlowMatch = code.match(/emaSlowLen\s*=\s*input\.int\s*\(\s*(\d+)/i) ||
                         code.match(/ta\.ema\s*\(\s*close\s*,\s*(\d+)\s*\)/g);
    if (emaSlowMatch) {
      const match = code.match(/emaSlowLen\s*=\s*input\.int\s*\(\s*(\d+)/i);
      if (match && match[1]) {
        extracted.emaSlow = parseInt(match[1], 10);
        report.push(`Slow EMA Period: ${extracted.emaSlow}`);
      }
    }

    // 5. RSI Period & Thresholds
    const rsiMatch = code.match(/rsiPeriod\s*=\s*input\.int\s*\(\s*(\d+)/i) ||
                     code.match(/ta\.rsi\s*\(\s*close\s*,\s*(\d+)\s*\)/i);
    if (rsiMatch && rsiMatch[1]) {
      extracted.rsiPeriod = parseInt(rsiMatch[1], 10);
      report.push(`RSI Period: ${extracted.rsiPeriod}`);
    }

    const rsiLongMatch = code.match(/rsiLongThresh\s*=\s*input\.int\s*\(\s*(\d+)/i);
    if (rsiLongMatch && rsiLongMatch[1]) {
      extracted.rsiLongLevel = parseInt(rsiLongMatch[1], 10);
      report.push(`RSI Long Threshold: ${extracted.rsiLongLevel}`);
    }

    const rsiShortMatch = code.match(/rsiShortThresh\s*=\s*input\.int\s*\(\s*(\d+)/i);
    if (rsiShortMatch && rsiShortMatch[1]) {
      extracted.rsiShortLevel = parseInt(rsiShortMatch[1], 10);
      report.push(`RSI Short Threshold: ${extracted.rsiShortLevel}`);
    }

    // 6. Session Window: sessionRange = input.session("08:00-16:00", ...)
    const sessionMatch = code.match(/input\.session\s*\(\s*"([^"]+)"/i);
    if (sessionMatch && sessionMatch[1]) {
      const [start, end] = sessionMatch[1].split('-');
      if (start && end) {
        extracted.sessionStart = start.trim();
        extracted.sessionEnd = end.trim();
        extracted.sessionFilterEnabled = true;
        extracted.sessionWindow = 'custom';
        report.push(`Session Window: ${start} - ${end} UTC`);
      }
    }

    // 7. ATR Multiplier
    const atrMatch = code.match(/atrMultiplier\s*=\s*input\.float\s*\(\s*([\d.]+)/i);
    if (atrMatch && atrMatch[1]) {
      extracted.atrMultiplier = parseFloat(atrMatch[1]);
      report.push(`ATR SL Multiplier: ${extracted.atrMultiplier}x`);
    }

    // Apply parsed values to visual workflow
    onUpdateFromCode(extracted);

    setParseStatus({
      success: true,
      message: `Successfully parsed and synchronized ${report.length} strategy parameters into Visual Workflow Builder!`,
      extractedProps: report,
    });
  };

  return (
    <div className="space-y-6">
      {/* Compiler Mode Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
            <h3 className="font-display font-bold text-slate-900 text-lg">
              Bi-Directional Pine Script Compiler & Reverse Parser
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Bi-Directional Sync
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Export visual workflow to Pine Script / Python, or paste custom Pine Script code to automatically reconstruct the visual strategy workflow
          </p>
        </div>

        {/* Tabs: Real-Time Generator vs Reverse Parser */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'generator'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Real-Time Code Generator
          </button>
          <button
            onClick={() => setActiveTab('parser')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'parser'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            Reverse Pine Script Parser
          </button>
        </div>
      </div>

      {/* TAB 1: Real-Time Code Generator */}
      {activeTab === 'generator' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setActiveLang('pine')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    activeLang === 'pine'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  TradingView Pine Script v5
                </button>
                <button
                  onClick={() => setActiveLang('python')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    activeLang === 'python'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Python Backtrader
                </button>
              </div>

              {/* Sub-modes for Pine Script: Live Overlay vs Strategy */}
              {activeLang === 'pine' && (
                <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setPineMode('indicator')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                      pineMode === 'indicator'
                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <BellRing className="w-3 h-3" />
                    Overlay & Live Alerts
                  </button>
                  <button
                    onClick={() => setPineMode('strategy')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                      pineMode === 'strategy'
                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <BarChart2 className="w-3 h-3" />
                    Strategy Backtester
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    1-Click Copy Code
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download {activeLang === 'pine' ? '.pine' : '.py'}
              </button>
            </div>
          </div>

          {/* Quick TradingView Deployment Instructions Card */}
          {activeLang === 'pine' && (
            <div className="p-4 bg-gradient-to-r from-indigo-50/90 via-sky-50/70 to-emerald-50/60 rounded-xl border border-indigo-200/80 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-indigo-200/50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                    <Tv className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      TradingView me Direct Live Run Karein (No Price Difference!)
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Zero Setup
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      TradingView ke official live chart pe overlay karne ke liye ye 4 simple steps follow karein:
                    </p>
                  </div>
                </div>

                <a
                  href="https://in.tradingview.com/chart/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                >
                  Open TradingView <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100/80">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[10px] mb-1">
                    Step 1
                  </span>
                  <p className="font-semibold text-slate-800">1-Click Copy Code</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Upar green button se script copy karein.</p>
                </div>

                <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100/80">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[10px] mb-1">
                    Step 2
                  </span>
                  <p className="font-semibold text-slate-800">Pine Editor Open Karein</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">TradingView ke bottom panel mein "Pine Editor" pe click karein.</p>
                </div>

                <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100/80">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[10px] mb-1">
                    Step 3
                  </span>
                  <p className="font-semibold text-slate-800">Paste Code (Ctrl+V)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Editor mein Ctrl+A karke purana code hatayein aur paste karein.</p>
                </div>

                <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100/80">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] mb-1">
                    Step 4
                  </span>
                  <p className="font-semibold text-slate-800">"Add to chart" Dabayein</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Instant live signals, EMA ribbon aur TP/SL chart par aa jayenge!</p>
                </div>
              </div>
            </div>
          )}

          {/* Syntax Code Container */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-elevated overflow-hidden text-slate-100">
            <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                <span className="ml-2 font-medium text-slate-300">{fileName}</span>
              </div>
              <span>{activeCode.split('\n').length} Lines</span>
            </div>

            <div className="p-4 overflow-x-auto max-h-[500px] font-mono text-xs leading-relaxed">
              <pre>
                {activeCode.split('\n').map((line, idx) => {
                  let lineClass = 'text-slate-200';
                  if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('"""')) {
                    lineClass = 'text-slate-500 italic';
                  } else if (line.includes('input.') || line.includes('params =')) {
                    lineClass = 'text-teal-400 font-semibold';
                  } else if (line.includes('strategy.entry') || line.includes('self.buy') || line.includes('self.sell')) {
                    lineClass = 'text-emerald-400 font-bold';
                  } else if (line.includes('strategy.exit') || line.includes('self.close')) {
                    lineClass = 'text-rose-400 font-bold';
                  } else if (line.includes('ta.ema') || line.includes('ta.rsi') || line.includes('bt.indicators')) {
                    lineClass = 'text-indigo-400';
                  }

                  return (
                    <div key={idx} className="flex">
                      <span className="w-10 text-right pr-4 text-slate-600 select-none font-medium">
                        {idx + 1}
                      </span>
                      <span className={lineClass}>{line}</span>
                    </div>
                  );
                })}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Reverse Pine Script Parser */}
      {activeTab === 'parser' && (
        <div className="space-y-5">
          <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-900 font-medium">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Paste any TradingView Pine Script v5 strategy code below. The reverse compiler will parse its indicators, parameters, and session filters to visually update the workflow blocks in Module 1.
              </span>
            </div>
            <button
              onClick={() => setPastedCode(sampleCustomPine)}
              className="px-3 py-1.5 bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold rounded-lg shadow-sm whitespace-nowrap"
            >
              Load Sample YouTube Strategy
            </button>
          </div>

          {/* Paste Code Area */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">Paste Custom Pine Script Code Here:</span>
              <button
                onClick={() => setPastedCode('')}
                className="text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            </div>

            <textarea
              rows={12}
              value={pastedCode}
              onChange={(e) => setPastedCode(e.target.value)}
              placeholder="Paste //@version=5 strategy code here (e.g. from TradingView or YouTube)..."
              className="w-full p-4 bg-slate-900 text-slate-200 font-mono text-xs focus:outline-none resize-none leading-relaxed selection:bg-indigo-600 selection:text-white"
            />
          </div>

          {/* Compile Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleParsePineScript}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              Compile & Parse into Visual Workflow
            </button>
            <span className="text-xs text-slate-500">
              Extracts indicators, R:R ratio, session windows, and updates Visual Strategy Builder
            </span>
          </div>

          {/* Parse Result Report Card */}
          {parseStatus && (
            <div
              className={`p-4 rounded-xl border text-xs ${
                parseStatus.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-2">
                {parseStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>{parseStatus.message}</span>
              </div>

              {parseStatus.extractedProps.length > 0 && (
                <div className="mt-2 pt-2 border-t border-emerald-200/60">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-800 block mb-1">
                    Extracted & Synchronized Parameters:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                    {parseStatus.extractedProps.map((prop, i) => (
                      <div
                        key={i}
                        className="bg-white/80 p-2 rounded border border-emerald-200/80 font-semibold"
                      >
                        ✓ {prop}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
