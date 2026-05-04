/* ===== PLAYER - Movement, Animation, Interaction ===== */
(function() {
  'use strict';

  const TILE = 16;
  const SPEED = 60; // pixels per second

  const Player = {
    x: 5 * TILE, y: 5 * TILE,
    dir: 'down',
    frame: 0,
    animTimer: 0,
    moving: false,
    stepTimer: 0,
    interactCooldown: 0,

    /* Sprite data: 16x16 per direction, 2 frames each */
    sprites: {
      down: [
        // Frame 0
        [
          '......4444......',
          '.....488884.....',
          '.....488884.....',
          '.....8f88f8.....',
          '.....888888.....',
          '.....88ff88.....',
          '......8888......',
          '.....bbbbbb.....',
          '....bbb44bbb....',
          '....bb4444bb....',
          '....bb4444bb....',
          '.....bbbbbb.....',
          '.....bb..bb.....',
          '.....bb..bb.....',
          '.....11..11.....',
          '................',
        ],
        // Frame 1
        [
          '......4444......',
          '.....488884.....',
          '.....488884.....',
          '.....8f88f8.....',
          '.....888888.....',
          '.....88ff88.....',
          '......8888......',
          '.....bbbbbb.....',
          '....bbb44bbb....',
          '....bb4444bb....',
          '....bb4444bb....',
          '.....bbbbbb.....',
          '....bb....bb....',
          '....11....11....',
          '................',
          '................',
        ],
      ],
      up: [
        [
          '......4444......',
          '.....444444.....',
          '.....444444.....',
          '.....444444.....',
          '.....444444.....',
          '.....444444.....',
          '......4444......',
          '.....bbbbbb.....',
          '....bbb44bbb....',
          '....bb4444bb....',
          '....bb4444bb....',
          '.....bbbbbb.....',
          '.....bb..bb.....',
          '.....bb..bb.....',
          '.....11..11.....',
          '................',
        ],
        [
          '......4444......',
          '.....444444.....',
          '.....444444.....',
          '.....444444.....',
          '.....444444.....',
          '.....444444.....',
          '......4444......',
          '.....bbbbbb.....',
          '....bbb44bbb....',
          '....bb4444bb....',
          '....bb4444bb....',
          '.....bbbbbb.....',
          '....bb....bb....',
          '....11....11....',
          '................',
          '................',
        ],
      ],
      left: [
        [
          '......4444......',
          '.....488884.....',
          '....4888884.....',
          '....f888884.....',
          '....8888884.....',
          '....8ff8884.....',
          '.....88884......',
          '....bbbbbb......',
          '...bbb44bbb.....',
          '...bb4444bb.....',
          '...bb4444bb.....',
          '....bbbbbb......',
          '....bb..bb......',
          '....bb..bb......',
          '....11..11......',
          '................',
        ],
        [
          '......4444......',
          '.....488884.....',
          '....4888884.....',
          '....f888884.....',
          '....8888884.....',
          '....8ff8884.....',
          '.....88884......',
          '....bbbbbb......',
          '...bbb44bbb.....',
          '...bb4444bb.....',
          '...bb4444bb.....',
          '....bbbbbb......',
          '...bb....bb.....',
          '...11....11.....',
          '................',
          '................',
        ],
      ],
      right: [
        [
          '......4444......',
          '.....488884.....',
          '.....4888884....',
          '.....488888f....',
          '.....4888888....',
          '.....488ff88....',
          '......48888.....',
          '......bbbbbb....',
          '.....bbb44bbb...',
          '.....bb4444bb...',
          '.....bb4444bb...',
          '......bbbbbb....',
          '......bb..bb....',
          '......bb..bb....',
          '......11..11....',
          '................',
        ],
        [
          '......4444......',
          '.....488884.....',
          '.....4888884....',
          '.....488888f....',
          '.....4888888....',
          '.....488ff88....',
          '......48888.....',
          '......bbbbbb....',
          '.....bbb44bbb...',
          '.....bb4444bb...',
          '.....bb4444bb...',
          '......bbbbbb....',
          '.....bb....bb...',
          '.....11....11...',
          '................',
          '................',
        ],
      ],
    },

    /* Color map for sprite chars */
    colorMap: {
      '.': null,
      '1': '#1a1a2e',
      '4': '#2d1b69',
      '8': '#d4a574',
      'f': '#f0e6d3',
      'b': '#3a3a5a',
    },

    init(startX, startY) {
      this.x = startX * TILE;
      this.y = startY * TILE;
      this.dir = 'down';
      this.frame = 0;
    },

    update(dt, keys, roomData) {
      this.interactCooldown = Math.max(0, this.interactCooldown - dt);
      let dx = 0, dy = 0;

      if (keys['ArrowLeft'] || keys['KeyA']) { dx = -1; this.dir = 'left'; }
      if (keys['ArrowRight'] || keys['KeyD']) { dx = 1; this.dir = 'right'; }
      if (keys['ArrowUp'] || keys['KeyW']) { dy = -1; this.dir = 'up'; }
      if (keys['ArrowDown'] || keys['KeyS']) { dy = 1; this.dir = 'down'; }

      this.moving = dx !== 0 || dy !== 0;

      if (this.moving) {
        const newX = this.x + dx * SPEED * dt;
        const newY = this.y + dy * SPEED * dt;

        // Collision check
        const checkX = dx > 0 ? newX + 12 : newX + 3;
        const checkY = dy > 0 ? newY + 14 : newY + 6;
        const tileX = Math.floor(checkX / TILE);
        const tileY = Math.floor(checkY / TILE);

        if (roomData && tileY >= 0 && tileY < roomData.length && tileX >= 0 && tileX < roomData[tileY].length) {
          const tile = roomData[tileY][tileX];
          const solid = '#BTSCHIMULORAKEVFXNG'.includes(tile);
          if (!solid) {
            this.x = newX;
            this.y = newY;
          }
        }

        // Animation
        this.animTimer += dt;
        if (this.animTimer > 0.2) {
          this.animTimer = 0;
          this.frame = (this.frame + 1) % 2;
        }

        // Footstep sound
        this.stepTimer += dt;
        if (this.stepTimer > 0.35) {
          this.stepTimer = 0;
          G.Audio.sfx.footstep();
        }
      } else {
        this.frame = 0;
        this.animTimer = 0;
      }

      // Keep in bounds
      this.x = Math.max(0, Math.min(320 - TILE, this.x));
      this.y = Math.max(0, Math.min(180 - TILE, this.y));
    },

    /* Get tile in front of player */
    getFacingTile() {
      const cx = Math.floor((this.x + 8) / TILE);
      const cy = Math.floor((this.y + 10) / TILE);
      switch(this.dir) {
        case 'up': return { x: cx, y: cy - 1 };
        case 'down': return { x: cx, y: cy + 1 };
        case 'left': return { x: cx - 1, y: cy };
        case 'right': return { x: cx + 1, y: cy };
      }
    },

    canInteract() {
      return this.interactCooldown <= 0;
    },

    doInteract() {
      this.interactCooldown = 0.3;
    },

    render(ctx, coherence) {
      const spriteData = this.sprites[this.dir][this.frame];
      const px = Math.floor(this.x);
      const py = Math.floor(this.y);

      for (let sy = 0; sy < 16; sy++) {
        for (let sx = 0; sx < 16; sx++) {
          const ch = spriteData[sy][sx];
          const color = this.colorMap[ch];
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(px + sx, py + sy, 1, 1);
          }
        }
      }

      // Ghost double at low coherence
      if (coherence < 40 && Math.random() < 0.1) {
        const ox = (Math.random() - 0.5) * 8;
        const oy = (Math.random() - 0.5) * 8;
        ctx.globalAlpha = 0.15;
        for (let sy = 0; sy < 16; sy++) {
          for (let sx = 0; sx < 16; sx++) {
            const ch = spriteData[sy][sx];
            const color = this.colorMap[ch];
            if (color) {
              ctx.fillStyle = '#4a1942';
              ctx.fillRect(px + sx + ox, py + sy + oy, 1, 1);
            }
          }
        }
        ctx.globalAlpha = 1;
      }
    },

    /* Get current tile position */
    getTilePos() {
      return {
        x: Math.floor((this.x + 8) / TILE),
        y: Math.floor((this.y + 10) / TILE),
      };
    }
  };

  window.G = window.G || {};
  window.G.Player = Player;
})();
