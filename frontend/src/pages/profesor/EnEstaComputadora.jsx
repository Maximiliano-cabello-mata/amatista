// Los modelos que el profesor ya recogió: viven solo en esta computadora.
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/contexto';
import { Boton, CargandoAdmin, Confirmacion, Mensaje, Tarjeta, Vacio } from '../../components/admin/ui';
import { useConfirmacion } from '../../components/admin/useConfirmacion';
import { borrarModelo, hayAlmacen, listarModelos } from '../../profesor/almacen';
import { fecha } from '../../profesor/logica';
import { armarEscena, bytesLegibles, desempaquetar } from '../../profesor/modelo';
import VisorModelo from '../../profesor/VisorModelo';

function EnEstaComputadora() {
  const { usuario } = useAuth();
  const [modelos, setModelos] = useState(null);
  const [error, setError] = useState(null);
  const [abierto, setAbierto] = useState(null);
  const { pregunta, preguntar, responder } = useConfirmacion();

  useEffect(() => {
    if (!hayAlmacen() || !usuario) return;
    listarModelos(usuario.id)
      .then((lista) => setModelos(lista.sort((a, b) => (b.guardado_en ?? '').localeCompare(a.guardado_en ?? ''))))
      .catch(() => setError('Este navegador no deja leer los modelos guardados.'));
  }, [usuario]);

  if (!hayAlmacen()) return <Mensaje tono="aviso">Este navegador no puede guardar modelos. Abre el panel en Chrome, Edge o Firefox.</Mensaje>;
  if (error) return <Mensaje tono="error">{error}</Mensaje>;
  if (!modelos) return <CargandoAdmin texto="Buscando modelos en esta computadora…" />;

  const ver = async (registro) => {
    try {
      setAbierto({ clave: registro.clave, escena: armarEscena(await desempaquetar(registro.paquete)) });
    } catch (e) {
      setError(e.message);
    }
  };

  const borrar = async (registro) => {
    const si = await preguntar({
      titulo: `¿Borrar el modelo de ${registro.alumno}?`,
      texto: 'El servidor no guarda una copia: si lo borras, ya no podrás verlo. Su evaluación y su calificación no cambian.',
      confirmar: 'Borrar de esta computadora',
      peligro: true,
    });
    if (!si) return;
    await borrarModelo(registro.clave);
    setModelos((lista) => lista.filter((m) => m.clave !== registro.clave));
    if (abierto?.clave === registro.clave) setAbierto(null);
  };

  const total = modelos.reduce((suma, m) => suma + (m.bytes || 0), 0);
  return (
    <div className="space-y-6">
      <Confirmacion pregunta={pregunta} responder={responder} />
      <Tarjeta etiqueta={`${modelos.length} modelos · ${bytesLegibles(total)}`} titulo="Modelos recogidos">
        {modelos.length === 0 ? (
          <Vacio titulo="Aquí aparecerán los modelos que abras.">Abre una entrega desde un grupo: el modelo se guarda en esta computadora.</Vacio>
        ) : (
          <ul className="divide-y divide-white/5">
            {modelos.map((m) => (
              <li key={m.clave} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block font-semibold text-white">{m.alumno} · {m.practica}</span>
                  <span className="block text-xs text-white/45">Entregado {fecha(m.entregada_en)} · {bytesLegibles(m.bytes)}</span>
                </span>
                <span className="flex gap-2">
                  <Boton chico variante="neon" onClick={() => ver(m)}>Ver</Boton>
                  <Boton chico variante="peligro" onClick={() => borrar(m)}>Borrar</Boton>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>
      {abierto && (
        <Tarjeta titulo="Modelo">
          <VisorModelo escena={abierto.escena} />
        </Tarjeta>
      )}
    </div>
  );
}

export default EnEstaComputadora;
