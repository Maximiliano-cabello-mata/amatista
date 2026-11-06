import { FORMULA } from '../panel/formula';

export const CLAVE_PROGRAMA = 'amatista:programa';
export const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
export const horas = (minutos) => (minutos >= 90 ? `${Math.round(minutos / 6) / 10} h` : `${minutos} min`);

export const QUE_CREAS = {
  blender: 'Objetos, personajes y escenas 3D libres',
  aframe: 'Mundos 3D abiertos para la web y realidad virtual',
};

export const SECRETOS_CRISTAL = [
  'Cada paso tiene su propio mundo, una mascota que te sigue con la mirada y un jefe final.',
  'Toca a la mascota de cualquier paso para que haga una pirueta y te dé un consejo de su mundo.',
  'Todo tu progreso se guarda primero en tu dispositivo: puedes avanzar incluso sin Internet.',
  'Abajo a la izquierda vive Goliat: tócalo si quieres una idea de proyecto o te atoras.',
];

export const COLORES_CHISPA = ['#9b59b6', '#00e5ff', '#f5792a', '#c39bd3'];

export const ICONO_FORMULA = Object.fromEntries(FORMULA.map((paso) => [paso.paso, paso.Icono]));
