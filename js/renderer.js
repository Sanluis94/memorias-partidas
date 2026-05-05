/* ===== RENDERER - Dark 16-bit Horror ===== */
(function() {
  'use strict';
  const W = 480, H = 270, TILE = 24;

  const Renderer = {
    canvas: null, ctx: null,
    init() {
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;
    },
    clear() {
      this.ctx.fillStyle = '#04040a';
      this.ctx.fillRect(0, 0, W, H);
    },

    drawTile(tx, ty, type, variant) {
      const x = tx * TILE, y = ty * TILE, c = this.ctx;
      switch(type) {
        case '.': // Floor - cracked dark wood
          c.fillStyle = (tx+ty)%2===0 ? '#131118' : '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#0d0b12';
          c.fillRect(x, y+11, TILE, 1);
          c.fillRect(x, y+22, TILE, 1);
          // cracks
          if ((tx*13+ty*7)%17===0) {
            c.fillStyle = '#0a0810';
            c.fillRect(x+3, y+2, 1, 8);
            c.fillRect(x+4, y+9, 6, 1);
          }
          // stain
          if ((tx*3+ty*11)%23===0) {
            c.fillStyle = 'rgba(40,10,10,0.15)';
            c.fillRect(x+5, y+4, 8, 6);
          }
          break;

        case '#': // Wall - damp stone
          c.fillStyle = '#1a1824';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#201e2c';
          c.fillRect(x+1, y+1, 10, 6);
          c.fillRect(x+13, y+1, 10, 6);
          c.fillRect(x+6, y+9, 10, 6);
          c.fillRect(x+1, y+17, 10, 5);
          c.fillRect(x+13, y+17, 10, 5);
          // mortar
          c.fillStyle = '#14121e';
          c.fillRect(x, y+7, TILE, 2);
          c.fillRect(x, y+15, TILE, 2);
          // damp stain
          if ((tx+ty*5)%7===0) {
            c.fillStyle = 'rgba(20,40,30,0.2)';
            c.fillRect(x+2, y+10, 6, 12);
          }
          break;

        case 'D': // Door - worn wood
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#2a1c12';
          c.fillRect(x+4, y, 16, TILE);
          c.fillStyle = '#221810';
          c.fillRect(x+6, y+2, 12, 9);
          c.fillRect(x+6, y+13, 12, 9);
          c.fillStyle = '#3a2a18';
          c.fillRect(x+7, y+3, 10, 7);
          c.fillRect(x+7, y+14, 10, 7);
          // rusty knob
          c.fillStyle = '#6a5030';
          c.fillRect(x+15, y+10, 3, 3);
          break;

        case 'B': // Bed - unmade, disturbing
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#1a1210';
          c.fillRect(x+1, y+4, 22, 18);
          // dirty sheets
          c.fillStyle = '#2a2230';
          c.fillRect(x+2, y+5, 20, 14);
          // wrinkled pillow
          c.fillStyle = '#484040';
          c.fillRect(x+2, y+5, 20, 5);
          c.fillStyle = '#3a3234';
          c.fillRect(x+4, y+6, 6, 3);
          // stain on sheets
          c.fillStyle = 'rgba(60,20,20,0.3)';
          c.fillRect(x+10, y+12, 8, 4);
          break;

        case 'T': // Table - scratched
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#2a1c10';
          c.fillRect(x+1, y+7, 22, 4);
          c.fillStyle = '#1a1208';
          c.fillRect(x+3, y+11, 3, 11);
          c.fillRect(x+18, y+11, 3, 11);
          // scratch marks
          c.fillStyle = '#3a2c18';
          c.fillRect(x+5, y+8, 8, 1);
          break;

        case 'M': // Mirror - cracked, dark reflection
          c.fillStyle = '#1a1824';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#3a3840';
          c.fillRect(x+4, y+1, 16, 22);
          c.fillStyle = '#0a1418';
          c.fillRect(x+5, y+2, 14, 20);
          // dark reflection
          c.fillStyle = '#121820';
          c.fillRect(x+8, y+5, 6, 10);
          // crack
          c.fillStyle = '#4a4850';
          c.fillRect(x+7, y+4, 1, 8);
          c.fillRect(x+8, y+11, 4, 1);
          c.fillRect(x+11, y+8, 1, 6);
          break;

        case 'P': // Pills - ominous
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#8a8080';
          c.fillRect(x+7, y+4, 10, 14);
          c.fillStyle = '#706868';
          c.fillRect(x+7, y+4, 10, 2);
          c.fillStyle = '#504848';
          c.fillRect(x+8, y+8, 8, 6);
          c.fillStyle = variant || '#8a1020';
          c.fillRect(x+10, y+10, 4, 3);
          break;

        case 'V': // TV - static
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#181818';
          c.fillRect(x+1, y+3, 22, 16);
          c.fillStyle = '#060610';
          c.fillRect(x+2, y+4, 20, 14);
          for (let i = 0; i < 12; i++) {
            c.fillStyle = `rgba(${40+Math.random()*30},${40+Math.random()*30},${50+Math.random()*30},${0.2+Math.random()*0.3})`;
            c.fillRect(x+3+Math.random()*16, y+5+Math.random()*11, 1+Math.random()*4, 1);
          }
          c.fillStyle = '#111';
          c.fillRect(x+9, y+19, 6, 3);
          break;

        case 'F': // Photo - faded
          c.fillStyle = '#1a1824';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#2a2018';
          c.fillRect(x+4, y+2, 16, 16);
          c.fillStyle = '#3a3028';
          c.fillRect(x+5, y+3, 14, 14);
          // faded silhouettes
          c.fillStyle = '#4a4038';
          c.fillRect(x+9, y+5, 4, 5);
          c.fillRect(x+7, y+10, 8, 5);
          break;

        case 'W': // Window - pitch black outside
          c.fillStyle = '#1a1824';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#2a2830';
          c.fillRect(x+2, y+2, 20, 20);
          // void outside
          c.fillStyle = '#020208';
          c.fillRect(x+3, y+3, 18, 18);
          // frame cross
          c.fillStyle = '#2a2830';
          c.fillRect(x+11, y+3, 2, 18);
          c.fillRect(x+3, y+11, 18, 2);
          // distant lightning flicker
          if (Math.random() < 0.005) {
            c.fillStyle = 'rgba(100,100,140,0.15)';
            c.fillRect(x+3, y+3, 18, 18);
          }
          break;

        case 'K': // Sink - dripping
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#4a4848';
          c.fillRect(x+3, y+6, 18, 12);
          c.fillStyle = '#2a2828';
          c.fillRect(x+5, y+8, 14, 8);
          c.fillStyle = '#5a5858';
          c.fillRect(x+10, y+3, 4, 4);
          // drip
          if (Math.random() < 0.3) {
            c.fillStyle = '#3a5a6a';
            c.fillRect(x+12, y+7, 1, 1+Math.floor(Math.random()*2));
          }
          break;

        case 'L': // Toilet
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#7a7878';
          c.fillRect(x+5, y+4, 14, 16);
          c.fillStyle = '#606060';
          c.fillRect(x+7, y+6, 10, 8);
          c.fillStyle = '#8a8888';
          c.fillRect(x+6, y+2, 12, 4);
          break;

        case 'U': // Bathtub - rust stained
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#7a7878';
          c.fillRect(x+1, y+6, 22, 14);
          c.fillStyle = '#505050';
          c.fillRect(x+2, y+8, 20, 10);
          // rust stain
          c.fillStyle = 'rgba(80,30,10,0.3)';
          c.fillRect(x+8, y+9, 6, 8);
          break;

        case 'R': // Fridge - humming, old
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#7a7a78';
          c.fillRect(x+3, y+1, 18, 22);
          c.fillStyle = '#686866';
          c.fillRect(x+4, y+2, 16, 9);
          c.fillRect(x+4, y+13, 16, 9);
          c.fillStyle = '#505050';
          c.fillRect(x+18, y+6, 2, 3);
          c.fillRect(x+18, y+17, 2, 3);
          break;

        case 'O': // Stove
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#282828';
          c.fillRect(x+2, y+3, 20, 18);
          c.fillStyle = '#333';
          c.fillRect(x+4, y+5, 6, 5);
          c.fillRect(x+14, y+5, 6, 5);
          c.fillStyle = '#1a1a1a';
          c.fillRect(x+4, y+13, 16, 7);
          break;

        case 'H': // Couch - sagging, worn
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#1a1020';
          c.fillRect(x+1, y+6, 22, 14);
          c.fillStyle = '#221830';
          c.fillRect(x+1, y+3, 22, 6);
          c.fillStyle = '#2a2038';
          c.fillRect(x+2, y+4, 9, 4);
          c.fillRect(x+13, y+4, 9, 4);
          c.fillStyle = '#181020';
          c.fillRect(x+2, y+10, 20, 6);
          break;

        case 'A': // Bookshelf
          c.fillStyle = '#1a1824';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#1e1408';
          c.fillRect(x+1, y+1, 22, 22);
          c.fillStyle = '#2a1c10';
          c.fillRect(x+1, y+8, 22, 1);
          c.fillRect(x+1, y+15, 22, 1);
          c.fillStyle='#3a0808';c.fillRect(x+2,y+2,4,6);
          c.fillStyle='#0a2a18';c.fillRect(x+6,y+3,3,5);
          c.fillStyle='#1a2a4a';c.fillRect(x+9,y+2,5,6);
          c.fillStyle='#4a3a10';c.fillRect(x+14,y+2,4,6);
          c.fillStyle='#2a0828';c.fillRect(x+18,y+3,4,5);
          c.fillStyle='#1a2a4a';c.fillRect(x+2,y+9,5,6);
          c.fillStyle='#3a2a08';c.fillRect(x+7,y+10,3,5);
          c.fillStyle='#3a0808';c.fillRect(x+10,y+9,4,6);
          c.fillStyle='#0a2a18';c.fillRect(x+14,y+10,4,5);
          c.fillStyle='#2a0828';c.fillRect(x+18,y+9,4,6);
          c.fillStyle='#2a2008';c.fillRect(x+2,y+16,4,6);
          c.fillStyle='#1a0838';c.fillRect(x+6,y+17,5,5);
          break;

        case 'E': // Lamp - dim, flickering
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#5a4a30';
          c.fillRect(x+5, y+1, 14, 9);
          c.fillStyle = '#6a5a3a';
          c.fillRect(x+6, y+2, 12, 7);
          // dim warm glow
          const glow = 0.03 + Math.random() * 0.04;
          c.fillStyle = `rgba(120,90,40,${glow})`;
          c.fillRect(x-4, y-4, TILE+8, TILE+8);
          c.fillStyle = '#3a3a38';
          c.fillRect(x+10, y+10, 4, 10);
          c.fillStyle = '#2a2a28';
          c.fillRect(x+8, y+20, 8, 3);
          break;

        case 'I': // Nightstand
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#1e1408';
          c.fillRect(x+4, y+5, 16, 16);
          c.fillStyle = '#2a1c10';
          c.fillRect(x+5, y+6, 14, 7);
          c.fillRect(x+5, y+14, 14, 6);
          c.fillStyle = '#3a3230';
          c.fillRect(x+10, y+8, 4, 2);
          c.fillRect(x+10, y+16, 4, 2);
          break;

        case 'N': // Note - creased, urgent
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#c8b898';
          c.fillRect(x+5, y+3, 14, 16);
          c.fillStyle = '#b0a080';
          c.fillRect(x+5, y+3, 14, 1);
          c.fillStyle = '#2a1a0a';
          for (let i = 0; i < 6; i++) c.fillRect(x+7, y+6+i*2, 10, 1);
          // red underline (urgent)
          c.fillStyle = '#6a1010';
          c.fillRect(x+7, y+14, 10, 1);
          break;

        case 'G': // Rug - faded, stained
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#1a0a14';
          c.fillRect(x+1, y+1, 22, 22);
          c.fillStyle = '#200e1a';
          c.fillRect(x+3, y+3, 18, 18);
          c.fillStyle = '#180a14';
          c.fillRect(x+6, y+6, 12, 12);
          break;

        case 'X': // Lab equipment
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#303030';
          c.fillRect(x+2, y+4, 20, 16);
          c.fillStyle = '#0a1a0a';
          c.fillRect(x+4, y+6, 10, 8);
          for (let i = 0; i < 8; i++) {
            const h = Math.floor(Math.sin(i*0.8+Date.now()*0.003)*3);
            c.fillStyle = '#1a6a2a';
            c.fillRect(x+5+i, y+10+h, 1, 1);
          }
          c.fillStyle = '#6a1020';
          c.fillRect(x+16, y+7, 3, 3);
          if (Math.random()<0.5) { c.fillStyle='#1a8a2a'; c.fillRect(x+20,y+5,2,2); }
          break;

        case 'Q': // Console
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#282828';
          c.fillRect(x+1, y+2, 22, 20);
          c.fillStyle = '#0a0a1a';
          c.fillRect(x+3, y+4, 8, 6);
          c.fillRect(x+13, y+4, 8, 6);
          c.fillStyle = '#1a4a8a';
          c.fillRect(x+4, y+5, 6, 1);
          c.fillStyle = '#8a1a1a';
          c.fillRect(x+14, y+7, 6, 1);
          c.fillStyle = '#444';
          c.fillRect(x+4,y+14,4,4);c.fillRect(x+10,y+14,4,4);c.fillRect(x+16,y+14,4,4);
          break;

        case 'Z': // Void
          c.fillStyle = '#020204';
          c.fillRect(x, y, TILE, TILE);
          if (Math.random()<0.08) {
            c.fillStyle = `rgba(${60+Math.random()*40},${20+Math.random()*20},${100+Math.random()*60},${Math.random()*0.2})`;
            c.fillRect(x+Math.random()*TILE, y+Math.random()*TILE, 1, 1);
          }
          break;

        case 'C': // Chair
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#1e1408';
          c.fillRect(x+6, y+2, 12, 3);
          c.fillRect(x+6, y+8, 12, 3);
          c.fillRect(x+6, y+11, 3, 8);
          c.fillRect(x+15, y+11, 3, 8);
          break;

        case 'S': // Cabinet
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
          c.fillStyle = '#222228';
          c.fillRect(x+1, y+1, 22, 22);
          c.fillStyle = '#2a2a30';
          c.fillRect(x+2, y+2, 20, 9);
          c.fillRect(x+2, y+13, 20, 9);
          c.fillStyle = '#4a4a50';
          c.fillRect(x+10, y+5, 4, 2);
          c.fillRect(x+10, y+16, 4, 2);
          break;

        default:
          c.fillStyle = '#100e16';
          c.fillRect(x, y, TILE, TILE);
      }
    },

    drawRoom(room, pillColor) {
      for (let y = 0; y < room.length; y++) {
        for (let x = 0; x < room[y].length; x++) {
          const ch = room[y][x];
          const fy = G.Effects.floatOffsets[y*20+x] || 0;
          if (fy && ch!=='.'&&ch!=='#') {
            this.drawTile(x, y, '.', null);
            this.ctx.save(); this.ctx.translate(0, fy);
            this.drawTile(x, y, ch, ch==='P' ? pillColor : null);
            this.ctx.restore();
          } else {
            this.drawTile(x, y, ch, ch==='P' ? pillColor : null);
          }
        }
      }
    },

    drawDarkness(px, py, radius) {
      const g = this.ctx.createRadialGradient(px, py, radius*0.2, px, py, radius);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.4, 'rgba(0,0,0,0.1)');
      g.addColorStop(0.7, 'rgba(0,0,0,0.45)');
      g.addColorStop(1, 'rgba(0,0,0,0.85)');
      this.ctx.fillStyle = g;
      this.ctx.fillRect(0, 0, W, H);
    },

    drawText(text, x, y, color, size) {
      this.ctx.font = (size||8)+'px "Press Start 2P"';
      this.ctx.fillStyle = color || '#8a8090';
      this.ctx.fillText(text, Math.floor(x), Math.floor(y));
    },

    drawFade(alpha) {
      this.ctx.fillStyle = `rgba(0,0,0,${Math.min(1,alpha)})`;
      this.ctx.fillRect(0, 0, W, H);
    },

    drawCoherenceBar(value) {
      const bw=60, bh=5, bx=W-bw-8, by=10;
      this.ctx.font = '5px "Press Start 2P"';
      this.ctx.fillStyle = 'rgba(80,70,90,0.3)';
      this.ctx.fillText('COERENCIA', bx, by-2);
      this.ctx.fillStyle = '#0a0810';
      this.ctx.fillRect(bx-1, by-1, bw+2, bh+2);
      const p = value/100;
      let color = '#2a6a3a';
      if (p<0.6) color = '#6a5a20';
      if (p<0.4) color = '#6a2020';
      if (p<0.2) color = '#8a0020';
      this.ctx.fillStyle = color;
      this.ctx.fillRect(bx, by, Math.floor(bw*p), bh);
    },

    getWidth(){return W}, getHeight(){return H}, getTileSize(){return TILE},
  };

  window.G = window.G || {};
  window.G.Renderer = Renderer;
})();
