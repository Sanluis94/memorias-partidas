/* ===== GAME3D - State, Dialogue, UI ===== */
(function() {
  'use strict';
  const W = 960, H = 540;
  const keys = {};
  window.addEventListener('keydown', e => { keys[e.code] = true; if(e.key==='Enter')keys['Enter']=true; });
  window.addEventListener('keyup', e => { keys[e.code] = false; if(e.key==='Enter')keys['Enter']=false; });

  const state = { mode:'title', flags:{}, ending:null, chapter:1, sanity:100, endingTimer:0 };

  // Dialogue system
  const DLG = {
    active:false, text:'', display:'', idx:0, timer:0, queue:[], options:null, sel:0, isThought:false, onComplete:null,
    show(t,o) { this.active=true; this.text=t; this.display=''; this.idx=0; this.timer=0; this.isThought=o&&o.isThought; this.options=(o&&o.choices)||null; this.sel=0; },
    showSeq(msgs) { if(!msgs||!msgs.length)return; this.queue=msgs.slice(1); const f=msgs[0]; typeof f==='string'?this.show(f):this.show(f.text,f); },
    update(dt) {
      if(!this.active) return;
      if(this.idx<this.text.length) {
        this.timer+=dt;
        if(this.timer>=0.035) { this.timer=0; this.idx++; this.display=this.text.substring(0,this.idx); }
        if(keys['Enter']||keys['KeyE']||keys['Space']) { this.display=this.text; this.idx=this.text.length; keys['Enter']=keys['KeyE']=keys['Space']=false; }
        return;
      }
      if(this.options) {
        if(keys['ArrowUp']||keys['KeyW']) { this.sel=Math.max(0,this.sel-1); keys['ArrowUp']=keys['KeyW']=false; }
        if(keys['ArrowDown']||keys['KeyS']) { this.sel=Math.min(this.options.length-1,this.sel+1); keys['ArrowDown']=keys['KeyS']=false; }
      }
      if(keys['Enter']||keys['KeyE']||keys['Space']) {
        keys['Enter']=keys['KeyE']=keys['Space']=false;
        if(this.options) {
          const ch=this.options[this.sel];
          if(ch.effect) {
            if(ch.effect.flag) state.flags[ch.effect.flag]=true;
            if(ch.effect.sanity) state.sanity=Math.max(0,Math.min(100,state.sanity+ch.effect.sanity));
            if(ch.effect.ending) state.ending=ch.effect.ending;
          }
        }
        if(this.queue.length>0) { const n=this.queue.shift(); typeof n==='string'?this.show(n):this.show(n.text,n); }
        else { this.active=false; if(this.onComplete){const cb=this.onComplete;this.onComplete=null;cb();} }
      }
    },
    render(ctx) {
      if(!this.active) return;
      const bx=80,by=H-130,bw=W-160,bh=100;
      ctx.fillStyle=this.isThought?'rgba(5,3,12,0.92)':'rgba(12,8,20,0.92)';
      ctx.fillRect(bx,by,bw,bh);
      ctx.strokeStyle=this.isThought?'#2a1840':'#3a2a18';
      ctx.lineWidth=2; ctx.strokeRect(bx,by,bw,bh);
      // Text
      let d=this.display;
      if(state.sanity<50&&Math.random()<(50-state.sanity)/150) {
        const gl='!@#$%&*=<>?/|~';
        d=d.split('').map(c=>Math.random()<0.05?gl[Math.floor(Math.random()*gl.length)]:c).join('');
      }
      ctx.font='11px "Press Start 2P"';
      ctx.fillStyle=this.isThought?'#7a6a9a':'#c8b8a0';
      const words=d.split(' '); let lines=[],cur='';
      for(const w of words){const t=cur?cur+' '+w:w;if(ctx.measureText(t).width>bw-40){if(cur)lines.push(cur);cur=w;}else cur=t;}
      if(cur)lines.push(cur);
      for(let i=0;i<Math.min(lines.length,4);i++) ctx.fillText(lines[i],bx+20,by+28+i*20);
      // Choices
      if(this.options&&this.idx>=this.text.length) {
        const cy=by-this.options.length*28-10;
        ctx.fillStyle='rgba(5,3,12,0.9)'; ctx.fillRect(bx+60,cy,bw-120,this.options.length*28+10);
        ctx.strokeStyle='#3a2a18'; ctx.strokeRect(bx+60,cy,bw-120,this.options.length*28+10);
        for(let i=0;i<this.options.length;i++) {
          const s=i===this.sel;
          if(s){ctx.fillStyle=`rgba(100,20,30,${Math.sin(Date.now()*0.005)*0.3+0.6})`;ctx.fillText('>',bx+80,cy+24+i*28);}
          ctx.fillStyle=s?'#d0c0a0':'#3a3040';
          ctx.fillText(this.options[i].text,bx+100,cy+24+i*28);
        }
      }
      // Continue indicator
      if(!this.options&&this.idx>=this.text.length&&Math.sin(Date.now()*0.006)>0) {
        ctx.fillStyle='#3a2a18'; ctx.fillText('v',bx+bw-30,by+bh-12);
      }
    }
  };

  // Interaction map
  const INTERACT_MAP = {
    bed:'bed_interact', nightstand:'nightstand_interact', pills:'pills_interact_1',
    mirror:'mirror_interact_1', photo:'photo_interact_1', window:'window_interact',
    tv:'tv_interact_1', couch:'couch_interact', bookshelf:'bookshelf_interact',
    fridge:'fridge_interact', stove:'stove_interact', note:'note1_interact',
    table:'kitchen_table_interact', labConsole:'lab_equipment_interact',
    labEquip:'lab_equipment_interact', desk:'nightstand_interact',
  };
  const interactCounts = {};

  // Chapter events
  let chapterEvents = [];
  let eventTimer = 0;
  let chapterTitleTimer = 0;
  let chapterTitle = '';
  let roomVisits = {};
  let fadeAlpha = 0;
  let fadeDir = 0;
  let pendingRoom = null;

  function loadChapter(num) {
    state.chapter = num;
    const ch = G.Story.chapters[num];
    if (!ch) return;
    chapterEvents = ch.events.slice();
    eventTimer = 0;
    chapterTitle = 'Capitulo ' + num + ': ' + ch.name;
    chapterTitleTimer = 5;
    loadRoom(ch.startRoom);
  }

  function loadRoom(roomId, sx, sz) {
    roomVisits[roomId] = (roomVisits[roomId]||0)+1;
    G.World3D.loadRoom(roomId);
    const def = G.World3D.getRoomDef(roomId);
    if (def) G.World3D.spawnPlayer(sx||def.width/2, sz||def.depth/2);
  }

  function transitionTo(roomId, sx, sz) {
    pendingRoom = {roomId, sx, sz};
    fadeDir = 1; fadeAlpha = 0;
    try { G.Audio.sfx.door(); } catch(e){}
  }

  function checkProgress() {
    const f = state.flags;
    if(state.chapter===1&&(f.tookPill1||f.refusedPill1)&&Object.keys(interactCounts).length>=3&&!f.ch1done){
      f.ch1done=true; setTimeout(()=>{loadChapter(2);state.sanity-=10;},1500);
    }
    if(state.chapter===2&&chapterEvents.length===0&&!f.ch2done){
      f.ch2done=true; setTimeout(()=>{loadChapter(3);state.sanity-=15;},2000);
    }
    if(state.chapter===3&&(f.visitedMemory||0)>=1&&!f.ch3done){
      f.ch3done=true; setTimeout(()=>loadChapter(4),2500);
    }
    if(state.chapter===4&&f.foundLabNote&&!f.ch4done){
      f.ch4done=true; setTimeout(()=>loadChapter(5),2500);
    }
    if(state.chapter===5&&G.World3D.currentRoomId==='void_room'&&!f.endingStarted){
      f.endingStarted=true;
      setTimeout(()=>{
        DLG.showSeq(G.Story.dialogues.void_revelation);
        DLG.onComplete=()=>setTimeout(()=>DLG.showSeq(G.Story.dialogues.final_choice),2000);
      },3000);
    }
    // Memory fragments ch3
    if(state.chapter===3&&!DLG.active&&Math.random()<0.0003){
      const fr=['memory_wife_death_1','memory_daughter'][Math.floor(Math.random()*2)];
      DLG.showSeq(G.Story.dialogues[fr]);
      f.visitedMemory=(f.visitedMemory||0)+1;
      state.sanity-=10;
    }
  }

  // UI Canvas
  let uiCtx = null;

  function renderUI(dt) {
    uiCtx.clearRect(0, 0, W, H);

    // Chapter title
    if (chapterTitleTimer > 0) {
      chapterTitleTimer -= dt;
      const a = Math.min(1, chapterTitleTimer * 0.4);
      uiCtx.fillStyle = `rgba(0,0,0,${Math.min(0.9, chapterTitleTimer/2)})`;
      uiCtx.fillRect(0, 0, W, H);
      uiCtx.font = '18px "Press Start 2P"';
      uiCtx.fillStyle = `rgba(100,40,50,${a})`;
      const tw = uiCtx.measureText(chapterTitle).width;
      uiCtx.fillText(chapterTitle, (W-tw)/2, H/2);
    }

    // Fade
    if (fadeDir !== 0) {
      fadeAlpha += fadeDir * dt * 2.5;
      if (fadeAlpha >= 1 && fadeDir === 1) {
        if (pendingRoom) { loadRoom(pendingRoom.roomId, pendingRoom.sx, pendingRoom.sz); pendingRoom=null; }
        fadeDir = -1;
      }
      if (fadeAlpha <= 0 && fadeDir === -1) { fadeAlpha=0; fadeDir=0; }
    }
    if (fadeAlpha > 0) {
      uiCtx.fillStyle = `rgba(0,0,0,${Math.min(1,fadeAlpha)})`;
      uiCtx.fillRect(0, 0, W, H);
    }

    // Sanity bar
    const bw=100,bh=8,bx=W-bw-16,by=20;
    uiCtx.font='8px "Press Start 2P"';
    uiCtx.fillStyle='rgba(60,50,70,0.3)';
    uiCtx.fillText('COERENCIA',bx,by-4);
    uiCtx.fillStyle='rgba(10,8,16,0.6)';
    uiCtx.fillRect(bx-1,by-1,bw+2,bh+2);
    const p=state.sanity/100;
    uiCtx.fillStyle=p>0.6?'#1a4a2a':p>0.4?'#4a3a10':p>0.2?'#4a1818':'#6a0018';
    uiCtx.fillRect(bx,by,Math.floor(bw*p),bh);

    // Room name
    uiCtx.font='7px "Press Start 2P"';
    uiCtx.fillStyle='rgba(50,40,60,0.3)';
    const def = G.World3D.getRoomDef(G.World3D.currentRoomId);
    if(def) {/* room name shown subtly */}

    // Interaction hint
    if (!DLG.active) {
      const target = G.World3D.getInteractTarget();
      if (target) {
        uiCtx.font = '8px "Press Start 2P"';
        uiCtx.fillStyle = 'rgba(120,100,80,0.5)';
        uiCtx.fillText('[E] Examinar', W/2 - 50, H/2 + 30);
      }
      const door = G.World3D.checkDoor();
      if (door) {
        uiCtx.font = '8px "Press Start 2P"';
        uiCtx.fillStyle = 'rgba(120,100,80,0.5)';
        uiCtx.fillText('[E] Abrir porta', W/2 - 55, H/2 + 30);
      }
    }

    // Sanity effects
    if (state.sanity < 40) {
      // Vignette pulse
      const breath = Math.sin(Date.now()*0.002)*0.05*((40-state.sanity)/40);
      if(breath>0) { uiCtx.fillStyle=`rgba(0,0,0,${breath})`; uiCtx.fillRect(0,0,W,H); }
    }
    if (state.sanity < 25 && Math.random()<0.01) {
      uiCtx.fillStyle=`rgba(60,0,0,${Math.random()*0.06})`;
      uiCtx.fillRect(0,0,W,H);
    }

    // Dialogue
    DLG.render(uiCtx);
  }

  function renderEnding(dt) {
    state.endingTimer += dt;
    const t = state.endingTimer, e = state.ending;
    uiCtx.clearRect(0,0,W,H);
    uiCtx.fillStyle='#040408'; uiCtx.fillRect(0,0,W,H);

    if(e==='observer'){
      for(let i=0;i<40;i++){
        const sx=(Math.sin(i*7+t*0.08)*0.5+0.5)*W,sy=(Math.cos(i*5+t*0.04)*0.5+0.5)*H;
        uiCtx.fillStyle=`rgba(100,120,180,${(Math.sin(t+i)*0.5+0.5)*0.2})`;uiCtx.fillRect(sx,sy,1,1);
      }
      uiCtx.font='22px "Press Start 2P"';uiCtx.fillStyle='#3a5a7a';
      const tl='O Observador';uiCtx.fillText(tl,(W-uiCtx.measureText(tl).width)/2,180);
      if(t>3){uiCtx.font='10px "Press Start 2P"';uiCtx.fillStyle=`rgba(100,110,140,${Math.min(1,t-3)})`;
        uiCtx.fillText('Voce ve tudo. Todas as vidas. Todas as possibilidades.',140,240);
        uiCtx.fillText('E encontra paz no infinito.',220,270);}
    } else if(e==='collapse'){
      if(Math.random()<0.2){uiCtx.fillStyle=`rgba(${Math.random()*80},0,0,0.06)`;uiCtx.fillRect(Math.random()*W,Math.random()*H,Math.random()*100,2);}
      uiCtx.font='22px "Press Start 2P"';uiCtx.fillStyle='#5a1020';
      const tl='O Colapso';uiCtx.fillText(tl,(W-uiCtx.measureText(tl).width)/2+(Math.random()-0.5)*3,170);
      if(t>4){uiCtx.font='10px "Press Start 2P"';uiCtx.fillStyle=`rgba(160,130,110,${Math.min(1,(t-4)*0.3)})`;
        uiCtx.fillText('"E se o Big Bang foi alguem como eu..."',160,260);
        uiCtx.fillText('"...tentando voltar para casa?"',200,290);}
    } else if(e==='choice'){
      uiCtx.fillStyle='#0a0604';uiCtx.fillRect(0,0,W,H);
      uiCtx.font='22px "Press Start 2P"';uiCtx.fillStyle='#5a4020';
      const tl='A Escolha';uiCtx.fillText(tl,(W-uiCtx.measureText(tl).width)/2,170);
      if(t>3){uiCtx.font='10px "Press Start 2P"';uiCtx.fillStyle=`rgba(120,100,70,${Math.min(1,t-3)})`;
        uiCtx.fillText('"Papai! Voce demorou!"',250,230);
        if(t>6)uiCtx.fillText('Voce sabe que nao e real. Mas nao importa.',180,270);}
    }
    if(t>12){uiCtx.font='8px "Press Start 2P"';uiCtx.fillStyle=`rgba(50,40,60,${Math.min(1,(t-12)*0.2)})`;
      uiCtx.fillText('Pressione ESC para voltar',330,480);
      if(keys['Escape']){keys['Escape']=false;state.mode='title';state.endingTimer=0;state.ending=null;}}
  }

  // Main loop
  let lastTime = 0;
  function gameLoop(ts) {
    const dt = Math.min(0.1, (ts-lastTime)/1000); lastTime = ts;

    if (state.mode === 'playing') {
      if (!DLG.active && fadeDir === 0 && chapterTitleTimer <= 0) {
        G.World3D.update(dt, keys, state.sanity);

        // Door check
        if (keys['KeyE']||keys['Enter']) {
          const door = G.World3D.checkDoor();
          if (door) {
            keys['KeyE']=keys['Enter']=false;
            const ch = G.Story.chapters[state.chapter];
            if(ch&&ch.availableRooms.includes(door.targetRoom)) {
              transitionTo(door.targetRoom, door.targetX, door.targetZ);
            } else if(!DLG.active) {
              DLG.show('A porta nao abre. Algo a impede.', {isThought:true});
            }
          }
          // Object interaction
          const target = G.World3D.getInteractTarget();
          if (target && !door) {
            keys['KeyE']=keys['Enter']=false;
            const ik = target + '_' + G.World3D.currentRoomId;
            interactCounts[ik] = (interactCounts[ik]||0)+1;
            const count = interactCounts[ik];
            let dk = INTERACT_MAP[target];
            if(target==='mirror'&&count>1) dk=count>2?'mirror_interact_3':'mirror_interact_2';
            if(target==='photo'&&count>1) dk='photo_interact_2';
            if(target==='pills'&&count>1) dk='pills_interact_2';
            if(target==='note'&&G.World3D.currentRoomId==='laboratory') {
              dk=count>1?'lab_note_2':'lab_note_1';
              state.flags.foundLabNote=true;
            }
            if(dk&&G.Story.dialogues[dk]) {
              DLG.showSeq(JSON.parse(JSON.stringify(G.Story.dialogues[dk])));
              if(target==='mirror'&&count>=2) state.sanity-=8;
              if(target==='tv') state.sanity-=3;
            }
          }
        }

        // Timed chapter events
        if(chapterEvents.length>0){eventTimer+=dt;if(eventTimer>10+Math.random()*12){eventTimer=0;
          const ev=chapterEvents.shift();if(G.Story.dialogues[ev]&&!DLG.active){DLG.showSeq(G.Story.dialogues[ev]);state.sanity-=5;}}}
      }

      DLG.update(dt);
      G.World3D.render();
      renderUI(dt);
      checkProgress();

      // Ending trigger
      if(state.ending&&!state.endingPlayed){
        state.endingPlayed=true;
        const ed=G.Story.dialogues['ending_'+state.ending];
        if(ed){DLG.showSeq(JSON.parse(JSON.stringify(ed)));DLG.onComplete=()=>{state.mode='ending';state.endingTimer=0;};}
      }
    } else if (state.mode === 'ending') {
      G.World3D.render();
      renderEnding(dt);
    }

    requestAnimationFrame(gameLoop);
  }

  function startGame() {
    state.mode = 'playing';
    state.flags = {};
    state.ending = null;
    state.sanity = 100;
    state.endingPlayed = false;
    G.World3D.init();
    loadChapter(1);
    try { G.Audio.init(); G.Audio.startDrone(); } catch(e){}
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
  }

  // Init
  window.addEventListener('load', () => {
    const uiCanvas = document.getElementById('ui-canvas');
    uiCtx = uiCanvas.getContext('2d');

    const overlay = document.getElementById('click-to-start');
    overlay.addEventListener('click', () => {
      overlay.style.display = 'none';
      document.body.requestPointerLock();
      startGame();
    });

    // Re-lock pointer on click
    document.addEventListener('click', () => {
      if (state.mode === 'playing' && !document.pointerLockElement) {
        document.body.requestPointerLock();
      }
    });
  });
})();
