# Presentación de Hack4Edu · Reto 2 (5:00)

El video de la presentación, hecho con la misma técnica que la película (`../pelicula`): cada cuadro es
una función pura del tiempo, se dibuja en el navegador con React y se captura cuadro por cuadro.

- **Fuente:** `frontend/presentacion/` (solo desarrollo, no entra a la PWA). Vista previa con audio:
  `cd frontend && npx vite --port 5173` → <http://localhost:5173/presentacion/> (`?t=95` empieza en ese segundo).
- **Sigue la voz exactamente.** La voz se transcribió con Whisper palabra por palabra; cada elemento entra
  cuando se dice su palabra (`tiempos.js`: subtítulos, capítulos y el texto oficial del reto).
- **Línea de tiempo.** 4 s de apertura, la voz (233.7 s), un hueco de 52 s en el segundo 78.1 para
  «Nuestra historia» (sin voz, con texto y música) y la tarjeta final: 5:00 exactos.
- **Armar el video:** `bash docs/hack4edu/video/presentacion/armar.sh` → `salida/` (no se versiona).

## Escenas

| Capítulo | Escenas |
|---|---|
| 01 · El problema | Apertura y equipo · El reto (texto oficial, palabra por palabra) · La brecha (20,900+ y 1,500+) · El colapso · **Nuestra historia** |
| 02 · La solución | Amatista · Pilar 1: la PWA · Pilar 2: el add-on de Blender · **Geoda, el corazón de Amatista** |
| 03 · Telemetría | Practica sin conexión · Vuelve la red (telemetría ligera, FastAPI, SQL, códigos y roles) · El panel del profesor |
| 04 · Inclusión y escala | Inclusivo y equitativo · Piloto y costo · Mercado global · Cierre |

## Color (psicología de la amatista)

- **Violeta profundo** (`#0d0716` → `#2a1240`): confianza y calma para escuchar; es el fondo.
- **Amatista y lavanda** (`#9b59b6`, `#c39bd3`, `#e8daef`): creatividad y aprendizaje; títulos y tarjetas.
- **Cian** (`#00e5ff`): tecnología y claridad; solo para datos, estados técnicos y Geoda.
- **Magenta** (`#ff6fae`): lo humano (alumnos, docentes, nuestra historia); se usa poco para que destaque.

## Audio

- **Voz** (`voz_mejorada.wav`): filtro de graves, reducción de ruido leve, ecualización de presencia,
  de-esser, compresión suave y −16 LUFS. Sin cambiar el tono: se oye clara y natural, no robótica.
- **Música** (`musica.py`): sintetizada desde cero con las piezas de `../pelicula/musica.py` (sin licencias de
  terceros). Va por debajo de la voz (sidechain, ~19 dB abajo) y se oye más donde no hay voz.
