/* ===== VISUAL EFFECTS ENGINE - Glitch, Distortion, Quantum Horror ===== */
(function() {
  'use strict';

  const Effects = {
    shakeX: 0,
    shakeY: 0,
    shakeTimer: 0,
    glitchBars: [],
    chromaticOffset: 0,
    flickerAlpha: 0,
    floatOffsets: {},
    staticNoise: null,
    distortionLevel: 0,
    vhsTracking: 0,

    update(dt, coherence) {
      this.distortionLevel = Math.max(0, (100 - coherence) / 100);

      // Screen shake
      if (this.shakeTimer > 0) {
        this.shakeTimer -= dt;
        const intensity = this.shakeTimer * 3;
        this.shakeX = (Math.random() - 0.5) * intensity;
        this.shakeY = (Math.random() - 0.5) * intensity;
      } else {
        // Passive shake at low coherence
        if (coherence < 60) {
          const s = (60 - coherence) / 60 * 1.5;
          this.shakeX = (Math.random() - 0.5) * s;
          this.shakeY = (Math.random() - 0.5) * s;
        } else {
          this.shakeX = 0;
          this.shakeY = 0;
        }
      }

      // Chromatic aberration
      this.chromaticOffset = coherence < 50 ? Math.floor((50 - coherence) / 10) : 0;

      // Random glitch bars
      if (coherence < 70 && Math.random() < (70 - coherence) / 500) {
        this.glitchBars.push({
          y: Math.random() * 180,
          h: 1 + Math.random() * 4,
          offset: (Math.random() - 0.5) * 10,
          life: 0.05 + Math.random() * 0.1,
        });
      }
      this.glitchBars = this.glitchBars.filter(b => { b.life -= dt; return b.life > 0; });

      // Flicker
      if (coherence < 40 && Math.random() < 0.02) {
        this.flickerAlpha = 0.3 + Math.random() * 0.4;
      } else {
        this.flickerAlpha *= 0.9;
      }

      // Float offsets for objects
      const t = performance.now() / 1000;
      for (const key in this.floatOffsets) {
        this.floatOffsets[key] = Math.sin(t * 0.8 + parseInt(key) * 1.7) * 3 * this.distortionLevel;
      }

      // VHS tracking
      if (coherence < 30) {
        this.vhsTracking = Math.sin(t * 2) * (30 - coherence) / 10;
      } else {
        this.vhsTracking = 0;
      }

      // CSS class management
      const container = document.getElementById('game-container');
      if (container) {
        container.classList.toggle('glitch-active', coherence < 60 && coherence >= 30);
        container.classList.toggle('glitch-heavy', coherence < 30);
        container.classList.toggle('chromatic', coherence < 50);
      }
    },

    triggerShake(duration) {
      this.shakeTimer = duration || 0.5;
    },

    addFloatObject(id) {
      this.floatOffsets[id] = 0;
    },

    /* Draw post-processing effects on the canvas */
    render(ctx, coherence) {
      // Glitch bars
      for (const bar of this.glitchBars) {
        const imgData = ctx.getImageData(0, Math.floor(bar.y), 320, Math.ceil(bar.h));
        ctx.putImageData(imgData, Math.floor(bar.offset), Math.floor(bar.y));
      }

      // Chromatic aberration
      if (this.chromaticOffset > 0) {
        const imgData = ctx.getImageData(0, 0, 320, 180);
        const copy = ctx.createImageData(320, 180);
        const src = imgData.data;
        const dst = copy.data;
        const off = this.chromaticOffset;

        for (let y = 0; y < 180; y++) {
          for (let x = 0; x < 320; x++) {
            const i = (y * 320 + x) * 4;
            // Red channel shifted left
            const rx = Math.max(0, Math.min(319, x - off));
            const ri = (y * 320 + rx) * 4;
            dst[i] = src[ri];
            // Green stays
            dst[i + 1] = src[i + 1];
            // Blue channel shifted right
            const bx = Math.max(0, Math.min(319, x + off));
            const bi = (y * 320 + bx) * 4;
            dst[i + 2] = src[bi + 2];
            dst[i + 3] = src[i + 3];
          }
        }
        ctx.putImageData(copy, 0, 0);
      }

      // Static noise overlay
      if (coherence < 50) {
        const intensity = (50 - coherence) / 50 * 0.15;
        const imgData = ctx.getImageData(0, 0, 320, 180);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          if (Math.random() < intensity) {
            const n = Math.random() * 255;
            d[i] = d[i + 1] = d[i + 2] = n;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // Screen flicker
      if (this.flickerAlpha > 0.01) {
        ctx.fillStyle = `rgba(255,255,255,${this.flickerAlpha})`;
        ctx.fillRect(0, 0, 320, 180);
      }

      // VHS tracking lines
      if (Math.abs(this.vhsTracking) > 0.5) {
        const ty = 90 + this.vhsTracking * 5;
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(0, ty, 320, 2);
        ctx.fillRect(0, ty + 20, 320, 1);
      }

      // Color inversion at very low coherence
      if (coherence < 15 && Math.random() < 0.05) {
        const imgData = ctx.getImageData(0, 0, 320, 180);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          d[i] = 255 - d[i];
          d[i+1] = 255 - d[i+1];
          d[i+2] = 255 - d[i+2];
        }
        ctx.putImageData(imgData, 0, 0);
      }
    },

    /* Full-screen flash effect */
    flash(ctx, color, alpha) {
      ctx.fillStyle = color || 'rgba(255,255,255,' + (alpha || 0.8) + ')';
      ctx.fillRect(0, 0, 320, 180);
    }
  };

  window.G = window.G || {};
  window.G.Effects = Effects;
})();
