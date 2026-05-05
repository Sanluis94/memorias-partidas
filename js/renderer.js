/* ===== RENDERER - 16-bit style 480x270 ===== */
(function() {
  'use strict';

  const W = 480, H = 270, TILE = 24;
  const COLS = W / TILE; // 20
  const ROWS = Math.ceil(H / TILE); // ~11

  const Renderer = {
    canvas: null,
    ctx: null,

    init() {
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;
    },

    clear(color) {
      this.ctx.fillStyle = color || '#08080c';
      this.ctx.fillRect(0, 0, W, H);
    },

    /* Draw a single tile by type */
    drawTile(tx, ty, type, variant) {
      const x = tx * TILE, y = ty * TILE;
      const ctx = this.ctx;

      switch(type) {
        case '.': // Floor - dark wood
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = '#1a1820';
          ctx.fillRect(x, y + 7, TILE, 1);
          ctx.fillRect(x, y + 15, TILE, 1);
          if ((tx + ty) % 2 === 0) {
            ctx.fillStyle = '#22202a';
            ctx.fillRect(x, y, TILE, TILE);
            ctx.fillStyle = '#1e1c24';
            ctx.fillRect(x, y + 7, TILE, 1);
            ctx.fillRect(x, y + 15, TILE, 1);
          }
          // subtle scuff marks
          if ((tx * 7 + ty * 13) % 11 === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.02)';
            ctx.fillRect(x + 3, y + 4, 5, 1);
          }
          break;

        case '#': // Wall - textured brick
          ctx.fillStyle = '#2c2a3a';
          ctx.fillRect(x, y, TILE, TILE);
          // brick pattern
          ctx.fillStyle = '#33304a';
          ctx.fillRect(x + 1, y + 1, 10, 5);
          ctx.fillRect(x + 13, y + 1, 10, 5);
          ctx.fillRect(x + 6, y + 8, 10, 5);
          ctx.fillRect(x + 18, y + 8, 5, 5);
          ctx.fillRect(x, y + 8, 4, 5);
          ctx.fillRect(x + 1, y + 15, 10, 5);
          ctx.fillRect(x + 13, y + 15, 10, 5);
          // mortar lines
          ctx.fillStyle = '#252338';
          ctx.fillRect(x, y + 6, TILE, 2);
          ctx.fillRect(x, y + 13, TILE, 2);
          ctx.fillRect(x, y + 20, TILE, 2);
          // top highlight
          ctx.fillStyle = '#3a3850';
          ctx.fillRect(x, y, TILE, 1);
          break;

        case 'D': // Door
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = '#4a3020';
          ctx.fillRect(x + 4, y, 16, TILE);
          ctx.fillStyle = '#5a4030';
          ctx.fillRect(x + 6, y + 1, 12, TILE - 2);
          // panels
          ctx.fillStyle = '#4a3525';
          ctx.fillRect(x + 7, y + 2, 10, 8);
          ctx.fillRect(x + 7, y + 12, 10, 8);
          // knob
          ctx.fillStyle = '#c8a860';
          ctx.fillRect(x + 15, y + 10, 3, 3);
          ctx.fillStyle = '#e8c880';
          ctx.fillRect(x + 16, y + 11, 1, 1);
          break;

        case 'B': // Bed
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          // frame
          ctx.fillStyle = '#3a2818';
          ctx.fillRect(x + 1, y + 4, 22, 18);
          // mattress
          ctx.fillStyle = '#2d1b69';
          ctx.fillRect(x + 2, y + 5, 20, 14);
          // pillow
          ctx.fillStyle = '#d8d4d0';
          ctx.fillRect(x + 2, y + 5, 20, 5);
          ctx.fillStyle = '#e8e4e0';
          ctx.fillRect(x + 3, y + 6, 18, 3);
          // blanket fold
          ctx.fillStyle = '#3d2b79';
          ctx.fillRect(x + 2, y + 12, 20, 2);
          break;

        case 'T': // Table
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          // tabletop
          ctx.fillStyle = '#5a4020';
          ctx.fillRect(x + 1, y + 6, 22, 4);
          ctx.fillStyle = '#6a5030';
          ctx.fillRect(x + 2, y + 7, 20, 2);
          // legs
          ctx.fillStyle = '#4a3018';
          ctx.fillRect(x + 3, y + 10, 3, 12);
          ctx.fillRect(x + 18, y + 10, 3, 12);
          break;

        case 'C': // Chair
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = '#4a3018';
          ctx.fillRect(x + 6, y + 2, 12, 3);
          ctx.fillRect(x + 6, y + 8, 12, 3);
          ctx.fillRect(x + 6, y + 11, 3, 8);
          ctx.fillRect(x + 15, y + 11, 3, 8);
          break;

        case 'S': // Shelf/Cabinet
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = '#3a3a4a';
          ctx.fillRect(x + 1, y + 1, 22, 22);
          ctx.fillStyle = '#4a4a5a';
          ctx.fillRect(x + 2, y + 2, 20, 9);
          ctx.fillRect(x + 2, y + 13, 20, 9);
          // handles
          ctx.fillStyle = '#8a8a9a';
          ctx.fillRect(x + 10, y + 5, 4, 2);
          ctx.fillRect(x + 10, y + 16, 4, 2);
          break;

        case 'M': // Mirror
          ctx.fillStyle = '#2c2a3a';
          ctx.fillRect(x, y, TILE, TILE);
          // frame
          ctx.fillStyle = '#6b6b7b';
          ctx.fillRect(x + 4, y + 1, 16, 22);
          // glass
          ctx.fillStyle = '#2a4a5a';
          ctx.fillRect(x + 5, y + 2, 14, 20);
          // reflection
          ctx.fillStyle = '#3a6a7a';
          ctx.fillRect(x + 6, y + 3, 4, 6);
          ctx.fillStyle = '#4a8a9a';
          ctx.fillRect(x + 7, y + 4, 2, 3);
          break;

        case 'P': // Pills
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          // bottle
          ctx.fillStyle = '#d4d4d4';
          ctx.fillRect(x + 7, y + 4, 10, 14);
          ctx.fillStyle = '#ccc';
          ctx.fillRect(x + 7, y + 4, 10, 2);
          // label
          ctx.fillStyle = '#f0e6d3';
          ctx.fillRect(x + 8, y + 8, 8, 6);
          // pill
          const pc = variant || '#e94560';
          ctx.fillStyle = pc;
          ctx.fillRect(x + 10, y + 10, 4, 3);
          break;

        case 'V': // TV
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          // casing
          ctx.fillStyle = '#2a2a2a';
          ctx.fillRect(x + 1, y + 3, 22, 16);
          // screen
          ctx.fillStyle = '#0a0a18';
          ctx.fillRect(x + 2, y + 4, 20, 14);
          // static
          for (let i = 0; i < 6; i++) {
            const sx = x + 3 + Math.floor(Math.random() * 17);
            const sy = y + 5 + Math.floor(Math.random() * 11);
            ctx.fillStyle = `rgba(100,100,120,${Math.random() * 0.4})`;
            ctx.fillRect(sx, sy, 1 + Math.floor(Math.random() * 3), 1);
          }
          // stand
          ctx.fillStyle = '#333';
          ctx.fillRect(x + 9, y + 19, 6, 3);
          break;

        case 'F': // Photo Frame
          ctx.fillStyle = '#2c2a3a';
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = '#5a4020';
          ctx.fillRect(x + 4, y + 2, 16, 16);
          ctx.fillStyle = '#7a6040';
          ctx.fillRect(x + 5, y + 3, 14, 14);
          // silhouette
          ctx.fillStyle = '#9a8060';
          ctx.fillRect(x + 9, y + 5, 6, 5);
          ctx.fillRect(x + 7, y + 10, 10, 5);
          break;

        case 'W': // Window
          ctx.fillStyle = '#2c2a3a';
          ctx.fillRect(x, y, TILE, TILE);
          // frame
          ctx.fillStyle = '#4a4050';
          ctx.fillRect(x + 2, y + 2, 20, 20);
          // glass - night sky
          ctx.fillStyle = '#0a1428';
          ctx.fillRect(x + 3, y + 3, 18, 18);
          // cross
          ctx.fillStyle = '#4a4050';
          ctx.fillRect(x + 11, y + 3, 2, 18);
          ctx.fillRect(x + 3, y + 11, 18, 2);
          // stars
          ctx.fillStyle = '#6688aa';
          ctx.fillRect(x + 6, y + 6, 1, 1);
          ctx.fillRect(x + 16, y + 8, 1, 1);
          ctx.fillRect(x + 8, y + 16, 1, 1);
          break;

        case 'K': // Sink
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = '#888';
          ctx.fillRect(x + 3, y + 6, 18, 12);
          ctx.fillStyle = '#666';
          ctx.fillRect(x + 5, y + 8, 14, 8);
          // faucet
          ctx.fillStyle = '#aaa';
          ctx.fillRect(x + 10, y + 3, 4, 4);
          ctx.fillStyle = '#ccc';
          ctx.fillRect(x + 11, y + 4, 2, 2);
          break;

        case 'L': // Toilet
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = '#d4d4d4';
          ctx.fillRect(x + 5, y + 4, 14, 16);
          ctx.fillStyle = '#bbb';
          ctx.fillRect(x + 7, y + 6, 10, 8);
          // lid
          ctx.fillStyle = '#e0e0e0';
          ctx.fillRect(x + 6, y + 2, 12, 4);
          break;

        case 'U': // Bathtub
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = '#d4d4d4';
          ctx.fillRect(x + 1, y + 6, 22, 14);
          ctx.fillStyle = '#bbb';
          ctx.fillRect(x + 2, y + 8, 20, 10);
          ctx.fillStyle = '#6a8aaa';
          ctx.fillRect(x + 3, y + 9, 18, 7);
          break;

        case 'R': // Fridge
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = '#ddd';
          ctx.fillRect(x + 3, y + 1, 18, 22);
          ctx.fillStyle = '#ccc';
          ctx.fillRect(x + 4, y + 2, 16, 9);
          ctx.fillRect(x + 4, y + 13, 16, 9);
          // handles
          ctx.fillStyle = '#999';
          ctx.fillRect(x + 18, y + 6, 2, 3);
          ctx.fillRect(x + 18, y + 17, 2, 3);
          break;

        case 'O': // Stove
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = '#444';
          ctx.fillRect(x + 2, y + 3, 20, 18);
          // burners
          ctx.fillStyle = '#555';
          ctx.fillRect(x + 4, y + 5, 6, 5);
          ctx.fillRect(x + 14, y + 5, 6, 5);
          ctx.fillStyle = '#666';
          ctx.fillRect(x + 5, y + 6, 4, 3);
          ctx.fillRect(x + 15, y + 6, 4, 3);
          // oven door
          ctx.fillStyle = '#333';
          ctx.fillRect(x + 4, y + 13, 16, 7);
          break;

        case 'H': // Couch
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = '#2d1b69';
          ctx.fillRect(x + 1, y + 6, 22, 14);
          // backrest
          ctx.fillStyle = '#3d2b79';
          ctx.fillRect(x + 1, y + 3, 22, 6);
          // cushions
          ctx.fillStyle = '#4d3b89';
          ctx.fillRect(x + 2, y + 4, 9, 4);
          ctx.fillRect(x + 13, y + 4, 9, 4);
          // seat
          ctx.fillStyle = '#352570';
          ctx.fillRect(x + 2, y + 10, 20, 6);
          break;

        case 'A': // Bookshelf
          ctx.fillStyle = '#2c2a3a';
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = '#4a3018';
          ctx.fillRect(x + 1, y + 1, 22, 22);
          // shelf dividers
          ctx.fillStyle = '#5a4028';
          ctx.fillRect(x + 1, y + 8, 22, 1);
          ctx.fillRect(x + 1, y + 15, 22, 1);
          // books row 1
          ctx.fillStyle = '#8b0000'; ctx.fillRect(x+2, y+2, 4, 6);
          ctx.fillStyle = '#1a4a2a'; ctx.fillRect(x+6, y+3, 3, 5);
          ctx.fillStyle = '#2a4a8a'; ctx.fillRect(x+9, y+2, 5, 6);
          ctx.fillStyle = '#c8a860'; ctx.fillRect(x+14, y+2, 4, 6);
          ctx.fillStyle = '#4a1942'; ctx.fillRect(x+18, y+3, 4, 5);
          // books row 2
          ctx.fillStyle = '#2a4a8a'; ctx.fillRect(x+2, y+9, 5, 6);
          ctx.fillStyle = '#8b5500'; ctx.fillRect(x+7, y+10, 3, 5);
          ctx.fillStyle = '#8b0000'; ctx.fillRect(x+10, y+9, 4, 6);
          ctx.fillStyle = '#3a5a3a'; ctx.fillRect(x+14, y+10, 4, 5);
          ctx.fillStyle = '#5a2952'; ctx.fillRect(x+18, y+9, 4, 6);
          // books row 3
          ctx.fillStyle = '#6a5a2a'; ctx.fillRect(x+2, y+16, 4, 6);
          ctx.fillStyle = '#2d1b69'; ctx.fillRect(x+6, y+17, 5, 5);
          ctx.fillStyle = '#8b0000'; ctx.fillRect(x+11, y+16, 3, 6);
          ctx.fillStyle = '#2a4a8a'; ctx.fillRect(x+14, y+17, 4, 5);
          break;

        case 'E': // Lamp
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          // shade
          ctx.fillStyle = '#c8b88a';
          ctx.fillRect(x + 5, y + 1, 14, 9);
          ctx.fillStyle = '#e8d8a8';
          ctx.fillRect(x + 6, y + 2, 12, 7);
          // warm glow
          ctx.fillStyle = 'rgba(232,216,168,0.1)';
          ctx.fillRect(x, y, TILE, TILE);
          // pole
          ctx.fillStyle = '#888';
          ctx.fillRect(x + 10, y + 10, 4, 10);
          // base
          ctx.fillStyle = '#666';
          ctx.fillRect(x + 8, y + 20, 8, 3);
          break;

        case 'I': // Nightstand
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = '#4a3018';
          ctx.fillRect(x + 4, y + 5, 16, 16);
          ctx.fillStyle = '#5a4028';
          ctx.fillRect(x + 5, y + 6, 14, 7);
          ctx.fillRect(x + 5, y + 14, 14, 6);
          // handles
          ctx.fillStyle = '#8a8a8a';
          ctx.fillRect(x + 10, y + 8, 4, 2);
          ctx.fillRect(x + 10, y + 16, 4, 2);
          break;

        case 'N': // Note/Paper
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          // paper
          ctx.fillStyle = '#f0e6d3';
          ctx.fillRect(x + 5, y + 3, 14, 16);
          // text lines
          ctx.fillStyle = '#555';
          for (let i = 0; i < 6; i++) {
            ctx.fillRect(x + 7, y + 6 + i * 2, 10, 1);
          }
          break;

        case 'G': // Rug
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = '#3a1832';
          ctx.fillRect(x + 1, y + 1, 22, 22);
          ctx.fillStyle = '#4a2842';
          ctx.fillRect(x + 3, y + 3, 18, 18);
          // pattern
          ctx.fillStyle = '#5a3852';
          ctx.fillRect(x + 5, y + 5, 14, 14);
          ctx.fillStyle = '#4a2842';
          ctx.fillRect(x + 8, y + 8, 8, 8);
          break;

        case 'X': // Lab equipment
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          // machine body
          ctx.fillStyle = '#555';
          ctx.fillRect(x + 2, y + 4, 20, 16);
          // screen
          ctx.fillStyle = '#0a2a0a';
          ctx.fillRect(x + 4, y + 6, 10, 8);
          // waveform
          ctx.fillStyle = '#3aaa5a';
          for (let i = 0; i < 8; i++) {
            const h = Math.floor(Math.sin(i * 0.8 + Date.now() * 0.003) * 3);
            ctx.fillRect(x + 5 + i, y + 10 + h, 1, 1);
          }
          // buttons
          ctx.fillStyle = '#e94560';
          ctx.fillRect(x + 16, y + 7, 3, 3);
          ctx.fillStyle = '#4a8a4a';
          ctx.fillRect(x + 16, y + 12, 3, 3);
          // blinker
          if (Math.random() < 0.5) {
            ctx.fillStyle = '#4f8';
            ctx.fillRect(x + 20, y + 5, 2, 2);
          }
          break;

        case 'Q': // Lab console (big)
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = '#444';
          ctx.fillRect(x + 1, y + 2, 22, 20);
          // displays
          ctx.fillStyle = '#0a1a2a';
          ctx.fillRect(x + 3, y + 4, 8, 6);
          ctx.fillRect(x + 13, y + 4, 8, 6);
          // readouts
          ctx.fillStyle = '#2a8aca';
          ctx.fillRect(x + 4, y + 5, 6, 1);
          ctx.fillRect(x + 14, y + 7, 6, 1);
          // knobs
          ctx.fillStyle = '#888';
          ctx.fillRect(x + 4, y + 14, 4, 4);
          ctx.fillRect(x + 10, y + 14, 4, 4);
          ctx.fillRect(x + 16, y + 14, 4, 4);
          break;

        case 'Z': // Void tile (ch5)
          ctx.fillStyle = '#050508';
          ctx.fillRect(x, y, TILE, TILE);
          // floating particles
          if (Math.random() < 0.15) {
            ctx.fillStyle = `rgba(100,60,200,${Math.random() * 0.3})`;
            ctx.fillRect(
              x + Math.floor(Math.random() * TILE),
              y + Math.floor(Math.random() * TILE),
              1, 1
            );
          }
          break;

        default:
          ctx.fillStyle = '#1e1c24';
          ctx.fillRect(x, y, TILE, TILE);
      }
    },

    /* Draw room */
    drawRoom(room, pillColor) {
      for (let y = 0; y < room.length; y++) {
        for (let x = 0; x < room[y].length; x++) {
          const ch = room[y][x];
          const floatY = G.Effects.floatOffsets[y * 20 + x] || 0;
          if (floatY && ch !== '.' && ch !== '#') {
            this.drawTile(x, y, '.', null);
            this.ctx.save();
            this.ctx.translate(0, floatY);
            this.drawTile(x, y, ch, ch === 'P' ? pillColor : null);
            this.ctx.restore();
          } else {
            this.drawTile(x, y, ch, ch === 'P' ? pillColor : null);
          }
        }
      }
    },

    /* Darkness overlay around player */
    drawDarkness(px, py, radius) {
      const gradient = this.ctx.createRadialGradient(px, py, radius * 0.4, px, py, radius);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.6, 'rgba(0,0,0,0.15)');
      gradient.addColorStop(0.85, 'rgba(0,0,0,0.45)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.7)');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, W, H);
    },

    drawText(text, x, y, color, size) {
      this.ctx.font = (size || 8) + 'px "Press Start 2P"';
      this.ctx.fillStyle = color || '#f0e6d3';
      this.ctx.fillText(text, Math.floor(x), Math.floor(y));
    },

    drawFade(alpha) {
      this.ctx.fillStyle = `rgba(0,0,0,${Math.min(1, alpha)})`;
      this.ctx.fillRect(0, 0, W, H);
    },

    drawCoherenceBar(value) {
      const bw = 60, bh = 6;
      const bx = W - bw - 8, by = 8;
      // label
      this.ctx.font = '5px "Press Start 2P"';
      this.ctx.fillStyle = 'rgba(150,150,170,0.4)';
      this.ctx.fillText('COERENCIA', bx, by - 2);
      // bg
      this.ctx.fillStyle = '#1a1a2e';
      this.ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
      const pct = value / 100;
      let color = '#4f8';
      if (pct < 0.6) color = '#c8a860';
      if (pct < 0.4) color = '#e94560';
      if (pct < 0.2) color = '#ff0040';
      this.ctx.fillStyle = color;
      this.ctx.fillRect(bx, by, Math.floor(bw * pct), bh);
    },

    getWidth() { return W; },
    getHeight() { return H; },
    getTileSize() { return TILE; },
  };

  window.G = window.G || {};
  window.G.Renderer = Renderer;
})();
