// El mundo del módulo en TODA la página (v3.4): el fondo toma los colores de
// la temática, con su luz y partículas propias (engranes del taller, chispas
// de la herrería, estrellas del hangar, gotas de pintura, reflectores del
// cine, confeti del circo, hojas de la aldea…). Va fijo detrás del
// contenido, no recibe clics y solo anima transform y opacity. En modo
// ligero o con movimiento reducido quedan la luz y el color, sin partículas.
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { variablesDeTema } from './temas';

// Partícula de cada escenario (clases en index.css › .particula--*).
const PARTICULA = {
  engranes: 'engrane',
  chispas: 'chispa',
  estrellas: 'estrella',
  gotas: 'gota',
  reflectores: 'haz',
  carpa: 'confeti',
  aldea: 'hoja',
  mapa: 'papel',
  galeria: 'marco',
  portal: 'anillo',
  cristales: 'cristal',
};

// Lugares fijos (no aleatorios): el fondo es igual en cada visita y no
// cambia entre renders. Siete en la página y cinco en una tarjeta: con más,
// un equipo sin GPU baja de 55 cuadros por segundo (informe 2026-10-05).
const LUGARES = [[5, 0], [19, 3.1], [33, 1.4], [48, 4.6], [62, 2.2], [77, 5.3], [92, 0.8]];

// dentro: el mundo llena una tarjeta (el módulo en la página del curso) en vez
// de la página completa, y no toca los colores de la página.
function MundoTema({ tema, dentro = false }) {
  const variables = variablesDeTema(tema);

  // El color de la temática también tiñe la selección de texto y la barra de
  // desplazamiento de la página mientras se está en el módulo.
  useEffect(() => {
    if (dentro) return undefined;
    const raiz = document.documentElement;
    raiz.dataset.tema = tema?.id ?? 'cristal';
    for (const [clave, valor] of Object.entries(variables)) raiz.style.setProperty(clave, valor);
    return () => {
      delete raiz.dataset.tema;
      for (const clave of Object.keys(variables)) raiz.style.removeProperty(clave);
    };
    // variables se calcula de tema: basta con su id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tema?.id, dentro]);

  const tipo = PARTICULA[tema?.escena] ?? 'cristal';
  const mundo = (
    <div className={`mundo-tema mundo-tema--${tipo} ${dentro ? 'mundo-tema--dentro' : ''}`} style={variables} aria-hidden="true">
      <div className="mundo-tema__luz" />
      <div className="mundo-tema__suelo" />
      <div className="mundo-tema__particulas fondo-pesado">
        {(dentro ? LUGARES.slice(0, 5) : LUGARES).map(([x, retraso], i) => (
          <span
            key={i}
            className={`particula particula--${tipo}`}
            style={{ left: `${x}%`, animationDelay: `-${retraso}s`, '--escala': 0.6 + ((i * 7) % 5) / 8 }}
          />
        ))}
      </div>
    </div>
  );
  // El de la página va en <body> (la página anima su entrada con transform y
  // eso rompería position: fixed); el de una tarjeta, dentro de ella.
  return dentro ? mundo : createPortal(mundo, document.body);
}

export default MundoTema;
