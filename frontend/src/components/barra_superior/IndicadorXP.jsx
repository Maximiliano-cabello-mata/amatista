import { rutas } from '../../rutas';

export default function IndicadorXP({ xp, nivel }) {
  return (
    <a
      href={rutas.panel}
      className="corte-poly-sm flex items-center gap-2 border border-amatista/40 bg-amatista/15 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-amatista-claro hover:bg-amatista/25"
      title={`Nivel ${nivel.nivel} · ${nivel.titulo}: faltan ${nivel.faltan} XP para el siguiente nivel`}
      aria-label={`Nivel ${nivel.nivel}, ${nivel.titulo}, ${xp} XP. Ver mi panel`}
    >
      <span className="hexagono grid h-5 w-6 place-items-center bg-amatista text-[11px] text-white" aria-hidden="true">
        {nivel.nivel}
      </span>
      <span aria-hidden="true">
        {xp} XP
      </span>
    </a>
  );
}
