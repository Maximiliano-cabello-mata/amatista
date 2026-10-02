import AnilloProgreso from '../graficas/AnilloProgreso';
import { CristalLogo } from '../Iconos';
import { TITULOS_NIVEL } from '../../progreso/reglas';
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

// Saludo, nivel con su anillo de XP y las cifras principales (XP, racha, mejor racha, lecciones).
function EncabezadoPanel({ usuario, xp, nivel, racha, lecciones, hayAvance }) {
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

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Cifra etiqueta="XP total" valor={xp} Icono={CristalLogo} detalle="100 por lección + bonos" />
          <Cifra
            etiqueta="Racha"
            valor={racha.actual}
            unidad={dias(racha.actual)}
            Icono={IconoRacha}
            tono="text-blender"
            detalle={racha.hoy ? 'Hoy ya sumaste ✓' : racha.actual > 0 ? 'Practica hoy para mantenerla' : 'Empieza hoy'}
          />
          <Cifra etiqueta="Mejor racha" valor={racha.mejor} unidad={dias(racha.mejor)} detalle="Tu récord de días seguidos" />
          <Cifra etiqueta="Lecciones" valor={lecciones} detalle="Completadas en total" />
        </dl>
      </div>
    </header>
  );
}

export default EncabezadoPanel;
