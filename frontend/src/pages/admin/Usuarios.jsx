// Lista de usuarios (#/admin/usuarios): búsqueda, filtro por rol, orden y
// paginación (GET /api/admin/usuarios). Las acciones están en el detalle.
import { useState } from 'react';
import { useAuth } from '../../auth/contexto';
import { claseControl } from '../../components/admin/estilos';
import { haceCuanto, NOMBRES_ROL, numero, ORDENES_USUARIOS, ROLES, totalPaginas } from '../../components/admin/logica';
import { Boton, CampoAdmin, CargandoAdmin, ErrorAdmin, Pastilla, Tarjeta, Vacio } from '../../components/admin/ui';
import { useDatosAdmin, useRetardado } from '../../components/admin/useDatosAdmin';
import { rutas } from '../../rutas';
import { listarUsuarios } from '../../services/admin';

const POR_PAGINA = 25;

const TONOS_ROL = {
  admin: 'bg-amatista/25 text-amatista-claro',
  profesor: 'bg-neon/10 text-neon',
  alumno: 'bg-white/5 text-white/65',
};

// Pastillas de estado de una cuenta (se usan también en el detalle).
export function EstadoCuenta({ usuario }) {
  return (
    <span className="flex flex-wrap gap-1">
      <Pastilla tono={TONOS_ROL[usuario.rol] ?? TONOS_ROL.alumno}>{NOMBRES_ROL[usuario.rol] ?? usuario.rol}</Pastilla>
      {usuario.anonimo && <Pastilla titulo="Progreso de un dispositivo sin cuenta">Anónimo</Pastilla>}
      {!usuario.anonimo && !usuario.correo_confirmado && (
        <Pastilla tono="bg-amber-300/10 text-amber-200" titulo="No ha confirmado su correo">
          Sin confirmar
        </Pastilla>
      )}
      {usuario.es_prueba && (
        <Pastilla tono="bg-red-500/15 text-red-200" titulo="No cuenta en las métricas">
          Prueba
        </Pastilla>
      )}
      {usuario.fusionado_en && <Pastilla titulo="Su progreso se unió a una cuenta">Fusionado</Pastilla>}
    </span>
  );
}

function nombreVisible(usuario) {
  return usuario.nombre || usuario.email || (usuario.anonimo ? 'Alumno sin cuenta' : usuario.id);
}

function Usuarios() {
  const { token } = useAuth();
  const [buscar, setBuscar] = useState('');
  const [rol, setRol] = useState('');
  const [orden, setOrden] = useState('reciente');
  const [incluirFusionados, setIncluirFusionados] = useState(false);
  const [pagina, setPagina] = useState(1);
  const busqueda = useRetardado(buscar.trim());

  const filtros = { buscar: busqueda, rol, orden, incluirFusionados, pagina, porPagina: POR_PAGINA };
  const { cargando, respuesta, datos, recargar } = useDatosAdmin(
    () => listarUsuarios(token, filtros),
    JSON.stringify([token, filtros]),
  );

  // Cambiar un filtro vuelve a la primera página.
  const cambiar = (asignar) => (valor) => {
    asignar(valor);
    setPagina(1);
  };

  const paginas = totalPaginas(datos?.total, POR_PAGINA);

  return (
    <div className="space-y-5">
      <Tarjeta>
        <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="search" onSubmit={(e) => e.preventDefault()}>
          <CampoAdmin etiqueta="Buscar" ayuda="Nombre, correo o id.">
            {({ id, describe }) => (
              <input
                id={id}
                aria-describedby={describe}
                type="search"
                value={buscar}
                onChange={(e) => cambiar(setBuscar)(e.target.value)}
                placeholder="ana@correo.com"
                className={claseControl}
              />
            )}
          </CampoAdmin>
          <CampoAdmin etiqueta="Rol">
            {({ id }) => (
              <select id={id} value={rol} onChange={(e) => cambiar(setRol)(e.target.value)} className={claseControl}>
                <option value="">Todos</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {NOMBRES_ROL[r]}
                  </option>
                ))}
              </select>
            )}
          </CampoAdmin>
          <CampoAdmin etiqueta="Orden">
            {({ id }) => (
              <select id={id} value={orden} onChange={(e) => cambiar(setOrden)(e.target.value)} className={claseControl}>
                {ORDENES_USUARIOS.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.texto}
                  </option>
                ))}
              </select>
            )}
          </CampoAdmin>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-white/75">
            <input
              type="checkbox"
              checked={incluirFusionados}
              onChange={(e) => cambiar(setIncluirFusionados)(e.target.checked)}
              className="h-4 w-4 accent-[#9B59B6]"
            />
            Incluir filas fusionadas
          </label>
        </form>
      </Tarjeta>

      {!respuesta && <CargandoAdmin texto="Cargando usuarios…" />}
      {respuesta && !respuesta.ok && <ErrorAdmin respuesta={respuesta} alReintentar={recargar} />}

      {datos && (
        <Tarjeta
          etiqueta={`${numero(datos.total)} ${datos.total === 1 ? 'resultado' : 'resultados'}`}
          titulo="Cuentas y alumnos"
          accion={
            <Boton chico onClick={recargar} disabled={cargando}>
              Actualizar
            </Boton>
          }
        >
          {datos.usuarios.length === 0 ? (
            <Vacio titulo="No hay usuarios con esos filtros">Prueba con otra búsqueda o quita el filtro de rol.</Vacio>
          ) : (
            <div className={`-mx-4 overflow-x-auto px-4 transition-opacity sm:mx-0 sm:px-0 ${cargando ? 'opacity-60' : ''}`} aria-busy={cargando}>
              <table className="w-full min-w-[44rem] text-left text-sm">
                <thead className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                  <tr>
                    <th scope="col" className="py-2 pr-3 font-normal">Usuario</th>
                    <th scope="col" className="py-2 pr-3 font-normal">Estado</th>
                    <th scope="col" className="py-2 pr-3 text-right font-normal">Lecciones</th>
                    <th scope="col" className="py-2 pr-3 text-right font-normal">XP</th>
                    <th scope="col" className="py-2 font-normal">Último acceso</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.usuarios.map((usuario) => (
                    <tr key={usuario.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                      <th scope="row" className="max-w-[18rem] py-2.5 pr-3 font-normal">
                        <a href={rutas.adminUsuario(usuario.id)} className="block truncate font-semibold text-white hover:text-neon">
                          {nombreVisible(usuario)}
                        </a>
                        <span className="block truncate font-mono text-[11px] text-white/45">
                          {usuario.nombre && usuario.email ? usuario.email : usuario.id}
                        </span>
                      </th>
                      <td className="py-2.5 pr-3">
                        <EstadoCuenta usuario={usuario} />
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{numero(usuario.lecciones_completadas)}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{numero(usuario.xp)}</td>
                      <td className="whitespace-nowrap py-2.5 text-white/65">{haceCuanto(usuario.ultimo_acceso)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {paginas > 1 && (
            <nav aria-label="Páginas" className="mt-4 flex items-center justify-between gap-3">
              <Boton chico onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina <= 1 || cargando}>
                ◂ Anterior
              </Boton>
              <span className="font-mono text-xs text-white/60" aria-live="polite">
                Página {pagina} de {paginas}
              </span>
              <Boton chico onClick={() => setPagina((p) => Math.min(paginas, p + 1))} disabled={pagina >= paginas || cargando}>
                Siguiente ▸
              </Boton>
            </nav>
          )}
        </Tarjeta>
      )}
    </div>
  );
}

export default Usuarios;
