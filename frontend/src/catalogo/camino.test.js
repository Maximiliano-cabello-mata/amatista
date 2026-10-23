import { describe, expect, it } from 'vitest';
import { cursos } from '../data/cursos';
import { SOFTWARE } from '../data/software';
import { caminoDePrograma, caminos, programaInicial, resumenCorto } from './camino';

const blender = SOFTWARE.find((s) => s.id === 'blender');
const progresoCon = (claves) => ({
  lecciones: Object.fromEntries(claves.map((clave) => [clave, { completada: true }])),
  insignias: {},
});

describe('camino guiado', () => {
  it('resume la descripción de un módulo en una oración', () => {
    expect(resumenCorto('Pierde el miedo a la pantalla de Blender: conoce sus zonas. Luego más.')).toBe('Pierde el miedo a la pantalla de Blender.');
    expect(resumenCorto('Entra a la pieza. Modela una mesa con extrusiones. Luego más.')).toBe('Entra a la pieza. Modela una mesa con extrusiones.');
    expect(resumenCorto('Una sola idea sin punto')).toBe('Una sola idea sin punto');
    expect(resumenCorto('')).toBe('');
    expect(resumenCorto('a '.repeat(200)).length).toBeLessThanOrEqual(141);
  });

  it('numera los módulos de Blender en orden, por nivel, y marca el primero como siguiente', () => {
    const camino = caminoDePrograma(blender, cursos, null);
    expect(camino.disponible).toBe(true);
    expect(camino.niveles[0].curso.id).toBe('blender_principiante');
    expect(camino.pasos.map((p) => p.numero)).toEqual(camino.pasos.map((_, i) => i + 1));
    expect(camino.pasos[0].estado).toBe('siguiente');
    expect(camino.pasos.filter((p) => p.estado === 'siguiente')).toHaveLength(1);
    expect(camino.pasos[0].href).toMatch(/^#\/curso\/blender_principiante\/leccion\//);
    expect(camino.niveles[0].abierto).toBe(true);
    // Avanzado sigue bloqueado: sus pasos no cuentan en el total.
    expect(camino.pasos.some((p) => p.estado === 'bloqueado')).toBe(true);
    expect(camino.total).toBe(camino.pasos.filter((p) => p.curso.estado !== 'bloqueado' && p.modulo.contenido).length);
  });

  it('sigue al alumno: un módulo empezado es el siguiente y uno terminado queda hecho', () => {
    const inicial = caminoDePrograma(blender, cursos, null);
    const [primero, segundo] = inicial.pasos;
    const progreso = progresoCon([
      ...primero.lecciones.map((l) => `blender_principiante:${l.id}`),
      `blender_principiante:${segundo.lecciones[0].id}`,
    ]);
    const camino = caminoDePrograma(blender, cursos, progreso);
    expect(camino.pasos[0].estado).toBe('hecho');
    expect(camino.pasos[1].estado).toBe('siguiente');
    expect(camino.pasos[1].hechas).toBe(1);
    expect(camino.pasos[1].href).toContain(segundo.lecciones[1].id);
    expect(camino.hechos).toBe(1);
  });

  it('los programas que vienen no tienen pasos y el inicial respeta la elección', () => {
    const lista = caminos(cursos, null);
    expect(lista.map((c) => c.software.id)).toEqual(SOFTWARE.map((s) => s.id));
    const maya = lista.find((c) => c.software.id === 'maya');
    expect(maya.disponible).toBe(false);
    expect(maya.pasos).toEqual([]);
    expect(programaInicial(lista)).toBe('blender');
    expect(programaInicial(lista, { elegido: 'aframe' })).toBe('aframe');
    expect(programaInicial(lista, { elegido: 'inventado', ultimoCurso: 'aframe' })).toBe('aframe');
  });
});
