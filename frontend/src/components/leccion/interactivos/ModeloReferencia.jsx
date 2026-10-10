import ImagenLigera from '../../ImagenLigera';
import { useState } from 'react';
import { referenciaDe, textoMedidas } from '../../../blender/referencias';

// «Así se debe ver»: el modelo de referencia de la práctica, armado y
// renderizado en Blender por Amatista (motor 3.3). El alumno ve la figura
// terminada y su plano con medidas APROXIMADAS: no tiene que copiarlas al
// centímetro, tiene que verse así.
// Motor 3.5: si la práctica tiene ejemplo resuelto, la imagen es solo una guía
// (Amatista compara con el ejemplo, no con estas medidas).
function ModeloReferencia({ practicaId, conEjemplo = false }) {
  const referencia = referenciaDe(practicaId);
  const [vista, setVista] = useState('imagen');
  if (!referencia) return null;
  const medidas = textoMedidas(referencia.medidas);
  const conPlano = Boolean(referencia.plano);

  return (
    <figure className="modelo-referencia corte-poly-sm mt-5 overflow-hidden border border-white/10 bg-base/60">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-2.5">
        <figcaption className="font-bold text-white">
          {conEjemplo ? 'Una versión posible' : 'Así se debe ver'}: <span className="text-neon">{referencia.titulo}</span>
        </figcaption>
        {conPlano && (
          <div className="flex gap-1" role="tablist" aria-label="Vista del modelo">
            {[
              ['imagen', 'Imagen'],
              ['plano', 'Plano con medidas'],
            ].map(([clave, texto]) => (
              <button
                key={clave}
                type="button"
                role="tab"
                aria-selected={vista === clave}
                onClick={() => setVista(clave)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  vista === clave ? 'bg-neon text-base' : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {texto}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="modelo-referencia__lienzo relative bg-black/30">
        <ImagenLigera
          src={vista === 'plano' && conPlano ? referencia.plano : referencia.imagen}
          alt={
            vista === 'plano'
              ? `Plano de ${referencia.titulo} visto de frente, de lado y desde arriba, con medidas aproximadas`
              : `${referencia.titulo} terminado, renderizado en Blender`
          }
          ancho={800}
          alto={vista === 'plano' && conPlano ? 400 : 500}
          className="block w-full"
          imgClassName="block h-auto w-full"
        />
      </div>
      <div className="grid gap-1.5 px-4 py-3 text-sm text-texto/80">
        <p>{referencia.descripcion}</p>
        {conEjemplo ? (
          <p className="text-xs text-white/60">
            {medidas && <span className="font-mono">{medidas} · </span>}
            La imagen es una guía: Amatista compara tu escena con el ejemplo resuelto. Hasta el nivel 3, el tamaño y los
            colores son tuyos.
          </p>
        ) : (
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">
            {medidas && <span>{medidas} · </span>}
            Medidas aproximadas: ±{referencia.holgura} % · puede ser más grande, más chica o estar girada
          </p>
        )}
      </div>
    </figure>
  );
}

export default ModeloReferencia;
