import { createContext, useContext } from 'react';

// {activo, indice, empezar(), siguiente(), anterior(), cerrar(), visto, descartar()}
export const RecorridoContexto = createContext(null);

const SIN_PROVEEDOR = { activo: false, indice: 0, visto: true, empezar() {}, siguiente() {}, anterior() {}, cerrar() {}, descartar() {} };

export const useRecorrido = () => useContext(RecorridoContexto) ?? SIN_PROVEEDOR;
