// Combina el catálogo empaquetado con el del servidor (GET /api/contenido/catalogo).
// Funciones puras: se prueban en combinar.test.js.

const definidos = (objeto) =>
  Object.fromEntries(Object.entries(objeto).filter(([, valor]) => valor !== undefined && valor !== null));

const numeroDe = (valor, respaldo) => {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero > 0 ? numero : respaldo;
};

// Módulo del servidor {id, titulo, insignia, contenido} con su número.
export function normalizarModulo(modulo, indice) {
  return {
    id: modulo.id,
    numero: numeroDe(modulo.numero ?? modulo.contenido?.order, indice + 1),
    titulo: modulo.titulo ?? modulo.contenido?.title ?? `Módulo ${indice + 1}`,
    insignia: modulo.insignia ?? null,
    // Un contenido sin lista de lecciones no se puede mostrar: queda como "Próximamente".
    contenido: Array.isArray(modulo.contenido?.lessons) ? modulo.contenido : null,
  };
}

// Reglas por módulo:
// - mismo id: el del servidor reemplaza al empaquetado (si el servidor lo
//   lista como "Próximamente" pero la app trae su contenido, se conserva el
//   contenido: un módulo publicado no desaparece de los alumnos);
// - mismo número: un marcador "Próximamente" se reemplaza por el del servidor;
//   un módulo con contenido solo se reemplaza por otro con contenido;
// - números nuevos se agregan. Todo queda ordenado por número.
export function combinarModulos(app = [], servidor = []) {
  const resultado = app.map((modulo) => ({ ...modulo }));
  servidor.filter((modulo) => modulo?.id).map(normalizarModulo).forEach((nuevo) => {
    const mismoId = resultado.findIndex((modulo) => modulo.id === nuevo.id);
    if (mismoId >= 0) {
      const previo = resultado[mismoId];
      resultado[mismoId] = {
        ...previo,
        ...definidos(nuevo),
        contenido: nuevo.contenido ?? previo.contenido,
      };
      return;
    }
    const mismoNumero = resultado.findIndex((modulo) => modulo.numero === nuevo.numero);
    if (mismoNumero < 0) {
      resultado.push(nuevo);
      return;
    }
    const previo = resultado[mismoNumero];
    if (!previo.contenido || nuevo.contenido) {
      resultado[mismoNumero] = { ...nuevo, insignia: nuevo.insignia ?? previo.insignia ?? null };
    }
  });
  return resultado.sort((a, b) => a.numero - b.numero);
}

// "1" o 1 → "01", como en la app.
const textoNumero = (valor, respaldo) => {
  if (valor === undefined || valor === null || valor === '') return respaldo;
  return /^\d+$/.test(String(valor)) ? String(valor).padStart(2, '0') : String(valor);
};

const listaDe = (catalogo) => (Array.isArray(catalogo) ? catalogo : catalogo?.cursos ?? []);

// app y servidor: listas de cursos (o catálogos {cursos}). Devuelve la lista
// combinada: los datos del servidor ganan, los cursos nuevos se agregan.
export function combinarCatalogos(app, servidor) {
  const resultado = listaDe(app).map((curso) => ({ ...curso }));
  listaDe(servidor).forEach((cursoServidor) => {
    if (!cursoServidor?.id) return;
    const { modulos, ...datos } = cursoServidor;
    const lista = Array.isArray(modulos) ? modulos : [];
    const indice = resultado.findIndex((curso) => curso.id === cursoServidor.id);
    if (indice >= 0) {
      const previo = resultado[indice];
      resultado[indice] = {
        ...previo,
        ...definidos(datos),
        numero: textoNumero(datos.numero, previo.numero),
        modulos: combinarModulos(previo.modulos, lista),
      };
    } else {
      resultado.push({
        estado: 'disponible',
        nivel: '',
        subtitulo: '',
        descripcion: '',
        recurso: null,
        ...definidos(datos),
        numero: textoNumero(datos.numero, textoNumero(resultado.length + 1)),
        modulos: combinarModulos([], lista),
      });
    }
  });
  return resultado.sort((a, b) => numeroDe(a.numero, 99) - numeroDe(b.numero, 99));
}
