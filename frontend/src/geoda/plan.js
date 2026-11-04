// El plan de Geoda para un equipo (contrato g7b.plan/1): dónde trabajar, qué Blender, qué ajustes,
// cómo se adapta Amatista misma y el script reversible para Blender.
import { clasificar } from './niveles';
import { elegir } from './perfiles';

const MOTORES = { workbench: ['BLENDER_WORKBENCH'], eevee: ['BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE'], cycles_gpu: ['CYCLES'] };

export function accionesBlender(perfil) {
  if (perfil.programa !== 'blender') return [];
  const a = perfil.ajustes;
  const acciones = [
    { ruta: 'scene.render.engine', posibles: MOTORES[perfil.motor] ?? MOTORES.eevee, por: `Motor ${perfil.motor}` },
    { ruta: 'scene.render.use_simplify', valor: a.simplify, por: a.simplify ? 'Limita la subdivisión en la vista 3D' : 'Sin límites' },
  ];
  if (a.simplify) acciones.push({ ruta: 'scene.render.simplify_subdivision', valor: a.subdivisionVista, por: 'Subdivisión máxima en la vista' });
  acciones.push({ ruta: 'scene.render.resolution_percentage', valor: a.resolucionPct, por: 'Tamaño del render' });
  if (perfil.motor === 'cycles_gpu') {
    acciones.push({ ruta: 'scene.cycles.samples', valor: a.muestras, por: 'Muestras de Cycles' });
    acciones.push({ ruta: 'scene.cycles.device', valor: 'GPU', por: 'Cycles en la gráfica' });
  } else if (perfil.motor === 'eevee') {
    acciones.push({ ruta: 'scene.eevee.taa_render_samples', valor: a.muestras, por: 'Muestras de EEVEE' });
  }
  return acciones;
}

// Cómo se adapta la propia plataforma: animaciones, datos y tamaño de las texturas de la biblioteca.
export function ajustesAmatista(nivel) {
  return {
    ligero: nivel === 'N0' || nivel === 'N1',
    texturas: nivel === 'N0' || nivel === 'N1' ? '512' : '1k',
  };
}

// forzar: el nivel que la persona eligió a mano cuando la detección no acierta.
export function decidir(huella, documento, { forzar } = {}) {
  const detectado = clasificar(huella);
  const clasificacion = forzar && forzar !== detectado.nivel
    ? { nivel: forzar, confianza: 'alta', motivos: ['Elegido por ti', ...detectado.motivos.slice(0, 1)] }
    : detectado;
  const perfil = elegir(clasificacion.nivel, documento);
  const sugerido = { base: 'sugerido: todavía sin mediciones de equipos como el tuyo', provisional: 'medido, aún con pocas mediciones', confiable: 'medido en varios equipos como el tuyo' }[perfil.estado];
  const explicacion = perfil.programa === 'blender'
    ? `Tu equipo es ${clasificacion.nivel}. Te recomendamos Blender ${perfil.version} con el perfil ${perfil.perfil} (${sugerido}).`
    : `Tu equipo es ${clasificacion.nivel}. Aquí Blender de escritorio no corre: aprende en el navegador con las lecciones y el Estudio A-Frame.`;
  return {
    contrato: 'g7b.plan/1',
    clasificacion,
    donde: perfil.programa === 'blender' ? 'este_equipo' : 'editor_web',
    perfil,
    acciones: accionesBlender(perfil),
    amatista: ajustesAmatista(clasificacion.nivel),
    explicacion,
  };
}

const py = (v) => (typeof v === 'boolean' ? (v ? 'True' : 'False') : typeof v === 'string' ? `'${v}'` : String(v));

// Script de Blender que aplica el plan y, si se vuelve a correr, lo deshace (guarda los valores anteriores en la escena).
export function scriptBlender(plan) {
  const lineas = plan.acciones.map((a) => (a.posibles
    ? `    ('${a.ruta}', [${a.posibles.map(py).join(', ')}]),`
    : `    ('${a.ruta}', ${py(a.valor)}),`));
  return `# Geoda · Amatista: ajustes para tu equipo (${plan.clasificacion.nivel}, perfil ${plan.perfil.perfil}).
# Ábrelo en Blender › Scripting › Abrir › Ejecutar. Si lo ejecutas otra vez, DESHACE los cambios.
import bpy

ACCIONES = [
${lineas.join('\n')}
]
CLAVE = 'amatista_geoda_previo'


def _destino(ruta):
    partes = ruta.split('.')
    objeto = bpy.context
    for parte in partes[:-1]:
        objeto = getattr(objeto, parte)
    return objeto, partes[-1]


escena = bpy.context.scene
if CLAVE in escena:
    previo = dict(escena[CLAVE])
    for ruta, valor in previo.items():
        try:
            objeto, nombre = _destino(ruta)
            setattr(objeto, nombre, valor)
        except Exception as error:
            print('Geoda: no se pudo restaurar', ruta, error)
    del escena[CLAVE]
    print('Geoda: ajustes deshechos.')
else:
    previo = {}
    for ruta, valor in ACCIONES:
        try:
            objeto, nombre = _destino(ruta)
            previo[ruta] = getattr(objeto, nombre)
            if isinstance(valor, list):
                validos = [i.identifier for i in objeto.bl_rna.properties[nombre].enum_items]
                valor = next((v for v in valor if v in validos), previo[ruta])
            setattr(objeto, nombre, valor)
        except Exception as error:
            print('Geoda: se omitió', ruta, error)
    escena[CLAVE] = previo
    print('Geoda: ajustes aplicados. Ejecuta el script otra vez para deshacerlos.')
`;
}
