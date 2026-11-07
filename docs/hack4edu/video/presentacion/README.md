# Presentación de Hack4Edu · Reto 2 (4:20)

El video de la presentación, hecho con la misma técnica que la película (`../pelicula`): cada cuadro es
una función pura del tiempo, se dibuja en el navegador con React y se captura cuadro por cuadro.

- **Fuente:** `frontend/presentacion/` (solo desarrollo, no entra a la PWA). Vista previa con audio:
  `cd frontend && npx vite --port 5173` → <http://localhost:5173/presentacion/> (`?t=95` empieza en ese segundo).
- **Sigue la voz exactamente.** La voz se transcribió con Whisper palabra por palabra; cada elemento entra
  cuando se dice su palabra (`tiempos.js`: subtítulos, capítulos y el texto oficial del reto).
- **Línea de tiempo.** Un prólogo de 16 s con **Nuestra historia** (lo que vivieron Maximiliano y Diana Paola
  como alumnos) que termina en «Por eso creamos…», la gema que se arma (4 s), **la voz completa y seguida**
  (233.7 s, sin pausas: la narrativa no se corta) y la tarjeta final: 4:20, dentro del límite de 5 minutos.
- **Demostraciones dentro del relato.** La plataforma real corre mientras la voz dice «Una aplicación web
  ultraligera…» y el add-on real arma el tren mientras dice «Un add-on integrado para Blender…»: cada toma y
  cada pieza entran con su palabra.
- **Armar el video:** `bash docs/hack4edu/video/presentacion/armar.sh` → `salida/` (no se versiona).

## Escenas

| Capítulo | Escenas |
|---|---|
| Prólogo | **Nuestra historia** → «Por eso creamos…» → la gema |
| 01 · El problema | Apertura y equipo · El reto (texto oficial, palabra por palabra) · La brecha (20,900+ y 1,500+) · El colapso |
| 02 · La solución | Amatista · Pilar 1: la aplicación web (demostración real) · Pilar 2: el complemento para Blender (demostración real) · **Geoda, el corazón de Amatista** |
| 03 · Telemetría | Practica sin conexión · Vuelve la red (telemetría ligera, FastAPI, SQL, códigos y roles) · El panel del profesor |
| 04 · Inclusión y escala | Inclusivo y equitativo · Piloto y costo · Mercado global · Cierre |

## Material real, sin trabas

- **Metraje de la plataforma** (`frontend/pelicula/media/<toma>_s`): las grabaciones originales tenían cuadros
  repetidos (en la ciudad 3D, 70 %: unos 9 cuadros por segundo reales). `suavizar.sh <toma>` quita los repetidos
  e interpola el movimiento a 30 cuadros por segundo con ffmpeg (`mpdecimate` + `minterpolate`).
- **Add-on en Blender** (`frontend/presentacion/media/addon/`): `grabar_addon.py` abre Blender 4.0 en una pantalla
  virtual (Xvfb, sin tarjeta gráfica), activa el add-on, abre la práctica del tren y la arma pieza por pieza como un
  alumno; captura la pantalla después de que el add-on revisa cada cambio. Cada imagen es un estado real.

  ```bash
  Xvfb :99 -screen 0 1920x1080x24 &
  DISPLAY=:99 SALIDA=capturas GALLIUM_DRIVER=llvmpipe MESA_GL_VERSION_OVERRIDE=4.5 \
    blender -p 0 0 1920 1080 --python docs/hack4edu/video/presentacion/grabar_addon.py
  ```

## Audio sin cortes

El audio original une varias grabaciones: hay 8 empalmes con huecos digitales de 28 a 92 ms. `voz.py` los rellena
con ruido de sala de la misma grabación y les pone fundidos de 12 ms; la música (sidechain) los cubre.

## Psicología del sonido

Para que el oído siga atento aunque la vista se distraiga (`musica.py`):

- **Motivo de Amatista** (Mi–Si–Mi en campanas): suena siempre con la marca (la gema, la revelación, cada pilar,
  Geoda, «hasta hoy» y la tarjeta final). El oído aprende la asociación y la reconoce.
- **Anticipación y recompensa:** una subida corta y un golpe en cada cifra (20,900+, 1,500+, 500+).
- **Ruptura de patrón:** la música se cae cuando «la red escolar colapsa» y baja 12 dB antes de «hasta hoy»,
  que entra 15 dB arriba con el acorde final.
- **Color emocional:** menor y grave en el problema, mayor y luminoso en la solución, sereno en la telemetría,
  cálido en la inclusión; clics de logro en cada pieza que revisa el add-on y latido en Geoda.

## Español neutro

Los textos en pantalla evitan regionalismos y tecnicismos en inglés donde hay palabra en español: «aplicación
web» (no «PWA»), «complemento para Blender», «servidor» (no «backend»), «Vuelve la conexión». Se conservan los
términos que dice la voz o el reto oficial (offline-first, add-on, FastAPI).

## Color (psicología de la amatista)

- **Violeta profundo** (`#0d0716` → `#2a1240`): confianza y calma para escuchar; es el fondo.
- **Amatista y lavanda** (`#9b59b6`, `#c39bd3`, `#e8daef`): creatividad y aprendizaje; títulos y tarjetas.
- **Cian** (`#00e5ff`): tecnología y claridad; solo para datos, estados técnicos y Geoda.
- **Magenta** (`#ff6fae`): lo humano (alumnos, docentes, nuestra historia); se usa poco para que destaque.
- **La luz del fondo cambia con la historia** (`linea.js › COLOR`): el problema en violeta apagado con alerta
  magenta; nuestra historia en magenta cálido; la solución en amatista brillante con cian; Geoda en cian; la
  sincronización en índigo sereno; la inclusión en lavanda cálida; el cierre con la gema completa.

## Audio

- **Voz** (`voz_mejorada.wav`): filtro de graves, reducción de ruido leve, ecualización de presencia,
  de-esser, compresión suave y −16 LUFS. Sin cambiar el tono: se oye clara y natural, no robótica.
- **Música** (`musica.py`): sintetizada desde cero con las piezas de `../pelicula/musica.py` (sin licencias de
  terceros). Va por debajo de la voz (sidechain, ~19 dB abajo) y se oye más donde no hay voz.
