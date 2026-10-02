import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../auth/contexto';
import { useCatalogo } from '../catalogo/contexto';
import { useConexion } from '../hooks/useConexion';
import { guardar, leer, pedirAlmacenamientoPersistente } from '../lib/almacen';
import { descargarProgreso, enviarEventos, enviarProgreso, sincronizacionDisponible } from '../services/api';
import { ContextoProgreso } from './contexto';
import {
  agregarEvento,
  aplicarActividad,
  aplicarExamen,
  aplicarInsignia,
  aplicarLeccion,
  aplicarSesion,
  cantidadPendientes,
  CLAVE_ANONIMO,
  claveAlmacen,
  combinarConServidor,
  combinarEstados,
  confirmarEventos,
  confirmarProgreso,
  crearEvento,
  estadoVacio,
  idEvento,
  LOTE_EVENTOS,
  normalizarEstado,
  prepararEnvio,
  tieneContenido,
} from './estado';
import { calcularNivel, calcularRacha, calcularXP, claveLeccion, fechaLocal, insigniasPorOtorgar } from './reglas';

const ESPERA_SINCRONIZACION = 1500;
const UNA_HORA = 60 * 60 * 1000;

const SINCRONIZACION_INICIAL = { enviando: false, error: null, ultima: null, requiereSesion: false };

// Sesión de aprendizaje: un id por lección mientras la app está abierta. Une
// learning_session_started con lo que el alumno hace después en esa lección.
const sesionesAprendizaje = new Map();
function sesionDe(cursoId, leccionId) {
  const clave = claveLeccion(cursoId, leccionId);
  if (!sesionesAprendizaje.has(clave)) sesionesAprendizaje.set(clave, idEvento());
  return sesionesAprendizaje.get(clave);
}

// Otorga las insignias que correspondan (exámenes finales aprobados): cubre
// el progreso migrado de v1 y lo que llega de otros dispositivos.
const conInsignias = (estado, cursos) =>
  insigniasPorOtorgar(estado, cursos).reduce((actual, id) => aplicarInsignia(actual, id), estado);

// Carga el progreso de una identidad. Al entrar a una cuenta, el progreso
// anónimo del dispositivo se une a ella (el servidor ya fusionó lo que se
// había sincronizado) y el anónimo vuelve a empezar con un id nuevo: el
// anterior quedó ligado a la cuenta en el servidor.
async function cargarEstado(cuentaId, idLocal) {
  if (!cuentaId) return normalizarEstado(await leer(CLAVE_ANONIMO), { cuentaId: null });

  const [propio, anonimoGuardado] = await Promise.all([leer(claveAlmacen(cuentaId)), leer(CLAVE_ANONIMO)]);
  let estado = normalizarEstado(propio, { cuentaId });
  const anonimo = anonimoGuardado ? normalizarEstado(anonimoGuardado, { cuentaId: null }) : null;
  if (anonimo && (tieneContenido(anonimo) || anonimo.alumnoId === idLocal || anonimo.alumnoId === cuentaId)) {
    estado = combinarEstados(estado, anonimo);
    // Primero se guarda la cuenta y después se reinicia el anónimo: si algo
    // se interrumpe, la fusión se repite sin duplicar (es idempotente).
    await guardar(claveAlmacen(cuentaId), estado);
    await guardar(CLAVE_ANONIMO, estadoVacio());
  }
  return estado;
}

function ProgresoProvider({ children }) {
  const { usuario, token, listo, idLocal, verificarSesion } = useAuth();
  const { cursos } = useCatalogo();
  const enLinea = useConexion();
  const [progreso, setProgreso] = useState(null);
  const [sincronizacion, setSincronizacion] = useState(SINCRONIZACION_INICIAL);
  // Identidad que respondió 401: no se reintenta sola hasta que cambie la identidad.
  const [bloqueada, setBloqueada] = useState(null);
  // Sube con sincronizarAhora(): vuelve a enviar y a descargar.
  const [intentoManual, setIntentoManual] = useState(0);

  const cuentaId = usuario?.id ?? null;
  const cuentaCargada = progreso ? progreso.cuentaId : undefined;
  // La sesión y el estado en memoria corresponden a la misma identidad.
  const identidadLista = progreso !== null && listo && cuentaCargada === cuentaId;

  const cursosActuales = useRef(cursos);
  const enviando = useRef(false);
  const descargada = useRef(null);
  const manualAtendido = useRef(0);

  useEffect(() => {
    cursosActuales.current = cursos;
  }, [cursos]);

  // 1. Cargar el progreso de la identidad actual (anónimo o cuenta).
  useEffect(() => {
    if (!listo) return;
    let activo = true;
    cargarEstado(cuentaId, idLocal).then((estado) => {
      if (!activo) return;
      descargada.current = null;
      setBloqueada(null);
      setProgreso(conInsignias(estado, cursosActuales.current));
      setSincronizacion(SINCRONIZACION_INICIAL);
    });
    return () => {
      activo = false;
    };
  }, [listo, cuentaId, idLocal]);

  // 2. Guardar cada cambio en la clave de su propia identidad. Durante el
  //    cambio de cuenta (milisegundos) no se guarda: el anónimo ya se unió a
  //    la cuenta y se reinició, y no debe volver a escribirse encima.
  useEffect(() => {
    if (identidadLista) guardar(claveAlmacen(progreso.cuentaId), progreso);
  }, [progreso, identidadLista]);

  // 3. Con cuenta: traer lo hecho en otros dispositivos (una vez por sesión).
  useEffect(() => {
    if (!identidadLista || !cuentaId || !token || !enLinea || !sincronizacionDisponible()) return;
    const marca = `${cuentaId}|${token}|${intentoManual}`;
    if (descargada.current === marca) return;
    descargada.current = marca;
    descargarProgreso(token).then((respuesta) => {
      if (respuesta.ok) {
        setProgreso((previo) =>
          previo?.cuentaId === cuentaId ? conInsignias(combinarConServidor(previo, respuesta.datos), cursos) : previo,
        );
        return;
      }
      descargada.current = null; // se reintenta al recuperar la conexión
      if (respuesta.status === 401) {
        setSincronizacion((previa) => ({ ...previa, requiereSesion: true, error: respuesta.error }));
        verificarSesion();
      }
    });
  }, [identidadLista, cuentaId, token, enLinea, cursos, intentoManual, verificarSesion]);

  // Envía progreso, insignias y eventos pendientes. Con cuenta usa el token;
  // sin cuenta, el id anónimo del dispositivo.
  const enviar = useCallback(
    async (estado) => {
      if (enviando.current) return;
      enviando.current = true;
      const identidad = estado.cuentaId ?? estado.alumnoId;
      const tokenUsado = estado.cuentaId ? token : null;
      setSincronizacion((previa) => ({ ...previa, enviando: true }));

      const lote = prepararEnvio(estado);
      let error = null;
      let requiereSesion = false;
      let progresoOk = false;
      let sinRed = false;

      if (lote.eventos.length || lote.insignias.length) {
        const respuesta = await enviarProgreso({
          token: tokenUsado,
          usuarioId: estado.alumnoId,
          eventos: lote.eventos,
          insignias: lote.insignias,
        });
        progresoOk = respuesta.ok;
        if (!respuesta.ok) {
          error = respuesta.error;
          requiereSesion = respuesta.status === 401;
          sinRed = respuesta.status === 0;
        }
      }

      // sync_succeeded: como mucho una vez por hora, solo si el servidor confirmó.
      const momento = new Date();
      const ultimoSync = Date.parse(estado.marcas.eventoSync ?? '') || 0;
      const eventoSync =
        progresoOk && momento.getTime() - ultimoSync > UNA_HORA
          ? crearEvento('sync_succeeded', { datos: { lecciones: lote.eventos.length }, momento })
          : null;
      const eventos = estado.eventos.slice(0, LOTE_EVENTOS - (eventoSync ? 1 : 0));
      if (eventoSync) eventos.push(eventoSync);

      let eventosOk = false;
      if (eventos.length && !requiereSesion && !sinRed) {
        const respuesta = await enviarEventos({ token: tokenUsado, usuarioId: estado.alumnoId, eventos });
        eventosOk = respuesta.ok;
        if (!respuesta.ok) {
          error = error ?? respuesta.error;
          requiereSesion = respuesta.status === 401;
        }
      }

      setProgreso((previo) => {
        if (!previo || (previo.cuentaId ?? previo.alumnoId) !== identidad) return previo;
        let nuevo = previo;
        if (progresoOk) nuevo = confirmarProgreso(nuevo, lote);
        if (eventosOk) nuevo = confirmarEventos(nuevo, eventos.map((evento) => evento.id));
        else if (eventoSync) nuevo = agregarEvento(nuevo, eventoSync);
        if (eventoSync) nuevo = { ...nuevo, marcas: { ...nuevo.marcas, eventoSync: eventoSync.ocurrido_en } };
        if (progresoOk || eventosOk) nuevo = { ...nuevo, marcas: { ...nuevo.marcas, sincronizado: momento.toISOString() } };
        return nuevo;
      });
      setSincronizacion((previa) => ({
        enviando: false,
        error,
        requiereSesion,
        ultima: progresoOk || eventosOk ? momento.toISOString() : previa.ultima,
      }));
      enviando.current = false;

      if (requiereSesion) {
        // Se conserva todo lo local y se pide iniciar sesión.
        setBloqueada(identidad);
        if (tokenUsado) verificarSesion();
      }
    },
    [token, verificarSesion],
  );

  // 4. Enviar lo pendiente cuando hay conexión. Si falla, se reintenta con el
  //    siguiente cambio, al recuperar la conexión, al recargar o con sincronizarAhora().
  useEffect(() => {
    if (!identidadLista || !enLinea || !sincronizacionDisponible()) return;
    if (progreso.cuentaId && !token) return;
    if (bloqueada === (progreso.cuentaId ?? progreso.alumnoId)) return;
    if (!cantidadPendientes(progreso) && !progreso.eventos.length) return;
    // El reintento manual sale de inmediato; los cambios normales esperan un poco
    // para agrupar varios en un solo envío.
    const manual = intentoManual !== manualAtendido.current;
    manualAtendido.current = intentoManual;
    const temporizador = setTimeout(() => enviar(progreso), manual ? 0 : ESPERA_SINCRONIZACION);
    return () => clearTimeout(temporizador);
  }, [progreso, identidadLista, enLinea, token, bloqueada, intentoManual, enviar]);

  // Reintento manual (botón "Reintentar"): devuelve {ok, error?} sin esperar al servidor.
  const sincronizarAhora = useCallback(() => {
    if (!sincronizacionDisponible()) return { ok: false, error: 'La sincronización no está disponible en este sitio.' };
    if (!enLinea) return { ok: false, error: 'Sin conexión: se sincronizará al volver a estar en línea.' };
    if (cuentaCargada && !token) return { ok: false, error: 'Inicia sesión para sincronizar.' };
    setBloqueada(null);
    setIntentoManual((n) => n + 1);
    return { ok: true };
  }, [enLinea, cuentaCargada, token]);

  // --- Acciones ---------------------------------------------------------------

  const actualizar = useCallback((transformar) => {
    pedirAlmacenamientoPersistente();
    setProgreso((previo) => previo && transformar(previo));
  }, []);

  // La hora y el id de sesión se calculan aquí: las funciones que recibe
  // setProgreso se ejecutan durante el render y deben ser puras.
  const completarLeccion = useCallback(
    (cursoId, leccionId, extra = {}) => {
      const contexto = { sesion: sesionDe(cursoId, leccionId), momento: new Date() };
      actualizar((estado) =>
        conInsignias(aplicarLeccion(estado, cursoId, leccionId, { ...extra, completada: true }, contexto), cursos),
      );
    },
    [actualizar, cursos],
  );

  const registrarExamen = useCallback(
    (cursoId, leccionId, puntaje, aprobado) => {
      const contexto = { sesion: sesionDe(cursoId, leccionId), momento: new Date() };
      actualizar((estado) => conInsignias(aplicarExamen(estado, cursoId, leccionId, puntaje, aprobado, contexto), cursos));
    },
    [actualizar, cursos],
  );

  const registrarActividad = useCallback(
    (cursoId, leccionId, bloqueId, resultado) => {
      const contexto = { sesion: sesionDe(cursoId, leccionId), momento: new Date() };
      actualizar((estado) => aplicarActividad(estado, cursoId, leccionId, bloqueId, resultado, contexto));
    },
    [actualizar],
  );

  const otorgarInsignia = useCallback(
    (insigniaId) => actualizar((estado) => aplicarInsignia(estado, insigniaId)),
    [actualizar],
  );

  const registrarSesionAprendizaje = useCallback(
    (cursoId, leccionId) => {
      const contexto = { sesion: sesionDe(cursoId, leccionId), momento: new Date() };
      setProgreso((previo) => previo && aplicarSesion(previo, cursoId, leccionId, contexto));
    },
    [],
  );

  const valor = useMemo(() => {
    if (!progreso) return null;
    const xp = calcularXP(progreso);
    return {
      progreso,
      xp,
      nivel: calcularNivel(xp),
      racha: calcularRacha(progreso.actividad, fechaLocal()),
      completarLeccion,
      registrarExamen,
      registrarActividad,
      otorgarInsignia,
      registrarSesionAprendizaje,
      sincronizacion: {
        ...sincronizacion,
        ultima: sincronizacion.ultima ?? progreso.marcas.sincronizado,
        pendientes: cantidadPendientes(progreso),
        eventosPendientes: progreso.eventos.length,
        disponible: sincronizacionDisponible(),
      },
      sincronizarAhora,
    };
  }, [
    progreso,
    sincronizacion,
    completarLeccion,
    registrarExamen,
    registrarActividad,
    otorgarInsignia,
    registrarSesionAprendizaje,
    sincronizarAhora,
  ]);

  // Leer IndexedDB tarda milisegundos: se espera para no mostrar lecciones
  // bloqueadas que en realidad ya están completadas.
  if (!valor) return null;

  return <ContextoProgreso.Provider value={valor}>{children}</ContextoProgreso.Provider>;
}

export default ProgresoProvider;
