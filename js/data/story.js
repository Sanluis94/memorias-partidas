/* ===== STORY DATA ===== */
(function() {
  'use strict';

  const Story = {
    rooms: {
      bedroom: {
        name: 'Quarto',
        map: [
          '####################',
          '#W......F.........W#',
          '#.................A#',
          '#..BBBB...........A#',
          '#..BBBB............#',
          '#..........GGG.....#',
          '#I.........GGG.....#',
          '#E.................#',
          '#..................#',
          '#.................P#',
          '########D###D######',
        ],
        doors: {
          'D_8': { target: 'hallway', spawnX: 3, spawnY: 1 },
          'D_12': { target: 'bathroom', spawnX: 9, spawnY: 8 },
        },
        darkRadius: 120,
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
        doors: { 'D_18': { target: 'bedroom', spawnX: 12, spawnY: 9 } },
        darkRadius: 100,
      },
      hallway: {
        name: 'Corredor',
        map: [
          '##D#####D###D######',
          '#.................A#',
          '#..GG.............A#',
          '#..GG..............#',
          '#..................#',
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
        darkRadius: 110,
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
        doors: { 'D_9': { target: 'hallway', spawnX: 8, spawnY: 1 } },
        darkRadius: 130,
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
        doors: { 'D_9': { target: 'hallway', spawnX: 12, spawnY: 1 } },
        darkRadius: 120,
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
        doors: { 'D_9': { target: 'hallway', spawnX: 2, spawnY: 9 } },
        darkRadius: 110,
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
        doors: { 'D_8': { target: 'hallway', spawnX: 13, spawnY: 9 } },
        darkRadius: 200,
      },
    },

    dialogues: {
      // ===== CAPITULO 1: A ROTINA =====
      wake_up: [
        { text: '...', isThought: true },
        { text: 'O teto. Manchas de umidade que parecem rostos.', isThought: true },
        { text: 'Sempre os mesmos rostos.', isThought: true },
        { text: 'Quanto tempo eu dormi? Horas? Dias?', isThought: true },
        { text: 'O relogio na parede parou. De novo.', isThought: true },
        { text: 'Meus remedios... preciso tomar meus remedios.', isThought: true },
      ],

      bed_interact: [
        { text: 'Os lencois estao encharcados de suor.', isThought: true },
        { text: 'Sonhei com ela de novo. Maria.', isThought: true },
        { text: 'Mas no sonho ela estava... diferente. Mais jovem.', isThought: true },
        { text: 'E a menina... quem era aquela menina?', isThought: true },
      ],

      nightstand_interact: [
        { text: 'A gaveta esta cheia de coisas que nao reconheco.', isThought: true },
        { text: 'Um cracha com meu nome. "Dr. A. Meira - Fisica Quantica"', isThought: true },
        { text: 'Fisica? Eu sou fisico? Nao... eu sou...', isThought: true },
        { text: 'O que eu sou, afinal?', isThought: true },
      ],

      lamp_interact: [
        { text: 'A lampada pisca. Um ritmo quase matematico.', isThought: true },
        { text: 'Tres piscadas curtas. Uma longa. Tres curtas.', isThought: true },
        { text: 'Parece... codigo Morse? Mas isso e ridiculo.', isThought: true },
      ],

      bookshelf_interact: [
        { text: 'Os livros nas prateleiras nao fazem sentido juntos.', isThought: true },
        { text: '"Mecanica Quantica Avancada" ao lado de "Conto de Fadas".', isThought: true },
        { text: '"Teoria das Cordas" ao lado de "Receitas da Vovo".', isThought: true },
        { text: 'Como se duas vidas diferentes dividissem a mesma estante.', isThought: true },
      ],

      window_interact: [
        { text: 'La fora esta escuro. Completamente escuro.', isThought: true },
        { text: 'Nenhuma luz. Nenhuma estrela. Nenhum som.', isThought: true },
        { text: 'Como se nao houvesse NADA alem deste apartamento.', isThought: true },
        { text: 'Isso nao e normal. Mas o que e normal aqui?', isThought: true },
      ],

      pills_interact_1: [
        { text: 'O frasco de remedios. Antidepressivos, diz o rotulo.', isThought: true },
        { text: 'Mas a capsula... ela era AZUL ontem. Tenho certeza.', isThought: true },
        { text: 'Agora e vermelha. Um vermelho vivo, quase pulsante.', isThought: true },
        { text: 'Minha mao treme ao segura-la.', isThought: true },
        {
          text: 'Tomar o remedio?',
          choices: [
            { text: 'Engolir a capsula', effect: { flag: 'tookPill1', sanity: 8 } },
            { text: 'Largar. Algo esta muito errado.', effect: { flag: 'refusedPill1', sanity: -8 } },
          ],
        },
      ],

      pills_interact_2: [
        { text: 'A cor mudou DE NOVO.', isThought: true },
        { text: 'Agora e... verde? Dourada?', isThought: true },
        { text: 'Nao consigo nem descrever. A cor nao deveria EXISTIR.', isThought: true },
        { text: 'Sera que os remedios sao a causa... ou a cura?', isThought: true },
      ],

      mirror_interact_1: [
        { text: 'Meu reflexo. Olheiras profundas. Barba por fazer.', isThought: true },
        { text: 'Pareco ter envelhecido dez anos em uma noite.', isThought: true },
        { text: 'Ou sera que EU e que pareco jovem demais?', isThought: true },
      ],
      mirror_interact_2: [
        { text: 'Eu virei a cabeca. O reflexo demorou a acompanhar.', isThought: true },
        { text: 'Foi... foi so um instante de atraso. Imperceptivel.', isThought: true },
        { text: 'Mas eu PERCEBI.', isThought: true },
        { text: 'Tem algo errado com esse espelho. Ou comigo.', isThought: true },
      ],
      mirror_interact_3: [
        { text: 'NAO.', isThought: true },
        { text: 'O reflexo SORRIU. E eu nao estou sorrindo.', isThought: true },
        { text: 'Os olhos dele... sao diferentes. Mais calmos.', isThought: true },
        { text: 'Como se ele soubesse algo que eu nao sei.', isThought: true },
        { text: 'Como se ele fosse... outro eu.', isThought: true },
      ],

      photo_interact_1: [
        { text: 'Uma foto emoldurada. Eu, uma mulher, uma crianca.', isThought: true },
        { text: 'A mulher sorri. O cabelo castanho cai sobre os ombros.', isThought: true },
        { text: 'A crianca nos bracos dela me olha com olhos enormes.', isThought: true },
        { text: 'Eu SINTO que os conheco. Mas nao lembro seus nomes.', isThought: true },
        { text: 'Minha garganta aperta. Quem sao voces?', isThought: true },
      ],
      photo_interact_2: [
        { text: 'A foto... MUDOU.', isThought: true },
        { text: 'Agora estou sozinho na foto. Ninguem ao meu lado.', isThought: true },
        { text: 'Nao... eu NAO ESTAVA sozinho. Eles estavam aqui.', isThought: true },
        { text: 'EU VI. Eu LEMBRO.', isThought: true },
        { text: 'Lembro?', isThought: true },
      ],

      tv_interact_1: [
        { text: 'A TV liga sozinha. So estatica.', isThought: true },
        { text: 'Mas entre o chiado... fragmentos de som.', isThought: true },
        { text: '"...colapso da funcao... estabilizando campo..."', isThought: true },
        { text: '"...sujeito 01 nao responde... sinais vitais..."', isThought: true },
        { text: 'Sujeito 01? Estao falando de MIM?', isThought: true },
      ],

      couch_interact: [
        { text: 'O sofa esta gelado ao toque.', isThought: true },
        { text: 'Tem uma marca no assento. Como se alguem sentasse aqui todo dia.', isThought: true },
        { text: 'Mas eu nao me lembro de sentar aqui. Nunca.', isThought: true },
      ],

      fridge_interact: [
        { text: 'A geladeira zumbe num tom grave e constante.', isThought: true },
        { text: 'Dentro: leite com data de 2019. Queijo de 2023. Suco de 2021.', isThought: true },
        { text: 'Nenhuma data faz sentido. Que ANO e esse?', isThought: true },
        { text: 'Eu... nao sei que ano e.', isThought: true },
      ],

      stove_interact: [
        { text: 'O fogao. Frio. Uma camada de poeira cobre as bocas.', isThought: true },
        { text: 'Ninguem cozinha aqui ha muito tempo.', isThought: true },
        { text: 'Mas tem cheiro de cafe fresco no ar. De onde?', isThought: true },
      ],

      bathtub_interact: [
        { text: 'A banheira esta cheia de agua escura. Gelada.', isThought: true },
        { text: 'Eu nao enchi isso. Eu acho.', isThought: true },
        { text: 'Tem algo no fundo. Parece... cabelos? Nao. Fios. Eletricos.', isThought: true },
        { text: 'A agua reflete algo que nao esta aqui.', isThought: true },
      ],

      sink_interact: [
        { text: 'A pia esta molhada. Alguem a usou recentemente.', isThought: true },
        { text: 'O espelho acima esta embaçado, como se alguem tivesse respirado nele.', isThought: true },
        { text: 'Mas eu sou o unico aqui. Eu acho.', isThought: true },
      ],

      toilet_interact: [
        { text: 'O vaso sanitario. Normal. Ordinario.', isThought: true },
        { text: 'A unica coisa normal neste apartamento.', isThought: true },
        { text: '...E isso me assusta mais do que deveria.', isThought: true },
      ],

      kitchen_table_interact: [
        { text: 'Marcas de copos na mesa. Dezenas deles. Sobrepostos.', isThought: true },
        { text: 'Como se eu tivesse sentado aqui milhares de vezes.', isThought: true },
        { text: 'Vivendo o mesmo dia. Repetidamente.', isThought: true },
      ],

      note1_interact: [
        { text: 'Um bilhete colado na geladeira. Minha caligrafia. Tremente.', isThought: true },
        { text: '"NAO CONFIE NAS MEMORIAS. NAO CONFIE NOS REMEDIOS."', isThought: true },
        { text: '"O EXPERIMENTO ESTA DENTRO DE VOCE."', isThought: true },
        { text: 'Meu coracao acelera. Eu escrevi isso. Quando? Por que?', isThought: true },
      ],

      chalkboard_interact: [
        { text: 'Uma lousa coberta de equacoes. "Mecanica Quantica Avancada".', isThought: true },
        { text: 'A funcao de onda de Schrodinger. A caligrafia... e a MINHA.', isThought: true },
        { text: '"FALHA NA ESTABILIZACAO DO MULTIVERSO". O que e isso?', isThought: true },
        { text: 'O diagrama mostra um Colapso Macro-quantico provocado por um "Observador".', isThought: true },
        { text: 'Isso nao e assombracao. Eu sou um fisico. E eu fiz algo TERREVEL.', isThought: true },
      ],

      hallway_photo_interact: [
        { text: 'Outra foto no corredor. Mas essa... nao e uma foto normal.', isThought: true },
        { text: 'Mostra um laboratorio. Equipamentos enormes. Luzes brancas.', isThought: true },
        { text: 'Eu estou no centro da foto. De jaleco. Sorrindo.', isThought: true },
        { text: 'Atras de mim, um anel de metal gigantesco. Um acelerador?', isThought: true },
      ],

      // ===== CAPITULO 2: A DUVIDA =====
      doubt_begins: [
        { text: 'A luz acaba de mudar.', isThought: true },
        { text: 'Nao a lampada. A propria LUZ. O espectro visivel.', isThought: true },
        { text: 'As cores estao... erradas. Como um filtro quebrado.', isThought: true },
        { text: 'Isso nao sao os remedios. Isso e outra coisa.', isThought: true },
        { text: 'As paredes parecem respirar. Expandir e contrair.', isThought: true },
        { text: 'Eu preciso entender o que esta acontecendo.', isThought: true },
      ],

      floating_object: [
        { text: 'Aquilo... aquilo esta FLUTUANDO.', isThought: true },
        { text: 'Objetos nao flutuam. A gravidade e uma constante.', isThought: true },
        { text: '...e uma constante?', isThought: true },
        { text: 'Por que eu sinto que a gravidade NAO e uma constante aqui?', isThought: true },
      ],

      static_event: [
        { text: 'O chiado. De todo lugar. De nenhum lugar.', isThought: true },
        { text: 'Nao e som. E mais como... informacao bruta.', isThought: true },
        { text: 'Dados. Flutuando no ar como particulas.', isThought: true },
        { text: 'Radiacao cosmica de fundo. AQUI DENTRO?', isThought: true },
        { text: 'Isso so seria possivel se...', isThought: true },
        { text: '...se as barreiras entre os universos fossem finas aqui.', isThought: true },
      ],

      // ===== CAPITULO 3: FRAGMENTOS =====
      memory_wife_death_1: [
        { text: 'Um flash. Uma memoria invade minha mente.', isThought: true },
        { text: 'Maria. O hospital. Maquinas apitando.', isThought: true },
        { text: '"Eu te amo", ela disse. Depois silencio.', isThought: true },
        { text: '...Nao. Nao foi assim.', isThought: true },
        { text: 'Maria. A estrada. Farois na chuva. O impacto.', isThought: true },
        { text: '...Nao. Tambem nao.', isThought: true },
        { text: 'Maria. Sorrindo. Ontem. Viva. Na cozinha.', isThought: true },
        { text: 'QUAL DESSAS E REAL?', isThought: true },
        { text: 'TODAS parecem reais. TODAS doem igual.', isThought: true },
      ],

      memory_daughter: [
        { text: '"Papai! Voce demorou!"', isThought: true },
        { text: 'Uma menina de cabelos castanhos corre ate mim.', isThought: true },
        { text: 'O abraco e quente. Real. Cheira a sabonete infantil.', isThought: true },
        { text: 'Minha filha. Sophia.', isThought: true },
        { text: '...Eu NAO tenho uma filha. Eu nunca tive filhos.', isThought: true },
        { text: 'Mas esse nome... Sophia... por que sei o nome dela?', isThought: true },
        { text: 'Por que a saudade aperta o peito como se fosse real?', isThought: true },
      ],

      // ===== CAPITULO 4: O LABORATORIO =====
      lab_note_1: [
        { text: 'Um caderno grosso. Capa de couro gasto. Minha caligrafia.', isThought: true },
        { text: '"Diario de Pesquisa - Projeto Observador"', isThought: true },
        { text: '"Dia 147: O acelerador de particulas esta estavel."', isThought: true },
        { text: '"A anomalia quantica no setor 7 se intensifica."', isThought: true },
        { text: '"Detectamos sobreposicao de estados em escala MACROSCOPICA."', isThought: true },
        { text: '"Isso nao deveria ser possivel."', isThought: true },
        { text: '"Se meus calculos estiverem corretos, estamos observando..."', isThought: true },
        { text: '"...a fronteira entre universos paralelos."', isThought: true },
      ],

      lab_note_2: [
        { text: 'Mais paginas. A caligrafia fica cada vez mais tremula.', isThought: true },
        { text: '"Dia 201: A equipe quer suspender o projeto. Eu recusei."', isThought: true },
        { text: '"Dia 202: Estou vendo coisas. Versoes de mim nos reflexos."', isThought: true },
        { text: '"Dia 203: O ACIDENTE."', isThought: true },
        { text: '"A funcao de onda nao colapsou."', isThought: true },
        { text: '"A barreira se rompeu. Eu estava no centro."', isThought: true },
        { text: '"Eu nao morri. Eu ENTREI."', isThought: true },
        { text: '"Estou preso dentro da sobreposicao quantica."', isThought: true },
        { text: '"Todas as realidades. Simultaneamente. Na mesma consciencia."', isThought: true },
        { text: '"Eu sou o observador de Schrodinger."', isThought: true },
        { text: '"Preso DENTRO da caixa."', isThought: true },
      ],

      lab_equipment_interact: [
        { text: 'Monitores. Graficos. Funcoes de onda.', isThought: true },
        { text: 'Eu ENTENDO esses dados. Cada equacao. Cada variavel.', isThought: true },
        { text: 'Essa e a minha mao nos dados. Meu codigo. Meu trabalho.', isThought: true },
        { text: 'Eu era um fisico. Dr. Alexandre Meira.', isThought: true },
        { text: 'E eu destrui as barreiras entre os universos.', isThought: true },
      ],

      // ===== CAPITULO 5: A DOBRA =====
      void_revelation: [
        { text: 'O vazio.', isThought: true },
        { text: 'Nao e escuridao. E AUSENCIA. De tudo.', isThought: true },
        { text: 'E aqui que as realidades se encontram.', isThought: true },
        { text: 'Eu entendo agora. Tudo.', isThought: true },
        { text: 'A estatica nao eram fantasmas.', isThought: true },
        { text: 'E a radiacao cosmica de fundo vazando entre as realidades.', isThought: true },
        { text: 'As distorcoes da luz sao falhas no espectro visivel.', isThought: true },
        { text: 'Os objetos flutuam porque a gravidade colapsa aqui.', isThought: true },
        { text: 'Eu nao perdi a razao.', isThought: true },
        { text: 'Eu estou VIVENDO o multiverso na pele.', isThought: true },
        { text: 'As memorias da Maria morrendo de formas diferentes...', isThought: true },
        { text: 'Sao memorias REAIS. De outros EUS. De outros universos.', isThought: true },
        { text: 'A Sophia que me chamou de papai existe. Em um deles.', isThought: true },
        { text: 'Todas as possibilidades. Sobrepostas na mesma mente.', isThought: true },
        { text: 'E eu sou o unico que pode ver todas elas.', isThought: true },
      ],

      final_choice: [
        { text: 'O Projeto Observador destruiu a barreira.', isThought: true },
        { text: 'Eu destrui a barreira.', isThought: true },
        { text: 'E agora... o que eu faco com o infinito?', isThought: true },
        {
          text: 'Escolha:',
          choices: [
            { text: 'Aceitar. Observar tudo. Para sempre.', effect: { ending: 'observer' } },
            { text: 'Forcar o colapso. Destruir tudo de volta.', effect: { ending: 'collapse' } },
            { text: 'Escolher UMA realidade. Sophia. Mesmo que nao seja real.', effect: { ending: 'choice' } },
          ],
        },
      ],

      ending_observer: [
        { text: 'Voce aceita.', isThought: true },
        { text: 'Fecha os olhos. Abre a mente.', isThought: true },
        { text: 'E ve TUDO. Todas as vidas que viveu e nao viveu.', isThought: true },
        { text: 'Todas as versoes de Maria. Viva. Morta. Nunca existiu.', isThought: true },
        { text: 'Todas as versoes de Sophia. Sorrindo. Chorando. Esperando.', isThought: true },
        { text: 'E encontra uma paz estranha no infinito.', isThought: true },
        { text: 'A paz de quem finalmente para de lutar.', isThought: true },
      ],

      ending_collapse: [
        { text: 'Voce decide.', isThought: true },
        { text: 'Se voce abriu a caixa, voce pode fecha-la.', isThought: true },
        { text: 'Toda materia. Toda energia. Toda possibilidade.', isThought: true },
        { text: 'Comprimidas em um unico ponto infinitamente denso.', isThought: true },
        { text: 'A dor e absoluta. E breve.', isThought: true },
        { text: 'Depois... BANG.', isThought: true },
        { text: '"E se o Big Bang foi alguem como eu..."', isThought: true },
        { text: '"...tentando voltar para casa?"', isThought: true },
      ],

      ending_choice: [
        { text: '"Papai! Voce demorou!"', isThought: true },
        { text: 'Sophia corre ate voce. Cabelos castanhos ao vento.', isThought: true },
        { text: 'O abraco e quente. Real. Cheira a sabonete infantil.', isThought: true },
        { text: 'Maria aparece na porta da cozinha. Sorrindo.', isThought: true },
        { text: '"O jantar esta quase pronto", ela diz.', isThought: true },
        { text: 'Voce sabe que isso nao e real.', isThought: true },
        { text: 'Voce sabe que e so uma das infinitas possibilidades.', isThought: true },
        { text: 'Mas o abraco de Sophia e quente.', isThought: true },
        { text: 'E isso basta.', isThought: true },
      ],
    },

    chapters: {
      1: {
        name: 'A Rotina',
        startRoom: 'bedroom',
        availableRooms: ['bedroom', 'hallway', 'bathroom', 'kitchen', 'living_room'],
        events: ['wake_up'],
      },
      2: {
        name: 'A Duvida',
        startRoom: 'bedroom',
        availableRooms: ['bedroom', 'hallway', 'bathroom', 'kitchen', 'living_room'],
        events: ['doubt_begins', 'floating_object', 'static_event'],
      },
      3: {
        name: 'Fragmentos',
        startRoom: 'bedroom',
        availableRooms: ['bedroom', 'hallway', 'bathroom', 'kitchen', 'living_room'],
        events: ['memory_wife_death_1', 'memory_daughter'],
      },
      4: {
        name: 'O Laboratorio',
        startRoom: 'hallway',
        availableRooms: ['bedroom', 'hallway', 'bathroom', 'kitchen', 'living_room', 'laboratory'],
        events: [],
      },
      5: {
        name: 'A Dobra',
        startRoom: 'hallway',
        availableRooms: ['bedroom', 'hallway', 'bathroom', 'kitchen', 'living_room', 'laboratory', 'void_room'],
        events: [],
      },
    },

    getRandomPillColor() {
      return ['#8a1020','#2040a0','#20a060','#8030a0','#a08020','#a04020'][Math.floor(Math.random()*6)];
    },
  };

  window.G = window.G || {};
  window.G.Story = Story;
})();
