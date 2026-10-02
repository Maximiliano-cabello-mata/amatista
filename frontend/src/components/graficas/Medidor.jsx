import { COLORES } from './colores';
import { limitar } from './escalas';

// Barra horizontal de avance contra un máximo, con una marca opcional (por
// ejemplo, el puntaje mínimo para aprobar). Accesible como progressbar:
// `etiqueta` la nombra y `textoValor` la lee en palabras.
function Medidor({
  valor = 0,
  maximo = 100,
  marca = null,
  color = COLORES.amatista,
  etiqueta,
  textoValor,
  alto = 8,
  className = '',
}) {
  const tope = Math.max(1, Number(maximo) || 0);
  const numero = limitar(Number(valor) || 0, 0, tope);
  const porcentaje = (numero / tope) * 100;
  const posicionMarca = marca === null || marca === undefined ? null : limitar((Number(marca) / tope) * 100, 0, 100);

  return (
    <div
      className={`relative bg-white/10 ${className}`}
      style={{ height: alto }}
      role="progressbar"
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={tope}
      aria-valuenow={numero}
      aria-valuetext={textoValor}
    >
      <div
        className="h-full transition-[width] duration-500 ease-out"
        style={{ width: `${porcentaje}%`, backgroundColor: color }}
      />
      {posicionMarca !== null && (
        // La marca sobresale un poco de la barra para que se vea aun con la barra llena.
        <span
          className="absolute -bottom-1 -top-1 w-0.5 -translate-x-1/2 bg-white/80"
          style={{ left: `${posicionMarca}%` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default Medidor;
