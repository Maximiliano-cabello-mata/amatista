import { describe, expect, it } from 'vitest';
import { interpretarPublicacion } from './publicacion';
import { decidir } from './plan';

const estado = {
  contrato: 'g7b.geoda.estado/1',
  estado: 'conectado',
  cubo: { version: 'v1', mediciones: 3003, aceptadas: 3, revision: 3000, recomendaciones_habilitadas: false },
  conocimiento: { documentos: 992 },
  perfiles: [],
};

describe('G7B -> Geoda -> Amatista', () => {
  it('acepta agregados verificables sin recomendarlos como FPS', () => {
    const p = interpretarPublicacion(estado);
    expect(p).toMatchObject({ mediciones: 3003, documentos: 992, aceptadas: 3, revision: 3000 });
    const plan = decidir({ so: 'Windows', ramGb: 8, gpu: { nombre: 'Intel UHD' } }, p.perfiles);
    expect(plan.perfil.estado).toBe('base');
    expect(plan.contrato).toBe('g7b.plan/1');
  });

  it('acepta una copia previa cuando G7B no responde', () => {
    expect(interpretarPublicacion({ ...estado, estado: 'cache' })?.estado).toBe('cache');
    expect(interpretarPublicacion({ ...estado, estado: 'sin_conexion' })).toBeNull();
  });

  it('rechaza métricas inconsistentes y perfiles no certificados', () => {
    expect(interpretarPublicacion({ ...estado, cubo: { ...estado.cubo, aceptadas: 30 } })).toBeNull();
    expect(interpretarPublicacion({ ...estado, perfiles: [{ nivel: 'N2' }] })).toBeNull();
    expect(interpretarPublicacion({ ...estado, contrato: 'falso' })).toBeNull();
  });
});
