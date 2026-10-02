// Íconos low poly del panel y de la fórmula Amatista: caras planas en
// `currentColor` con distinta opacidad, así toman el color del texto (y se
// ven grises cuando algo está bloqueado).

const cara = (opacidad) => ({ fill: 'currentColor', fillOpacity: opacidad });

// 1. Gancho: el anzuelo que despierta la curiosidad.
export function IconoGancho({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polygon points="14,1.5 17.5,3.5 17.5,6 14,6" {...cara(0.6)} />
      <polygon points="14.2,6 16.8,6 16.8,15.5 14.2,15.5" {...cara(1)} />
      <polygon points="14.2,15.5 16.8,15.5 13.2,20.8 11.4,18.6" {...cara(0.8)} />
      <polygon points="11.4,18.6 13.2,20.8 8.4,20.8 8.6,18.4" {...cara(0.65)} />
      <polygon points="8.6,18.4 8.4,20.8 5.2,16.2 7.4,15.4" {...cara(0.8)} />
      <polygon points="5.2,16.2 7.4,15.4 6.6,11 3.2,13.2" {...cara(1)} />
    </svg>
  );
}

// 2. Explora: lupa de lente hexagonal.
export function IconoExplora({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polygon points="10,2.5 16.5,6.2 16.5,13.8 10,17.5 3.5,13.8 3.5,6.2" {...cara(0.25)} />
      <polygon points="10,2.5 16.5,6.2 10,10" {...cara(0.45)} />
      <polygon points="3.5,6.2 10,2.5 10,10" {...cara(0.6)} />
      <path d="M10 2.5 L16.5 6.2 L16.5 13.8 L10 17.5 L3.5 13.8 L3.5 6.2 Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <polygon points="15.2,16.6 17,14.8 22,19.8 20.2,21.6" {...cara(1)} />
    </svg>
  );
}

// 3. Practica: martillo.
export function IconoPractica({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polygon points="3,4 14,4 17,7.5 3,7.5" {...cara(0.75)} />
      <polygon points="3,7.5 17,7.5 14,11 3,11" {...cara(1)} />
      <polygon points="17,7.5 21,5.5 21,9.5" {...cara(0.55)} />
      <polygon points="8,11 11,11 11,22 8,22" {...cara(0.85)} />
      <polygon points="8,11 9.5,11 9.5,22 8,22" {...cara(1)} />
    </svg>
  );
}

// 4. Reto: bandera en la cima.
export function IconoReto({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polygon points="4,2 6,2 6,22 4,22" {...cara(1)} />
      <polygon points="6,3 19,5.5 14.5,9 6,9" {...cara(0.85)} />
      <polygon points="6,9 14.5,9 19,13.5 6,14.5" {...cara(0.6)} />
      <polygon points="2,22 22,22 18,18.5 7,18.5" {...cara(0.4)} />
    </svg>
  );
}

// 5. Jefe: corona del examen final.
export function IconoJefe({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polygon points="2.5,7 8,12 3.5,17.5" {...cara(0.7)} />
      <polygon points="21.5,7 16,12 20.5,17.5" {...cara(0.5)} />
      <polygon points="12,3 8,12 12,17.5" {...cara(1)} />
      <polygon points="12,3 16,12 12,17.5" {...cara(0.75)} />
      <polygon points="3.5,17.5 8,12 12,17.5" {...cara(0.85)} />
      <polygon points="20.5,17.5 16,12 12,17.5" {...cara(0.6)} />
      <polygon points="3.5,18.5 20.5,18.5 19.5,21.5 4.5,21.5" {...cara(1)} />
    </svg>
  );
}

// Racha: llama facetada.
export function IconoRacha({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polygon points="12,1.5 18.5,10 12,12" {...cara(0.75)} />
      <polygon points="12,1.5 5.5,11 12,12" {...cara(1)} />
      <polygon points="5.5,11 12,12 7.5,19.5" {...cara(0.85)} />
      <polygon points="18.5,10 12,12 16.5,19.5" {...cara(0.6)} />
      <polygon points="7.5,19.5 12,12 12,22.5" {...cara(0.7)} />
      <polygon points="16.5,19.5 12,12 12,22.5" {...cara(0.5)} />
    </svg>
  );
}

// Reto semanal: diana hexagonal.
export function IconoDiana({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 2 L20.7 7 L20.7 17 L12 22 L3.3 17 L3.3 7 Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7 L16.3 9.5 L16.3 14.5 L12 17 L7.7 14.5 L7.7 9.5 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.7" />
      <polygon points="12,10.2 13.6,11.1 13.6,12.9 12,13.8 10.4,12.9 10.4,11.1" {...cara(1)} />
    </svg>
  );
}

export function IconoPalomita({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polyline points="4,12.5 9.5,18 20,6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" />
    </svg>
  );
}

// Tutor IA: globo de diálogo con mirada de robot.
export function IconoTutor({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polygon points="3,4 21,4 21,16 12,16 6.5,21 7.5,16 3,16" {...cara(0.35)} />
      <polygon points="3,4 21,4 12,10" {...cara(0.5)} />
      <polygon points="7,8.5 10,8.5 10,11.5 7,11.5" {...cara(1)} />
      <polygon points="14,8.5 17,8.5 17,11.5 14,11.5" {...cara(1)} />
    </svg>
  );
}

// Galería de proyectos: marco con montañas low poly.
export function IconoGaleria({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M2.5 3.5 H21.5 V20.5 H2.5 Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <polygon points="4.5,18.5 10,9.5 13.5,15 15.5,12.5 19.5,18.5" {...cara(0.8)} />
      <polygon points="10,9.5 13.5,15 8.5,18.5" {...cara(0.5)} />
      <polygon points="16,5.5 18.5,5.5 19,8 17.2,9.5 15.5,8" {...cara(1)} />
    </svg>
  );
}

// Retos de la comunidad: trofeo facetado.
export function IconoTrofeo({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polygon points="6,2.5 12,2.5 12,14 7,9.5" {...cara(1)} />
      <polygon points="18,2.5 12,2.5 12,14 17,9.5" {...cara(0.7)} />
      <polygon points="6,4 2.5,4 3.5,8.5 6.8,9.2" {...cara(0.5)} />
      <polygon points="18,4 21.5,4 20.5,8.5 17.2,9.2" {...cara(0.5)} />
      <polygon points="10.5,14 13.5,14 14,18 10,18" {...cara(0.85)} />
      <polygon points="6.5,18.5 17.5,18.5 18.5,21.5 5.5,21.5" {...cara(1)} />
    </svg>
  );
}

// Interactivo: puntero sobre una cara.
export function IconoPuntero({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polygon points="3,3 21,3 21,12 13,12 11,21 3,21" {...cara(0.25)} />
      <polygon points="9,8 20,13.5 15.5,15 18.8,20.2 16.8,21.5 13.5,16.3 10.5,19.5" {...cara(1)} />
      <polygon points="9,8 15.5,15 10.5,19.5" {...cara(0.7)} />
    </svg>
  );
}

// Sin conexión: dispositivo con la app guardada adentro.
export function IconoDispositivo({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M6 2 H18 V22 H6 Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <polygon points="12,6 15.5,9.5 12,11" {...cara(0.75)} />
      <polygon points="12,6 8.5,9.5 12,11" {...cara(1)} />
      <polygon points="8.5,9.5 12,11 12,16.5" {...cara(0.85)} />
      <polygon points="15.5,9.5 12,11 12,16.5" {...cara(0.55)} />
      <polygon points="10.5,19 13.5,19 13.5,20 10.5,20" {...cara(1)} />
    </svg>
  );
}
