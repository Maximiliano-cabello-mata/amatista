// Migas de pan: dónde estás dentro de la plataforma. `items` = [{texto, href?}]; el último es la
// página actual (sin enlace y con aria-current).
function Migas({ items, className = '' }) {
  if (!items?.length) return null;
  return (
    <nav aria-label="Estás en" className={`migas font-mono text-[11px] uppercase tracking-widest ${className}`}>
      <ol className="flex min-w-0 flex-wrap items-center gap-y-1">
        {items.map((item, i) => {
          const actual = i === items.length - 1;
          return (
            <li key={`${item.texto}-${i}`} className="flex min-w-0 max-w-full items-center">
              {actual || !item.href ? (
                <span aria-current={actual ? 'page' : undefined} className={`block truncate ${actual ? 'text-white/80' : 'text-white/45'}`}>
                  {item.texto}
                </span>
              ) : (
                <a href={item.href} className="text-white/45 transition-colors hover:text-neon">
                  {item.texto}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Migas;
