/* ===== SCENES - Layers of Fear inspired ===== */
(function() {
  'use strict';

  // Room variants - rooms change when revisited
  const ROOM_MUTATIONS = {
    bedroom: [
      null, // original
      { // visit 2+: bed is unmade, new note appears
        changes: [[3,10,'N'],[4,10,'.'],[1,9,'.'],[1,10,'.']],
        dialogue: 'bed_moved',
      },
      { // visit 3+: furniture rearranged, mirror on wrong wall
        changes: [[2,16,'M'],[4,4,'.'],[6,1,'.'],[3,15,'B'],[3,16,'B']],
        dialogue: 'room_wrong',
      },
    ],
    hallway: [
      null,
      { changes: [[6,10,'N'],[5,5,'.']], dialogue: 'hallway_changed' },
      { changes: [[3,8,'F'],[4,8,'F'],[5,8,'F']], dialogue: 'hallway_photos' },
    ],
    bathroom: [
      null,
      { changes: [[4,10,'.'],[4,11,'M'],[4,12,'M']], dialogue: 'mirror_multiplied' },
    ],
    living_room: [
      null,
      { changes: [[7,4,'N'],[7,5,'N']], dialogue: 'notes_appeared' },
    ],
    kitchen: [
      null,
      { changes: [[4,5,'N'],[4,6,'N'],[4,7,'N']], dialogue: 'kitchen_notes' },
    ],
  };

  // Mutation dialogues
  const MUTATION_DIALOGUES = {
    bed_moved: [
      { text: 'A cama... nao estava ali antes.', isThought: true },
      { text: 'E esse bilhete no chao? Quando apareceu?', isThought: true },
    ],
    room_wrong: [
      { text: 'O quarto esta ERRADO.', isThought: true },
      { text: 'Os moveis mudaram de lugar. O espelho migrou de parede.', isThought: true },
      { text: 'Eu nao fiz isso. QUEM fez isso?', isThought: true },
    ],
    hallway_changed: [
      { text: 'Tinha um bilhete no chao do corredor.', isThought: true },
      { text: 'Ele nao estava aqui quando passei antes. Tenho certeza.', isThought: true },
    ],
    hallway_photos: [
      { text: 'Fotos. Na parede do corredor. DEZENAS de fotos.', isThought: true },
      { text: 'Todas de mim. Em lugares que nao reconheco.', isThought: true },
      { text: 'Com pessoas que nao lembro.', isThought: true },
    ],
    mirror_multiplied: [
      { text: 'Agora tem DOIS espelhos no banheiro?', isThought: true },
      { text: 'O reflexo em cada um e diferente.', isThought: true },
      { text: 'Em um eu estou chorando. No outro, sorrindo.', isThought: true },
    ],
    notes_appeared: [
      { text: 'Bilhetes na mesa de centro. Minha caligrafia.', isThought: true },
      { text: 'Mas eu nao me lembro de ter escrito NADA disso.', isThought: true },
    ],
    kitchen_notes: [
      { text: 'A cozinha esta coberta de bilhetes.', isThought: true },
      { text: 'Todos dizem a mesma coisa:', isThought: true },
      { text: '"LEMBRE. LEMBRE. LEMBRE."', isThought: true },
    ],
  };

  // Environmental horror events
  const AMBIENT_EVENTS = [
    { type: 'sound', fn: (G) => { G.Audio.sfx.whisper(); }, minChapter: 2, chance: 0.0008 },
    { type: 'sound', fn: (G) => { G.Audio.playStatic(0.08, 0.05); }, minChapter: 1, chance: 0.001 },
    { type: 'shake', fn: (G) => { G.Effects.triggerShake(0.2, 2); }, minChapter: 2, chance: 0.0003 },
    { type: 'sanity', fn: (G) => { G.Sanity.change(-2, 'ambient_dread'); }, minChapter: 2, chance: 0.0005 },
    { type: 'light', fn: (G) => { G.Effects.flickerTimer = 0.3; }, minChapter: 1, chance: 0.002 },
  ];

  const Scenes = {
    currentRoom: null,
    currentRoomId: '',
    chapter: 1,
    fadeAlpha: 0,
    fadeDir: 0,
    pendingTransition: null,
    interactionCounts: {},
    chapterEvents: [],
    eventTimer: 0,
    chapterTitleTimer: 0,
    chapterTitleText: '',
    pillColor: '#8a1020',
    roomVisits: {},
    misdirectTimer: 0,
    ambientTimer: 0,

    init() {
      this.chapter = 1;
      this.eventTimer = 0;
      this.chapterTitleTimer = 5;
      this.fadeAlpha = 0;
      this.fadeDir = 0;
      this.interactionCounts = {};
      this.roomVisits = {};
      this.misdirectTimer = 0;
      this.loadChapter(1);
    },

    loadChapter(num) {
      this.chapter = num;
      const ch = G.Story.chapters[num];
      if (!ch) return;
      this.chapterEvents = ch.events.slice();
      this.eventTimer = 0;
      this.chapterTitleText = 'Capitulo ' + num + ': ' + ch.name;
      this.chapterTitleTimer = 5;
      this.pillColor = G.Story.getRandomPillColor();
      this.loadRoom(ch.startRoom);
    },

    loadRoom(roomId, spawnX, spawnY) {
      const roomDef = G.Story.rooms[roomId];
      if (!roomDef) return;

      // Deep copy map for mutation
      const map = roomDef.map.map(row => row.split(''));

      // Track visits
      this.roomVisits[roomId] = (this.roomVisits[roomId] || 0) + 1;
      const visits = this.roomVisits[roomId];

      // Apply mutations based on visit count
      const mutations = ROOM_MUTATIONS[roomId];
      let mutationDialogue = null;
      if (mutations && visits > 1 && this.chapter >= 2) {
        const mutIdx = Math.min(visits - 1, mutations.length - 1);
        const mut = mutations[mutIdx];
        if (mut) {
          for (const [y, x, tile] of mut.changes) {
            if (y < map.length && x < map[y].length) map[y][x] = tile;
          }
          if (mut.dialogue && !this.interactionCounts['mut_' + roomId + '_' + mutIdx]) {
            mutationDialogue = mut.dialogue;
            this.interactionCounts['mut_' + roomId + '_' + mutIdx] = true;
          }
        }
      }

      // Convert back to strings
      this.currentRoom = {
        name: roomDef.name,
        map: map.map(row => row.join('')),
        doors: roomDef.doors,
        darkRadius: roomDef.darkRadius,
      };
      this.currentRoomId = roomId;

      if (spawnX !== undefined) G.Player.init(spawnX, spawnY);

      G.Effects.floatOffsets = {};
      if (this.chapter >= 2) this._setupFloating();

      // Show mutation dialogue after short delay
      if (mutationDialogue && MUTATION_DIALOGUES[mutationDialogue]) {
        setTimeout(() => {
          if (!G.Dialogue.active) {
            G.Dialogue.showSequence(MUTATION_DIALOGUES[mutationDialogue]);
            G.Sanity.change(-5, 'room_mutated');
            G.Effects.triggerShake(0.3, 3);
          }
        }, 800);
      }
    },

    _setupFloating() {
      if (!this.currentRoom) return;
      const map = this.currentRoom.map;
      const fl = 'ETCINA';
      for (let y = 0; y < map.length; y++)
        for (let x = 0; x < map[y].length; x++)
          if (fl.includes(map[y][x]) && Math.random() < 0.2 * (this.chapter / 4))
            G.Effects.addFloatObject(y * 20 + x);
    },

    transition(roomId, spawnX, spawnY) {
      // Layers of Fear misdirection: sometimes doors lead elsewhere
      let targetRoom = roomId;
      if (this.chapter >= 3 && Math.random() < 0.08 * (this.chapter - 2)) {
        const ch = G.Story.chapters[this.chapter];
        if (ch) {
          const rooms = ch.availableRooms.filter(r => r !== this.currentRoomId && r !== roomId);
          if (rooms.length > 0) {
            targetRoom = rooms[Math.floor(Math.random() * rooms.length)];
            this.misdirectTimer = 2; // flag for disorientation dialogue
          }
        }
      }

      this.pendingTransition = { roomId: targetRoom, spawnX, spawnY };
      this.fadeDir = 1;
      this.fadeAlpha = 0;
      G.Audio.sfx.door();
    },

    update(dt, keys) {
      // Chapter title
      if (this.chapterTitleTimer > 0) { this.chapterTitleTimer -= dt; return; }

      // Fade
      if (this.fadeDir !== 0) {
        this.fadeAlpha += this.fadeDir * dt * 2.5;
        if (this.fadeAlpha >= 1 && this.fadeDir === 1) {
          if (this.pendingTransition) {
            this.loadRoom(this.pendingTransition.roomId, this.pendingTransition.spawnX, this.pendingTransition.spawnY);
            this.pendingTransition = null;
          }
          this.fadeDir = -1;
        }
        if (this.fadeAlpha <= 0 && this.fadeDir === -1) { this.fadeAlpha = 0; this.fadeDir = 0; }
        return;
      }

      // Misdirection dialogue
      if (this.misdirectTimer > 0) {
        this.misdirectTimer -= dt;
        if (this.misdirectTimer <= 0 && !G.Dialogue.active) {
          G.Dialogue.showSequence([
            { text: 'Espera... esse nao e o comodo que eu escolhi.', isThought: true },
            { text: 'A porta me trouxe para o lugar errado?', isThought: true },
            { text: 'Ou eu SEMPRE estive aqui?', isThought: true },
          ]);
          G.Sanity.change(-6, 'misdirect');
        }
      }

      // Chapter story events (timed)
      if (this.chapterEvents.length > 0) {
        this.eventTimer += dt;
        if (this.eventTimer > 8 + Math.random() * 15) {
          this.eventTimer = 0;
          const ev = this.chapterEvents.shift();
          if (G.Story.dialogues[ev] && !G.Dialogue.active) {
            G.Dialogue.showSequence(G.Story.dialogues[ev]);
            G.Effects.triggerShake(0.4, 4);
            G.Audio.playStatic(0.15, 0.08);
            if (ev === 'floating_object') G.Sanity.change(-5, 'floating');
            if (ev === 'static_event') G.Sanity.change(-8, 'static');
          }
        }
      }

      // Ambient horror events (Layers of Fear style)
      this.ambientTimer += dt;
      if (this.ambientTimer > 1) {
        this.ambientTimer = 0;
        for (const evt of AMBIENT_EVENTS) {
          if (this.chapter >= evt.minChapter && Math.random() < evt.chance * this.chapter) {
            evt.fn(G);
          }
        }
      }

      // Interaction
      if ((keys['Enter'] || keys['KeyE']) && !G.Dialogue.active && G.Player.canInteract()) {
        this._handleInteraction(G.Player.getFacingTile(), keys);
      }

      this._checkDoors();
      this._checkChapterProgress();
    },

    _handleInteraction(facing, keys) {
      if (!this.currentRoom || !facing) return;
      const map = this.currentRoom.map;
      if (facing.y < 0 || facing.y >= map.length || facing.x < 0 || facing.x >= map[facing.y].length) return;
      const tile = map[facing.y][facing.x];
      if (tile === '.' || tile === '#' || tile === 'Z' || tile === 'D') return;

      G.Player.doInteract();
      keys['Enter'] = false; keys['KeyE'] = false;

      const key = tile + '_' + this.currentRoomId + '_' + facing.y + '_' + facing.x;
      this.interactionCounts[key] = (this.interactionCounts[key] || 0) + 1;
      const count = this.interactionCounts[key];

      // Determine dialogue based on tile, room, count
      let dialogueKey = null;
      switch (tile) {
        case 'B': dialogueKey = 'bed_interact'; break;
        case 'I': dialogueKey = 'nightstand_interact'; break;
        case 'E': dialogueKey = 'lamp_interact'; break;
        case 'A': dialogueKey = 'bookshelf_interact'; break;
        case 'W': dialogueKey = 'window_interact'; break;
        case 'F':
          if (this.currentRoomId === 'hallway') dialogueKey = 'hallway_photo_interact';
          else dialogueKey = count <= 1 ? 'photo_interact_1' : 'photo_interact_2';
          break;
        case 'M': dialogueKey = count <= 1 ? 'mirror_interact_1' : (count <= 2 ? 'mirror_interact_2' : 'mirror_interact_3'); break;
        case 'P': dialogueKey = count <= 1 ? 'pills_interact_1' : 'pills_interact_2'; break;
        case 'V': dialogueKey = 'tv_interact_1'; break;
        case 'H': dialogueKey = 'couch_interact'; break;
        case 'R': dialogueKey = 'fridge_interact'; break;
        case 'O': dialogueKey = 'stove_interact'; break;
        case 'T': dialogueKey = this.currentRoomId === 'kitchen' ? 'kitchen_table_interact' : (this.currentRoomId === 'laboratory' ? 'lab_equipment_interact' : 'kitchen_table_interact'); break;
        case 'N': dialogueKey = this.currentRoomId === 'laboratory' ? (count <= 1 ? 'lab_note_1' : 'lab_note_2') : 'note1_interact'; break;
        case 'X': case 'Q': dialogueKey = 'lab_equipment_interact'; break;
        case 'K': dialogueKey = null; break;
        case 'L': dialogueKey = null; break;
        case 'U': dialogueKey = null; break;
        case 'C': dialogueKey = null; break;
        case 'S': dialogueKey = null; break;
        case 'G': dialogueKey = null; break;
      }

      // Fallback inline dialogues
      const inlineFallbacks = {
        'K': [{ text: 'A torneira pinga. Cada gota ecoa no silencio.', isThought: true }, { text: 'Pinga. Pinga. Pinga. Ritmico. Quase como um relogio.', isThought: true }],
        'L': [{ text: 'O vaso. A porcelana esta amarelada pelo tempo.', isThought: true }],
        'U': [{ text: 'A banheira tem uma mancha de ferrugem. Ou sera sangue seco?', isThought: true }, { text: 'Nao. Ferrugem. So ferrugem.', isThought: true }],
        'C': [{ text: 'Uma cadeira. Gasta. Marcas de unhas no apoio de braco.', isThought: true }],
        'S': [{ text: 'O armario esta trancado. Algo la dentro range quando empurro.', isThought: true }],
        'G': [{ text: 'O tapete esta desbotado. Manchas escuras no centro.', isThought: true }],
      };

      let dialogues = null;
      if (dialogueKey && G.Story.dialogues[dialogueKey]) {
        dialogues = G.Story.dialogues[dialogueKey];
      } else if (inlineFallbacks[tile]) {
        dialogues = inlineFallbacks[tile];
      }

      if (dialogues) {
        G.Audio.sfx.interact();
        G.Dialogue.showSequence(JSON.parse(JSON.stringify(dialogues)));

        if (tile === 'M' && count >= 2) G.Sanity.change(-8, 'mirror');
        if (tile === 'F' && count >= 2) G.Sanity.change(-5, 'photo');
        if (tile === 'V') G.Sanity.change(-3, 'tv');
        if (tile === 'P') this.pillColor = G.Story.getRandomPillColor();
        if (tile === 'N' && this.currentRoomId === 'laboratory') {
          G.state.flags.foundLabNote = true;
          G.state.flags.notesFound = (G.state.flags.notesFound || 0) + 1;
        }
      }
    },

    _checkDoors() {
      if (!this.currentRoom || this.fadeDir !== 0) return;
      const pos = G.Player.getTilePos();
      const map = this.currentRoom.map;
      if (pos.y < 0 || pos.y >= map.length || pos.x < 0 || pos.x >= map[pos.y].length) return;
      if (map[pos.y][pos.x] !== 'D') return;

      const isTop = pos.y <= 1, isBot = pos.y >= map.length - 2;
      const tryKeys = ['D_' + pos.x + (isTop ? '_top' : '_bot'), 'D_' + pos.x];
      let door = null;
      for (const k of tryKeys) { if (this.currentRoom.doors[k]) { door = this.currentRoom.doors[k]; break; } }

      if (door) {
        const ch = G.Story.chapters[this.chapter];
        if (ch && !ch.availableRooms.includes(door.target)) {
          if (!G.Dialogue.active) G.Dialogue.show('A porta nao abre. Algo a impede do outro lado.', { isThought: true });
          return;
        }
        this.transition(door.target, door.spawnX, door.spawnY);
      }
    },

    _checkChapterProgress() {
      const f = G.state.flags;
      if (this.chapter === 1 && (f.tookPill1 || f.refusedPill1) && Object.keys(this.interactionCounts).length >= 4) {
        if (!f.ch1_complete) {
          f.ch1_complete = true;
          setTimeout(() => { this.loadChapter(2); G.Sanity.change(-10, 'ch2'); }, 1500);
        }
      }
      if (this.chapter === 2 && this.chapterEvents.length === 0 && !f.ch2_complete) {
        f.ch2_complete = true;
        setTimeout(() => { this.loadChapter(3); G.Sanity.change(-15, 'ch3'); }, 2000);
      }
      if (this.chapter === 3) {
        const v = f.visitedMemory || 0;
        if (v >= 1 && !f.ch3_complete) {
          f.ch3_complete = true;
          setTimeout(() => this.loadChapter(4), 2500);
        }
      }
      if (this.chapter === 4 && f.foundLabNote && !f.ch4_complete) {
        f.ch4_complete = true;
        setTimeout(() => this.loadChapter(5), 2500);
      }
      if (this.chapter === 5 && this.currentRoomId === 'void_room' && !f.endingStarted) {
        f.endingStarted = true;
        setTimeout(() => {
          G.Dialogue.showSequence(G.Story.dialogues.void_revelation);
          G.Dialogue.onComplete = () => {
            setTimeout(() => G.Dialogue.showSequence(G.Story.dialogues.final_choice), 2000);
          };
        }, 3000);
      }

      // Memory fragments in ch3
      if (this.chapter === 3 && !G.Dialogue.active && Math.random() < 0.0004) {
        const frags = ['memory_wife_death_1', 'memory_daughter'];
        const frag = frags[Math.floor(Math.random() * frags.length)];
        G.Dialogue.showSequence(G.Story.dialogues[frag]);
        f.visitedMemory = (f.visitedMemory || 0) + 1;
        G.Sanity.change(-10, 'memory');
        G.Effects.triggerShake(0.6, 5);
      }
    },

    render(ctx) {
      if (!this.currentRoom) return;
      G.Renderer.drawRoom(this.currentRoom.map, this.pillColor);
      G.Player.render(ctx, G.Sanity.value);

      const px = G.Player.x + 12, py = G.Player.y + 12;
      const r = (this.currentRoom.darkRadius || 120) * (0.6 + (G.Sanity.value / 100) * 0.4);
      G.Renderer.drawDarkness(px, py, r);
      G.Renderer.drawCoherenceBar(G.Sanity.value);

      if (this.currentRoom.name) G.Renderer.drawText(this.currentRoom.name, 6, 14, 'rgba(60,50,70,0.4)', 5);
      if (this.fadeAlpha > 0) G.Renderer.drawFade(this.fadeAlpha);

      if (this.chapterTitleTimer > 0) {
        G.Renderer.drawFade(Math.min(1, this.chapterTitleTimer / 0.8));
        const a = Math.min(1, this.chapterTitleTimer * 0.3);
        ctx.font = '12px "Press Start 2P"';
        ctx.fillStyle = `rgba(100,40,50,${a})`;
        const tw = ctx.measureText(this.chapterTitleText).width;
        ctx.fillText(this.chapterTitleText, (480 - tw) / 2, 135);
      }
    },
  };

  window.G = window.G || {};
  window.G.Scenes = Scenes;
})();
