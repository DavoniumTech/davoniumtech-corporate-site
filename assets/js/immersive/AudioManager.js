import { eventBus } from './EventDispatcher.js';

/** Opt-in, procedural ambience and short UI cues. No audio starts before a user gesture. */
class AudioManager {
  constructor() {
    this.enabled = false;
    this.spatial = false;
    this.context = null;
    this.master = null;
    this.filter = null;
    this.panner = null;
    this.oscillators = [];
    this._suspendToken = 0;
  }

  get supported() { return Boolean(window.AudioContext || window.webkitAudioContext); }

  _initialise() {
    if (this.context) return true;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return false;
    const context = new AudioCtor();
    const master = context.createGain();
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 220; filter.Q.value = .45;
    const panner = typeof context.createStereoPanner === 'function' ? context.createStereoPanner() : null;
    master.gain.value = 0;
    if (panner) { filter.connect(panner); panner.connect(master); }
    else filter.connect(master);
    master.connect(context.destination);
    this.context = context; this.master = master; this.filter = filter; this.panner = panner;
    return true;
  }

  async setEnabled(enabled) {
    if (enabled && !this._initialise()) throw new Error('Web Audio is not supported in this browser.');
    this.enabled = Boolean(enabled);
    if (!this.context) return false;
    const context = this.context;
    const token = ++this._suspendToken;
    if (this.enabled) {
      await context.resume();
      if (this.oscillators.length === 0) {
        for (const [frequency, level] of [[55, .006], [82.41, .0028]]) {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = 'sine'; oscillator.frequency.value = frequency;
          gain.gain.value = level;
          oscillator.connect(gain); gain.connect(this.filter);
          oscillator.start(); this.oscillators.push({ oscillator, gain });
        }
      }
      this.master.gain.cancelScheduledValues(context.currentTime);
      this.master.gain.setTargetAtTime(.72, context.currentTime, .18);
      this._updateDepthFilter(0);
    } else {
      this.master.gain.cancelScheduledValues(context.currentTime);
      this.master.gain.setTargetAtTime(0, context.currentTime, .06);
      window.setTimeout(() => { if (!this.enabled && token === this._suspendToken) context.suspend().catch(() => {}); }, 260);
    }
    eventBus.emit('audio:state', { enabled: this.enabled, spatial: this.spatial });
    return this.enabled;
  }

  setSpatial(enabled) {
    this.spatial = Boolean(enabled && this.panner);
    if (this.panner && this.context) {
      const x = this.spatial ? .22 : 0;
      this.panner.pan.setTargetAtTime(x, this.context.currentTime, .12);
    }
    eventBus.emit('audio:state', { enabled: this.enabled, spatial: this.spatial });
    return this.spatial;
  }

  updatePointer(x, normalisedDepth = 0) {
    if (!this.context || !this.enabled) return;
    if (this.spatial && this.panner) this.panner.pan.setTargetAtTime(Math.max(-1, Math.min(1, x)), this.context.currentTime, .14);
    this._updateDepthFilter(normalisedDepth);
  }

  _updateDepthFilter(depth) {
    if (!this.filter || !this.context) return;
    const frequency = 170 + Math.max(0, Math.min(1, Number(depth) || 0)) * 560;
    this.filter.frequency.setTargetAtTime(frequency, this.context.currentTime, .3);
  }

  playCue(kind = 'click') {
    if (!this.enabled || !this.context || this.context.state !== 'running') return;
    const context = this.context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime;
    const frequencies = { click: 460, open: 560, success: 680, error: 210 };
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequencies[kind] || frequencies.click, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(90, (frequencies[kind] || 460) * .72), start + .075);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(.018, start + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, start + .095);
    oscillator.connect(gain); gain.connect(this.master);
    oscillator.start(start); oscillator.stop(start + .11);
    oscillator.addEventListener('ended', () => { oscillator.disconnect(); gain.disconnect(); }, { once: true });
  }

  dispose() {
    for (const item of this.oscillators) { try { item.oscillator.stop(); } catch (_) {} }
    this.oscillators.length = 0;
    if (this.context) this.context.close().catch(() => {});
    this.context = this.master = this.filter = this.panner = null;
    this.enabled = false; this.spatial = false;
  }
}

export const audioManager = new AudioManager();
export { AudioManager };
