// Goliat no deja que te frustres: cuenta cómo te va en las actividades de la
// página y decide cuándo acercarse. No interrumpe a la primera: la mascota
// del módulo ya anima tras un fallo. Goliat entra cuando la cosa se pone
// difícil de verdad (varios fallos seguidos, muchos intentos o un examen sin
// aprobar) y celebra cuando sale algo que costó. Funciones puras: pruebas en
// frustracion.test.js.

export const RACHA_DIFICIL = 2; // fallos seguidos para acercarse
export const INTENTOS_DIFICILES = 3; // intentos en una sola actividad

export const estadoInicial = () => ({ fallosSeguidos: 0, apoyos: 0, ultimoApoyo: null, lucho: false });

// Registra un resultado {tipo: 'actividad'|'examen'|'intento', correcto, intentos, aprobado, fallos}
// y devuelve {estado, aviso}: aviso es null o {clave, gesto, texto, acciones}.
export function registrar(estado, resultado = {}, momento = Date.now()) {
  // Un intento fallido dentro de una actividad: no cuenta como fallo de la
  // racha (la actividad sigue abierta), pero al tercero Goliat se acerca.
  if (resultado.tipo === 'intento') {
    const reciente = estado.ultimoApoyo !== null && momento - estado.ultimoApoyo < 45000;
    if ((Number(resultado.fallos) || 0) < INTENTOS_DIFICILES || reciente) return { estado, aviso: null };
    return {
      estado: { ...estado, apoyos: estado.apoyos + 1, ultimoApoyo: momento, lucho: true },
      aviso: estado.apoyos >= 2 ? AVISOS.pausa : AVISOS[`apoyo${estado.apoyos % 2}`],
    };
  }
  const examen = resultado.tipo === 'examen';
  const bien = examen ? Boolean(resultado.aprobado) : Boolean(resultado.correcto);
  const intentos = Number(resultado.intentos) || 1;

  if (bien) {
    const costo = estado.lucho || estado.fallosSeguidos >= RACHA_DIFICIL || intentos >= INTENTOS_DIFICILES;
    const nuevo = { ...estado, fallosSeguidos: 0, lucho: false };
    return { estado: nuevo, aviso: costo ? AVISOS.perseveraste : null };
  }

  const fallos = estado.fallosSeguidos + 1;
  const dificil = examen || fallos >= RACHA_DIFICIL || intentos >= INTENTOS_DIFICILES;
  // Sin agobiar: como mucho un apoyo cada 45 s.
  const reciente = estado.ultimoApoyo !== null && momento - estado.ultimoApoyo < 45000;
  if (!dificil || reciente) return { estado: { ...estado, fallosSeguidos: fallos, lucho: false }, aviso: null };

  const aviso = examen ? AVISOS.examen : estado.apoyos >= 2 ? AVISOS.pausa : AVISOS[`apoyo${estado.apoyos % 2}`];
  return {
    estado: { ...estado, fallosSeguidos: fallos, apoyos: estado.apoyos + 1, ultimoApoyo: momento, lucho: false },
    aviso,
  };
}

export const AVISOS = {
  apoyo0: {
    clave: 'apoyo0',
    gesto: 'preocupado',
    texto: 'Ey. Ya van varias y está bien: así se aprende. Relee solo la instrucción, sin el resto, y prueba una cosa a la vez.',
    acciones: [{ texto: 'Me atoré', intencion: 'atorado' }],
  },
  apoyo1: {
    clave: 'apoyo1',
    gesto: 'preocupado',
    texto: 'Cambio de táctica: vuelve a la parte de la lección que explica esto, míralo un minuto y regresa. Yo te guardo el lugar.',
    acciones: [{ texto: 'Atajos de Blender', intencion: 'atajos' }],
  },
  pausa: {
    clave: 'pausa',
    gesto: 'dormido',
    texto: 'Mira, hasta yo me canso de ladrar. Levántate, toma agua, estira la espalda. Cinco minutos y lo ves con otros ojos. Tu avance no se va a ningún lado.',
    acciones: [],
  },
  examen: {
    clave: 'examen',
    gesto: 'preocupado',
    texto: 'No pasó esta vez. No es el final: repasa las lecciones del módulo, en especial donde dudaste, y vuelve a intentarlo cuando quieras.',
    acciones: [],
  },
  perseveraste: {
    clave: 'perseveraste',
    gesto: 'contento',
    texto: '¡Eso! Costó y salió. Eso que acabas de hacer, no rendirte, vale más que acertar a la primera.',
    acciones: [],
  },
};
