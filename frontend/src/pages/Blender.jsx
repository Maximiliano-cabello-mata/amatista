// #/blender («Mi Blender»): descargar e instalar Amatista para Blender,
// conectar la cuenta y ver los Blender conectados y las prácticas. Desde
// v3.1 ya no es una pestaña: las prácticas viven al cierre de cada módulo y
// se preparan desde la misma práctica; aquí quedan las opciones y la ayuda.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/contexto';
import FormularioCodigo from '../blender/FormularioCodigo';
import {
  AJUSTES_POR_DEFECTO,
  BLENDER_MINIMO,
  detectarSistema,
  estadoBlender,
  NOMBRE_MOTOR,
  OPCIONES_ACOMPANAMIENTO,
  OPCIONES_ENFOQUE,
  resumenPractica,
  SISTEMAS,
  versionDelServidor,
} from '../blender/logica';
import { CristalLogo } from '../components/Iconos';
import { useConexion } from '../hooks/useConexion';
import { Alerta } from './cuenta/Formulario';
import { rutaEntrar, rutas } from '../rutas';
import { sincronizacionDisponible } from '../services/api';
import {
  descargarPaquete,
  desconectarDispositivo,
  estadoAddon,
  estadoEnlace,
  guardarAjustesBlender,
  listarDispositivos,
  listarPracticas,
} from '../services/blender';

const fecha = (iso) => (iso ? new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

function Tarjeta({ antetitulo, titulo, children, acento = 'border-white/10', className = '' }) {
  return (
    <section className={`corte-poly border ${acento} bg-superficie/95 p-6 sm:p-7 ${className}`}>
      {antetitulo && <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon">{antetitulo}</p>}
      {titulo && <h2 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">{titulo}</h2>}
      <div className={titulo || antetitulo ? 'mt-4' : ''}>{children}</div>
    </section>
  );
}

function Paso({ numero, titulo, children }) {
  return (
    <li className="corte-poly-sm flex gap-4 border border-white/10 bg-black/20 p-4">
      <span className="hexagono grid h-10 w-10 shrink-0 place-items-center bg-amatista font-mono text-lg font-extrabold text-white">
        {numero}
      </span>
      <div>
        <p className="font-bold text-white">{titulo}</p>
        <p className="mt-1 text-sm leading-relaxed text-texto/75">{children}</p>
      </div>
    </li>
  );
}

function Descarga({ token, usuario }) {
  const detectado = useMemo(
    () => detectarSistema({ userAgent: navigator.userAgent, plataforma: navigator.userAgentData?.platform ?? navigator.platform }),
    [],
  );
  const [elegido, setElegido] = useState(detectado ?? 'windows');
  const [estado, setEstado] = useState({ descargando: false, error: null, nombre: null });
  const sistema = SISTEMAS[elegido];
  const disponible = sincronizacionDisponible();

  // Qué versión entrega el servidor: así se nota si todavía no se actualizó.
  const [servidor, setServidor] = useState({ conocida: false });
  useEffect(() => {
    let vigente = true;
    estadoAddon().then((r) => vigente && r.ok && setServidor(versionDelServidor(r.datos)));
    return () => {
      vigente = false;
    };
  }, []);

  const descargar = async () => {
    setEstado({ descargando: true, error: null, nombre: null });
    const resultado = await descargarPaquete(token, elegido);
    setEstado({ descargando: false, error: resultado.ok ? null : resultado.error, nombre: resultado.nombre ?? null });
  };

  return (
    <Tarjeta antetitulo="Paso 1" titulo={`Descarga ${NOMBRE_MOTOR}`} acento="border-amatista/50">
      {!detectado && (
        <Alerta tipo="info">Blender funciona en computadores: abre esta página desde Windows, macOS o Linux.</Alerta>
      )}
      <div role="radiogroup" aria-label="Sistema operativo" className="mt-2 flex flex-wrap gap-2">
        {Object.values(SISTEMAS).map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={s.id === elegido}
            onClick={() => setElegido(s.id)}
            className={`corte-poly-sm px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest transition ${
              s.id === elegido ? 'bg-neon/15 text-neon ring-1 ring-neon/60' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {s.nombre}
            {s.id === detectado && <span className="ml-2 text-white/40">· tu equipo</span>}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={descargar}
        disabled={estado.descargando || !disponible}
        className="corte-poly mt-5 flex w-full items-center justify-center gap-3 bg-gradient-to-r from-amatista to-amatista-oscuro px-6 py-4 text-lg font-extrabold uppercase tracking-widest text-white shadow-lg shadow-amatista/20 transition-[filter] hover:brightness-110 disabled:cursor-wait disabled:opacity-50"
      >
        <span aria-hidden="true">⬇</span>
        {estado.descargando ? 'Preparando tu paquete…' : `Descargar para ${sistema.nombre}`}
      </button>
      {servidor.conocida && (
        <p className={`mt-3 font-mono text-xs uppercase tracking-wider ${servidor.alDia ? 'text-emerald-300' : 'text-blender'}`}>
          {servidor.alDia
            ? `✓ El servidor entrega ${NOMBRE_MOTOR} (versión ${servidor.version})`
            : `El servidor todavía entrega la versión ${servidor.version}: falta actualizarlo a ${NOMBRE_MOTOR}`}
        </p>
      )}
      <p className="mt-3 text-sm text-texto/70">
        {usuario
          ? 'Tu paquete trae un acceso de un solo uso: al abrir Blender, Amatista ya estará conectado con tu cuenta.'
          : 'Sin cuenta también funciona. Entra antes de descargar y Blender quedará conectado solo.'}
      </p>
      {!usuario && (
        <a href={rutaEntrar(rutas.blender)} className="mt-2 inline-block text-sm font-bold text-neon hover:underline">
          Entrar antes de descargar ▸
        </a>
      )}
      {estado.nombre && (
        <div className="mt-4">
          <Alerta tipo="exito">
            Descargado <strong>{estado.nombre}</strong>. Ahora descomprímelo y sigue el paso 2.
          </Alerta>
        </div>
      )}
      <div className="mt-4">
        <Alerta>{estado.error}</Alerta>
      </div>
      {!disponible && (
        <Alerta tipo="info">La descarga necesita el servidor de Amatista, que todavía no está disponible desde este sitio.</Alerta>
      )}
    </Tarjeta>
  );
}

function Dispositivos({ token }) {
  const [respuesta, setRespuesta] = useState(null);
  const cargar = useCallback(async () => setRespuesta(await listarDispositivos(token)), [token]);

  useEffect(() => {
    let vigente = true;
    listarDispositivos(token).then((r) => vigente && setRespuesta(r));
    return () => {
      vigente = false;
    };
  }, [token]);

  const desconectar = async (id) => {
    await desconectarDispositivo(token, id);
    cargar();
  };

  const lista = respuesta?.datos?.dispositivos ?? [];
  return (
    <Tarjeta antetitulo="Tu cuenta" titulo="Blender conectados">
      {respuesta && !respuesta.ok && <Alerta>{respuesta.error}</Alerta>}
      {respuesta?.ok && !lista.length && <p className="text-sm text-texto/70">Todavía no conectas ningún Blender.</p>}
      <ul className="grid gap-2">
        {lista.map((d) => (
          <li key={d.id} className="corte-poly-sm flex flex-wrap items-center justify-between gap-3 bg-black/25 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate font-bold text-white">{d.nombre}</p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/45">
                Conectado {fecha(d.conectado_en)} · último uso {fecha(d.ultimo_uso)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => desconectar(d.id)}
              className="corte-poly-sm bg-white/5 px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-white/70 hover:bg-red-400/15 hover:text-red-200"
            >
              Desconectar
            </button>
          </li>
        ))}
      </ul>
      <details className="mt-5 text-sm">
        <summary className="cursor-pointer font-bold text-neon">Blender me muestra un código</summary>
        <div className="mt-3">
          <FormularioCodigo alConectar={cargar} />
        </div>
      </details>
    </Tarjeta>
  );
}

function Opciones({ nombre, opciones, valor, alElegir, desactivado }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3" role="radiogroup">
      {opciones.map((o) => {
        const elegida = valor === o.id;
        return (
          <label
            key={o.id}
            className={`corte-poly-sm cursor-pointer border p-3 text-sm transition ${
              elegida ? 'border-neon/60 bg-neon/10' : 'border-white/10 bg-black/25 hover:border-white/30'
            } ${desactivado ? 'pointer-events-none opacity-50' : ''}`}
          >
            <input
              type="radio"
              name={nombre}
              value={o.id}
              checked={elegida}
              disabled={desactivado}
              onChange={() => alElegir(o.id)}
              className="sr-only"
            />
            <span className="block font-bold text-white">{o.titulo}</span>
            <span className="mt-1 block text-xs leading-relaxed text-texto/70">{o.texto}</span>
          </label>
        );
      })}
    </div>
  );
}

// Motor 3.4: la plataforma decide cómo se ve Blender y ve el Blender abierto en vivo.
function AjustesBlender({ token }) {
  const [enlace, setEnlace] = useState(null);
  const [ajustes, setAjustes] = useState(AJUSTES_POR_DEFECTO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vigente = true;
    const consultar = async () => {
      if (document.visibilityState !== 'visible') return;
      const r = await estadoEnlace(token);
      if (!vigente || !r.ok) return;
      setEnlace(r.datos);
      setAjustes((actuales) => (guardando ? actuales : { ...AJUSTES_POR_DEFECTO, ...r.datos.ajustes }));
    };
    consultar();
    const temporizador = setInterval(consultar, 8000);
    return () => {
      vigente = false;
      clearInterval(temporizador);
    };
  }, [token, guardando]);

  const sinEnlace = enlace?.enlace === false;
  const cambiar = async (cambios) => {
    const anteriores = ajustes;
    setAjustes({ ...ajustes, ...cambios });
    setGuardando(true);
    setError(null);
    const r = await guardarAjustesBlender(token, cambios);
    setGuardando(false);
    if (r.ok) {
      setAjustes({ ...AJUSTES_POR_DEFECTO, ...r.datos.ajustes });
    } else {
      setAjustes(anteriores);
      setError(r.error);
    }
  };

  const vivo = estadoBlender(enlace);
  return (
    <Tarjeta antetitulo="Cómo se ve Blender" titulo="Tu Blender, desde aquí" className="lg:col-span-2">
      {enlace && !sinEnlace && (
        <p className="mb-4 flex items-center gap-2 text-sm text-texto/80">
          <span
            className={`h-2.5 w-2.5 rounded-full ${vivo.estado === 'cerrado' ? 'bg-white/30' : 'bg-emerald-400 animar-pulso'}`}
            aria-hidden="true"
          />
          {vivo.estado === 'cerrado' ? 'Tu Blender está cerrado. Los cambios le llegan al abrirlo.' : `${vivo.texto} Los cambios le llegan en segundos.`}
        </p>
      )}
      {sinEnlace && (
        <Alerta tipo="info">El servidor todavía no tiene el enlace en vivo: estas opciones se eligen por ahora en Blender (Preferencias › Add-ons › Amatista).</Alerta>
      )}
      {error && <Alerta>{error}</Alerta>}
      <h3 className="mt-2 font-mono text-[11px] uppercase tracking-widest text-white/50">Modo enfocado</h3>
      <p className="mb-2 mt-1 text-sm text-texto/75">
        Blender completo abruma al empezar: enfocado, solo ves las herramientas de la práctica y cada una explica cómo se usa.
      </p>
      <Opciones nombre="enfoque" opciones={OPCIONES_ENFOQUE} valor={ajustes.enfoque} alElegir={(enfoque) => cambiar({ enfoque })} desactivado={sinEnlace} />
      <h3 className="mt-5 font-mono text-[11px] uppercase tracking-widest text-white/50">Acompañamiento</h3>
      <div className="mt-2">
        <Opciones
          nombre="acompanamiento"
          opciones={OPCIONES_ACOMPANAMIENTO}
          valor={ajustes.acompanamiento}
          alElegir={(acompanamiento) => cambiar({ acompanamiento })}
          desactivado={sinEnlace}
        />
      </div>
      <div className="mt-4 grid gap-2 text-sm text-texto/85 sm:grid-cols-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ajustes.tarjeta_3d}
            disabled={sinEnlace}
            onChange={(e) => cambiar({ tarjeta_3d: e.target.checked })}
          />
          Tarjeta con el paso actual en la vista 3D
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ajustes.avisos_herramientas}
            disabled={sinEnlace}
            onChange={(e) => cambiar({ avisos_herramientas: e.target.checked })}
          />
          Avisarme si uso una herramienta de otro nivel
        </label>
      </div>
    </Tarjeta>
  );
}

function Practicas({ token }) {
  const [respuesta, setRespuesta] = useState(null);
  useEffect(() => {
    let vigente = true;
    listarPracticas(token).then((r) => vigente && setRespuesta(r));
    return () => {
      vigente = false;
    };
  }, [token]);
  const lista = respuesta?.datos?.practicas ?? [];
  if (!respuesta?.ok || !lista.length) return null;
  return (
    <Tarjeta antetitulo="Cierre de cada módulo" titulo="Tus prácticas en Blender">
      <ul className="grid gap-2 sm:grid-cols-2">
        {lista.map((p) => {
          const avance = p.mi_progreso?.completada ? 100 : (p.mi_progreso?.progreso ?? 0);
          const enlace = p.curso_id && p.leccion_id ? rutas.leccion(p.curso_id, p.leccion_id) : null;
          const Contenedor = enlace ? 'a' : 'div';
          return (
            <li key={p.id}>
              <Contenedor
                href={enlace ?? undefined}
                className="corte-poly-sm block border border-white/10 bg-black/25 p-4 transition hover:border-neon/50"
              >
                <p className="font-mono text-[11px] uppercase tracking-widest text-blender">Nivel {p.nivel}</p>
                <p className="mt-1 font-bold text-white">{p.titulo}</p>
                <div className="mt-3 h-1.5 overflow-hidden bg-white/10" aria-hidden="true">
                  <div className={`h-full ${avance === 100 ? 'bg-emerald-400' : 'bg-neon'}`} style={{ width: `${avance}%` }} />
                </div>
                <p className="mt-2 text-xs text-texto/70">{resumenPractica(p.mi_progreso)}</p>
              </Contenedor>
            </li>
          );
        })}
      </ul>
    </Tarjeta>
  );
}

function Blender() {
  const { token, usuario } = useAuth();
  const enLinea = useConexion();

  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10">
      <header className="corte-poly animar-entrar bg-gradient-to-br from-amatista via-amatista-oscuro to-blender/50 p-[2px]">
        <div className="corte-poly flex flex-col gap-5 bg-superficie/95 p-6 sm:flex-row sm:items-center sm:p-8">
          <CristalLogo className="animar-flotar h-16 w-16 shrink-0" />
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-blender">{NOMBRE_MOTOR} para Blender</p>
            <h1 className="mt-1 text-3xl font-extrabold leading-tight text-white sm:text-4xl">Mi Blender</h1>
            <p className="mt-2 max-w-2xl leading-relaxed text-texto/80">
              Cada módulo termina con una práctica dentro de Blender. Instala el add-on una vez: Amatista te guía paso a paso,
              resalta lo que tienes que cambiar y tu avance aparece en tu panel.
            </p>
            <a href={rutas.inicio} className="mt-3 inline-block font-mono text-xs uppercase tracking-widest text-neon hover:underline">
              Ir a mis módulos ▸
            </a>
          </div>
        </div>
      </header>

      {!enLinea && (
        <div className="mt-6">
          <Alerta tipo="info">Sin conexión: la descarga y la lista de Blender conectados necesitan internet.</Alerta>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Descarga token={token} usuario={usuario} />
        <Tarjeta antetitulo="Compatibilidad" titulo={`Blender ${BLENDER_MINIMO} o más nuevo`}>
          <p className="text-sm leading-relaxed text-texto/80">
            El instalador busca tu Blender y comprueba la versión antes de instalar. Si es anterior a {BLENDER_MINIMO}, te
            avisa y no cambia nada.
          </p>
          <a
            href="https://www.blender.org/download/"
            target="_blank"
            rel="noreferrer"
            className="corte-poly-sm mt-4 inline-block bg-blender/15 px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-blender hover:bg-blender/25"
          >
            Descargar Blender ↗
          </a>
          <p className="mt-4 text-xs leading-relaxed text-white/50">
            El instalador también activa «Permitir acceso en línea» en Blender para guardar tu progreso. Sin internet, Amatista
            sigue funcionando y envía tu avance cuando vuelve la conexión.
          </p>
        </Tarjeta>
      </div>

      <section className="mt-6">
        <h2 className="sr-only">Cómo se instala</h2>
        <ol className="grid gap-3 md:grid-cols-3">
          <Paso numero="1" titulo="Descarga y descomprime">
            Descarga el paquete de tu sistema y extrae la carpeta «Amatista».
          </Paso>
          <Paso numero="2" titulo="Ejecuta el instalador">
            {SISTEMAS.windows.pista} En Mac: {SISTEMAS.macos.pista.toLowerCase()}
          </Paso>
          <Paso numero="3" titulo="Abre Blender">
            Pulsa N en la vista 3D y elige la pestaña Amatista. La práctica de tu lección se abre sola.
          </Paso>
        </ol>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {usuario && <AjustesBlender token={token} />}
        {usuario ? (
          <Dispositivos token={token} />
        ) : (
          <Tarjeta antetitulo="Tu cuenta" titulo="Conecta Blender con tu cuenta">
            <p className="text-sm text-texto/75">Entra para que tus prácticas cuenten en tu panel y en tus insignias.</p>
            <a
              href={rutaEntrar(rutas.blender)}
              className="corte-poly-sm destello mt-4 inline-block bg-amatista px-5 py-2.5 font-extrabold uppercase tracking-widest text-white hover:brightness-110"
            >
              Entrar ▶
            </a>
          </Tarjeta>
        )}
        <Practicas token={token} />
      </div>
    </main>
  );
}

export default Blender;
