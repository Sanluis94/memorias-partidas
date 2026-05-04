/* ===== AUDIO ENGINE - Web Audio API Procedural Sounds ===== */
(function() {
  'use strict';

  const Audio = {
    ctx: null,
    masterGain: null,
    droneOsc: null,
    droneGain: null,
    heartbeatInterval: null,
    initialized: false,

    init() {
      if (this.initialized) return;
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    },

    /* Low frequency ambient drone */
    startDrone() {
      if (!this.ctx) return;
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.value = 0.06;
      this.droneGain.connect(this.masterGain);

      this.droneOsc = this.ctx.createOscillator();
      this.droneOsc.type = 'sine';
      this.droneOsc.frequency.value = 55;
      this.droneOsc.connect(this.droneGain);
      this.droneOsc.start();

      // Second layer
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = 57.5;
      osc2.connect(this.droneGain);
      osc2.start();
    },

    /* Adjust drone intensity based on coherence */
    updateDrone(coherence) {
      if (!this.droneGain) return;
      const intensity = 0.03 + (1 - coherence / 100) * 0.12;
      this.droneGain.gain.setTargetAtTime(intensity, this.ctx.currentTime, 0.5);
    },

    /* Heartbeat that speeds up with low coherence */
    startHeartbeat(coherence) {
      this.stopHeartbeat();
      if (!this.ctx) return;
      const bpm = 60 + (100 - coherence) * 1.5;
      const interval = 60000 / bpm;

      const beat = () => {
        this._playTone(80, 0.08, 'sine', 0.15);
        setTimeout(() => this._playTone(60, 0.06, 'sine', 0.1), 120);
      };
      beat();
      this.heartbeatInterval = setInterval(beat, interval);
    },

    stopHeartbeat() {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
    },

    /* Play static noise burst */
    playStatic(duration, volume) {
      if (!this.ctx) return;
      duration = duration || 0.3;
      volume = volume || 0.08;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * volume;
      }
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      source.connect(gain);
      gain.connect(this.masterGain);
      source.start();
    },

    /* Play a simple tone */
    _playTone(freq, duration, type, vol) {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type || 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol || 0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    },

    /* 8-bit style sound effects */
    sfx: {
      footstep() { Audio._playTone(200 + Math.random() * 50, 0.05, 'square', 0.04); },
      interact() { Audio._playTone(440, 0.1, 'square', 0.08); setTimeout(() => Audio._playTone(550, 0.1, 'square', 0.08), 80); },
      door() { Audio._playTone(150, 0.15, 'triangle', 0.1); setTimeout(() => Audio._playTone(120, 0.2, 'triangle', 0.08), 100); },
      pill() { Audio._playTone(330, 0.08, 'sine', 0.06); setTimeout(() => Audio._playTone(440, 0.08, 'sine', 0.06), 60); setTimeout(() => Audio._playTone(550, 0.1, 'sine', 0.06), 120); },
      glitch() { Audio.playStatic(0.15, 0.12); Audio._playTone(80 + Math.random() * 400, 0.08, 'sawtooth', 0.06); },
      whisper() { Audio.playStatic(0.8, 0.03); Audio._playTone(200, 0.5, 'sine', 0.02); },
      scare() { Audio._playTone(100, 0.3, 'sawtooth', 0.15); Audio.playStatic(0.2, 0.15); },
      text() { Audio._playTone(800, 0.03, 'square', 0.03); },
      select() { Audio._playTone(660, 0.06, 'square', 0.06); },
      menuMove() { Audio._playTone(440, 0.04, 'square', 0.05); },
    }
  };

  window.G = window.G || {};
  window.G.Audio = Audio;
})();
