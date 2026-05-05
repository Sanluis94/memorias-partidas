/* ===== WORLD3D - Three.js First-Person Horror Engine ===== */
(function() {
  'use strict';

  const WALL_H = 3;
  const ROOM_SCALE = 1;

  // Room definitions: walls as line segments, doors as openings
  const ROOM_DEFS = {
    bedroom: {
      width: 8, depth: 6,
      walls: [
        // Format: [x1,z1, x2,z2] - wall segments
        [0,0, 8,0],     // north wall
        [8,0, 8,6],     // east wall
        [0,0, 0,6],     // west wall
        [0,6, 3,6],     // south wall left of door
        [4,6, 8,6],     // south wall right of door
      ],
      door: { x: 3.5, z: 6, targetRoom: 'hallway', targetX: 3, targetZ: 1 },
      furniture: [
        { type: 'bed', x: 1.5, z: 1, w: 2.2, h: 0.5, d: 1.5 },
        { type: 'nightstand', x: 3.2, z: 0.6, w: 0.5, h: 0.6, d: 0.5 },
        { type: 'wardrobe', x: 7, z: 0.5, w: 1.2, h: 2.4, d: 0.6 },
        { type: 'desk', x: 6, z: 4.5, w: 1.5, h: 0.8, d: 0.7 },
        { type: 'pills', x: 3.2, z: 0.6, w: 0.15, h: 0.25, d: 0.1, onTop: true },
        { type: 'mirror', x: 0.05, z: 3, w: 0.05, h: 1.2, d: 0.8, onWall: true },
        { type: 'photo', x: 4, z: 0.05, w: 0.6, h: 0.5, d: 0.05, onWall: true },
        { type: 'window', x: 0.05, z: 1.5, w: 0.05, h: 1, d: 1.2, onWall: true },
      ],
      light: { x: 4, y: 2.8, z: 3, intensity: 1.5, color: 0xc8a070 },
      ambient: 0.15,
    },
    hallway: {
      width: 10, depth: 3,
      walls: [
        [0,0, 3,0], [4,0, 6,0], [7,0, 10,0],    // north (3 doors)
        [10,0, 10,3],                               // east
        [0,0, 0,3],                                  // west
        [0,3, 4,3], [5,3, 10,3],                    // south (1 door)
      ],
      doors: [
        { x: 3.5, z: 0, targetRoom: 'bedroom', targetX: 3.5, targetZ: 5 },
        { x: 5, z: 0, targetRoom: 'living_room', targetX: 3, targetZ: 5 },
        { x: 6.5, z: 0, targetRoom: 'kitchen', targetX: 3, targetZ: 5 },
        { x: 4.5, z: 3, targetRoom: 'laboratory', targetX: 3, targetZ: 1 },
      ],
      furniture: [
        { type: 'photo', x: 2, z: 0.05, w: 0.5, h: 0.4, d: 0.05, onWall: true },
        { type: 'photo', x: 8, z: 0.05, w: 0.5, h: 0.4, d: 0.05, onWall: true },
      ],
      light: { x: 5, y: 2.8, z: 1.5, intensity: 1.0, color: 0x9a7050 },
      ambient: 0.1,
    },
    bathroom: {
      width: 4, depth: 4,
      walls: [
        [0,0, 4,0], [4,0, 4,4], [0,0, 0,4],
        [0,4, 1.5,4], [2.5,4, 4,4],
      ],
      door: { x: 2, z: 4, targetRoom: 'bedroom', targetX: 6, targetZ: 5 },
      furniture: [
        { type: 'bathtub', x: 0.8, z: 0.8, w: 2, h: 0.6, d: 0.8 },
        { type: 'sink', x: 3.2, z: 0.4, w: 0.6, h: 0.9, d: 0.5 },
        { type: 'mirror', x: 3.95, z: 0.6, w: 0.05, h: 1, d: 0.7, onWall: true },
        { type: 'toilet', x: 3.2, z: 3, w: 0.5, h: 0.5, d: 0.6 },
      ],
      light: { x: 2, y: 2.8, z: 2, intensity: 1.2, color: 0x708090 },
      ambient: 0.12,
    },
    living_room: {
      width: 8, depth: 7,
      walls: [
        [0,0, 8,0], [8,0, 8,7], [0,0, 0,7],
        [0,7, 3,7], [4,7, 8,7],
      ],
      door: { x: 3.5, z: 7, targetRoom: 'hallway', targetX: 5, targetZ: 1 },
      furniture: [
        { type: 'couch', x: 4, z: 2, w: 3, h: 0.8, d: 1 },
        { type: 'tv', x: 4, z: 0.15, w: 1.5, h: 1, d: 0.15, onWall: true },
        { type: 'bookshelf', x: 7.5, z: 3, w: 0.6, h: 2.2, d: 1.5 },
        { type: 'table', x: 4, z: 4, w: 1.2, h: 0.5, d: 0.8 },
        { type: 'window', x: 0.05, z: 3, w: 0.05, h: 1, d: 1.5, onWall: true },
        { type: 'photo', x: 2, z: 0.05, w: 0.6, h: 0.5, d: 0.05, onWall: true },
      ],
      light: { x: 4, y: 2.8, z: 3, intensity: 1.2, color: 0xaa8050 },
      ambient: 0.12,
    },
    kitchen: {
      width: 6, depth: 6,
      walls: [
        [0,0, 6,0], [6,0, 6,6], [0,0, 0,6],
        [0,6, 2.5,6], [3.5,6, 6,6],
      ],
      door: { x: 3, z: 6, targetRoom: 'hallway', targetX: 6.5, targetZ: 1 },
      furniture: [
        { type: 'fridge', x: 0.5, z: 0.5, w: 0.8, h: 2, d: 0.7 },
        { type: 'stove', x: 2.5, z: 0.3, w: 0.8, h: 0.9, d: 0.6 },
        { type: 'counter', x: 4.5, z: 0.3, w: 1.5, h: 0.9, d: 0.6 },
        { type: 'table', x: 3, z: 3.5, w: 1.5, h: 0.8, d: 1 },
        { type: 'note', x: 0.5, z: 0.5, w: 0.2, h: 0.3, d: 0.02, onTop: true },
        { type: 'sink', x: 5.2, z: 0.4, w: 0.6, h: 0.9, d: 0.5 },
      ],
      light: { x: 3, y: 2.8, z: 3, intensity: 1.3, color: 0xaa9060 },
      ambient: 0.12,
    },
    laboratory: {
      width: 10, depth: 8,
      walls: [
        [0,0, 10,0], [10,0, 10,8], [0,0, 0,8],
        [0,8, 4,8], [5,8, 10,8],
      ],
      door: { x: 4.5, z: 8, targetRoom: 'hallway', targetX: 4.5, targetZ: 2 },
      furniture: [
        { type: 'labConsole', x: 2, z: 0.5, w: 3, h: 1.2, d: 0.8 },
        { type: 'labConsole', x: 7, z: 0.5, w: 2.5, h: 1.2, d: 0.8 },
        { type: 'desk', x: 5, z: 4, w: 2, h: 0.8, d: 1 },
        { type: 'note', x: 5, z: 4, w: 0.25, h: 0.35, d: 0.02, onTop: true },
        { type: 'labEquip', x: 1, z: 6, w: 1.5, h: 1.5, d: 1 },
        { type: 'labEquip', x: 8, z: 6, w: 1.5, h: 1.5, d: 1 },
      ],
      light: { x: 5, y: 2.8, z: 4, intensity: 1.0, color: 0x607080 },
      ambient: 0.1,
    },
    void_room: {
      width: 12, depth: 12,
      walls: [
        [0,0, 12,0], [12,0, 12,12], [0,0, 0,12],
        [0,12, 5.5,12], [6.5,12, 12,12],
      ],
      door: { x: 6, z: 12, targetRoom: 'hallway', targetX: 4.5, targetZ: 2 },
      furniture: [],
      light: { x: 6, y: 2.8, z: 6, intensity: 0.5, color: 0x5040c0 },
      ambient: 0.03,
    },
  };

  // Material colors for furniture types
  const FURN_COLORS = {
    bed: 0x1a1018, nightstand: 0x2a1c10, wardrobe: 0x1e1610,
    desk: 0x2a1c10, pills: 0x8a1020, mirror: 0x1a2a30,
    photo: 0x3a2818, window: 0x040810, bathtub: 0x4a4848,
    sink: 0x3a3838, toilet: 0x5a5858, couch: 0x1a1028,
    tv: 0x0a0a0a, bookshelf: 0x1e1408, table: 0x2a1c10,
    fridge: 0x5a5a58, stove: 0x1a1a1a, counter: 0x2a2828,
    note: 0xb0a080, labConsole: 0x202228, labEquip: 0x282a30,
  };

  const World3D = {
    scene: null,
    camera: null,
    renderer: null,
    roomGroup: null,
    currentRoomId: '',
    lights: [],
    flickerLight: null,
    flickerBase: 0,

    // Player
    moveSpeed: 3,
    lookSpeed: 0.002,
    playerHeight: 1.6,
    yaw: 0,
    pitch: 0,
    velocity: { x: 0, z: 0 },

    init() {
      // Scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x020204);
      this.scene.fog = new THREE.FogExp2(0x020204, 0.06);

      // Camera
      this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 50);
      this.camera.position.set(4, this.playerHeight, 4);

      // Renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: false });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.8;
      document.getElementById('three-container').appendChild(this.renderer.domElement);

      // Mouse look
      document.addEventListener('mousemove', e => {
        if (document.pointerLockElement) {
          this.yaw -= e.movementX * this.lookSpeed;
          this.pitch -= e.movementY * this.lookSpeed;
          this.pitch = Math.max(-Math.PI/3, Math.min(Math.PI/3, this.pitch));
        }
      });

      window.addEventListener('resize', () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      });

      this.roomGroup = new THREE.Group();
      this.scene.add(this.roomGroup);
    },

    loadRoom(roomId) {
      const def = ROOM_DEFS[roomId];
      if (!def) return;

      // Clear old room
      while (this.roomGroup.children.length) {
        const c = this.roomGroup.children[0];
        this.roomGroup.remove(c);
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      }
      // Clear lights
      for (const l of this.lights) this.scene.remove(l);
      this.lights = [];

      this.currentRoomId = roomId;

      // Floor
      const floorGeo = new THREE.PlaneGeometry(def.width, def.depth);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x1a1820, roughness: 0.9, metalness: 0,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(def.width / 2, 0, def.depth / 2);
      floor.receiveShadow = true;
      this.roomGroup.add(floor);

      // Ceiling
      const ceilGeo = new THREE.PlaneGeometry(def.width, def.depth);
      const ceilMat = new THREE.MeshStandardMaterial({
        color: 0x0a0810, roughness: 1, metalness: 0,
      });
      const ceil = new THREE.Mesh(ceilGeo, ceilMat);
      ceil.rotation.x = Math.PI / 2;
      ceil.position.set(def.width / 2, WALL_H, def.depth / 2);
      this.roomGroup.add(ceil);

      // Walls
      const wallMat = new THREE.MeshStandardMaterial({
        color: roomId === 'void_room' ? 0x0a0818 : 0x2a2838,
        roughness: 0.85, metalness: 0,
      });

      for (const seg of def.walls) {
        const [x1, z1, x2, z2] = seg;
        const dx = x2 - x1, dz = z2 - z1;
        const len = Math.sqrt(dx * dx + dz * dz);
        const wallGeo = new THREE.BoxGeometry(len, WALL_H, 0.15);
        const wall = new THREE.Mesh(wallGeo, wallMat.clone());
        wall.position.set((x1 + x2) / 2, WALL_H / 2, (z1 + z2) / 2);
        wall.rotation.y = Math.atan2(dz, dx);
        wall.castShadow = true;
        wall.receiveShadow = true;
        this.roomGroup.add(wall);
      }

      // Furniture
      for (const f of def.furniture) {
        const color = FURN_COLORS[f.type] || 0x1a1a1a;
        const group = new THREE.Group();
        
        const createPart = (w, h, d, c, x, y, z, type='box') => {
          const mat = new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, metalness: 0.1 });
          let geo;
          if (type === 'box') geo = new THREE.BoxGeometry(w, h, d);
          else if (type === 'cylinder') geo = new THREE.CylinderGeometry(w, w, h, 16);
          else if (type === 'sphere') geo = new THREE.SphereGeometry(w, 16, 16);
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(x, y, z);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          return mesh;
        };

        let isMirror = false;
        let tvScreen = null;

        if (f.type === 'table' || f.type === 'desk') {
          // Table top with edge lip
          group.add(createPart(f.w, 0.04, f.d, color, 0, f.h - 0.02, 0)); 
          group.add(createPart(f.w - 0.05, 0.04, f.d - 0.05, 0x110c08, 0, f.h - 0.06, 0));
          
          // Ornate legs (cylinders)
          const lw = 0.04, lh = f.h - 0.08;
          const lx = f.w/2 - 0.1, lz = f.d/2 - 0.1;
          const offsets = [[-lx, -lz], [lx, -lz], [-lx, lz], [lx, lz]];
          offsets.forEach(([ox, oz]) => {
            group.add(createPart(lw, lh, lw, color, ox, lh/2, oz, 'cylinder'));
            group.add(createPart(lw*1.5, 0.05, lw*1.5, color, ox, 0.025, oz, 'cylinder')); // foot
          });

          if (f.type === 'desk') {
            // Drawers
            group.add(createPart(f.w*0.4, 0.2, f.d - 0.1, color, f.w/4, f.h - 0.18, 0));
            // Handle
            group.add(createPart(0.1, 0.02, 0.02, 0x5a5a5a, f.w/4, f.h - 0.18, f.d/2 - 0.04));
            // Papers
            group.add(createPart(0.3, 0.01, 0.2, 0xddccbb, -f.w/4, f.h, 0));
            group.add(createPart(0.2, 0.01, 0.25, 0xccbbad, -f.w/4 + 0.1, f.h + 0.005, 0.1));
          }
        } else if (f.type === 'bed') {
          // Intricate frame
          group.add(createPart(f.w, 0.15, f.d, 0x1e1610, 0, 0.1, 0));
          // Headboard
          group.add(createPart(f.w, 0.8, 0.1, 0x1e1610, 0, 0.4, -f.d/2 + 0.05));
          for(let i=-1; i<=1; i++) group.add(createPart(0.05, 0.7, 0.05, 0x0a0502, i*(f.w/2 - 0.1), 0.35, -f.d/2 + 0.12));
          // Mattress
          group.add(createPart(f.w - 0.1, 0.25, f.d - 0.15, 0x2a2230, 0, 0.3, 0));
          // Blanket draped
          group.add(createPart(f.w + 0.05, 0.26, f.d * 0.6, 0x4a1820, 0, 0.305, f.d * 0.2));
          // Two pillows
          group.add(createPart(0.4, 0.1, 0.3, 0x484040, -f.w/4, 0.45, -f.d/2 + 0.3));
          group.add(createPart(0.4, 0.1, 0.3, 0x484040, f.w/4, 0.45, -f.d/2 + 0.3));
        } else if (f.type === 'wardrobe') {
          group.add(createPart(f.w, f.h, f.d, color, 0, f.h/2, 0));
          // Crown molding
          group.add(createPart(f.w + 0.1, 0.1, f.d + 0.1, 0x110c08, 0, f.h + 0.05, 0));
          // Base
          group.add(createPart(f.w + 0.05, 0.1, f.d + 0.05, 0x110c08, 0, 0.05, 0));
          // Detailed doors
          const dw = f.w/2 - 0.04, dh = f.h - 0.3;
          group.add(createPart(dw, dh, 0.05, 0x2e2620, -f.w/4, f.h/2 + 0.05, f.d/2 + 0.025));
          group.add(createPart(dw, dh, 0.05, 0x2e2620, f.w/4, f.h/2 + 0.05, f.d/2 + 0.025));
          // Handles
          group.add(createPart(0.02, 0.15, 0.02, 0x5a5a5a, -0.05, f.h/2, f.d/2 + 0.06));
          group.add(createPart(0.02, 0.15, 0.02, 0x5a5a5a, 0.05, f.h/2, f.d/2 + 0.06));
        } else if (f.type === 'tv') { // Old CRT TV
          group.add(createPart(f.w, f.h, f.d, 0x2a1a10, 0, f.h/2, 0)); // Wood casing
          // Screen bezel
          group.add(createPart(f.w - 0.1, f.h - 0.1, 0.05, 0x0a0a0a, -0.05, f.h/2, f.d/2 + 0.02));
          // Curved screen
          tvScreen = createPart(f.w - 0.2, f.h - 0.2, 0.06, 0x050505, -0.05, f.h/2, f.d/2 + 0.03, 'sphere');
          tvScreen.scale.set(1, 0.7, 0.2);
          tvScreen.material.roughness = 0.1;
          group.add(tvScreen);
          // Knobs
          group.add(createPart(0.04, 0.02, 0.04, 0x5a5a5a, f.w/2 - 0.08, f.h*0.7, f.d/2 + 0.04, 'cylinder'));
          group.add(createPart(0.04, 0.02, 0.04, 0x5a5a5a, f.w/2 - 0.08, f.h*0.4, f.d/2 + 0.04, 'cylinder'));
          // Antenna (V shape)
          const antBase = createPart(0.1, 0.02, 0.1, 0x111111, 0, f.h, 0);
          group.add(antBase);
          const a1 = createPart(0.01, 0.4, 0.01, 0x7a7a7a, -0.15, f.h + 0.2, 0, 'cylinder');
          a1.rotation.z = Math.PI/6; group.add(a1);
          const a2 = createPart(0.01, 0.4, 0.01, 0x7a7a7a, 0.15, f.h + 0.2, 0, 'cylinder');
          a2.rotation.z = -Math.PI/6; group.add(a2);
        } else if (f.type === 'couch') {
          // Plump seating
          group.add(createPart(f.w, 0.2, f.d, color, 0, 0.1, 0)); // Base
          group.add(createPart(f.w - 0.1, 0.15, f.d - 0.1, 0x2a1a38, 0, 0.25, 0)); // Cushions
          // Curved back
          const back = createPart(f.w, f.h - 0.3, 0.3, color, 0, 0.3 + (f.h-0.3)/2, -f.d/2 + 0.15);
          group.add(back);
          // Armrests
          group.add(createPart(0.2, 0.4, f.d, color, -f.w/2 + 0.1, 0.3, 0));
          group.add(createPart(0.2, 0.4, f.d, color, f.w/2 - 0.1, 0.3, 0));
        } else if (f.type === 'bathtub') {
          group.add(createPart(f.w, f.h, f.d, 0x4a4848, 0, f.h/2, 0));
          // Hollow inside
          const inside = createPart(f.w - 0.2, f.h - 0.1, f.d - 0.2, 0x2a2828, 0, f.h/2 + 0.05, 0);
          group.add(inside);
          // Faucet
          group.add(createPart(0.05, 0.2, 0.05, 0x7a7a7a, f.w/2 - 0.1, f.h + 0.1, 0, 'cylinder'));
          group.add(createPart(0.15, 0.05, 0.05, 0x7a7a7a, f.w/2 - 0.15, f.h + 0.15, 0));
        } else if (f.type === 'toilet') {
          group.add(createPart(0.3, 0.4, 0.4, 0x5a5858, 0, 0.2, 0)); // Base
          group.add(createPart(0.35, 0.05, 0.45, 0x7a7878, 0, 0.425, 0.05)); // Seat
          group.add(createPart(0.4, 0.5, 0.2, 0x5a5858, 0, 0.65, -0.15)); // Tank
          group.add(createPart(0.05, 0.02, 0.02, 0xaaaaaa, -0.15, 0.8, -0.1)); // Flusher
        } else if (f.type === 'mirror') {
          const mFrame = createPart(f.w + 0.1, f.h + 0.1, f.d, 0x1e140a, 0, f.h/2, 0);
          group.add(mFrame);
          const m = createPart(f.w, f.h, f.d + 0.01, 0x0a1418, 0, f.h/2, 0);
          m.material.roughness = 0.05; m.material.metalness = 0.9;
          group.add(m);
          isMirror = true;
        } else if (f.type === 'bookshelf') {
          group.add(createPart(f.w, f.h, f.d, color, 0, f.h/2, 0));
          const inside = createPart(f.w - 0.1, f.h - 0.1, f.d, 0x0a0502, 0, f.h/2, 0.05);
          group.add(inside);
          // Shelves and random books
          for(let i=1; i<5; i++) {
            group.add(createPart(f.w-0.1, 0.04, f.d-0.05, color, 0, i*(f.h/5), 0.025));
            // Add fake books
            for(let b=0; b<3; b++) {
              if (Math.random() > 0.3) {
                const bCol = [0x4a1818, 0x184a18, 0x18184a, 0x4a4a18][Math.floor(Math.random()*4)];
                group.add(createPart(0.05, 0.2 + Math.random()*0.1, 0.2, bCol, -f.w/3 + b*0.1 + Math.random()*0.2, i*(f.h/5) + 0.15, 0.1));
              }
            }
          }
        } else if (f.type === 'sink') {
          group.add(createPart(f.w, f.h - 0.2, f.d, color, 0, (f.h-0.2)/2, 0)); // Cabinet
          group.add(createPart(f.w + 0.05, 0.2, f.d + 0.05, 0x6a6a6a, 0, f.h - 0.1, 0)); // Basin
          group.add(createPart(f.w - 0.1, 0.1, f.d - 0.1, 0x2a2a2a, 0, f.h - 0.05, 0)); // Hole
          group.add(createPart(0.04, 0.1, 0.04, 0x8a8a8a, 0, f.h + 0.05, -f.d/2 + 0.1, 'cylinder')); // Faucet
        } else if (f.type === 'fridge') {
          group.add(createPart(f.w, f.h, f.d, 0x5a5a58, 0, f.h/2, 0));
          // Doors
          group.add(createPart(f.w - 0.05, f.h * 0.6, 0.05, 0x6a6a68, 0, f.h * 0.35, f.d/2 + 0.025)); // Bottom
          group.add(createPart(f.w - 0.05, f.h * 0.35, 0.05, 0x6a6a68, 0, f.h * 0.825, f.d/2 + 0.025)); // Top
          // Handles
          group.add(createPart(0.03, 0.3, 0.03, 0x222, -f.w/2 + 0.1, f.h * 0.4, f.d/2 + 0.05));
          group.add(createPart(0.03, 0.15, 0.03, 0x222, -f.w/2 + 0.1, f.h * 0.8, f.d/2 + 0.05));
        } else if (f.type === 'stove') {
          group.add(createPart(f.w, f.h, f.d, 0x1a1a1a, 0, f.h/2, 0));
          group.add(createPart(f.w - 0.1, f.h * 0.5, 0.02, 0x050505, 0, f.h/2 - 0.1, f.d/2 + 0.01)); // Oven window
          // Burners
          for(let bx=-1; bx<=1; bx+=2) for(let bz=-1; bz<=1; bz+=2) {
            group.add(createPart(0.15, 0.02, 0.15, 0x333, bx*0.2, f.h + 0.01, bz*0.2, 'cylinder'));
          }
        } else {
          // Default fallback
          group.add(createPart(f.w, f.h, f.d, color, 0, f.h/2, 0)); 
        }

        // Invisible hit box for raycasting
        const hitGeo = new THREE.BoxGeometry(f.w, f.h, f.d);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitBox = new THREE.Mesh(hitGeo, hitMat);
        hitBox.position.set(0, f.h/2, 0);
        hitBox.userData = { type: f.type, interactive: true };
        group.add(hitBox);

        let py = 0;
        if (f.onWall) py = 1.5 - f.h/2;
        if (f.onTop) py = 0.9;
        group.position.set(f.x, py, f.z);
        
        // Rotation logic to orient furniture correctly
        // Walls: N(0,0->8,0), E(8,0->8,6), W(0,0->0,6), S(0,6->8,6)
        if (f.z < 0.5) group.rotation.y = 0; // North wall
        else if (f.x > def.width - 0.5) group.rotation.y = -Math.PI/2; // East wall
        else if (f.x < 0.5) group.rotation.y = Math.PI/2; // West wall
        else if (f.z > def.depth - 0.5) group.rotation.y = Math.PI; // South wall

        // Couch specific fix to face center
        if (f.type === 'couch') group.rotation.y = Math.PI;
        if (f.type === 'bookshelf' && f.x > 6) group.rotation.y = -Math.PI/2;

        this.roomGroup.add(group);

        // TV static glow
        if (f.type === 'tv') {
          const tvLight = new THREE.PointLight(0x2020a0, 0.25, 4); // Stronger glow
          let lx = f.x, lz = f.z;
          if (f.x < 0.5) lx += 0.4; else if (f.x > def.width-0.5) lx -= 0.4;
          if (f.z < 0.5) lz += 0.4; else if (f.z > def.depth-0.5) lz -= 0.4;
          tvLight.position.set(lx, py + f.h/2, lz);
          this.scene.add(tvLight);
          this.lights.push(tvLight);
        }
      }

      // Room light
      if (def.light) {
        const light = new THREE.PointLight(def.light.color, def.light.intensity, 12);
        light.position.set(def.light.x, def.light.y, def.light.z);
        light.castShadow = true;
        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
        this.scene.add(light);
        this.lights.push(light);
        this.flickerLight = light;
        this.flickerBase = def.light.intensity;
      }

      // Ambient
      const ambient = new THREE.AmbientLight(0x0a0810, def.ambient || 0.03);
      this.scene.add(ambient);
      this.lights.push(ambient);

      // Fog density per room
      this.scene.fog.density = roomId === 'void_room' ? 0.04 : 0.06;
    },

    spawnPlayer(x, z) {
      this.camera.position.set(x, this.playerHeight, z);
      this.yaw = 0;
      this.pitch = 0;
    },

    update(dt, keys, sanity) {
      // Movement
      let mx = 0, mz = 0;
      if (keys['KeyW'] || keys['ArrowUp']) mz = -1;
      if (keys['KeyS'] || keys['ArrowDown']) mz = 1;
      if (keys['KeyA'] || keys['ArrowLeft']) mx = -1;
      if (keys['KeyD'] || keys['ArrowRight']) mx = 1;

      const speed = this.moveSpeed * dt;
      const sinY = Math.sin(this.yaw), cosY = Math.cos(this.yaw);
      let dx = (mx * cosY + mz * sinY) * speed;
      let dz = (-mx * sinY + mz * cosY) * speed;

      // Simple collision
      const def = ROOM_DEFS[this.currentRoomId];
      if (def) {
        const nx = this.camera.position.x + dx;
        const nz = this.camera.position.z + dz;
        const margin = 0.3;
        if (nx > margin && nx < def.width - margin) this.camera.position.x = nx;
        if (nz > margin && nz < def.depth - margin) this.camera.position.z = nz;
      }

      // Camera rotation
      const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
      this.camera.quaternion.setFromEuler(euler);

      // Head bob
      if (mx !== 0 || mz !== 0) {
        const bob = Math.sin(Date.now() * 0.008) * 0.03;
        this.camera.position.y = this.playerHeight + bob;
      }

      // Light flicker
      if (this.flickerLight) {
        const flicker = 1 + Math.sin(Date.now() * 0.01) * 0.1
          + (Math.random() < 0.02 ? (Math.random() - 0.5) * 0.5 : 0);
        this.flickerLight.intensity = this.flickerBase * flicker * (0.5 + sanity / 200);

        // Sanity affects fog
        this.scene.fog.density = 0.05 + (100 - sanity) / 800;
      }
    },

    render() {
      this.renderer.render(this.scene, this.camera);
    },

    // Check if player is near a door
    checkDoor() {
      const def = ROOM_DEFS[this.currentRoomId];
      if (!def) return null;
      const px = this.camera.position.x, pz = this.camera.position.z;
      const doors = def.doors || (def.door ? [def.door] : []);
      for (const d of doors) {
        const ddx = px - d.x, ddz = pz - d.z;
        if (Math.sqrt(ddx*ddx + ddz*ddz) < 1.2) return d;
      }
      return null;
    },

    // Raycast to find interactive object
    getInteractTarget() {
      const ray = new THREE.Raycaster();
      ray.far = 3;
      ray.setFromCamera(new THREE.Vector2(0, 0), this.camera);
      const hits = ray.intersectObjects(this.roomGroup.children);
      for (const h of hits) {
        if (h.object.userData && h.object.userData.interactive) {
          return h.object.userData.type;
        }
      }
      return null;
    },

    getRoomDef(id) { return ROOM_DEFS[id]; },
  };

  window.G = window.G || {};
  window.G.World3D = World3D;
})();
