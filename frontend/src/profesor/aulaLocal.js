// src/profesor/aulaLocal.js
// Almacén interactivo/offline para el panel del profesor y «Mi clase / Mi grupo».
// Funciona en el navegador sin necesidad de backend ni bases de datos activas,
// permitiendo evaluar y recrear modelos 3D a partir del CÓDIGO DEL MODELO (~1 KB)
// en menos de 5 minutos.
import { compilarCodigoModelo, PLANTILLAS_CODIGO_MODELO } from './modelo';

export const CODIGO_CLASE_DEMO = 'AMA-7K2P';
const CLAVE_STORAGE = 'amatista_aula_local_v1';

const PRACTICAS_CATALOGO = [
  {
    id: 'blender.bp.m1.tren',
    nivel: 1,
    curso_id: 'blender_principiante',
    titulo: 'Tren Low-Poly',
    modulo_nombre: 'Módulo 1 · Formas Básicas y Bloqueo',
    descripcion: 'Modela un tren de juguete combinando chasis, cabina, caldera y ruedas con primitivas básicas.',
  },
  {
    id: 'blender.bp.m2.espada',
    nivel: 1,
    curso_id: 'blender_principiante',
    titulo: 'Espada de Cristal',
    modulo_nombre: 'Módulo 2 · Modo Edición y Extrusión',
    descripcion: 'Modela una espada de cristal low-poly con empuñadura y hoja afilada.',
  },
  {
    id: 'blender.bp.m3.nave',
    nivel: 1,
    curso_id: 'blender_principiante',
    titulo: 'Nave Espacial',
    modulo_nombre: 'Módulo 3 · Modificadores y Biselado',
    descripcion: 'Modela una nave espacial usando simetría (Mirror) y biseles.',
  },
  {
    id: 'aframe.m1.isla',
    nivel: 1,
    curso_id: 'aframe_web',
    titulo: 'Faro y Cristal en Isla',
    modulo_nombre: 'Módulo 1 · Primitivas Web 3D',
    descripcion: 'Construye un escenario virtual con isla, faro y cristal amatista con A-Frame HTML.',
  },
  {
    id: 'aframe.m2.galeria',
    nivel: 2,
    curso_id: 'aframe_web',
    titulo: 'Galería Virtual 3D',
    modulo_nombre: 'Módulo 2 · Entornos y Recorridos',
    descripcion: 'Crea una sala de exhibición interactiva navegable en el navegador o visor VR.',
  },
];

function crearEstadoInicial() {
  const alumnosDemo = [
    { id: 'alu-ana', nombre: 'Ana Torres', email: 'ana@colegio.edu', unio_en: '2026-11-01T10:05:00.000Z' },
    { id: 'alu-carlos', nombre: 'Carlos Mendoza', email: 'carlos@colegio.edu', unio_en: '2026-11-01T10:08:00.000Z' },
    { id: 'alu-sofia', nombre: 'Sofía Reyes', email: 'sofia@colegio.edu', unio_en: '2026-11-01T10:12:00.000Z' },
    { id: 'alu-diego', nombre: 'Diego Morales', email: 'diego@colegio.edu', unio_en: '2026-11-01T10:15:00.000Z' },
    { id: 'alu-lucia', nombre: 'Lucía Navarro', email: 'lucia@colegio.edu', unio_en: '2026-11-01T10:20:00.000Z' },
  ];

  const grupos = [
    {
      id: 'grp-demo-7k2p',
      nombre: 'Modelado 3D · Secundaria y Bachillerato',
      codigo: CODIGO_CLASE_DEMO,
      creado_en: '2026-11-01T10:00:00.000Z',
      archivado: false,
      alumnos_count: alumnosDemo.length,
      alumnos: [...alumnosDemo],
    },
  ];

  const asignaciones = [
    {
      id: 'asg-tren-m1',
      grupo_id: 'grp-demo-7k2p',
      grupo_nombre: 'Modelado 3D · Secundaria y Bachillerato',
      practica_id: 'blender.bp.m1.tren',
      practica: 'Tren Low-Poly',
      titulo: 'Tren Low-Poly (Módulo 1)',
      descripcion: 'Modela el chasis, caldera, cabina y ruedas de un tren de juguete.',
      indicaciones: 'Modela el chasis, caldera, cabina y ruedas de un tren de juguete.',
      nivel: 1,
      fecha_limite: '2026-11-30T23:59:59.000Z',
      estado: 'abierta',
      creada_en: '2026-11-01T10:30:00.000Z',
    },
    {
      id: 'asg-isla-m1',
      grupo_id: 'grp-demo-7k2p',
      grupo_nombre: 'Modelado 3D · Secundaria y Bachillerato',
      practica_id: 'aframe.m1.isla',
      practica: 'Faro y Cristal en Isla',
      titulo: 'Faro y Cristal en Isla (Módulo 1 A-Frame)',
      descripcion: 'Crea la isla, torre del faro y cristal amatista con primitivas A-Frame.',
      indicaciones: 'Crea la isla, torre del faro y cristal amatista con primitivas A-Frame.',
      nivel: 1,
      fecha_limite: '2026-12-15T23:59:59.000Z',
      estado: 'abierta',
      creada_en: '2026-11-02T09:00:00.000Z',
    },
  ];

  // Precompila modelos iniciales para la clase demo
  let modeloTren = null;
  let modeloFaro = null;
  let modeloMesa = null;
  try {
    modeloTren = compilarCodigoModelo(PLANTILLAS_CODIGO_MODELO[0].codigo);
    modeloFaro = compilarCodigoModelo(PLANTILLAS_CODIGO_MODELO[1].codigo);
    modeloMesa = compilarCodigoModelo(PLANTILLAS_CODIGO_MODELO[2].codigo);
  } catch {
    // Si falla compilar en algún entorno, se almacena el código plano
  }

  const armarResumen = (mod) => {
    if (!mod?.objetos) return { objetos: 4, mallas: 4, vertices: 64, triangulos: 48, materiales: 3 };
    const mallas = mod.objetos.filter((o) => o.tipo === 'MESH').length;
    const vertices = mod.objetos.reduce((acc, o) => acc + (o.v ? o.v.length / 3 : 0), 0);
    const triangulos = mod.objetos.reduce((acc, o) => acc + (o.t ? o.t.length / 3 : 0), 0);
    return {
      objetos: mod.objetos.length,
      mallas,
      vertices,
      triangulos,
      materiales: mod.materiales?.length || 1,
    };
  };

  const entregas = [
    {
      id: 'ent-ana-tren',
      asignacion_id: 'asg-tren-m1',
      alumno_id: 'alu-ana',
      alumno: alumnosDemo[0],
      codigo_fuente: PLANTILLAS_CODIGO_MODELO[0].codigo,
      lenguaje: 'python',
      modelo: modeloTren || PLANTILLAS_CODIGO_MODELO[0].codigo,
      bytes: new TextEncoder().encode(PLANTILLAS_CODIGO_MODELO[0].codigo).length,
      modelo_bytes: new TextEncoder().encode(PLANTILLAS_CODIGO_MODELO[0].codigo).length,
      resumen: armarResumen(modeloTren),
      estado: 'entregada',
      progreso: 100,
      completada: true,
      intentos: 1,
      entregada_en: '2026-11-04T16:30:00.000Z',
      visto_en: null,
      calificacion: null,
      comentario: null,
      tarde: false,
    },
    {
      id: 'ent-carlos-tren',
      asignacion_id: 'asg-tren-m1',
      alumno_id: 'alu-carlos',
      alumno: alumnosDemo[1],
      codigo_fuente: PLANTILLAS_CODIGO_MODELO[1].codigo,
      lenguaje: 'aframe',
      modelo: modeloFaro || PLANTILLAS_CODIGO_MODELO[1].codigo,
      bytes: new TextEncoder().encode(PLANTILLAS_CODIGO_MODELO[1].codigo).length,
      modelo_bytes: new TextEncoder().encode(PLANTILLAS_CODIGO_MODELO[1].codigo).length,
      resumen: armarResumen(modeloFaro),
      estado: 'evaluada',
      progreso: 100,
      completada: true,
      intentos: 2,
      entregada_en: '2026-11-03T14:20:00.000Z',
      evaluada_en: '2026-11-04T09:00:00.000Z',
      visto_en: '2026-11-04T10:00:00.000Z',
      calificacion: 9,
      comentario: 'Excelente composición espacial y colores del faro y la isla.',
      tarde: false,
    },
    {
      id: 'ent-sofia-tren',
      asignacion_id: 'asg-tren-m1',
      alumno_id: 'alu-sofia',
      alumno: alumnosDemo[2],
      codigo_fuente: PLANTILLAS_CODIGO_MODELO[2].codigo,
      lenguaje: 'json',
      modelo: modeloMesa || PLANTILLAS_CODIGO_MODELO[2].codigo,
      bytes: new TextEncoder().encode(PLANTILLAS_CODIGO_MODELO[2].codigo).length,
      modelo_bytes: new TextEncoder().encode(PLANTILLAS_CODIGO_MODELO[2].codigo).length,
      resumen: armarResumen(modeloMesa),
      estado: 'rehacer',
      progreso: 70,
      completada: false,
      intentos: 1,
      entregada_en: '2026-11-04T18:10:00.000Z',
      evaluada_en: '2026-11-05T08:30:00.000Z',
      visto_en: null,
      calificacion: null,
      comentario: 'Buena estructura de la mesa; falta ajustar la altura de la lámpara.',
      tarde: false,
    },
  ];

  return { grupos, asignaciones, entregas };
}

let _memoriaEstado = null;

export function leerAulaLocal() {
  if (_memoriaEstado) return _memoriaEstado;
  if (typeof localStorage !== 'undefined') {
    try {
      const guardado = localStorage.getItem(CLAVE_STORAGE);
      if (guardado) {
        _memoriaEstado = JSON.parse(guardado);
        return _memoriaEstado;
      }
    } catch {
      // Ignorar error de lectura en modo incógnito/restringido
    }
  }
  _memoriaEstado = crearEstadoInicial();
  guardarAulaLocal(_memoriaEstado);
  return _memoriaEstado;
}

export function guardarAulaLocal(estado) {
  _memoriaEstado = estado;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(estado));
    } catch {
      // Ignorar cuota o almacenamiento desactivado
    }
  }
}

export function reiniciarAulaLocal() {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(CLAVE_STORAGE);
    } catch {
      // Ignorar
    }
  }
  _memoriaEstado = crearEstadoInicial();
  guardarAulaLocal(_memoriaEstado);
  return _memoriaEstado;
}

function contarPorEvaluar(grupoId, estado) {
  const asgs = estado.asignaciones.filter((a) => a.grupo_id === grupoId).map((a) => a.id);
  return estado.entregas.filter((e) => asgs.includes(e.asignacion_id) && e.estado === 'entregada').length;
}

export function listarGruposLocal() {
  const estado = leerAulaLocal();
  const datos = estado.grupos.map((g) => ({
    id: g.id,
    nombre: g.nombre,
    codigo: g.codigo,
    creado_en: g.creado_en,
    archivado: Boolean(g.archivado),
    alumnos: g.alumnos?.length || 0,
    practicas: estado.asignaciones.filter((a) => a.grupo_id === g.id).length,
    por_evaluar: contarPorEvaluar(g.id, estado),
  }));
  return { ok: true, status: 200, datos };
}

export function crearGrupoLocal(nombre) {
  const estado = leerAulaLocal();
  const num = Math.floor(1000 + Math.random() * 9000);
  const letras = ['A', 'B', 'K', 'M', 'P', 'R', 'T', 'X', 'Z'];
  const sufijo = letras[Math.floor(Math.random() * letras.length)] + letras[Math.floor(Math.random() * letras.length)];
  const codigo = `AMA-${num.toString().slice(0, 2)}${sufijo}`;
  const nuevo = {
    id: `grp-${Date.now()}`,
    nombre: String(nombre || 'Nuevo Grupo').trim(),
    codigo,
    creado_en: new Date().toISOString(),
    archivado: false,
    alumnos_count: 0,
    alumnos: [],
  };
  estado.grupos.unshift(nuevo);
  guardarAulaLocal(estado);
  return {
    ok: true,
    status: 201,
    datos: {
      ...nuevo,
      alumnos: 0,
      practicas: 0,
      por_evaluar: 0,
    },
  };
}

export function verGrupoLocal(grupoId) {
  const estado = leerAulaLocal();
  const grupo = estado.grupos.find((g) => g.id === grupoId);
  if (!grupo) return { ok: false, status: 404, error: 'Grupo no encontrado' };

  const asignacionesDelGrupo = estado.asignaciones
    .filter((a) => a.grupo_id === grupo.id)
    .map((a) => {
      const entregas = estado.entregas.filter((e) => e.asignacion_id === a.id);
      const conteos = {
        entregada: entregas.filter((e) => e.estado === 'entregada').length,
        evaluada: entregas.filter((e) => e.estado === 'evaluada').length,
        rehacer: entregas.filter((e) => e.estado === 'rehacer').length,
      };
      const practica = PRACTICAS_CATALOGO.find((p) => p.id === a.practica_id);
      return {
        ...a,
        practica: a.practica || practica?.titulo || a.titulo,
        nivel: a.nivel ?? practica?.nivel ?? 1,
        indicaciones: a.indicaciones || a.descripcion || '',
        alumnos_total: grupo.alumnos?.length || 0,
        entregas_total: entregas.length,
        evaluadas_total: conteos.evaluada,
        por_evaluar: conteos.entregada,
        entregas: conteos,
      };
    });

  return {
    ok: true,
    status: 200,
    datos: {
      ...grupo,
      alumnos: grupo.alumnos || [],
      asignaciones: asignacionesDelGrupo,
    },
  };
}

export function practicasParaAsignarLocal() {
  return { ok: true, status: 200, datos: PRACTICAS_CATALOGO };
}

export function asignarPracticaLocal(datos) {
  const estado = leerAulaLocal();
  const grupo = estado.grupos.find((g) => g.id === datos.grupo_id);
  const practica = PRACTICAS_CATALOGO.find((p) => p.id === datos.practica_id);
  const titulo = datos.titulo?.trim() || practica?.titulo || 'Práctica 3D';
  const indicaciones = datos.indicaciones?.trim() || practica?.descripcion || '';

  const nueva = {
    id: `asg-${Date.now()}`,
    grupo_id: datos.grupo_id,
    grupo_nombre: grupo?.nombre || 'Clase',
    practica_id: datos.practica_id,
    practica: practica?.titulo || titulo,
    nivel: practica?.nivel || 1,
    titulo,
    descripcion: indicaciones,
    indicaciones,
    fecha_limite: datos.fecha_limite || null,
    estado: 'abierta',
    creada_en: new Date().toISOString(),
    entregas: { entregada: 0, evaluada: 0, rehacer: 0 },
    alumnos_total: grupo?.alumnos?.length || 0,
    entregas_total: 0,
    evaluadas_total: 0,
    por_evaluar: 0,
  };

  estado.asignaciones.unshift(nueva);
  guardarAulaLocal(estado);
  return { ok: true, status: 201, datos: nueva };
}

export function verAsignacionLocal(asignacionId) {
  const estado = leerAulaLocal();
  const asignacion = estado.asignaciones.find((a) => a.id === asignacionId);
  if (!asignacion) return { ok: false, status: 404, error: 'Asignación no encontrada' };

  const grupo = estado.grupos.find((g) => g.id === asignacion.grupo_id) || { id: 'grp-demo', nombre: 'Clase', alumnos: [] };
  const alumnosGrupo = [...(grupo.alumnos || [])];

  // Añadir también cualquier alumno que haya entregado aunque no esté explícito en la lista
  const entregasAsg = estado.entregas.filter((e) => e.asignacion_id === asignacion.id);
  for (const ent of entregasAsg) {
    if (ent.alumno && !alumnosGrupo.some((a) => a.id === ent.alumno.id)) {
      alumnosGrupo.push(ent.alumno);
    }
  }

  const filas = alumnosGrupo.map((alumno) => {
    const entrega = entregasAsg.find((e) => e.alumno_id === alumno.id) || null;
    return {
      alumno,
      entrega,
      avance: {
        progreso: entrega ? entrega.progreso || 100 : 0,
        intentos: entrega?.intentos || 0,
      },
    };
  });

  const practica = PRACTICAS_CATALOGO.find((p) => p.id === asignacion.practica_id);
  const asignacionFormateada = {
    ...asignacion,
    practica: asignacion.practica || practica?.titulo || asignacion.titulo,
    nivel: asignacion.nivel ?? practica?.nivel ?? 1,
    indicaciones: asignacion.indicaciones || asignacion.descripcion || '',
    descripcion: asignacion.descripcion || asignacion.indicaciones || '',
  };

  return {
    ok: true,
    status: 200,
    datos: {
      asignacion: asignacionFormateada,
      alumnos: filas,
      grupo,
    },
  };
}

export function recogerModeloLocal(asignacionId, alumnoId) {
  const estado = leerAulaLocal();
  const entrega = estado.entregas.find((e) => e.asignacion_id === asignacionId && e.alumno_id === alumnoId);
  if (!entrega) return { ok: false, status: 404, error: 'No se encontró entrega para este alumno' };

  return {
    ok: true,
    status: 200,
    datos: {
      modelo: entrega.modelo,
      bytes: entrega.modelo_bytes || entrega.bytes || 0,
      entregada_en: entrega.entregada_en,
      ...entrega,
    },
  };
}

export function evaluarEntregaLocal(asignacionId, alumnoId, evaluacion) {
  const estado = leerAulaLocal();
  const entrega = estado.entregas.find((e) => e.asignacion_id === asignacionId && e.alumno_id === alumnoId);
  if (!entrega) return { ok: false, status: 404, error: 'Entrega no encontrada' };

  if (evaluacion.estado) entrega.estado = evaluacion.estado;
  if (evaluacion.calificacion !== undefined) entrega.calificacion = evaluacion.calificacion;
  if (evaluacion.comentario !== undefined) entrega.comentario = evaluacion.comentario;
  entrega.evaluada_en = new Date().toISOString();

  guardarAulaLocal(estado);
  return { ok: true, status: 200, datos: entrega };
}

export function unirseAGrupoLocal(codigo, usuario = null) {
  const estado = leerAulaLocal();
  const limpio = String(codigo || '').trim().toUpperCase();
  const grupo = estado.grupos.find((g) => g.codigo.toUpperCase() === limpio);
  if (!grupo) {
    return { ok: false, status: 404, error: `No existe ninguna clase con el código «${limpio}». Revisa mayúsculas y guiones.` };
  }

  const alu = usuario
    ? { id: usuario.id || `alu-${Date.now()}`, nombre: usuario.nombre || usuario.email || 'Alumno', email: usuario.email || 'alumno@aula.edu' }
    : { id: 'alu-anonimo', nombre: 'Alumno Evaluador', email: 'evaluador@hack4edu.org' };

  grupo.alumnos ??= [];
  if (!grupo.alumnos.some((a) => a.id === alu.id)) {
    grupo.alumnos.push({ ...alu, unio_en: new Date().toISOString() });
    grupo.alumnos_count = grupo.alumnos.length;
  }

  guardarAulaLocal(estado);
  return {
    ok: true,
    status: 200,
    datos: {
      id: grupo.id,
      nombre: grupo.nombre,
      codigo: grupo.codigo,
    },
  };
}

export function misAsignacionesLocal(usuario = null) {
  const estado = leerAulaLocal();
  const alumnoId = usuario?.id || 'alu-ana';

  // Si el usuario pertenece a algún grupo, listamos esos; si no, listamos la clase demo
  const gruposUsuario = estado.grupos.filter((g) => !g.archivado && (g.alumnos?.some((a) => a.id === alumnoId) || !usuario));
  const gruposFinales = gruposUsuario.length ? gruposUsuario : [estado.grupos[0]];

  const todasAsignaciones = [];
  const gruposRespuesta = gruposFinales.map((g) => {
    const asgs = estado.asignaciones
      .filter((a) => a.grupo_id === g.id && a.estado !== 'cerrada')
      .map((a) => {
        const practica = PRACTICAS_CATALOGO.find((p) => p.id === a.practica_id);
        const ent = estado.entregas.find((e) => e.asignacion_id === a.id && e.alumno_id === alumnoId) || null;
        const entrega = ent
          ? {
              id: ent.id,
              estado: ent.estado,
              progreso: ent.progreso ?? 100,
              completada: Boolean(ent.completada),
              intentos: ent.intentos || 1,
              entregada_en: ent.entregada_en,
              calificacion: ent.calificacion,
              comentario: ent.comentario,
              evaluada_en: ent.evaluada_en,
              nueva: !ent.visto_en,
              codigo_fuente: ent.codigo_fuente,
              resumen: ent.resumen,
              bytes: ent.bytes || ent.modelo_bytes,
              modelo_bytes: ent.modelo_bytes || ent.bytes,
            }
          : null;

        return {
          id: a.id,
          grupo_id: a.grupo_id,
          grupo_nombre: g.nombre,
          practica_id: a.practica_id,
          practica: a.practica || practica?.titulo || a.titulo,
          curso_id: a.curso_id || practica?.curso_id || null,
          leccion_id: a.leccion_id || practica?.id || null,
          nivel: a.nivel ?? practica?.nivel ?? 1,
          titulo: a.titulo,
          indicaciones: a.indicaciones || a.descripcion || '',
          descripcion: a.descripcion || a.indicaciones || '',
          fecha_limite: a.fecha_limite,
          estado: a.estado,
          creada_en: a.creada_en,
          entrega,
        };
      });

    todasAsignaciones.push(...asgs);

    return {
      id: g.id,
      nombre: g.nombre,
      codigo: g.codigo,
      profesor: 'Profesor de Modelado 3D',
      asignaciones: asgs,
    };
  });

  return {
    ok: true,
    status: 200,
    datos: {
      grupos: gruposRespuesta,
      asignaciones: todasAsignaciones,
    },
  };
}

export function subirCodigoModeloLocal({ asignacionId, codigo, usuario = null }) {
  const estado = leerAulaLocal();
  const alumnoId = usuario?.id || 'alu-test';
  const alumno = usuario || { id: alumnoId, nombre: 'Alumno Evaluador', email: 'evaluador@hack4edu.org' };

  let modeloCompilado;
  try {
    modeloCompilado = compilarCodigoModelo(codigo);
  } catch (error) {
    return { ok: false, status: 400, error: error.message || 'Error al compilar el código del modelo 3D.' };
  }

  const mallas = modeloCompilado.objetos.filter((o) => o.tipo === 'MESH').length;
  const vertices = modeloCompilado.objetos.reduce((acc, o) => acc + (o.v ? o.v.length / 3 : 0), 0);
  const triangulos = modeloCompilado.objetos.reduce((acc, o) => acc + (o.t ? o.t.length / 3 : 0), 0);
  const resumen = {
    objetos: modeloCompilado.objetos.length,
    mallas,
    vertices,
    triangulos,
    materiales: modeloCompilado.materiales?.length || 1,
  };

  const bytes = new TextEncoder().encode(codigo).length;
  const entregaExistente = estado.entregas.find((e) => e.asignacion_id === asignacionId && e.alumno_id === alumnoId);
  const intentos = (entregaExistente?.intentos || 0) + 1;

  const entrega = {
    id: entregaExistente?.id || `ent-${Date.now()}`,
    asignacion_id: asignacionId,
    alumno_id: alumnoId,
    alumno,
    codigo_fuente: codigo,
    lenguaje: modeloCompilado.lenguaje,
    modelo: modeloCompilado,
    bytes,
    modelo_bytes: bytes,
    resumen,
    estado: 'entregada',
    progreso: 100,
    completada: true,
    intentos,
    entregada_en: new Date().toISOString(),
    visto_en: null,
    calificacion: null,
    comentario: null,
    tarde: false,
  };

  if (entregaExistente) {
    const idx = estado.entregas.indexOf(entregaExistente);
    estado.entregas[idx] = entrega;
  } else {
    estado.entregas.push(entrega);
  }

  // Asegura que el alumno esté registrado en el grupo de la asignación
  const asignacion = estado.asignaciones.find((a) => a.id === asignacionId);
  if (asignacion) {
    const grupo = estado.grupos.find((g) => g.id === asignacion.grupo_id);
    if (grupo) {
      grupo.alumnos ??= [];
      if (!grupo.alumnos.some((a) => a.id === alumnoId)) {
        grupo.alumnos.push(alumno);
        grupo.alumnos_count = grupo.alumnos.length;
      }
    }
  }

  guardarAulaLocal(estado);
  return { ok: true, status: 200, datos: { resumen, entrega } };
}

export function marcarVistaLocal(asignacionId, usuario = null) {
  const estado = leerAulaLocal();
  const alumnoId = usuario?.id || 'alu-test';
  const entrega = estado.entregas.find((e) => e.asignacion_id === asignacionId && e.alumno_id === alumnoId);
  if (entrega) {
    entrega.visto_en = new Date().toISOString();
    guardarAulaLocal(estado);
  }
  return { ok: true, status: 200, datos: { ok: true } };
}

export function salirDeGrupoLocal(grupoId) {
  const estado = leerAulaLocal();
  const grupo = estado.grupos.find((g) => g.id === grupoId);
  if (grupo) {
    // Si es demo no lo borramos del todo, pero simulamos éxito
    guardarAulaLocal(estado);
  }
  return { ok: true, status: 200, datos: { ok: true } };
}
