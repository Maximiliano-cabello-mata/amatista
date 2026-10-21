// Markdown mínimo para las lecciones: títulos (###), párrafos, listas (-),
// **negritas**, *cursivas*, `código` y [enlaces](#/estudio) a páginas de la
// propia plataforma. Construye elementos de React: nunca inserta HTML, así
// que el contenido no puede ejecutar código. Solo se enlaza a hashes «#/…»:
// un enlace a otro sitio se muestra como texto.

const PATRON_EN_LINEA = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;
const PATRON_ENLACE = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

function analizar(texto) {
  const bloques = [];
  let parrafo = [];
  let lista = [];
  const cerrar = () => {
    if (parrafo.length) bloques.push({ tipo: 'p', texto: parrafo.join(' ') });
    if (lista.length) bloques.push({ tipo: 'ul', items: lista });
    parrafo = [];
    lista = [];
  };
  for (const linea of texto.split('\n')) {
    const limpia = linea.trim();
    const titulo = limpia.match(/^#{1,4}\s+(.*)$/);
    const item = limpia.match(/^[-*]\s+(.*)$/);
    if (!limpia) {
      cerrar();
    } else if (titulo) {
      cerrar();
      bloques.push({ tipo: 'h', texto: titulo[1] });
    } else if (item) {
      if (parrafo.length) cerrar();
      lista.push(item[1]);
    } else {
      if (lista.length) cerrar();
      parrafo.push(limpia);
    }
  }
  cerrar();
  return bloques;
}

export function TextoEnLinea({ texto }) {
  return texto.split(PATRON_EN_LINEA).map((parte, i) => {
    if (/^\*\*[^*]+\*\*$/.test(parte)) {
      return <strong key={i} className="font-semibold text-white">{parte.slice(2, -2)}</strong>;
    }
    if (/^`[^`]+`$/.test(parte)) {
      return (
        <code key={i} className="rounded-sm bg-black/40 px-1.5 py-0.5 font-mono text-[0.9em] text-neon">
          {parte.slice(1, -1)}
        </code>
      );
    }
    if (/^\*[^*]+\*$/.test(parte)) return <em key={i}>{parte.slice(1, -1)}</em>;
    const enlace = PATRON_ENLACE.exec(parte);
    if (enlace) {
      const [, texto, destino] = enlace;
      if (!destino.startsWith('#/')) return texto;
      return (
        <a key={i} href={destino} className="font-semibold text-neon underline decoration-neon/40 underline-offset-4 hover:decoration-neon">
          {texto}
        </a>
      );
    }
    return parte;
  });
}

function Markdown({ texto }) {
  return (
    <div className="space-y-4 text-lg leading-relaxed text-texto/85">
      {analizar(texto).map((bloque, i) => {
        if (bloque.tipo === 'h') {
          return (
            <h2 key={i} className="pt-2 text-2xl font-extrabold text-white">
              <TextoEnLinea texto={bloque.texto} />
            </h2>
          );
        }
        if (bloque.tipo === 'ul') {
          return (
            <ul key={i} className="space-y-2">
              {bloque.items.map((item, j) => (
                <li key={j} className="flex gap-3">
                  <span className="mt-2.5 h-2 w-2 shrink-0 rotate-45 bg-amatista" aria-hidden="true" />
                  <span><TextoEnLinea texto={item} /></span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            <TextoEnLinea texto={bloque.texto} />
          </p>
        );
      })}
    </div>
  );
}

export default Markdown;
