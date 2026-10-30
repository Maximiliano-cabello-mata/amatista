// Lo que Goliat sabe. Solo datos: el cerebro (cerebro.js) decide qué usar.
// Goliat es gruñón pero leal: habla poco, va al grano, nunca regaña y nunca
// da la respuesta de un ejercicio; ayuda a encontrar el camino. Para agregar
// algo que entienda, basta con sumar una intención con sus claves.
//
// Claves: una palabra o frase sin acentos; ['frase', peso] para dar más peso.
// Las palabras se comparan por raíz y con una falta de ortografía permitida.

export const INTENCIONES = [
  {
    id: 'atorado',
    gesto: 'preocupado',
    claves: [
      ['me atore', 2], ['atorado', 2], ['atorada', 2], ['atore', 2], ['no puedo', 2], ['no me sale', 2], ['no sale', 2],
      ['no entiendo', 2], ['me rindo', 3], ['frustr', 2], ['dificil', 1.5], ['imposible', 1.5], ['odio', 1.5],
      ['ayudame', 1.5], ['auxilio', 1.5], ['estoy perdido', 2], ['perdida', 1.5], ['no funciona', 2], ['esta mal', 1.5],
    ],
    respuestas: [
      'Grr… respira. Nadie nace sabiendo. Vamos por partes: relee solo la primera línea de la instrucción y haz únicamente eso. Lo demás espera.',
      'Atorarse es parte del oficio. Haz la versión más chiquita del paso, aunque quede fea. Fea y hecha le gana a perfecta y en la cabeza.',
      'Si algo se rompió, Ctrl + Z lo regresa. Si no sabes qué sigue, la pista de la actividad no te quita puntos de orgullo. Yo aquí sigo.',
    ],
    acciones: [
      { texto: 'Ctrl + Z y otros atajos', intencion: 'atajos' },
      { texto: 'Ver la ayuda', href: '#/guia' },
    ],
  },
  {
    id: 'continuar',
    claves: [['seguir', 1.5], ['continuar', 2], ['continua', 2], ['donde me quede', 3], ['me quede', 2], ['siguiente leccion', 3], ['siguiente', 1], ['retomar', 2]],
    respuestas: [''],
  },
  {
    id: 'proyecto',
    claves: [['proyecto', 2], ['idea', 2], ['ideas', 2], ['inventar', 1.5], ['crear algo', 2], ['hacer algo', 2], ['que modelo', 2], ['que hago', 1.5], ['practicar', 1.5], ['reto', 1]],
    respuestas: [''],
  },
  {
    id: 'atajos',
    claves: [['atajos', 2], ['atajo', 2], ['teclas', 2], ['shortcuts', 2], ['combinaciones', 1.5]],
    respuestas: [''],
  },
  {
    id: 'progreso',
    gesto: 'atento',
    claves: [['progreso', 2], ['avance', 2], ['mi panel', 2], ['panel', 1.5], ['xp', 2], ['nivel', 1], ['insignia', 2], ['racha', 2], ['logros', 2], ['puntos', 1.5]],
    respuestas: ['Tu avance, tus insignias y tu racha viven en Mi panel. Se guarda en tu equipo y se sube a tu cuenta cuando hay conexión.'],
    acciones: [{ texto: 'Ir a Mi panel', href: '#/panel' }],
  },
  {
    id: 'blender',
    gesto: 'atento',
    claves: [['vincular', 2], ['conectar', 2], ['enlazar', 2], ['addon', 2], ['add on', 2], ['complemento', 2], ['instalar', 1.5], ['instalo', 1.5], ['descargar blender', 2], ['abrir blender', 2], ['blender', 1]],
    respuestas: [
      'Para practicar en Blender: instala el add-on de Amatista y vincúlalo con tu cuenta. Todo está en la página Blender, paso a paso; tarda un par de minutos.',
    ],
    acciones: [{ texto: 'Ir a Blender', href: '#/blender' }],
  },
  {
    id: 'aframe',
    gesto: 'atento',
    claves: [['aframe', 2], ['a frame', 2], ['realidad virtual', 2], ['web 3d', 2], ['a scene', 2], ['a box', 2], ['html', 1]],
    respuestas: [
      'A-Frame es 3D en la web: dentro de <a-scene> pones piezas como <a-box> o <a-sphere> y les das position, rotation y color. Se prueba en el navegador, sin instalar nada.',
    ],
    acciones: [{ texto: 'Ver los cursos', href: '#/' }],
  },
  {
    id: 'ayuda',
    gesto: 'atento',
    claves: [['ayuda', 1.5], ['guia', 2], ['como funciona', 2], ['recorrido', 2], ['tutorial', 2], ['no se usar', 2], ['para que sirve', 1.5]],
    minimo: 1.5,
    respuestas: ['En Ayuda está el recorrido de un minuto por la plataforma y respuestas cortas a lo más común. Si no está ahí, pregúntame.'],
    acciones: [{ texto: 'Abrir la ayuda', href: '#/guia' }],
  },
  {
    id: 'cuenta',
    gesto: 'atento',
    claves: [['contrasena', 2], ['password', 2], ['cuenta', 1.5], ['iniciar sesion', 2], ['entrar', 1], ['registrar', 2], ['registro', 2], ['correo', 1.5], ['perfil', 1.5]],
    respuestas: ['Sin cuenta también avanzas: se guarda en este equipo. Con cuenta lo llevas a cualquier lado. Si olvidaste la contraseña, se recupera con tu correo.'],
    acciones: [
      { texto: 'Entrar', href: '#/entrar' },
      { texto: 'Recuperar contraseña', href: '#/recuperar' },
    ],
  },
  {
    id: 'conexion',
    gesto: 'atento',
    claves: [['internet', 2], ['sin conexion', 2], ['conexion', 1.5], ['offline', 2], ['se perdio', 1.5], ['no guardo', 2], ['se borro', 1.5]],
    respuestas: ['Tranquilo: tu avance se guarda primero en este equipo y se sube solo cuando vuelve la conexión. Las lecciones que ya abriste funcionan sin internet.'],
  },
  {
    id: 'lento',
    gesto: 'atento',
    claves: [['lento', 2], ['lenta', 2], ['se traba', 2], ['lag', 2], ['tarda', 1.5], ['congela', 2], ['pesado', 1.5]],
    respuestas: [
      'En equipos modestos Amatista se pone sola en modo ligero: quita el fondo facetado y las animaciones. Si Blender va lento, baja las subdivisiones mientras modelas y súbelas al final.',
    ],
  },
  {
    id: 'examen',
    gesto: 'atento',
    claves: [['examen', 2], ['prueba', 1.5], ['calificacion', 2], ['aprobar', 2], ['reprobe', 2], ['repetir', 1]],
    respuestas: [
      'Cada examen dice su mínimo para aprobar y puedes repetirlo. Si reprobaste, repasa las lecciones del módulo: el examen no pregunta nada que no hayas visto.',
    ],
  },
  {
    id: 'descanso',
    gesto: 'dormido',
    claves: [['cansado', 2], ['cansada', 2], ['sueno', 1.5], ['descanso', 2], ['harto', 2], ['harta', 2], ['ya no quiero', 2]],
    respuestas: [
      'Entonces pausa. Ve por agua, estírate, mira por la ventana como yo. Tu avance se queda guardado y yo me quedo aquí echado.',
    ],
  },
  {
    id: 'animo',
    gesto: 'preocupado',
    claves: [['no sirvo', 3], ['soy malo', 3], ['soy mala', 3], ['no soy bueno', 3], ['no soy buena', 3], ['aburrido', 1.5], ['motivacion', 2], ['para que', 1]],
    respuestas: [
      'Grr. Nada de eso. Todo el que hoy modela bonito hizo primero cubos chuecos. Lo que cuenta es que sigues aquí. Un paso chiquito más y lo celebramos.',
    ],
    acciones: [{ texto: 'Idea de proyecto', intencion: 'proyecto' }],
  },
  {
    id: 'quien',
    gesto: 'gruñon',
    claves: [['quien eres', 3], ['goliat', 1], ['como te llamas', 3], ['eres un perro', 2], ['perro', 1.5], ['perrito', 1.5], ['de quien', 1.5]],
    respuestas: [
      'Soy Goliat. Un perro de verdad: el de Maximiliano, quien hizo Amatista. Me dibujaron en low poly con mi oreja doblada, mi pañoleta y mi placa. Gruño mucho, pero no me voy de tu lado.',
    ],
  },
  {
    id: 'saludo',
    gesto: 'gruñon',
    claves: [['hola', 2], ['buenas', 2], ['buenos dias', 2], ['hey', 1.5], ['que tal', 2], ['que onda', 2], ['ola', 1.5]],
    respuestas: ['Grr… hola, {nombre}. Aquí ando. ¿En qué te echo la pata?', 'Mm. Ya llegaste. ¿Qué hacemos hoy?'],
    acciones: [
      { texto: 'Seguir donde me quedé', intencion: 'continuar' },
      { texto: 'Idea de proyecto', intencion: 'proyecto' },
    ],
  },
  {
    id: 'gracias',
    gesto: 'contento',
    claves: [['gracias', 2], ['grax', 2], ['buen perro', 3], ['te quiero', 3], ['eres el mejor', 3], ['carino', 2]],
    respuestas: ['Mm. De nada. No te acostumbres. (Sí, estoy moviendo la cola.)'],
  },
];

// Atajos de Blender (4.2+). `basico` entra en la lista corta.
export const ATAJOS = [
  { id: 'mover', que: 'Mover', corto: 'mover', teclas: 'G', basico: true, claves: ['mover', 'muevo', 'mueve', 'desplazar', 'grab'], consejo: 'Después de G, pulsa X, Y o Z para moverlo solo en ese eje.' },
  { id: 'rotar', que: 'Rotar', corto: 'rotar', teclas: 'R', basico: true, claves: ['rotar', 'roto', 'girar', 'giro', 'voltear'], consejo: 'R, luego Z y 90 gira exactamente 90 grados en Z.' },
  { id: 'escalar', que: 'Escalar', corto: 'escalar', teclas: 'S', basico: true, claves: ['escalar', 'escalo', 'agrandar', 'achicar', 'tamano', 'reducir'], consejo: 'Escribe un número después de S para escalar exacto (S 2 = el doble).' },
  { id: 'edicion', que: 'Entrar y salir del modo edición', corto: 'modo edición', teclas: 'Tab', basico: true, claves: ['modo edicion', 'editar', 'vertices', 'tab', 'edit mode'], consejo: 'En modo edición, 1, 2 y 3 cambian entre vértices, aristas y caras.' },
  { id: 'extruir', que: 'Extruir', corto: 'extruir', teclas: 'E (en modo edición)', basico: true, claves: ['extruir', 'extruyo', 'extrusion', 'estirar cara', 'sacar cara'], consejo: 'Selecciona una cara, E y mueve el ratón. Si te arrepientes, clic derecho cancela el movimiento (la extrusión queda: Ctrl + Z).' },
  { id: 'insertar', que: 'Insertar caras (inset)', corto: 'inset', teclas: 'I (en modo edición)', claves: ['inset', 'insertar cara', 'borde interior', 'marco'], consejo: 'Hace una cara más chica dentro de la seleccionada: ideal para ventanas y pantallas.' },
  { id: 'bisel', que: 'Biselar', corto: 'bisel', teclas: 'Ctrl + B', claves: ['bisel', 'biselar', 'redondear borde', 'chaflan', 'bevel'], consejo: 'La rueda del ratón agrega segmentos mientras biselas.' },
  { id: 'bucle', que: 'Corte en bucle', corto: 'corte en bucle', teclas: 'Ctrl + R', claves: ['corte en bucle', 'loop cut', 'cortar', 'dividir', 'mas lineas', 'loop'], consejo: 'La rueda del ratón agrega más cortes; clic para fijar y otro clic para colocar.' },
  { id: 'anadir', que: 'Añadir un objeto', corto: 'añadir', teclas: 'Shift + A', basico: true, claves: ['anadir', 'agregar', 'nuevo objeto', 'insertar objeto', 'cubo', 'esfera', 'cilindro'], consejo: 'Aparece donde está el cursor 3D (la mirilla roja y blanca).' },
  { id: 'duplicar', que: 'Duplicar', corto: 'duplicar', teclas: 'Shift + D', basico: true, claves: ['duplicar', 'copiar', 'clonar', 'otro igual'], consejo: 'Al duplicar ya lo estás moviendo: X, Y o Z para fijar el eje.' },
  { id: 'borrar', que: 'Borrar', corto: 'borrar', teclas: 'X o Supr', claves: ['borrar', 'eliminar', 'quitar', 'suprimir'], consejo: 'En modo edición, X pregunta qué borrar: vértices, aristas o caras.' },
  { id: 'deshacer', que: 'Deshacer', corto: 'deshacer', teclas: 'Ctrl + Z', basico: true, claves: ['deshacer', 'regresar', 'me equivoque', 'rompi', 'undo', 'ctrl z'], consejo: 'Rehacer es Ctrl + Shift + Z. Deshacer no tiene nada de vergonzoso.' },
  { id: 'todo', que: 'Seleccionar todo', corto: 'seleccionar todo', teclas: 'A', claves: ['seleccionar todo', 'todo', 'select all'], consejo: 'Alt + A quita la selección.' },
  { id: 'buscar', que: 'Buscar cualquier comando', corto: 'buscar', teclas: 'F3', claves: ['buscar', 'busqueda', 'comando', 'no encuentro'], consejo: 'Si no recuerdas la tecla, F3 y escribe el nombre en inglés (por ejemplo «bevel»).' },
  { id: 'unir', que: 'Unir objetos', corto: 'unir', teclas: 'Ctrl + J', claves: ['unir', 'juntar', 'combinar', 'join'], consejo: 'El último que seleccionas es el que se queda con el nombre y el origen.' },
  { id: 'separar', que: 'Separar en otro objeto', corto: 'separar', teclas: 'P (en modo edición)', claves: ['separar', 'separate', 'sacar a otro'], consejo: '«Selección» separa solo lo que tienes marcado.' },
  { id: 'cara', que: 'Rellenar con una cara', corto: 'rellenar', teclas: 'F (en modo edición)', claves: ['rellenar', 'tapar hueco', 'hueco', 'crear cara', 'fill'], consejo: 'Selecciona los vértices o aristas del borde del hueco y pulsa F.' },
  { id: 'enfocar', que: 'Centrar la vista en lo seleccionado', corto: 'enfocar', teclas: 'Numpad . (punto)', claves: ['enfocar', 'centrar', 'perdi el objeto', 'no veo', 'zoom', 'acercar'], consejo: 'Sin teclado numérico: Vista › Encuadrar seleccionado, o activa «Emular teclado numérico» en Preferencias.' },
  { id: 'camara', que: 'Ver por la cámara', corto: 'vista de cámara', teclas: 'Numpad 0', claves: ['camara', 'vista de camara', 'encuadre'], consejo: 'Ctrl + Alt + Numpad 0 pone la cámara donde estás mirando.' },
  { id: 'render', que: 'Renderizar la imagen', corto: 'render', teclas: 'F12', basico: true, claves: ['render', 'renderizar', 'imagen final', 'foto'], consejo: 'En la ventana del render, Imagen › Guardar como. ¡Y enséñalo!' },
  { id: 'keyframe', que: 'Insertar un fotograma clave', corto: 'keyframe', teclas: 'I (en modo objeto)', claves: ['keyframe', 'fotograma clave', 'animar', 'animacion', 'clave'], consejo: 'Mueve la línea de tiempo, cambia algo y vuelve a pulsar I: Blender rellena lo de en medio.' },
  { id: 'aplicar', que: 'Aplicar escala y rotación', corto: 'aplicar', teclas: 'Ctrl + A', claves: ['aplicar', 'aplicar escala', 'escala rara', 'bisel raro'], consejo: 'Si el bisel o los modificadores salen chuecos, casi siempre es la escala sin aplicar.' },
];

// Ideas de proyecto propio por nivel: 0 (empezando), 1 (ya modela), 2 (avanzado).
export const IDEAS = [
  { id: 'taza', nivel: 0, titulo: 'Una taza low poly', que: 'una taza', porque: 'Un cilindro, un inset y una asa: tres herramientas y un objeto que puedes poner en cualquier escena.' },
  { id: 'arbol', nivel: 0, titulo: 'Un árbol low poly', que: 'un árbol', porque: 'Un cilindro de tronco y una esfera de pocas caras de copa. Con tres o cuatro ya tienes bosque.' },
  { id: 'hongo', nivel: 0, titulo: 'Un hongo de videojuego', que: 'un hongo', porque: 'Media esfera, un cilindro y dos colores. Sale en una tarde y se ve genial.' },
  { id: 'mesa', nivel: 0, titulo: 'Tu mesa de trabajo', que: 'tu mesa', porque: 'Mide la real con una regla: modelar algo que conoces enseña proporción mejor que nada.' },
  { id: 'cuarto', nivel: 1, titulo: 'Tu cuarto en isométrico', que: 'tu cuarto', porque: 'Un diorama: dos paredes, el piso y tus muebles. Mezcla todo lo que ya sabes en una sola escena.' },
  { id: 'cofre', nivel: 1, titulo: 'Un cofre del tesoro', que: 'un cofre', porque: 'Biseles, cortes en bucle y una tapa que se abre: perfecto para tu primera animación.' },
  { id: 'farola', nivel: 1, titulo: 'Una farola de noche', que: 'una farola', porque: 'Pocas piezas, pero la luz hace todo el trabajo: aprendes iluminación sin darte cuenta.' },
  { id: 'robot', nivel: 1, titulo: 'Un robot de bloques', que: 'un robot', porque: 'Cubos, cilindros y mucha personalidad. Después puedes posarlo.' },
  { id: 'goliat', nivel: 2, titulo: 'Tu mascota en low poly', que: 'tu mascota', porque: 'Así nací yo: fotos de referencia, formas simples y paciencia con las orejas. Hazlo con tu perro, tu gato o tu pez.' },
  { id: 'isla', nivel: 2, titulo: 'Una isla flotante animada', que: 'una isla flotante', porque: 'Roca, pasto, un árbol y una cámara que gira alrededor: escena, materiales y animación en un solo proyecto.' },
  { id: 'calle', nivel: 2, titulo: 'Una esquina de tu colonia', que: 'una esquina de tu colonia', porque: 'Sal, toma fotos y reconstrúyela. Nadie más puede hacer ese proyecto.' },
];

// Los pasos de cualquier proyecto: de referencia a render.
export const PASOS_PROYECTO = [
  { id: 'referencia', texto: 'Junta 2 o 3 fotos de {que}', pista: 'Desde varios lados. Mírala antes de tocar Blender.' },
  { id: 'bloqueo', texto: 'Bloquea con formas básicas', pista: 'Cubos y cilindros en su lugar y a su tamaño (Shift + A, G, S). Nada de detalle todavía.' },
  { id: 'forma', texto: 'Dale forma', pista: 'Modo edición: extruir (E), inset (I), bisel (Ctrl + B), corte en bucle (Ctrl + R).' },
  { id: 'color', texto: 'Ponle color', pista: 'Colores planos, uno por pieza: el low poly brilla con pocos colores.' },
  { id: 'luz', texto: 'Luz y cámara', pista: 'Una luz principal, una suave de relleno y la cámara donde se vea mejor (Numpad 0).' },
  { id: 'render', texto: 'Render y enséñalo', pista: 'F12 y guarda la imagen. Enséñaselo a alguien: así se termina un proyecto.' },
];
