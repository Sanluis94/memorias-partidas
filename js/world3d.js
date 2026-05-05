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
      light: { x: 4, y: 2.8, z: 3, intensity: 0.3, color: 0x8a7050 },
      ambient: 0.04,
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
      light: { x: 5, y: 2.8, z: 1.5, intensity: 0.15, color: 0x6a5040 },
      ambient: 0.02,
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
      light: { x: 2, y: 2.8, z: 2, intensity: 0.2, color: 0x506070 },
      ambient: 0.03,
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
      light: { x: 4, y: 2.8, z: 3, intensity: 0.2, color: 0x7a6040 },
      ambient: 0.03,
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
      light: { x: 3, y: 2.8, z: 3, intensity: 0.25, color: 0x8a7a50 },
      ambient: 0.03,
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
      light: { x: 5, y: 2.8, z: 4, intensity: 0.15, color: 0x405060 },
      ambient: 0.02,
    },
    void_room: {
      width: 12, depth: 12,
      walls: [
        [0,0, 12,0], [12,0, 12,12], [0,0, 0,12],
        [0,12, 5.5,12], [6.5,12, 12,12],
      ],
      door: { x: 6, z: 12, targetRoom: 'hallway', targetX: 4.5, targetZ: 2 },
      furniture: [],
      light: { x: 6, y: 2.8, z: 6, intensity: 0.05, color: 0x3020a0 },
      ambient: 0.005,
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
      this.scene.fog = new THREE.FogExp2(0x020204, 0.12);

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
      this.renderer.toneMappingExposure = 0.5;
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
        color: 0x0e0c10, roughness: 0.95, metalness: 0,
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
        color: roomId === 'void_room' ? 0x060410 : 0x161420,
        roughness: 0.9, metalness: 0,
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
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.1 });
        const geo = new THREE.BoxGeometry(f.w, f.h, f.d);
        const mesh = new THREE.Mesh(geo, mat);
        let py = f.h / 2;
        if (f.onWall) py = 1.5;
        if (f.onTop) py = 0.9 + f.h / 2;
        mesh.position.set(f.x, py, f.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { type: f.type, interactive: true };
        this.roomGroup.add(mesh);

        // Special: TV static glow
        if (f.type === 'tv') {
          const tvLight = new THREE.PointLight(0x2020a0, 0.05, 3);
          tvLight.position.set(f.x, 1.5, f.z + 0.3);
          this.scene.add(tvLight);
          this.lights.push(tvLight);
        }

        // Mirror reflective surface
        if (f.type === 'mirror') {
          mesh.material = new THREE.MeshStandardMaterial({
            color: 0x0a1418, roughness: 0.1, metalness: 0.8,
          });
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
      this.scene.fog.density = roomId === 'void_room' ? 0.08 : 0.12;
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
        this.scene.fog.density = 0.1 + (100 - sanity) / 500;
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
