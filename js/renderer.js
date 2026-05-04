/* ===== RENDERER - Canvas 320x180 with pixel art drawing ===== */
(function() {
  'use strict';

  const W = 320, H = 180, TILE = 16;
  const COLS = W / TILE; // 20
  const ROWS = Math.ceil(H / TILE); // ~11

  /* Dark, moody 16-color palette */
  const PAL = [
    'transparent',   // 0
    '#0a0a0f',       // 1 - void
    '#1a1a2e',       // 2 - dark bg
    '#16213e',       // 3 - navy
    '#2d1b69',       // 4 - purple
    '#4a1942',       // 5 - magenta
    '#8b0000',       // 6 - dark red
    '#e94560',       // 7 - red
    '#d4a574',       // 8 - skin
    '#6b4e3d',       // 9 - wood
    '#6b6b6b',       // a - gray
    '#3a3a3a',       // b - dark gray
    '#2d5a27',       // c - green
    '#c8b88a',       // d - cream
    '#2a4a8a',       // e - blue
    '#f0e6d3',       // f - white
  ];

  const Renderer = {
    canvas: null,
    ctx: null,

    init() {
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;
    },

    clear(color) {
      this.ctx.fillStyle = color || PAL[1];
      this.ctx.fillRect(0, 0, W, H);
    },

    /* Draw a filled rectangle */
    rect(x, y, w, h, color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
    },

    /* Draw a single tile by type */
    drawTile(tx, ty, type, variant) {
      const x = tx * TILE, y = ty * TILE;
      switch(type) {
        case '.': // Floor
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
          // Subtle wood grain
          if ((tx + ty) % 3 === 0) {
            this.ctx.fillStyle = '#1a1a25';
            this.ctx.fillRect(x, y + 4, TILE, 1);
          }
          break;

        case '#': // Wall
          this.ctx.fillStyle = '#2a2a3e';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#222236';
          this.ctx.fillRect(x, y + TILE - 2, TILE, 2);
          this.ctx.fillStyle = '#323248';
          this.ctx.fillRect(x + 1, y + 1, TILE - 2, 1);
          break;

        case 'D': // Door
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#4a3828';
          this.ctx.fillRect(x + 3, y, 10, TILE);
          this.ctx.fillStyle = '#5a4838';
          this.ctx.fillRect(x + 4, y + 1, 8, TILE - 2);
          this.ctx.fillStyle = '#c8a860';
          this.ctx.fillRect(x + 10, y + 7, 2, 2); // knob
          break;

        case 'B': // Bed
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#3a2a1a';
          this.ctx.fillRect(x + 1, y + 2, 14, 12);
          this.ctx.fillStyle = '#2d1b69';
          this.ctx.fillRect(x + 2, y + 3, 12, 8);
          this.ctx.fillStyle = '#d4d4d4';
          this.ctx.fillRect(x + 2, y + 3, 12, 3);
          break;

        case 'T': // Table
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#5a4020';
          this.ctx.fillRect(x + 1, y + 5, 14, 3);
          this.ctx.fillStyle = '#4a3018';
          this.ctx.fillRect(x + 2, y + 8, 2, 6);
          this.ctx.fillRect(x + 12, y + 8, 2, 6);
          break;

        case 'C': // Chair
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#4a3018';
          this.ctx.fillRect(x + 4, y + 2, 8, 2);
          this.ctx.fillRect(x + 4, y + 6, 8, 2);
          this.ctx.fillRect(x + 4, y + 8, 2, 5);
          this.ctx.fillRect(x + 10, y + 8, 2, 5);
          break;

        case 'S': // Shelf/Cabinet
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#3a3a3a';
          this.ctx.fillRect(x + 1, y + 1, 14, 14);
          this.ctx.fillStyle = '#4a4a4a';
          this.ctx.fillRect(x + 2, y + 2, 12, 6);
          this.ctx.fillRect(x + 2, y + 9, 12, 5);
          this.ctx.fillStyle = '#6b6b6b';
          this.ctx.fillRect(x + 7, y + 4, 2, 2);
          this.ctx.fillRect(x + 7, y + 11, 2, 2);
          break;

        case 'M': // Mirror
          this.ctx.fillStyle = '#2a2a3e';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#6b6b6b';
          this.ctx.fillRect(x + 3, y + 1, 10, 14);
          this.ctx.fillStyle = '#3a5a6a';
          this.ctx.fillRect(x + 4, y + 2, 8, 12);
          // reflection glint
          this.ctx.fillStyle = '#8aaacc';
          this.ctx.fillRect(x + 5, y + 3, 2, 3);
          break;

        case 'P': // Pills
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#d4d4d4';
          this.ctx.fillRect(x + 5, y + 4, 6, 8);
          this.ctx.fillStyle = '#aaa';
          this.ctx.fillRect(x + 5, y + 4, 6, 1);
          // pill color changes!
          const pillColor = variant || '#e94560';
          this.ctx.fillStyle = pillColor;
          this.ctx.fillRect(x + 7, y + 7, 2, 2);
          break;

        case 'V': // TV
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#2a2a2a';
          this.ctx.fillRect(x + 1, y + 3, 14, 10);
          this.ctx.fillStyle = '#0a0a1a';
          this.ctx.fillRect(x + 2, y + 4, 12, 8);
          // static on screen
          if (Math.random() < 0.3) {
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(x + 3 + Math.random()*8, y + 5 + Math.random()*5, 2, 1);
          }
          break;

        case 'F': // Photo Frame
          this.ctx.fillStyle = '#2a2a3e';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#5a4020';
          this.ctx.fillRect(x + 3, y + 2, 10, 10);
          this.ctx.fillStyle = '#8b7355';
          this.ctx.fillRect(x + 4, y + 3, 8, 8);
          break;

        case 'W': // Window
          this.ctx.fillStyle = '#2a2a3e';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#16213e';
          this.ctx.fillRect(x + 2, y + 2, 12, 12);
          this.ctx.fillStyle = '#1a2a4e';
          this.ctx.fillRect(x + 3, y + 3, 10, 10);
          this.ctx.fillStyle = '#2a3a5e';
          this.ctx.fillRect(x + 7, y + 3, 2, 10);
          this.ctx.fillRect(x + 3, y + 7, 10, 2);
          break;

        case 'K': // Sink
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#6b6b6b';
          this.ctx.fillRect(x + 2, y + 4, 12, 8);
          this.ctx.fillStyle = '#4a4a4a';
          this.ctx.fillRect(x + 4, y + 5, 8, 5);
          this.ctx.fillStyle = '#8aaacc';
          this.ctx.fillRect(x + 7, y + 3, 2, 2);
          break;

        case 'L': // Toilet
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#d4d4d4';
          this.ctx.fillRect(x + 4, y + 3, 8, 10);
          this.ctx.fillStyle = '#bbb';
          this.ctx.fillRect(x + 5, y + 4, 6, 4);
          this.ctx.fillStyle = '#ddd';
          this.ctx.fillRect(x + 5, y + 2, 6, 2);
          break;

        case 'U': // Bathtub
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#d4d4d4';
          this.ctx.fillRect(x + 1, y + 5, 14, 8);
          this.ctx.fillStyle = '#bbb';
          this.ctx.fillRect(x + 2, y + 6, 12, 5);
          this.ctx.fillStyle = '#8aaccc';
          this.ctx.fillRect(x + 3, y + 7, 10, 3);
          break;

        case 'R': // Fridge
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#e0e0e0';
          this.ctx.fillRect(x + 2, y + 1, 12, 14);
          this.ctx.fillStyle = '#ccc';
          this.ctx.fillRect(x + 3, y + 2, 10, 6);
          this.ctx.fillRect(x + 3, y + 9, 10, 5);
          this.ctx.fillStyle = '#999';
          this.ctx.fillRect(x + 12, y + 5, 1, 2);
          this.ctx.fillRect(x + 12, y + 11, 1, 2);
          break;

        case 'O': // Stove
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#3a3a3a';
          this.ctx.fillRect(x + 1, y + 2, 14, 12);
          this.ctx.fillStyle = '#2a2a2a';
          this.ctx.fillRect(x + 2, y + 3, 12, 5);
          this.ctx.fillStyle = '#555';
          this.ctx.fillRect(x + 4, y + 4, 3, 3);
          this.ctx.fillRect(x + 9, y + 4, 3, 3);
          break;

        case 'H': // Couch
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#2d1b69';
          this.ctx.fillRect(x + 1, y + 4, 14, 8);
          this.ctx.fillStyle = '#3d2b79';
          this.ctx.fillRect(x + 1, y + 2, 14, 4);
          this.ctx.fillStyle = '#4d3b89';
          this.ctx.fillRect(x + 2, y + 3, 5, 2);
          this.ctx.fillRect(x + 9, y + 3, 5, 2);
          break;

        case 'A': // Bookshelf
          this.ctx.fillStyle = '#2a2a3e';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#4a3018';
          this.ctx.fillRect(x + 1, y + 1, 14, 14);
          // books
          this.ctx.fillStyle = '#8b0000'; this.ctx.fillRect(x+2, y+2, 3, 5);
          this.ctx.fillStyle = '#2d5a27'; this.ctx.fillRect(x+5, y+2, 2, 5);
          this.ctx.fillStyle = '#2a4a8a'; this.ctx.fillRect(x+7, y+2, 3, 5);
          this.ctx.fillStyle = '#c8a860'; this.ctx.fillRect(x+10, y+2, 3, 5);
          this.ctx.fillStyle = '#4a1942'; this.ctx.fillRect(x+2, y+8, 4, 5);
          this.ctx.fillStyle = '#2a4a8a'; this.ctx.fillRect(x+6, y+8, 3, 5);
          this.ctx.fillStyle = '#8b0000'; this.ctx.fillRect(x+9, y+8, 4, 5);
          break;

        case 'E': // Lamp
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#6b6b6b';
          this.ctx.fillRect(x + 6, y + 6, 4, 8);
          this.ctx.fillStyle = '#c8b88a';
          this.ctx.fillRect(x + 3, y + 1, 10, 6);
          this.ctx.fillStyle = '#e8d8a8';
          this.ctx.fillRect(x + 4, y + 2, 8, 4);
          break;

        case 'I': // Nightstand
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#4a3018';
          this.ctx.fillRect(x + 3, y + 4, 10, 10);
          this.ctx.fillStyle = '#5a4028';
          this.ctx.fillRect(x + 4, y + 5, 8, 4);
          this.ctx.fillStyle = '#6b6b6b';
          this.ctx.fillRect(x + 7, y + 6, 2, 2);
          break;

        case 'N': // Note/Paper
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#f0e6d3';
          this.ctx.fillRect(x + 4, y + 3, 8, 10);
          this.ctx.fillStyle = '#333';
          for (let i = 0; i < 4; i++) {
            this.ctx.fillRect(x + 5, y + 5 + i*2, 6, 1);
          }
          break;

        case 'G': // Rug
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#4a1942';
          this.ctx.fillRect(x + 1, y + 1, 14, 14);
          this.ctx.fillStyle = '#5a2952';
          this.ctx.fillRect(x + 3, y + 3, 10, 10);
          break;

        case 'X': // Lab equipment (ch4+)
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
          this.ctx.fillStyle = '#6b6b6b';
          this.ctx.fillRect(x + 2, y + 3, 12, 10);
          this.ctx.fillStyle = '#3aaa5a';
          this.ctx.fillRect(x + 4, y + 5, 4, 4);
          this.ctx.fillStyle = '#e94560';
          this.ctx.fillRect(x + 9, y + 5, 3, 3);
          // blinking light
          if (Math.random() < 0.5) {
            this.ctx.fillStyle = '#4f8';
            this.ctx.fillRect(x + 12, y + 4, 1, 1);
          }
          break;

        default:
          this.ctx.fillStyle = '#1c1c28';
          this.ctx.fillRect(x, y, TILE, TILE);
      }
    },

    /* Draw a room tile map */
    drawRoom(room, pillColor) {
      for (let y = 0; y < room.length; y++) {
        for (let x = 0; x < room[y].length; x++) {
          const ch = room[y][x];
          const floatY = G.Effects.floatOffsets[y * 20 + x] || 0;
          if (floatY && ch !== '.' && ch !== '#') {
            // Draw floor under floating object
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

    /* Draw darkness/fog around player */
    drawDarkness(px, py, radius) {
      const gradient = this.ctx.createRadialGradient(px, py, radius * 0.3, px, py, radius);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.7, 'rgba(0,0,0,0.3)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.85)');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, W, H);
    },

    /* Draw text with pixel font */
    drawText(text, x, y, color, size) {
      this.ctx.font = (size || 8) + 'px "Press Start 2P"';
      this.ctx.fillStyle = color || '#f0e6d3';
      this.ctx.fillText(text, Math.floor(x), Math.floor(y));
    },

    /* Fade transition */
    drawFade(alpha) {
      this.ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      this.ctx.fillRect(0, 0, W, H);
    },

    /* Draw coherence indicator */
    drawCoherenceBar(value) {
      const bw = 40, bh = 4;
      const bx = W - bw - 4, by = 4;
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
    getPalette() { return PAL; },
  };

  window.G = window.G || {};
  window.G.Renderer = Renderer;
})();
