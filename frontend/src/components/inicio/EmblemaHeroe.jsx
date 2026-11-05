import { CristalLogo } from '../Iconos';
import LogoCurso from '../LogoCurso';

export default function EmblemaHeroe({ alTocar, girando, chispas }) {
  return (
    <button
      type="button"
      onClick={alTocar}
      aria-label="Tocar el cristal de Amatista"
      title="Tócame"
      className={`emblema-heroe group relative hidden h-28 w-28 shrink-0 place-items-center sm:grid ${girando ? 'emblema-heroe--giro' : ''}`}
    >
      <span className="hexagono absolute inset-0 bg-gradient-to-br from-amatista/40 via-amatista-oscuro/50 to-transparent transition-transform duration-300 group-hover:scale-105" />
      <CristalLogo className="emblema-heroe__cristal animar-flotar relative h-14 w-14 drop-shadow-[0_0_20px_rgba(155,89,182,0.55)]" />
      <span className="emblema-heroe__satelite hexagono absolute -left-2 top-1 grid h-9 w-10 place-items-center bg-superficie">
        <LogoCurso logo="blender" className="h-5 w-6" />
      </span>
      <span className="emblema-heroe__satelite emblema-heroe__satelite--tarde hexagono absolute -right-1 bottom-0 grid h-9 w-10 place-items-center bg-superficie">
        <LogoCurso logo="aframe" className="h-5 w-5" />
      </span>
      {chispas.map((c) => (
        <span
          key={c.id}
          className="personaje__chispa"
          style={{ '--dx': `${c.dx}px`, '--dy': `${c.dy}px`, '--acento': c.color }}
          aria-hidden="true"
        />
      ))}
    </button>
  );
}
