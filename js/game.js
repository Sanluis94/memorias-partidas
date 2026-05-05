/* ===== GAME.JS - Main Loop, State Machine, Input ===== */
(function() {
  'use strict';

  const W = 480, H = 270;

  /* ===== INPUT HANDLER ===== */
  const keys = {};
  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.key === 'Enter') keys['Enter'] = true;
    if (e.key === ' ') keys['Space'] = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', e => {
    keys[e.code] = false;
    if (e.key === 'Enter') keys['Enter'] = false;
    if (e.key === ' ') keys['Space'] = false;
  });

  /* Canvas click handler */
  let pendingClick = null;
  function setupCanvasClick() {
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('click', e => {
      const rect = canvas.getBoundingClientRect();
      pendingClick = {
        x: (e.clientX - rect.left) * (W / rect.width),
        y: (e.clientY - rect.top) * (H / rect.height),
      };
    });
  }

  /* ===== GAME STATE ===== */
  G.state = {
    mode: 'title',
    flags: {},
    ending: null,
    endingTimer: 0,
    titleSelection: 0,
  };

  let lastTime = 0;
  let titleFlicker = 0;
  let titleGlitchTimer = 0;

  /* ===== TITLE SCREEN ===== */
  function renderTitle(ctx, dt) {
    ctx.fillStyle = '#08080c';
    ctx.fillRect(0, 0, W, H);

    titleFlicker += dt;
    titleGlitchTimer += dt;

    const title = 'MEMORIAS PARTIDAS';
    ctx.font = '16px "Press Start 2P"';

    let ox = 0, oy = 0;
    if (titleGlitchTimer > 3 && titleGlitchTimer < 3.15) {
      ox = (Math.random() - 0.5) * 6;
      oy = (Math.random() - 0.5) * 3;
    }
    if (titleGlitchTimer > 3.15) titleGlitchTimer = 0;

    // Shadow layers
    ctx.fillStyle = '#4a1942';
    const tw = ctx.measureText(title).width;
    const tx = (W - tw) / 2;
    ctx.fillText(title, tx + 2 + ox, 82 + oy);
    ctx.fillStyle = '#2d1b69';
    ctx.fillText(title, tx + 1 + ox, 81 + oy);
    ctx.fillStyle = '#e94560';
    ctx.fillText(title, tx + ox, 80 + oy);

    // Subtitle
    ctx.font = '7px "Press Start 2P"';
    ctx.fillStyle = '#5a5a6a';
    const sub = 'Um pesadelo quantico';
    const sw = ctx.measureText(sub).width;
    ctx.fillText(sub, (W - sw) / 2, 102);

    // Menu
    const options = ['Novo Jogo', 'Continuar'];
    ctx.font = '9px "Press Start 2P"';

    for (let i = 0; i < options.length; i++) {
      const sel = G.state.titleSelection === i;
      const my = 145 + i * 24;
      if (sel) {
        const pulse = Math.sin(titleFlicker * 4) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(233,69,96,${pulse})`;
        ctx.fillText('>', 150, my);
      }
      ctx.fillStyle = sel ? '#f0e6d3' : '#3a3a4a';
      ctx.fillText(options[i], 172, my);
    }

    // Controls
    ctx.font = '5px "Press Start 2P"';
    ctx.fillStyle = '#1a1a2e';
    ctx.fillText('WASD/Setas: Mover | E/Enter: Interagir', 100, 240);

    // Handle click
    if (pendingClick) {
      const cy = pendingClick.y;
      pendingClick = null;
      if (cy >= 135 && cy <= 155) { G.state.titleSelection = 0; confirmTitle(); return; }
      if (cy >= 159 && cy <= 179) { G.state.titleSelection = 1; confirmTitle(); return; }
    }

    // Keyboard
    if (keys['ArrowUp'] || keys['KeyW']) {
      G.state.titleSelection = 0;
      keys['ArrowUp'] = false; keys['KeyW'] = false;
      G.Audio.sfx.menuMove();
    }
    if (keys['ArrowDown'] || keys['KeyS']) {
      G.state.titleSelection = 1;
      keys['ArrowDown'] = false; keys['KeyS'] = false;
      G.Audio.sfx.menuMove();
    }
    if (keys['Enter'] || keys['NumpadEnter'] || keys['KeyE'] || keys['Space']) {
      keys['Enter'] = false; keys['NumpadEnter'] = false;
      keys['KeyE'] = false; keys['Space'] = false;
      confirmTitle();
      return;
    }

    // Scanlines on title
    for (let y = 0; y < H; y += 4) {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, y, W, 1);
    }
  }

  function confirmTitle() {
    G.Audio.sfx.select();
    if (G.state.titleSelection === 0) {
      startNewGame();
    } else {
      loadGame();
    }
  }

  function startNewGame() {
    G.state.mode = 'playing';
    G.state.flags = {};
    G.state.ending = null;
    G.state.endingTimer = 0;
    G.Sanity.reset();
    G.Player.init(9, 5);
    G.Scenes.init();
    G.Audio.startDrone();

    setTimeout(() => {
      G.Dialogue.showSequence(G.Story.dialogues.wake_up);
    }, 1500);
  }

  function loadGame() {
    try {
      const save = localStorage.getItem('memorias_partidas_save');
      if (save) {
        const data = JSON.parse(save);
        G.state.flags = data.flags || {};
        G.Sanity.value = data.coherence || 100;
        G.state.mode = 'playing';
        G.Player.init(data.playerX || 9, data.playerY || 5);
        G.Scenes.chapter = data.chapter || 1;
        G.Scenes.fadeAlpha = 0;
        G.Scenes.fadeDir = 0;
        G.Scenes.loadChapter(data.chapter || 1);
        G.Audio.startDrone();
      } else {
        startNewGame();
      }
    } catch(e) {
      startNewGame();
    }
  }

  function saveGame() {
    try {
      localStorage.setItem('memorias_partidas_save', JSON.stringify({
        flags: G.state.flags,
        coherence: G.Sanity.value,
        chapter: G.Scenes.chapter,
        playerX: Math.floor(G.Player.x / 24),
        playerY: Math.floor(G.Player.y / 24),
        room: G.Scenes.currentRoomId,
      }));
    } catch(e) {}
  }

  /* ===== ENDING SCREEN ===== */
  function renderEnding(ctx, dt) {
    G.state.endingTimer += dt;
    const ending = G.state.ending;
    const t = G.state.endingTimer;

    ctx.fillStyle = '#08080c';
    ctx.fillRect(0, 0, W, H);

    if (ending === 'observer') {
      for (let i = 0; i < 60; i++) {
        const sx = (Math.sin(i * 7.3 + t * 0.1) * 0.5 + 0.5) * W;
        const sy = (Math.cos(i * 4.7 + t * 0.05) * 0.5 + 0.5) * H;
        const b = Math.sin(t + i) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(180,200,255,${b * 0.4})`;
        ctx.fillRect(sx, sy, 1, 1);
      }
      ctx.font = '14px "Press Start 2P"';
      ctx.fillStyle = '#8aaacc';
      const tl = 'O Observador';
      ctx.fillText(tl, (W - ctx.measureText(tl).width) / 2, 90);
      if (t > 2) {
        ctx.font = '7px "Press Start 2P"';
        ctx.fillStyle = `rgba(200,200,220,${Math.min(1, t - 2)})`;
        ctx.fillText('Voce ve tudo. Todas as vidas.', 100, 130);
        ctx.fillText('Todas as possibilidades.', 120, 148);
        ctx.fillText('E encontra paz no infinito.', 110, 166);
      }
    } else if (ending === 'collapse') {
      if (Math.random() < 0.3) {
        ctx.fillStyle = `rgba(${Math.random()*255},0,${Math.random()*100},0.1)`;
        ctx.fillRect(Math.random()*W, Math.random()*H, Math.random()*120, Math.random()*4);
      }
      ctx.font = '14px "Press Start 2P"';
      ctx.fillStyle = '#e94560';
      const tl = 'O Colapso';
      const glitchX = (Math.random() - 0.5) * 4;
      ctx.fillText(tl, (W - ctx.measureText(tl).width) / 2 + glitchX, 80);
      if (t > 2) {
        ctx.font = '7px "Press Start 2P"';
        ctx.fillStyle = `rgba(233,69,96,${Math.min(1, t - 2)})`;
        ctx.fillText('Tudo se comprime. Todo universo.', 90, 120);
        ctx.fillText('Toda possibilidade.', 130, 138);
      }
      if (t > 5) {
        ctx.font = '8px "Press Start 2P"';
        ctx.fillStyle = `rgba(240,230,211,${Math.min(1, (t - 5) * 0.3)})`;
        const q1 = 'E se o Big Bang foi alguem';
        const q2 = 'como eu... tentando voltar?';
        ctx.fillText(q1, (W - ctx.measureText(q1).width) / 2, 180);
        ctx.fillText(q2, (W - ctx.measureText(q2).width) / 2, 198);
      }
      G.Effects.render(ctx, 5);
    } else if (ending === 'choice') {
      ctx.fillStyle = '#1a0a05';
      ctx.fillRect(0, 0, W, H);
      const grad = ctx.createRadialGradient(W/2, H/2, 20, W/2, H/2, 180);
      grad.addColorStop(0, `rgba(200,160,80,${Math.min(0.15, t * 0.02)})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.font = '14px "Press Start 2P"';
      ctx.fillStyle = '#c8a860';
      const tl = 'A Escolha';
      ctx.fillText(tl, (W - ctx.measureText(tl).width) / 2, 80);
      if (t > 2) {
        ctx.font = '8px "Press Start 2P"';
        ctx.fillStyle = `rgba(200,180,140,${Math.min(1, t - 2)})`;
        ctx.fillText('"Papai! Voce demorou!"', 120, 120);
      }
      if (t > 4) {
        ctx.font = '7px "Press Start 2P"';
        ctx.fillStyle = `rgba(150,140,120,${Math.min(1, (t - 4) * 0.5)})`;
        ctx.fillText('Voce sabe que nao e real.', 120, 155);
        ctx.fillText('Mas nao importa mais.', 135, 173);
      }
      if (Math.random() < 0.02) G.Effects.render(ctx, 60);
    }

    if (t > 10) {
      ctx.font = '6px "Press Start 2P"';
      const a = Math.min(1, (t - 10) * 0.2);
      ctx.fillStyle = `rgba(100,100,100,${a})`;
      ctx.fillText('MEMORIAS PARTIDAS', 170, 240);
      ctx.fillText('Pressione ESC para voltar ao titulo', 100, 255);
      if (keys['Escape']) {
        keys['Escape'] = false;
        G.state.mode = 'title';
        G.state.endingTimer = 0;
        G.state.ending = null;
      }
    }
  }

  /* ===== MAIN GAME LOOP ===== */
  function gameLoop(timestamp) {
    const dt = Math.min(0.1, (timestamp - lastTime) / 1000);
    lastTime = timestamp;
    const ctx = G.Renderer.ctx;

    switch(G.state.mode) {
      case 'title':
        renderTitle(ctx, dt);
        break;

      case 'playing':
        if (!G.Dialogue.active) {
          G.Player.update(dt, keys, G.Scenes.currentRoom ? G.Scenes.currentRoom.map : null);
        }
        G.Dialogue.update(dt, keys);
        G.Scenes.update(dt, keys);
        G.Effects.update(dt, G.Sanity.value);
        G.Audio.updateDrone(G.Sanity.value);

        if (G.Sanity.value < 50 && !G.Audio.heartbeatInterval) {
          G.Audio.startHeartbeat(G.Sanity.value);
        } else if (G.Sanity.value >= 50 && G.Audio.heartbeatInterval) {
          G.Audio.stopHeartbeat();
        }

        G.Renderer.clear();
        ctx.save();
        ctx.translate(G.Effects.shakeX, G.Effects.shakeY);
        G.Scenes.render(ctx);
        G.Dialogue.render(ctx, G.Sanity.value);
        ctx.restore();
        G.Effects.render(ctx, G.Sanity.value);

        if (Math.random() < 0.001) saveGame();

        if (G.state.ending && !G.state.endingPlayed) {
          G.state.endingPlayed = true;
          const ed = G.Story.dialogues['ending_' + G.state.ending];
          if (ed) {
            G.Dialogue.showSequence(JSON.parse(JSON.stringify(ed)));
            G.Dialogue.onComplete = () => {
              saveGame();
              G.state.mode = 'ending';
              G.state.endingTimer = 0;
              G.Audio.stopHeartbeat();
            };
          }
        }

        if (keys['Escape']) { keys['Escape'] = false; saveGame(); }
        break;

      case 'ending':
        renderEnding(ctx, dt);
        break;
    }

    requestAnimationFrame(gameLoop);
  }

  /* ===== INITIALIZATION ===== */
  function init() {
    G.Renderer.init();
    setupCanvasClick();

    const overlay = document.getElementById('click-to-start');
    overlay.style.display = 'flex';

    const startAudio = () => {
      G.Audio.init();
      overlay.style.display = 'none';
      document.removeEventListener('click', startAudio);
      document.removeEventListener('keydown', startAudio);
      Object.keys(keys).forEach(k => keys[k] = false);
      lastTime = performance.now();
      requestAnimationFrame(gameLoop);
    };

    document.addEventListener('click', startAudio);
    document.addEventListener('keydown', startAudio);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    window.addEventListener('load', init);
  }
})();
