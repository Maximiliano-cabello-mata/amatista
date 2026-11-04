# El Corazón Amatista (`amatista.corazon/1`)

31 de octubre de 2026 · Corazón 1.0.0 · add-on 7.1.0 · tareas T-180 a T-183 · **sin SQL** (el siguiente libre sigue siendo 013).

Lo pidió el creador:

> No es un motor como tal, simplemente es un add-on. Quiero que realmente funcione como un motor. Hay cosas que desaparecen, no te señala claramente. No podemos seguir creando versiones infinitas hasta llegar a la adecuada: un corazón lo suficientemente bueno, impulsado por investigación sobre cómo se aprende 3D, alimentado por Blender pero que no es Blender, del que salgan ramificaciones.

El análisis completo (historial, debilidades, investigación) está en el documento «Del add-on al motor: análisis y corazón de Amatista». Aquí va la referencia técnica.

## 1. Qué cambia

Hasta el motor 7, el motor (Python puro) **evaluaba** la escena, pero quien **decidía qué ver** era el add-on: estados globales con relojes (`brillo.py` 9 s, `fichas.py` 16 s o 45 s, avisos 5 s) repartidos entre el guion, el taller, las fichas y el HUD. Nada de eso se podía probar sin Blender ni reusar en A-Frame, Maya o 3ds Max, y cada idea nueva era una versión nueva.

El corazón mueve esa decisión al motor:

```
            ┌──────────────────────── amatista_engine (Python puro) ─────────────────────────┐
            │  AmatistaEngine.evaluate ──► reporte ──► Director (corazon/director.py)         │
            │                                         │  guion: el paso que toca              │
            │                                         │  andamio: cuánta ayuda (por herramienta)│
            │                                         │  señales: cuál pedir y si sigue viva   │
            │                                         │  extensiones: lo que la rama agregó    │
            │                                         └─► Turno (lo único que ve el alumno)    │
            └────────────▲───────────────────────────────────────────────┬──────────────────┘
                 foto    │ capturar()        ejecutar(señal) / comprobar(señal)  │ turno
            ┌────────────┴───────────────────────────────────────────────▼──────────────────┐
            │ Adaptador del programa: Blender (add-on corazon/), A-Frame (Motor Web),         │
            │ Maya y 3ds Max (perfil en borrador; falta el adaptador dentro del programa)     │
            └────────────────────────────────────────────────────────────────────────────────┘
```

## 2. Las piezas (`engine/amatista_engine/corazon/`)

| Archivo | Qué hace |
| --- | --- |
| `contrato.py` | Lugares, señales, estados de una señal, eventos y el `Turno`. Lo único que cruza la frontera con un programa. |
| `adaptador.py` | `Perfil` (la interfaz de un programa, en datos) y `AdaptadorBase` (lo que hace el adaptador; por defecto, solo decir). |
| `perfiles/` | Blender (estable, sale de `guion/donde.py`), A-Frame (estable, con `escena_desde_foto`), Maya y 3ds Max (borrador). |
| `andamiaje.py` | Cuatro escalones por herramienta: mostrar › señalar › recordar › reto. Baja con el uso sin ayuda, sube con los tropiezos y con una semana sin usarla. |
| `senales.py` | Qué señal pedir y su ciclo de vida: propuesta › vigente / mostrada / fallida › perdida o cumplida. Nunca por reloj. |
| `director.py` | Observa el reporte, decide el turno, pide la señal y la vuelve a comprobar. Uno por práctica abierta. |
| `extensiones.py`, `incluidas.py` | Los puntos de extensión y las dos extensiones que vienen con el corazón. |
| `ramas.py` | Variantes del motor en JSON (`amatista.rama/1`) con herencia: `practices/ramas/`. |
| `conformidad.py` | Revisa que un adaptador cumpla el contrato (como un kit de conformidad). |
| `simulado.py` | Un programa de mentira para probar el corazón y escribir adaptadores nuevos. |

## 3. Las reglas de las señales

1. **Nada desaparece por reloj.** Una señal termina cuando su paso se cumple o cuando deja de ser verdad.
2. **Nada se dice sin comprobarlo.** «Te dejé elegida «Mover»» sale solo si el adaptador confirma; el add-on lo vuelve a comprobar cada 0,5 s. Si el alumno eligió otra herramienta, la banda y el panel dicen «Ahora tienes otra herramienta elegida. «Mover» sigue en…» y ofrecen **«Señálalo otra vez»**.
3. **Lo más fuerte que el programa sepa hacer, sin estorbar.** Si el programa no sabe hacer una señal, se dice dónde está (siempre verdad). Abrir un menú o una ventana solo pasa si el alumno lo pide.
4. **La señal se hace sola mientras la herramienta es nueva** (escalones mostrar y señalar). Después se dice dónde está, y en el escalón reto ni eso: la pista se **ofrece** tras 45 s o 90 s en el paso, nunca se impone.

| Lugar en el perfil | Señal | ¿Sola? | ¿Dura? |
| --- | --- | --- | --- |
| `barra` (Mover, Escalar…) | `elegir_herramienta`: Blender pinta su botón y su manipulador | Sí | Mientras siga elegida |
| `pestana` (Material, Modificadores) | `abrir_panel` | Sí | Mientras siga abierta |
| `menu` (Agregar, Objeto) | `abrir_menu` junto al ratón | Solo si se pide | No (se cierra al mover el ratón) |
| `dialogo` (Guardar como) | el botón del panel la abre | Solo si se pide | No |
| `tecla`, `lienzo` | `decir` | Sí | Siempre verdad |
| piezas nombradas en «¿Qué falta?» | `seleccionar` | Al pedir la pista | Mientras sigan seleccionadas |

## 4. El andamio

| Escalón | Cuándo (rama `blender-principiante`) | Qué hace |
| --- | --- | --- |
| mostrar | Nunca usada sola, o 3 tropiezos seguidos (extensión `rescate-tras-tropiezos`) | Señal sola, «dónde» a la vista, «Mírame hacerlo» |
| señalar | 1 o 2 prácticas con la herramienta sin ayuda | Señal sola y «dónde» |
| recordar | 3 o 4 | Solo «dónde»; la señal, si se pide; pista ofrecida a los 45 s |
| reto | 5 o más | Solo el objetivo; pista ofrecida a los 90 s |

Una herramienta cuenta **una vez por práctica** (repetir el gesto tres veces en el mismo tren no la retira). Un paso deshecho baja un escalón; una semana sin usarla, otro. «Mírame hacerlo» y cualquier pista marcan el paso como hecho con ayuda: no sube el escalón. El historial se guarda por cuenta en la carpeta del add-on (`corazon_andamio_<cuenta>.json`); con una cuenta de administrador vive en memoria.

Por qué así (detalle y fuentes en el documento de análisis): lo que ayuda al novato estorba al que ya sabe (Kalyuga y otros, 2003); retirar la ayuda según el desempeño de cada alumno funciona mejor que a ritmo fijo (Salden, Aleven, Renkl y otros, 2010); los tutoriales dentro de programas 3D que funcionan avanzan con una máquina de estados movida por eventos del programa (GamiCAD, UIST 2012) y validan cada paso con un criterio (Unity In-Editor Tutorials).

## 5. Extender sin versionar

### Una extensión

```python
from amatista_engine.corazon import Extension, Extensiones

def mas_corto(turno):
    return None if len(turno.haz) < 120 else turno  # None = lo deja igual

def contar(evento, turno):
    print(evento.tipo, turno and turno.numero)

mia = Extension("haz-corto", "1.0.0", aporta={"turno": [mas_corto], "observadores": [contar]})
```

| Punto | Recibe | Devuelve |
| --- | --- | --- |
| `validadores` | el registro de validadores | nada (registra los suyos) |
| `pasos` | (paso, práctica) | el paso cambiado o None |
| `pistas` | (paso, avance, contexto) | una `Pista` extra (nivel 4 en adelante) o None |
| `senal` | (paso, lugar, señal propuesta, contexto) | otra `Senal` o None |
| `andamio` | (herramienta, escalón, historial, contexto) | otro escalón o None |
| `turno` | el `Turno` | el turno cambiado o None |
| `observadores` | (evento, turno) | nada |
| `perfiles` | — | un `Perfil` de otro programa |

Una extensión que falla se salta y queda en `extensiones.errores`; nunca rompe Blender. Una extensión que pide otro contrato (`requiere="2"`) no se instala y lo dice.

### Una rama

```json
{"formato": "amatista.rama/1", "id": "blender-reto", "hereda": "blender-principiante",
 "nombre": "Blender · modo reto", "quitar": ["vistas-espaciales"],
 "andamio": {"senalar": 0, "recordar": 0, "reto": 0, "espera_reto": 120}, "senal_sola": false}
```

Ramas del repositorio: `blender-principiante` (la del add-on), `blender-reto` y `aframe-web`. El .zip del add-on las lleva en `ramas/`.

### Un programa nuevo (Maya, 3ds Max)

1. Completa su perfil en `corazon/perfiles/` (lugares de las herramientas, qué herramienta arregla cada validador, nombres de las primitivas).
2. Escribe su adaptador dentro del programa: hereda de `AdaptadorBase`, implementa `capturar()` (la foto como `SceneState`, igual que `blender/adapter.py`), y agrega a `hacer`/`ver` las señales que el programa sabe hacer (`maya.cmds.setToolTo`, `pymxs.runtime.toolMode`).
3. `conformidad.revisar_adaptador(tu_adaptador)` sin problemas.
4. Una rama (`practices/ramas/maya-principiante.json`).

El servidor revisa los intentos con el mismo motor, así que la evaluación no cambia.

## 6. Qué es estable y qué no

- **Estable dentro de `amatista.corazon/1`**: los nombres y significados de `contrato.py`, los puntos de extensión, el formato `amatista.rama/1` y la interfaz del adaptador. Solo se **agregan** campos con valor por defecto, tipos de señal y de evento.
- **Cambia libremente**: las extensiones, las ramas, los perfiles, el texto de las frases y el dibujo de cada programa.
- **El número del add-on** (7.1.0) sigue existiendo porque Blender instala paquetes con versión, pero ya no marca generaciones del motor: una mejora del comportamiento es una extensión o una rama, y el corazón sigue en 1.x.

## 7. Herramientas y pruebas

```
python engine/herramientas/corazon.py ramas         # revisa practices/ramas/
python engine/herramientas/corazon.py perfiles      # programas y lugares
python engine/herramientas/corazon.py extensiones
python engine/herramientas/corazon.py turno practices/blender/principiante/m1-tren/practica.json
python -m pytest engine/tests/test_corazon.py       # 30 pruebas, sin Blender
python addon/tests/en_blender.py                    # probar_corazon: conformidad, señal perdida y repetida, historial
python addon/tests/simular_alumnos.py --motor 7 --n 100 --semilla 2026   # 99 de 100 terminan, como el 7.0
```

## 8. Entregarlo

Sin SQL y sin cambios en el backend más allá de la versión. Reinstalar el add-on 7.1 desde la plataforma (o `python addon/herramientas/construir.py`). Lo que falta, como siempre desde el 10 de octubre, es la **prueba con ventana** (T-182): el tren con la herramienta que se elige sola, cambiar de herramienta y ver «Señálalo otra vez», y un segundo tren donde Mover ya no se señala solo.
