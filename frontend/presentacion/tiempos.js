// Tiempos de la voz (segundos del audio), medidos con Whisper palabra por palabra.
// La voz corre seguida, sin pausas: la narrativa no se corta.
// Antes de la voz va un prólogo con música (nuestra historia, PROLOGO s) y la gema que se arma (4 s);
// después de «Muchas gracias», la tarjeta final (FIN s).
export const PROLOGO = 16;
export const PRE = PROLOGO + 4;
export const VOZ = 233.71;
export const PAUSAS = [];
export const DURACION = 260;
export const FIN = DURACION - PRE - VOZ;

// Línea (segundos desde que empieza la voz, contando las pausas) ↔ voz.
export const inicioPausa = (p) => p.en + PAUSAS.filter((q) => q.en < p.en).reduce((s, q) => s + q.d, 0);
export const aLinea = (v) => v + PAUSAS.filter((p) => v >= p.en).reduce((s, p) => s + p.d, 0);
export const pausaEn = (l) => PAUSAS.find((p) => l >= inicioPausa(p) && l < inicioPausa(p) + p.d) ?? null;
export function aVoz(l) {
  let corrido = 0; // segundos de pausa ya pasados
  for (const p of PAUSAS) {
    const a = p.en + corrido;
    if (l < a) return l - corrido;
    if (l < a + p.d) return p.en;
    corrido += p.d;
  }
  return l - corrido;
}

// Capítulos del guion (barra inferior).
export const CAPITULOS = [
  { n: '01', texto: 'El problema', desde: 0, hasta: 78.1 },
  { n: '02', texto: 'La solución', desde: 78.1, hasta: 144.1 },
  { n: '03', texto: 'Telemetría', desde: 144.1, hasta: 177.0 },
  { n: '04', texto: 'Inclusión y escala', desde: 177.0, hasta: VOZ },
];

// Subtítulos: lo que se dice, con la redacción del guion (Whisper confundió «Model», «nove», «adón»…).
export const SUBTITULOS = [
  [0.0, 7.48, 'Buenos días. Somos el equipo Amatista: Maximiliano Cabello Mata y Diana Paola Acatitla Martínez.'],
  [8.26, 13.86, 'Elegimos el Reto 2: crear una solución educativa offline-first,'],
  [14.18, 17.84, 'capaz de funcionar en escuelas o comunidades con conectividad limitada,'],
  [18.14, 21.04, 'sincronizando la información cuando vuelva a disponer de internet,'],
  [21.14, 28.54, 'e incorporar contenidos, actividades, seguimiento del progreso, comunicación docente o IA ejecutada localmente.'],
  [28.54, 34.68, 'La falta de conectividad sigue siendo una de las principales barreras para acceder al aprendizaje digital.'],
  [35.02, 40.64, 'Actualmente, la enseñanza del modelado 3D en México enfrenta una profunda brecha de infraestructura.'],
  [41.02, 48.38, 'Aunque existen más de 20,900 escuelas de nivel medio superior y más de 1,500 facultades universitarias'],
  [48.72, 54.92, 'donde el modelado 3D es obligatorio para ingeniería, arquitectura y diseño digital,'],
  [54.92, 59.92, 'la gran mayoría carece de equipos potentes o de una conectividad estable.'],
  [60.38, 66.7, 'Cuando una escuela intenta enseñar diseño 3D con plataformas basadas en video o en la nube,'],
  [67.08, 68.46, 'la red escolar colapsa.'],
  [68.8, 72.6, 'Las computadoras básicas se bloquean y los profesores trabajan a ciegas,'],
  [72.82, 77.94, 'intentando evaluar a 40 alumnos al mismo tiempo sin herramientas accesibles de seguimiento.'],
  [78.24, 83.7, 'Para romper esta barrera creamos Amatista, una plataforma educativa de modelado 3D'],
  [83.7, 89.82, 'optimizada para entornos con recursos limitados, que funciona sin internet y sin tarjetas gráficas costosas.'],
  [90.28, 91.82, 'Consta de dos pilares.'],
  [92.52, 96.9, 'Una aplicación web ultraligera que corre directamente en cualquier navegador estándar.'],
  [97.1, 103.16, 'Permite al alumno consultar contenidos e interactuar con entornos 3D sin instalaciones pesadas'],
  [103.16, 106.18, 'y con un consumo de datos menor al de una red social.'],
  [106.38, 111.82, 'Un add-on integrado para Blender que se instala de forma sencilla en las computadoras del laboratorio escolar'],
  [112.42, 119.6, 'y convierte este software profesional en una herramienta guiada de enseñanza, 100 % desconectada de internet,'],
  [119.6, 125.02, 'verificando paso a paso, en la computadora del alumno, que haya construido bien su modelo.'],
  [125.4, 128.44, 'Además, como mención especial en nuestra arquitectura,'],
  [128.6, 132.38, 'respaldamos este aprendizaje con Geoda, nuestro propio flujo automatizado'],
  [132.7, 138.26, 'de extracción y limpieza de datos que estructura documentación técnica oficial para nutrir nuestras guías'],
  [138.44, 143.82, 'paso a paso y habilitar asistencia inteligente ejecutada localmente, sin depender de internet.'],
  [144.2, 148.88, 'Mientras el estudiante practica sin conexión, Amatista guarda su avance en el equipo'],
  [148.88, 155.16, 'registrando telemetría educativa muy ligera: qué pasos logró completar y dónde tuvo dificultad.'],
  [155.4, 158.78, 'Al recuperar la conexión, en lugar de subir archivos 3D pesados,'],
  [159.22, 164.56, 'la plataforma envía únicamente telemetría en texto ligero hacia nuestro backend en FastAPI'],
  [164.56, 171.46, 'y esquemas SQL optimizados. Mediante códigos de vinculación de un solo uso y cuentas por rol,'],
  [171.6, 176.92, 'el profesor recibe en su panel el seguimiento real de todo su grupo desde la fuente original.'],
  [177.14, 182.66, 'Bajo un enfoque inclusivo y equitativo, Amatista beneficia directamente a cientos de planteles'],
  [182.66, 186.98, 'de educación media superior con limitaciones de equipo,'],
  [187.18, 192.68, 'así como a más de 1,500 facultades universitarias de ingeniería, arquitectura y arte digital.'],
  [192.68, 201.04, 'En nuestra fase piloto inicial en México, proyectamos beneficiar directamente a más de 500 alumnos.'],
  [201.04, 206.54, 'Al procesar los gráficos en el equipo local y sincronizar solo telemetría ligera,'],
  [206.62, 209.78, 'nuestro costo operativo de servidor por estudiante es mínimo.'],
  [210.24, 213.6, 'Así cumplimos con el criterio de transferencia al mercado global:'],
  [214.1, 220.04, 'un producto hoy desplegado y funcionando en producción, adaptable y sostenible para escalar'],
  [220.04, 222.98, 'a cientos de miles de estudiantes en toda Latinoamérica.'],
  [223.8, 228.1, 'El talento está repartido de forma equitativa en México, pero las herramientas no…'],
  [228.42, 232.48, 'hasta hoy. Con Amatista, ningún estudiante se quedará sin moldear su futuro.'],
  [232.7, 233.6, 'Muchas gracias.'],
];

// El reto, textual (Hack4Edu 2026), con el segundo en que la voz dice cada parte.
export const RETO = [
  { desde: 10.24, hasta: 13.9, texto: 'El reto consiste en crear una solución educativa offline-first' },
  { desde: 14.18, hasta: 17.84, texto: 'capaz de funcionar en escuelas o comunidades con conectividad limitada,' },
  { desde: 18.14, hasta: 21.04, texto: 'sincronizando la información cuando vuelva a disponer de red.' },
  { desde: 21.14, hasta: 28.3, texto: 'Puede incorporar contenidos, actividades, seguimiento del progreso, comunicación docente o incluso capacidades de IA ejecutadas localmente.' },
  { desde: 28.54, hasta: 34.5, texto: 'La falta de conectividad sigue siendo una de las principales barreras para acceder al aprendizaje digital.', fuerte: true },
];
