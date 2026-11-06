// Si el montaje dibuja un fondo único (sin escalar), las escenas no dibujan el suyo.
import { createContext } from 'react';

export const FondoGlobal = createContext(false);
