package com.memorias.game;

import com.memorias.engine.Input;
import com.memorias.engine.Renderer;
import org.joml.Vector3f;
import java.util.List;

/**
 * Estado central do jogo - gerencia salas, jogador, sanidade, inventário e diálogos.
 */
public class GameState {

    // Player
    private float playerX = 4, playerZ = 4;
    private final float playerHeight = 1.6f;
    private float moveSpeed = 3.0f;
    private float walkTimer = 0;

    // Game state
    private int chapter = 1;
    private float sanity = 100;
    private String currentRoom = "bedroom";
    private boolean playing = false;

    // Progression state
    private final java.util.List<String> inventory = new java.util.ArrayList<>();
    private final java.util.Map<String, Integer> interactCounts = new java.util.HashMap<>();
    private final java.util.Map<String, Integer> roomVisits = new java.util.HashMap<>();
    private final java.util.Map<String, Boolean> flags = new java.util.HashMap<>();

    // Story data
    private StoryData storyData;
    private java.util.List<StoryData.DialogueLine> currentDialogue = null;
    private int currentLineIdx = 0;

    // Shadow entity
    private boolean shadowActive = false;
    private float shadowX = 0, shadowZ = 0;
    private float shadowCooldown = 0;
    private final float shadowSpeed = 1.5f;

    // UI
    private com.memorias.engine.TextRenderer textRenderer;
    private com.memorias.engine.UIRenderer uiRenderer;

    // Room dimensions (simplified)
    private float roomW = 8, roomD = 6;
    private float memoryTimer = 0;

    public boolean inMenu = true;

    public void init() {
        playing = false;
        chapter = 1;
        sanity = 100;
        currentRoom = "bedroom";
        playerX = 4; playerZ = 3;
        
        storyData = StoryData.load("/assets/story.json");
        if (storyData != null) {
            System.out.println("[Game] Modulo de historia carregado com sucesso.");
        }
        
        loadRoom("bedroom");
        System.out.println("[Game] Pressione E para iniciar.");

        textRenderer = new com.memorias.engine.TextRenderer();
        textRenderer.init();
        uiRenderer = new com.memorias.engine.UIRenderer();
        uiRenderer.init();
    }

    private void loadRoom(String roomId) {
        // Default spawn points
        switch (roomId) {
            case "hallway" -> loadRoom(roomId, 5, 3);
            case "living_room" -> loadRoom(roomId, 4, 3);
            case "kitchen" -> loadRoom(roomId, 3, 3);
            case "bathroom" -> loadRoom(roomId, 2, 2);
            case "laboratory" -> loadRoom(roomId, 5, 4);
            default -> loadRoom(roomId, 4, 3);
        }
    }

    private void loadRoom(String roomId, float sx, float sz) {
        currentRoom = roomId;
        playerX = sx;
        playerZ = sz;
        roomVisits.put(roomId, roomVisits.getOrDefault(roomId, 0) + 1);
        switch (roomId) {
            case "bedroom"     -> { roomW=8; roomD=6; }
            case "bathroom"    -> { roomW=4; roomD=4; }
            case "hallway"     -> { roomW=10; roomD=6; }
            case "living_room" -> { roomW=8; roomD=7; }
            case "kitchen"     -> { roomW=6; roomD=6; }
            case "laboratory"  -> { roomW=10; roomD=8; }
            case "void_room"   -> { roomW=12; roomD=12; }
            default            -> { roomW=8; roomD=6; }
        }
    }

    public void update(float dt, Input input) {
        if (inMenu) {
            if (input.interact()) {
                inMenu = false;
                playing = true;
                System.out.println("[Game] Capitulo 1: A Rotina");
                startDialogue("wake_up");
            }
            return;
        }

        if (!playing) return;

        // Mouse look
        float lookSpeed = 0.002f;
        cameraYaw += (float) input.getMouseDX() * lookSpeed;
        cameraPitch -= (float) input.getMouseDY() * lookSpeed;
        cameraPitch = Math.max(-(float)Math.PI/3, Math.min((float)Math.PI/3, cameraPitch));

        // Movement relative to camera yaw
        float mx = 0, mz = 0;
        if (input.forward())  mz = -1;
        if (input.backward()) mz = 1;
        if (input.left())     mx = -1;
        if (input.right())    mx = 1;

        boolean isMoving = mx != 0 || mz != 0;
        float speed = moveSpeed * dt * (sanity < 30 ? 0.8f : 1.0f);
        float sinY = (float) Math.sin(cameraYaw);
        float cosY = (float) Math.cos(cameraYaw);
        float dx = (mx * cosY + mz * sinY) * speed;
        float dz = (-mx * sinY + mz * cosY) * speed;

        // Collision with walls
        float nx = playerX + dx;
        float nz = playerZ + dz;
        float margin = 0.3f;

        if (nx < margin) nx = margin;
        if (nx > roomW - margin) nx = roomW - margin;
        if (nz < margin) nz = margin;
        if (nz > roomD - margin) nz = roomD - margin;

        if (!isColliding(nx, playerZ)) playerX = nx;
        if (!isColliding(playerX, nz)) playerZ = nz;

        // Walk bob
        if (isMoving && currentDialogue == null) {
            walkTimer += dt * 5;
        }

        // Dialogue update
        if (currentDialogue != null) {
            if (input.interact()) {
                StoryData.DialogueLine line = currentDialogue.get(currentLineIdx);
                if (line.choices != null && !line.choices.isEmpty()) {
                    // Simple logic: always picks choice 0 for now in desktop without UI
                    StoryData.ChoiceDef choice = line.choices.get(0);
                    System.out.println("[Narrative Choice] -> " + choice.text);
                    if (choice.effect != null) {
                        if (choice.effect.flag != null) flags.put(choice.effect.flag, true);
                        sanity += choice.effect.sanity;
                    }
                }
                
                currentLineIdx++;
                if (currentLineIdx >= currentDialogue.size()) {
                    currentDialogue = null; // End dialogue
                } else {
                    printCurrentDialogue();
                }
            }
            return; // Block other interactions while talking
        }

        // Interaction
        if (input.interact()) {
            handleInteraction();
        }

        // Check objectives and chapter transitions
        checkProgress();

        // Shadow entity logic (Chapter 3+)
        if (chapter >= 3) {
            if (!shadowActive && shadowCooldown <= 0 && Math.random() < 0.001) {
                shadowActive = true;
                shadowCooldown = 60;
                shadowX = (float)Math.random() * roomW;
                shadowZ = (float)Math.random() * roomD;
                System.out.println("[Game] ELA apareceu...");
            }
            if (shadowCooldown > 0) shadowCooldown -= dt;

            if (shadowActive) {
                float sdx = playerX - shadowX;
                float sdz = playerZ - shadowZ;
                float dist = (float)Math.sqrt(sdx*sdx + sdz*sdz);

                if (dist > 0.5f) {
                    shadowX += (sdx / dist) * shadowSpeed * dt;
                    shadowZ += (sdz / dist) * shadowSpeed * dt;
                }
                if (dist < 1.5f) {
                    sanity -= dt * 15;
                    if (Math.random() < 0.02) {
                        System.out.println("[Narrative] Sinto frio... Algo me observa.");
                    }
                }
                if (dist < 0.3f || sanity <= 0) {
                    shadowActive = false;
                    sanity = Math.max(5, sanity);
                    System.out.println("[Narrative] Acordei no chao. Suando.");
                    loadRoom("bedroom", 4, 3);
                }
            }
        }

        // Sanity drain over time in later chapters
        if (chapter >= 3) {
            sanity -= dt * 0.5f;
            sanity = Math.max(0, sanity);
        }

        // Memory fragments timer (ch3) - guaranteed progression
        if (chapter >= 3) {
            memoryTimer += dt;
            int memCount = flags.getOrDefault("visitedMemoryCount", false) ? 2 : (flags.getOrDefault("visitedMemory", false) ? 1 : 0);
            if (memCount < 2 && currentDialogue == null && (memoryTimer > 25 || Math.random() < 0.003)) {
                memoryTimer = 0;
                String[] frags = {"memory_wife_death_1", "memory_daughter"};
                String frag = frags[(int)(Math.random() * frags.length)];
                startDialogue(frag);
                sanity -= 8;
                if (flags.getOrDefault("visitedMemory", false)) {
                    flags.put("visitedMemoryCount", true);
                } else {
                    flags.put("visitedMemory", true);
                }
                System.out.println("[Game] Fragmento de memoria... (" + (memCount+1) + "/2)");
            }
        }
    }

    private void startDialogue(String key) {
        if (storyData == null || storyData.dialogues == null) {
            System.out.println("[Narrative] ...");
            return;
        }
        List<StoryData.DialogueLine> lines = storyData.dialogues.get(key);
        if (lines != null && !lines.isEmpty()) {
            currentDialogue = lines;
            currentLineIdx = 0;
            printCurrentDialogue();
        } else {
            // Fallback for missing dialogue keys
            switch (key) {
                case "door_locked" -> System.out.println("[Narrative] A porta esta trancada.");
                case "window_interact" -> System.out.println("[Narrative] La fora esta escuro. Completamente escuro.");
                case "stove_interact" -> System.out.println("[Narrative] O fogao esta frio. Poeira cobre as bocas.");
                case "toilet_interact" -> System.out.println("[Narrative] O vaso. A unica coisa normal neste apartamento.");
                default -> System.out.println("[Narrative] ...");
            }
        }
    }

    private void printCurrentDialogue() {
        StoryData.DialogueLine line = currentDialogue.get(currentLineIdx);
        System.out.println(line.isThought ? "[Thought] " + line.text : "[Narrative] " + line.text);
        if (line.choices != null && !line.choices.isEmpty()) {
            System.out.println("  1) " + line.choices.get(0).text);
        }
    }

    private void handleInteraction() {
        float lookX = playerX - (float)Math.sin(cameraYaw) * 1.5f;
        float lookZ = playerZ - (float)Math.cos(cameraYaw) * 1.5f;
        float interactR = 2.0f;
        
        switch (currentRoom) {
            case "bedroom" -> {
                if (dist(playerX, playerZ, roomW/2, 0) < 1.8f) { loadRoom("hallway", 2, 5); return; }
                if (dist(lookX, lookZ, 3.5f, 0.5f) < interactR) { interactObject("nightstand"); return; }
                if (dist(lookX, lookZ, 3.5f, 0.75f) < interactR) { interactObject("pills"); return; }
                if (dist(lookX, lookZ, 6f, 4.5f) < interactR) { interactObject("desk"); return; }
                if (dist(lookX, lookZ, 2f, 1f) < interactR) { interactObject("bed"); return; }
                if (dist(lookX, lookZ, 4f, 0.1f) < interactR) { interactObject("photo"); return; }
                if (dist(lookX, lookZ, 0.05f, 1.5f) < interactR) { interactObject("window"); return; }
                if (dist(lookX, lookZ, 0.05f, 3f) < interactR) { interactObject("mirror"); return; }
                if (dist(lookX, lookZ, 7f, 0.5f) < interactR) { interactObject("wardrobe"); return; }
            }
            case "hallway" -> {
                if (dist(playerX, playerZ, 2, 6) < 1.8f) { loadRoom("bedroom", 4, 5); return; }
                if (dist(playerX, playerZ, 5, 0) < 1.8f) { loadRoom("living_room", 4, 6); return; }
                if (dist(playerX, playerZ, 8, 0) < 1.8f) { loadRoom("kitchen", 3, 5); return; }
                if (dist(playerX, playerZ, 8, 6) < 1.8f) {
                    if (!inventory.contains("bathroom_key")) { startDialogue("door_locked"); return; }
                    loadRoom("bathroom", 2, 3); return;
                }
                if (dist(playerX, playerZ, 5, 6) < 1.8f) {
                    if (chapter < 4 || !inventory.contains("lab_keycard")) { startDialogue("door_locked"); return; }
                    loadRoom("laboratory", 5, 1); return;
                }
                if (dist(playerX, playerZ, 9, 6) < 1.8f) {
                    if (chapter < 5) { System.out.println("A porta nao leva a lugar nenhum."); return; }
                    loadRoom("void_room", 6, 1); return;
                }
            }
            case "bathroom" -> {
                if (dist(playerX, playerZ, 2, 4) < 1.8f) { loadRoom("hallway", 8, 5); return; }
                if (dist(lookX, lookZ, 3.2f, 0.4f) < interactR) { interactObject("sink"); return; }
                if (dist(lookX, lookZ, 0.8f, 0.8f) < interactR) { interactObject("bathtub"); return; }
                if (dist(lookX, lookZ, 3.2f, 3f) < interactR) { interactObject("toilet"); return; }
                if (dist(lookX, lookZ, 3.95f, 0.6f) < interactR) { interactObject("mirror"); return; }
            }
            case "living_room" -> {
                if (dist(playerX, playerZ, 4, 7) < 1.8f) { loadRoom("hallway", 5, 1); return; }
                if (dist(lookX, lookZ, 4, 2) < interactR) { interactObject("couch"); return; }
                if (dist(lookX, lookZ, 7.5f, 3) < interactR) { interactObject("bookshelf"); return; }
                if (dist(lookX, lookZ, 4, 0.15f) < interactR) { interactObject("tv"); return; }
                if (dist(lookX, lookZ, 2f, 6.9f) < interactR) { interactObject("chalkboard"); return; }
                if (dist(lookX, lookZ, 4, 4) < interactR) { interactObject("table"); return; }
                if (dist(lookX, lookZ, 0.05f, 3f) < interactR) { interactObject("window"); return; }
            }
            case "kitchen" -> {
                if (dist(playerX, playerZ, 3, 6) < 1.8f) { loadRoom("hallway", 8, 1); return; }
                if (dist(lookX, lookZ, 0.5f, 0.5f) < interactR) { interactObject("fridge"); return; }
                if (dist(lookX, lookZ, 2.5f, 0.3f) < interactR) { interactObject("stove"); return; }
                if (dist(lookX, lookZ, 3, 3.5f) < interactR) { interactObject("table"); return; }
                if (dist(lookX, lookZ, 0.5f, 0.5f) < interactR) { interactObject("note"); return; }
                if (dist(lookX, lookZ, 5.2f, 0.4f) < interactR) { interactObject("sink"); return; }
            }
            case "laboratory" -> {
                if (dist(playerX, playerZ, 4.5f, 8) < 1.8f) { loadRoom("hallway", 5, 5); return; }
                if (dist(lookX, lookZ, 2, 0.5f) < interactR) { interactObject("labConsole"); return; }
                if (dist(lookX, lookZ, 7, 0.5f) < interactR) { interactObject("labConsole"); return; }
                if (dist(lookX, lookZ, 5, 4) < interactR) { interactObject("desk"); return; }
                if (dist(lookX, lookZ, 5, 4) < interactR) { interactObject("note"); return; }
                if (dist(lookX, lookZ, 1, 6) < interactR) { interactObject("labEquip"); return; }
                if (dist(lookX, lookZ, 8, 6) < interactR) { interactObject("labEquip"); return; }
            }
            case "void_room" -> {
                if (dist(playerX, playerZ, 6, 12) < 1.8f) { loadRoom("hallway", 9, 5); return; }
            }
        }
    }

    private void interactObject(String obj) {
        String key = obj + "_" + currentRoom;
        int count = interactCounts.getOrDefault(key, 0) + 1;
        interactCounts.put(key, count);

        // Map objects to story.json dialogue events based on count and chapter
        if (obj.equals("bed") && count == 1) startDialogue("bed_interact");
        else if (obj.equals("nightstand") && count == 1) {
            startDialogue("nightstand_interact");
            addItem("bathroom_key", "Chave Enferrujada");
        }
        else if (obj.equals("pills") && count == 1) {
            startDialogue("pills_interact_1");
            addItem("pill_bottle", "Frasco de Remedios");
        }
        else if (obj.equals("pills") && count == 2) startDialogue("pills_interact_2");
        else if (obj.equals("photo") && count == 1) {
            startDialogue("photo_interact_1");
            addItem("photo_family", "Foto de Familia");
        }
        else if (obj.equals("photo") && count == 2) startDialogue("photo_interact_2");
        else if (obj.equals("bookshelf") && count == 1) startDialogue("bookshelf_interact");
        else if (obj.equals("bookshelf") && count == 2 && !inventory.contains("diary_page_1")) {
            addItem("diary_page_1", "Pagina do Diario (1)");
            System.out.println("[Interaction] Encontrou Pagina do Diario (1)");
        }
        else if (obj.equals("note") && count == 1) {
            interactCounts.put("note_kitchen", 1);
            startDialogue("note1_interact");
        }
        else if (obj.equals("couch") && count == 1) startDialogue("couch_interact");
        else if (obj.equals("couch") && count >= 2 && chapter >= 2 && !inventory.contains("diary_page_2")) {
            addItem("diary_page_2", "Pagina do Diario (2)");
            System.out.println("[Interaction] Encontrou Pagina do Diario (2)");
        }
        else if (obj.equals("chalkboard") && count == 1) {
            interactCounts.put("chalkboard_living_room", 1);
            startDialogue("chalkboard_interact");
        }
        else if (obj.equals("desk") && count >= 1 && chapter >= 4 && !inventory.contains("lab_keycard")) {
            addItem("lab_keycard", "Cartao de Acesso");
            System.out.println("[Interaction] Encontrou Cartao de Acesso");
        }
        else if (obj.equals("labConsole") && count >= 1) {
            if (!inventory.contains("diary_page_3")) addItem("diary_page_3", "Pagina do Diario (3)");
            startDialogue("lab_equipment_interact");
        }
        else if (obj.equals("fridge") && count == 1) startDialogue("fridge_interact");
        else if (obj.equals("sink") && count == 1) startDialogue("sink_interact");
        else if (obj.equals("bathtub") && count == 1) startDialogue("bathtub_interact");
        else if (obj.equals("tv") && count == 1) startDialogue("tv_interact_1");
        else if (obj.equals("mirror") && count == 1) startDialogue("mirror_interact_1");
        else if (obj.equals("mirror") && count >= 2) { startDialogue("mirror_interact_2"); sanity -= 8; }
        else if (obj.equals("window") && count == 1) startDialogue("window_interact");
        else if (obj.equals("stove") && count == 1) startDialogue("stove_interact");
        else if (obj.equals("toilet") && count == 1) startDialogue("toilet_interact");
        else if (obj.equals("wardrobe")) System.out.println("[Narrative] O armario esta trancado. Algo range la dentro.");
        else if (obj.equals("table")) System.out.println("[Narrative] Marcas de copos na mesa. Dezenas deles.");
        else {
            System.out.println("[Interaction] Examinou " + obj + " (x" + count + ")");
        }
    }

    private void addItem(String id, String name) {
        if (!inventory.contains(id)) {
            inventory.add(id);
            System.out.println("[Inventory] ++ " + name);
        }
    }

    private void checkProgress() {
        if (chapter == 1 && inventory.contains("bathroom_key") && roomVisits.size() >= 3 && !flags.getOrDefault("ch1done", false)) {
            flags.put("ch1done", true);
            startDialogue("doubt_begins");
            
            // Advance chapter
            chapter = 2;
            sanity -= 10;
            System.out.println("[Game] Capitulo 2: A Distorcao");
        }
        else if (chapter == 2 && inventory.contains("diary_page_1") && inventory.contains("photo_family") && interactCounts.getOrDefault("note_kitchen", 0) > 0 && !flags.getOrDefault("ch2done", false)) {
            flags.put("ch2done", true);
            System.out.println("[Game] Capitulo 3: Sombras do Passado");
            chapter = 3;
            sanity -= 15;
        }
        else if (chapter == 3 && inventory.contains("diary_page_2") && flags.getOrDefault("visitedMemory", false) && interactCounts.getOrDefault("chalkboard_living_room", 0) > 0 && !flags.getOrDefault("ch3done", false)) {
            flags.put("ch3done", true);
            System.out.println("[Game] Capitulo 4: A Revelacao");
            chapter = 4;
        }
        else if (chapter == 4 && inventory.contains("lab_keycard") && roomVisits.getOrDefault("laboratory", 0) > 0 && inventory.contains("diary_page_3") && !flags.getOrDefault("ch4done", false)) {
            flags.put("ch4done", true);
            System.out.println("[Game] Capitulo 5: O Limiar");
            startDialogue("void_revelation");
            chapter = 5;
        }
    }

    private float dist(float x1, float y1, float x2, float y2) {
        float dx = x1 - x2; float dy = y1 - y2;
        return (float)Math.sqrt(dx*dx + dy*dy);
    }

    private boolean isColliding(float px, float pz) {
        float pr = 0.3f; // player collision radius
        switch (currentRoom) {
            case "bedroom" -> {
                if (aabb(px, pz, pr, 1.5f, 1, 2.2f, 1.5f)) return true; // Bed
                if (aabb(px, pz, pr, 3.2f, 0.6f, 0.5f, 0.5f)) return true; // Nightstand
                if (aabb(px, pz, pr, 7, 0.5f, 1.2f, 0.6f)) return true; // Wardrobe
                if (aabb(px, pz, pr, 6f, 4.5f, 1.5f, 0.7f)) return true; // Desk
            }
            case "bathroom" -> {
                if (aabb(px, pz, pr, 0.8f, 0.8f, 2, 0.8f)) return true; // Bathtub
                if (aabb(px, pz, pr, 3.2f, 0.4f, 0.6f, 0.5f)) return true; // Sink
                if (aabb(px, pz, pr, 3.2f, 3, 0.5f, 0.6f)) return true; // Toilet
            }
            case "living_room" -> {
                if (aabb(px, pz, pr, 4, 2, 3, 1)) return true; // Couch
                if (aabb(px, pz, pr, 7.5f, 3, 0.6f, 1.5f)) return true; // Bookshelf
                if (aabb(px, pz, pr, 4, 4, 1.2f, 0.8f)) return true; // Table
            }
            case "kitchen" -> {
                if (aabb(px, pz, pr, 0.5f, 0.5f, 0.8f, 0.7f)) return true; // Fridge
                if (aabb(px, pz, pr, 2.5f, 0.3f, 0.8f, 0.6f)) return true; // Stove
                if (aabb(px, pz, pr, 4.5f, 0.3f, 1.5f, 0.6f)) return true; // Counter
                if (aabb(px, pz, pr, 3, 3.5f, 1.5f, 1)) return true; // Table
            }
            case "hallway" -> {
                // Hallway has no major furniture to collide with
            }
            case "laboratory" -> {
                if (aabb(px, pz, pr, 2, 0.5f, 3, 0.8f)) return true; // Console left
                if (aabb(px, pz, pr, 7, 0.5f, 2.5f, 0.8f)) return true; // Console right
                if (aabb(px, pz, pr, 5, 4, 2, 1)) return true; // Desk
                if (aabb(px, pz, pr, 1, 6, 1.5f, 1)) return true; // Equipment left
                if (aabb(px, pz, pr, 8, 6, 1.5f, 1)) return true; // Equipment right
            }
        }
        return false;
    }

    private boolean aabb(float px, float pz, float pr, float ox, float oz, float ow, float od) {
        float hW = ow / 2.0f;
        float hD = od / 2.0f;
        return (px + pr > ox - hW) && (px - pr < ox + hW) && 
               (pz + pr > oz - hD) && (pz - pr < oz + hD);
    }

    // Camera rotation stored here so movement follows look direction
    private float cameraYaw = 0;
    private float cameraPitch = 0;

    public void render(Renderer r, float dt) {
        if (inMenu || !playing) return;

        // Update camera position and rotation
        float bobY = (float)(Math.sin(walkTimer) * 0.05);
        r.setCamPos(playerX, playerHeight + bobY, playerZ);
        r.setYaw(cameraYaw);
        r.setPitch(cameraPitch);

        // Set lighting per room
        float flicker = 1 + (float)(Math.sin(System.currentTimeMillis() * 0.01) * 0.1);
        if (Math.random() < 0.02) flicker += (float)(Math.random() - 0.5) * 0.5;
        float intensity = 1.2f * flicker * (0.5f + sanity / 200f);

        switch (currentRoom) {
            case "bedroom"     -> r.setLight(4,2.8f,3, intensity, 0.9f,0.7f,0.4f);
            case "bathroom"    -> r.setLight(2,2.8f,2, intensity, 0.6f,0.7f,0.8f);
            case "living_room" -> r.setLight(4,2.8f,3, intensity, 0.9f,0.7f,0.5f);
            case "kitchen"     -> r.setLight(3,2.8f,3, intensity, 0.8f,0.8f,0.7f);
            case "laboratory"  -> r.setLight(5,2.8f,4, intensity, 0.5f,0.6f,0.7f);
            case "void_room"   -> r.setLight(6,2.8f,6, intensity*0.5f, 0.4f,0.3f,0.8f);
            default            -> r.setLight(5,2.8f,3, intensity, 0.8f,0.7f,0.5f);
        }

        // Fog based on sanity
        float fogD = 0.05f + (100 - Math.max(0, sanity)) / 800f;
        if (sanity < 40) {
            float bleed = (40 - Math.max(0, sanity)) / 40f;
            r.setFog(fogD, 0.04f + bleed * 0.2f, 0.03f - bleed*0.02f, 0.04f - bleed*0.03f);
        } else {
            r.setFog(fogD, 0.02f, 0.01f, 0.03f);
        }

        // === RENDER ROOM ===
        float h = 3.0f; // wall height

        // Floor
        r.drawBox(roomW/2, -0.05f, roomD/2, roomW, 0.1f, roomD, 0.1f, 0.09f, 0.12f);
        // Ceiling
        r.drawBox(roomW/2, h+0.05f, roomD/2, roomW, 0.1f, roomD, 0.04f, 0.03f, 0.06f);

        // Walls (4 sides with door gaps)
        float wt = 0.15f; // wall thickness
        // North wall
        r.drawBox(roomW/2, h/2, -wt/2, roomW, h, wt, 0.16f, 0.15f, 0.22f);
        // South wall (with door gap)
        float doorW = 1.0f;
        float doorCenter = roomW / 2;
        r.drawBox(doorCenter/2 - doorW/4, h/2, roomD+wt/2, doorCenter-doorW/2, h, wt, 0.16f,0.15f,0.22f);
        r.drawBox(doorCenter + doorCenter/2 + doorW/4, h/2, roomD+wt/2, roomW-doorCenter-doorW/2, h, wt, 0.16f,0.15f,0.22f);
        // East wall
        r.drawBox(roomW+wt/2, h/2, roomD/2, wt, h, roomD, 0.16f, 0.15f, 0.22f);
        // West wall
        r.drawBox(-wt/2, h/2, roomD/2, wt, h, roomD, 0.16f, 0.15f, 0.22f);

        // === FURNITURE ===
        renderFurniture(r);
    }

    public void renderUI(int winW, int winH) {
        if (uiRenderer == null || textRenderer == null) return;

        float uiW = Math.min(1024, winW * 0.9f);
        float uiH = uiW * 0.25f; // Keep aspect ratio
        float uiX = (winW - uiW) / 2.0f;
        float uiY = inMenu ? (winH - uiH) / 2.0f : winH - uiH - 20;

        if (inMenu) {
            String[] lines = new String[4];
            lines[0] = "";
            lines[1] = "            MEMORIAS PARTIDAS";
            lines[2] = "";
            lines[3] = "         [Aperte E para comecar]";
            textRenderer.updateText(lines);
            uiRenderer.renderQuad(uiX, uiY, uiW, uiH, textRenderer.getTextureId(), winW, winH);
            return;
        }

        if (!playing) return;

        // In-game UI
        String[] lines = new String[4];
        lines[0] = "Sanidade: " + Math.max(0, (int)sanity) + "% | Sala: " + currentRoom;
        if (currentDialogue != null && currentDialogue.size() > currentLineIdx) {
            StoryData.DialogueLine line = currentDialogue.get(currentLineIdx);
            lines[1] = line.isThought ? "[Pensamento]" : "[Narrativa]";
            lines[2] = line.text;
            if (line.choices != null && !line.choices.isEmpty()) {
                lines[3] = "1) " + line.choices.get(0).text;
            } else {
                lines[3] = "(Aperte E para continuar)";
            }
        } else {
            lines[1] = "Objetivos do Capitulo " + chapter + "...";
            lines[2] = "";
            lines[3] = "";
        }
        textRenderer.updateText(lines);
        
        uiRenderer.renderQuad(uiX, uiY, uiW, uiH, textRenderer.getTextureId(), winW, winH);
    }

    private void renderFurniture(Renderer r) {
        switch (currentRoom) {
            case "bedroom" -> {
                r.drawBox(1.5f, 0.2f, 1, 2.2f, 0.4f, 1.5f, 0.1f, 0.06f, 0.09f);
                r.drawBox(1.5f, 0.45f, 1, 2f, 0.1f, 1.3f, 0.2f, 0.08f, 0.05f);
                r.drawBox(0.4f, 0.6f, 1, 0.1f, 0.4f, 1.5f, 0.12f, 0.08f, 0.06f);
                r.drawBox(3.2f, 0.35f, 0.6f, 0.5f, 0.7f, 0.5f, 0.16f, 0.1f, 0.06f);
                r.drawBox(7, 1.1f, 0.5f, 1.2f, 2.2f, 0.6f, 0.12f, 0.09f, 0.06f);
                r.drawBox(6, 0.4f, 4.5f, 1.5f, 0.8f, 0.7f, 0.16f, 0.1f, 0.06f);
                r.drawBox(0.05f, 1.8f, 1.5f, 0.05f, 1.0f, 1.2f, 0.02f, 0.03f, 0.06f);
                r.drawBox(3.2f, 0.75f, 0.6f, 0.15f, 0.2f, 0.1f, 0.54f, 0.06f, 0.12f);
                r.drawBox(0.05f, 1.5f, 3f, 0.05f, 1.2f, 0.8f, 0.05f, 0.1f, 0.12f);
                r.drawBox(4f, 1.5f, 0.05f, 0.6f, 0.5f, 0.05f, 0.22f, 0.15f, 0.09f);
            }
            case "bathroom" -> {
                r.drawBox(0.8f, 0.3f, 0.8f, 2f, 0.6f, 0.8f, 0.29f, 0.28f, 0.28f);
                r.drawBox(3.2f, 0.45f, 0.4f, 0.6f, 0.9f, 0.5f, 0.23f, 0.23f, 0.23f);
                r.drawBox(3.95f, 1.5f, 0.6f, 0.05f, 1f, 0.7f, 0.05f, 0.1f, 0.12f);
                r.drawBox(3.2f, 0.25f, 3f, 0.5f, 0.5f, 0.6f, 0.35f, 0.35f, 0.35f);
            }
            case "hallway" -> {
                r.drawBox(2f, 1.5f, 0.05f, 0.5f, 0.4f, 0.05f, 0.22f, 0.15f, 0.09f);
                r.drawBox(8f, 1.5f, 0.05f, 0.5f, 0.4f, 0.05f, 0.22f, 0.15f, 0.09f);
            }
            case "living_room" -> {
                r.drawBox(4, 0.3f, 2, 3, 0.5f, 1, 0.1f, 0.06f, 0.15f);
                r.drawBox(4, 0.6f, 1.55f, 3, 0.3f, 0.1f, 0.1f, 0.06f, 0.15f);
                r.drawBox(4, 1.5f, 0.15f, 1.5f, 1, 0.15f, 0.04f, 0.04f, 0.04f);
                r.drawBox(4, 0.25f, 4, 1.2f, 0.5f, 0.8f, 0.16f, 0.1f, 0.06f);
                r.drawBox(7.5f, 1.1f, 3, 0.6f, 2.2f, 1.5f, 0.12f, 0.08f, 0.03f);
                r.drawBox(2f, 1.5f, 6.9f, 2f, 1.5f, 0.1f, 0.1f, 0.22f, 0.16f);
            }
            case "kitchen" -> {
                r.drawBox(0.5f, 1, 0.5f, 0.8f, 2, 0.7f, 0.35f, 0.35f, 0.34f);
                r.drawBox(2.5f, 0.45f, 0.3f, 0.8f, 0.9f, 0.6f, 0.1f, 0.1f, 0.1f);
                r.drawBox(4.5f, 0.45f, 0.3f, 1.5f, 0.9f, 0.6f, 0.16f, 0.15f, 0.15f);
                r.drawBox(3, 0.4f, 3.5f, 1.5f, 0.8f, 1, 0.16f, 0.1f, 0.06f);
                r.drawBox(5.2f, 0.45f, 0.4f, 0.6f, 0.9f, 0.5f, 0.23f, 0.23f, 0.23f);
            }
            case "laboratory" -> {
                r.drawBox(2, 0.6f, 0.5f, 3, 1.2f, 0.8f, 0.12f, 0.13f, 0.17f);
                r.drawBox(7, 0.6f, 0.5f, 2.5f, 1.2f, 0.8f, 0.12f, 0.13f, 0.17f);
                r.drawBox(5, 0.4f, 4, 2, 0.8f, 1, 0.16f, 0.1f, 0.06f);
                r.drawBox(1, 0.75f, 6, 1.5f, 1.5f, 1, 0.15f, 0.16f, 0.18f);
                r.drawBox(8, 0.75f, 6, 1.5f, 1.5f, 1, 0.15f, 0.16f, 0.18f);
            }
            case "void_room" -> {
                // Empty - the void has no furniture
            }
        }

        // Render shadow entity if active
        if (shadowActive) {
            float bob = (float)(Math.sin(System.currentTimeMillis() * 0.005) * 0.1f);
            r.drawBoxRotated(shadowX, 1.0f + bob, shadowZ, 0.6f, 2.0f, 0.6f, 0.0f, 0.0f, 0.0f, cameraYaw);
        }
    }

    public void cleanup() {
        if (textRenderer != null) textRenderer.cleanup();
        if (uiRenderer != null) uiRenderer.cleanup();
        System.out.println("[Game] Cleanup completo.");
    }

    // Getters
    public float getSanity() { return sanity; }
    public int getChapter() { return chapter; }
    public String getCurrentRoom() { return currentRoom; }
}
