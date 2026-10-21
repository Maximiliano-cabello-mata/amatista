// #/estudio: el Estudio A-Frame. Un editor libre con la escena en vivo al lado,
// plantillas para empezar, piezas para insertar con un clic y la descarga de la
// página completa. Es la herramienta de práctica de A-Frame (como Amatista Motor
// lo es de Blender): se abre desde Explorar y desde las lecciones del curso.
// El código nunca se ejecuta: la vista copia solo las etiquetas <a-…> (VistaAFrame).
import { useEffect, useId, useRef, useState } from 'react';
import Pagina from '../components/estructura/Pagina';
import TituloSeccion from '../components/estructura/TituloSeccion';
import { useModuloDiferido } from '../components/leccion/interactivos/hooks';
import { webglDisponible } from '../components/leccion/interactivos/logica';
import LogoCurso from '../components/LogoCurso';
import { CLAVE_ESTUDIO, codigoGuardado, insertarPieza, MAX_CODIGO, paginaCompleta, PIEZAS, PLANTILLAS } from '../estudio/plantillas';
import { rutas } from '../rutas';

const cargarVista = () => import('../components/leccion/VistaAFrame');
const PAUSA_VISTA = 600;
const BOTON = 'corte-poly-sm px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors';

function leerGuardado() {
  try {
    return codigoGuardado(window.localStorage.getItem(CLAVE_ESTUDIO));
  } catch {
    return null;
  }
}

function guardar(codigo) {
  try {
    window.localStorage.setItem(CLAVE_ESTUDIO, codigo);
  } catch {
    // Sin almacenamiento (ventana privada): el estudio funciona igual, solo no recuerda.
  }
}

function descargar(codigo) {
  const blob = new Blob([paginaCompleta(codigo)], { type: 'text/html' });
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = 'mi-escena-aframe.html';
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
}

const CONSEJOS = [
  ['Moverte', 'Arrastra la vista para mirar alrededor y usa W A S D (o las flechas) para caminar.'],
  ['Coordenadas', 'X va a la derecha, Y hacia arriba y Z hacia ti: una Z negativa aleja el objeto.'],
  ['Unidades', 'Todo se mide en metros. La cámara está a 1.6 m del suelo, la altura de los ojos.'],
  ['Modelos y texto', 'Los modelos de /modelos/ (cristal, árbol y casa) funcionan sin conexión. El texto (<a-text>) descarga su letra de Internet: sin conexión no aparece.'],
];

function Estudio() {
  const idEditor = useId();
  const editor = useRef(null);
  const [codigo, setCodigo] = useState(() => leerGuardado() ?? PLANTILLAS[0].codigo);
  const [ejecucion, setEjecucion] = useState(() => ({ codigo, numero: 1 }));
  const [con3D] = useState(() => webglDisponible());
  const [aviso, setAviso] = useState('');
  const { Componente: VistaAFrame, error } = useModuloDiferido(cargarVista, con3D);

  // La vista se redibuja cuando dejas de escribir; lo escrito se guarda en este navegador.
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setEjecucion((previa) => (previa.codigo === codigo ? previa : { codigo, numero: previa.numero + 1 }));
      guardar(codigo);
    }, PAUSA_VISTA);
    return () => clearTimeout(temporizador);
  }, [codigo]);

  const usarPlantilla = (plantilla) => {
    setCodigo(plantilla.codigo);
    setAviso(`Plantilla «${plantilla.nombre}» cargada.`);
  };

  const insertar = (pieza) => {
    const campo = editor.current;
    const enfocado = campo && document.activeElement === campo;
    const resultado = insertarPieza(codigo, pieza.codigo, enfocado ? campo.selectionStart : null);
    setCodigo(resultado.codigo.slice(0, MAX_CODIGO));
    setAviso(`${pieza.nombre} insertada.`);
    requestAnimationFrame(() => {
      campo?.focus();
      campo?.setSelectionRange(resultado.cursor, resultado.cursor);
    });
  };

  return (
    <Pagina
      ancho="admin"
      migas={[
        { texto: 'Inicio', href: rutas.inicio },
        { texto: 'Explorar', href: rutas.explorar },
        { texto: 'A-Frame', href: rutas.curso('aframe') },
        { texto: 'Estudio' },
      ]}
      encabezado={{
        tono: 'neon',
        icono: <LogoCurso logo="aframe" className="animar-flotar h-12 w-12" />,
        antetitulo: 'Herramienta de A-Frame',
        titulo: 'Estudio A-Frame',
        descripcion:
          'Escribe una escena y mírala al instante. Empieza con una plantilla, inserta piezas con un clic y, cuando te guste, descárgala como página web. Lo que escribes se guarda en este navegador.',
      }}
    >
      <section className="mt-6" aria-labelledby="estudio-plantillas">
        <h2 id="estudio-plantillas" className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon">
          Empieza con una plantilla
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {PLANTILLAS.map((plantilla) => (
            <li key={plantilla.id}>
              <button
                type="button"
                onClick={() => usarPlantilla(plantilla)}
                className="corte-poly-sm elevar flex h-full w-full flex-col items-start border border-white/10 bg-superficie/90 p-3 text-left hover:border-neon"
              >
                <span className="font-bold text-white">{plantilla.nombre}</span>
                <span className="mt-1 text-xs leading-snug text-texto/65">{plantilla.texto}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
        <div className="corte-poly flex flex-col overflow-hidden border border-white/10 bg-[#0d0b12]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/40 px-4 py-2">
            <label htmlFor={idEditor} className="font-mono text-xs uppercase tracking-widest text-white/50">
              html · tu escena
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => descargar(codigo)} className={`${BOTON} bg-neon text-base hover:brightness-110`}>
                ⬇ Descargar página
              </button>
            </div>
          </div>
          <textarea
            ref={editor}
            id={idEditor}
            value={codigo}
            maxLength={MAX_CODIGO}
            onChange={(evento) => setCodigo(evento.target.value)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            wrap="off"
            className="block min-h-[22rem] w-full flex-1 resize-y bg-transparent p-4 font-mono text-sm leading-relaxed text-texto focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neon/60"
          />
          <div className="border-t border-white/10 bg-black/30 px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/45">Insertar en el cursor</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Piezas para insertar">
              {PIEZAS.map((pieza) => (
                <button key={pieza.id} type="button" onClick={() => insertar(pieza)} className={`${BOTON} bg-white/5 text-white/75 hover:bg-white/10`}>
                  + {pieza.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          {!con3D || error ? (
            <p className="corte-poly grid aspect-video place-items-center bg-black p-6 text-center font-mono text-xs text-white/60">
              {con3D
                ? 'No se pudo cargar el motor 3D. Revisa tu conexión e inténtalo de nuevo.'
                : 'Tu dispositivo no puede mostrar escenas 3D (WebGL). Puedes escribir y descargar la escena igual.'}
            </p>
          ) : VistaAFrame ? (
            <VistaAFrame ejecucion={ejecucion} />
          ) : (
            <p className="animar-pulso corte-poly grid aspect-video place-items-center bg-black font-mono text-xs uppercase tracking-widest text-white/50">
              Cargando motor 3D…
            </p>
          )}
          <p className="mt-2 font-mono text-[11px] text-white/45" aria-live="polite">
            {aviso || 'La escena se actualiza sola al dejar de escribir.'}
          </p>
          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            {CONSEJOS.map(([titulo, texto]) => (
              <div key={titulo} className="corte-poly-sm border border-white/10 bg-superficie/80 p-3">
                <dt className="font-mono text-[10px] font-bold uppercase tracking-widest text-neon">{titulo}</dt>
                <dd className="mt-1 text-sm leading-snug text-texto/75">{texto}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section className="mt-12" aria-labelledby="estudio-aprender">
        <TituloSeccion
          id="estudio-aprender"
          antetitulo="¿Por dónde sigo?"
          titulo="Aprende lo que estás usando"
          descripcion="Cada pieza del estudio tiene su lección en el curso de A-Frame, con retos que se revisan solos."
          accion={
            <a href={rutas.curso('aframe')} className="corte-poly-sm bg-white/5 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-white/80 hover:bg-white/10">
              Ver el curso de A-Frame ▸
            </a>
          }
        />
      </section>
    </Pagina>
  );
}

export default Estudio;
