/* ===== PLAYER - 16-bit character ===== */
(function() {
  'use strict';

  const TILE = 24;
  const SPEED = 72; // pixels per second
  const PW = 16, PH = 22; // hitbox
  const OFFSET_X = 4, OFFSET_Y = 2; // hitbox offset in sprite

  const Player = {
    x: 0, y: 0,
    dir: 'down',
    frame: 0,
    animTimer: 0,
    moving: false,
    interactCooldown: 0,

    // 16-bit style sprite data (24x24, using color indices)
    // Colors: 0=transparent, 1=#1a1a2e dark, 2=#2d1b69 purple, 3=#d4a574 skin,
    //         4=#6b4e3d brown, 5=#f0e6d3 white, 6=#3a3a5a shirt, 7=#e94560 detail
    sprites: {
      down: [
        [ // frame 0
          [0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,4,4,1,1,1,1,1,1,4,4,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,4,4,1,1,1,1,1,1,1,1,4,4,0,0,0,0,0,0],
          [0,0,0,0,0,0,4,3,3,3,3,3,3,3,3,3,3,4,0,0,0,0,0,0],
          [0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0],
          [0,0,0,0,0,0,3,3,5,5,3,3,3,3,5,5,3,3,0,0,0,0,0,0],
          [0,0,0,0,0,0,3,3,1,5,3,3,3,3,1,5,3,3,0,0,0,0,0,0],
          [0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0],
          [0,0,0,0,0,0,3,3,3,3,1,1,1,1,3,3,3,3,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0,0],
          [0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0,0],
          [0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0],
          [0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0],
          [0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0],
          [0,0,0,0,0,3,6,6,6,6,6,6,6,6,6,6,6,6,3,0,0,0,0,0],
          [0,0,0,0,0,3,3,6,6,6,6,6,6,6,6,6,6,3,3,0,0,0,0,0],
          [0,0,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,4,4,4,4,4,0,0,4,4,4,4,4,0,0,0,0,0,0],
          [0,0,0,0,0,0,4,4,4,4,4,0,0,4,4,4,4,4,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        ],
        [ // frame 1 - walk
          [0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,4,4,1,1,1,1,1,1,4,4,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,4,4,1,1,1,1,1,1,1,1,4,4,0,0,0,0,0,0],
          [0,0,0,0,0,0,4,3,3,3,3,3,3,3,3,3,3,4,0,0,0,0,0,0],
          [0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0],
          [0,0,0,0,0,0,3,3,5,5,3,3,3,3,5,5,3,3,0,0,0,0,0,0],
          [0,0,0,0,0,0,3,3,1,5,3,3,3,3,1,5,3,3,0,0,0,0,0,0],
          [0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0],
          [0,0,0,0,0,0,3,3,3,3,1,1,1,1,3,3,3,3,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0,0],
          [0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0,0],
          [0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0],
          [0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0],
          [0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0],
          [0,0,0,0,0,3,6,6,6,6,6,6,6,6,6,6,6,6,3,0,0,0,0,0],
          [0,0,0,0,0,3,3,6,6,6,6,6,6,6,6,6,6,3,3,0,0,0,0,0],
          [0,0,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
          [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0],
          [0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0],
          [0,0,0,0,4,4,4,4,0,0,0,0,0,0,0,0,4,4,4,4,0,0,0,0],
          [0,0,0,0,4,4,4,0,0,0,0,0,0,0,0,0,0,4,4,4,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        ],
      ],
    },

    colorMap: {
      0: null,
      1: '#1a1a2e',
      2: '#2d1b69',
      3: '#d4a574',
      4: '#6b4e3d',
      5: '#f0e6d3',
      6: '#3a4a5e',
      7: '#e94560',
    },

    init(tileX, tileY) {
      this.x = tileX * TILE;
      this.y = tileY * TILE;
      this.dir = 'down';
      this.frame = 0;
      this.animTimer = 0;
      this.moving = false;
      this.interactCooldown = 0;
    },

    update(dt, keys, map) {
      if (this.interactCooldown > 0) this.interactCooldown -= dt;

      let dx = 0, dy = 0;
      if (keys['ArrowLeft'] || keys['KeyA']) { dx = -1; this.dir = 'left'; }
      if (keys['ArrowRight'] || keys['KeyD']) { dx = 1; this.dir = 'right'; }
      if (keys['ArrowUp'] || keys['KeyW']) { dy = -1; this.dir = 'up'; }
      if (keys['ArrowDown'] || keys['KeyS']) { dy = 1; this.dir = 'down'; }

      this.moving = dx !== 0 || dy !== 0;

      if (this.moving) {
        // Normalize diagonal
        if (dx !== 0 && dy !== 0) {
          dx *= 0.707; dy *= 0.707;
        }

        const newX = this.x + dx * SPEED * dt;
        const newY = this.y + dy * SPEED * dt;

        // Collision check
        if (map) {
          const canMoveX = this._canMove(newX, this.y, map);
          const canMoveY = this._canMove(this.x, newY, map);

          if (canMoveX) this.x = newX;
          if (canMoveY) this.y = newY;
        } else {
          this.x = newX;
          this.y = newY;
        }

        // Animation
        this.animTimer += dt;
        if (this.animTimer > 0.2) {
          this.animTimer = 0;
          this.frame = (this.frame + 1) % 2;
        }
      } else {
        this.frame = 0;
        this.animTimer = 0;
      }
    },

    _canMove(nx, ny, map) {
      const hitX = nx + OFFSET_X;
      const hitY = ny + OFFSET_Y;
      const corners = [
        { x: hitX + 2, y: hitY + 6 },
        { x: hitX + PW - 2, y: hitY + 6 },
        { x: hitX + 2, y: hitY + PH },
        { x: hitX + PW - 2, y: hitY + PH },
      ];
      const walls = '#';
      for (const c of corners) {
        const tx = Math.floor(c.x / TILE);
        const ty = Math.floor(c.y / TILE);
        if (ty < 0 || ty >= map.length || tx < 0 || tx >= map[0].length) return false;
        if (walls.includes(map[ty][tx])) return false;
      }
      return true;
    },

    render(ctx, sanity) {
      const spriteData = this.sprites.down[this.frame];
      if (!spriteData) return;

      const px = Math.floor(this.x);
      const py = Math.floor(this.y);

      for (let sy = 0; sy < spriteData.length; sy++) {
        for (let sx = 0; sx < spriteData[sy].length; sx++) {
          const ci = spriteData[sy][sx];
          if (ci === 0) continue;
          const color = this.colorMap[ci];
          if (!color) continue;
          ctx.fillStyle = color;
          ctx.fillRect(px + sx, py + sy, 1, 1);
        }
      }

      // Ghost echo at low sanity
      if (sanity < 50) {
        const ghostAlpha = (50 - sanity) / 100;
        ctx.globalAlpha = ghostAlpha * 0.3;
        const gx = px + Math.sin(Date.now() * 0.003) * 4;
        const gy = py + Math.cos(Date.now() * 0.004) * 2;
        for (let sy = 0; sy < spriteData.length; sy++) {
          for (let sx = 0; sx < spriteData[sy].length; sx++) {
            const ci = spriteData[sy][sx];
            if (ci === 0) continue;
            ctx.fillStyle = '#6030a0';
            ctx.fillRect(gx + sx, gy + sy, 1, 1);
          }
        }
        ctx.globalAlpha = 1;
      }
    },

    getTilePos() {
      return {
        x: Math.floor((this.x + 12) / TILE),
        y: Math.floor((this.y + 12) / TILE),
      };
    },

    getFacingTile() {
      const pos = this.getTilePos();
      switch(this.dir) {
        case 'up': return { x: pos.x, y: pos.y - 1 };
        case 'down': return { x: pos.x, y: pos.y + 1 };
        case 'left': return { x: pos.x - 1, y: pos.y };
        case 'right': return { x: pos.x + 1, y: pos.y };
      }
      return pos;
    },

    canInteract() {
      return this.interactCooldown <= 0;
    },

    doInteract() {
      this.interactCooldown = 0.3;
    },
  };

  window.G = window.G || {};
  window.G.Player = Player;
})();
