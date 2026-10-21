import { StrategyConfig } from '../types';

export function generatePythonBacktrader(config: StrategyConfig): string {
  const isNeeraj = config.model === 'neeraj-15m';
  const className = isNeeraj ? 'NeerajJoshi15MScalping' : 'Gold15MCHoCHStrategy';

  return `"""
===================================================================
AlgoMaster Pro - Automated Backtrader Python Strategy Exporter
Strategy: ${config.name}
Symbol: ${config.symbol} | Timeframe: ${config.timeframe}
Risk to Reward: 1:${config.riskReward} | Sizing: ${config.sizingType}
Generated on: ${new Date().toISOString().split('T')[0]}
===================================================================
"""

import datetime
import backtrader as bt

class ${className}(bt.Strategy):
    params = (
        ('risk_reward', ${config.riskReward}),
        ('risk_pct', ${config.riskPerTradePercent / 100}),
        ('trailing_stop', ${config.trailingStop ? 'True' : 'False'}),
        ('be_trigger_rr', ${config.breakEvenTriggerRR}),
        ('session_filter', ${config.sessionFilterEnabled ? 'True' : 'False'}),
        ('session_start', '${config.sessionStart}'),
        ('session_end', '${config.sessionEnd}'),
${
  isNeeraj
    ? `        ('ema_fast', ${config.emaFast}),
        ('ema_slow', ${config.emaSlow}),
        ('rsi_period', ${config.rsiPeriod}),
        ('rsi_long_level', ${config.rsiLongLevel}),
        ('rsi_short_level', ${config.rsiShortLevel}),
        ('vol_surge_mult', ${config.volumeSurgeMultiplier}),
        ('atr_multiplier', ${config.atrMultiplier}),`
    : `        ('swing_lookback', ${config.swingLookback}),
        ('fvg_threshold', ${config.fvgThresholdPips}),
        ('liq_sweep_filter', ${config.liquiditySweepFilter ? 'True' : 'False'}),`
}
    )

    def __init__(self):
        self.order = None
        self.entry_price = None
        self.stop_loss = None
        self.take_profit = None
        self.is_be_set = False

${
  isNeeraj
    ? `        # Indicators for Neeraj Joshi 15M Scalping
        self.ema_fast = bt.indicators.EMA(self.data.close, period=self.params.ema_fast)
        self.ema_slow = bt.indicators.EMA(self.data.close, period=self.params.ema_slow)
        self.rsi = bt.indicators.RSI(self.data.close, period=self.params.rsi_period)
        self.vol_sma = bt.indicators.SMA(self.data.volume, period=20)
        self.atr = bt.indicators.ATR(self.data, period=14)`
    : `        # Indicators for Gold 15M CHoCH (Smart Money Concepts)
        self.atr = bt.indicators.ATR(self.data, period=14)
        self.highest = bt.indicators.Highest(self.data.high(-1), period=self.params.swing_lookback)
        self.lowest = bt.indicators.Lowest(self.data.low(-1), period=self.params.swing_lookback)`
}

    def notify_order(self, order):
        if order.status in [order.Submitted, order.Accepted]:
            return
        if order.status in [order.Completed]:
            if order.isbuy():
                self.log(f"BUY EXECUTED, Price: {order.executed.price:.2f}, Cost: {order.executed.value:.2f}")
            else:
                self.log(f"SELL EXECUTED, Price: {order.executed.price:.2f}, Cost: {order.executed.value:.2f}")
            self.entry_price = order.executed.price
        elif order.status in [order.Canceled, order.Margin, order.Rejected]:
            self.log(f"Order Cancelled / Rejected: {order.status}")
        self.order = None

    def log(self, txt, dt=None):
        dt = dt or self.datas[0].datetime.time(0)
        print(f"[{dt}] {txt}")

    def in_session(self):
        if not self.params.session_filter:
            return True
        current_time = self.datas[0].datetime.time(0)
        start_time = datetime.time.fromisoformat(self.params.session_start)
        end_time = datetime.time.fromisoformat(self.params.session_end)
        return start_time <= current_time <= end_time

    def next(self):
        if self.order:
            return  # Pending order exists

        close = self.data.close[0]
        high = self.data.high[0]
        low = self.data.low[0]

        # 1. Manage Open Position (Stop Loss / Take Profit / Break-Even)
        if self.position:
            if self.position.size > 0:  # LONG
                # Check Break-Even trigger
                if self.params.trailing_stop and not self.is_be_set:
                    if high >= self.entry_price + (self.entry_price - self.stop_loss) * self.params.be_trigger_rr:
                        self.stop_loss = self.entry_price
                        self.is_be_set = True
                        self.log("Moved Stop Loss to Break-Even (1R hit)")

                if low <= self.stop_loss:
                    self.log(f"LONG STOP LOSS HIT at {self.stop_loss:.2f}")
                    self.close()
                elif high >= self.take_profit:
                    self.log(f"LONG TAKE PROFIT HIT at {self.take_profit:.2f}")
                    self.close()

            elif self.position.size < 0:  # SHORT
                if self.params.trailing_stop and not self.is_be_set:
                    if low <= self.entry_price - (self.stop_loss - self.entry_price) * self.params.be_trigger_rr:
                        self.stop_loss = self.entry_price
                        self.is_be_set = True
                        self.log("Moved Stop Loss to Break-Even (1R hit)")

                if high >= self.stop_loss:
                    self.log(f"SHORT STOP LOSS HIT at {self.stop_loss:.2f}")
                    self.close()
                elif low <= self.take_profit:
                    self.log(f"SHORT TAKE PROFIT HIT at {self.take_profit:.2f}")
                    self.close()
            return

        # 2. Check Strategy Entry Conditions
        if not self.in_session():
            return

${
  isNeeraj
    ? `        # Neeraj Joshi Scalping Strategy Entry Logic
        bull_cross = self.ema_fast[0] > self.ema_slow[0]
        bull_pullback = (self.data.low[-1] <= self.ema_fast[0] * 1.002) and (close > self.ema_fast[0])
        bull_mom = self.rsi[0] >= self.params.rsi_long_level
        vol_surge = self.data.volume[0] >= (self.vol_sma[0] * self.params.vol_surge_mult)

        bear_cross = self.ema_fast[0] < self.ema_slow[0]
        bear_pullback = (self.data.high[-1] >= self.ema_fast[0] * 0.998) and (close < self.ema_fast[0])
        bear_mom = self.rsi[0] <= self.params.rsi_short_level

        if bull_cross and bull_pullback and bull_mom and vol_surge:
            sl_dist = self.atr[0] * self.params.atr_multiplier
            self.stop_loss = close - sl_dist
            self.take_profit = close + (sl_dist * self.params.risk_reward)
            self.is_be_set = False
            self.order = self.buy()
            self.log(f"BUY SIGNAL | Entry: {close:.2f}, SL: {self.stop_loss:.2f}, TP: {self.take_profit:.2f}")

        elif bear_cross and bear_pullback and bear_mom and vol_surge:
            sl_dist = self.atr[0] * self.params.atr_multiplier
            self.stop_loss = close + sl_dist
            self.take_profit = close - (sl_dist * self.params.risk_reward)
            self.is_be_set = False
            self.order = self.sell()
            self.log(f"SELL SIGNAL | Entry: {close:.2f}, SL: {self.stop_loss:.2f}, TP: {self.take_profit:.2f}")`
    : `        # Gold 15M CHoCH (Smart Money Concepts) Entry Logic
        recent_high = self.highest[0]
        recent_low = self.lowest[0]

        bullish_choch = close > recent_high and self.data.close[-1] <= recent_high
        bearish_choch = close < recent_low and self.data.close[-1] >= recent_low

        if bullish_choch:
            sl_dist = max(close - recent_low, self.atr[0] * 1.5)
            self.stop_loss = close - sl_dist
            self.take_profit = close + (sl_dist * self.params.risk_reward)
            self.is_be_set = False
            self.order = self.buy()
            self.log(f"BULLISH CHoCH BUY | Entry: {close:.2f}, SL: {self.stop_loss:.2f}, TP: {self.take_profit:.2f}")

        elif bearish_choch:
            sl_dist = max(recent_high - close, self.atr[0] * 1.5)
            self.stop_loss = close + sl_dist
            self.take_profit = close - (sl_dist * self.params.risk_reward)
            self.is_be_set = False
            self.order = self.sell()
            self.log(f"BEARISH CHoCH SELL | Entry: {close:.2f}, SL: {self.stop_loss:.2f}, TP: {self.take_profit:.2f}")`
}

# --- Execution Runner ---
if __name__ == '__main__':
    cerebro = bt.Cerebro()
    cerebro.broker.setcash(25000.0)
    cerebro.broker.setcommission(commission=0.0005) # 0.05% commission
    cerebro.addstrategy(${className})

    # Example: Loading 15M Data Feed
    # data = bt.feeds.GenericCSVFeed(dataname='${config.symbol.toLowerCase()}_15m.csv', timeframe=bt.TimeFrame.Minutes, compression=15)
    # cerebro.adddata(data)

    print(f"Starting Portfolio Value: \${cerebro.broker.getvalue():,.2f}")
    # results = cerebro.run()
    # print(f"Final Portfolio Value: \${cerebro.broker.getvalue():,.2f}")
    # cerebro.plot()
`;
}
