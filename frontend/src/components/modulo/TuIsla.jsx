// «Tu isla» (motor 5, §6.7): un solo mundo para todo el curso de Blender. Cada proyecto de
// módulo deja una pieza: el lugar se marca con el color del taller, se llena cuando el proyecto
// está hecho y lleva una estrella si además salió el reto final. El mapa es un SVG propio con
// GET /talleres; «Abrir mi isla en Blender» le pide al add-on que la arme en tu Blender.
// Sin sesión, sin servidor o con un servidor de antes del taller no se muestra.
import { useEffect, useId, useState } from 'react';
import { useAuth } from '../../auth/contexto';
import { disenoIsla, textoOrden } from '../../blender/taller';
import { useAvisoTemporal } from '../../blender/useTaller';
import { listarTalleres, ordenarTaller } from '../../services/blender';

const ANCHO = 320;
const ALTO = 180;

// La isla low poly: un contorno de facetas y unas pocas aristas interiores.
const CONTORNO = '22,96 40,48 92,20 170,12 246,24 296,64 304,118 268,156 196,170 112,168 48,146';
const ARISTAS = ['92,20 120,92 40,48', '170,12 120,92 246,24', '246,24 214,108 296,64', '120,92 214,108 196,170', '22,96 120,92 112,168', '214,108 304,118 268,156'];

const hexagono = (x, y, r) =>
  [0, 60, 120, 180, 240, 300].map((g) => `${(x + r * Math.cos((g * Math.PI) / 180)).toFixed(1)},${(y + r * Math.sin((g * Math.PI) / 180)).toFixed(1)}`).join(' ');

const estrella = (x, y, r) =>
  Array.from({ length: 10 }, (_, i) => {
    const radio = i % 2 ? r * 0.45 : r;
    const angulo = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${(x + radio * Math.cos(angulo)).toFixed(1)},${(y + radio * Math.sin(angulo)).toFixed(1)}`;
  }).join(' ');

const estadoPunto = (p) => (p.estrella ? 'proyecto y reto hechos' : p.hecho ? 'proyecto hecho' : p.abierto ? 'proyecto abierto' : 'por hacer');

function TuIsla({ className = '' }) {
  const { token, usuario } = useAuth();
  const [talleres, setTalleres] = useState(null);
  const [aviso, avisar] = useAvisoTemporal();
  const [enviando, setEnviando] = useState(false);
  const idTitulo = useId();

  useEffect(() => {
    if (!token) return undefined;
    let vigente = true;
    listarTalleres(token).then((r) => {
      if (vigente) setTalleres(r.ok && Array.isArray(r.datos?.talleres) ? r.datos.talleres : null);
    });
    return () => {
      vigente = false;
    };
  }, [token]);

  if (!usuario || !talleres?.length) return null;
  const puntos = disenoIsla(talleres, { ancho: ANCHO, alto: ALTO, margen: 30 });
  const hechos = puntos.filter((p) => p.hecho).length;

  const abrir = async () => {
    setEnviando(true);
    const r = await ordenarTaller(token, 'isla');
    setEnviando(false);
    avisar(textoOrden(r));
  };

  return (
    <section
      aria-labelledby={idTitulo}
      className={`corte-poly-sm animar-entrar border border-amatista/30 bg-gradient-to-br from-amatista/10 via-superficie/95 to-superficie/95 p-4 ${className}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amatista-claro">Úsalo · tu mundo</p>
          <h2 id={idTitulo} className="font-extrabold text-white">
            Tu isla
          </h2>
          <p className="text-sm text-texto/70">
            {hechos
              ? `${hechos} de ${puntos.length} ${puntos.length === 1 ? 'pieza puesta' : 'piezas puestas'}: cada proyecto que terminas queda aquí.`
              : 'Cada proyecto que terminas deja una pieza aquí.'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={abrir}
            disabled={enviando}
            className="corte-poly-sm destello bg-amatista px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-white hover:brightness-110 disabled:opacity-50"
          >
            Abrir mi isla en Blender
          </button>
          {aviso && (
            <span className="font-mono text-[11px] text-neon" role="status">
              {aviso}
            </span>
          )}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        className="mx-auto mt-3 h-auto max-h-72 w-full"
        role="img"
        aria-labelledby={`${idTitulo}-mapa`}
      >
        <title id={`${idTitulo}-mapa`}>
          {`Mapa de tu isla: ${hechos} de ${puntos.length} lugares con su pieza.`}
        </title>
        <polygon points={CONTORNO} fill="rgb(155 89 182 / 0.12)" stroke="rgb(195 155 211 / 0.45)" strokeWidth="1.5" strokeLinejoin="round" />
        {ARISTAS.map((a) => (
          <polyline key={a} points={a} fill="none" stroke="rgb(255 255 255 / 0.06)" strokeWidth="1" />
        ))}
        {/* En el mapa, cada lugar lleva el número de su módulo; los nombres van en la lista de abajo (no se enciman). */}
        {puntos.map((p, i) => {
          return (
            <g key={p.id}>
              <title>{`${p.pieza}: ${estadoPunto(p)}`}</title>
              {p.abierto && !p.hecho && (
                <polygon points={hexagono(p.x, p.y, 13)} fill="none" stroke={p.color} strokeOpacity="0.45" className="animar-pulso" />
              )}
              <polygon
                points={hexagono(p.x, p.y, 9)}
                fill={p.hecho ? p.color : 'rgb(18 18 18 / 0.7)'}
                stroke={p.color}
                strokeWidth="1.6"
                strokeDasharray={p.hecho ? undefined : '3 2'}
                className={p.hecho ? 'animar-aparecer' : undefined}
                style={p.hecho ? { transformOrigin: `${p.x}px ${p.y}px`, transformBox: 'view-box' } : undefined}
              />
              {p.estrella && <polygon points={estrella(p.x + 9, p.y - 9, 5)} fill="#fcd34d" stroke="#121212" strokeWidth="0.6" />}
              <text
                x={p.x}
                y={p.y + 3}
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                fill={p.hecho ? '#121212' : 'rgb(255 255 255 / 0.7)'}
                aria-hidden="true"
              >
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
      <ol className="mt-3 grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {puntos.map((p, i) => (
          <li key={p.id} className="flex min-w-0 items-center gap-2" title={p.texto || undefined}>
            <svg viewBox="0 0 24 22" className="h-5 w-6 shrink-0" aria-hidden="true">
              <polygon
                points={hexagono(12, 11, 9.5)}
                fill={p.hecho ? p.color : 'none'}
                stroke={p.color}
                strokeWidth="1.6"
                strokeDasharray={p.hecho ? undefined : '3 2'}
              />
              <text x="12" y="14.5" textAnchor="middle" fontSize="10" fontWeight="700" fill={p.hecho ? '#121212' : p.color}>
                {i + 1}
              </text>
            </svg>
            <span className={`min-w-0 truncate ${p.hecho ? 'text-white' : 'text-texto/70'}`}>
              {p.pieza}
              {p.estrella && <span className="text-amber-300"> ★</span>}
            </span>
            <span className="sr-only">: {estadoPunto(p)}{p.texto ? `. ${p.texto}` : ''}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default TuIsla;
