import { useEffect, useMemo, useRef, useState } from 'react';
import { IconoCandado } from '../Iconos';
import { IconoPalomita } from '../panel/IconosPanel';
import Escenario from '../temas/Escenario';
import Jefe from '../temas/Jefe';
import Personaje from '../temas/Personaje';
import { mensajesDeMascota, temaDelModulo } from '../temas/temas';
import { ICONO_FORMULA, horas, plural } from './constantes';

const ESTADOS = {
  hecho: { texto: 'Hecho', clase: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' },
  siguiente: { texto: 'Siguiente', clase: 'border-neon/60 bg-neon/15 text-neon' },
  'en-curso': { texto: 'En curso', clase: 'border-amatista-claro/50 bg-amatista/15 text-amatista-claro' },
  disponible: { texto: 'Abierto', clase: 'border-white/15 bg-white/5 text-white/60' },
  proximamente: { texto: 'Pronto', clase: 'border-dashed border-white/15 text-white/45' },
  bloqueado: { texto: 'Más adelante', clase: 'border-dashed border-white/15 text-white/45' },
};

function Hexagono({ paso }) {
  const { estado, numero } = paso;
  const clase =
    estado === 'hecho'
      ? 'bg-emerald-400 text-base'
      : estado === 'siguiente'
        ? 'bg-neon text-base camino__pulso'
        : estado === 'en-curso'
          ? 'bg-amatista text-white'
          : estado === 'proximamente' || estado === 'bloqueado'
            ? 'bg-white/10 text-white/40'
            : 'bg-superficie text-white ring-1 ring-inset ring-white/20';
  return (
    <span className={`hexagono relative z-[1] grid h-11 w-12 shrink-0 place-items-center font-mono text-sm font-extrabold ${clase}`} aria-hidden="true">
      {estado === 'hecho' ? <IconoPalomita className="h-5 w-5" /> : estado === 'bloqueado' ? <IconoCandado className="h-4 w-4" /> : numero}
    </span>
  );
}

export default function Paso({ paso, abierto, alternar, ultimo }) {
  const estado = ESTADOS[paso.estado] ?? ESTADOS.disponible;
  const conContenido = paso.lecciones.length > 0 && paso.estado !== 'bloqueado';
  const idLista = `paso-${paso.id.replace(/[^a-z0-9_-]/gi, '-')}`;
  const accion = paso.estado === 'hecho' ? 'Repasar' : paso.estado === 'en-curso' || (paso.estado === 'siguiente' && paso.hechas) ? 'Seguir' : paso.estado === 'siguiente' ? 'Empezar' : 'Abrir';
  const tema = useMemo(() => temaDelModulo(paso.modulo), [paso.modulo]);
  const frases = useMemo(() => mensajesDeMascota(tema?.mascota), [tema]);
  const [fraseIdx, setFraseIdx] = useState(-1);
  const relojFrase = useRef(null);

  useEffect(() => () => window.clearTimeout(relojFrase.current), []);

  const tocarMascota = () => {
    if (!frases.length) return;
    setFraseIdx((prev) => (prev + 1) % frases.length);
    window.clearTimeout(relojFrase.current);
    relojFrase.current = window.setTimeout(() => setFraseIdx(-1), 6500);
  };

  const fraseActual = fraseIdx >= 0 ? frases[fraseIdx] : null;

  return (
    <li className={`camino__paso group/paso relative flex gap-3 sm:gap-4 ${ultimo ? '' : 'pb-3'}`} data-estado={paso.estado}>
      {!ultimo && <span className="camino__linea absolute bottom-0 left-6 top-11 w-px" aria-hidden="true" />}
      <Hexagono paso={paso} />
      <div
        className={`corte-poly-sm relative min-w-0 flex-1 overflow-hidden border transition-colors ${
          paso.estado === 'siguiente' ? 'border-neon/50 bg-gradient-to-r from-neon/10 to-superficie/95' : 'border-white/10 bg-superficie/90'
        }`}
      >
        {conContenido && (
          <>
            <Escenario
              tema={tema}
              className={`pointer-events-none absolute inset-x-0 top-0 h-28 w-full transition-opacity duration-500 ${
                paso.estado === 'siguiente' || abierto ? 'opacity-35 group-hover/paso:opacity-50' : 'opacity-0 group-hover/paso:opacity-30'
              }`}
            />
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-superficie via-superficie/80 to-transparent"
              aria-hidden="true"
            />
          </>
        )}
        <div className="relative z-[1] flex flex-wrap items-center gap-x-4 gap-y-2 p-3 sm:flex-nowrap sm:p-4">
          {conContenido && (
            <Personaje
              tema={tema}
              className="personaje--chico shrink-0"
              onToque={tocarMascota}
              etiqueta={`Tocar a ${tema.mascota?.nombre ?? 'la mascota'}, guía de ${paso.titulo}`}
            />
          )}
          {/* Tocar el título también abre las lecciones; para el teclado está el botón «Ver lecciones». */}
          <button
            type="button"
            onClick={alternar}
            disabled={!conContenido}
            tabIndex={-1}
            className="group min-w-0 flex-1 text-left disabled:cursor-default"
          >
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-base font-extrabold text-white sm:text-lg">{paso.titulo}</span>
              <span className={`corte-poly-sm border px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest ${estado.clase}`}>{estado.texto}</span>
              {conContenido && tema?.nombre && (
                <span className={`hidden font-mono text-[10px] uppercase tracking-widest sm:inline ${tema.texto}`}>
                  · {tema.nombre}
                </span>
              )}
            </span>
            {paso.resumen && <span className="mt-0.5 block text-sm leading-snug text-texto/70">{paso.resumen}</span>}
            <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-widest text-white/45">
              {conContenido && (
                <span>
                  {paso.hechas ? `${paso.hechas} de ${paso.lecciones.length}` : plural(paso.lecciones.length, 'lección', 'lecciones')}
                </span>
              )}
              {paso.minutos && conContenido && <span>{horas(paso.minutos)}</span>}
              {paso.insignia && conContenido && <span className="text-amatista-claro/80">Insignia: {paso.insignia}</span>}
            </span>
          </button>
          {conContenido && (
            <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
              <button
                type="button"
                onClick={alternar}
                aria-expanded={abierto}
                aria-controls={idLista}
                className="boton boton--fantasma boton--chico text-white/75"
              >
                {abierto ? 'Ocultar' : 'Ver'} lecciones <span className="boton__flecha boton__flecha--abajo" aria-hidden="true">▸</span>
              </button>
              <a href={paso.href} className={`boton ${paso.estado === 'siguiente' ? 'boton--primario destello' : 'boton--secundario'} flex-1 sm:flex-none`}>
                {accion} <span className="boton__flecha" aria-hidden="true">▸</span>
                <span className="sr-only">: {paso.titulo}</span>
              </a>
            </div>
          )}
        </div>
        {fraseActual && (
          <div
            key={fraseIdx}
            role="status"
            style={{ '--acento': tema?.colores?.acento }}
            className="companero__globo globo relative z-[1] mx-3 mb-3 flex items-start justify-between gap-3 sm:mx-4"
          >
            <div className="min-w-0">
              <span className="companero__quien">{tema?.mascota?.nombre ?? 'Guía'} · {tema?.nombre}</span>
              <p className="text-sm text-white/90">{fraseActual.texto}</p>
            </div>
            <button
              type="button"
              onClick={() => setFraseIdx(-1)}
              aria-label="Cerrar mensaje de la mascota"
              className="shrink-0 font-mono text-xs text-white/50 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}
        {conContenido && abierto && (
          <ol id={idLista} className="animar-entrar relative z-[1] grid gap-px [&>*]:min-w-0 border-t border-white/5 bg-white/5 sm:grid-cols-2">
            {paso.lecciones.map((leccion, i) => {
              const Icono = ICONO_FORMULA[leccion.formula];
              const esJefe = leccion.formula === 'jefe';
              return (
                <li key={leccion.id} className="bg-superficie/95">
                  <a href={leccion.href} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-white/5 sm:px-4">
                    <span
                      className={`hexagono grid h-7 w-8 shrink-0 place-items-center ${leccion.hecha ? 'bg-emerald-400/20 text-emerald-300' : 'bg-black/30 text-white/60'}`}
                      aria-hidden="true"
                    >
                      {esJefe && tema?.jefe ? (
                        <Jefe jefe={tema.jefe} derrotado={leccion.hecha} className="h-6 w-6" />
                      ) : leccion.hecha ? (
                        <IconoPalomita className="h-3.5 w-3.5" />
                      ) : Icono ? (
                        <Icono className="h-4 w-4" />
                      ) : (
                        <span className="font-mono text-[11px]">{i + 1}</span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate ${leccion.hecha ? 'text-white/60' : 'text-white'}`}>{leccion.titulo}</span>
                    </span>
                    {leccion.minutos && <span className="shrink-0 font-mono text-[11px] text-white/40">{leccion.minutos} min</span>}
                    {leccion.hecha && <span className="sr-only">(hecha)</span>}
                  </a>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </li>
  );
}
