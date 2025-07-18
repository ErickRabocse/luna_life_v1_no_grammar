export const chapter7Data = {
  id: 7,
  title: 'Together we make a difference',
  titleTranslation: 'Juntos hacemos la diferencia',
  scenes: [
    {
      id: 1,
      image: '/images/7.1.png',
      text: [
        { word: 'Sofia is', translation: 'Sofia está' },
        { word: 'in her room', translation: 'en su habitación' },
        { word: '.', translation: '' },
        { word: 'Luna is sleeping', translation: 'Luna está durmiendo' },
        { word: 'on her bed', translation: 'en su cama' },
        { word: '.', translation: '' },
        { word: 'Sofia', translation: 'Sofia' },
        { word: 'looks at her', translation: 'la mira' },
        { word: '.', translation: '' },
        { word: '"You were a', translation: '"Tú fuiste una' },
        { word: 'street dog', translation: 'perrita de la calle' },
        { word: '.', translation: '' },
        { word: 'Now', translation: 'Ahora' },
        { word: 'you are safe,"', translation: ' (tú) estás segura,"' },
        { word: 'she whispers', translation: 'ella susurra' },
        { word: '.', translation: '' },
        { word: 'She thinks of', translation: 'Ella piensa en' },
        { word: 'other dogs', translation: 'otros perros' },
        { word: '.', translation: '' },
        { word: 'Many', translation: 'Muchos' },
        {
          word: 'still have no home',
          translation: 'todavía no tienen hogar',
        },
        { word: '.', translation: '' },
        { word: '"We have to', translation: '"Debemos' },
        { word: 'help them,"', translation: 'ayudarlos,"' },
        { word: 'Sofia says', translation: 'dice Sofia' },
        { word: '.', translation: '' },
      ],
      activity: {
        type: 'DragDropSentence',
        instructions:
          'Arrastra las palabras a los espacios en blanco para completar las oraciones.',
        sentences: [
          {
            id: 'sentence1_ch7_sc1',
            parts: [
              { type: 'text', value: 'Luna is ' },
              {
                type: 'blank',
                correctWord: 'sleeping',
                hint: '¿Qué hace Luna en la cama?',
              },
              { type: 'text', value: ' on her bed.' },
            ],
          },
          {
            id: 'sentence2_ch7_sc1',
            parts: [
              { type: 'text', value: '"Now you are ' },
              {
                type: 'blank',
                correctWord: 'safe',
                hint: '¿Cómo está Luna ahora que tiene un hogar?',
              },
              { type: 'text', value: '," she whispers.' },
            ],
          },
          {
            id: 'sentence3_ch7_sc1',
            parts: [
              { type: 'text', value: 'She ' },
              {
                type: 'blank',
                correctWord: 'thinks',
                hint: '¿Qué hace Sofia sobre los otros perros?',
              },
              { type: 'text', value: ' of other dogs.' },
            ],
          },
          {
            id: 'sentence4_ch7_sc1',
            parts: [
              { type: 'text', value: 'Many still have no ' },
              {
                type: 'blank',
                correctWord: 'home',
                hint: '¿Qué es lo que no tienen muchos perros?',
              },
              { type: 'text', value: '.' },
            ],
          },
          {
            id: 'sentence5_ch7_sc1',
            parts: [
              { type: 'text', value: '"We have to ' },
              {
                type: 'blank',
                correctWord: 'help',
                hint: '¿Qué quiere hacer Sofia por los otros perros?',
              },
              { type: 'text', value: ' them."' },
            ],
          },
        ],
        allWords: ['sleeping', 'safe', 'thinks', 'home', 'help'],
      },
    },
    {
      id: 2,
      image: '/images/7.2.png',
      text: [
        { word: 'She takes paper', translation: 'Ella toma papel' },
        { word: 'and markers', translation: 'y marcadores' },
        { word: '.', translation: '' },
        {
          word: 'She writes, "Adopt, Don’t Shop!"',
          translation: 'Ella escribe, "Adopta, no compres"',
        },
        { word: 'She draws', translation: 'Ella dibuja' },
        {
          word: 'happy dogs and hearts',
          translation: 'perros felices y corazones',
        },
        { word: '.', translation: '' },
        { word: 'She uses blue', translation: 'Ella usa azul' },
        { word: ', red and yellow', translation: ', rojo y amarillo' },
        { word: '.', translation: '' },
        {
          word: 'She shows the posters',
          translation: 'Ella muestra los carteles',
        },
        { word: 'to her parents', translation: 'a sus padres' },
        { word: '.', translation: '' },
        { word: '"These are', translation: '"Estos son"' },
        { word: 'for school,"', translation: '"para la escuela,"' },
        { word: 'she says', translation: ' ella dice' },
        { word: '.', translation: '' },
        { word: 'Her mom smiles', translation: 'Su mamá sonríe' },
        { word: '.', translation: '' },
        { word: '"You have', translation: '"Tienes' },
        { word: 'a big heart,"', translation: 'un gran corazón,"' },
        { word: 'she says', translation: 'ella dice' },
        { word: '.', translation: '' },
        { word: 'Sofia talks to', translation: 'Sofia habla con' },
        { word: 'her teacher', translation: 'su maestra' },
        { word: '.', translation: '' },
        { word: '"Can we do', translation: '"Podemos hacer' },
        { word: 'an adoption day?"', translation: 'un día de adopción?"' },
        {
          word: 'The teacher nods',
          translation: 'La maestra asiente con la cabeza',
        },
        { word: '.', translation: '' },
        { word: '"Yes! Let\'s invite', translation: '"¡Sí! Invitemos a' },
        { word: 'a shelter,"', translation: 'un refugio,"' },
        { word: 'she says', translation: 'ella dice' },
        { word: '.', translation: '' },
        { word: 'At home, Sofia makes', translation: 'En casa, Sofia hace' },
        { word: 'more posters', translation: 'más carteles' },
        { word: '.', translation: '' },
        { word: 'Luna watches her', translation: 'Luna la observa' },
        { word: 'color', translation: 'colorear' },
        { word: '.', translation: '' },
      ],
      activity: {
        type: 'DragDropSentence',
        instructions:
          'Arrastra las palabras a los espacios en blanco para completar las oraciones.',
        sentences: [
          {
            id: 'sentence1_ch7_sc2',
            parts: [
              { type: 'text', value: 'She takes ' },
              {
                type: 'blank',
                correctWord: 'paper',
                hint: '¿Qué material usa para sus carteles?',
              },
              { type: 'text', value: ' and markers.' },
            ],
          },
          {
            id: 'sentence2_ch7_sc2',
            parts: [
              { type: 'text', value: 'She ' },
              {
                type: 'blank',
                correctWord: 'draws',
                hint: '¿Qué hace con los marcadores?',
              },
              { type: 'text', value: ' happy dogs and hearts.' },
            ],
          },
          {
            id: 'sentence3_ch7_sc2',
            parts: [
              { type: 'text', value: 'She shows the ' },
              {
                type: 'blank',
                correctWord: 'posters',
                hint: '¿Qué le enseña a sus padres?',
              },
              { type: 'text', value: ' to her parents.' },
            ],
          },
          {
            id: 'sentence4_ch7_sc2',
            parts: [
              { type: 'text', value: 'Her mom ' },
              {
                type: 'blank',
                correctWord: 'smiles',
                hint: '¿Cuál es la reacción de su mamá?',
              },
              { type: 'text', value: '.' },
            ],
          },
          {
            id: 'sentence5_ch7_sc2',
            parts: [
              { type: 'text', value: '"Let\'s ' },
              {
                type: 'blank',
                correctWord: 'invite',
                hint: '¿Qué sugiere la maestra para el día de adopción?',
              },
              { type: 'text', value: ' a shelter."' },
            ],
          },
        ],
        allWords: ['paper', 'draws', 'posters', 'smiles', 'invite'],
      },
    },
    {
      id: 3,
      image: '/images/7.3.png',
      text: [
        { word: 'At school, ', translation: 'En la escuela,' },
        { word: 'Sofia shares', translation: 'Sofia comparte' },
        { word: 'her idea', translation: 'su idea' },
        { word: 'with her friends', translation: 'con sus amigos' },
        { word: '.', translation: '' },
        { word: 'They like it', translation: 'Les gusta' },
        { word: '.', translation: '' },
        { word: 'They help her', translation: 'Ellos la ayudan' },
        { word: 'hang the posters', translation: 'a colgar los carteles' },
        { word: '.', translation: '' },
        { word: 'They put them', translation: 'Los ponen' },
        { word: 'on walls, doors', translation: 'en paredes, puertas' },
        { word: 'and the library', translation: 'y la biblioteca' },
        { word: '.', translation: '' },
        { word: 'Sofia also posts', translation: 'Sofia también publica' },
        { word: 'pictures online', translation: 'fotos en línea' },
        { word: '.', translation: '' },
        { word: 'More people see', translation: 'Más personas ven' },
        { word: 'the message', translation: 'el mensaje' },
        { word: '.', translation: '' },
        { word: 'The teacher says', translation: 'La maestra dice' },
        { word: ',', translation: ',' },
        { word: '"Sofia, you are', translation: '"Sofia, tú eres' },
        { word: 'a leader."', translation: 'una líder."' },
        {
          word: 'Sofia feels proud',
          translation: 'Sofia se siente orgullosa',
        },
        { word: '.', translation: '' },
        { word: 'She hugs Luna', translation: 'Ella abraza a Luna' },
        {
          word: 'and says, "We are helping now, little hero"',
          translation: 'y dice, Estamos ayudando ahora, pequeña heroína."',
        },
        { word: '.', translation: '' },
        { word: 'Luna wags her tail', translation: 'Luna mueve su cola' },
        { word: '.', translation: '' },
        { word: 'Together, they are', translation: 'Juntas, ellas están' },
        { word: 'making a change', translation: 'haciendo un cambio' },
        { word: '.', translation: '' },
      ],
      activity: {
        type: 'DragDropSentence',
        instructions:
          'Arrastra las palabras a los espacios en blanco para completar las oraciones.',
        sentences: [
          {
            id: 'sentence1_ch7_sc3',
            parts: [
              { type: 'text', value: 'Sofia ' },
              {
                type: 'blank',
                correctWord: 'shares',
                hint: '¿Qué hace con su idea?',
              },
              { type: 'text', value: ' her idea with her friends.' },
            ],
          },
          {
            id: 'sentence2_ch7_sc3',
            parts: [
              { type: 'text', value: 'They help her ' },
              {
                type: 'blank',
                correctWord: 'hang',
                hint: '¿Cómo la ayudan sus amigos con los carteles?',
              },
              { type: 'text', value: ' the posters.' },
            ],
          },
          {
            id: 'sentence3_ch7_sc3',
            parts: [
              { type: 'text', value: 'More people see the ' },
              {
                type: 'blank',
                correctWord: 'message',
                hint: '¿Qué ven las personas gracias a los carteles?',
              },
              { type: 'text', value: '.' },
            ],
          },
          {
            id: 'sentence4_ch7_sc3',
            parts: [
              { type: 'text', value: '"Sofia, you are a ' },
              {
                type: 'blank',
                correctWord: 'leader',
                hint: '¿Cómo llama la maestra a Sofia?',
              },
              { type: 'text', value: '."' },
            ],
          },
          {
            id: 'sentence5_ch7_sc3',
            parts: [
              { type: 'text', value: 'Sofia feels ' },
              {
                type: 'blank',
                correctWord: 'proud',
                hint: '¿Cómo se siente Sofia por su trabajo?',
              },
              { type: 'text', value: '.' },
            ],
          },
        ],
        allWords: ['shares', 'hang', 'message', 'leader', 'proud'],
      },
    },
  ],
}
