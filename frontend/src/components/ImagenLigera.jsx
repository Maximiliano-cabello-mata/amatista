import { useCallback, useState } from 'react';

// Imagen pensada para redes malas (v3.6). Guarda su espacio desde el inicio
// (la página no salta al llegar la imagen), muestra un relleno facetado
// mientras carga, aparece con un fundido y, si falla (sin conexión y sin
// copia guardada), lo dice y ofrece reintentar. Con «Ahorro de datos» activo
// no descarga nada hasta que el alumno la pide.
const conAhorro = () => typeof navigator !== 'undefined' && navigator.connection?.saveData === true;

function Imagen({ src, alt, ancho, alto, prioridad = false, className = '', imgClassName = '' }) {
  const [estado, setEstado] = useState(() => (!prioridad && conAhorro() ? 'esperando' : 'cargando'));
  const [intento, setIntento] = useState(0);
  // Una imagen ya guardada puede terminar de cargar antes de que React escuche.
  const revisar = useCallback((img) => {
    if (img?.complete && img.naturalWidth > 0) setEstado('lista');
  }, []);

  return (
    <span
      className={`imagen-ligera ${className}`}
      data-estado={estado}
      style={ancho && alto ? { aspectRatio: `${ancho} / ${alto}` } : undefined}
    >
      {estado === 'esperando' ? (
        <button type="button" className="imagen-ligera__pedir" onClick={() => setEstado('cargando')}>
          <span aria-hidden="true">▣</span> Ver imagen
          <span className="sr-only">: {alt}</span>
          <small>Ahorro de datos activo</small>
        </button>
      ) : (
        <img
          key={intento}
          ref={revisar}
          src={src}
          alt={alt}
          width={ancho}
          height={alto}
          loading={prioridad ? 'eager' : 'lazy'}
          fetchPriority={prioridad ? 'high' : undefined}
          decoding="async"
          className={imgClassName}
          onLoad={() => setEstado('lista')}
          onError={() => setEstado('error')}
        />
      )}
      {estado === 'error' && (
        <span className="imagen-ligera__error" role="status">
          <span>No se pudo cargar la imagen{typeof navigator !== 'undefined' && navigator.onLine === false ? ' sin conexión' : ''}.</span>
          <button
            type="button"
            onClick={() => {
              setIntento((i) => i + 1);
              setEstado('cargando');
            }}
          >
            Reintentar
          </button>
        </span>
      )}
    </span>
  );
}

// Una imagen nueva (otro src) empieza de cero.
function ImagenLigera(props) {
  return <Imagen key={props.src} {...props} />;
}

export default ImagenLigera;
