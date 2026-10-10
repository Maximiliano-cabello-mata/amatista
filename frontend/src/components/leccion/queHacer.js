// «Qué hacer aquí»: la instrucción de una línea que abre cada lección, para
// que el alumno sepa desde el principio cómo se completa. Función pura
// (pruebas en queHacer.test.js).
import { actividadesDe } from './interactivos/logica';

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

export function queHacer(leccion, { completada = false, enBlender = false, jefe = null, xp = 100 } = {}) {
  if (!leccion) return null;
  if (completada) {
    return leccion.type === 'exam'
      ? 'Ya venciste a este jefe. Puedes volver a enfrentarlo para repasar.'
      : 'Ya completaste esta lección. Repásala cuando quieras: tu avance no cambia.';
  }
  if (leccion.type === 'exam') {
    const preguntas = leccion.quizData?.questions?.length ?? 0;
    const minimo = leccion.quizData?.passingScore;
    const contra = jefe ? ` a ${jefe}` : ' al jefe';
    return `Responde ${plural(preguntas, 'pregunta', 'preguntas')}: cada acierto le quita vida${contra}.${
      minimo ? ` Apruebas con ${minimo}% y ganas la insignia del módulo.` : ''
    } Si no lo vences, puedes reintentarlo.`;
  }
  if (enBlender) {
    return 'Esta lección se hace en Blender: abre la práctica con el botón de abajo, hazla en Blender y vuelve aquí. Tu avance aparece solo.';
  }
  const requeridas = actividadesDe(leccion.contentBlocks).filter((a) => a.requerida).length;
  if (!requeridas) return `Lee con calma y pulsa «Completar lección» al final (+${xp} XP).`;
  return `Lee, resuelve ${plural(requeridas, 'actividad', 'actividades')} y pulsa «Completar lección» al final (+${xp} XP).`;
}
