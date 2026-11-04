// Ayuda (#/guia, botón «?» de la barra): no es un curso. Arriba, el recorrido por la plataforma
// (un minuto por las páginas reales); después, la tarjeta de cómo se unen la plataforma y Blender;
// luego, Goliat, el compañero; al final, respuestas cortas que se abren de a una (data/guia.js).
import { useState } from 'react';
import FusionPlataformaBlender from '../components/blender/FusionPlataformaBlender';
import Pagina from '../components/estructura/Pagina';
import TituloSeccion from '../components/estructura/TituloSeccion';
import { CristalLogo } from '../components/Iconos';
import BloqueContenido from '../components/leccion/BloqueContenido';
import { TEMAS_AYUDA } from '../data/guia';
import ConoceGoliat from '../goliat/ConoceGoliat';
import { useRecorrido } from '../recorrido/contexto';
import { TOTAL_RECORRIDO } from '../recorrido/pasos';
import { rutas } from '../rutas';

const BOTON = 'boton boton--grande';

function Tema({ tema, abierto, alAlternar }) {
  const idPanel = `ayuda-${tema.id}`;
  return (
    <li className={`corte-poly-sm border transition-colors ${abierto ? 'border-neon/40 bg-superficie' : 'border-white/10 bg-superficie/85'}`}>
      <h3>
        <button
          type="button"
          onClick={alAlternar}
          aria-expanded={abierto}
          aria-controls={idPanel}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:text-neon"
        >
          <span className="min-w-0">
            <span className="block text-lg font-bold text-white">{tema.titulo}</span>
            <span className="block text-sm text-texto/65">{tema.resumen}</span>
          </span>
          <span className={`shrink-0 font-mono text-lg text-neon transition-transform ${abierto ? 'rotate-90' : ''}`} aria-hidden="true">
            ▸
          </span>
        </button>
      </h3>
      {abierto && (
        <div id={idPanel} className="animar-entrar space-y-6 border-t border-white/10 px-5 pb-6 pt-5">
          {tema.bloques.map((bloque, i) => (
            <BloqueContenido key={`${tema.id}-${i}`} bloque={bloque} />
          ))}
        </div>
      )}
    </li>
  );
}

function Guia() {
  const { empezar } = useRecorrido();
  const [abierto, setAbierto] = useState(null);

  return (
    <Pagina
      ancho="contenido"
      migas={[{ texto: 'Inicio', href: rutas.inicio }, { texto: 'Ayuda' }]}
      encabezado={{
        tono: 'neon',
        icono: <CristalLogo className="animar-flotar h-12 w-12" />,
        antetitulo: 'Ayuda',
        titulo: '¿Cómo funciona Amatista?',
        descripcion: `Todo lo que necesitas para empezar, sin saber programar. El recorrido te muestra la plataforma en ${TOTAL_RECORRIDO} paradas por las páginas de verdad.`,
        acciones: (
          <button type="button" onClick={() => empezar(0)} className={`${BOTON} destello bg-neon text-base hover:brightness-110`}>
            ▶ Empezar el recorrido
          </button>
        ),
      }}
    >
      <div className="mt-8">
        <FusionPlataformaBlender resumida />
      </div>

      <ConoceGoliat />

      <section className="mt-12" aria-labelledby="ayuda-preguntas">
        <TituloSeccion id="ayuda-preguntas" antetitulo="Respuestas cortas" titulo="Preguntas rápidas" />
        <ul className="mt-5 grid gap-3">
          {TEMAS_AYUDA.map((tema) => (
            <Tema key={tema.id} tema={tema} abierto={abierto === tema.id} alAlternar={() => setAbierto(abierto === tema.id ? null : tema.id)} />
          ))}
        </ul>
      </section>

      <nav className="mt-12 flex flex-col gap-3 sm:flex-row" aria-label="Ir a">
        <a href={rutas.inicio} className={`${BOTON} bg-amatista text-white hover:brightness-110`}>
          Cursos
        </a>
        <a href={rutas.blender} className={`${BOTON} border border-blender/40 bg-blender/10 text-blender hover:bg-blender/20`}>
          Blender
        </a>
        <a href={rutas.panel} className={`${BOTON} border border-white/15 bg-white/5 text-white/85 hover:bg-white/10`}>
          Mi panel
        </a>
        <a href={rutas.buzon} className={`${BOTON} border border-amatista/40 bg-amatista/10 text-amatista-claro hover:bg-amatista/20`}>
          Escribirle al creador
        </a>
      </nav>
    </Pagina>
  );
}

export default Guia;
