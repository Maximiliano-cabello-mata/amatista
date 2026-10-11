// Título de sección (v4.0 · Facetas): antetítulo mono con un rombo neón, h2 y una acción opcional.
function TituloSeccion({ id, antetitulo, titulo, descripcion, accion, className = '' }) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-x-4 gap-y-2 ${className}`}>
      <div className="min-w-0">
        {antetitulo && <p className="titulo-seccion__ante font-mono text-[11px] uppercase tracking-[0.3em] text-neon">{antetitulo}</p>}
        <h2 id={id} className="mt-1.5 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
          {titulo}
        </h2>
        {descripcion && <p className="mt-1 max-w-3xl text-texto/75">{descripcion}</p>}
      </div>
      {accion}
    </div>
  );
}

export default TituloSeccion;
