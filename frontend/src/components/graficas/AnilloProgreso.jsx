import { COLORES } from './colores';
import { limitar } from './escalas';

// Contorno de un polígono regular con un vértice arriba, recorrido en el
// sentido del reloj (el anillo se llena desde arriba).
function contorno(centro, radio, lados) {
  const puntos = Array.from({ length: lados }, (_, i) => {
    const angulo = (-90 + (360 / lados) * i) * (Math.PI / 180);
    return `${(centro + radio * Math.cos(angulo)).toFixed(2)} ${(centro + radio * Math.sin(angulo)).toFixed(2)}`;
  });
  return `M ${puntos.join(' L ')} Z`;
}

// Anillo de progreso (medidor de una sola razón). Por defecto es un hexágono,
// como los marcos de la identidad low poly; forma="circulo" lo hace redondo.
// La pista es un paso oscuro del mismo tono que el relleno.
// Accesible como progressbar: `etiqueta` lo nombra y `textoValor` lo lee en
// palabras (p. ej. "120 de 400 XP"). `children` se muestra al centro.
function AnilloProgreso({
  valor = 0,
  tamano = 96,
  grosor = 8,
  forma = 'hexagono',
  color = COLORES.amatista,
  pista = COLORES.amatistaOscuro,
  etiqueta,
  textoValor,
  className = '',
  children,
}) {
  const avance = limitar(Number(valor) || 0, 0, 1);
  const centro = tamano / 2;
  const radio = (tamano - grosor) / 2;
  const trazo = { fill: 'none', strokeWidth: grosor, strokeLinejoin: forma === 'circulo' ? 'round' : 'miter' };
  const figura =
    forma === 'circulo'
      ? (props) => <circle cx={centro} cy={centro} r={radio} transform={`rotate(-90 ${centro} ${centro})`} {...props} />
      : (props) => <path d={contorno(centro, radio, 6)} {...props} />;

  // Los hijos de un progressbar son "presentacionales" para los lectores de
  // pantalla: por eso el centro va como hermano del medidor, no dentro.
  return (
    <div className={`relative inline-grid shrink-0 place-items-center ${className}`} style={{ width: tamano, height: tamano }}>
      <div
        className="absolute inset-0"
        role="progressbar"
        aria-label={etiqueta}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(avance * 100)}
        aria-valuetext={textoValor ?? `${Math.round(avance * 100)} %`}
      >
        <svg width={tamano} height={tamano} viewBox={`0 0 ${tamano} ${tamano}`} aria-hidden="true">
          {figura({ ...trazo, stroke: pista, pathLength: 100 })}
          {avance > 0 &&
            figura({
              ...trazo,
              stroke: color,
              pathLength: 100,
              // Completo se dibuja sin guiones: así el vértice de arriba cierra sin muesca.
              strokeDasharray: avance < 1 ? `${(avance * 100).toFixed(2)} 100` : undefined,
              className: 'transition-[stroke-dasharray] duration-700 ease-out',
            })}
        </svg>
      </div>
      {children && <div className="relative grid place-items-center text-center">{children}</div>}
    </div>
  );
}

export default AnilloProgreso;
