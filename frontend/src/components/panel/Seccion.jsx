// Tarjeta de una sección del panel: etiqueta tipo HUD, título y una acción opcional a la derecha.
function Seccion({ id, etiqueta, titulo, accion, children, className = '' }) {
  return (
    <section aria-labelledby={id} className={`corte-poly animar-entrar min-w-0 border border-white/10 bg-superficie/95 p-5 sm:p-6 ${className}`}>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          {etiqueta && <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon">{etiqueta}</p>}
          <h2 id={id} className="text-xl font-extrabold text-white sm:text-2xl">
            {titulo}
          </h2>
        </div>
        {accion}
      </header>
      {children}
    </section>
  );
}

// Cifra destacada (tarjeta de dato): etiqueta, valor grande y un detalle opcional.
export function Cifra({ etiqueta, valor, unidad, detalle, Icono, tono = 'text-amatista-claro', compacta = false, className = '' }) {
  return (
    <div className={`corte-poly-sm min-w-0 border border-white/10 bg-base/60 ${compacta ? 'px-3 py-2.5' : 'px-4 py-3'} ${className}`}>
      <dt className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/50">
        {Icono && <Icono className={`h-3.5 w-3.5 ${tono}`} />}
        {etiqueta}
      </dt>
      <dd className="mt-1">
        <span className="text-3xl font-extrabold leading-none text-white">{valor}</span>
        {unidad && <span className="ml-1.5 text-sm font-semibold text-white/60">{unidad}</span>}
        {detalle && <span className="mt-1.5 block text-xs leading-snug text-white/50">{detalle}</span>}
      </dd>
    </div>
  );
}

export default Seccion;
