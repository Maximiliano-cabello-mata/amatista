import { createContext, useContext } from 'react';

export const ContextoVista = createContext(null);

// {equipo, modo ('admin' | 'alumno'), comoAlumno, revision, cambiarModo(modo)}.
// Fuera del proveedor (pruebas de componentes sueltos) se comporta como alumno.
const POR_DEFECTO = { equipo: false, modo: 'alumno', comoAlumno: true, revision: false, cambiarModo: () => {} };

export function useVista() {
  return useContext(ContextoVista) ?? POR_DEFECTO;
}
