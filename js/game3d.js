/* ===== GAME3D - State, Dialogue, UI ===== */
(function() {
  'use strict';
  const W = 960, H = 540;
  const keys = {};
  window.addEventListener('keydown', e => { keys[e.code] = true; if(e.key==='Enter')keys['Enter']=true; if(e.code==='Tab'){e.preventDefault();keys['Tab']=true;} });
  window.addEventListener('keyup', e => { keys[e.code] = false; if(e.key==='Enter')keys['Enter']=false; });

  const state = { mode:'title', flags:{}, ending:null, chapter:1, sanity:100, endingTimer:0 };

  // ===== INVENTORY SYSTEM =====
  const inventory = [];
  const INV_ITEMS = {
    diary_page_1: { name: 'Pagina do Diario (1)', desc: 'Uma pagina rasgada com anotacoes tremulas.', icon: '📄' },
    diary_page_2: { name: 'Pagina do Diario (2)', desc: 'Menciona o "Projeto Observador".', icon: '📄' },
    diary_page_3: { name: 'Pagina do Diario (3)', desc: 'O dia do acidente. A tinta esta borrada.', icon: '📄' },
    bathroom_key: { name: 'Chave Enferrujada', desc: 'Encontrada na gaveta. Abre o banheiro.', icon: '🔑' },
    lab_keycard: { name: 'Cartao de Acesso', desc: 'Dr. A. Meira - Nivel 5. O laboratorio.', icon: '💳' },
    photo_family: { name: 'Foto de Familia', desc: 'Eu, Maria e... Sophia?', icon: '🖼' },
    pill_bottle: { name: 'Frasco de Remedios', desc: 'As capsulas mudam de cor sozinhas.', icon: '💊' },
    void_crystal: { name: 'Fragmento Quantico', desc: 'Brilha com uma luz que nao deveria existir.', icon: '💎' },
  };
  function hasItem(id) { return inventory.includes(id); }
  function addItem(id) {
    if (!hasItem(id) && INV_ITEMS[id]) {
      inventory.push(id);
      itemPickupAnim = { name: INV_ITEMS[id].name, icon: INV_ITEMS[id].icon, timer: 3 };
      try { G.Audio.sfx.step(); } catch(e){}
    }
  }
  let itemPickupAnim = null;
  let showInventory = false;

  // ===== OBJECTIVES SYSTEM =====
  const OBJECTIVES = {
    1: [
      { id: 'explore_bedroom', text: 'Explorar o quarto', check: () => (interactCounts['bed_bedroom']||0) >= 1 },
      { id: 'find_pills', text: 'Encontrar os remedios', check: () => state.flags.tookPill1 || state.flags.refusedPill1 },
      { id: 'find_key', text: 'Encontrar a chave do banheiro', check: () => hasItem('bathroom_key') },
      { id: 'explore_apartment', text: 'Explorar o apartamento', check: () => Object.keys(roomVisits).length >= 3 },
    ],
    2: [
      { id: 'find_diary1', text: 'Encontrar pagina do diario (1/3)', check: () => hasItem('diary_page_1') },
      { id: 'find_photo', text: 'Examinar a foto de familia', check: () => hasItem('photo_family') },
      { id: 'find_note', text: 'Ler o bilhete na cozinha', check: () => (interactCounts['note_kitchen']||0) >= 1 },
    ],
    3: [
      { id: 'find_diary2', text: 'Encontrar pagina do diario (2/3)', check: () => hasItem('diary_page_2') },
      { id: 'survive_memories', text: 'Sobreviver aos fragmentos', check: () => (state.flags.visitedMemory||0) >= 2 },
      { id: 'find_chalkboard', text: 'Examinar a lousa', check: () => (interactCounts['chalkboard_living_room']||0) >= 1 },
    ],
    4: [
      { id: 'find_keycard', text: 'Encontrar cartao de acesso', check: () => hasItem('lab_keycard') },
      { id: 'enter_lab', text: 'Entrar no laboratorio', check: () => (roomVisits['laboratory']||0) >= 1 },
      { id: 'find_diary3', text: 'Ler o diario do laboratorio', check: () => hasItem('diary_page_3') },
    ],
    5: [
      { id: 'enter_void', text: 'Entrar na dobra', check: () => (roomVisits['void_room']||0) >= 1 },
      { id: 'final_choice', text: 'Fazer a escolha final', check: () => !!state.ending },
    ],
  };
  function getObjectives() { return OBJECTIVES[state.chapter] || []; }
  function allObjectivesComplete() { return getObjectives().every(o => o.check()); }

  // ===== SHADOW ENTITY =====
  const shadow = { active: false, x: 0, z: 0, targetX: 0, targetZ: 0, speed: 1.5, cooldown: 0, mesh: null };

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
            if(ch.effect.item) addItem(ch.effect.item);
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
    chalkboard:'chalkboard_interact', bathtub:'bathtub_interact',
    sink:'sink_interact', toilet:'toilet_interact',
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
    // Chapter transitions based on objectives
    if(state.chapter===1 && allObjectivesComplete() && !f.ch1done){
      f.ch1done=true;
      DLG.showSeq([
        {text:'Algo mudou. O ar esta mais pesado.', isThought:true},
        {text:'As cores... estao erradas. Preciso investigar mais.', isThought:true},
      ]);
      DLG.onComplete=()=>{loadChapter(2);state.sanity-=10;};
    }
    if(state.chapter===2 && allObjectivesComplete() && !f.ch2done){
      f.ch2done=true;
      DLG.showSeq([
        {text:'Essas anotacoes... esse bilhete... a foto...', isThought:true},
        {text:'Nada faz sentido. Ou faz sentido DEMAIS.', isThought:true},
        {text:'Eu preciso lembrar. Mesmo que doa.', isThought:true},
      ]);
      DLG.onComplete=()=>{loadChapter(3);state.sanity-=15;};
    }
    if(state.chapter===3 && allObjectivesComplete() && !f.ch3done){
      f.ch3done=true;
      DLG.showSeq([
        {text:'O Projeto Observador. O acelerador de particulas.', isThought:true},
        {text:'Eu lembro agora. Eu sou o Dr. Alexandre Meira.', isThought:true},
        {text:'Preciso encontrar o cartao de acesso ao laboratorio.', isThought:true},
      ]);
      DLG.onComplete=()=>loadChapter(4);
    }
    if(state.chapter===4 && allObjectivesComplete() && !f.ch4done){
      f.ch4done=true;
      DLG.showSeq([
        {text:'A funcao de onda nao colapsou. Eu ENTREI na sobreposicao.', isThought:true},
        {text:'Tem mais um lugar. Um lugar que nao deveria existir.', isThought:true},
      ]);
      DLG.onComplete=()=>loadChapter(5);
    }
    if(state.chapter===5 && G.World3D.currentRoomId==='void_room' && !f.endingStarted){
      f.endingStarted=true;
      setTimeout(()=>{
        DLG.showSeq(G.Story.dialogues.void_revelation);
        DLG.onComplete=()=>setTimeout(()=>DLG.showSeq(G.Story.dialogues.final_choice),2000);
      },3000);
    }
    // Memory fragments ch3 - increased frequency + guaranteed timer fallback
    if(state.chapter>=3 && !DLG.active){
      state._memoryTimer = (state._memoryTimer||0) + 0.016;
      const shouldTrigger = Math.random()<0.005 || (state._memoryTimer > 30 && (f.visitedMemory||0) < 2);
      if(shouldTrigger && (f.visitedMemory||0) < 4){
        state._memoryTimer = 0;
        const fr=['memory_wife_death_1','memory_daughter'][Math.floor(Math.random()*2)];
        if(G.Story.dialogues[fr]) {
          DLG.showSeq(G.Story.dialogues[fr]);
          f.visitedMemory=(f.visitedMemory||0)+1;
          state.sanity-=8;
        }
      }
    }
    // Shadow entity activation (chapter 3+)
    if(state.chapter>=3 && !shadow.active && shadow.cooldown<=0 && Math.random()<0.001){
      shadow.active=true; shadow.cooldown=60;
      const def=G.World3D.getRoomDef(G.World3D.currentRoomId);
      if(def){shadow.x=Math.random()*def.width;shadow.z=Math.random()*def.depth;}
    }
    if(shadow.cooldown>0) shadow.cooldown-=0.016;
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
      // Show chapter subtitle
      if(chapterTitleTimer < 3.5) {
        uiCtx.font = '8px "Press Start 2P"';
        uiCtx.fillStyle = `rgba(80,70,90,${Math.min(1,(3.5-chapterTitleTimer)*0.5)})`;
        uiCtx.fillText('Pressione TAB para ver objetivos', (W-250)/2, H/2+30);
      }
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

    // ===== OBJECTIVES (top-left) =====
    const objs = getObjectives();
    if (objs.length > 0) {
      uiCtx.font='7px "Press Start 2P"';
      uiCtx.fillStyle='rgba(60,50,70,0.25)';
      uiCtx.fillText('OBJETIVOS',16,22);
      for(let i=0;i<objs.length;i++){
        const done = objs[i].check();
        uiCtx.fillStyle = done ? 'rgba(40,80,40,0.5)' : 'rgba(80,60,70,0.35)';
        uiCtx.fillText((done?'[x] ':'[ ] ')+objs[i].text, 16, 38+i*14);
      }
    }

    // ===== INVENTORY (TAB toggle) =====
    if(keys['Tab']){keys['Tab']=false; showInventory=!showInventory;}
    if(showInventory && inventory.length > 0){
      const ix=W/2-180, iy=60, iw=360, ih=30+inventory.length*24;
      uiCtx.fillStyle='rgba(8,5,15,0.92)';uiCtx.fillRect(ix,iy,iw,ih);
      uiCtx.strokeStyle='#3a2a18';uiCtx.lineWidth=2;uiCtx.strokeRect(ix,iy,iw,ih);
      uiCtx.font='9px "Press Start 2P"';uiCtx.fillStyle='#8a7060';
      uiCtx.fillText('INVENTARIO [TAB]',ix+10,iy+18);
      for(let i=0;i<inventory.length;i++){
        const it=INV_ITEMS[inventory[i]];
        uiCtx.fillStyle='#6a5a4a';
        uiCtx.fillText(it.icon+' '+it.name,ix+10,iy+40+i*24);
        uiCtx.font='7px "Press Start 2P"';uiCtx.fillStyle='#4a3a30';
        uiCtx.fillText(it.desc,ix+30,iy+52+i*24);
        uiCtx.font='9px "Press Start 2P"';
      }
    } else if(inventory.length>0 && !showInventory){
      uiCtx.font='7px "Press Start 2P"';uiCtx.fillStyle='rgba(60,50,70,0.2)';
      uiCtx.fillText('[TAB] Inventario ('+inventory.length+')',W-170,40);
    }

    // ===== ITEM PICKUP TOAST =====
    if(itemPickupAnim){
      itemPickupAnim.timer-=dt;
      const a=Math.min(1,itemPickupAnim.timer);
      uiCtx.fillStyle=`rgba(10,8,5,${a*0.85})`;
      uiCtx.fillRect(W/2-150,H/2-80,300,40);
      uiCtx.strokeStyle=`rgba(120,100,60,${a})`;uiCtx.lineWidth=1;
      uiCtx.strokeRect(W/2-150,H/2-80,300,40);
      uiCtx.font='9px "Press Start 2P"';
      uiCtx.fillStyle=`rgba(200,180,120,${a})`;
      uiCtx.fillText(itemPickupAnim.icon+' '+itemPickupAnim.name,W/2-130,H/2-55);
      if(itemPickupAnim.timer<=0) itemPickupAnim=null;
    }

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
        // Show if locked
        let doorText = '[E] Abrir porta';
        if(door.targetRoom==='bathroom' && !hasItem('bathroom_key') && state.chapter<=1)
          doorText = '🔒 Trancada (precisa de chave)';
        if(door.targetRoom==='laboratory' && !hasItem('lab_keycard'))
          doorText = '🔒 Acesso restrito (cartao necessario)';
        if(door.targetRoom==='void_room' && state.chapter<5)
          doorText = '🔒 Algo impede a passagem';
        uiCtx.fillText(doorText, W/2 - 75, H/2 + 30);
      }
    }

    // ===== SHADOW WARNING =====
    if(shadow.active){
      const cam=G.World3D.camera;
      if(cam){
        const sdx=shadow.x-cam.position.x, sdz=shadow.z-cam.position.z;
        const dist=Math.sqrt(sdx*sdx+sdz*sdz);
        if(dist<4){
          const intensity=Math.max(0,(4-dist)/4);
          uiCtx.fillStyle=`rgba(0,0,0,${intensity*0.3})`;uiCtx.fillRect(0,0,W,H);
          if(Math.random()<0.1){
            uiCtx.font='10px "Press Start 2P"';
            uiCtx.fillStyle=`rgba(80,0,0,${intensity*0.5})`;
            uiCtx.fillText('Corra.',W/2-25,H/2-50);
          }
        }
      }
    }

    // Sanity effects
    if (state.sanity < 40) {
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
  let stareTarget = null;
  let stareTimer = 0;

  function gameLoop(ts) {
    const dt = Math.min(0.1, (ts-lastTime)/1000); lastTime = ts;

    if (state.mode === 'playing') {
      if (!DLG.active && fadeDir === 0 && chapterTitleTimer <= 0) {
        G.World3D.update(dt, keys, state.sanity);

        const currentTarget = G.World3D.getInteractTarget();
        
        // Staring Mechanic
        if (currentTarget && currentTarget === stareTarget) {
          stareTimer += dt;
          if (stareTimer > 4) { // Stared for 4 seconds
            stareTimer = 0;
            if (state.sanity < 70) {
              state.sanity -= 5;
              DLG.show('Nao deveria olhar tanto para isso...', {isThought: true});
              try { G.Audio.sfx.step(); } catch(e){} // Sudden sound
            }
          }
        } else {
          stareTarget = currentTarget;
          stareTimer = 0;
        }

        // Door check
        if (keys['KeyE']||keys['Enter']) {
          const door = G.World3D.checkDoor();
          if (door) {
            keys['KeyE']=keys['Enter']=false;
            const ch = G.Story.chapters[state.chapter];
            
            // Locked door checks
            if(door.targetRoom==='bathroom' && !hasItem('bathroom_key') && state.chapter<=1){
              DLG.show('A porta esta trancada. Preciso de uma chave.', {isThought:true});
            } else if(door.targetRoom==='laboratory' && !hasItem('lab_keycard')){
              DLG.show('Um leitor de cartao ao lado da porta. Preciso de acesso.', {isThought:true});
            } else if(door.targetRoom==='void_room' && state.chapter<5){
              DLG.show('A porta... nao leva a lugar nenhum. Ainda.', {isThought:true});
            } else {
              // Door Misdirection (Layers of Fear style)
              let finalTargetRoom = door.targetRoom;
              if (state.sanity < 40 && Math.random() < 0.2 && state.chapter >= 3) {
                const options = [G.World3D.currentRoomId, 'hallway'];
                finalTargetRoom = options[Math.floor(Math.random() * options.length)];
              }
              if(ch && ch.availableRooms.includes(finalTargetRoom)) {
                transitionTo(finalTargetRoom, door.targetX, door.targetZ);
              } else if(!DLG.active) {
                DLG.show('A porta nao abre. Algo a impede.', {isThought:true});
              }
            }
          }
          // Object interaction
          if (currentTarget && !door) {
            keys['KeyE']=keys['Enter']=false;
            stareTimer = 0;
            const ik = currentTarget + '_' + G.World3D.currentRoomId;
            interactCounts[ik] = (interactCounts[ik]||0)+1;
            const count = interactCounts[ik];
            let dk = INTERACT_MAP[currentTarget];
            
            // Item collection based on interaction
            if(currentTarget==='nightstand' && count===1) addItem('bathroom_key');
            if(currentTarget==='photo' && count===1) addItem('photo_family');
            if(currentTarget==='pills' && count===1) addItem('pill_bottle');
            if(currentTarget==='bookshelf' && count>=2 && !hasItem('diary_page_1')) addItem('diary_page_1');
            if(currentTarget==='couch' && count>=2 && state.chapter>=2 && !hasItem('diary_page_2')) addItem('diary_page_2');
            if(currentTarget==='desk' && count>=1 && state.chapter>=4 && !hasItem('lab_keycard')) addItem('lab_keycard');
            
            // Register special objective keys
            if(currentTarget==='chalkboard') interactCounts['chalkboard_living_room'] = (interactCounts['chalkboard_living_room']||0)+1;
            if(currentTarget==='note' && G.World3D.currentRoomId==='kitchen') interactCounts['note_kitchen'] = (interactCounts['note_kitchen']||0)+1;
            
            if(currentTarget==='mirror'&&count>1) dk=count>2?'mirror_interact_3':'mirror_interact_2';
            if(currentTarget==='photo'&&count>1) dk='photo_interact_2';
            if(currentTarget==='pills'&&count>1) dk='pills_interact_2';
            if(currentTarget==='note'&&G.World3D.currentRoomId==='laboratory') {
              dk=count>1?'lab_note_2':'lab_note_1';
              state.flags.foundLabNote=true;
              if(!hasItem('diary_page_3')) addItem('diary_page_3');
            }
            // Handle furniture with no explicit INTERACT_MAP entry
            if(!dk) {
              const fallbackDialogues = {
                'sink': [{text:'A torneira pinga. Cada gota ecoa no silencio.', isThought:true}],
                'toilet': [{text:'O vaso. A porcelana esta amarelada pelo tempo.', isThought:true}],
                'bathtub': [{text:'A banheira tem uma mancha. Ferrugem? Ou sera...', isThought:true}],
                'wardrobe': [{text:'O armario esta trancado. Algo la dentro range.', isThought:true}],
                'counter': [{text:'A bancada da cozinha. Marcas de uso antigo.', isThought:true}],
                'fridge': [{text:'A geladeira zumbe. As datas dos alimentos nao fazem sentido.', isThought:true}],
                'stove': [{text:'O fogao esta frio. Poeira cobre as bocas.', isThought:true}],
                'table': [{text:'Marcas de copos na mesa. Dezenas deles. Sobrepostos.', isThought:true}],
                'labEquip': [{text:'Equipamento de laboratorio. Monitores com funcoes de onda.', isThought:true}],
                'labConsole': [{text:'Console de controle. Os dados sao meus. Meu codigo.', isThought:true}],
              };
              if(fallbackDialogues[currentTarget]) {
                DLG.showSeq(JSON.parse(JSON.stringify(fallbackDialogues[currentTarget])));
              }
            }
            if(dk&&G.Story.dialogues[dk]) {
              DLG.showSeq(JSON.parse(JSON.stringify(G.Story.dialogues[dk])));
              if(currentTarget==='mirror'&&count>=2) state.sanity-=8;
              if(currentTarget==='tv') state.sanity-=3;
            }
          }
        }

        // Shadow entity movement & damage
        if(shadow.active){
          const cam=G.World3D.camera;
          if(cam){
            shadow.targetX=cam.position.x; shadow.targetZ=cam.position.z;
            const sdx=shadow.targetX-shadow.x, sdz=shadow.targetZ-shadow.z;
            const dist=Math.sqrt(sdx*sdx+sdz*sdz);
            if(dist>0.5){
              shadow.x+=sdx/dist*shadow.speed*dt;
              shadow.z+=sdz/dist*shadow.speed*dt;
            }
            if(dist<1.5){
              state.sanity-=dt*15; // Drain sanity fast
              if(Math.random()<0.02 && !DLG.active){
                const msgs=['Sinto frio.','Algo me observa.','Nao consigo me mexer.','ELA esta aqui.'];
                DLG.show(msgs[Math.floor(Math.random()*msgs.length)],{isThought:true});
              }
            }
            if(dist<0.3 || state.sanity<=0){
              shadow.active=false;
              state.sanity=Math.max(5,state.sanity);
              DLG.showSeq([
                {text:'...', isThought:true},
                {text:'Acordei no chao. Suando. Quanto tempo se passou?', isThought:true},
              ]);
              // Teleport player to bedroom
              loadRoom('bedroom');
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
    inventory.length = 0;
    showInventory = false;
    shadow.active = false; shadow.cooldown = 0;
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
