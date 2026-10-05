import { useEffect, useMemo, useState } from 'react';
import { XP_POR_LECCION } from '../../progreso/reglas';
import Escenario from '../temas/Escenario';
import Jefe from '../temas/Jefe';
import { SpriteMascota } from '../temas/Mascota';
import { TEMAS, vidaDelJefe } from '../temas/temas';

// Mezcla con semilla: el mismo intento da siempre el mismo orden (función pura).
function mezclar(lista, semilla) {
  const copia = [...lista];
  let estado = semilla >>> 0;
  const azar = () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296;
    return estado / 4294967296;
  };
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

const semillaDe = (texto) => [...texto].reduce((hash, letra) => (hash * 31 + letra.charCodeAt(0)) >>> 0, 7);

const LETRAS = ['A', 'B', 'C', 'D', 'E'];

function estiloOpcion(respondida, esElegida, esCorrecta) {
  if (!respondida) return 'border-white/10 bg-base/60 hover:border-amatista hover:bg-amatista/10';
  if (esCorrecta) return 'border-emerald-400/70 bg-emerald-400/10';
  if (esElegida) return 'border-red-400/70 bg-red-400/10';
  return 'border-white/5 bg-base/40 opacity-60';
}

// Barra de vida del jefe por segmentos: uno por golpe que aguanta.
function BarraVida({ vida, restante, color }) {
  return (
    <div className="flex gap-1" role="meter" aria-label="Vida del jefe" aria-valuemin={0} aria-valuemax={vida} aria-valuenow={restante}>
      {Array.from({ length: vida }, (_, i) => (
        <span
          key={i}
          className={`h-3 flex-1 skew-x-[-20deg] transition-all duration-500 ${i < restante ? '' : 'scale-y-50 opacity-20'}`}
          style={{ background: i < restante ? color : '#ffffff' }}
        />
      ))}
    </div>
  );
}

// La arena: el jefe del módulo, su vida y lo que dice.
function Arena({ tema, vida, golpeado, fallosPermitidos, fallos }) {
  const { jefe } = tema;
  const quedan = fallosPermitidos - fallos;
  let frase = jefe.frase;
  if (vida.derrotado) frase = '¡Nooo! Me derrotaste…';
  else if (golpeado) frase = '¡Auch! Eso dolió.';
  else if (quedan < 0) frase = 'Esta vez gano yo. ¡Vuelve a intentarlo!';
  return (
    <div className={`corte-poly-sm relative mb-6 overflow-hidden border ${tema.borde} bg-base p-4`}>
      <Escenario tema={tema} className="pointer-events-none absolute inset-0 h-full w-full opacity-70" />
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${tema.banda}`} aria-hidden="true" />
      {tema.mascota && (
        <p className="absolute bottom-2 right-3 hidden items-end gap-1.5 sm:flex" aria-hidden="true">
          <span className="globo bg-base/85 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white/80">
            {vida.derrotado ? '¡Lo lograste!' : golpeado ? '¡Otro golpe!' : '¡Tú puedes!'}
          </span>
          <SpriteMascota tema={tema} className={`h-9 w-9 ${golpeado || vida.derrotado ? 'animar-aparecer' : 'esc-flotar'}`} />
        </p>
      )}
      <div className="relative flex items-center gap-4">
        <Jefe jefe={jefe} golpeado={golpeado} derrotado={vida.derrotado} className="h-24 w-24 shrink-0 sm:h-28 sm:w-28" />
        <div className="min-w-0 flex-1">
          <p className={`font-mono text-[10px] uppercase tracking-[0.25em] ${tema.texto}`}>Jefe final · {tema.nombre}</p>
          <p className="text-xl font-extrabold text-white sm:text-2xl">{jefe.nombre}</p>
          <p className="mt-0.5 text-sm italic text-texto/75">«{frase}»</p>
          <div className="mt-3">
            <BarraVida vida={vida.vida} restante={vida.restante} color={jefe.piel} />
            <p className="mt-1.5 flex flex-wrap justify-between gap-x-3 font-mono text-[10px] uppercase tracking-widest text-white/50">
              <span>
                Vida {vida.restante} / {vida.vida}
                {vida.criticos > 0 && <span className="ml-2 text-neon">+{vida.criticos} crítico{vida.criticos > 1 ? 's' : ''}</span>}
              </span>
              <span className={quedan < 0 ? 'text-red-300' : ''}>
                {quedan >= 0 ? `Puedes fallar ${quedan} más` : 'Sin margen de error'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Examen({ quiz, registroPrevio, insignia, completaModulo, hrefCurso, alTerminar, tema = { id: 'cristal', ...TEMAS.cristal } }) {
  const [intento, setIntento] = useState(0);
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [golpeado, setGolpeado] = useState(false);

  // El destello del golpe dura un instante.
  useEffect(() => {
    if (!golpeado) return undefined;
    const t = setTimeout(() => setGolpeado(false), 450);
    return () => clearTimeout(t);
  }, [golpeado]);

  const preguntas = quiz.questions;
  const pregunta = preguntas[indice];
  const opciones = useMemo(
    () => mezclar(pregunta.options, semillaDe(pregunta.id) + intento * 7919),
    [pregunta, intento],
  );
  const elegida = respuestas[pregunta.id];
  const acerto = pregunta.options.find((opcion) => opcion.id === elegida)?.isCorrect;

  const esCorrecta = (p, id) => Boolean(p.options.find((opcion) => opcion.id === id)?.isCorrect);
  const aciertosHasta = preguntas.filter((p) => esCorrecta(p, respuestas[p.id])).length;
  const fallosHasta = preguntas.filter((p) => respuestas[p.id] && !esCorrecta(p, respuestas[p.id])).length;
  const vida = vidaDelJefe(preguntas.length, aciertosHasta, quiz.passingScore);
  const fallosPermitidos = preguntas.length - vida.vida;

  const responder = (opcionId) => {
    if (elegida) return;
    setRespuestas({ ...respuestas, [pregunta.id]: opcionId });
    if (esCorrecta(pregunta, opcionId)) setGolpeado(true);
  };

  const siguiente = () => {
    if (indice < preguntas.length - 1) {
      setIndice(indice + 1);
      return;
    }
    const aciertos = preguntas.filter(
      (p) => p.options.find((opcion) => opcion.id === respuestas[p.id])?.isCorrect,
    ).length;
    const puntaje = Math.round((aciertos / preguntas.length) * 100);
    const aprobado = puntaje >= quiz.passingScore;
    const mejorAnterior = registroPrevio?.puntaje ?? 0;
    const xpGanada = aprobado
      ? (registroPrevio?.completada ? 0 : XP_POR_LECCION) +
        (registroPrevio?.completada ? Math.max(0, puntaje - mejorAnterior) : Math.max(puntaje, mejorAnterior))
      : 0;
    setResultado({ puntaje, aprobado, aciertos, xpGanada });
    alTerminar(puntaje, aprobado);
  };

  const reintentar = () => {
    setIntento(intento + 1);
    setIndice(0);
    setRespuestas({});
    setResultado(null);
    setGolpeado(false);
  };

  if (resultado) {
    return (
      <section className="corte-poly animar-entrar relative overflow-hidden border border-white/10 bg-superficie/95 p-8 text-center" role="status">
        <Escenario tema={tema} className="pointer-events-none absolute inset-x-0 top-0 h-40 w-full opacity-60" />
        <div className="relative">
          {resultado.aprobado ? (
            <>
              <Jefe jefe={tema.jefe} derrotado className="mx-auto h-28 w-28" />
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-neon">Jefe derrotado · examen aprobado</p>
              <h2 className="animar-aparecer mt-2 text-4xl font-extrabold text-white">¡Venciste a {tema.jefe.nombre}!</h2>
            </>
          ) : (
            <>
              <Jefe jefe={tema.jefe} className="mx-auto h-28 w-28" />
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-blender">{tema.jefe.nombre} resistió</p>
              <h2 className="mt-2 text-4xl font-extrabold text-white">Repasa y vuelve a la pelea</h2>
            </>
          )}
          <p className="mt-4 text-lg text-texto/80">
            Obtuviste <strong className="text-white">{resultado.puntaje}%</strong> ({resultado.aciertos} de{' '}
            {preguntas.length} correctas). {resultado.aprobado ? '' : `Necesitas ${quiz.passingScore}% para aprobar.`}
          </p>
          {resultado.xpGanada > 0 && (
            <p className="mt-3 font-mono text-xl font-bold text-neon">+{resultado.xpGanada} XP</p>
          )}
          {resultado.aprobado && completaModulo && insignia && (
            <p className="corte-poly-sm mx-auto mt-5 inline-block bg-amatista/20 px-4 py-2 font-mono text-sm uppercase tracking-widest text-amatista-claro">
              ◆ Insignia desbloqueada: {insignia}
            </p>
          )}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {!resultado.aprobado && (
              <button
                type="button"
                onClick={reintentar}
                className="corte-poly-sm destello bg-amatista px-6 py-3 font-extrabold uppercase tracking-widest text-white hover:brightness-110"
              >
                ↻ Intentar de nuevo
              </button>
            )}
            <a
              href={hrefCurso}
              className={`corte-poly-sm destello px-6 py-3 font-extrabold uppercase tracking-widest ${
                resultado.aprobado ? 'bg-neon text-base hover:brightness-110' : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              {resultado.aprobado ? 'Volver al curso ▶' : 'Repasar lecciones'}
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="corte-poly border border-white/10 bg-superficie/95 p-6 sm:p-8">
      <Arena tema={tema} vida={vida} golpeado={golpeado} fallosPermitidos={fallosPermitidos} fallos={fallosHasta} />
      <div className="mb-6 flex items-center justify-between font-mono text-xs uppercase tracking-widest">
        <span className="text-neon">
          Pregunta {indice + 1} de {preguntas.length}
        </span>
        <span className="text-white/40">Aprueba con {quiz.passingScore}%</span>
      </div>

      <h2 className="text-2xl font-bold leading-snug text-white">{pregunta.questionText}</h2>

      <div className="mt-6 grid gap-3" role="group" aria-label="Opciones">
        {opciones.map((opcion, i) => {
          const esElegida = elegida === opcion.id;
          return (
            <button
              key={opcion.id}
              type="button"
              onClick={() => responder(opcion.id)}
              disabled={Boolean(elegida)}
              aria-pressed={esElegida}
              className={`corte-poly-sm flex items-center gap-4 border px-4 py-3 text-left transition-colors disabled:cursor-default ${estiloOpcion(
                Boolean(elegida),
                esElegida,
                opcion.isCorrect,
              )}`}
            >
              <span className="hexagono grid h-9 w-10 shrink-0 place-items-center bg-white/10 font-mono text-sm font-bold text-white">
                {LETRAS[i]}
              </span>
              <span className="flex-1 text-texto">{opcion.text}</span>
              {elegida && (opcion.isCorrect || esElegida) && (
                <span
                  className={`font-mono text-lg font-bold ${opcion.isCorrect ? 'text-emerald-300' : 'text-red-300'}`}
                  aria-label={opcion.isCorrect ? 'Respuesta correcta' : 'Tu respuesta'}
                >
                  {opcion.isCorrect ? '✓' : '✗'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {elegida && (
        <div
          role="status"
          className={`corte-poly-sm animar-entrar mt-5 border p-4 ${
            acerto ? 'border-emerald-400/50 bg-emerald-400/10' : 'border-red-400/50 bg-red-400/10'
          }`}
        >
          <p className={`font-bold ${acerto ? 'text-emerald-300' : 'text-red-300'}`}>
            {acerto ? `✓ ¡Correcto! Golpe a ${tema.jefe.nombre}` : '✗ No es correcto: el jefe esquivó tu ataque'}
          </p>
          <p className="mt-1 text-texto/85">{acerto ? pregunta.feedbackCorrect : pregunta.feedbackIncorrect}</p>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={siguiente}
          disabled={!elegida}
          className="corte-poly-sm destello bg-amatista px-6 py-3 font-extrabold uppercase tracking-widest text-white transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {indice < preguntas.length - 1 ? 'Siguiente ataque ▶' : 'Ver el resultado ▶'}
        </button>
      </div>
    </section>
  );
}

export default Examen;
