/* ===== EFFECTS - Horror atmosphere ===== */
(function() {
  'use strict';
  const W = 480, H = 270;

  const Effects = {
    shakeX: 0, shakeY: 0, shakeTimer: 0, shakeIntensity: 0,
    floatOffsets: {}, floatTimers: {},
    flickerTimer: 0, // screen flicker (Layers of Fear)
    breathTimer: 0, // wall breathing effect
    distortLines: [], // OMORI-style distortion lines

    update(dt, sanity) {
      // Shake
      if (this.shakeTimer > 0) {
        this.shakeTimer -= dt;
        this.shakeX = (Math.random()-0.5) * this.shakeIntensity;
        this.shakeY = (Math.random()-0.5) * this.shakeIntensity;
      } else { this.shakeX = 0; this.shakeY = 0; }

      // Float
      for (const k in this.floatTimers) {
        this.floatTimers[k] += dt * (1 + Math.random()*0.3);
        this.floatOffsets[k] = Math.sin(this.floatTimers[k] * 1.5) * 3;
      }

      // Flicker countdown
      if (this.flickerTimer > 0) this.flickerTimer -= dt;

      // Wall breathing (Layers of Fear)
      this.breathTimer += dt * 0.5;

      // Random micro-shake at low sanity
      if (sanity < 30 && Math.random() < 0.008) this.triggerShake(0.1, 2);

      // OMORI-style distortion lines at very low sanity
      if (sanity < 35 && Math.random() < 0.01) {
        this.distortLines.push({
          y: Math.random() * H,
          life: 0.3 + Math.random() * 0.4,
          speed: (Math.random() - 0.5) * 100,
          width: 1 + Math.random() * 3,
        });
      }
      // Update distort lines
      for (let i = this.distortLines.length - 1; i >= 0; i--) {
        this.distortLines[i].life -= dt;
        this.distortLines[i].y += this.distortLines[i].speed * dt;
        if (this.distortLines[i].life <= 0) this.distortLines.splice(i, 1);
      }
    },

    triggerShake(dur, intensity) {
      this.shakeTimer = dur || 0.3;
      this.shakeIntensity = intensity || 4;
    },

    addFloatObject(key) {
      this.floatTimers[key] = Math.random() * Math.PI * 2;
      this.floatOffsets[key] = 0;
    },

    render(ctx, sanity) {
      // Screen flicker (Fran Bow pill transition style)
      if (this.flickerTimer > 0) {
        const flick = Math.sin(this.flickerTimer * 40) > 0 ? 0.15 : 0;
        if (flick > 0) {
          ctx.fillStyle = `rgba(60,20,40,${flick})`;
          ctx.fillRect(0, 0, W, H);
        }
      }

      // VHS tracking (Layers of Fear)
      if (sanity < 70) {
        const intensity = (70 - sanity) / 70;
        if (Math.random() < 0.02 * intensity) {
          const y = Math.random() * H;
          ctx.fillStyle = `rgba(200,180,220,${0.01 + Math.random() * 0.02 * intensity})`;
          ctx.fillRect(0, y, W, 1 + Math.random());
        }
      }

      // OMORI-style horizontal distortion lines
      for (const line of this.distortLines) {
        const a = Math.min(1, line.life * 2);
        ctx.fillStyle = `rgba(120,40,80,${a * 0.15})`;
        ctx.fillRect(0, line.y, W, line.width);
      }

      // Chromatic aberration (progressive)
      if (sanity < 50) {
        const str = (50 - sanity) / 50;
        const off = Math.floor(str * 3);
        if (off > 0) {
          try {
            const img = ctx.getImageData(0, 0, W, H);
            const d = img.data;
            const cp = new Uint8ClampedArray(d);
            for (let i = 0; i < d.length; i += 4) {
              const px = (i / 4) % W;
              if (px + off < W) d[i] = cp[i + off * 4];
              if (px - off >= 0) d[i + 2] = cp[i - off * 4 + 2];
            }
            ctx.putImageData(img, 0, 0);
          } catch(e) {}
        }
      }

      // Screen tear (Layers of Fear glitch)
      if (sanity < 40 && Math.random() < 0.015) {
        const gy = Math.floor(Math.random() * H);
        const gh = 2 + Math.floor(Math.random() * 6);
        try {
          const slice = ctx.getImageData(0, gy, W, gh);
          ctx.putImageData(slice, Math.floor((Math.random() - 0.5) * 12), gy);
        } catch(e) {}
      }

      // Fran Bow style: brief red flash at very low sanity
      if (sanity < 20 && Math.random() < 0.003) {
        ctx.fillStyle = `rgba(80,0,0,${Math.random() * 0.08})`;
        ctx.fillRect(0, 0, W, H);
      }

      // OMORI white space particles in void room
      if (G.Scenes && G.Scenes.currentRoomId === 'void_room') {
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = `rgba(100,60,160,${Math.random() * 0.12})`;
          ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
        }
      }

      // Subtle vignette pulse (breathing walls)
      if (sanity < 60) {
        const breath = Math.sin(this.breathTimer) * 0.03 * ((60 - sanity) / 60);
        if (breath > 0) {
          ctx.fillStyle = `rgba(0,0,0,${breath})`;
          ctx.fillRect(0, 0, W, H);
        }
      }
    },
  };

  window.G = window.G || {};
  window.G.Effects = Effects;
})();
