import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buscarCurso as buscarEn, cursos as cursosApp } from '../data/cursos';
import { useConexion } from '../hooks/useConexion';
import { guardar, leer } from '../lib/almacen';
import { descargarCatalogo, sincronizacionDisponible } from '../services/api';
import { combinarCatalogos } from './combinar';
import { ContextoCatalogo } from './contexto';

const CLAVE = 'catalogo';

const esCatalogo = (datos) => Boolean(datos) && Array.isArray(datos.cursos);

// Catálogo vigente: el empaquetado con la app (funciona sin conexión) más lo
// que publique el servidor. La última copia del servidor se guarda en
// IndexedDB para que las lecciones nuevas también se abran offline.
function CatalogoProvider({ children }) {
  const [servidor, setServidor] = useState(null);
  const [cargado, setCargado] = useState(false);
  const enLinea = useConexion();
  const version = useRef(null);

  // 1. Copia guardada del catálogo del servidor.
  useEffect(() => {
    let activo = true;
    leer(CLAVE).then((guardado) => {
      if (!activo) return;
      if (esCatalogo(guardado)) {
        version.current = guardado.version ?? null;
        setServidor(guardado);
      }
      setCargado(true);
    });
    return () => {
      activo = false;
    };
  }, []);

  // 2. Pide al servidor solo si cambió (If-None-Match con la versión guardada).
  const actualizar = useCallback(async () => {
    if (!sincronizacionDisponible()) return { ok: false, error: 'El servidor no está disponible desde este sitio.' };
    const resultado = await descargarCatalogo(version.current);
    if (resultado.ok && !resultado.noModificado && esCatalogo(resultado.datos)) {
      const copia = {
        version: resultado.datos.version == null ? null : String(resultado.datos.version),
        generado_en: resultado.datos.generado_en ?? null,
        cursos: resultado.datos.cursos,
      };
      version.current = copia.version;
      setServidor(copia);
      guardar(CLAVE, copia);
    }
    return resultado.ok
      ? { ok: true, datos: { noModificado: resultado.noModificado } }
      : { ok: false, error: resultado.error };
  }, []);

  // 3. Al abrir la app y al recuperar la conexión.
  useEffect(() => {
    if (cargado && enLinea) actualizar();
  }, [cargado, enLinea, actualizar]);

  const valor = useMemo(() => {
    const cursos = servidor ? combinarCatalogos(cursosApp, servidor.cursos) : cursosApp;
    return {
      cursos,
      version: servidor?.version ?? 'app',
      origen: servidor ? 'servidor' : 'app',
      generadoEn: servidor?.generado_en ?? null,
      buscarCurso: (id) => buscarEn(id, cursos),
      actualizar,
    };
  }, [servidor, actualizar]);

  // Leer IndexedDB tarda milisegundos: se espera para que un enlace directo a
  // una lección publicada desde el servidor no muestre "no encontrada".
  if (!cargado) return null;

  return <ContextoCatalogo.Provider value={valor}>{children}</ContextoCatalogo.Provider>;
}

export default CatalogoProvider;
