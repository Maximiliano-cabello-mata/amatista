// Biblioteca de recursos (#/biblioteca): texturas PBR, modelos y animaciones libres (CC0) para Blender y A-Frame.
// El catálogo (public/biblioteca/catalogo.json) lo genera herramientas/biblioteca/generar.py. Nada se descarga
// hasta que se abre: cada recurso visto queda guardado por el service worker y sirve sin conexión.
// Geoda decide la resolución de las texturas que conviene a tu equipo (512 px o 1K).
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import Pagina from '../components/estructura/Pagina';
import TituloSeccion from '../components/estructura/TituloSeccion';
import { leerGeoda } from '../geoda/ajustes';
import { rutas } from '../rutas';

const Visor3D = lazy(() => import('../components/biblioteca/Visor3D'));
const BASE = '/biblioteca/';
const TIPOS = [
  { id: 'todo', texto: 'Todo' },
  { id: 'textura', texto: 'Texturas' },
  { id: 'modelo', texto: 'Modelos' },
  { id: 'animacion', texto: 'Animaciones' },
];
const NOMBRE_TIPO = { textura: 'Textura', modelo: 'Modelo 3D', animacion: 'Animación' };

function tamano(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function Descarga({ ruta, texto }) {
  return (
    <a href={BASE + ruta} download className="boton boton--secundario">{texto}</a>
  );
}

function Detalle({ recurso, resolucion, alCerrar }) {
  const [copiado, setCopiado] = useState(false);
  const fragmento = recurso.archivo ? `<a-entity gltf-model="url(${location.origin}${BASE}${recurso.archivo.ruta})"></a-entity>` : '';
  return (
    <section aria-labelledby="detalle-recurso" className="corte-poly mt-6 border border-neon/30 bg-superficie p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon">{NOMBRE_TIPO[recurso.tipo]} · {recurso.categoria}</p>
          <h2 id="detalle-recurso" className="mt-1 text-2xl font-extrabold text-white">{recurso.nombre}</h2>
        </div>
        <button type="button" onClick={alCerrar} className="boton boton--secundario">Cerrar ✕</button>
      </div>
      {recurso.tipo === 'textura' ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {recurso.mapas.map((mapa) => (
              <figure key={mapa}>
                <img src={BASE + recurso.resoluciones['512'][mapa].ruta} alt={`${recurso.nombre}: mapa de ${mapa}`} loading="lazy" className="aspect-square w-full object-cover" />
                <figcaption className="mt-1 font-mono text-xs text-texto/70">{mapa}</figcaption>
              </figure>
            ))}
          </div>
          {Object.entries(recurso.resoluciones).map(([res, mapas]) => (
            <div key={res} className="mt-4 flex flex-wrap items-center gap-2">
              <span className={`font-mono text-sm ${res === resolucion ? 'text-neon' : 'text-texto/70'}`}>{res === '512' ? '512 px' : res.toUpperCase()}{res === resolucion ? ' · recomendada para tu equipo' : ''}</span>
              {Object.entries(mapas).map(([mapa, archivo]) => <Descarga key={mapa} ruta={archivo.ruta} texto={`${mapa} (${tamano(archivo.bytes)})`} />)}
            </div>
          ))}
          <p className="mt-4 text-sm text-texto/75">En Blender: Material › Principled BSDF › conecta <b>color</b> a Base Color, <b>rugosidad</b> a Roughness (No-Color) y <b>normal</b> a un nodo Normal Map. Se repite sin costuras.</p>
        </>
      ) : (
        <>
          <div className="mt-4 border border-white/10">
            <Suspense fallback={<div className="esqueleto h-72 sm:h-96" />}>
              <Visor3D url={BASE + recurso.archivo.ruta} nombre={recurso.nombre} />
            </Suspense>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Descarga ruta={recurso.archivo.ruta} texto={`Descargar .glb (${tamano(recurso.archivo.bytes)})`} />
            <button type="button" className="boton boton--secundario" onClick={() => navigator.clipboard?.writeText(fragmento).then(() => setCopiado(true))}>
              {copiado ? '¡Copiado!' : 'Copiar para A-Frame'}
            </button>
            <span className="text-sm text-texto/70">{recurso.tipo === 'animacion' ? `${recurso.duracion.toFixed(1)} s en bucle · ${recurso.pistas} pistas` : `${recurso.triangulos} triángulos`}</span>
          </div>
          <p className="mt-4 text-sm text-texto/75">En Blender: Archivo › Importar › glTF 2.0 (.glb). {recurso.tipo === 'animacion' ? 'La animación queda en la línea de tiempo: pulsa Espacio para reproducirla.' : 'Es low poly: corre fluido en cualquier equipo.'}</p>
        </>
      )}
    </section>
  );
}

export default function Biblioteca() {
  const [catalogo, setCatalogo] = useState(null);
  const [error, setError] = useState(false);
  const [tipo, setTipo] = useState('todo');
  const [busqueda, setBusqueda] = useState('');
  const [abierto, setAbierto] = useState(null);
  const resolucion = leerGeoda()?.texturas ?? (document.documentElement.classList.contains('ligero') ? '512' : '1k');

  useEffect(() => {
    let vivo = true;
    fetch(`${BASE}catalogo.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((datos) => vivo && setCatalogo(datos))
      .catch(() => vivo && setError(true));
    return () => { vivo = false; };
  }, []);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return (catalogo?.recursos ?? []).filter((r) => (tipo === 'todo' || r.tipo === tipo)
      && (!texto || `${r.nombre} ${r.categoria}`.toLowerCase().includes(texto)));
  }, [catalogo, tipo, busqueda]);
  const seleccionado = catalogo?.recursos.find((r) => r.id === abierto && (r.tipo === abierto.split(':')[0] || true)) ?? null;

  return (
    <Pagina
      ancho="amplio"
      migas={[{ texto: 'Cursos', href: rutas.inicio }, { texto: 'Biblioteca' }]}
      encabezado={{
        antetitulo: 'Biblioteca de recursos',
        titulo: 'Texturas, modelos y animaciones libres',
        descripcion: 'Todo es CC0: úsalo en tus prácticas, en Blender o en tus mundos de A-Frame, sin pedir permiso. Lo que abres queda guardado para usarlo sin conexión.',
      }}
    >
      {error && <p role="alert" className="mt-6 text-amber-300">No pude abrir el catálogo. Si estás sin conexión, abre la biblioteca una vez con internet y quedará guardada.</p>}
      {catalogo && (
        <>
          <p className="mt-6 text-sm text-texto/75">
            {catalogo.totales.texturas} texturas · {catalogo.totales.modelos} modelos · {catalogo.totales.animaciones} animaciones · {tamano(catalogo.totales.bytes)} en total.
            {' '}Texturas recomendadas para tu equipo: <b className="text-neon">{resolucion === '512' ? '512 px' : '1K'}</b> (<a href={rutas.geoda} className="underline hover:text-neon">ajústalo con Geoda</a>).
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2" role="tablist" aria-label="Tipo de recurso">
            {TIPOS.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={tipo === t.id} onClick={() => setTipo(t.id)}
                className={`corte-poly-sm border px-4 py-2 text-sm ${tipo === t.id ? 'border-neon bg-neon/15 text-neon' : 'border-white/15 hover:border-white/40'}`}>
                {t.texto}
              </button>
            ))}
            <label className="ml-auto flex items-center gap-2 text-sm">
              <span className="sr-only">Buscar</span>
              <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar: madera, robot, órbita…"
                className="w-64 border border-white/15 bg-base px-3 py-2 text-white placeholder:text-texto/45" />
            </label>
          </div>
          {seleccionado && <Detalle recurso={seleccionado} resolucion={resolucion} alCerrar={() => setAbierto(null)} />}
          <TituloSeccion className="mt-8" antetitulo={`${visibles.length} recursos`} titulo={TIPOS.find((t) => t.id === tipo).texto} />
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {visibles.map((r) => (
              <li key={`${r.tipo}-${r.id}`}>
                <button type="button" onClick={() => { setAbierto(r.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="corte-poly-sm block w-full border border-white/10 bg-superficie/85 text-left transition-colors hover:border-neon/50">
                  <img src={BASE + r.vista} alt="" loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
                  <span className="block px-3 pt-2 font-semibold text-white">{r.nombre}</span>
                  <span className="block px-3 pb-3 font-mono text-[11px] uppercase tracking-wider text-texto/60">{NOMBRE_TIPO[r.tipo]} · {tamano(r.bytes)}</span>
                </button>
              </li>
            ))}
          </ul>
          <section aria-labelledby="mas-recursos" className="mt-12">
            <TituloSeccion id="mas-recursos" antetitulo="Más recursos libres" titulo="Cuando necesites más" descripcion="Bibliotecas abiertas con licencia CC0 que recomendamos. Revisa sus condiciones antes de usarlas en un proyecto comercial." />
            <ul className="mt-3 list-disc pl-5 text-sm text-texto/80">
              <li><a className="underline hover:text-neon" href="https://polyhaven.com/" target="_blank" rel="noreferrer">Poly Haven</a>: texturas, HDRI y modelos fotorrealistas (CC0).</li>
              <li><a className="underline hover:text-neon" href="https://ambientcg.com/" target="_blank" rel="noreferrer">ambientCG</a>: materiales PBR (CC0).</li>
            </ul>
          </section>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-texto/45">{catalogo.licencia.id} · {catalogo.licencia.autor} · biblioteca {catalogo.version}</p>
        </>
      )}
      {!catalogo && !error && <div className="esqueleto mt-8 h-64" />}
    </Pagina>
  );
}
