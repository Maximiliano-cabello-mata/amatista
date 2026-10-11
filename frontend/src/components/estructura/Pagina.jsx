// La anatomía común de las páginas (v4.0 · Facetas, docs/diseno/2026-10-11_sistema_facetas.md):
// <main> con el ancho de su tipo, las migas y el encabezado. El contenido va en `children`.
// `encabezado` son las props de EncabezadoPagina (o null para páginas con encabezado propio).
import EncabezadoPagina from './EncabezadoPagina';
import Migas from './Migas';

const ANCHOS = {
  estrecho: 'max-w-md',
  lectura: 'max-w-3xl',
  contenido: 'max-w-5xl',
  amplio: 'max-w-6xl',
  admin: 'max-w-7xl',
};

function Pagina({ ancho = 'contenido', migas, encabezado, children, className = '' }) {
  return (
    <main className={`mx-auto w-full ${ANCHOS[ancho] ?? ANCHOS.contenido} px-4 pb-20 pt-6 sm:px-6 sm:pt-8 ${className}`}>
      {migas && <Migas items={migas} className="mb-5" />}
      {encabezado && <EncabezadoPagina {...encabezado} />}
      {children}
    </main>
  );
}

export default Pagina;
