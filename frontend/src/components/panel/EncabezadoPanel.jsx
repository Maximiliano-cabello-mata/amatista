import AnilloProgreso from '../graficas/AnilloProgreso';
import { CristalLogo } from '../Iconos';
import { fechaLocal, sumarDias, TITULOS_NIVEL } from '../../progreso/reglas';
import { IconoRacha } from './IconosPanel';
import { Cifra } from './Seccion';

const dias = (n) => (n === 1 ? 'día' : 'días');

function primerNombre(usuario) {
  const nombre = (usuario?.nombre ?? '').trim();
  return nombre ? nombre.split(/\s+/)[0] : null;
}

function mensaje({ hayAvance, racha }) {
  if (!hayAvance) {
    return 'Este es tu centro de mando. Completa tu primera lección y aquí verás crecer tu nivel, tu racha y tus insignias.';
  }
  if (racha.hoy) return `¡Ya practicaste hoy! Llevas ${racha.actual} ${dias(racha.actual)} seguidos.`;
  if (racha.actual > 0) return `Tu racha de ${racha.actual} ${dias(racha.actual)} sigue viva: practica hoy para no perderla.`;
  return 'Una lección corta basta para encender tu racha de nuevo.';
}

const DIAS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

// La racha como protagonista: una llama que se mueve si hoy ya practicaste,
// los últimos siete días y la próxima meta (los logros de racha: 3, 7 y 14).
function TarjetaRacha({ racha, actividad = {}, hoy = new Date() }) {
  const hoyTexto = fechaLocal(hoy);
  const semana = Array.from({ length: 7 }, (_, i) => {
    const fecha = sumarDias(hoyTexto, i - 6);
    const [a, m, d] = fecha.split('-').map(Number);
    return { fecha, letra: DIAS[new Date(a, m - 1, d).getDay()], activo: (actividad[fecha] ?? 0) > 0, esHoy: i === 6 };
  });
  const meta = [3, 7, 14, 30].find((n) => n > racha.actual) ?? null;
  const viva = racha.actual > 0;
  return (
    <div className="corte-poly-sm col-span-2 flex items-center gap-4 border border-blender/30 bg-gradient-to-br from-blender/15 via-base/70 to-base/70 px-4 py-3">
      <div className="relative grid h-16 w-14 shrink-0 place-items-center">
        <IconoRacha className={`h-14 w-14 ${viva ? 'text-blender' : 'text-white/25'} ${racha.hoy ? 'animar-llama' : ''}`} />
        <span className="absolute bottom-0 text-lg font-extrabold text-white drop-shadow">{racha.actual}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">
          Racha · {racha.actual} {dias(racha.actual)} · récord {racha.mejor}
        </p>
        <ol className="mt-1.5 flex gap-1.5" aria-label="Actividad de los últimos siete días">
          {semana.map((dia) => (
            <li key={dia.fecha} className="flex flex-col items-center gap-0.5">
              <span
                className={`hexagono block h-5 w-6 transition-colors ${
                  dia.activo ? 'bg-blender' : dia.esHoy ? 'border border-dashed border-blender/60 bg-transparent' : 'bg-white/10'
                } ${dia.activo && dia.esHoy ? 'animar-aparecer' : ''}`}
              />
              <span className={`font-mono text-[9px] ${dia.esHoy ? 'text-white' : 'text-white/40'}`}>{dia.letra}</span>
              <span className="sr-only">
                {dia.fecha}: {dia.activo ? 'con actividad' : 'sin actividad'}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-1 text-xs text-white/55">
          {racha.hoy ? 'Hoy ya sumaste ✓' : viva ? 'Practica hoy para mantenerla' : 'Una lección enciende tu racha'}
          {meta && ` · meta: ${meta} ${dias(meta)}`}
        </p>
      </div>
    </div>
  );
}

// Saludo, nivel con su anillo de XP y las cifras principales (XP, racha, mejor racha, lecciones).
function EncabezadoPanel({ usuario, xp, nivel, racha, lecciones, hayAvance, actividad, hoy }) {
  const nombre = primerNombre(usuario);
  const siguienteTitulo = TITULOS_NIVEL[Math.min(nivel.nivel + 1, TITULOS_NIVEL.length) - 1];

  return (
    <header className="animar-entrar">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon">Mi panel</p>
      <h1 className="mt-1 text-3xl font-extrabold leading-tight text-white sm:text-5xl">
        Hola, <span className="text-amatista-claro">{nombre ?? 'Creador anónimo'}</span>
      </h1>
      <p className="mt-2 max-w-2xl text-texto/75">{mensaje({ hayAvance, racha })}</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="corte-poly flex items-center gap-5 border border-amatista/30 bg-gradient-to-br from-amatista/25 via-superficie/95 to-superficie/95 p-5">
          <AnilloProgreso
            valor={nivel.avance}
            tamano={108}
            grosor={9}
            etiqueta={`Avance hacia el nivel ${nivel.nivel + 1}`}
            textoValor={`${nivel.xpNivel} de ${nivel.xpSiguiente} XP`}
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">Nivel</span>
            <span className="text-4xl font-extrabold leading-none text-white">{nivel.nivel}</span>
          </AnilloProgreso>
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">Tu título</p>
            <p className="text-2xl font-extrabold text-white">{nivel.titulo}</p>
            <p className="mt-1 font-mono text-xs text-white/60">
              {nivel.xpNivel} / {nivel.xpSiguiente} XP en este nivel
            </p>
            <p className="mt-2 text-sm leading-snug text-texto/75">
              Faltan <strong className="text-white">{nivel.faltan} XP</strong> para el nivel {nivel.nivel + 1}:{' '}
              <span className="text-amatista-claro">{siguienteTitulo}</span>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 content-start gap-3 sm:grid-cols-4">
          <TarjetaRacha racha={racha} actividad={actividad} hoy={hoy} />
          <dl className="col-span-2 grid grid-cols-2 gap-3">
            <Cifra etiqueta="XP total" valor={xp} Icono={CristalLogo} detalle="100 por lección + bonos" />
            <Cifra etiqueta="Lecciones" valor={lecciones} detalle="Completadas en total" />
          </dl>
        </div>
      </div>
    </header>
  );
}

export default EncabezadoPanel;
