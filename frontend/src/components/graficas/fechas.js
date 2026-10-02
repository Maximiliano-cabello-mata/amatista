// Fechas locales "YYYY-MM-DD" para las gráficas por día y semana (funciones puras).
import { fechaLocal, sumarDias } from '../../progreso/reglas';

export const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const DIAS_CORTOS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

const partes = (fecha) => fechaLocal(fecha).split('-').map(Number);

// 0 = lunes … 6 = domingo (la semana empieza el lunes, como se usa en español).
export function diaSemana(fecha) {
  const [anio, mes, dia] = partes(fecha);
  return (new Date(anio, mes - 1, dia).getDay() + 6) % 7;
}

export function inicioSemana(fecha = new Date()) {
  return sumarDias(fechaLocal(fecha), -diaSemana(fecha));
}

// "2026-10-02" → "vie 2 oct" (con anio: "2 oct 2026").
export function fechaCorta(fecha, { conDia = true, conAnio = false } = {}) {
  const [anio, mes, dia] = partes(fecha);
  const texto = `${dia} ${MESES_CORTOS[mes - 1]}${conAnio ? ` ${anio}` : ''}`;
  return conDia ? `${DIAS_CORTOS[diaSemana(fecha)]} ${texto}` : texto;
}

export const mesDe = (fecha) => partes(fecha)[1] - 1;
export const diaDelMes = (fecha) => partes(fecha)[2];
