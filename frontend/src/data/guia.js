// Guía de primeros pasos (#/guia): la lección para alumnos nuevos. Explica
// cómo funciona la plataforma y el add-on de Blender tal como son hoy
// (motor 5, «Amatista Taller»). Cada capítulo usa los mismos bloques que las
// lecciones (BloqueContenido) y termina con una comprobación corta: la
// respuesta correcta abre el capítulo siguiente.
//
// Si cambia la plataforma o el add-on, actualiza este archivo: es lo primero
// que lee un alumno nuevo.

export const CAPITULOS = [
  {
    id: 'organizacion',
    titulo: 'Cómo está organizada Amatista',
    corto: 'Organización',
    resumen: 'Cursos, niveles, módulos y lecciones: dónde está cada cosa.',
    bloques: [
      {
        type: 'markdown_text',
        body:
          'Amatista te enseña 3D **haciendo**. Todo está ordenado de lo grande a lo pequeño, y siempre sabes cuál es tu siguiente paso:\n\n' +
          '- **Curso**: un tema completo, como Blender o A-Frame. Lo eliges en **Cursos**.\n' +
          '- **Nivel**: Blender tiene varios (Principiante, Principiante-Intermedio, Intermedio…). Empiezas por el primero.\n' +
          '- **Módulo**: un mundo con su escenario, su guía y su insignia. Dura cerca de una hora.\n' +
          '- **Lección**: una idea, menos de diez minutos, siempre con algo que hacer con tus manos.',
      },
      {
        type: 'pipeline',
        title: 'Así avanza cada módulo',
        steps: [
          { icon: 'estudio', title: 'Teoría interactiva', text: 'Lees poco y practicas mucho: ordenas, emparejas, giras escenas 3D.' },
          { icon: 'modelar', title: 'Estación en Blender', text: 'Haces lo aprendido en Blender, con Amatista a tu lado.' },
          { icon: 'reto', title: 'Jefe final', text: 'Un examen corto: cada acierto le quita vida. Al vencerlo ganas la insignia.' },
        ],
      },
      {
        type: 'callout',
        variant: 'dato',
        title: 'Tu botón de siempre',
        body: 'En la portada y en cada curso hay un botón **▶ Continuar**: te lleva directo a la lección que te toca.',
      },
    ],
    comprueba: {
      type: 'quiz_inline',
      id: 'guia-organizacion',
      question: '¿Qué hay al final de cada módulo?',
      options: [
        { id: 'jefe', text: 'Un jefe final: un examen corto que te da la insignia del módulo', isCorrect: true },
        { id: 'pago', text: 'Un pago para desbloquear el siguiente módulo', isCorrect: false },
        { id: 'nada', text: 'Nada: los módulos no terminan', isCorrect: false },
      ],
      explanation: 'Cada módulo cierra con su jefe final. Al vencerlo ganas la insignia y se abre lo que sigue.',
    },
  },
  {
    id: 'lecciones',
    titulo: 'Cómo se completa una lección',
    corto: 'Lecciones',
    resumen: 'Qué hacer dentro de una lección y cómo se abre la siguiente.',
    bloques: [
      {
        type: 'step_by_step',
        title: 'Una lección, paso a paso',
        steps: [
          {
            title: 'Abre la lección que te toca',
            text: 'En el curso, la lección que sigue brilla y dice «Jugar ▶». Las que tienen candado se abren al terminar la anterior.',
          },
          {
            title: 'Lee y resuelve las actividades',
            text: 'Cada actividad (preguntas, ordenar, emparejar, explorar una escena) se marca con un hexágono abajo. Si fallas, lee la explicación y vuelve a intentarlo: no pierdes nada.',
          },
          {
            title: 'Pulsa «Completar lección»',
            text: 'El botón se enciende cuando resuelves todas las actividades. Si está gris, pulsa «Ir a la actividad pendiente» y te lleva a la que falta.',
          },
          {
            title: 'Ganas XP y se abre la siguiente',
            text: 'Cada lección da 100 XP. Puedes volver a cualquier lección hecha para repasar cuando quieras.',
          },
        ],
      },
      {
        type: 'concept_cards',
        items: [
          { term: 'Teoría', definition: 'Se hace aquí, en el navegador, incluso sin Internet.' },
          { term: 'En Blender', definition: 'Marcada en naranja. Se hace en Blender con el add-on de Amatista conectado.' },
          { term: 'Jefe final', definition: 'El examen del módulo. Necesitas el puntaje que indica para aprobar; puedes reintentarlo.' },
        ],
      },
    ],
    comprueba: {
      type: 'quiz_inline',
      id: 'guia-lecciones',
      question: 'El botón «Completar lección» está gris. ¿Qué haces?',
      options: [
        { id: 'pendiente', text: 'Busco la actividad pendiente y la resuelvo', isCorrect: true },
        { id: 'recargar', text: 'Recargo la página hasta que se encienda', isCorrect: false },
        { id: 'saltar', text: 'Me salto la lección: la siguiente ya está abierta', isCorrect: false },
      ],
      explanation: 'El botón se enciende al resolver todas las actividades. «Ir a la actividad pendiente» te lleva a la que falta.',
    },
  },
  {
    id: 'avance',
    titulo: 'Tu avance: XP, racha e insignias',
    corto: 'Tu avance',
    resumen: 'Dónde ves lo que llevas y cómo se guarda.',
    bloques: [
      {
        type: 'concept_cards',
        items: [
          { term: 'XP y nivel', definition: 'Arriba a la derecha. Cada lección suma XP y con XP subes de nivel (Aprendiz, Modelador, Escultor…).' },
          { term: 'Racha', definition: 'Días seguidos con actividad. Una lección al día basta para mantenerla.' },
          { term: 'Insignias', definition: 'Una por módulo, al vencer a su jefe final. Las ves en tu muro de insignias.' },
          { term: 'Mi panel', definition: 'Tu resumen: qué sigue, tus cursos, exámenes, logros y tu Blender.' },
        ],
      },
      {
        type: 'markdown_text',
        body:
          '### ¿Y si no tengo cuenta o Internet?\n\n' +
          '- Puedes **empezar sin cuenta**: tu avance se guarda en este navegador.\n' +
          '- Con una **cuenta** tu avance se respalda en la nube y lo ves en cualquier dispositivo. Lo que hiciste sin cuenta se suma al entrar.\n' +
          '- **Sin Internet** la teoría sigue funcionando; tu avance se envía cuando vuelve la conexión. El indicador de arriba dice si estás en línea.\n' +
          '- Para las estaciones en **Blender** sí necesitas cuenta: así cada práctica queda registrada.',
      },
    ],
    comprueba: {
      type: 'quiz_inline',
      id: 'guia-avance',
      question: '¿Necesitas una cuenta para empezar a estudiar?',
      options: [
        { id: 'no', text: 'No. Pero con cuenta tu avance se guarda en la nube y puedes usar Blender conectado', isCorrect: true },
        { id: 'si', text: 'Sí, sin cuenta no se abre ninguna lección', isCorrect: false },
        { id: 'pierdo', text: 'No, pero lo que haga sin cuenta se pierde al crearla', isCorrect: false },
      ],
      explanation: 'Empiezas sin cuenta y nada se pierde: al crear tu cuenta, lo que ya hiciste se suma a ella.',
    },
  },
  {
    id: 'instalar',
    titulo: 'Conecta Blender con Amatista',
    corto: 'Instalar',
    resumen: 'Instala el add-on una vez y tu Blender queda conectado.',
    bloques: [
      {
        type: 'markdown_text',
        body:
          'Las estaciones naranjas se hacen dentro de **Blender**, el programa de 3D gratuito. El **add-on de Amatista** vive dentro de Blender: te guía, revisa tu modelo y registra tu avance en la plataforma. Se instala **una sola vez**.',
      },
      {
        type: 'step_by_step',
        title: 'Instalar el add-on',
        steps: [
          {
            title: 'Instala Blender 4.2 o más nuevo',
            text: 'Descárgalo gratis de blender.org. Si ya lo tienes, revisa la versión en Ayuda › Acerca de Blender.',
          },
          {
            title: 'Entra con tu cuenta y abre «Mi Blender»',
            text: 'Está en el menú de tu cuenta (arriba a la derecha). Descarga el paquete de tu sistema con la sesión iniciada: así trae tu acceso y se conecta solo.',
          },
          {
            title: 'Descomprime y ejecuta el instalador',
            text: 'El instalador busca tu Blender, revisa la versión y deja el add-on listo. Si Blender es muy viejo, te avisa y no cambia nada.',
          },
          {
            title: 'Abre Blender y busca la pestaña Amatista',
            keys: ['N'],
            text: 'Con el ratón sobre la vista 3D pulsa N: aparece la barra lateral. Elige la pestaña «Amatista».',
          },
          {
            title: '¿Te pide un código? Conéctalo',
            text: 'Si descargaste el paquete sin sesión, la pestaña muestra un código. Escríbelo en la plataforma (se abre sola la página «Conectar Blender») y pulsa «Conectar». En «Mi Blender» ves tus Blender conectados.',
          },
        ],
      },
      {
        type: 'callout',
        variant: 'reto',
        title: 'Desde la lección',
        body: 'En cada estación naranja hay un botón para **abrir la práctica en Blender**. Haz la práctica allá y vuelve a la lección: tu avance aparece solo.',
      },
      {
        type: 'callout',
        variant: 'dato',
        title: 'Tus primeros pasos en Blender',
        body: 'El curso **Primeros pasos con Amatista** te acompaña en todo esto: instalas, vinculas tu cuenta y haces un recorrido de diez paradas dentro de Blender mientras la lección te muestra en vivo en qué paso vas.',
      },
    ],
    comprueba: {
      type: 'quiz_inline',
      id: 'guia-instalar',
      question: 'Instalaste el add-on. ¿Dónde lo encuentras dentro de Blender?',
      options: [
        { id: 'n', text: 'En la vista 3D, pulsando N, en la pestaña «Amatista»', isCorrect: true },
        { id: 'menu', text: 'En un programa aparte que se abre junto a Blender', isCorrect: false },
        { id: 'web', text: 'No está en Blender: todo se hace en la página web', isCorrect: false },
      ],
      explanation: 'La barra lateral de la vista 3D se abre con N; ahí está la pestaña «Amatista».',
    },
  },
  {
    id: 'taller',
    titulo: 'Cómo te enseña el add-on',
    corto: 'El taller',
    resumen: 'Mira, Hazlo conmigo, Hazlo tú, Úsalo y Recuérdalo.',
    bloques: [
      {
        type: 'markdown_text',
        body:
          'En Blender aprendes **una habilidad a la vez** (mover, extruir, poner un material…). Cada habilidad pasa por los mismos pasos, y lo que ya dominas no se te vuelve a pedir:',
      },
      {
        type: 'layers',
        title: 'El ciclo de cada habilidad',
        items: [
          { title: 'Mira', text: 'Amatista hace la habilidad en tu vista 3D con las teclas en pantalla. Unos segundos, una sola vez.' },
          { title: 'Hazlo conmigo', text: 'La haces tú dentro de un molde translúcido, con la herramienta iluminada.' },
          { title: 'Hazlo tú', text: 'Otra versión corta, sin molde y sin teclas. Si te sale, la habilidad queda lista.' },
          { title: 'Úsalo', text: 'El proyecto del módulo (el tren, la espada…): juntas lo aprendido y queda en tu isla.' },
          { title: 'Recuérdalo', text: 'Días después, un reto de un minuto para no olvidarla. Es opcional: nunca te bloquea.' },
        ],
        footer: '¿Ya sabes algo? Pulsa «¿Ya sabes esto? Demuéstralo» y sáltate su guía.',
      },
      {
        type: 'concept_cards',
        items: [
          { term: 'Colores del molde', definition: 'Azul: pieza vacía. Ámbar: la que toca (o casi está). Verde: ¡bien hecha! Coral: hay otra forma en su lugar.' },
          { term: 'Pistas', definition: 'Suben de a una: qué falta, con qué herramienta, las teclas y, al final, «Mírame». Nunca hacen el trabajo por ti.' },
          { term: 'Tu isla', definition: 'Cada proyecto terminado aparece en tu isla, dentro del curso de Blender.' },
        ],
      },
    ],
    comprueba: {
      type: 'ordering',
      id: 'guia-taller-orden',
      prompt: 'Ordena el ciclo de una habilidad.',
      items: [
        { id: 'mira', text: 'Mira' },
        { id: 'conmigo', text: 'Hazlo conmigo' },
        { id: 'tu', text: 'Hazlo tú' },
        { id: 'usalo', text: 'Úsalo' },
        { id: 'recuerdalo', text: 'Recuérdalo' },
      ],
      explanation: 'Primero miras, después lo haces con ayuda y luego solo. Al final lo usas en el proyecto y lo repasas días después.',
    },
  },
];

// El cierre de la guía: qué hacer ahora.
export const CIERRE = {
  titulo: '¡Listo para empezar!',
  texto:
    'Ya sabes cómo funciona Amatista. Empieza por el curso «Primeros pasos con Amatista»: ahí recorres la plataforma, conectas Blender y das tus primeros pasos en él. El botón de abajo te lleva a la lección que te toca. Si algo no queda claro, pulsa «?» arriba a la derecha y vuelve a esta guía cuando quieras.',
};
