// Genera el índice ligero de módulos (frontend/src/data/indice-modulos.json).
// Uso:
//   node scripts/indice-modulos.mjs              # genera el archivo
//   node scripts/indice-modulos.mjs --verificar  # comprueba si está al día
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const AQUI = dirname(fileURLToPath(import.meta.url));
const MODULOS_DIR = join(AQUI, '..', 'src', 'data', 'modulos');
const SALIDA = join(AQUI, '..', 'src', 'data', 'indice-modulos.json');

export function generarIndice() {
  const archivos = readdirSync(MODULOS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();

  const indice = {};

  for (const nombre of archivos) {
    const clave = `./modulos/${nombre}`;
    const crudo = JSON.parse(readFileSync(join(MODULOS_DIR, nombre), 'utf-8'));
    const real = crudo.module;

    const leccionesLigeras = (real.lessons || []).map((l) => {
      const { quizData, ficha, contentBlocks, ...resto } = l;
      const bloquesFiltrados = (contentBlocks || []).filter(
        (b) => b.type === 'blender_practice' || b.type === 'blender_taller',
      );

      const res = {
        ...resto,
        _ligera: true,
      };

      if (bloquesFiltrados.length > 0) {
        res.contentBlocks = bloquesFiltrados;
      }

      return res;
    });

    const moduloLigero = {
      id: real.id,
      title: real.title,
      description: real.description,
      order: real.order,
    };

    if (real.insignia) moduloLigero.insignia = real.insignia;
    if (real.disciplinas) moduloLigero.disciplinas = real.disciplinas;
    moduloLigero.lessons = leccionesLigeras;

    indice[clave] = {
      ...crudo,
      module: moduloLigero,
    };
  }

  return indice;
}

const args = process.argv.slice(2);
const verificar = args.includes('--verificar');

const nuevoIndice = generarIndice();
const jsonNuevo = JSON.stringify(nuevoIndice);

if (verificar) {
  let existente = '';
  try {
    existente = readFileSync(SALIDA, 'utf-8');
  } catch {
    console.error('✗ Falta frontend/src/data/indice-modulos.json');
    process.exit(1);
  }
  if (existente !== jsonNuevo && existente.trim() !== jsonNuevo.trim()) {
    console.error('✗ indice-modulos.json está desfasado. Ejecuta: npm run indice');
    process.exit(1);
  }
  console.log('✓ indice-modulos.json está al día.');
} else {
  writeFileSync(SALIDA, jsonNuevo, 'utf-8');
  const rawBytes = Buffer.byteLength(jsonNuevo);
  const gzBytes = gzipSync(Buffer.from(jsonNuevo)).length;
  console.log(
    `✓ Generado indice-modulos.json: ${(rawBytes / 1024).toFixed(1)} KB (${(gzBytes / 1024).toFixed(1)} KB gzip)`,
  );
}
