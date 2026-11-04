// «Conoce a Goliat» (Ayuda): quién es, qué hace y sus caras. Goliat es el
// perro de verdad de Maximiliano, el creador de Amatista; aquí queda su
// retrato low poly y el botón para hablar con él.
import { abrirGoliat } from './eventos';
import GoliatFigura from './GoliatFigura';

const CARAS = [
  { gesto: 'gruñon', texto: 'Gruñón de fábrica' },
  { gesto: 'atento', texto: 'Atento' },
  { gesto: 'contento', texto: 'Contento' },
  { gesto: 'preocupado', texto: 'Preocupado por ti' },
  { gesto: 'dormido', texto: 'Echado' },
];

const HACE = [
  'Te dice dónde te quedaste y te lleva directo.',
  'Te propone un proyecto propio a tu medida y lo saca contigo paso a paso.',
  'Responde lo básico: atajos de Blender, tu avance, conectar el add-on.',
  'Si una práctica se pone difícil, se acerca antes de que te frustres.',
];

function ConoceGoliat() {
  return (
    <section className="borde-gema corte-poly mt-12" aria-labelledby="conoce-goliat">
      <div className="corte-poly grid gap-6 bg-superficie p-6 sm:grid-cols-[13rem_1fr] sm:items-center sm:p-8">
        <GoliatFigura gesto="gruñon" className="goliat-retrato mx-auto" titulo="Goliat en low poly: perro negro de pelo rizado con canas, una oreja parada, pañoleta azul y placa de hueso" />
        <div className="min-w-0">
          <p className="titulo-seccion__ante font-mono text-[11px] uppercase tracking-[0.3em] text-neon">Tu compañero</p>
          <h2 id="conoce-goliat" className="mt-1.5 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
            Conoce a Goliat
          </h2>
          <p className="mt-3 leading-relaxed text-texto/85">
            Goliat es un perro de verdad: el de Maximiliano, quien creó Amatista. Gruñe mucho y no se despega de nadie, así que lo
            trajimos en low poly, con su oreja doblada, su pañoleta azul y su placa de hueso, para acompañarte en toda la plataforma.
            Lo encuentras abajo a la izquierda, en cada página.
          </p>
          <ul className="mt-4 grid gap-1.5 text-sm text-texto/80">
            {HACE.map((texto) => (
              <li key={texto} className="flex gap-2">
                <span className="text-neon" aria-hidden="true">
                  ◆
                </span>
                {texto}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => abrirGoliat('saludo')} className="boton boton--grande mt-5 bg-[#2b5bd0] text-white hover:brightness-110">
            Hablar con Goliat ▸
          </button>
        </div>
      </div>
      <ul className="corte-poly grid grid-cols-5 gap-2 border-t border-white/10 bg-base/80 px-4 py-4" aria-label="Las caras de Goliat">
        {CARAS.map((cara) => (
          <li key={cara.gesto} className="text-center">
            <GoliatFigura gesto={cara.gesto} className="mx-auto h-16 w-16 sm:h-20 sm:w-20" />
            <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-white/60">{cara.texto}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ConoceGoliat;
