# Amatista Motor 6.1: Blender como extensión de la plataforma y una ayuda que enseña

> Add-on 6.1.0 · 30 de octubre de 2026 · Tareas T-142 a T-145. Sigue a [Amatista Motor 6](19_motor_6.md).

**Pedido del creador:** la plataforma y Blender son una sola cosa («una no puede vivir sin la otra»). La teoría era texto genérico: tiene que enseñar con las herramientas gráficas. El motor debe ser muy intuitivo, y la ayuda tiene que acompañar mucho al principio: explicar cada herramienta nueva como a un novato, mostrar dónde está y que se ilumine, sin dar la respuesta.

## 1. Una sola fuente: las fichas de herramientas

`practices/blender/fichas.json` (esquema `amatista.fichas/1`) lo leen el motor, el add-on, el servidor y la plataforma:

- **9 zonas** de la ventana de Blender: barra de arriba, cabecera de la vista 3D, barra de herramientas, vista 3D, barra lateral (N), lista de la escena, propiedades, línea de tiempo y barra de estado. Cada una con `que_es` y `para_que`.
- **26 fichas**, una por herramienta del catálogo (`transform.move`, `mesh.extrude`, `modifier.mirror`…). Cada ficha tiene `nombre`, `ingles`, `teclas`, `zona`, `donde`, `para_que`, `analogia`, `como[]`, `error` (el error típico de quien empieza), `cuando` y `blender[]` (los nombres internos de Blender, para reconocerla cuando el alumno la toca).

Una ficha dice **para qué sirve, a qué se parece y dónde está**, nunca qué valor poner ni cómo resolver la práctica.

Motor: `engine/amatista_engine/taller/fichas.py` (`cargar_fichas`, `revisar`, `andamio`, `por_presentar`, `recordatorio`, `curioso_activo`, `explicar_curioso`), con pruebas en `engine/tests/test_fichas.py`.

## 2. Andamio que se retira

| Veces que la vio | Fase de la habilidad | Qué hace Blender |
|---|---|---|
| Nunca | cualquiera | **Presenta** la ficha completa antes de empezar (estado `PRESENTANDO`, como mucho 2 por actividad) |
| Menos de 3 | nueva o acompañada | **Recuerda** en una línea de la tarjeta («Escalar está en la barra de herramientas · S») |
| 3 o más, o «Ya la conozco» | — | Nada: la ayuda se quita sola |

**Modo curioso** (Preferencias › Amatista › «Modo curioso»): `auto` (mientras el alumno tiene menos de 10 habilidades en SOLA o DOMINADA), `siempre` o `nunca`. Si el alumno toca una herramienta que todavía no vio, Blender le muestra su ficha unos segundos (como mucho 2 veces por herramienta).

## 3. En Blender (add-on 6.1)

- **La ficha en la vista 3D** (`taller/vista/ficha.py`): ocupa el lugar de la tarjeta del taller (una sola cosa a la vez, turno `FICHA`). Botones «Entendido», «¿Cómo se usa?» (abre los pasos y el error típico) y «Ya la conozco».
- **La zona brilla** (`taller/vista/brillo.py › encender_zona`) en el editor que corresponde: barra de herramientas, cabecera, panel lateral, propiedades, lista de la escena o línea de tiempo, con una flecha y el nombre.
- **Panel «¿Qué es esto? Tus herramientas»** en la pestaña Amatista: cada herramienta que ya vio, para volver a abrir su ficha.
- Lo que el alumno vio y marcó como conocido se guarda con el avance del taller (`fichas` y `conocidas` en `taller/datos.py`).

## 4. Blender sigue a la plataforma (orden «leccion»)

La lección abierta en la plataforma manda la orden `leccion` (`curso`, `leccion`, `titulo`, `clase` teoría/blender/examen, `numero`, `total`) al abrirse, al volver a la pestaña y cada 90 s (`frontend/src/blender/useLeccionEnBlender.js`). El servidor reemplaza una orden `leccion` pendiente por la nueva. Blender (`addon/amatista_blender/plataforma.py`):

- muestra en la barra de estado y en la barra de Blender Amatista «En la plataforma: Lección 3 de 5 · Extruir, cortar y limpiar (teoría)»; el botón «Mi lección» lleva a esa lección;
- da la plataforma por abierta durante 240 s desde el último aviso;
- al cumplir la etapa **no abre otra pestaña** si la plataforma está abierta. Dice a dónde pasó la lección («La plataforma ya pasó a «Extruir»: es la teoría de lo que acabas de hacer») y solo ofrece «Otra vez». Con la plataforma cerrada, «Ir a la plataforma» la abre en la lección.

En la plataforma (`pages/Leccion.jsx`, `TallerBlender.jsx`):

- **Avance automático**: cuando Blender cumple la etapa con la lección a la vista, aparece «Blender terminó esta parte. Sigues con «…» en 6 s», con «Seguir ahora» y «Quedarme aquí». Si quedan actividades, lleva a la que falta. Una lección ya cumplida no se salta al abrirla.
- **Blender se lleva solo**: si Blender está abierto en otra cosa al llegar a una lección de Blender, la plataforma le manda abrir el taller de esa lección (una vez por visita).
- **La ficha en vivo**: mientras Blender presenta una herramienta (estado `presentando`), la lección muestra la misma ficha.

## 5. La teoría enseña con las fichas

Dos bloques nuevos (validador `backend/contenido/validacion.py`, plantillas en `contenido/plantillas.py`):

- **`herramienta_blender`** `{tool, title?, text?, check?}`: la ficha completa (para qué, piénsalo así, cuándo, teclas, nombre en inglés) con la zona en el esquema de la ventana de Blender. Por defecto el alumno la **encuentra** en el esquema («¿Dónde está?»). Si se equivoca, se le explica la zona que tocó; al segundo fallo se le muestra. Después, «¿Cómo se usa?» abre los pasos y el error típico. Con `"check": false` se resuelve al abrir los pasos.
- **`blender_mapa`** `{mode: explore|find, zones?, questions?}`: el esquema de la ventana de Blender. `explore` se resuelve al visitar todas las zonas (o las de `zones`) y muestra qué es cada una y qué herramientas viven ahí. `find` es una serie de 1 a 6 preguntas, `{tool}` o `{zone, prompt}`.

Componentes: `frontend/src/components/leccion/fichas.js` (lógica pura, `fichas.test.js`), `MapaBlender.jsx`, `interactivos/HerramientaBlender.jsx`, `interactivos/BlenderMapa.jsx`.

**Contenido**: en los 9 módulos de Blender, cada **gancho** presenta las herramientas que la exploración en Blender estrena. `bp1_gancho` abre con el mapa completo de la ventana. Cada **explora** presenta las que vienen en la práctica y repasa dónde está cada cosa.

## 6. Compatibilidad

- Un add-on 6.0 ignora la orden `leccion` (no la conoce) y sigue funcionando como antes.
- Una PWA vieja no manda la orden: Blender se comporta como el 6.0.
- Sin SQL. El siguiente script libre sigue siendo 013.

## 7. Pruebas

- Motor y add-on: `pytest engine/tests addon/tests` (606), con `test_fichas.py` y `test_addon_motor61.py`.
- Dentro de Blender 5.0.1 sin ventana: `addon/tests/en_blender.py`, sección «Motor 6.1». El modo curioso se simula, porque Blender sin ventana no registra operadores.
- Backend: 418. Vitest: 345. Lint y build en verde.

Lo que necesita ventana (que la ficha se lea bien, que el brillo caiga en su lugar, que el modo curioso salte al tocar) lo prueba el usuario: T-143.
