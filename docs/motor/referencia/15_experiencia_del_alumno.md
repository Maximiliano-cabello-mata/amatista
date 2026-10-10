# 15 · La experiencia del alumno (Amatista Motor 4)

Amatista Motor 4.0 rediseña el motor y el add-on desde el punto de vista del alumno. El motor ya revisaba bien la escena; el problema era cómo se sentía practicar: todo a la vez, sin una secuencia clara, medidas que molestaban y diálogos que interrumpían cada paso. Este documento describe el diseño nuevo, por qué se hizo así y qué cambió respecto a lo que planteaban los documentos anteriores.

## 1. Lo que no funcionaba

| Lo que veía el alumno | Por qué cansaba |
|---|---|
| La barra lateral con miga, tema y mascota, título, barra de progreso, modelo, ejemplo resuelto, teoría, tarjeta «Ahora», botones, avisos, estado de envío, «Todos los pasos», «Comparado con el ejemplo», «Tus herramientas» y «Asignar rol», todo abierto | Demasiado para leer. No quedaba claro qué hacer **ahora**. |
| En la vista 3D: la tarjeta, el globo de la mascota que cambiaba cada 12 s, la píldora de teoría, la franja de pausa y los avisos, apilados | Ruido visual permanente mientras se trabaja. |
| Un diálogo «Así se hace este paso» al empezar **cada** paso | Interrumpía justo cuando el alumno iba a hacerlo. |
| Mensajes como «su base está en Z = 0.23 y debe quedar en 0» | Obligaban a leer números en el panel N. Lo que se ve en la vista 3D es «flota un poco». |
| Tolerancias de 5 a 15 cm y proporciones exactas en el nivel 1 | Un tren que se ve bien no pasaba por centímetros que nadie nota. |
| «Dile a Amatista que es «Rueda» (Asignar rol)» aunque el motor ya reconocía las piezas por su forma | Pasos que no hacían falta. |
| Los pasos saltaban de idea: armar el vagón, las ruedas, apoyarlas… y luego otra vez armar la chimenea | Sin secuencia clara. |

## 2. La idea: una ruta de misiones, una a la vez

La práctica se recorre como una **ruta**: partes con nombre y, dentro, misiones en fila. Solo la misión de ahora se explica.

```
Tren de juguete
  Parte 1 · La locomotora y el vagón   ● Dos vagones  ● Vagones alargados
  Parte 2 · Las ruedas                 ◉ Ocho ruedas   ← la misión de ahora
                                       ○ Ruedas de pie  ○ Ruedas en el suelo  ○ Ruedas pegadas
  Parte 3 · Arma el tren               ○ Vagones enganchados  ○ Chimenea
  Parte 4 · Revisa y guarda            ○ Amatista reconoce tu tren  ○ Guarda  ○ Coincide con el ejemplo
```

- **La misión actual** es el primer objetivo obligatorio sin cumplir, en el orden de la práctica (respeta `requires`). Es la misma que usa la guía, así que la tarjeta, el «Muéstrame cómo» y la plataforma siempre hablan de lo mismo.
- **Lo hecho antes de tiempo** queda «adelantado» (bolita verde y «¡Ya lo tenías!»): se reconoce y no se repite.
- **Cada misión** trae qué hacer en una frase (`tip`), hasta tres micro pasos con sus teclas, el porqué (`guide.why`) y las herramientas que usa (del catálogo `tools/catalogo.json`).
- **Las partes** las nombra el autor con `"stage"` en cada objetivo. Si no lo hace, el motor las deduce de lo que revisa cada objetivo (armar las piezas, dar forma, acomodar, pintar, luz y cámara, animar, organizar, revisar y guardar), une las partes de una sola misión a la anterior y junta revisar y guardar al final.

Código: `engine/amatista_engine/ruta/` (`mision.py`, `partes.py`), `AmatistaEngine.route()`. Python puro: lo usan el add-on, el servidor y las pruebas.

```python
reporte = motor.evaluate(practica, escena)
guia = motor.guide(practica, escena, reporte)
ruta = motor.route(practica, reporte, guia, hints={"vagones": 0}, previous="vagones")
ruta.mision.titulo        # «Vagones alargados»
ruta.partes[ruta.mision.parte].titulo  # «La locomotora y el vagón»
ruta.celebracion          # «¡Misión cumplida! ¡Y sin pistas!» (la anterior quedó cumplida)
```

### `stage` en el formato de práctica

```json
{"id": "ruedas", "title": "Ocho ruedas", "stage": "Las ruedas", "validator": "object.count", "...": "..."}
```

Hasta 40 caracteres. Las partes deben quedar seguidas: si dos objetivos de la misma parte quedan separados por otra, la ruta vuelve a una parte ya terminada (la prueba `test_toda_practica_tiene_ruta_clara` lo impide en las prácticas del plan de estudios). Las 9 prácticas de proyecto ya traen sus partes; las «explora» usan las automáticas.

## 3. Medidas amables

La forma tiene que tener sentido; los decimales no estorban. El motor afloja las tolerancias según el nivel antes de llamar al validador (`ruta/medidas.py`):

| Nivel | Holgura | Qué se pide |
|---|---|---|
| 1 | × 1.6 (mínimo 10 cm en distancias) | la forma y la idea |
| 2 | × 1.4 (mínimo 8 cm) | proporciones a ojo |
| 3 | × 1.2 | cerca del modelo |
| 4 y 5 | × 1.0 | las medidas del autor |

- Distancias (`spatial.grounded`, `spatial.touching`, `spatial.below`) y fracciones (`spatial.on_top`, `dimension.approx`): se multiplica `tolerance`.
- `shape.proportion`: «1.3 veces más largo» pasa a 1.19 en el nivel 1. Más largo sigue siendo más largo, nunca «igual».
- `shape.thinnest_axis`: delgado sigue siendo delgado (nunca más de 0.7 de lo más grande).
- `logic.any` afloja cada una de sus opciones.
- Lo que **no** se afloja es el sentido: la rueda sigue tocando el suelo y el vagón, la chimenea va encima, nada flota. `figure.recognize` y `example.matches` ya tenían su exigencia por nivel y no cambian.
- `"params": {"exact": true}` revisa un objetivo tal cual en cualquier nivel.

El servidor usa el mismo motor, así que califica igual que Blender.

## 4. El instructor sin decimales

En los niveles 1 a 3 los mensajes de medidas se dicen como en la vista 3D (`ruta/frases.py`): «La rueda flota un poquito. Míralo de frente (1) y bájalo con G y luego Z hasta el suelo.» Contar piezas sí ayuda: «Llevas 3 de 8 «Rueda». ¡Faltan 5!». En los niveles 4 y 5 los números son parte de lo que se aprende y se dejan. Un `messages.fail` del autor siempre gana.

Si el motor reconoce las piezas por su forma (`infers_roles`), la guía ya no pide asignar roles: «Dale la forma de «Rueda» con S: Amatista la reconoce sola».

## 5. El add-on

### La tarjeta de la misión (vista 3D)

Una sola tarjeta abajo a la izquierda (`interfaz/hud.py`):

```
╭──────────────────────────────────────────────╲
│ [▣] PARTE 2 DE 4                  MISIÓN 3/11 │
│     Las ruedas                                │
│ ● ● ◉ ○ ○ ○   ● ○   ○ ○ ○                     │  la ruta: una bolita por misión
│ Ocho ruedas                                   │
│ Las ruedas son cilindros: cuatro por vagón…   │
│ ✓ [Shift] › [A]  Abre el menú Agregar         │  se enciende al usar la tecla
│ 2  Elige Malla › Cilindro                     │
│ 3 [S]  Dale la forma de «Rueda»…              │  la que toca «respira»
│ ▌ Llevas 3 de 8 «Rueda». ¡Faltan 5!           │
│ [Añadir objeto] [Escalar] (Rotar) (Guardar)   │  herramientas
│ ¿Atorado? N › Amatista › «Muéstrame cómo»     │
╰───────────────────────────────────────────────╯
```

- **Herramientas iluminadas**: la del micro paso que toca brilla con el color del tema, las otras de la misión quedan encendidas a medias, las ya usadas llevan ✓ y las que vienen después solo el borde. Así se ve qué se usa ahora y qué se usará.
- **Teclas que se encienden**: el add-on mira los operadores que usa el alumno (`window_manager.operators`: G, R, S, Shift+A, Shift+D, E, Ctrl+R, Tab, vistas 1 3 7, guardar…) y marca el micro paso como hecho. «Usar» en una herramienta también cuenta.
- **La herramienta lista**: en los niveles 1 y 2, al empezar una misión se elige su herramienta en la barra T (Mover, Escalar, Rotar, Extruir, Corte de bucle). Blender mismo la ilumina y muestra su manipulador. Preferencia «Dejarme lista la herramienta».
- **Animaciones** (`mision.py`): la tarjeta entra deslizándose (0.45 s); la misión cumplida se celebra con un sello «¡Eso es!» (y «¡Y sin pistas!» si no las usó) que suelta chispas, y su bolita salta (1.6 s); la tecla que toca respira 8 s. El temporizador solo corre mientras algo se anima (30 cuadros por segundo en las transiciones, 8 mientras respira): Blender no se redibuja sin motivo. Preferencia «Animaciones».
- Fuera: el globo de la mascota que rotaba solo, la píldora de teoría y la franja de pausa apiladas. La mascota sigue en la franja y habla en los avisos breves cuando hay algo que decir.

### La barra lateral (N › Amatista › Practicar)

- Arriba, solo la misión: «Misión 3 de 11 · Parte 2: Las ruedas», barra de avance, título grande, qué hacer, micro pasos (✓ los hechos), lo que dice el instructor, el porqué, **Muéstrame cómo** grande («Hazlo conmigo»), «Pista (n)», «¿Dónde?», «Revisar», las herramientas de la misión con su botón «Usar», «Después: …» y «Así se ve» / «Ver el ejemplo».
- Debajo, cerrados: **Tu ruta** (las partes y sus misiones), **Tus herramientas**, **Comparado con el ejemplo** y **Más** (tema y mascota, modelo, ejemplo resuelto, teoría, «Tu misión», plataforma, otra práctica, de nuevo).
- «Asignar rol» ya no aparece si Amatista reconoce las piezas por su forma (sigue en modo Desarrollador).

### Diálogos

- **Tu misión** (al abrir una práctica): qué vas a construir (imagen del modelo), la ruta por partes, las herramientas que usarás y cómo funciona en tres líneas, con «Antes de empezar: <teoría>» y «¡Empezar!». Reemplaza la píldora que se abría sola.
- **Felicitación**: además de la autonomía, «11 de 11 misiones en 4 partes» y «Ya sabes usar: …».
- Ya no sale un diálogo por cada paso. Quien lo quiera lo activa en Preferencias › «Un diálogo por cada misión» (preferencia nueva, apagada; la de antes ya no se usa, así el «sí» guardado no vuelve a encenderla).

## 6. La plataforma ve la misma misión

El latido lleva la misión de la ruta en `detalle`: `titulo`, `mensaje`, `numero`, `total`, y los campos nuevos `parte`, `hechas`, `objetivo` y `pasos` (hasta tres, con sus teclas). «Ahora en Blender» en la lección muestra «Misión 3 de 11 · Las ruedas», la barra de avance, qué hacer y las teclas. Sin cambios en Oracle: `ADDON_ENLACES.DETALLE` (011) ya guarda el JSON.

## 7. Psicología aplicada

| Principio | Cómo se aplica |
|---|---|
| Carga cognitiva baja | Una misión a la vez, máximo tres micro pasos, lo demás cerrado. |
| Efecto de progreso | Bolitas de la ruta y barra que avanzan con cada misión; partes cortas (2 a 4 misiones). |
| Refuerzo inmediato y variado | Sello y chispas al cumplir; siete frases distintas; «¡Y sin pistas!». |
| El error es «casi» | Mensajes sin «mal» ni «incorrecto», con el arreglo en la misma frase. |
| Autonomía | Lo adelantado se reconoce; la ayuda se pide («Muéstrame cómo», «Pista») y cuenta para la autonomía como antes. |
| Señalar, no imponer | Herramienta lista y tecla que respira; Blender sigue completo con «Ver todo Blender». |
| Concreto antes que abstracto | Medidas libres en los niveles 1 y 2; los números aparecen en los niveles 4 y 5. |

## 8. Pruebas

- `engine/tests/test_ruta.py`: la ruta (una sola misión actual, partes, adelantadas, celebración, completa), que cada práctica del plan tenga una ruta clara, las medidas amables por nivel y las frases sin decimales.
- `addon/tests/en_blender.py` › `probar_motor_4`: en Blender 5.0.1 sin ventana, la ruta del tren, la tecla que se enciende al usar la herramienta, el avance con su celebración, la herramienta de la barra T, el latido y el dibujo de la tarjeta, paneles y diálogos.
- `frontend/src/blender/logica.test.js`: «Misión 3 de 5 · Las ruedas» con sus pasos.

Lo que solo se puede probar con ventana: cómo se ven las animaciones y la herramienta elegida en la barra T. Se prueba a mano en Blender 4.2 o 5.0 con interfaz.
