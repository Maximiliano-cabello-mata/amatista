# 10 · Primeros pasos con Amatista y recursos gráficos nuevos (11 oct 2026)

> **Retirado el 11 de octubre (auditoría, T-111).** El curso «Primeros pasos con Amatista» salió del árbol de Blender (su JSON queda en `frontend/src/data/modulos/archivo/`) y el recorrido del add-on 5.1 pasó a las tres prácticas «Conoce Amatista Motor» del add-on 5.2. Lo vigente está en [11 · Recorrido guiado, página Blender y «Conoce Amatista Motor»](11_recorrido_y_fusion.md). Los recursos gráficos de la sección 2 en adelante siguen vigentes.

> «Un módulo instructivo que enseñe cómo funciona toda la plataforma mediante los primeros pasos en Blender y los primeros cursos: cómo funciona el add-on y su relación con la plataforma. Una conexión real entre la plataforma y el add-on. Actualizar los recursos gráficos de las lecciones, más interactivo, y recursos nuevos que se vayan intercalando porque se repiten.» (Maximiliano, 11 oct 2026)

Construye sobre la guía `#/guia` (doc 09), Amatista Taller (motor 5) y las herramientas gráficas (doc 07). Mismo diseño y misma paleta.

## 1. El curso «Primeros pasos con Amatista»

Un curso nuevo, `primeros_pasos` (número 00), dentro de la ruta Blender y antes de Principiante. En el árbol de niveles aparece como **nivel 0**. Un módulo, «La estación del enlace», con su tema propio (`estacion`, verde azulado), su guía **Bip** (una paloma mensajera de hojalata, original) y su jefe final, **El Nudo de Cables**. Insignia: «Navegante de Amatista».

| Lección | Qué enseña | Recursos |
|---|---|---|
| Tu mapa de Amatista | Portada, cursos, Mi panel, el «?» y Continuar. | Recorrido por la pantalla, ¿Verdad o mito? |
| Así se vive una lección | Qué hacer, actividades, «Completar lección» y las estaciones en Blender. | Recorrido, ruta Mira / Hazlo conmigo / Hazlo tú y úsalo, Clasifica (plataforma o Blender). |
| El add-on: Amatista dentro de Blender | La pestaña Amatista (N), la tarjeta de la vista 3D, el molde y las pistas. | Recorrido por Blender, ejes que se giran, pregunta. |
| Cómo se hablan la plataforma y Blender | Vincular con código, el latido, las órdenes y el avance guardado sin Internet. | Flujo de la conexión (7 mensajes), Clasifica en 3 grupos, ordenar los pasos. |
| Tus primeros pasos en Blender | Instalar, vincular y recorrer Blender con la lección viéndolo en vivo. | Paso a paso y **Primeros pasos en Blender** (en vivo). |
| Jefe final: el Nudo de Cables | 7 preguntas, aprueba con 70 %. | Examen. |

**Quien ya avanzaba no pierde nada.** El curso tiene `introduccion: true`: solo es el «nivel en curso» de quien todavía no completó ninguna lección de otro nivel (`catalogo/agrupar.js › resumenRuta`). El progreso, los ids y el servidor de los demás cursos no cambian.

La guía `#/guia` y su aviso en la portada ahora apuntan a este curso, y el botón del final de la guía lleva a su primera lección.

## 2. La conexión real: la lección ve Blender y Blender obedece a la lección

El bloque **Primeros pasos en Blender** (`blender_tour`) es la pieza que une las dos partes:

1. **Etapas**: Instala Amatista Motor → Vincula tu cuenta → Recorre Blender; cada una se marca sola.
2. **Empezar en Blender ▶** manda la orden `recorrido` (`POST /api/addon/v1/ordenes`, `accion: empezar`). Blender abre la escena «Amatista · Primeros pasos» con un cubo y la tarjeta de Bip.
3. **En vivo desde tu Blender**: cada latido (5 s) trae `detalle.recorrido` con la parada, qué hacer y sus teclas. La lección muestra lo mismo que la pestaña Amatista, y sus botones «Paso anterior» y «Siguiente paso» mueven el recorrido en Blender.
4. Cuando Blender avisa que el recorrido terminó, la actividad queda resuelta. Quien no tiene Blender a mano puede seguir con «Ahora no tengo Blender: lo haré después».

Estados que reconoce la lección (`recursos.js › recorridoDelEnlace`): sin enlace, Blender cerrado, add-on viejo (anterior a 5.1, pide reinstalar), abierto, recorriendo y hecho.

El recorrido dentro de Blender se describe en `docs/motor/referencia/17_primeros_pasos_en_blender.md`.

## 3. Recursos gráficos nuevos

Siete bloques nuevos, ligeros (SVG y CSS, sin librerías). Los cuatro de solo mirar se cargan diferidos, como los de la v3.6.

| Bloque | Qué es | Dónde se usa |
|---|---|---|
| `ui_tour` · Recorrido por la pantalla | Un esquema de la plataforma, de una lección o de Blender con paradas numeradas; flechas o botones para pasar. | Primeros pasos (3 lecciones). |
| `connection_flow` · Así se hablan | Nodos (plataforma, servidor, Blender) y mensajes que viajan como paquetes; «Ver en orden» los reproduce. | Primeros pasos. |
| `axis_gizmo` · Los ejes de Blender | Un cubo con X, Y y Z que se orbita arrastrando o con 1, 3 y 7. | Primeros pasos, Principiante m1. |
| `param_demo` · Mueve el valor | Un control como el de un modificador y una figura que responde: array, bisel, subdivisión, espejo, luz y resolución. | Principiante m2 y m3, Principiante-Intermedio m2, Intermedio m1 y m3. |
| `classify` · Clasifica | Tarjetas que se ponen en 2 a 4 grupos; las mal puestas vuelven a la mesa. | Primeros pasos, Principiante-Intermedio m1 y m3, Intermedio m2. |
| `true_false` · ¿Verdad o mito? | Tarjetas que se voltean con la explicación. | Primeros pasos, Principiante m1, Principiante-Intermedio m2, Intermedio m1 y m3. |
| `blender_tour` · Primeros pasos en Blender | La conexión en vivo de la sección 2. | Primeros pasos. |

Con esto, cada lección «explora» de Blender intercala al menos un recurso distinto de las tarjetas y la pregunta de siempre (20 bloques nuevos en 9 módulos). Todos se validan en el servidor (`backend/contenido/validacion.py`) y tienen su ejemplo en el editor de contenido (`plantillas.py`).

## 4. CSS: lecciones con más ritmo

Sección «v3.7» de `frontend/src/index.css`:

- Cada bloque de la lección lleva `data-bloque` y entra al hacer scroll (`revelar`).
- Barra de lectura arriba de la lección (`.lectura`, con `animation-timeline: scroll()` donde el navegador la tiene).
- Teoría con borde de acento, un hexágono antes de cada subtítulo y el primer párrafo más grande.
- Bloques gráficos con degradado y brillo al pasar el ratón; ruta con flechas entre pasos; tarjetas que se elevan; avisos con borde que respira.
- Todo lo nuevo se apaga en modo ligero, con movimiento reducido, en alto contraste y al imprimir.

## 5. Capturas

En `/mnt/project-files/plataforma/2026-10-11_primeros_pasos/` (carpeta compartida del proyecto): el curso con el nivel 0, el recorrido por la portada, ¿Verdad o mito?, Clasifica, los ejes, el flujo de la conexión (escritorio y celular), Primeros pasos en Blender y la demo de subdivisión.

## 6. Para publicarlo

Sin SQL. Actualizar el backend en la VM (acepta los bloques nuevos y la orden `recorrido`), publicar la PWA y reinstalar **Amatista Motor 5.1** desde «Mi Blender». Pasos: `docs/despliegue/2026-10-11_primeros_pasos_motor_5_1.md`.
