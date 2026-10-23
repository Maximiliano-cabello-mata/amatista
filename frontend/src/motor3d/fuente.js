// El Motor Web como un <script> que viaja dentro de la página que el alumno descarga del
// Estudio: así su escena funciona igual fuera de Amatista (solo necesita A-Frame). Se arma con
// el código fuente de los archivos del motor, sin sus import/export, dentro de una función.
import azar from './azar.js?raw';
import calidad from './calidad.js?raw';
import componentes from './componentes.js?raw';
import entorno from './entorno.js?raw';
import retos from './retos.js?raw';

const ORDEN = [azar, entorno, retos, calidad, componentes];

export function sinModulos(fuente) {
  return fuente
    .replace(/^import\s[^;]+;\s*$/gm, '')
    .replace(/^export\s+(?=(const|function|let|class)\b)/gm, '');
}

export function scriptMotor() {
  return `(function () {\n${ORDEN.map(sinModulos).join('\n')}\nregistrarMotor(window.AFRAME);\n})();`;
}

// ¿El código usa algún componente del motor (am-…)?
export const usaMotor = (codigo) => /\sam-[a-z]/.test(String(codigo));
