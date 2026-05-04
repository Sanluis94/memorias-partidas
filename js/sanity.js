/* ===== SANITY / COHERENCE SYSTEM ===== */
(function() {
  'use strict';

  const Sanity = {
    value: 100,
    max: 100,
    min: 0,
    events: [],
    lastTrigger: '',

    change(amount, reason) {
      const old = this.value;
      this.value = Math.max(this.min, Math.min(this.max, this.value + amount));
      this.lastTrigger = reason || '';
      if (amount < 0 && Math.abs(amount) >= 10) {
        G.Effects.triggerShake(0.3);
        G.Audio.sfx.glitch();
      }
      this.events.push({ from: old, to: this.value, amount, reason, time: Date.now() });
    },

    getLevel() {
      if (this.value >= 80) return 'stable';
      if (this.value >= 60) return 'uneasy';
      if (this.value >= 40) return 'unstable';
      if (this.value >= 20) return 'critical';
      return 'collapsed';
    },

    /* Get a 0-1 distortion factor */
    getDistortion() {
      return Math.max(0, (100 - this.value) / 100);
    },

    reset() {
      this.value = 100;
      this.events = [];
    },

    /* Returns ending based on coherence + flags */
    getEnding(flags) {
      if (this.value > 50 && flags.foundAllNotes) return 'observer';
      if (this.value < 20) return 'collapse';
      return 'choice';
    }
  };

  window.G = window.G || {};
  window.G.Sanity = Sanity;
})();
