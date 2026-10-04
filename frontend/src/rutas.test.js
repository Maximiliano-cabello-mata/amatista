import { describe, expect, it } from 'vitest';
import { analizarRuta, destinoTrasEntrar, rutaEntrar, rutas } from './rutas';

describe('rutas', () => {
  it('páginas del contrato', () => {
    expect(analizarRuta('')).toMatchObject({ pagina: 'inicio' });
    expect(analizarRuta('#/')).toMatchObject({ pagina: 'inicio' });
    for (const pagina of ['panel', 'laboratorio', 'blender', 'vincular', 'entrar', 'registro', 'confirmar', 'recuperar', 'perfil']) {
      expect(analizarRuta(`#/${pagina}`)).toMatchObject({ pagina });
    }
    expect(analizarRuta(rutas.curso('blender'))).toMatchObject({ pagina: 'curso', cursoId: 'blender' });
    expect(analizarRuta(rutas.leccion('blender', 'les_001'))).toMatchObject({
      pagina: 'leccion',
      cursoId: 'blender',
      leccionId: 'les_001',
    });
  });

  it('admin recibe sección y parámetros', () => {
    expect(analizarRuta('#/admin')).toMatchObject({ pagina: 'admin', seccion: 'resumen', params: {} });
    expect(analizarRuta('#/admin/usuarios')).toMatchObject({ seccion: 'usuarios' });
    expect(analizarRuta(rutas.adminUsuario('usr-1'))).toMatchObject({ seccion: 'usuario', params: { id: 'usr-1' } });
    expect(analizarRuta('#/admin/contenido')).toMatchObject({ seccion: 'contenido' });
    expect(analizarRuta(rutas.adminSistema)).toMatchObject({ seccion: 'sistema', params: {} });
    expect(analizarRuta(rutas.adminPracticas)).toMatchObject({ seccion: 'practicas', params: {} });
    expect(analizarRuta('#/vincular?codigo=ABCD-2345')).toMatchObject({ pagina: 'vincular', consulta: { codigo: 'ABCD-2345' } });
    expect(analizarRuta(rutas.adminLeccion('blender', 'les_001'))).toMatchObject({
      seccion: 'leccion',
      params: { cursoId: 'blender', leccionId: 'les_001' },
    });
    expect(analizarRuta(rutas.adminNuevaLeccion('mod_teoria_001'))).toMatchObject({
      seccion: 'nueva-leccion',
      params: { moduloId: 'mod_teoria_001' },
    });
  });

  it('consulta y destino tras entrar', () => {
    const enlace = rutaEntrar('#/perfil');
    expect(enlace).toBe('#/entrar?volver=%23%2Fperfil');
    const ruta = analizarRuta(enlace);
    expect(ruta).toMatchObject({ pagina: 'entrar', consulta: { volver: '#/perfil' } });
    expect(destinoTrasEntrar(ruta.consulta)).toBe('#/perfil');
    expect(destinoTrasEntrar({ volver: 'https://malo.com' })).toBe(rutas.panel);
    expect(rutaEntrar('#/entrar')).toBe(rutas.entrar);
  });
});
