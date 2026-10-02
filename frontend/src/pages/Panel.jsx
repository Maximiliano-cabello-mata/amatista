// Panel del alumno (#/panel). Versión mínima: otro cambio la implementa completa.
import { useProgreso } from '../progreso/contexto';
import { rutas } from '../rutas';

function Panel() {
  const { xp, nivel, racha } = useProgreso();

  return (
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon">Tu avance</p>
      <h1 className="mt-1 text-4xl font-extrabold text-white">Mi panel</h1>
      <p className="mt-4 text-texto/80">
        Nivel {nivel.nivel} · {nivel.titulo} · {xp} XP · racha de {racha.actual} {racha.actual === 1 ? 'día' : 'días'}
      </p>
      <a href={rutas.inicio} className="mt-8 inline-block font-mono text-xs uppercase tracking-widest text-white/50 hover:text-neon">
        ◂ Volver a los cursos
      </a>
    </main>
  );
}

export default Panel;
