/* ===== STORY DATA - Rooms, Dialogues, Events, Chapters ===== */
(function() {
  'use strict';

  const PILL_COLORS = ['#e94560', '#4a90d9', '#4fd97a', '#d9d94f', '#d94fd9', '#ff8844'];

  const Story = {
    pillColors: PILL_COLORS,
    currentPillColor: 0,

    getRandomPillColor() {
      const idx = Math.floor(Math.random() * PILL_COLORS.length);
      return PILL_COLORS[idx];
    },

    /* ===== ROOM DEFINITIONS ===== */
    rooms: {
      bedroom: {
        name: 'Quarto',
        map: [
          '####################',
          '#W.....I..........W#',
          '#......E...........#',
          '#..BBBB............#',
          '#..BBBB.......A....#',
          '#..................#',
          '#..................#',
          '#..................#',
          '#.........G........#',
          '#.........G........#',
          '########D#########D#',
        ],
        doors: {
          'D_8': { target: 'hallway', spawnX: 1, spawnY: 3 },
          'D_19': { target: 'living_room', spawnX: 1, spawnY: 5 },
        },
        objects: {
          'B': { id: 'bed', name: 'Cama' },
          'I': { id: 'nightstand', name: 'Criado-mudo' },
          'E': { id: 'lamp', name: 'Abajur' },
          'A': { id: 'bookshelf', name: 'Estante' },
          'W': { id: 'window_bedroom', name: 'Janela' },
        },
        darkRadius: 80,
      },

      hallway: {
        name: 'Corredor',
        map: [
          '####D###D###D#######',
          '#..................#',
          '#..F...F...F.......#',
          '#..................#',
          '#..................#',
          '#..................#',
          '#..................#',
          '#..................#',
          '#...........F......#',
          '#..................#',
          '########D###########',
        ],
        doors: {
          'D_4': { target: 'bathroom', spawnX: 9, spawnY: 8 },
          'D_7': { target: 'bedroom', spawnX: 9, spawnY: 8 },
          'D_11': { target: 'kitchen', spawnX: 9, spawnY: 8 },
          'D_8': { target: 'living_room', spawnX: 9, spawnY: 1 },
        },
        objects: {
          'F': { id: 'photo', name: 'Foto na parede' },
        },
        darkRadius: 70,
      },

      bathroom: {
        name: 'Banheiro',
        map: [
          '####################',
          '#..........M.......#',
          '#..........M.......#',
          '#..................#',
          '#..U...............#',
          '#..U........K......#',
          '#...........K......#',
          '#.......P..........#',
          '#......L...........#',
          '#..................#',
          '########D###########',
        ],
        doors: {
          'D_8': { target: 'hallway', spawnX: 4, spawnY: 4 },
        },
        objects: {
          'M': { id: 'mirror', name: 'Espelho' },
          'P': { id: 'pills', name: 'Frasco de remédios' },
          'L': { id: 'toilet', name: 'Vaso' },
          'U': { id: 'bathtub', name: 'Banheira' },
          'K': { id: 'sink', name: 'Pia' },
        },
        darkRadius: 65,
      },

      kitchen: {
        name: 'Cozinha',
        map: [
          '####D###############',
          '#..................#',
          '#..R..O............#',
          '#..................#',
          '#..................#',
          '#..........T.C.....#',
          '#..........T.C.....#',
          '#..................#',
          '#..................#',
          '#.N................#',
          '###############D####',
        ],
        doors: {
          'D_4': { target: 'hallway', spawnX: 11, spawnY: 4 },
          'D_15': { target: 'living_room', spawnX: 15, spawnY: 1 },
        },
        objects: {
          'R': { id: 'fridge', name: 'Geladeira' },
          'O': { id: 'stove', name: 'Fogão' },
          'T': { id: 'kitchen_table', name: 'Mesa' },
          'N': { id: 'note1', name: 'Papel amassado' },
        },
        darkRadius: 70,
      },

      living_room: {
        name: 'Sala de Estar',
        map: [
          '####D##########D####',
          '#W.....F..F......W.#',
          '#..................#',
          '#..................#',
          '#.HH...........V...#',
          '#.HH...........V...#',
          '#..................#',
          '#..................#',
          '#..........G.G.....#',
          '#..........G.G.....#',
          'D###################',
        ],
        doors: {
          'D_4': { target: 'kitchen', spawnX: 15, spawnY: 8 },
          'D_15': { target: 'bedroom', spawnX: 18, spawnY: 8 },
          'D_0': { target: 'hallway', spawnX: 8, spawnY: 1 },
        },
        objects: {
          'V': { id: 'tv', name: 'Televisão' },
          'H': { id: 'couch', name: 'Sofá' },
          'F': { id: 'photo_living', name: 'Foto' },
          'W': { id: 'window_living', name: 'Janela' },
        },
        darkRadius: 75,
      },

      /* Chapter 3+: Memory rooms */
      memory_wedding: {
        name: '???',
        map: [
          '####################',
          '#GGGGGGGGGGGGGGGGGG#',
          '#G................G#',
          '#G.....CC.CC......G#',
          '#G.....CC.CC......G#',
          '#G................G#',
          '#G......HH........G#',
          '#G......HH........G#',
          '#G................G#',
          '#GGGGGGGGGGGGGGGGGG#',
          '####################',
        ],
        doors: {},
        objects: {},
        darkRadius: 90,
        special: 'memory',
      },

      memory_hospital: {
        name: '???',
        map: [
          '####################',
          '#..................#',
          '#..BBBB............#',
          '#..BBBB....S.......#',
          '#..............E...#',
          '#..................#',
          '#..................#',
          '#......C...C.......#',
          '#..................#',
          '#..................#',
          '####################',
        ],
        doors: {},
        objects: {},
        darkRadius: 60,
        special: 'memory',
      },

      /* Chapter 4: Laboratory */
      laboratory: {
        name: 'Laboratório',
        map: [
          '####################',
          '#..XX.......XX.....#',
          '#..XX.......XX.....#',
          '#..................#',
          '#......T...........#',
          '#......T..N........#',
          '#..................#',
          '#..S...........XX..#',
          '#..S...........XX..#',
          '#........N.........#',
          '###############D####',
        ],
        doors: {
          'D_15': { target: 'void_room', spawnX: 10, spawnY: 5 },
        },
        objects: {
          'X': { id: 'lab_equipment', name: 'Equipamento' },
          'N': { id: 'lab_note', name: 'Anotação científica' },
          'T': { id: 'lab_table', name: 'Mesa de trabalho' },
          'S': { id: 'lab_shelf', name: 'Prateleira' },
        },
        darkRadius: 85,
      },

      /* Chapter 5: The Void */
      void_room: {
        name: 'A Dobra',
        map: [
          '....................',
          '...........##.......',
          '..##................',
          '....................',
          '........GGG.........',
          '........GGG.........',
          '........GGG.........',
          '....................',
          '....................',
          '...##..........##...',
          '....................',
        ],
        doors: {},
        objects: {},
        darkRadius: 100,
        special: 'void',
      },
    },

    /* ===== DIALOGUE DATA ===== */
    dialogues: {
      /* Chapter 1 */
      wake_up: [
        { text: '...', isThought: true },
        { text: 'Mais um dia.', isThought: true },
        { text: 'Não sei quanto tempo dormi. Parece que foi muito... ou nada.', isThought: true },
        { text: 'Preciso tomar meu remédio.', isThought: true },
      ],

      bed_interact: [
        { text: 'Lençóis amarrotados. Não lembro de quando lavei pela última vez.', isThought: true },
      ],

      nightstand_interact: [
        { text: 'Tem um copo de água pela metade. Desde quando ele está aqui?', isThought: true },
      ],

      lamp_interact: [
        { text: 'A luz pisca por um instante.', isThought: true },
      ],

      bookshelf_interact: [
        { text: 'Livros empoeirados. Não leio há...', isThought: true },
        { text: '...há quanto tempo mesmo?', isThought: true },
      ],

      window_interact: [
        { text: 'Lá fora está escuro. Sempre está escuro.', isThought: true },
      ],

      photo_interact_1: [
        { text: 'Uma foto na parede.', isThought: true },
        { text: 'Tem... uma mulher. Ela parece familiar.', isThought: true },
        { text: 'Quem é ela?', isThought: true },
      ],

      photo_interact_2: [
        { text: 'Olho a foto de novo.', isThought: true },
        { text: 'Espera... a mulher está diferente. Mais velha? Ou mais nova?', isThought: true, glitch: true },
        { text: 'Não... deve ser impressão minha.', isThought: true },
      ],

      mirror_interact_1: [
        { text: 'Meu reflexo me encara de volta.', isThought: true },
        { text: 'Olheiras profundas. Olhos vazios.', isThought: true },
        { text: 'Há quanto tempo estou assim?', isThought: true },
      ],

      mirror_interact_2: [
        { text: 'Olho no espelho de novo.', isThought: true },
        { text: '...', isThought: true },
        { text: 'Espera. Meu reflexo... ele piscou antes de mim?', isThought: true, glitch: true },
        { text: 'Não. Impossível. São os remédios.', isThought: true },
      ],

      mirror_interact_3: [
        { text: 'O reflexo...', isThought: true },
        { text: 'Ele está sorrindo.', isThought: true, glitch: true },
        { text: 'EU NÃO ESTOU SORRINDO.', isThought: true, glitch: true },
      ],

      pills_interact_1: [
        { text: 'Meu frasco de antidepressivos.', isThought: true },
        {
          text: 'As cápsulas... elas eram vermelhas ontem. Agora parecem... azuis?',
          isThought: true,
          glitch: true,
        },
        {
          text: 'O que eu faço?',
          choices: [
            { text: 'Tomar o remédio', action: function() {
              G.Sanity.change(-10, 'pill_taken');
              G.state.flags.tookPill1 = true;
              G.Dialogue.showSequence([
                { text: 'Engulo a cápsula.', isThought: true },
                { text: 'Um gosto metálico. Diferente do normal.', isThought: true },
                { text: 'O chão parece tremer por um instante.', isThought: true, glitch: true },
              ]);
            }},
            { text: 'Não tomar', action: function() {
              G.Sanity.change(5, 'pill_refused');
              G.state.flags.refusedPill1 = true;
              G.Dialogue.showSequence([
                { text: 'Coloco o frasco de volta.', isThought: true },
                { text: 'Algo me diz que não deveria tomar isso.', isThought: true },
              ]);
            }},
          ],
        },
      ],

      pills_interact_2: [
        { text: 'As cápsulas mudaram de cor de novo.', isThought: true, glitch: true },
        { text: 'Isso não é normal. Remédios não mudam de cor.', isThought: true },
        { text: 'A não ser que...', isThought: true },
        { text: 'Não. Para de pensar nisso.', isThought: true },
      ],

      tv_interact_1: [
        { text: 'A TV está desligada. Não lembro de ter desligado.', isThought: true },
        { text: 'Aperto o botão. Nada acontece.', isThought: true },
        { text: '...', isThought: true },
        { text: 'Espera. O reflexo na tela. Tem alguém atrás de mim?', isThought: true, glitch: true },
        { text: 'Me viro rápido. Ninguém.', isThought: true },
      ],

      couch_interact: [
        { text: 'O sofá tem uma marca, como se alguém menor estivesse sentado aqui.', isThought: true },
        { text: 'Uma criança?', isThought: true },
        { text: 'Eu não tenho filhos... tenho?', isThought: true },
      ],

      fridge_interact: [
        { text: 'Quase vazia. Leite vencido e algo que já foi comida.', isThought: true },
      ],

      stove_interact: [
        { text: 'Fogão frio. Não cozinho há dias. Semanas?', isThought: true },
      ],

      kitchen_table_interact: [
        { text: 'Restos de uma refeição. Mas... tem dois pratos.', isThought: true },
        { text: 'Dois pratos. Eu moro sozinho.', isThought: true },
        { text: '...não moro?', isThought: true, glitch: true },
      ],

      note1_interact: [
        { text: 'Um papel amassado no chão.', isThought: true },
        { text: '"Resultados preliminares indicam flutuações no campo..."', isThought: true },
        { text: 'O resto está ilegível. Parece minha letra mas... mais organizada.', isThought: true },
        { text: 'Como se eu fosse outra pessoa quando escrevi isso.', isThought: true },
      ],

      /* Chapter 2+ events */
      floating_object: [
        { text: 'O que...', isThought: true },
        { text: 'O livro está flutuando. FLUTUANDO.', isThought: true, glitch: true },
        { text: 'Não existe gravidade aqui?', isThought: true },
        { text: 'Isso não pode ser real.', isThought: true },
      ],

      static_event: [
        { text: '*KSSSHHHHHH*', glitch: true },
        { text: 'Estática. De onde vem esse som?', isThought: true },
        { text: 'Não tem nenhum aparelho ligado.', isThought: true },
      ],

      /* Chapter 3: Memory fragments */
      memory_wife_death_1: [
        { text: 'Um flash. Uma memória.', isThought: true },
        { text: 'Ana... minha esposa. Ela estava doente.', isThought: true },
        { text: 'Hospital. Máquinas apitando.', isThought: true, glitch: true },
        { text: 'Mas espera... ela não morreu num acidente?', isThought: true },
        { text: 'Qual memória é a verdadeira?', isThought: true, glitch: true },
      ],

      memory_daughter: [
        { text: 'Uma risada de criança. Clara e cristalina.', isThought: true },
        { text: '"Papai!"', speaker: '???' },
        { text: 'Eu... eu tenho uma filha?', isThought: true },
        { text: 'Sofia. O nome vem naturalmente. Sofia.', isThought: true },
        { text: 'Mas eu nunca tive filhos.', isThought: true },
        { text: '...tive?', isThought: true, glitch: true },
      ],

      /* Chapter 4: Laboratory */
      lab_note_1: [
        { text: 'Uma anotação em um quadro branco:', isThought: true },
        { text: '"Projeto Horizonte - Fase 3"', isThought: false },
        { text: '"Resultados da colisão de partículas confirmam: sobreposição quântica macroscópica é possível."', isThought: false },
        { text: 'Esta é... minha pesquisa?', isThought: true },
        { text: 'Eu sou... eu era... um físico?', isThought: true },
      ],

      lab_note_2: [
        { text: 'Outra anotação. Minha letra, mais apressada:', isThought: true },
        { text: '"A dobra está se expandindo. Não é mais teórica."', isThought: false },
        { text: '"As leis da física locais estão se dissolvendo."', isThought: false },
        { text: '"Estou vendo versões de mim mesmo."', isThought: false, glitch: true },
        { text: 'Meu Deus.', isThought: true },
      ],

      lab_equipment_interact: [
        { text: 'Um acelerador de partículas em miniatura.', isThought: true },
        { text: 'Os mostradores estão todos em zero. Ou infinito. É difícil dizer.', isThought: true },
        { text: 'Há marcas de queimadura ao redor. Algo deu muito errado aqui.', isThought: true, glitch: true },
      ],

      /* Chapter 5: The Void */
      void_revelation: [
        { text: 'As paredes... estão desaparecendo.', isThought: true },
        { text: 'Não há paredes. Nunca houve.', isThought: true, glitch: true },
        { text: 'Eu entendo agora.', isThought: true },
        { text: 'O Projeto Horizonte funcionou. Funcionou demais.', isThought: true },
        { text: 'Eu criei uma dobra no espaço-tempo.', isThought: true },
        { text: 'E fui puxado para dentro dela.', isThought: true },
        { text: 'As leis da física não existem aqui.', isThought: true, glitch: true },
        { text: 'Os multiversos são reais. E estão todos aqui. Comigo.', isThought: true, glitch: true },
        { text: 'Ana morreu de formas diferentes em cada um deles.', isThought: true },
        { text: 'Sofia existe em alguns. Em outros, não.', isThought: true },
        { text: 'Os remédios... as cápsulas que mudavam de cor...', isThought: true },
        { text: 'Eram de outros universos. Materializando aqui.', isThought: true, glitch: true },
      ],

      /* Endings */
      ending_observer: [
        { text: 'Eu entendo agora o que aconteceu.', isThought: true },
        { text: 'Sou um observador. Preso entre infinitas realidades.', isThought: true },
        { text: 'Posso ver todas as versões de mim mesmo.', isThought: true },
        { text: 'Todas as vidas que vivi. Que poderia ter vivido.', isThought: true },
        { text: 'Não há como voltar. A dobra é permanente.', isThought: true },
        { text: 'Mas há uma certa... paz nisso.', isThought: true },
        { text: 'Eu posso ver Ana. Todas as Anas. Todas as Sofias.', isThought: true },
        { text: 'Vivas, em algum lugar. Em algum quando.', isThought: true },
        { text: 'E isso... isso é o suficiente.', isThought: true },
      ],

      ending_collapse: [
        { text: 'Não aguento mais.', isThought: true, glitch: true },
        { text: 'As realidades estão colapsando.', isThought: true, glitch: true },
        { text: 'Tudo se comprime em um único ponto.', isThought: true, glitch: true },
        { text: 'Todo universo. Toda possibilidade.', isThought: true, glitch: true },
        { text: 'Concentrados aqui. Em mim.', isThought: true, glitch: true },
        { text: '...', isThought: true },
        { text: 'E se o Big Bang...', isThought: true },
        { text: '...foi alguém como eu...', isThought: true, glitch: true },
        { text: '...tentando voltar?', isThought: true },
      ],

      ending_choice: [
        { text: 'Eu posso escolher.', isThought: true },
        { text: 'Entre todas essas realidades... eu posso escolher uma.', isThought: true },
        { text: 'Não vai ser real. Eu sei disso.', isThought: true },
        { text: 'Mas se eu acreditar forte o suficiente...', isThought: true },
        { text: 'Tem uma onde Sofia está lá. Esperando por mim.', isThought: true },
        { text: '"Papai! Você demorou!"', speaker: 'Sofia' },
        { text: 'Eu sorrio. Pela primeira vez em...', isThought: true },
        { text: 'Não importa.', isThought: true },
      ],

      final_choice: [
        {
          text: 'O que eu faço?',
          choices: [
            { text: 'Aceitar e observar', action: function() {
              G.state.ending = 'observer';
            }},
            { text: 'Escolher Sofia', action: function() {
              G.state.ending = 'choice';
            }},
            { text: 'Deixar tudo colapsar', action: function() {
              G.state.ending = 'collapse';
            }},
          ],
        },
      ],
    },

    /* ===== CHAPTER PROGRESSION ===== */
    chapters: {
      1: {
        name: 'A Rotina',
        startRoom: 'bedroom',
        availableRooms: ['bedroom', 'hallway', 'bathroom', 'kitchen', 'living_room'],
        events: ['wake_up'],
        unlockCondition: null,
      },
      2: {
        name: 'A Dúvida',
        startRoom: 'bedroom',
        availableRooms: ['bedroom', 'hallway', 'bathroom', 'kitchen', 'living_room'],
        events: ['floating_object', 'static_event'],
        unlockCondition: function(flags) { return flags.tookPill1 || flags.refusedPill1; },
      },
      3: {
        name: 'Fragmentos',
        startRoom: 'hallway',
        availableRooms: ['bedroom', 'hallway', 'bathroom', 'kitchen', 'living_room', 'memory_wedding', 'memory_hospital'],
        events: ['memory_wife_death_1', 'memory_daughter'],
        unlockCondition: function(flags) { return flags.ch2_complete; },
      },
      4: {
        name: 'O Laboratório',
        startRoom: 'hallway',
        availableRooms: ['bedroom', 'hallway', 'bathroom', 'kitchen', 'living_room', 'laboratory'],
        events: ['lab_note_1', 'lab_note_2'],
        unlockCondition: function(flags) { return flags.ch3_complete; },
      },
      5: {
        name: 'A Dobra',
        startRoom: 'laboratory',
        availableRooms: ['laboratory', 'void_room'],
        events: ['void_revelation'],
        unlockCondition: function(flags) { return flags.ch4_complete; },
      },
    },
  };

  window.G = window.G || {};
  window.G.Story = Story;
})();
