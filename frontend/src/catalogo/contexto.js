import { createContext, useContext } from 'react';

export const ContextoCatalogo = createContext(null);

// {cursos, version, origen: 'app'|'servidor', buscarCurso(id), actualizar()}
export function useCatalogo() {
  const valor = useContext(ContextoCatalogo);
  if (!valor) throw new Error('useCatalogo debe usarse dentro de <CatalogoProvider>');
  return valor;
}
