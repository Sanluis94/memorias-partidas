/* ===== GAME.JS - Main Loop ===== */
(function() {
  'use strict';
  const W = 480, H = 270;

  const keys = {};
  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.key === 'Enter') keys['Enter'] = true;
    if (e.key === ' ') keys['Space'] = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', e => {
    keys[e.code] = false;
    if (e.key === 'Enter') keys['Enter'] = false;
    if (e.key === ' ') keys['Space'] = false;
  });

  let pendingClick = null;
  function setupCanvasClick() {
    const cv = document.getElementById('game-canvas');
    cv.addEventListener('click', e => {
      const r = cv.getBoundingClientRect();
      pendingClick = { x: (e.clientX-r.left)*(W/r.width), y: (e.clientY-r.top)*(H/r.height) };
    });
  }

  G.state = { mode: 'title', flags: {}, ending: null, endingTimer: 0, titleSelection: 0 };
  let lastTime = 0, titleFlicker = 0, titleGlitch = 0, titleParticles = [];

  // Create atmospheric particles for title
  for (let i = 0; i < 40; i++) {
    titleParticles.push({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-0.5)*8, vy: -Math.random()*12-2,
      life: Math.random(), alpha: Math.random()*0.15,
    });
  }

  function renderTitle(ctx, dt) {
    // Deep black bg
    ctx.fillStyle = '#04040a';
    ctx.fillRect(0, 0, W, H);

    titleFlicker += dt;
    titleGlitch += dt;

    // Floating dust particles
    for (const p of titleParticles) {
      p.y += p.vy * dt;
      p.x += p.vx * dt;
      p.life -= dt * 0.1;
      if (p.y < -5 || p.life <= 0) { p.y = H+5; p.x = Math.random()*W; p.life = 1; }
      ctx.fillStyle = `rgba(80,40,100,${p.alpha * p.life})`;
      ctx.fillRect(p.x, p.y, 1, 1);
    }

    // Dark fog at bottom
    const fog = ctx.createLinearGradient(0, H*0.6, 0, H);
    fog.addColorStop(0, 'transparent');
    fog.addColorStop(1, 'rgba(10,5,20,0.4)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, W, H);

    const title = 'MEMORIAS PARTIDAS';
    ctx.font = '16px "Press Start 2P"';

    let ox = 0, oy = 0;
    if (titleGlitch > 4 && titleGlitch < 4.12) {
      ox = (Math.random()-0.5)*8; oy = (Math.random()-0.5)*4;
    }
    if (titleGlitch > 4.12) titleGlitch = 0;

    // Chromatic shadow
    const tw = ctx.measureText(title).width;
    const tx = (W-tw)/2;
    ctx.fillStyle = 'rgba(100,20,30,0.4)';
    ctx.fillText(title, tx+3+ox, 82+oy);
    ctx.fillStyle = 'rgba(30,10,60,0.5)';
    ctx.fillText(title, tx-2+ox, 81+oy);
    // Main title
    ctx.fillStyle = '#8a2030';
    ctx.fillText(title, tx+ox, 80+oy);

    // Subtitle
    ctx.font = '6px "Press Start 2P"';
    ctx.fillStyle = '#2a2030';
    const sub = 'Um pesadelo quantico';
    ctx.fillText(sub, (W-ctx.measureText(sub).width)/2, 100);

    // Menu
    const opts = ['Novo Jogo', 'Continuar'];
    ctx.font = '8px "Press Start 2P"';
    for (let i = 0; i < opts.length; i++) {
      const sel = G.state.titleSelection === i;
      const my = 150 + i * 22;
      if (sel) {
        const pulse = Math.sin(titleFlicker*3)*0.3+0.5;
        ctx.fillStyle = `rgba(100,20,30,${pulse})`;
        ctx.fillText('>', 158, my);
      }
      ctx.fillStyle = sel ? '#8a7080' : '#1a1820';
      ctx.fillText(opts[i], 178, my);
    }

    ctx.font = '5px "Press Start 2P"';
    ctx.fillStyle = '#0e0c14';
    ctx.fillText('WASD/Setas: Mover | E/Enter: Interagir', 110, 245);

    // Click
    if (pendingClick) {
      const cy = pendingClick.y; pendingClick = null;
      if (cy >= 140 && cy <= 160) { G.state.titleSelection = 0; confirmTitle(); return; }
      if (cy >= 162 && cy <= 182) { G.state.titleSelection = 1; confirmTitle(); return; }
    }

    if (keys['ArrowUp']||keys['KeyW']) { G.state.titleSelection=0; keys['ArrowUp']=keys['KeyW']=false; G.Audio.sfx.menuMove(); }
    if (keys['ArrowDown']||keys['KeyS']) { G.state.titleSelection=1; keys['ArrowDown']=keys['KeyS']=false; G.Audio.sfx.menuMove(); }
    if (keys['Enter']||keys['NumpadEnter']||keys['KeyE']||keys['Space']) {
      keys['Enter']=keys['NumpadEnter']=keys['KeyE']=keys['Space']=false;
      confirmTitle(); return;
    }
  }

  function confirmTitle() {
    G.Audio.sfx.select();
    G.state.titleSelection === 0 ? startNewGame() : loadGame();
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
    setTimeout(() => G.Dialogue.showSequence(G.Story.dialogues.wake_up), 1500);
  }

  function loadGame() {
    try {
      const s = localStorage.getItem('memorias_partidas_save');
      if (s) {
        const d = JSON.parse(s);
        G.state.flags = d.flags || {};
        G.Sanity.value = d.coherence || 100;
        G.state.mode = 'playing';
        G.Player.init(d.playerX || 9, d.playerY || 5);
        G.Scenes.fadeAlpha = 0; G.Scenes.fadeDir = 0;
        G.Scenes.loadChapter(d.chapter || 1);
        G.Audio.startDrone();
      } else startNewGame();
    } catch(e) { startNewGame(); }
  }

  function saveGame() {
    try {
      localStorage.setItem('memorias_partidas_save', JSON.stringify({
        flags: G.state.flags, coherence: G.Sanity.value,
        chapter: G.Scenes.chapter,
        playerX: Math.floor(G.Player.x/24), playerY: Math.floor(G.Player.y/24),
      }));
    } catch(e) {}
  }

  function renderEnding(ctx, dt) {
    G.state.endingTimer += dt;
    const e = G.state.ending, t = G.state.endingTimer;
    ctx.fillStyle = '#04040a';
    ctx.fillRect(0, 0, W, H);

    if (e === 'observer') {
      for (let i = 0; i < 60; i++) {
        const sx = (Math.sin(i*7.3+t*0.08)*0.5+0.5)*W;
        const sy = (Math.cos(i*4.7+t*0.04)*0.5+0.5)*H;
        ctx.fillStyle = `rgba(120,140,200,${(Math.sin(t+i)*0.5+0.5)*0.25})`;
        ctx.fillRect(sx, sy, 1, 1);
      }
      ctx.font = '14px "Press Start 2P"'; ctx.fillStyle = '#4a6a8a';
      const tl = 'O Observador';
      ctx.fillText(tl, (W-ctx.measureText(tl).width)/2, 90);
      if (t > 2) {
        ctx.font = '7px "Press Start 2P"';
        ctx.fillStyle = `rgba(120,130,160,${Math.min(1,t-2)})`;
        ctx.fillText('Voce ve tudo. Todas as vidas.', 110, 135);
        ctx.fillText('Todas as possibilidades.', 125, 155);
        ctx.fillText('E encontra paz no infinito.', 118, 175);
      }
    } else if (e === 'collapse') {
      if (Math.random()<0.3) {
        ctx.fillStyle = `rgba(${Math.random()*120},0,${Math.random()*40},0.08)`;
        ctx.fillRect(Math.random()*W, Math.random()*H, Math.random()*80, Math.random()*3);
      }
      ctx.font = '14px "Press Start 2P"'; ctx.fillStyle = '#6a1020';
      const tl = 'O Colapso';
      ctx.fillText(tl, (W-ctx.measureText(tl).width)/2+(Math.random()-0.5)*3, 80);
      if (t > 3) {
        ctx.font = '7px "Press Start 2P"';
        ctx.fillStyle = `rgba(100,30,30,${Math.min(1,t-3)})`;
        ctx.fillText('Toda materia. Toda possibilidade.', 95, 125);
        ctx.fillText('Comprimidas em um unico ponto.', 105, 145);
      }
      if (t > 6) {
        ctx.font = '8px "Press Start 2P"';
        ctx.fillStyle = `rgba(180,160,140,${Math.min(1,(t-6)*0.3)})`;
        const q = '"E se o Big Bang foi alguem como eu..."';
        ctx.fillText(q, (W-ctx.measureText(q).width)/2, 185);
        const q2 = '"...tentando voltar para casa?"';
        ctx.fillText(q2, (W-ctx.measureText(q2).width)/2, 205);
      }
      G.Effects.render(ctx, 5);
    } else if (e === 'choice') {
      ctx.fillStyle = '#0a0504';
      ctx.fillRect(0, 0, W, H);
      const grad = ctx.createRadialGradient(W/2, H/2, 10, W/2, H/2, 150);
      grad.addColorStop(0, `rgba(140,100,50,${Math.min(0.1,t*0.01)})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      ctx.font = '14px "Press Start 2P"'; ctx.fillStyle = '#6a5030';
      const tl = 'A Escolha';
      ctx.fillText(tl, (W-ctx.measureText(tl).width)/2, 80);
      if (t > 2) {
        ctx.font = '7px "Press Start 2P"';
        ctx.fillStyle = `rgba(140,120,90,${Math.min(1,t-2)})`;
        ctx.fillText('"Papai! Voce demorou!"', 130, 125);
      }
      if (t > 5) {
        ctx.fillStyle = `rgba(100,90,70,${Math.min(1,(t-5)*0.4)})`;
        ctx.fillText('Voce sabe que nao e real.', 130, 160);
        ctx.fillText('Mas o abraco de Sophia e quente.', 110, 180);
        ctx.fillText('E isso basta.', 165, 200);
      }
      if (Math.random()<0.015) G.Effects.render(ctx, 60);
    }

    if (t > 12) {
      ctx.font = '5px "Press Start 2P"';
      ctx.fillStyle = `rgba(60,50,70,${Math.min(1,(t-12)*0.2)})`;
      ctx.fillText('MEMORIAS PARTIDAS', 185, 245);
      ctx.fillText('Pressione ESC para voltar', 160, 258);
      if (keys['Escape']) { keys['Escape']=false; G.state.mode='title'; G.state.endingTimer=0; G.state.ending=null; }
    }
  }

  function gameLoop(timestamp) {
    const dt = Math.min(0.1, (timestamp-lastTime)/1000);
    lastTime = timestamp;
    const ctx = G.Renderer.ctx;

    switch(G.state.mode) {
      case 'title': renderTitle(ctx, dt); break;
      case 'playing':
        if (!G.Dialogue.active) G.Player.update(dt, keys, G.Scenes.currentRoom ? G.Scenes.currentRoom.map : null);
        G.Dialogue.update(dt, keys);
        G.Scenes.update(dt, keys);
        G.Effects.update(dt, G.Sanity.value);
        G.Audio.updateDrone(G.Sanity.value);
        if (G.Sanity.value<50 && !G.Audio.heartbeatInterval) G.Audio.startHeartbeat(G.Sanity.value);
        else if (G.Sanity.value>=50 && G.Audio.heartbeatInterval) G.Audio.stopHeartbeat();
        G.Renderer.clear();
        ctx.save(); ctx.translate(G.Effects.shakeX, G.Effects.shakeY);
        G.Scenes.render(ctx);
        G.Dialogue.render(ctx, G.Sanity.value);
        ctx.restore();
        G.Effects.render(ctx, G.Sanity.value);
        if (Math.random()<0.001) saveGame();
        if (G.state.ending && !G.state.endingPlayed) {
          G.state.endingPlayed = true;
          const ed = G.Story.dialogues['ending_'+G.state.ending];
          if (ed) {
            G.Dialogue.showSequence(JSON.parse(JSON.stringify(ed)));
            G.Dialogue.onComplete = () => { saveGame(); G.state.mode='ending'; G.state.endingTimer=0; G.Audio.stopHeartbeat(); };
          }
        }
        if (keys['Escape']) { keys['Escape']=false; saveGame(); }
        break;
      case 'ending': renderEnding(ctx, dt); break;
    }
    requestAnimationFrame(gameLoop);
  }

  function init() {
    G.Renderer.init();
    setupCanvasClick();
    const ov = document.getElementById('click-to-start');
    ov.style.display = 'flex';
    const start = () => {
      G.Audio.init(); ov.style.display = 'none';
      document.removeEventListener('click', start);
      document.removeEventListener('keydown', start);
      Object.keys(keys).forEach(k => keys[k]=false);
      lastTime = performance.now();
      requestAnimationFrame(gameLoop);
    };
    document.addEventListener('click', start);
    document.addEventListener('keydown', start);
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
  else window.addEventListener('load', init);
})();
