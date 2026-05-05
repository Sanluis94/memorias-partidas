/* ===== EFFECTS - Glitch, Shake, VHS, Chromatic Aberration ===== */
(function() {
  'use strict';

  const W = 480, H = 270;

  const Effects = {
    shakeX: 0,
    shakeY: 0,
    shakeTimer: 0,
    shakeIntensity: 0,
    floatOffsets: {},
    floatTimers: {},

    update(dt, sanity) {
      // Screen shake
      if (this.shakeTimer > 0) {
        this.shakeTimer -= dt;
        this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
        this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      } else {
        this.shakeX = 0;
        this.shakeY = 0;
      }

      // Floating objects
      for (const key in this.floatTimers) {
        this.floatTimers[key] += dt * (1 + Math.random() * 0.5);
        this.floatOffsets[key] = Math.sin(this.floatTimers[key] * 2) * 4;
      }

      // Random shake at low sanity
      if (sanity < 30 && Math.random() < 0.01) {
        this.triggerShake(0.15 + Math.random() * 0.2);
      }
    },

    triggerShake(duration, intensity) {
      this.shakeTimer = duration || 0.3;
      this.shakeIntensity = intensity || 5;
    },

    addFloatObject(key) {
      this.floatTimers[key] = Math.random() * Math.PI * 2;
      this.floatOffsets[key] = 0;
    },

    render(ctx, sanity) {
      // VHS tracking lines
      if (sanity < 70 && Math.random() < 0.03 * (1 - sanity/100)) {
        const y = Math.random() * H;
        ctx.fillStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.03})`;
        ctx.fillRect(0, y, W, 1 + Math.random() * 2);
      }

      // Chromatic aberration at low sanity
      if (sanity < 50) {
        const strength = (50 - sanity) / 50;
        const offset = Math.floor(strength * 3);
        if (offset > 0) {
          const imageData = ctx.getImageData(0, 0, W, H);
          const data = imageData.data;
          const copy = new Uint8ClampedArray(data);

          for (let i = 0; i < data.length; i += 4) {
            const pixel = Math.floor(i / 4);
            const px = pixel % W;
            if (px + offset < W) {
              data[i] = copy[i + offset * 4]; // Red shift right
            }
            if (px - offset >= 0) {
              data[i + 2] = copy[i - offset * 4 + 2]; // Blue shift left
            }
          }
          ctx.putImageData(imageData, 0, 0);
        }
      }

      // Screen tear / glitch blocks
      if (sanity < 40 && Math.random() < 0.02) {
        const gy = Math.floor(Math.random() * H);
        const gh = 2 + Math.floor(Math.random() * 8);
        const gx = Math.floor(Math.random() * 20) - 10;
        const imgSlice = ctx.getImageData(0, gy, W, gh);
        ctx.putImageData(imgSlice, gx, gy);
      }

      // Color noise at very low sanity
      if (sanity < 25) {
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = `rgba(${Math.random()*80},${Math.random()*20},${Math.random()*80},${Math.random()*0.1})`;
          ctx.fillRect(
            Math.random() * W,
            Math.random() * H,
            Math.random() * 60 + 10,
            1 + Math.random() * 3
          );
        }
      }
    },
  };

  window.G = window.G || {};
  window.G.Effects = Effects;
})();
