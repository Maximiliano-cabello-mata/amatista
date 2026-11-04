// Íconos low poly: solo polígonos de caras planas, sin degradados.

export function CristalLogo({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <polygon points="32,2 10,22 32,26" fill="#D2A8F0" />
      <polygon points="32,2 54,22 32,26" fill="#B57EDC" />
      <polygon points="10,22 32,26 20,46" fill="#9B59B6" />
      <polygon points="54,22 32,26 44,46" fill="#7D3C98" />
      <polygon points="20,46 32,26 32,62" fill="#8E44AD" />
      <polygon points="44,46 32,26 32,62" fill="#5B2C7A" />
      <polyline points="10,22 32,26 54,22" fill="none" stroke="#00E5FF" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

// Cubo facetado: el primer objeto que todos modelan en Blender.
export function IconoBlender({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <polygon points="32,4 58,18 32,18" fill="#FFB27A" />
      <polygon points="32,4 6,18 32,18" fill="#FBA062" />
      <polygon points="6,18 32,18 32,32" fill="#F58D48" />
      <polygon points="58,18 32,18 32,32" fill="#F8964F" />
      <polygon points="6,18 32,32 6,46" fill="#E06A1F" />
      <polygon points="6,46 32,32 32,60" fill="#C9591A" />
      <polygon points="58,18 32,32 58,46" fill="#A84A14" />
      <polygon points="58,46 32,32 32,60" fill="#8C3D10" />
    </svg>
  );
}

// Visor de realidad virtual: el destino de las escenas A-Frame.
export function IconoAFrame({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <polygon points="6,22 14,14 32,14 32,42 26,50 14,50 6,44" fill="#00B8CC" />
      <polygon points="58,22 50,14 32,14 32,42 38,50 50,50 58,44" fill="#008A99" />
      <polygon points="6,22 14,14 50,14 58,22" fill="#5CF0FF" />
      <polygon points="13,32 16.5,26 23.5,26 27,32 23.5,38 16.5,38" fill="#121212" />
      <polygon points="37,32 40.5,26 47.5,26 51,32 47.5,38 40.5,38" fill="#121212" />
      <polygon points="16.5,26 23.5,26 20,31" fill="#1E3A40" />
      <polygon points="40.5,26 47.5,26 44,31" fill="#1E3A40" />
    </svg>
  );
}

export function IconoCandado({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M7 10V7a5 5 0 0 1 10 0v3" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <polygon points="4,10 20,10 20,21 4,21" fill="currentColor" />
    </svg>
  );
}

// Amatista Cloud (Blender en la nube): nube facetada cian con el cubo naranja de Blender flotando dentro.
export function IconoCloud({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <polygon points="18,24 28,14 42,14 50,24 34,28" fill="#5CF0FF" />
      <polygon points="8,36 18,24 34,28 24,44" fill="#00E5FF" />
      <polygon points="34,28 50,24 58,36 46,44" fill="#00B8CC" />
      <polygon points="8,36 24,44 46,44 58,36 52,48 12,48" fill="#008A99" />
      <polygon points="32,26 42,32 32,38 22,32" fill="#FFB27A" />
      <polygon points="22,32 32,38 32,50 22,44" fill="#F5792A" />
      <polygon points="42,32 32,38 32,50 42,44" fill="#C9591A" />
    </svg>
  );
}

// Biblioteca 3D: prisma de modelos, texturas y esferas low poly.
export function IconoBiblioteca({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <polygon points="10,12 24,8 24,52 10,56" fill="#D2A8F0" />
      <polygon points="24,8 30,12 30,56 24,52" fill="#8E44AD" />
      <polygon points="30,16 44,12 44,54 30,56" fill="#B57EDC" />
      <polygon points="44,12 54,18 54,56 44,54" fill="#5B2C7A" />
      <polygon points="40,26 52,32 40,38 28,32" fill="#5CF0FF" />
      <polygon points="28,32 40,38 40,50 28,44" fill="#00B8CC" />
      <polygon points="52,32 40,38 40,50 52,44" fill="#008A99" />
    </svg>
  );
}

// Geoda (Ajustar a mi PC): roca abierta revelando cristales esmeralda y amatista brillantes.
export function IconoGeoda({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <polygon points="32,4 52,14 58,36 46,56 18,56 6,36 12,14" fill="#2A2636" />
      <polygon points="32,10 46,18 52,36 42,50 22,50 12,36 18,18" fill="#183832" />
      <polygon points="32,14 40,26 32,34 24,26" fill="#6EE7B7" />
      <polygon points="24,26 32,34 26,46 16,36" fill="#34D399" />
      <polygon points="40,26 48,36 38,46 32,34" fill="#10B981" />
      <polygon points="32,34 38,46 26,46" fill="#059669" />
      <polygon points="32,18 36,28 32,32 28,28" fill="#A7F3D0" />
    </svg>
  );
}

// Ecosistema (¿Qué es cada cosa?): constelación de tres gemas conectadas.
export function IconoEcosistema({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <polyline points="32,16 16,44 48,44 32,16" fill="none" stroke="#00E5FF" strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points="32,6 42,16 32,26 22,16" fill="#D2A8F0" />
      <polygon points="16,34 26,44 16,54 6,44" fill="#F5792A" />
      <polygon points="48,34 58,44 48,54 38,44" fill="#00E5FF" />
    </svg>
  );
}
