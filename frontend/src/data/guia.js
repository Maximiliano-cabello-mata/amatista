// Ayuda (#/guia): respuestas cortas sobre cómo funciona la plataforma y el add-on de Blender tal
// como son hoy (add-on 5.2, «Amatista Taller»). No es un curso: no tiene candados, preguntas ni XP.
// Cada tema usa los mismos bloques que las lecciones (BloqueContenido). El paseo por las páginas
// reales es el recorrido (recorrido/pasos.js); la tarjeta de la fusión está en components/blender.
//
// Si cambia la plataforma o el add-on, actualiza este archivo: es lo que lee un alumno con dudas.

export const TEMAS_AYUDA = [
  {
    id: 'organizacion',
    titulo: '¿Cómo está organizada Amatista?',
    corto: 'Organización',
    resumen: 'Cursos, niveles, módulos y lecciones: dónde está cada cosa.',
    bloques: [
      {
        type: 'markdown_text',
        body:
          'Amatista te enseña 3D **haciendo**. Todo está ordenado de lo grande a lo pequeño, y siempre sabes cuál es tu siguiente paso:\n\n' +
          '- **Curso**: un tema completo, como Blender o A-Frame. Lo eliges en **Cursos** (arriba).\n' +
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
  },
  {
    id: 'lecciones',
    titulo: '¿Cómo se completa una lección?',
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
  },
  {
    id: 'avance',
    titulo: '¿Dónde veo mi avance?',
    corto: 'Tu avance',
    resumen: 'Dónde ves lo que llevas y cómo se guarda.',
    bloques: [
      {
        type: 'concept_cards',
        items: [
          { term: 'XP y nivel', definition: 'Arriba a la derecha. Cada lección suma XP y con XP subes de nivel (Aprendiz, Modelador, Escultor…).' },
          { term: 'Racha', definition: 'Días seguidos con actividad. Una lección al día basta para mantenerla.' },
          { term: 'Insignias', definition: 'Una por módulo, al vencer a su jefe final. Las ves en tu muro de insignias.' },
          { term: 'Mi panel', definition: 'Tu resumen: qué sigue, tus cursos, exámenes, logros e insignias.' },
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
  },
  {
    id: 'instalar',
    titulo: '¿Cómo conecto Blender?',
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
            title: 'Entra con tu cuenta y abre la pestaña «Blender»',
            text: 'Está arriba, entre Cursos y Mi panel. Descarga el paquete de tu sistema con la sesión iniciada: así trae tu acceso y se conecta solo.',
          },
          {
            title: 'Descomprime y ejecuta el instalador',
            text: 'El instalador busca tu Blender, revisa la versión y deja el add-on listo. Si Blender es muy viejo, te avisa y no cambia nada.',
          },
          {
            title: 'Vuelve a la lección y pulsa «Abrir en Blender»',
            text: 'Blender se abre solo en la actividad. La primera vez tu navegador pregunta si puede abrir «Amatista para Blender»: elige Abrir. Dentro de Blender, Amatista está en el menú «Amatista» de arriba, en el botón Amatista de la vista 3D y en la pestaña de trabajo «Amatista».',
          },
          {
            title: '¿Te pide un código? Conéctalo',
            text: 'Si descargaste el paquete sin sesión, la pestaña muestra un código. Tiene 8 caracteres (como ABCD-2345) y vale 10 minutos. Escríbelo en la plataforma (se abre sola la página «Conectar Blender») y pulsa «Conectar». En la pestaña Blender ves tus Blender conectados.',
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
        title: 'Conoce el add-on antes de tu primer taller',
        body: 'En la pestaña **Blender** están las tres prácticas **Conoce Amatista Motor**: tu pestaña Amatista, moverte y usar tus herramientas, y cómo te enseña el taller. Unos 3 minutos cada una, y la plataforma te muestra en vivo en qué paso vas.',
      },
    ],
  },
  {
    id: 'taller',
    titulo: '¿Cómo me enseña el add-on?',
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
  },
];
