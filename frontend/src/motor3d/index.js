// Punto de entrada del Motor Web de Amatista dentro de la PWA: carga A-Frame (~1.3 MB, solo
// cuando una lección o el Estudio lo piden) y registra los componentes am-* una sola vez.
import 'aframe';
import { registrarMotor } from './componentes';

registrarMotor(window.AFRAME);

export { VERSION_MOTOR } from './componentes';
