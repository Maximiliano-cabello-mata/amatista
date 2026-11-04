// Los mensajes de una conversación del buzón. Lo que escribe el creador va a
// la izquierda con su pavo real; lo del alumno, a la derecha con su avatar.
import Avatar from '../avatares/Avatar';
import { AVATAR_CREADOR } from '../avatares/catalogo';
import { NOMBRE_CREADOR } from './catalogo';

const hora = (iso) =>
  new Date(iso).toLocaleString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function Hilo({ mensajes, alumno }) {
  return (
    <ol className="grid grid-cols-1 gap-3">
      {mensajes.map((m) => (
        <li key={m.id} className={`flex items-end gap-2 ${m.de_creador ? '' : 'flex-row-reverse'}`}>
          {m.de_creador ? (
            <Avatar id={AVATAR_CREADOR.id} className="h-8 w-9" titulo={`${NOMBRE_CREADOR}, el creador`} />
          ) : (
            <Avatar id={alumno?.avatar} inicial={alumno?.inicial} className="h-8 w-9" />
          )}
          <div
            className={`corte-poly-sm max-w-[85%] border px-3 py-2 text-sm leading-relaxed ${
              m.de_creador ? 'border-amatista/40 bg-amatista/10 text-texto' : 'border-white/10 bg-white/[0.04] text-texto/90'
            }`}
          >
            <p className="mb-0.5 font-mono text-[10px] uppercase tracking-widest text-white/45">
              {m.de_creador ? `${NOMBRE_CREADOR} · creador` : (alumno?.nombre ?? 'Tú')} · {hora(m.creado_en)}
            </p>
            <p className="whitespace-pre-line break-words">{m.texto}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default Hilo;
