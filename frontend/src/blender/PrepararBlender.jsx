// «Prepara tu Blender» dentro de la práctica del módulo (v3.1): el alumno ya
// no tiene que ir a otra pestaña. Tres pasos en la misma tarjeta: descargar
// el instalador de su sistema, conectar la cuenta y abrir la práctica. Si ya
// tiene un Blender conectado, todo se reduce a una línea.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { rutas } from '../rutas';
import { sincronizacionDisponible } from '../services/api';
import { descargarPaquete, listarDispositivos } from '../services/blender';
import FormularioCodigo from './FormularioCodigo';
import { BLENDER_MINIMO, detectarSistema, SISTEMAS } from './logica';

function Paso({ numero, titulo, hecho, children }) {
  return (
    <li className={`corte-poly-sm border p-3 ${hecho ? 'border-emerald-400/30 bg-emerald-400/5' : 'border-white/10 bg-base/50'}`}>
      <p className="flex items-center gap-2 font-bold text-white">
        <span
          className={`hexagono grid h-6 w-7 shrink-0 place-items-center font-mono text-xs font-extrabold ${
            hecho ? 'bg-emerald-400 text-base' : 'bg-amatista text-white'
          }`}
        >
          {hecho ? '✓' : numero}
        </span>
        {titulo}
      </p>
      <div className="mt-2 text-sm leading-relaxed text-texto/75">{children}</div>
    </li>
  );
}

function PrepararBlender({ token }) {
  const sistema = useMemo(
    () => detectarSistema({ userAgent: navigator.userAgent, plataforma: navigator.userAgentData?.platform ?? navigator.platform }),
    [],
  );
  const [conectados, setConectados] = useState(null);
  const [descarga, setDescarga] = useState({ estado: 'lista', texto: '' });
  const [abierto, setAbierto] = useState(false);

  const cargar = useCallback(async () => {
    const r = await listarDispositivos(token);
    setConectados(r.ok ? r.datos.dispositivos.length : null);
  }, [token]);

  useEffect(() => {
    let vigente = true;
    listarDispositivos(token).then((r) => vigente && setConectados(r.ok ? r.datos.dispositivos.length : null));
    return () => {
      vigente = false;
    };
  }, [token]);

  const descargar = async () => {
    setDescarga({ estado: 'descargando', texto: '' });
    const r = await descargarPaquete(token, sistema ?? 'windows');
    setDescarga(r.ok ? { estado: 'hecha', texto: `Descargado ${r.nombre}.` } : { estado: 'error', texto: r.error });
  };

  if (conectados > 0 && !abierto) {
    return (
      <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-emerald-200/90">
        <span className="hexagono grid h-5 w-6 place-items-center bg-emerald-400 text-[10px] font-extrabold text-base">✓</span>
        Tu Blender está conectado con Amatista.
        <button type="button" onClick={() => setAbierto(true)} className="font-mono text-xs uppercase tracking-widest text-white/50 hover:text-neon">
          ¿Otro computador?
        </button>
      </p>
    );
  }

  const nombre = sistema ? SISTEMAS[sistema].nombre : null;
  return (
    <section className="mt-5" aria-labelledby="preparar-blender">
      <h4 id="preparar-blender" className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-blender">
        Prepara tu Blender (una sola vez)
      </h4>
      <ol className="mt-3 grid gap-2 md:grid-cols-3">
        <Paso numero="1" titulo="Instala Amatista" hecho={descarga.estado === 'hecha'}>
          {sistema ? (
            <>
              <button
                type="button"
                onClick={descargar}
                disabled={descarga.estado === 'descargando' || !sincronizacionDisponible()}
                className="corte-poly-sm destello bg-blender px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-base hover:brightness-110 disabled:opacity-50"
              >
                {descarga.estado === 'descargando' ? 'Preparando…' : `Descargar para ${nombre}`}
              </button>
              <span className="mt-1.5 block text-xs text-white/50">
                {descarga.texto || `Descomprime y abre «Instalar Amatista». Necesitas Blender ${BLENDER_MINIMO} o más nuevo.`}
              </span>
            </>
          ) : (
            <>Abre esta lección en tu computador: Blender no corre en celulares.</>
          )}
        </Paso>
        <Paso numero="2" titulo="Abre Blender" hecho={conectados > 0}>
          Pulsa <kbd className="rounded bg-white/10 px-1 font-mono">N</kbd> en la vista 3D y elige la pestaña Amatista. Si
          descargaste con tu sesión iniciada, ya queda conectado.
        </Paso>
        <Paso numero="3" titulo="¿Te muestra un código?" hecho={conectados > 0}>
          <FormularioCodigo alConectar={cargar} />
        </Paso>
      </ol>
      <a href={rutas.blender} className="mt-2 inline-block font-mono text-[11px] uppercase tracking-widest text-white/45 hover:text-neon">
        Más opciones y ayuda en Mi Blender ▸
      </a>
    </section>
  );
}

export default PrepararBlender;
