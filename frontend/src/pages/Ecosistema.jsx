// Todo Amatista (#/ecosistema): qué es cada pieza, para qué sirve y cómo se alimentan entre ellas.
import Pagina from '../components/estructura/Pagina';
import TituloSeccion from '../components/estructura/TituloSeccion';
import { rutas } from '../rutas';

const PIEZAS = [
  {
    id: 'cursos', nombre: 'Cursos', etiqueta: 'Aprender', href: rutas.inicio, boton: 'Ver los cursos', destacado: true,
    que: 'Lecciones cortas, en español, enfocadas en software libre (Blender y A-Frame) que se hacen en la misma página y funcionan sin internet.',
    para: 'Aprender 3D paso a paso y llevar tu avance en Mi panel desde cualquier equipo.',
  },
  {
    id: 'motor', nombre: 'Amatista Motor para Blender', etiqueta: 'Practicar', href: rutas.blender, boton: 'Conectar mi Blender',
    que: 'El complemento libre que vive dentro de Blender y revisa tus prácticas mientras las haces.',
    para: 'Que Blender te diga qué falta y celebre lo que ya está, sin salir del programa.',
  },
  {
    id: 'estudio', nombre: 'Estudio A-Frame', etiqueta: 'Crear para la web', href: rutas.estudio, boton: 'Abrir el Estudio',
    que: 'Un editor de mundos 3D abiertos para el navegador y la realidad virtual, con ejemplos listos.',
    para: 'Llevar lo que modelas a una página web que cualquiera abre con un enlace.',
  },
  {
    id: 'biblioteca', nombre: 'Biblioteca de recursos', etiqueta: 'Recursos libres', href: rutas.biblioteca, boton: 'Explorar la biblioteca',
    que: '45 texturas, 38 modelos y 19 animaciones con licencia CC0, con vista 3D y descarga en 512, 1K o 2K.',
    para: 'Tener materiales para tus prácticas sin buscar ni pedir permiso. Lo que abres queda guardado sin conexión.',
  },
  {
    id: 'geoda', nombre: 'Geoda', etiqueta: 'El kernel que adapta', href: rutas.geoda, boton: 'Ajustar a mi equipo',
    que: 'Reconoce tu ordenador (nivel N0 a N4) y elige la versión de Blender y los ajustes que le van fluidos.',
    para: 'Que aprender 3D no dependa de tener un ordenador caro. Todo lo que cambia se puede deshacer.',
  },
  {
    id: 'g7b', nombre: 'G7B', etiqueta: 'El motor de datos', href: 'https://github.com/Maximiliano-cabello-mata/amatista-g7b-etl', externo: true,
    boton: 'Ver G7B en GitHub',
    que: 'Mide cómo corre el 3D libre en equipos reales y reúne el conocimiento técnico (Geodar Radar).',
    para: 'Darle a Geoda evidencia: qué perfil es fluido en qué equipo. Solo recibe datos sin identificar.',
  },
];

function Pieza({ pieza }) {
  return (
    <article id={pieza.id} className={`corte-poly flex flex-col border p-6 ${pieza.destacado ? 'border-neon/50 bg-neon/5' : 'border-white/10 bg-superficie/90'}`}>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neon">{pieza.etiqueta}</p>
      <h3 className="mt-1 text-xl font-extrabold text-white">{pieza.nombre}</h3>
      <p className="mt-3 text-sm text-texto/85"><strong className="text-white">Qué es:</strong> {pieza.que}</p>
      <p className="mt-2 text-sm text-texto/85"><strong className="text-white">Para qué:</strong> {pieza.para}</p>
      <a href={pieza.href} {...(pieza.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className={`boton mt-5 self-start ${pieza.destacado ? '' : 'boton--secundario'}`}>
        {pieza.boton}
      </a>
    </article>
  );
}

export default function Ecosistema() {
  return (
    <Pagina
      ancho="contenido"
      migas={[{ texto: 'Cursos', href: rutas.inicio }, { texto: 'Todo Amatista' }]}
      encabezado={{
        antetitulo: 'Todo Amatista',
        titulo: 'Qué es cada cosa y cómo se conectan',
        descripcion: 'Amatista enseña 3D con software libre en el ordenador que cada quien tiene. Estas son sus piezas: lo que aprendes, con qué practicas y lo que trabaja por detrás para que funcione fluido.',
      }}
    >
      <section aria-labelledby="eco-ciclo" className="mt-8">
        <TituloSeccion id="eco-ciclo" antetitulo="El ciclo" titulo="Se alimentan entre ellas" />
        <ol className="mt-4 grid gap-3 text-sm text-texto/85 md:grid-cols-4">
          {[
            ['1', 'G7B mide', 'cómo corre Blender en equipos reales.'],
            ['2', 'Geoda decide', 'qué versión y qué ajustes le van a tu equipo.'],
            ['3', 'Amatista enseña', 'con cursos libres, el Estudio A-Frame y la biblioteca CC0.'],
            ['4', 'Amatista Motor guía', 'tus prácticas paso a paso dentro de tu propio Blender.'],
          ].map(([n, titulo, texto]) => (
            <li key={n} className="corte-poly-sm border border-white/10 bg-base/60 p-4">
              <span className="font-mono text-neon">{n}</span> <strong className="text-white">{titulo}</strong> {texto}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="eco-piezas" className="mt-10">
        <TituloSeccion id="eco-piezas" antetitulo="Las piezas" titulo="Todo lo que puedes usar hoy" />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {PIEZAS.map((p) => <Pieza key={p.id} pieza={p} />)}
        </div>
      </section>

      <section aria-labelledby="eco-escritorio" className="mt-10">
        <TituloSeccion id="eco-escritorio" antetitulo="También" titulo="Amatista para Windows, sin internet"
          descripcion="La misma plataforma con Geoda y la biblioteca, en una carpeta portátil (Amatista.exe, unos 300 MB) que se puede llevar en una USB al laboratorio." />
      </section>

      <section aria-labelledby="eco-propuesta" className="mt-10">
        <TituloSeccion
          id="eco-propuesta"
          antetitulo="Propuesta en evaluación · No en versión final"
          titulo="Propuesta futura: Sesiones efímeras en laboratorio (Amatista Cloud)"
        />
        <div className="corte-poly-sm mt-4 border border-dashed border-white/15 bg-base/40 p-5 text-sm leading-relaxed text-texto/75">
          <p>
            Como línea de investigación arquitectónica se diseñó una propuesta de nodos efímeros con contenedores aislados y KasmVNC para prestar sesiones remotas de Blender a equipos sin capacidad 3D (<code className="text-white/85">docs/propuestas/2026-11-05_propuesta_amatista_cloud.md</code>).
          </p>
          <p className="mt-2">
            En la versión final de la plataforma esta opción permanece retirada para priorizar una experiencia <strong className="text-white">100 % local, fluida y offline-first</strong> mediante <a href={rutas.geoda} className="text-neon hover:underline">Geoda</a> y <a href={rutas.blender} className="text-neon hover:underline">Amatista Motor</a>.
          </p>
        </div>
      </section>
    </Pagina>
  );
}
