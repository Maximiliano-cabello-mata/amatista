# Amatista Motor 6: Blender y Amatista como una sola cosa (add-on 6.0)

> Sigue en el **Motor 6.1** ([20_motor_6_1.md](20_motor_6_1.md)): fichas de herramientas para novatos, la orden «leccion» y el avance automático entre lecciones.

Pedido del creador (30 de octubre de 2026), después de usar el add-on 5.4: «tiene muchos defectos». Varias versiones instaladas «se cruzan entre ellas», «las tarjetas se enciman», «no hay una ruta clara ni una conexión clara con la plataforma», el motor «toma por válidas cosas que ni siquiera tienen sentido», «Mira cómo lo hace» «hace cosas de otras prácticas que nada que ver». Quería que fuera autosanable, que la plataforma guiara el avance («de nada me sirve que avancen en Blender exclusivamente»), tarjetas que sean «una referencia visual» y no un estorbo, herramientas que «brillen» cuando el alumno no las encuentra, la plataforma de acuerdo con la guía de aprendizaje y un «Blender Amatista». Tareas T-137 a T-141.

## 1. Lo que se encontró

| Síntoma | Causa | Arreglo en el 6.0 |
|---|---|---|
| Dos tarjetas, dos menús Amatista, revisiones dobles | El add-on clásico `amatista_blender` (antes del 4.2 o instalado a mano) y la extensión `bl_ext.user_default.amatista` encendidos a la vez: cada copia registra sus manejadores de dibujo, su menú y sus temporizadores. | **Autosanación** (`saneamiento.py`). |
| Tarjetas encimadas con una sola copia | La tarjeta del recorrido («Conoce Amatista Motor») y la del taller se dibujaban cada una por su cuenta. | **Una sola tarjeta a la vez** (`interfaz/turno.py`). |
| «Mira» y «Mírame» hacen cosas de otra práctica | Reproducían la demostración genérica de la habilidad: para «agrega un cono» salían una «Caja» y una «Lata»; en el proyecto del tren, piezas que no eran del tren. | **La demostración de ESTA actividad** (`pasos_de_actividad`). |
| Acepta cosas sin sentido | Holgura de tamaño de 1,8 veces en el nivel 1 (un cubo de 2 m pasaba por uno de 3,6 m); una malla de forma desconocida llenaba cualquier pieza; llenar el molde con un montón de piezas sueltas contaba. | **Molde con cordura** (`taller/molde.py`). |
| No hay ruta clara | La exploración de cada módulo (3 a 6 min según la guía) abría el taller entero y solo se daba por hecha al abrirse el proyecto: el alumno hacía todo el módulo en Blender antes de la teoría. En Blender había «Otros módulos» y «Empezar el taller» para ir a cualquier lado. | **La plataforma marca la etapa** (`taller/etapas.py`). |
| La tarjeta tapa la vista | Siempre abierta, con el texto, la pieza, las teclas y los botones. | **Tarjeta compacta** mientras se trabaja. |
| El alumno no encuentra la herramienta | La pista «¿Con qué?» elegía la herramienta en la barra T, pero nada la señalaba. | **La herramienta brilla** (`taller/vista/brillo.py`). |

## 2. Autosanación (`addon/amatista_blender/saneamiento.py`)

Al encender el add-on:

1. **Limpia lo de cargas anteriores.** Los manejadores de dibujo de Amatista se anotan en `bpy.app.driver_namespace["amatista.dibujos"]` (sobrevive a recargar el add-on): al encender se quitan los que dejó una carga anterior. Las funciones de `bpy.app.handlers` que vienen de un módulo Amatista que ya no está encendido también se quitan (`quitar_huerfanas`).
2. **Toma el dibujo.** `driver_namespace["amatista.duena"]` dice qué copia manda; una copia que no es la dueña no dibuja ninguna tarjeta (`soy_duena`, que consulta `turno.de_quien`).
3. **Apaga las otras copias** (en un temporizador de 0,2 s, no dentro de `register()`): busca con `addon_utils` los módulos Amatista (por su nombre o el de su `bl_info`) y apaga los de versión menor o igual (a igual versión gana la extensión, `gana`). Si apagó alguna, se vuelve a encender ella misma, porque la otra pudo pisar sus menús y paneles al registrarse.
4. **Lo dice.** Preferencias › Amatista › «Otras copias de Amatista» lista las que se apagaron y las que siguen encendidas (más nuevas).

El instalador (`instalar_en_blender.py`) además apaga el add-on clásico `amatista_blender` antes de instalar la extensión. Nada se borra del disco.

## 3. Una sola tarjeta (`addon/amatista_blender/interfaz/turno.py`)

`de_quien(contexto)` decide qué tarjeta se dibuja en la vista 3D, con prioridad fija:

    recorrido («Conoce Amatista Motor»)  >  taller (actividad o proyecto)  >  misión de una práctica suelta

`hud.dibujar`, `taller/vista.dibujar_molde`, `tarjeta.dibujar`, el grupo de gizmos de los botones y el brillo preguntan `me_toca(...)` antes de dibujar.

### La tarjeta como referencia (`taller/vista/tarjeta.py`)

- Mientras el alumno trabaja y **no pasa nada nuevo durante 5 s** (`REPOSO`), la tarjeta se achica a **una línea**: lo que dice el molde («A «Tabla» le falta largo») o lo que pide, más sus botones, al 80 % de opacidad.
- Se abre sola con cada novedad (otra pieza llena, una pista, un aviso), en «Mira», en la pausa y en el logro, y **al acercar el ratón** (48 px alrededor; el gizmo de los botones avisa la posición, `tarjeta.raton`).
- Preferencias › Amatista › «Tarjeta compacta mientras trabajo» la deja siempre abierta.

## 4. La plataforma marca la ruta (`engine/amatista_engine/taller/etapas.py`)

La guía de aprendizaje (`docs/cursos/03_ruta_de_aprendizaje_blender.md` §3) pone dos momentos en Blender por módulo, con teoría en medio. Cada bloque `blender_taller` de la lección dice su **etapa**:

| Etapa | Lección | Qué abre Blender | Cuándo se da por hecha |
|---|---|---|---|
| `exploracion` | `…_blender` (6 min) | Solo las primeras dos habilidades del taller (o las de `"habilidades"`, hasta 4): «Mira» y un «Hazlo conmigo» de cada una. | Cuando cada una se vio y se intentó una vez (`explorada`), o cuando Blender avisa `etapa_cumplida`. |
| `practica` (por defecto) | `…_practica` | El ciclo completo: el resto de las habilidades, el proyecto y el reto. | Cuando se abre el proyecto (como en el motor 5); el proyecto se completa con su `blender_practice`. |

- **La orden lleva la etapa.** `POST /api/addon/v1/ordenes` con `taller_abrir` acepta `etapa`, `habilidades` (solo las del taller, hasta 4) y `leccion` (el id de la lección a la que vuelve Blender). El enlace `amatista://taller/<id>?etapa=exploracion&habilidades=a,b&leccion=bp1_blender` lleva lo mismo con Blender cerrado (`protocolo.orden_de_url`, mismos filtros de id).
- **Blender no sale de la etapa** (`sesion.abrir`): una orden con una actividad fuera de la etapa se ignora (`etapas.permitida`), «Saltar» solo cambia a otra habilidad de la etapa y, al cumplirla, Blender **no sigue solo**: la tarjeta dice «Exploración lista. Vuelve a la plataforma: ahora viene el porqué» con **«Volver a la plataforma»**, que abre `#/curso/<curso>/leccion/<leccion>`. El latido manda `etapa` y `etapa_cumplida` y la lección se resuelve en vivo.
- **Con la cuenta conectada, en modo alumno** (`sesion.manda_la_plataforma`), Blender no deja elegir módulos ni empezar talleres por su cuenta: «Otros módulos» y «Demuéstralo» se quedan en la plataforma, y «Empezar el taller», el menú Amatista y «Continuar» sin actividad abren la lección en la plataforma («Seguir mi lección en la plataforma»). Sin cuenta, Blender sigue funcionando solo (sin conexión).
- **Validación del contenido** (`backend/contenido/validacion.py`): `etapa` es `exploracion` o `practica`; `habilidades` solo con la exploración y solo del taller; cada etapa de un taller va una sola vez por módulo y la exploración antes que la práctica.
- **Los 9 módulos de Blender** quedan así: `…_blender` es la exploración de sus dos primeras habilidades y `…_practica` empieza con «Primero, termina tu taller» y el taller en etapa práctica, antes del proyecto.

## 5. «Mira» y «Mírame» muestran esta actividad (`engine/amatista_engine/taller/demo.py`)

`pasos_de_actividad(demo_de_la_habilidad, piezas, inicio)` arma la demostración con las piezas de la actividad y el **gesto** de la habilidad:

- Cada pieza aparece con su forma («Shift + A › Malla › Cono: «Cono»»). Si la habilidad es **mover**, aparece en el centro y se lleva a su lugar; si es **escalar**, aparece con su tamaño de base (2 m) y se estira; si es **girar**, aparece derecha y gira; si es **duplicar**, las piezas iguales salen con Shift + D.
- «Arregla esta escena»: la pieza de inicio aparece como está y se lleva a como debe quedar; si es otra forma, se borra (X) y se agrega la correcta.
- Lo que no es forma (modificador, material, fotograma clave…) se hace sobre una pieza de **esta** actividad.
- Como mucho 4 piezas y 12 pasos: enseña el gesto, no hace el ejercicio.

En el add-on (`sesion._pasos_demo`): «Mira» usa la primera variación de la habilidad (lo que el alumno hará enseguida); «Mírame» en «Hazlo conmigo» usa solo la pieza que le cuesta; en el proyecto, la pieza que toca (`pieza_de_revision`). Sin piezas queda la demostración de la habilidad.

## 6. Molde con cordura (`engine/amatista_engine/taller/molde.py`)

| Regla | Antes | Ahora |
|---|---|---|
| Holgura de tamaño por nivel (veces) | 1,8 · 1,6 · 1,4 · 1,2 · 1,1 | **1,5 · 1,4 · 1,3** · 1,2 · 1,1 |
| Holgura de lugar (unidades de la pieza) | 1,0 · 0,8 · 0,6 · 0,45 · 0,3 | **0,8 · 0,7 · 0,55** · 0,45 · 0,3 |
| Forma de una malla renombrada | desconocida → llena cualquier pieza | se reconoce por sus **vértices y caras** (`FIRMAS`: cubo 8/6, cilindro 64/34, cono 33/33…) |
| Malla irreconocible en los niveles 1 y 2 | llena cualquier pieza | **no llena** (el alumno solo agrega primitivas); desde el nivel 3 sí (se une y se edita) |
| Muchas piezas sueltas | contaba si el molde se llenaba | **`revuelto`**: con más de 3 piezas de más (o el doble del molde) no se completa y dice «Hay muchas piezas de más: borra las que sobran (X)» |

## 7. La herramienta brilla (`addon/amatista_blender/taller/vista/brillo.py`)

Cuando el alumno pide «¿Con qué?» o se queda atascado (la escalera de ayudas lo detecta), la herramienta de la habilidad **brilla donde está**, sin decir cómo usarla ni el valor:

- Un borde amatista que late alrededor de la **barra de herramientas** (T) si es una herramienta de la barra (`action.tool`: Mover, Rotar, Escalar…), o de la **cabecera** de la vista 3D si se usa desde un menú (`action.menu`: Agregar).
- Una etiqueta corta junto al borde: «Mover (G) está en la barra de herramientas (izquierda)».
- Dura 9 s y se apaga al avanzar o al empezar otra actividad. Respeta «Animaciones» (sin animaciones no late) y se apaga en Preferencias › «Hacer brillar la herramienta que necesito».

## 8. Blender Amatista (`addon/amatista_blender/blender_amatista.py`, `plantilla_amatista/`)

Decisión del creador (tarjeta del 30 de octubre): **sin recompilar Blender**. Un fork de Blender en C/C++ obliga a compilar, firmar y publicar binarios de unos 300 MB por sistema y a rehacerlos con cada versión; una **plantilla de aplicación** cambia lo que el alumno ve con el mismo Blender oficial y llega con el mismo add-on.

| Qué | Dónde |
|---|---|
| Pantalla de inicio propia (gema y «Blender Amatista» sobre facetas) | `plantilla_amatista/splash.png` y `splash_2x.png` (501 × 250 y 1002 × 500), generadas con `addon/herramientas/generar_splash.py` |
| Colores de Amatista: fondo de la vista 3D, objeto activo y seleccionado, barra de arriba, botones activos de la barra T, menús y pestañas | `plantilla_amatista/__init__.py › TEMA` |
| «◆ Blender Amatista» y **«Mi lección»** (vuelve a la plataforma) al principio de la barra de arriba | `TOPBAR_HT_upper_bar.prepend` |
| El espacio Amatista al empezar un archivo nuevo | `load_factory_startup_post` |
| Acceso directo **Blender Amatista** en el menú del sistema (`--app-template amatista`) | `protocolo.crear_lanzador`: Linux `~/.local/share/applications/blender-amatista.desktop`, Windows `Menú Inicio › Programas › Blender Amatista.lnk` (PowerShell), macOS `~/Applications/Blender Amatista.app` (osacompile) |
| El enlace amatista:// abre Blender Amatista | `--app-template amatista` en el registro de Windows, el `.desktop` y la app de macOS (`protocolo.VERSION = 2`: se vuelve a registrar al arrancar) |

- El add-on copia la plantilla a `scripts/startup/bl_app_templates_user/amatista` al encenderse (también sin ventana, así el instalador la deja lista) y cuando cambia su versión. También se elige en **Archivo › Nuevo › Amatista**.
- Los colores de antes se guardan en `config/amatista/tema_original.json` y vuelven al salir de la plantilla. Si Blender se cerró sin devolverlos, el add-on los devuelve la próxima vez que se abre Blender **sin** la plantilla (`devolver_tema`): Blender normal se ve como Blender normal.
- Preferencias › Amatista › «Blender Amatista» (encendido por defecto) y el botón «Instalar Blender Amatista».

## 9. Probado y por probar

- Sin Blender: `engine/tests/test_motor6.py` (etapas, demostración de la actividad, cordura del molde), `addon/tests/test_addon_motor6.py` (enlace con la etapa, acceso directo, autosanación), `backend/tests/test_taller.py` (la orden y la validación de la etapa), `frontend/src/blender/taller.test.js`, `services/lanzador.test.js` y `modulos/practica.test.js`.
- Con Blender 5.0 sin ventana (`addon/tests/en_blender.py › probar_motor6`): la etapa de exploración de punta a punta (Mira de esta actividad, una orden de otra habilidad que no la saca, «Volver a la plataforma»), la ruta con la cuenta conectada, la tarjeta compacta y el ratón, el brillo, el molde revuelto, la plantilla instalada y sus colores puestos y devueltos, y la autosanación.
- Por probar con ventana (T-139): cómo se ven la pantalla de inicio, los colores, el borde que brilla y la tarjeta compacta, y el acceso directo en Windows, macOS y Linux. Y con el 5.4 y el 6.0 instalados a la vez, que quede uno solo (T-140).
