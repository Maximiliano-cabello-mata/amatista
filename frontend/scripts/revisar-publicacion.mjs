// Revisa dist/ antes de publicar la PWA (corre solo después de `npm run build`).
// Falla si el paquete deja ver más código del necesario: mapas de fuente,
// rutas de la computadora donde se compiló, comentarios de desarrollo o
// algo que parezca un secreto. docs/seguridad/02_proteccion_del_codigo.md.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '..', 'dist');

const REGLAS = [
  // Solo el comentario al final de un archivo; A-Frame trae el texto dentro de su código.
  [/(?:^|\n)\s*\/[/*][#@]\s*sourceMappingURL=(?![^\s]*\$\{)\S+/, 'referencia a un mapa de fuente'],
  [/(?:\/home\/|\/Users\/|[A-Z]:\\\\Users\\\\)[\w.-]+/, 'ruta de la computadora donde se compiló'],
  [/\/\*\*?\s*\n?\s*(?:Uso|TODO|FIXME|XXX)\b/, 'comentario de desarrollo'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'llave privada'],
  [/\b(?:AMATISTA_SECRETO_FIRMA|DB_PASSWORD|SMTP_PASSWORD)\s*[=:]\s*["'`][^"'`\s]{6,}/, 'secreto del servidor'],
];

function archivos(carpeta) {
  return readdirSync(carpeta).flatMap((nombre) => {
    const ruta = path.join(carpeta, nombre);
    return statSync(ruta).isDirectory() ? archivos(ruta) : [ruta];
  });
}

const problemas = [];
for (const ruta of archivos(DIST)) {
  const relativa = path.relative(DIST, ruta);
  if (relativa.endsWith('.map')) {
    problemas.push(`${relativa}: mapa de fuente publicado`);
    continue;
  }
  if (!/\.(?:js|mjs|css|html|json|webmanifest)$/.test(relativa)) continue;
  const texto = readFileSync(ruta, 'utf8');
  for (const [patron, motivo] of REGLAS) {
    const hallado = texto.match(patron);
    if (hallado) problemas.push(`${relativa}: ${motivo} («${hallado[0].slice(0, 60)}»)`);
  }
}

if (problemas.length) {
  console.error(`✗ dist/ no está listo para publicarse:\n- ${problemas.join('\n- ')}`);
  process.exit(1);
}
console.log('✓ dist/ sin mapas de fuente, rutas locales, comentarios de desarrollo ni secretos.');
