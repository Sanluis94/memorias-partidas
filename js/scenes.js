/* ===== SCENES - Room Management, Transitions, Events ===== */
(function() {
  'use strict';

  const Scenes = {
    currentRoom: null,
    currentRoomId: '',
    chapter: 1,
    fadeAlpha: 0,
    fadeDir: 0,
    fadeCallback: null,
    pendingTransition: null,
    interactionCounts: {},
    chapterEvents: [],
    eventIndex: 0,
    eventTimer: 0,
    chapterTitleTimer: 0,
    chapterTitleText: '',
    pillColor: '#e94560',

    init() {
      this.chapter = 1;
      this.eventTimer = 0;
      this.chapterTitleTimer = 4;
      this.fadeAlpha = 0;
      this.fadeDir = 0;
      this.interactionCounts = {};
      this.loadChapter(1);
    },

    loadChapter(num) {
      this.chapter = num;
      const ch = G.Story.chapters[num];
      if (!ch) return;

      this.chapterEvents = ch.events.slice();
      this.eventIndex = 0;
      this.eventTimer = 0;
      this.chapterTitleText = 'Capitulo ' + num + ': ' + ch.name;
      this.chapterTitleTimer = 4;
      this.pillColor = G.Story.getRandomPillColor();
      this.loadRoom(ch.startRoom);

      if (num >= 2) {
        this._setupFloatingObjects();
      }
    },

    loadRoom(roomId, spawnX, spawnY) {
      const room = G.Story.rooms[roomId];
      if (!room) return;

      this.currentRoom = room;
      this.currentRoomId = roomId;

      if (spawnX !== undefined && spawnY !== undefined) {
        G.Player.init(spawnX, spawnY);
      }

      G.Effects.floatOffsets = {};

      if (this.chapter >= 2) {
        this._setupFloatingObjects();
      }
    },

    _setupFloatingObjects() {
      if (!this.currentRoom) return;
      const map = this.currentRoom.map;
      const floatables = 'ETCINAK';
      for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
          if (floatables.includes(map[y][x]) && Math.random() < 0.3 * (this.chapter / 5)) {
            G.Effects.addFloatObject(y * 20 + x);
          }
        }
      }
    },

    transition(roomId, spawnX, spawnY) {
      this.pendingTransition = { roomId, spawnX, spawnY };
      this.fadeDir = 1;
      this.fadeAlpha = 0;
      G.Audio.sfx.door();
    },

    update(dt, keys) {
      // Chapter title display
      if (this.chapterTitleTimer > 0) {
        this.chapterTitleTimer -= dt;
        return;
      }

      // Fade transitions
      if (this.fadeDir !== 0) {
        this.fadeAlpha += this.fadeDir * dt * 3;
        if (this.fadeAlpha >= 1 && this.fadeDir === 1) {
          if (this.pendingTransition) {
            this.loadRoom(
              this.pendingTransition.roomId,
              this.pendingTransition.spawnX,
              this.pendingTransition.spawnY
            );
            this.pendingTransition = null;
          }
          this.fadeDir = -1;
        }
        if (this.fadeAlpha <= 0 && this.fadeDir === -1) {
          this.fadeAlpha = 0;
          this.fadeDir = 0;
        }
        return;
      }

      // Chapter events
      if (this.chapterEvents.length > 0) {
        this.eventTimer += dt;
        if (this.eventTimer > 6 + Math.random() * 10) {
          this.eventTimer = 0;
          const event = this.chapterEvents.shift();
          if (G.Story.dialogues[event] && !G.Dialogue.active) {
            G.Dialogue.showSequence(G.Story.dialogues[event]);
            if (event === 'floating_object') G.Sanity.change(-5, 'floating');
            if (event === 'static_event') { G.Sanity.change(-8, 'static'); G.Audio.playStatic(0.5, 0.1); }
          }
        }
      }

      // Handle interaction
      if ((keys['Enter'] || keys['KeyE']) && !G.Dialogue.active && G.Player.canInteract()) {
        const facing = G.Player.getFacingTile();
        this._handleInteraction(facing, keys);
      }

      // Door collision
      this._checkDoors();

      // Random events
      this._randomEvents(dt);
    },

    _handleInteraction(facing, keys) {
      if (!this.currentRoom || !facing) return;
      const map = this.currentRoom.map;
      if (facing.y < 0 || facing.y >= map.length || facing.x < 0 || facing.x >= map[facing.y].length) return;

      const tile = map[facing.y][facing.x];
      if (tile === '.' || tile === '#' || tile === 'Z') return;

      G.Player.doInteract();
      keys['Enter'] = false;
      keys['KeyE'] = false;

      const key = tile + '_' + facing.y + '_' + facing.x;
      this.interactionCounts[key] = (this.interactionCounts[key] || 0) + 1;
      const count = this.interactionCounts[key];

      const dialogueMap = {
        'B': ['bed_interact'],
        'I': ['nightstand_interact'],
        'E': ['lamp_interact'],
        'A': ['bookshelf_interact'],
        'W': ['window_interact'],
        'F': count <= 1 ? ['photo_interact_1'] : ['photo_interact_2'],
        'M': count <= 1 ? ['mirror_interact_1'] : (count <= 2 ? ['mirror_interact_2'] : ['mirror_interact_3']),
        'P': count <= 1 ? ['pills_interact_1'] : ['pills_interact_2'],
        'V': ['tv_interact_1'],
        'H': ['couch_interact'],
        'R': ['fridge_interact'],
        'O': ['stove_interact'],
        'T': this.currentRoomId === 'kitchen' ? ['kitchen_table_interact'] : ['lab_equipment_interact'],
        'N': this.currentRoomId === 'kitchen' ? ['note1_interact'] : (count <= 1 ? ['lab_note_1'] : ['lab_note_2']),
        'L': [{ text: 'Um vaso sanitario. Nada de interessante.', isThought: true }],
        'U': [{ text: 'A banheira esta vazia. Fria.', isThought: true }],
        'K': [{ text: 'A torneira pinga. Constantemente.', isThought: true }],
        'X': ['lab_equipment_interact'],
        'Q': ['lab_equipment_interact'],
      };

      const dialogueKey = dialogueMap[tile];
      if (!dialogueKey) return;

      const dialogues = typeof dialogueKey[0] === 'string'
        ? G.Story.dialogues[dialogueKey[0]]
        : dialogueKey;

      if (dialogues) {
        G.Audio.sfx.interact();
        G.Dialogue.showSequence(JSON.parse(JSON.stringify(dialogues)));

        if (tile === 'M' && count >= 2) G.Sanity.change(-8, 'mirror');
        if (tile === 'F' && count >= 2) G.Sanity.change(-5, 'photo_change');
        if (tile === 'V') G.Sanity.change(-3, 'tv');
        if (tile === 'P') this.pillColor = G.Story.getRandomPillColor();

        if (tile === 'N' && this.currentRoomId === 'laboratory') {
          G.state.flags.foundLabNote = true;
          G.state.flags.notesFound = (G.state.flags.notesFound || 0) + 1;
          if (G.state.flags.notesFound >= 2) G.state.flags.foundAllNotes = true;
        }
      }
    },

    _checkDoors() {
      if (!this.currentRoom || this.fadeDir !== 0) return;

      const pos = G.Player.getTilePos();
      const map = this.currentRoom.map;

      if (pos.y < 0 || pos.y >= map.length || pos.x < 0 || pos.x >= map[pos.y].length) return;
      const tile = map[pos.y][pos.x];

      if (tile === 'D') {
        // Try to find the matching door
        let door = null;
        const isTopRow = pos.y <= 1;
        const isBottomRow = pos.y >= map.length - 2;

        // Try keys in order: specific key with direction, then simple key
        const tryKeys = [
          'D_' + pos.x + (isTopRow ? '_top' : '_bot'),
          'D_' + pos.x,
          'D_' + pos.y,
        ];

        for (const k of tryKeys) {
          if (this.currentRoom.doors[k]) {
            door = this.currentRoom.doors[k];
            break;
          }
        }

        if (door) {
          const targetRoom = door.target;
          const ch = G.Story.chapters[this.chapter];
          if (ch && !ch.availableRooms.includes(targetRoom)) {
            if (!G.Dialogue.active) {
              G.Dialogue.show('Essa porta nao abre.', { isThought: true });
            }
            return;
          }

          this.transition(door.target, door.spawnX, door.spawnY);
          this._checkChapterProgress();
        }
      }
    },

    _checkChapterProgress() {
      const flags = G.state.flags;
      if (this.chapter === 1 && (flags.tookPill1 || flags.refusedPill1)) {
        if (this.interactionCounts && Object.keys(this.interactionCounts).length >= 3) {
          flags.ch1_complete = true;
          if (!flags.ch2_started) {
            flags.ch2_started = true;
            setTimeout(() => {
              this.loadChapter(2);
              G.Sanity.change(-10, 'chapter2_start');
            }, 1000);
          }
        }
      }
      if (this.chapter === 2 && this.chapterEvents.length === 0) {
        if (!flags.ch2_complete) {
          flags.ch2_complete = true;
          setTimeout(() => {
            this.loadChapter(3);
            G.Sanity.change(-15, 'chapter3_start');
          }, 2000);
        }
      }
      if (this.chapter === 3) {
        const visited = flags.visitedMemory || 0;
        if (visited >= 1 && !flags.ch3_complete) {
          flags.ch3_complete = true;
          setTimeout(() => this.loadChapter(4), 2000);
        }
      }
      if (this.chapter === 4 && flags.foundLabNote && !flags.ch4_complete) {
        flags.ch4_complete = true;
        setTimeout(() => this.loadChapter(5), 2000);
      }
      if (this.chapter === 5 && this.currentRoomId === 'void_room' && !flags.endingStarted) {
        flags.endingStarted = true;
        setTimeout(() => {
          G.Dialogue.showSequence(G.Story.dialogues.void_revelation);
          setTimeout(() => {
            if (!G.Dialogue.active) {
              G.Dialogue.showSequence(G.Story.dialogues.final_choice);
            }
          }, 15000);
        }, 2000);
      }
    },

    _randomEvents(dt) {
      if (this.chapter < 2 || G.Dialogue.active) return;
      if (Math.random() < 0.001 * this.chapter) {
        G.Audio.playStatic(0.1 + Math.random() * 0.2, 0.04);
      }
      if (G.Sanity.value < 40 && Math.random() < 0.002) {
        G.Audio.sfx.whisper();
      }
      if (this.chapter === 3 && Math.random() < 0.0005 && !G.Dialogue.active) {
        const fragments = ['memory_wife_death_1', 'memory_daughter'];
        const frag = fragments[Math.floor(Math.random() * fragments.length)];
        if (G.Story.dialogues[frag]) {
          G.Dialogue.showSequence(G.Story.dialogues[frag]);
          G.state.flags.visitedMemory = (G.state.flags.visitedMemory || 0) + 1;
          G.Sanity.change(-10, 'memory_fragment');
          G.Effects.triggerShake(0.5);
        }
      }
    },

    render(ctx) {
      if (!this.currentRoom) return;

      G.Renderer.drawRoom(this.currentRoom.map, this.pillColor);
      G.Player.render(ctx, G.Sanity.value);

      // Darkness overlay
      const px = G.Player.x + 12;
      const py = G.Player.y + 12;
      const radius = this.currentRoom.darkRadius || 130;
      const adjustedRadius = radius * (0.7 + (G.Sanity.value / 100) * 0.3);
      G.Renderer.drawDarkness(px, py, adjustedRadius);

      // Coherence bar
      G.Renderer.drawCoherenceBar(G.Sanity.value);

      // Room name
      if (this.currentRoom.name) {
        G.Renderer.drawText(this.currentRoom.name, 6, 14, 'rgba(120,120,140,0.5)', 6);
      }

      // Fade
      if (this.fadeAlpha > 0) {
        G.Renderer.drawFade(this.fadeAlpha);
      }

      // Chapter title
      if (this.chapterTitleTimer > 0) {
        G.Renderer.drawFade(Math.min(1, this.chapterTitleTimer / 0.5));
        const alpha = Math.min(1, this.chapterTitleTimer);
        ctx.font = '14px "Press Start 2P"';
        ctx.fillStyle = `rgba(200,168,96,${alpha})`;
        const tw = ctx.measureText(this.chapterTitleText).width;
        ctx.fillText(this.chapterTitleText, (480 - tw) / 2, 130);
      }
    },
  };

  window.G = window.G || {};
  window.G.Scenes = Scenes;
})();
