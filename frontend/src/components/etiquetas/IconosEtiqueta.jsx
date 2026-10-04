// Íconos de las etiquetas (v3.1): mismo lenguaje low poly que IconosPanel
// (caras planas en currentColor con distinta opacidad), a 16 px.
const cara = (opacidad) => ({ fill: 'currentColor', fillOpacity: opacidad });

function Svg({ className = '', children }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

// Lectura: libro abierto.
export function IconoLectura({ className }) {
  return (
    <Svg className={className}>
      <polygon points="1,3 7.5,4 7.5,14 1,13" {...cara(0.85)} />
      <polygon points="8.5,4 15,3 15,13 8.5,14" {...cara(0.55)} />
    </Svg>
  );
}

// Interactiva: puntero sobre un hexágono.
export function IconoInteractiva({ className }) {
  return (
    <Svg className={className}>
      <polygon points="7,1 12.5,4 12.5,9 7,12 1.5,9 1.5,4" {...cara(0.3)} />
      <polygon points="7,5 14.5,9 11,10 13,14.5 11.3,15 9.3,10.8 7,13" {...cara(1)} />
    </Svg>
  );
}

// Video: pantalla con triángulo.
export function IconoVideo({ className }) {
  return (
    <Svg className={className}>
      <polygon points="1,3 15,3 15,13 1,13" {...cara(0.35)} />
      <polygon points="6,5.5 11,8 6,10.5" {...cara(1)} />
    </Svg>
  );
}

// Código: llaves angulares.
export function IconoCodigo({ className }) {
  return (
    <Svg className={className}>
      <polygon points="5,3 6.5,4.2 3.4,8 6.5,11.8 5,13 1,8" {...cara(1)} />
      <polygon points="11,3 15,8 11,13 9.5,11.8 12.6,8 9.5,4.2" {...cara(0.7)} />
    </Svg>
  );
}

// Examen: corona del jefe.
export function IconoExamen({ className }) {
  return (
    <Svg className={className}>
      <polygon points="1.5,5 5,8 8,2.5 11,8 14.5,5 13,12 3,12" {...cara(0.9)} />
      <polygon points="3,12.8 13,12.8 13,14.5 3,14.5" {...cara(0.6)} />
    </Svg>
  );
}

// Práctica en Blender: cubo con sus tres caras.
export function IconoCubo({ className }) {
  return (
    <Svg className={className}>
      <polygon points="8,1 14.5,4.5 8,8 1.5,4.5" {...cara(1)} />
      <polygon points="1.5,4.5 8,8 8,15 1.5,11.5" {...cara(0.7)} />
      <polygon points="8,8 14.5,4.5 14.5,11.5 8,15" {...cara(0.45)} />
    </Svg>
  );
}

// Duración: reloj de arena low poly.
export function IconoReloj({ className }) {
  return (
    <Svg className={className}>
      <polygon points="3,1.5 13,1.5 8,8" {...cara(0.85)} />
      <polygon points="8,8 13,14.5 3,14.5" {...cara(0.5)} />
    </Svg>
  );
}

// Nivel: tres barras escalonadas.
export function IconoNivel({ className }) {
  return (
    <Svg className={className}>
      <polygon points="1.5,10 5,10 5,14.5 1.5,14.5" {...cara(1)} />
      <polygon points="6.3,6 9.7,6 9.7,14.5 6.3,14.5" {...cara(0.75)} />
      <polygon points="11,2 14.5,2 14.5,14.5 11,14.5" {...cara(0.5)} />
    </Svg>
  );
}

// Insignia: cristal hexagonal.
export function IconoInsignia({ className }) {
  return (
    <Svg className={className}>
      <polygon points="8,1 14,4.5 8,8" {...cara(0.6)} />
      <polygon points="2,4.5 8,1 8,8" {...cara(0.9)} />
      <polygon points="2,4.5 8,8 8,15 2,11.5" {...cara(0.75)} />
      <polygon points="8,8 14,4.5 14,11.5 8,15" {...cara(0.45)} />
    </Svg>
  );
}

// Nuevo: destello de cuatro puntas.
export function IconoNuevo({ className }) {
  return (
    <Svg className={className}>
      <polygon points="8,0.5 9.8,6.2 15.5,8 9.8,9.8 8,15.5 6.2,9.8 0.5,8 6.2,6.2" {...cara(1)} />
    </Svg>
  );
}

// Guía: el acompañante (burbuja de diálogo).
export function IconoGuia({ className }) {
  return (
    <Svg className={className}>
      <polygon points="1,2 15,2 15,11 7,11 3.5,14.5 4,11 1,11" {...cara(0.85)} />
      <polygon points="4,5.5 12,5.5 12,7 4,7" fill="#1E1E1E" />
    </Svg>
  );
}

// Teclado: una tecla.
export function IconoTecla({ className }) {
  return (
    <Svg className={className}>
      <polygon points="1.5,3 14.5,3 14.5,13 1.5,13" {...cara(0.4)} />
      <polygon points="3,4.5 13,4.5 13,10.5 3,10.5" {...cara(0.9)} />
    </Svg>
  );
}

// Comparar: dos mitades.
export function IconoComparar({ className }) {
  return (
    <Svg className={className}>
      <polygon points="1,2 7.3,2 7.3,14 1,14" {...cara(0.45)} />
      <polygon points="8.7,2 15,2 15,14 8.7,14" {...cara(0.95)} />
    </Svg>
  );
}
