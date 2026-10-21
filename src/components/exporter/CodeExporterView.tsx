import React, { useState } from 'react';
import { StrategyConfig } from '../../types';
import { generatePineScript } from '../../generators/pineScriptGenerator';
import { generatePythonBacktrader } from '../../generators/pythonBacktraderGenerator';
import {
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  BookOpen,
  FileCode,
  Sparkles,
  Zap,
} from 'lucide-react';

interface CodeExporterViewProps {
  config: StrategyConfig;
}

export const CodeExporterView: React.FC<CodeExporterViewProps> = ({ config }) => {
  const [activeLang, setActiveLang] = useState<'pine' | 'python'>('pine');
  const [copied, setCopied] = useState(false);

  const pineCode = generatePineScript(config);
  const pythonCode = generatePythonBacktrader(config);

  const activeCode = activeLang === 'pine' ? pineCode : pythonCode;
  const fileName =
    activeLang === 'pine'
      ? `${config.model}_${config.symbol}_${config.timeframe}.pine`
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

  return (
    <div className="space-y-6">
      {/* Exporter Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Code2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-display font-bold text-slate-900 text-lg">
              Automated Strategy Code Exporter
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Validated Syntax
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Export production-ready, synchronized algorithmic code directly from your configured GUI parameters
          </p>
        </div>

        {/* Language Tabs & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveLang('pine')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeLang === 'pine'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-600" />
              TradingView Pine Script v5
            </button>
            <button
              onClick={() => setActiveLang('python')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeLang === 'python'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-teal-600" />
              Python Backtrader
            </button>
          </div>

          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all ${
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
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download {activeLang === 'pine' ? '.pine' : '.py'}
          </button>
        </div>
      </div>

      {/* Code Editor Preview Window */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-elevated overflow-hidden text-slate-100">
        {/* Editor Top Bar */}
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span className="ml-2 font-mono text-xs text-slate-400 font-medium">
              {fileName}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>{activeCode.split('\n').length} Lines</span>
            <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              UTF-8
            </span>
          </div>
        </div>

        {/* Code Content with Line Numbers */}
        <div className="p-4 overflow-x-auto max-h-[520px] font-mono text-xs leading-relaxed selection:bg-indigo-500 selection:text-white">
          <pre className="text-slate-200">
            {activeCode.split('\n').map((line, idx) => {
              // Simple daylight syntax highlighting accents
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

      {/* Deployment & Quickstart Guide */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <h4 className="font-display font-bold text-slate-900 text-sm">
            Quick Deployment Instructions: {activeLang === 'pine' ? 'TradingView Setup' : 'Python Backtrader Setup'}
          </h4>
        </div>

        {activeLang === 'pine' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-slate-600">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="font-bold text-indigo-600 block mb-1">Step 1: Open Pine Editor</span>
              Log into TradingView, open your chart, and click on the "Pine Editor" tab at the bottom.
            </div>
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="font-bold text-indigo-600 block mb-1">Step 2: Paste Generated Script</span>
              Clear the default editor template and paste the exported code using the 1-Click Copy button.
            </div>
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="font-bold text-indigo-600 block mb-1">Step 3: Add to Chart</span>
              Click "Add to Chart" or "Save". The strategy signals and execution orders will populate directly.
            </div>
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="font-bold text-indigo-600 block mb-1">Step 4: Enable Alerts</span>
              Right-click the chart or strategy to attach automated webhook alerts to your broker or bot!
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-slate-600">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="font-bold text-teal-600 block mb-1">Step 1: Install Dependencies</span>
              Run <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">pip install backtrader pandas yfinance</code> in terminal.
            </div>
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="font-bold text-teal-600 block mb-1">Step 2: Save Script</span>
              Save the downloaded file as <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">strategy.py</code> in your project folder.
            </div>
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="font-bold text-teal-600 block mb-1">Step 3: Attach Data Feed</span>
              Provide your historical CSV or connect to interactive brokers / Alpaca live feeds.
            </div>
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="font-bold text-teal-600 block mb-1">Step 4: Execute & Plot</span>
              Run <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">python strategy.py</code> to view portfolio returns & order logs.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
