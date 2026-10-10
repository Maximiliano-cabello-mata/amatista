// Hooks del taller (motor 5): el plan del servidor y el Blender del alumno en vivo.
// Nada lanza: un servidor viejo o sin conexión deja el plan en null y la lección sigue.
import { useCallback, useEffect, useRef, useState } from 'react';
import { estadoEnlace, obtenerTaller } from '../services/blender';
import { enlaceDelTaller } from './taller';

// El plan del taller (GET /talleres/{id}). Se vuelve a pedir al volver a la pestaña y con
// recargar() (después de una orden o cuando Blender avanza). Un error de red no borra el plan
// que ya se tenía; `respuesta` guarda la última respuesta (status 404: el servidor no lo tiene).
export function usePlanTaller(token, tallerId) {
  const [estado, setEstado] = useState({ plan: null, respuesta: null });
  const pedir = useRef(() => {});

  useEffect(() => {
    if (!token || !tallerId) return undefined;
    let vigente = true;
    let enCurso = false;
    const cargar = async () => {
      if (enCurso || !vigente) return;
      enCurso = true;
      const r = await obtenerTaller(token, tallerId);
      enCurso = false;
      if (!vigente) return;
      setEstado((previo) => ({ plan: r.ok && r.datos ? r.datos : r.status === 404 ? null : previo.plan, respuesta: r }));
    };
    const alCambiarVisibilidad = () => {
      if (document.visibilityState === 'visible') cargar();
    };
    pedir.current = cargar;
    cargar();
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    return () => {
      vigente = false;
      pedir.current = () => {};
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    };
  }, [token, tallerId]);

  const recargar = useCallback(() => pedir.current(), []);
  return { ...estado, recargar };
}

// Cada cuánto se pregunta por el enlace: más seguido con Blender en este taller (el add-on
// late cada 5 s), menos con Blender en otra cosa y mucho menos con Blender cerrado.
export const ESPERA_ENLACE_MS = { aqui: 3000, otra: 6000, cerrado: 30000, sin_enlace: 60000 };

// El Blender del alumno para este taller (enlaceDelTaller). De a una petición: la siguiente se
// programa al llegar la respuesta; se pausa con la pestaña oculta y se refresca al volver.
export function useEnlaceTaller(token, tallerId, activo = true) {
  const [datos, setDatos] = useState(null);
  const refrescar = useRef(() => {});

  useEffect(() => {
    if (!token || !activo) return undefined;
    let vigente = true;
    let enCurso = false;
    let temporizador = null;
    const consultar = async () => {
      clearTimeout(temporizador);
      if (!vigente || enCurso || document.visibilityState !== 'visible') return;
      enCurso = true;
      const r = await estadoEnlace(token);
      enCurso = false;
      if (!vigente) return;
      if (r.ok) setDatos(r.datos);
      const estado = r.ok ? enlaceDelTaller(r.datos, tallerId).estado : 'sin_enlace';
      temporizador = setTimeout(consultar, ESPERA_ENLACE_MS[estado] ?? ESPERA_ENLACE_MS.cerrado);
    };
    const alCambiarVisibilidad = () => {
      if (document.visibilityState === 'visible') consultar();
      else clearTimeout(temporizador);
    };
    refrescar.current = consultar;
    consultar();
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    return () => {
      vigente = false;
      clearTimeout(temporizador);
      refrescar.current = () => {};
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    };
  }, [token, tallerId, activo]);

  const refrescarAhora = useCallback(() => refrescar.current(), []);
  return { enlace: datos ? enlaceDelTaller(datos, tallerId) : null, refrescar: refrescarAhora };
}

// Mandar una orden del taller a Blender con su aviso corto («Enviado a tu Blender.»).
export function useAvisoTemporal(duracionMs = 5000) {
  const [aviso, setAviso] = useState('');
  const temporizador = useRef(null);
  useEffect(() => () => clearTimeout(temporizador.current), []);
  const mostrar = useCallback(
    (texto) => {
      setAviso(texto);
      clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => setAviso(''), duracionMs);
    },
    [duracionMs],
  );
  return [aviso, mostrar];
}
