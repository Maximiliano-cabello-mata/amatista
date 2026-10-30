import { describe, expect, it } from 'vitest';
import { estadoInicial, registrar } from './frustracion';

const pasar = (eventos, inicio = 0) => {
  let estado = estadoInicial();
  return eventos.map((evento, i) => {
    const r = registrar(estado, evento, inicio + i * 60000);
    estado = r.estado;
    return r.aviso?.clave ?? null;
  });
};

describe('frustración', () => {
  it('no interrumpe al primer fallo', () => {
    expect(pasar([{ tipo: 'actividad', correcto: false }])).toEqual([null]);
  });

  it('se acerca con dos fallos seguidos y celebra cuando sale', () => {
    expect(pasar([{ tipo: 'actividad', correcto: false }, { tipo: 'actividad', correcto: false }, { tipo: 'actividad', correcto: true }])).toEqual([
      null,
      'apoyo0',
      'perseveraste',
    ]);
  });

  it('al tercer intento fallido dentro de una actividad ya ayuda', () => {
    expect(pasar([{ tipo: 'intento', fallos: 1 }, { tipo: 'intento', fallos: 2 }, { tipo: 'intento', fallos: 3 }, { tipo: 'actividad', correcto: true, intentos: 4 }])).toEqual([
      null,
      null,
      'apoyo0',
      'perseveraste',
    ]);
  });

  it('un examen sin aprobar siempre recibe apoyo', () => {
    expect(pasar([{ tipo: 'examen', aprobado: false }])).toEqual(['examen']);
  });

  it('no agobia: como mucho un apoyo cada 45 s', () => {
    let estado = estadoInicial();
    const a = registrar(estado, { tipo: 'intento', fallos: 3 }, 0);
    estado = a.estado;
    const b = registrar(estado, { tipo: 'intento', fallos: 4 }, 10000);
    expect(a.aviso?.clave).toBe('apoyo0');
    expect(b.aviso).toBeNull();
  });

  it('tras varios apoyos sugiere una pausa', () => {
    const fallo = { tipo: 'intento', fallos: 3 };
    expect(pasar([fallo, fallo, fallo])).toEqual(['apoyo0', 'apoyo1', 'pausa']);
  });
});
