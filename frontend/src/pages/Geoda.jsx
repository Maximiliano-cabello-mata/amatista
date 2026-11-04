// Geoda (#/geoda): reconoce el equipo, recomienda la versión de Blender y los ajustes, adapta la propia
// plataforma y entrega un script para Blender que se deshace corriéndolo otra vez. Proyecto hermano de
// Amatista (el cerebro vive en amatista-g7b-etl › geoda/); aquí corre la parte del cliente (src/geoda).
import { useEffect, useMemo, useState } from 'react';
import Pagina from '../components/estructura/Pagina';
import TituloSeccion from '../components/estructura/TituloSeccion';
import { aplicarGeoda, deshacerGeoda, EVENTO_GEODA, leerGeoda } from '../geoda/ajustes';
import { detectarHuella } from '../geoda/huella';
import { NIVELES } from '../geoda/niveles';
import { decidir, scriptBlender } from '../geoda/plan';
import { rutas } from '../rutas';

const DESCRIPCION_NIVEL = {
  N0: 'Celular, tableta o Chromebook',
  N1: 'Equipo modesto: sin OpenGL 4.3 o menos de 8 GB',
  N2: 'Gráfica integrada capaz, de 8 a 16 GB',
  N3: 'Gráfica dedicada de 4 a 8 GB',
  N4: 'Gráfica dedicada de 12 GB o más',
};
const CONFIANZA = { alta: 'Confianza alta', media: 'Confianza media', baja: 'Confianza baja: corrígelo si no es tu equipo' };

function descargar(nombre, texto) {
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(new Blob([texto], { type: 'text/x-python' }));
  enlace.download = nombre;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
}

function Dato({ etiqueta, valor }) {
  return (
    <div className="corte-poly-sm border border-white/10 bg-base/60 px-4 py-3">
      <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-texto/55">{etiqueta}</dt>
      <dd className="mt-1 truncate font-semibold text-white" title={valor}>{valor || '—'}</dd>
    </div>
  );
}

export default function Geoda() {
  const huella = useMemo(() => detectarHuella(), []);
  const [aplicado, setAplicado] = useState(() => leerGeoda());
  const [forzar, setForzar] = useState(() => leerGeoda()?.forzado ?? null);
  const [copiado, setCopiado] = useState(false);
  const plan = useMemo(() => decidir(huella, null, { forzar }), [huella, forzar]);
  const { nivel, confianza, motivos } = plan.clasificacion;

  useEffect(() => {
    const actualizar = () => setAplicado(leerGeoda());
    window.addEventListener(EVENTO_GEODA, actualizar);
    return () => window.removeEventListener(EVENTO_GEODA, actualizar);
  }, []);

  const ajustar = () => {
    const ajuste = aplicarGeoda(plan);
    if (forzar) localStorage.setItem('amatista:geoda', JSON.stringify({ ...ajuste, forzado: forzar }));
    setAplicado(leerGeoda());
  };
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(scriptBlender(plan));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <Pagina
      ancho="contenido"
      migas={[{ texto: 'Cursos', href: rutas.inicio }, { texto: 'Geoda' }]}
      encabezado={{
        antetitulo: 'Geoda · proyecto hermano',
        titulo: 'Ajusta Amatista y Blender a tu equipo',
        descripcion: 'Geoda reconoce tu computadora y te dice qué versión de Blender y qué ajustes te van a funcionar fluido. Todo se puede deshacer.',
      }}
    >
      <section aria-labelledby="geoda-equipo" className="mt-8">
        <TituloSeccion id="geoda-equipo" antetitulo="1 · Tu equipo" titulo={`Nivel ${nivel}: ${DESCRIPCION_NIVEL[nivel]}`} descripcion={CONFIANZA[confianza]} />
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Dato etiqueta="Sistema" valor={huella.so} />
          <Dato etiqueta="Gráfica" valor={huella.gpu.nombre} />
          <Dato etiqueta="Memoria" valor={huella.ramGb ? `${huella.ramGb}${huella.ramGb >= 8 ? '+' : ''} GB` : 'El navegador no la informa'} />
          <Dato etiqueta="Núcleos" valor={huella.nucleos ? String(huella.nucleos) : ''} />
        </dl>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-texto/80">
          {motivos.map((m) => <li key={m}>{m}</li>)}
        </ul>
        <fieldset className="mt-5">
          <legend className="text-sm text-texto/75">¿No es tu equipo? Elígelo:</legend>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Nivel de tu equipo">
            {NIVELES.map((n) => (
              <button key={n} type="button" role="radio" aria-checked={nivel === n} title={DESCRIPCION_NIVEL[n]}
                onClick={() => setForzar(n === plan.clasificacion.nivel && !forzar ? null : n)}
                className={`corte-poly-sm border px-4 py-2 font-mono text-sm ${nivel === n ? 'border-neon bg-neon/15 text-neon' : 'border-white/15 text-texto hover:border-white/40'}`}>
                {n}
              </button>
            ))}
            {forzar && <button type="button" onClick={() => setForzar(null)} className="px-3 py-2 text-sm text-texto/70 underline">Volver a detectar</button>}
          </div>
        </fieldset>
      </section>

      <section aria-labelledby="geoda-plan" className="mt-10">
        <TituloSeccion id="geoda-plan" antetitulo="2 · Lo que Geoda recomienda" titulo={plan.donde === 'editor_web' ? 'Aprende en el navegador' : `Blender ${plan.perfil.version} · perfil ${plan.perfil.perfil}`} descripcion={plan.explicacion} />
        {plan.acciones.length > 0 && (
          <div className="corte-poly mt-4 overflow-x-auto border border-white/10 bg-superficie/90">
            <table className="w-full text-left text-sm">
              <thead className="font-mono text-[11px] uppercase tracking-[0.2em] text-texto/55">
                <tr><th className="px-4 py-3">Ajuste de Blender</th><th className="px-4 py-3">Valor</th><th className="px-4 py-3">Para qué</th></tr>
              </thead>
              <tbody>
                {plan.acciones.map((a) => (
                  <tr key={a.ruta} className="border-t border-white/5">
                    <td className="px-4 py-2 font-mono text-[13px] text-amatista-claro">{a.ruta}</td>
                    <td className="px-4 py-2 font-mono text-neon">{a.posibles ? a.posibles[0] : String(a.valor)}</td>
                    <td className="px-4 py-2 text-texto/80">{a.por}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-sm text-texto/70">
          Para la plataforma: {plan.amatista.ligero ? 'modo ligero (sin animaciones continuas ni fondo facetado)' : 'experiencia completa'} y texturas de la biblioteca en {plan.amatista.texturas === '512' ? '512 px' : '1K'}.
        </p>
      </section>

      <section aria-labelledby="geoda-botones" className="mt-10">
        <TituloSeccion id="geoda-botones" antetitulo="3 · Aplícalo" titulo="Un clic, y se deshace igual" />
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={ajustar} className="boton boton--grande">Ajustar Amatista a mi equipo</button>
          <button type="button" onClick={() => deshacerGeoda()} disabled={!aplicado} className="boton boton--grande boton--secundario disabled:opacity-40">Deshacer</button>
          {plan.acciones.length > 0 && (
            <>
              <button type="button" onClick={() => descargar(`geoda_${nivel.toLowerCase()}_${plan.perfil.perfil}.py`, scriptBlender(plan))} className="boton boton--grande boton--secundario">Descargar script para Blender</button>
              <button type="button" onClick={copiar} className="boton boton--grande boton--secundario">{copiado ? '¡Copiado!' : 'Copiar script'}</button>
            </>
          )}
          <a href={rutas.biblioteca} className="boton boton--grande boton--secundario">Recursos para tu equipo ▸</a>
        </div>
        <p role="status" className="mt-3 text-sm text-texto/75">
          {aplicado ? `Amatista está ajustada a ${aplicado.nivel} desde ${new Date(aplicado.aplicadoEn).toLocaleString()}.` : 'Amatista usa sus ajustes automáticos.'}
        </p>
        {plan.acciones.length > 0 && (
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-texto/80">
            <li>Abre Blender {plan.perfil.version} y tu práctica.</li>
            <li>Ve a <b>Scripting › Abrir</b>, elige el script de Geoda y pulsa <b>Ejecutar</b>.</li>
            <li>¿No te gusta? Ejecútalo otra vez: Geoda guarda los valores anteriores en la escena y los restaura.</li>
          </ol>
        )}
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-texto/45">Geoda · en desarrollo: las recomendaciones usan las reglas base hasta que lleguen las mediciones de G7B.</p>
      </section>
    </Pagina>
  );
}
