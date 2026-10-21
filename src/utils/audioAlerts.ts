// Web Audio API Sound Generator for Institutional Trading Alerts
// Zero external dependencies, instantaneous playback, zero latency.

class SoundAlertManager {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  // Play a pleasant synthesizer chime with given frequencies
  private playTones(freqs: number[], durations: number[], type: OscillatorType = 'sine', gainVal: number = 0.15) {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      let startTime = now;

      freqs.forEach((freq, idx) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        const dur = durations[idx] || 0.12;

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + dur);

        startTime += dur * 0.7; // slight overlap for melodic feel
      });
    } catch (e) {
      console.warn('Audio playback not permitted yet:', e);
    }
  }

  // 1. BUY / LONG Trade Entry Sound (Upward rising triumphant chime: C5 -> E5 -> G5)
  public playBuyTradeSound() {
    this.playTones([523.25, 659.25, 783.99], [0.12, 0.12, 0.22], 'sine', 0.18);
  }

  // 2. SELL / SHORT Trade Entry Sound (Crisp distinctive descending chime: G5 -> E5 -> C5)
  public playSellTradeSound() {
    this.playTones([783.99, 659.25, 523.25], [0.12, 0.12, 0.22], 'triangle', 0.18);
  }

  // 3. Take Profit Hit Sound (Sparkling high bell: E6 -> G6 -> C7)
  public playTakeProfitSound() {
    this.playTones([1318.51, 1567.98, 2093.0], [0.1, 0.12, 0.35], 'sine', 0.22);
  }

  // 4. Stop Loss Hit Sound (Low soft alert: F4 -> D4)
  public playStopLossSound() {
    this.playTones([349.23, 293.66], [0.14, 0.25], 'sine', 0.16);
  }

  // 5. Bot Signal Detected Ping (Single crisp ping: A5)
  public playSignalPing() {
    this.playTones([880.0], [0.15], 'sine', 0.12);
  }
}

export const soundAlerts = new SoundAlertManager();
