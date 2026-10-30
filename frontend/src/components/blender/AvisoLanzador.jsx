// Lo que pasa mientras la plataforma abre Blender (blender/useLanzador.js): esperando, abierto
// o «¿no se abrió?» con los dos arreglos posibles. Se muestra debajo del botón «Abrir en Blender».
import { rutas } from '../../rutas';

const TEXTOS = {
  lanzando: {
    titulo: 'Abriendo Blender…',
    texto: 'Tarda unos segundos. La primera vez tu navegador pregunta si puede abrir «Amatista para Blender»: elige Abrir (y «Permitir siempre»).',
    clase: 'border-neon/40 bg-neon/5',
  },
  abierto: {
    titulo: 'Blender está abierto',
    texto: 'Amatista ya te espera en la actividad. Tu avance aparece aquí mientras trabajas.',
    clase: 'border-emerald-400/40 bg-emerald-400/5',
  },
  sin_respuesta: {
    titulo: '¿No se abrió Blender?',
    texto: null,
    clase: 'border-blender/50 bg-blender/5',
  },
};

function AvisoLanzador({ estado, alCerrar, className = '' }) {
  const t = TEXTOS[estado];
  if (!t) return null;
  return (
    <div role="status" className={`corte-poly-sm animar-entrar mt-4 flex gap-3 border p-4 text-sm ${t.clase} ${className}`}>
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        {estado === 'lanzando' ? (
          <span className="lanzador__giro block h-5 w-5" />
        ) : estado === 'abierto' ? (
          <span className="block text-lg leading-none text-emerald-300">✓</span>
        ) : (
          <span className="block text-lg leading-none text-blender">?</span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-white">{t.titulo}</p>
        {t.texto ? (
          <p className="mt-0.5 text-texto/80">{t.texto}</p>
        ) : (
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-texto/85">
            <li>
              ¿Ya instalaste Amatista Motor 6 o más nuevo? Si no, <a href={rutas.blender} className="font-bold text-neon underline-offset-2 hover:underline">instálalo aquí</a> (un minuto) y vuelve a pulsar el botón.
            </li>
            <li>
              Abre Blender tú mismo: la actividad te espera en el menú <strong className="text-white">Amatista</strong> de arriba. Ahí mismo, «Reparar “Abrir en Blender”» arregla este botón.
            </li>
          </ol>
        )}
      </div>
      {alCerrar && (
        <button type="button" onClick={alCerrar} className="boton boton--fantasma boton--chico -my-1 shrink-0 self-start" aria-label="Cerrar el aviso">
          ✕
        </button>
      )}
    </div>
  );
}

export default AvisoLanzador;
