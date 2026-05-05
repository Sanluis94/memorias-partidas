/* ===== GAME.JS - Main Loop, State Machine, Input ===== */
(function() {
  'use strict';

  /* ===== INPUT HANDLER ===== */
  const keys = {};
  const KEY_MAP = {
    'Enter': 'confirm', 'NumpadEnter': 'confirm', 'KeyE': 'confirm', 'Space': 'confirm',
    'ArrowUp': 'up', 'KeyW': 'up',
    'ArrowDown': 'down', 'KeyS': 'down',
    'ArrowLeft': 'left', 'KeyA': 'left',
    'ArrowRight': 'right', 'KeyD': 'right',
    'Escape': 'escape',
  };

  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    // Also map by e.key for Enter compatibility
    if (e.key === 'Enter') keys['Enter'] = true;
    if (e.key === ' ') keys['Space'] = true;
    // Prevent scrolling
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', e => {
    keys[e.code] = false;
    if (e.key === 'Enter') keys['Enter'] = false;
    if (e.key === ' ') keys['Space'] = false;
  });

  /* Canvas click handler for menus */
  let pendingClick = null;
  function setupCanvasClick() {
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('click', e => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = 320 / rect.width;
      const scaleY = 180 / rect.height;
      pendingClick = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    });
  }

  /* ===== GAME STATE ===== */
  G.state = {
    mode: 'title', // title, playing, ending, credits
    flags: {},
    ending: null,
    endingTimer: 0,
    titleSelection: 0,
    started: false,
  };

  let lastTime = 0;
  let titleFlicker = 0;
  let titleGlitchTimer = 0;
  let creditsTimer = 0;
  let endingPhase = 0;

  /* ===== TITLE SCREEN ===== */
  function renderTitle(ctx, dt) {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, 320, 180);

    titleFlicker += dt;
    titleGlitchTimer += dt;

    // Title text with glitch
    const title = 'MEMORIAS PARTIDAS';
    ctx.font = '12px "Press Start 2P"';

    // Glitch offset
    let ox = 0, oy = 0;
    if (titleGlitchTimer > 3 && titleGlitchTimer < 3.15) {
      ox = (Math.random() - 0.5) * 6;
      oy = (Math.random() - 0.5) * 3;
    }
    if (titleGlitchTimer > 3.15) titleGlitchTimer = 0;

    // Shadow layers
    ctx.fillStyle = '#4a1942';
    const tw = ctx.measureText(title).width;
    const tx = (320 - tw) / 2;
    ctx.fillText(title, tx + 2 + ox, 52 + oy);
    ctx.fillStyle = '#2d1b69';
    ctx.fillText(title, tx + 1 + ox, 51 + oy);
    ctx.fillStyle = '#e94560';
    ctx.fillText(title, tx + ox, 50 + oy);

    // Subtitle
    ctx.font = '6px "Press Start 2P"';
    ctx.fillStyle = '#6b6b6b';
    const sub = 'Um pesadelo quantico';
    const sw = ctx.measureText(sub).width;
    ctx.fillText(sub, (320 - sw) / 2, 70);

    // Menu options
    const options = ['Novo Jogo', 'Continuar'];
    ctx.font = '7px "Press Start 2P"';

    for (let i = 0; i < options.length; i++) {
      const selected = G.state.titleSelection === i;
      if (selected) {
        const pulse = Math.sin(titleFlicker * 4) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(233, 69, 96, ${pulse})`;
        ctx.fillText('> ', 100, 105 + i * 16);
      }
      ctx.fillStyle = selected ? '#f0e6d3' : '#3a3a3a';
      ctx.fillText(options[i], 118, 105 + i * 16);
    }

    // Controls hint
    ctx.font = '5px "Press Start 2P"';
    ctx.fillStyle = '#2a2a3e';
    ctx.fillText('WASD/Setas: Mover | E/Enter: Interagir', 30, 165);

    // Handle click on menu options
    if (pendingClick) {
      const cx = pendingClick.x, cy = pendingClick.y;
      pendingClick = null;
      // Check if click is in menu area
      if (cx >= 90 && cx <= 250) {
        if (cy >= 95 && cy <= 110) {
          G.state.titleSelection = 0;
          confirmTitleSelection();
          return;
        } else if (cy >= 111 && cy <= 126) {
          G.state.titleSelection = 1;
          confirmTitleSelection();
          return;
        }
      }
    }

    // Handle keyboard input
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
      confirmTitleSelection();
      return;
    }

    // Scanlines on title
    for (let y = 0; y < 180; y += 3) {
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, y, 320, 1);
    }
  }

  function confirmTitleSelection() {
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
    G.Sanity.reset();
    G.Player.init(9, 5);
    G.Scenes.init();
    G.Audio.startDrone();

    // Show wake-up dialogue after a moment
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
      const data = {
        flags: G.state.flags,
        coherence: G.Sanity.value,
        chapter: G.Scenes.chapter,
        playerX: Math.floor(G.Player.x / 16),
        playerY: Math.floor(G.Player.y / 16),
        room: G.Scenes.currentRoomId,
      };
      localStorage.setItem('memorias_partidas_save', JSON.stringify(data));
    } catch(e) { /* silently fail */ }
  }

  /* ===== ENDING SCREEN ===== */
  function renderEnding(ctx, dt) {
    G.state.endingTimer += dt;

    const ending = G.state.ending;
    const t = G.state.endingTimer;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, 320, 180);

    if (ending === 'observer') {
      // Serene dark blue background with stars
      for (let i = 0; i < 50; i++) {
        const sx = (Math.sin(i * 7.3 + t * 0.1) * 0.5 + 0.5) * 320;
        const sy = (Math.cos(i * 4.7 + t * 0.05) * 0.5 + 0.5) * 180;
        const brightness = Math.sin(t + i) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(180,200,255,${brightness * 0.4})`;
        ctx.fillRect(sx, sy, 1, 1);
      }

      ctx.font = '10px "Press Start 2P"';
      ctx.fillStyle = '#8aaacc';
      const title = 'O Observador';
      ctx.fillText(title, (320 - ctx.measureText(title).width) / 2, 60);

      if (t > 2) {
        ctx.font = '6px "Press Start 2P"';
        ctx.fillStyle = `rgba(200,200,220,${Math.min(1, t - 2)})`;
        ctx.fillText('Você vê tudo. Todas as vidas.', 40, 90);
        ctx.fillText('Todas as possibilidades.', 55, 102);
        ctx.fillText('E encontra paz no infinito.', 48, 114);
      }
    } else if (ending === 'collapse') {
      // Chaotic, glitchy
      if (Math.random() < 0.3) {
        ctx.fillStyle = `rgba(${Math.random()*255},0,${Math.random()*100},0.1)`;
        ctx.fillRect(Math.random()*320, Math.random()*180, Math.random()*100, Math.random()*5);
      }

      const glitchText = (text, x, y) => {
        let display = '';
        for (const ch of text) {
          display += Math.random() < 0.1 ? String.fromCharCode(9600 + Math.floor(Math.random()*32)) : ch;
        }
        ctx.fillText(display, x + (Math.random()-0.5)*4, y + (Math.random()-0.5)*2);
      };

      ctx.font = '10px "Press Start 2P"';
      ctx.fillStyle = '#e94560';
      glitchText('O Colapso', 90, 50);

      if (t > 2) {
        ctx.font = '6px "Press Start 2P"';
        ctx.fillStyle = `rgba(233,69,96,${Math.min(1, t - 2)})`;
        glitchText('Tudo se comprime.', 70, 80);
        glitchText('Todo universo. Toda possibilidade.', 20, 95);
      }

      if (t > 5) {
        ctx.font = '7px "Press Start 2P"';
        ctx.fillStyle = `rgba(240,230,211,${Math.min(1, (t - 5) * 0.3)})`;
        const bigQ = 'E se o Big Bang foi alguém';
        const bigQ2 = 'como eu... tentando voltar?';
        ctx.fillText(bigQ, (320 - ctx.measureText(bigQ).width) / 2, 130);
        ctx.fillText(bigQ2, (320 - ctx.measureText(bigQ2).width) / 2, 145);
      }

      G.Effects.render(ctx, 5);
    } else if (ending === 'choice') {
      // Warm colors, but with subtle glitches
      ctx.fillStyle = '#1a0a05';
      ctx.fillRect(0, 0, 320, 180);

      // Warm glow
      const gradient = ctx.createRadialGradient(160, 90, 20, 160, 90, 120);
      gradient.addColorStop(0, `rgba(200,160,80,${Math.min(0.15, t * 0.02)})`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 320, 180);

      ctx.font = '10px "Press Start 2P"';
      ctx.fillStyle = '#c8a860';
      const title = 'A Escolha';
      ctx.fillText(title, (320 - ctx.measureText(title).width) / 2, 50);

      if (t > 2) {
        ctx.font = '6px "Press Start 2P"';
        ctx.fillStyle = `rgba(200,180,140,${Math.min(1, t - 2)})`;
        ctx.fillText('"Papai! Você demorou!"', 60, 80);
      }

      if (t > 4) {
        ctx.fillStyle = `rgba(150,140,120,${Math.min(1, (t - 4) * 0.5)})`;
        ctx.fillText('Você sabe que não é real.', 55, 105);
        ctx.fillText('Mas não importa mais.', 65, 117);
      }

      // Subtle glitch reminder it's not real
      if (Math.random() < 0.02) {
        G.Effects.render(ctx, 60);
      }
    }

    // Credits after delay
    if (t > 10) {
      ctx.font = '5px "Press Start 2P"';
      const alpha = Math.min(1, (t - 10) * 0.2);
      ctx.fillStyle = `rgba(100,100,100,${alpha})`;
      ctx.fillText('MEMÓRIAS PARTIDAS', 105, 160);
      ctx.fillText('Pressione ESC para voltar ao título', 50, 172);

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
        // Update
        if (!G.Dialogue.active) {
          G.Player.update(dt, keys, G.Scenes.currentRoom ? G.Scenes.currentRoom.map : null);
        }
        G.Dialogue.update(dt, keys);
        G.Scenes.update(dt, keys);
        G.Effects.update(dt, G.Sanity.value);
        G.Audio.updateDrone(G.Sanity.value);

        // Heartbeat at low coherence
        if (G.Sanity.value < 50 && !G.Audio.heartbeatInterval) {
          G.Audio.startHeartbeat(G.Sanity.value);
        } else if (G.Sanity.value >= 50 && G.Audio.heartbeatInterval) {
          G.Audio.stopHeartbeat();
        }

        // Render
        G.Renderer.clear();

        // Apply screen shake
        ctx.save();
        ctx.translate(G.Effects.shakeX, G.Effects.shakeY);

        G.Scenes.render(ctx);
        G.Dialogue.render(ctx, G.Sanity.value);

        ctx.restore();

        // Post-processing effects
        G.Effects.render(ctx, G.Sanity.value);

        // Auto-save periodically
        if (Math.random() < 0.001) saveGame();

        // Check for ending trigger
        if (G.state.ending && !G.state.endingPlayed) {
          G.state.endingPlayed = true;
          const endingDialogue = G.Story.dialogues['ending_' + G.state.ending];
          if (endingDialogue) {
            G.Dialogue.showSequence(JSON.parse(JSON.stringify(endingDialogue)));
            G.Dialogue.onComplete = () => {
              saveGame();
              G.state.mode = 'ending';
              G.state.endingTimer = 0;
              G.Audio.stopHeartbeat();
            };
          }
        }

        // Pause
        if (keys['Escape']) {
          keys['Escape'] = false;
          saveGame();
        }
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

    // Show click-to-start for audio context
    const clickOverlay = document.getElementById('click-to-start');
    clickOverlay.style.display = 'flex';

    const startAudio = () => {
      G.Audio.init();
      clickOverlay.style.display = 'none';
      document.removeEventListener('click', startAudio);
      document.removeEventListener('keydown', startAudio);

      // Clear all keys to prevent stuck keys from overlay dismissal
      Object.keys(keys).forEach(k => keys[k] = false);

      // Start game loop
      lastTime = performance.now();
      requestAnimationFrame(gameLoop);
    };

    document.addEventListener('click', startAudio);
    document.addEventListener('keydown', startAudio);
  }

  // Wait for fonts to load
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    window.addEventListener('load', init);
  }
})();
