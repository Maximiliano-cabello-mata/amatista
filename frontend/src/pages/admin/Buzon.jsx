// Buzón (#/admin/buzon): lo que los alumnos le escriben al creador. Primero lo
// que no has leído; respondes como el creador (con el pavo real) y marcas cada
// conversación como resuelta cuando ya quedó. GET/POST /api/buzon/bandeja
// (backend/api/buzon.py). Solo administradores.
import { useState } from 'react';
import { useAuth } from '../../auth/contexto';
import Avatar from '../../avatares/Avatar';
import { CATEGORIAS, datosCategoria, ESTADOS, MAX_TEXTO } from '../../buzon/catalogo';
import Hilo from '../../buzon/Hilo';
import { claseControl } from '../../components/admin/estilos';
import { haceCuanto, numero } from '../../components/admin/logica';
import { Boton, CargandoAdmin, ErrorAdmin, Kpi, Mensaje, Pastilla, Tarjeta, Vacio } from '../../components/admin/ui';
import { useDatosAdmin } from '../../components/admin/useDatosAdmin';
import { bandejaBuzon, cambiarEstadoSugerencia, responderComoCreador } from '../../services/admin';

const FILTROS = [
  { valor: '', texto: 'Todas' },
  { valor: 'abierta', texto: 'Sin responder' },
  { valor: 'respondida', texto: 'Respondidas' },
  { valor: 'resuelta', texto: 'Resueltas' },
];

const inicial = (alumno) => (alumno?.nombre || alumno?.email || '?').trim().charAt(0).toUpperCase();

function Conversacion({ conversacion, token, alCambiar }) {
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const { alumno } = conversacion;
  const categoria = datosCategoria(conversacion.categoria);
  const estado = ESTADOS[conversacion.estado] ?? ESTADOS.abierta;

  const responder = async (evento) => {
    evento.preventDefault();
    if (texto.trim().length < 3) return;
    setEnviando(true);
    setAviso(null);
    const respuesta = await responderComoCreador(token, conversacion.id, texto.trim());
    setEnviando(false);
    if (!respuesta.ok) {
      setAviso({ tono: 'error', texto: respuesta.error || 'No se pudo enviar.' });
      return;
    }
    setTexto('');
    alCambiar({ ...respuesta.datos, alumno, sin_leer_creador: false });
  };

  const marcar = async (nuevo) => {
    setAviso(null);
    const respuesta = await cambiarEstadoSugerencia(token, conversacion.id, nuevo);
    if (respuesta.ok) alCambiar({ ...conversacion, estado: respuesta.datos.estado });
    else setAviso({ tono: 'error', texto: respuesta.error || 'No se pudo cambiar el estado.' });
  };

  return (
    <li className={`corte-poly-sm border p-4 ${conversacion.sin_leer_creador ? 'border-neon/50 bg-base/70' : 'border-white/10 bg-base/40'}`}>
      <div className="flex flex-wrap items-center gap-3">
        <Avatar id={alumno?.avatar} inicial={inicial(alumno)} className="h-9 w-10" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">{alumno?.nombre || alumno?.email}</p>
          <p className="truncate text-xs text-white/50">
            {alumno?.email} · {haceCuanto(conversacion.actualizada_en)}
          </p>
        </div>
        <Pastilla>
          {categoria.icono} {categoria.texto}
        </Pastilla>
        <Pastilla tono={estado.tono}>{estado.texto}</Pastilla>
        {conversacion.sin_leer_creador && <Pastilla tono="bg-neon/15 text-neon">Nuevo</Pastilla>}
      </div>
      {conversacion.pagina && <p className="mt-2 font-mono text-[11px] text-white/45">Desde: {conversacion.pagina}</p>}
      <div className="mt-4">
        <Hilo mensajes={conversacion.mensajes} alumno={{ avatar: alumno?.avatar, inicial: inicial(alumno), nombre: alumno?.nombre || 'Alumno' }} />
      </div>
      <form noValidate onSubmit={responder} className="mt-4 grid gap-2">
        <label htmlFor={`resp-${conversacion.id}`} className="sr-only">
          Responder como creador
        </label>
        <textarea
          id={`resp-${conversacion.id}`}
          rows={2}
          maxLength={MAX_TEXTO}
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          placeholder="Responde como el creador…"
          className={`${claseControl} resize-y`}
        />
        <div className="flex flex-wrap gap-2">
          <Boton type="submit" variante="primario" chico disabled={enviando || texto.trim().length < 3}>
            {enviando ? 'Enviando…' : 'Responder'}
          </Boton>
          {conversacion.estado !== 'resuelta' ? (
            <Boton chico onClick={() => marcar('resuelta')}>
              Marcar resuelta
            </Boton>
          ) : (
            <Boton chico onClick={() => marcar('abierta')}>
              Reabrir
            </Boton>
          )}
        </div>
        {aviso && <Mensaje tono={aviso.tono}>{aviso.texto}</Mensaje>}
      </form>
    </li>
  );
}

function Buzon() {
  const { token, esAdmin } = useAuth();
  const [filtro, setFiltro] = useState('');
  const { cargando, respuesta, datos, recargar, modificar } = useDatosAdmin(() => bandejaBuzon(token, filtro), `${token}|${filtro}`);

  if (!esAdmin) return <Mensaje tono="aviso">Solo un administrador puede leer el buzón del creador.</Mensaje>;
  if (!respuesta) return <CargandoAdmin texto="Abriendo el buzón…" />;
  if (respuesta.status === 503) {
    return (
      <Mensaje tono="aviso">
        El buzón necesita las tablas del script <code>backend/sql/013_avatares_y_buzon.sql</code>. Ejecútalo en Oracle y reinicia el
        servicio.
      </Mensaje>
    );
  }
  if (!respuesta.ok) return <ErrorAdmin respuesta={respuesta} alReintentar={recargar} />;

  const conversaciones = [...(datos.conversaciones ?? [])].sort(
    (a, b) => Number(b.sin_leer_creador) - Number(a.sin_leer_creador) || b.actualizada_en.localeCompare(a.actualizada_en),
  );
  const porCategoria = Object.fromEntries(CATEGORIAS.map((c) => [c.id, conversaciones.filter((x) => x.categoria === c.id).length]));
  const cambiar = (nueva) =>
    modificar((actual) => ({
      ...actual,
      sin_leer: Math.max(0, (actual.sin_leer ?? 0) - (actual.conversaciones.find((c) => c.id === nueva.id)?.sin_leer_creador ? 1 : 0)),
      conversaciones: actual.conversaciones.map((c) => (c.id === nueva.id ? { ...c, ...nueva } : c)),
    }));

  return (
    <div className="grid gap-6">
      {!datos.es_creador && (
        <Mensaje tono="info">
          Respondes en nombre del creador. Para que solo su cuenta lo haga, define <code>AMATISTA_CREADOR</code> en el servidor.
        </Mensaje>
      )}
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Kpi etiqueta="Sin leer" valor={numero(datos.sin_leer)} tono={datos.sin_leer ? 'text-neon' : 'text-white'} />
        {CATEGORIAS.map((c) => (
          <Kpi key={c.id} etiqueta={c.texto} valor={numero(porCategoria[c.id])} />
        ))}
      </dl>
      <Tarjeta
        etiqueta="Alumnos → creador"
        titulo="Conversaciones"
        accion={
          <div className="flex flex-wrap items-center gap-2">
            <div role="radiogroup" aria-label="Filtrar por estado" className="flex flex-wrap gap-1">
              {FILTROS.map((f) => (
                <button
                  key={f.valor}
                  type="button"
                  role="radio"
                  aria-checked={f.valor === filtro}
                  onClick={() => setFiltro(f.valor)}
                  className={`corte-poly-sm px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest transition ${
                    f.valor === filtro ? 'bg-amatista text-white' : 'bg-white/5 text-white/65 hover:bg-white/10'
                  }`}
                >
                  {f.texto}
                </button>
              ))}
            </div>
            <Boton chico onClick={recargar} disabled={cargando}>
              {cargando ? 'Actualizando…' : 'Actualizar'}
            </Boton>
          </div>
        }
      >
        {conversaciones.length ? (
          <ul className="grid grid-cols-1 gap-3">
            {conversaciones.map((c) => (
              <Conversacion key={c.id} conversacion={c} token={token} alCambiar={cambiar} />
            ))}
          </ul>
        ) : (
          <Vacio titulo="Nada por aquí">Cuando un alumno te escriba desde el buzón, aparecerá en esta lista.</Vacio>
        )}
      </Tarjeta>
    </div>
  );
}

export default Buzon;
