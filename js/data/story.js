/* ===== STORY DATA - Rooms, Dialogues, Chapters ===== */
(function() {
  'use strict';

  const Story = {
    /* ===== ROOMS =====
       Each room is 20x11 tiles (480x264 at 24px)
       Connected via D (doors) with explicit mappings
       Legend:
         # = wall, . = floor, D = door, B = bed, T = table
         C = chair, S = cabinet, M = mirror, P = pills
         V = TV, F = photo, W = window, K = sink
         L = toilet, U = bathtub, R = fridge, O = stove
         H = couch, A = bookshelf, E = lamp, I = nightstand
         N = note, G = rug, X = lab equipment, Q = console, Z = void
    */
    rooms: {
      bedroom: {
        name: 'Quarto',
        map: [
          '####################',
          '#W......F.........W#',
          '#.................A#',
          '#..BBBB...........A#',
          '#..BBBB............#',
          '#..........G.......#',
          '#I.........G.......#',
          '#E.........G.......#',
          '#..................#',
          '#.................P#',
          '########D###D######',
        ],
        doors: {
          'D_8': { target: 'hallway', spawnX: 3, spawnY: 1 },
          'D_12': { target: 'bathroom', spawnX: 9, spawnY: 8 },
        },
        darkRadius: 130,
      },

      bathroom: {
        name: 'Banheiro',
        map: [
          '####################',
          '#.........K........#',
          '#.........K........#',
          '#..................#',
          '#.M................#',
          '#..................#',
          '#......L...........#',
          '#..................#',
          '#........UUU.......#',
          '#........UUU......D#',
          '####################',
        ],
        doors: {
          'D_18': { target: 'bedroom', spawnX: 12, spawnY: 9 },
        },
        darkRadius: 110,
      },

      hallway: {
        name: 'Corredor',
        map: [
          '##D#####D###D######',
          '#.................A#',
          '#..G..............A#',
          '#..G...............#',
          '#..G...............#',
          '#..................#',
          '#..........F.......#',
          '#E.................#',
          '#..................#',
          '#..................#',
          '##D########D#######',
        ],
        doors: {
          'D_2_top': { target: 'bedroom', spawnX: 8, spawnY: 9 },
          'D_8_top': { target: 'living_room', spawnX: 9, spawnY: 9 },
          'D_12_top': { target: 'kitchen', spawnX: 9, spawnY: 9 },
          'D_2_bot': { target: 'laboratory', spawnX: 9, spawnY: 1 },
          'D_13_bot': { target: 'void_room', spawnX: 9, spawnY: 1 },
        },
        darkRadius: 120,
      },

      living_room: {
        name: 'Sala de Estar',
        map: [
          '####################',
          '#W.....V.........W.#',
          '#..................#',
          '#..HHH.............#',
          '#..HHH.......A....#',
          '#.............A....#',
          '#..................#',
          '#.........T........#',
          '#........CTC.......#',
          '#..................#',
          '#########D#########',
        ],
        doors: {
          'D_9': { target: 'hallway', spawnX: 8, spawnY: 1 },
        },
        darkRadius: 140,
      },

      kitchen: {
        name: 'Cozinha',
        map: [
          '####################',
          '#..OOO.....R.......#',
          '#..OOO.....R.......#',
          '#..................#',
          '#..............N...#',
          '#...TTTT...........#',
          '#...CCCC...........#',
          '#..................#',
          '#..................#',
          '#.................K#',
          '#########D#########',
        ],
        doors: {
          'D_9': { target: 'hallway', spawnX: 12, spawnY: 1 },
        },
        darkRadius: 130,
      },

      laboratory: {
        name: 'Laboratorio',
        map: [
          '####################',
          '#..XXX......QQQ....#',
          '#..XXX......QQQ....#',
          '#..................#',
          '#...N..............#',
          '#.........T........#',
          '#........NTN.......#',
          '#.........T........#',
          '#..................#',
          '#..XX.........XX...#',
          '#########D#########',
        ],
        doors: {
          'D_9': { target: 'hallway', spawnX: 2, spawnY: 9 },
        },
        darkRadius: 120,
      },

      void_room: {
        name: '???',
        map: [
          'ZZZZZZZZZZZZZZZZZZZZ',
          'Z..................Z',
          'Z..................Z',
          'Z..................Z',
          'Z..................Z',
          'Z..................Z',
          'Z..................Z',
          'Z..................Z',
          'Z..................Z',
          'Z..................Z',
          'ZZZZZZZZDZZZZZZZZZZZ',
        ],
        doors: {
          'D_8': { target: 'hallway', spawnX: 13, spawnY: 9 },
        },
        darkRadius: 180,
      },
    },

    /* ===== DIALOGUES ===== */
    dialogues: {
      wake_up: [
        { text: '...', isThought: true },
        { text: 'Mais um dia.', isThought: true },
        { text: 'A cabeca pesa. Os olhos ardem.', isThought: true },
        { text: 'Eu devia tomar meu remedio...', isThought: true },
        { text: 'Mas a capsula... mudou de cor?', isThought: true },
      ],

      bed_interact: [
        { text: 'Minha cama. O unico lugar que parece seguro.', isThought: true },
        { text: 'Mas os sonhos nao sao melhores que a realidade.', isThought: true },
      ],

      nightstand_interact: [
        { text: 'O criado-mudo. Gaveta cheia de coisas que nao reconheco.', isThought: true },
      ],

      lamp_interact: [
        { text: 'A luz pisca. Sempre piscou assim?', isThought: true },
      ],

      bookshelf_interact: [
        { text: 'Livros... nao me lembro de ter lido nenhum deles.', isThought: true },
        { text: 'Espera. "Mecanica Quantica Avancada"?', isThought: true },
        { text: 'Por que eu teria isso?', isThought: true },
      ],

      window_interact: [
        { text: 'La fora... esta diferente do que eu lembrava.', isThought: true },
        { text: 'As estrelas parecem estar no lugar errado.', isThought: true },
      ],

      pills_interact_1: [
        { text: 'Meus remedios. Antidepressivos.', isThought: true },
        { text: 'A capsula esta... vermelha? Ela era azul ontem.', isThought: true },
        { text: 'Deve ser coisa da minha cabeca.', isThought: true },
        {
          text: 'Tomar o remedio?',
          choices: [
            { text: 'Sim, tomar', effect: { flag: 'tookPill1', sanity: 10 } },
            { text: 'Nao, algo esta errado', effect: { flag: 'refusedPill1', sanity: -5 } },
          ],
        },
      ],

      pills_interact_2: [
        { text: 'Os remedios mudaram de cor de novo.', isThought: true },
        { text: 'Isso nao e normal. NADA disso e normal.', isThought: true },
      ],

      mirror_interact_1: [
        { text: 'Meu reflexo me olha de volta.', isThought: true },
        { text: 'Pareco cansado. Velho demais para a idade que tenho.', isThought: true },
      ],

      mirror_interact_2: [
        { text: 'O reflexo... demorou para se mover.', isThought: true },
        { text: 'Nao. Impossivel. E o cansaco.', isThought: true },
      ],

      mirror_interact_3: [
        { text: 'O reflexo SORRIU.', isThought: true },
        { text: 'EU NAO ESTOU SORRINDO.', isThought: true },
      ],

      photo_interact_1: [
        { text: 'Uma foto na parede. Uma familia.', isThought: true },
        { text: 'Uma mulher sorrindo, uma crianca nos bracos.', isThought: true },
        { text: 'Sao... meus? Eu tive uma filha?', isThought: true },
      ],

      photo_interact_2: [
        { text: 'A foto... mudou.', isThought: true },
        { text: 'Agora so tem EU na foto. Sozinho.', isThought: true },
        { text: 'Ou... sempre foi assim?', isThought: true },
      ],

      tv_interact_1: [
        { text: 'A TV so mostra estatica.', isThought: true },
        { text: 'Mas entre o chiado... vozes?', isThought: true },
        { text: '"...colapso da funcao de onda... estabilizando..."', isThought: true },
      ],

      couch_interact: [
        { text: 'O sofa esta frio. Como se ninguem sentasse nele ha anos.', isThought: true },
      ],

      fridge_interact: [
        { text: 'A geladeira esta quase vazia.', isThought: true },
        { text: 'As datas nos produtos... sao de anos diferentes.', isThought: true },
      ],

      stove_interact: [
        { text: 'O fogao. Nao me lembro da ultima vez que cozinhei.', isThought: true },
      ],

      kitchen_table_interact: [
        { text: 'A mesa da cozinha. Marcas de uso, mas parece abandonada.', isThought: true },
      ],

      note1_interact: [
        { text: 'Um bilhete na geladeira... minha letra?', isThought: true },
        { text: '"NAO ESQUECER: O EXPERIMENTO NAO PODE FALHAR"', isThought: true },
        { text: 'Que experimento?!', isThought: true },
      ],

      // === Chapter 2: A Duvida ===
      doubt_begins: [
        { text: 'As paredes... estao respirando?', isThought: true },
        { text: 'Nao. E a luz. A luz esta ERRADA.', isThought: true },
        { text: 'O espectro visivel esta falhando.', isThought: true },
      ],

      floating_object: [
        { text: 'Aquilo esta... flutuando?!', isThought: true },
        { text: 'Nao. Deve ser uma vertigem. Os remedios.', isThought: true },
      ],

      static_event: [
        { text: 'Essa estatica... vem de todo lugar.', isThought: true },
        { text: 'Nao e som. E como se a propria realidade chiasse.', isThought: true },
        { text: 'Radiacao cosmica de fundo?! Aqui dentro?!', isThought: true },
      ],

      // === Chapter 3: Fragmentos ===
      memory_wife_death_1: [
        { text: '...Maria...', isThought: true },
        { text: 'Ela morreu em um acidente de carro.', isThought: true },
        { text: 'Nao... Ela morreu de doenca. No hospital.', isThought: true },
        { text: 'Nao... Eu a VI ontem. Ela esta viva?!', isThought: true },
        { text: 'QUAL MEMORIA E REAL?', isThought: true },
      ],

      memory_daughter: [
        { text: '"Papai! Voce demorou!"', isThought: true },
        { text: 'Uma menina corre em minha direcao.', isThought: true },
        { text: 'Minha filha... mas eu nao tenho uma filha.', isThought: true },
        { text: 'Ou tenho?', isThought: true },
      ],

      // === Chapter 4: O Laboratorio ===
      lab_note_1: [
        { text: 'Um diario de laboratorio. Minha caligrafia.', isThought: true },
        { text: '"Dia 147: O acelerador esta estavel."', isThought: true },
        { text: '"A anomalia quantica se intensifica."', isThought: true },
        { text: '"Se meus calculos estiverem certos..."', isThought: true },
        { text: '"...poderemos observar a sobreposicao em escala macroscopica."', isThought: true },
      ],

      lab_note_2: [
        { text: 'Mais anotacoes...', isThought: true },
        { text: '"Dia 203: O ACIDENTE."', isThought: true },
        { text: '"A funcao de onda nao colapsou. Eu estou DENTRO dela."', isThought: true },
        { text: '"Todas as realidades existem simultaneamente."', isThought: true },
        { text: '"Eu sou o observador preso dentro da caixa de Schrodinger."', isThought: true },
      ],

      lab_equipment_interact: [
        { text: 'Equipamento de laboratorio. Isso e... MEU?', isThought: true },
        { text: 'Os monitores mostram dados quanticos. Funcoes de onda.', isThought: true },
        { text: 'Eu ENTENDO esses dados. Eu sou um fisico.', isThought: true },
      ],

      // === Chapter 5: A Dobra ===
      void_revelation: [
        { text: 'Eu entendo agora.', isThought: true },
        { text: 'A estatica nao eram fantasmas.', isThought: true },
        { text: 'E a radiacao cosmica de fundo vazando para ca.', isThought: true },
        { text: 'As distorcoes da luz sao falhas no espectro visivel.', isThought: true },
        { text: 'Eu nao perdi a razao.', isThought: true },
        { text: 'Eu estou VIVENDO o multiverso.', isThought: true },
        { text: 'As memorias conflitantes da minha esposa...', isThought: true },
        { text: '...a filha que tive e nao tive...', isThought: true },
        { text: '...sao realidades de OUTROS EUS.', isThought: true },
        { text: 'Infinitos universos paralelos sobrepostos.', isThought: true },
        { text: 'Todos acontecendo na mesma consciencia.', isThought: true },
        { text: 'Eu sou o observador de Schrodinger.', isThought: true },
        { text: 'Preso DENTRO da caixa.', isThought: true },
      ],

      final_choice: [
        { text: 'E agora? O que eu faco?', isThought: true },
        {
          text: 'Escolha o seu destino:',
          choices: [
            { text: 'Aceitar e observar tudo', effect: { ending: 'observer' } },
            { text: 'Tentar colapsar tudo de volta', effect: { ending: 'collapse' } },
            { text: 'Escolher UMA realidade e ficar', effect: { ending: 'choice' } },
          ],
        },
      ],

      ending_observer: [
        { text: 'Voce aceita.', isThought: true },
        { text: 'Todas as vidas. Todas as mortes.', isThought: true },
        { text: 'Todas as possibilidades.', isThought: true },
        { text: 'E encontra uma paz estranha no infinito.', isThought: true },
      ],

      ending_collapse: [
        { text: 'Voce tenta forcar o colapso.', isThought: true },
        { text: 'Toda materia. Toda energia. Todo universo.', isThought: true },
        { text: 'Comprimidos em um unico ponto.', isThought: true },
        { text: '"E se o Big Bang foi alguem como eu..."', isThought: true },
        { text: '"...tentando voltar?"', isThought: true },
      ],

      ending_choice: [
        { text: '"Papai! Voce demorou!"', isThought: true },
        { text: 'A menina corre ate voce.', isThought: true },
        { text: 'Voce sabe que nao e real.', isThought: true },
        { text: 'Mas abraca ela mesmo assim.', isThought: true },
        { text: 'Nao importa mais.', isThought: true },
      ],
    },

    /* ===== CHAPTERS ===== */
    chapters: {
      1: {
        name: 'A Rotina',
        startRoom: 'bedroom',
        availableRooms: ['bedroom', 'hallway', 'bathroom', 'kitchen', 'living_room'],
        events: ['wake_up'],
        unlockCondition: null,
      },
      2: {
        name: 'A Duvida',
        startRoom: 'bedroom',
        availableRooms: ['bedroom', 'hallway', 'bathroom', 'kitchen', 'living_room'],
        events: ['doubt_begins', 'floating_object', 'static_event'],
        unlockCondition: 'ch1_complete',
      },
      3: {
        name: 'Fragmentos',
        startRoom: 'bedroom',
        availableRooms: ['bedroom', 'hallway', 'bathroom', 'kitchen', 'living_room'],
        events: ['memory_wife_death_1', 'memory_daughter'],
        unlockCondition: 'ch2_complete',
      },
      4: {
        name: 'O Laboratorio',
        startRoom: 'hallway',
        availableRooms: ['bedroom', 'hallway', 'bathroom', 'kitchen', 'living_room', 'laboratory'],
        events: [],
        unlockCondition: 'ch3_complete',
      },
      5: {
        name: 'A Dobra',
        startRoom: 'hallway',
        availableRooms: ['bedroom', 'hallway', 'bathroom', 'kitchen', 'living_room', 'laboratory', 'void_room'],
        events: [],
        unlockCondition: 'ch4_complete',
      },
    },

    getRandomPillColor() {
      const colors = ['#e94560', '#4a90d9', '#4af', '#c850c0', '#50c878', '#ff6b35', '#ffd700'];
      return colors[Math.floor(Math.random() * colors.length)];
    },
  };

  window.G = window.G || {};
  window.G.Story = Story;
})();
