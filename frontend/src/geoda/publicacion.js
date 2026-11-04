// Contrato público G7B -> Geoda. El conocimiento documental NO es telemetría.
// Solo se muestran conteos; hasta que G7B certifique perfiles, se usan reglas base.
const CONTRATO = 'g7b.geoda.estado/1';
const entero = (valor) => Number.isSafeInteger(valor) && valor >= 0;

export function interpretarPublicacion(datos) {
  if (!datos || datos.contrato !== CONTRATO || !['conectado', 'cache'].includes(datos.estado)) return null;
  const { cubo, conocimiento } = datos;
  if (!cubo || !conocimiento || !entero(cubo.mediciones) || !entero(cubo.aceptadas)
      || !entero(cubo.revision) || !entero(conocimiento.documentos)
      || cubo.aceptadas + cubo.revision !== cubo.mediciones
      || cubo.recomendaciones_habilitadas !== false || !Array.isArray(datos.perfiles)
      || datos.perfiles.length !== 0) return null;
  return {
    estado: datos.estado,
    version: String(cubo.version ?? '').slice(0, 100),
    mediciones: cubo.mediciones,
    aceptadas: cubo.aceptadas,
    revision: cubo.revision,
    documentos: conocimiento.documentos,
    perfiles: { perfiles: [] }, // no recomendar hardware basándose en texto
  };
}
