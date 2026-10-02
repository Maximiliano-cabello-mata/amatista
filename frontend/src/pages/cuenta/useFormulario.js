import { useCallback, useState } from 'react';
import { validar } from '../../auth/validacion';

// Estado de un formulario de cuenta: valores, errores por campo, error
// general y "enviando" (el botón se deshabilita mientras tanto).
export function useFormulario(iniciales, reglas = {}) {
  const [valores, setValores] = useState(iniciales);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = useCallback(
    (campo) => (valor) => {
      setValores((previos) => ({ ...previos, [campo]: valor }));
      // El error del campo se borra al corregirlo.
      setErrores((previos) => (previos[campo] ? { ...previos, [campo]: null } : previos));
    },
    [],
  );

  // Valida y, si todo está bien, ejecuta `accion(valores)`. Si algo falla,
  // lleva el foco al primer campo con error.
  const enviar = (accion) => async (evento) => {
    evento.preventDefault();
    if (enviando) return;
    const formulario = evento.currentTarget;
    const encontrados = validar(reglas, valores);
    setErrores(encontrados);
    setError(null);
    const primero = Object.keys(encontrados)[0];
    if (primero) {
      formulario.elements.namedItem(primero)?.focus();
      return;
    }
    setEnviando(true);
    try {
      const resultado = await accion(valores);
      if (resultado && !resultado.ok) setError(resultado.error ?? 'No se pudo completar. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return { valores, setValores, cambiar, errores, error, setError, enviando, enviar };
}
