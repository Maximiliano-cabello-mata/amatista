// La fórmula Amatista ("Ciclo del Cristal"): los 5 pasos de cada módulo.
import { IconoExplora, IconoGancho, IconoJefe, IconoPractica, IconoReto } from './IconosPanel';

export const FORMULA = [
  {
    paso: 'gancho',
    nombre: 'Gancho',
    duracion: '2–4 min',
    descripcion: 'Una pregunta o un reto visual que despierta tu curiosidad.',
    Icono: IconoGancho,
  },
  {
    paso: 'explora',
    nombre: 'Explora',
    duracion: '5–8 min',
    descripcion: 'Descubres el concepto manipulando escenas 3D, tarjetas y parejas.',
    Icono: IconoExplora,
  },
  {
    paso: 'practica',
    nombre: 'Practica',
    duracion: '6–10 min',
    descripcion: 'Lo aplicas con guía y te enteras al instante de si vas bien.',
    Icono: IconoPractica,
  },
  {
    paso: 'reto',
    nombre: 'Reto',
    duracion: '8–15 min',
    descripcion: 'Creas algo propio: un mini proyecto con un criterio claro de logro.',
    Icono: IconoReto,
  },
  {
    paso: 'jefe',
    nombre: 'Jefe',
    duracion: 'Examen final',
    descripcion: 'Apruébalo con 80 % o más y gana la insignia del módulo.',
    Icono: IconoJefe,
  },
];
