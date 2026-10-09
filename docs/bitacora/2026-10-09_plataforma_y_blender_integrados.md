# Bitácora · 9 de octubre de 2026 · La plataforma maneja Blender y Amatista Motor 3.4

Pedidos de Maximiliano (9 oct, 02:40, y una segunda petición el mismo día):

- un flujo claro para ver las debilidades de la conexión entre la plataforma y Blender, que hoy se sienten como dos cosas separadas cuando la plataforma debería manejar todo lo de Blender, investigando cómo lo hacen otras plataformas;
- en Blender, aislar lo que abruma, mostrar solo las herramientas de la práctica y explicar con diálogos cómo se usa cada una;
- que el motor identifique la figura y no solo revise instrucciones: flexible con las medidas al principio (basta una forma identificable), exacto en los niveles avanzados, con libertad creativa pero con sentido;
- «una actualización completa al motor resolviendo los problemas gráficos y técnicos» de lo ya implementado.

## Lo que se encontró

Estudio completo: `docs/motor/especificaciones/2026-10-09_plataforma_y_blender_integrados.md` (debilidades D1 a D11; cómo lo resuelven los tutoriales dentro del editor de Unity y de Photoshop, las «ruedas de entrenamiento» de IBM, las plantillas de Blender y el reconocimiento por componentes de Biederman; y el plan). Lo más importante:

1. La plataforma no sabía si Blender estaba abierto ni qué estaba haciendo: solo veía los intentos enviados.
2. «Abrir en Blender» no abría nada: decía «abre Blender y pulsa N».
3. Las preferencias (acompañamiento, tarjeta, avisos) vivían solo en Blender.
4. Blender completo desde la primera práctica: decenas de menús y una barra de herramientas con 20 íconos.
5. El motor 3.3 necesitaba que el alumno pusiera roles a mano y no detectaba figuras sin sentido (ruedas de un solo lado, chimenea flotando) si las medidas se parecían.

## Lo que se hizo

- **Motor 3.4, reconocer figuras** (`engine/amatista_engine/figures/`, `figure.recognize`): roles deducidos por la forma, relaciones deducidas del modelo (suelo, encima, toca, a los dos lados, nada flotando), cinco perfiles de exigencia por nivel (±60 % en el 1 a ±10 % y medidas reales en el 5), adornos libres y biblioteca de figuras para decir «se parece más a una mesa». Tren, muñeco de nieve y puente lo usan. Referencia: `docs/motor/referencia/11_reconocer_figuras.md`.
- **Enlace en vivo** (`backend/api/enlace.py`, `addon/amatista_blender/enlace.py`, Oracle `010_enlace_blender.sql`): latido cada 5 s, órdenes de la plataforma con confirmación (abrir práctica, enfocar, ver todo, actualizar), ajustes de Blender desde «Mi Blender». Sin 010 todo sigue funcionando.
- **Modo enfocado y «Tus herramientas»** (`addon/amatista_blender/enfoque.py`, `interfaz/herramientas.py`): sin barra T, menús de la cabecera y Shift+A filtrados, panel con «Usar» y «¿Cómo se usa?» (pasos, teclas y error típico, desde `tools/catalogo.json`), «Ver todo Blender» que lo devuelve todo como estaba. Referencia: `docs/motor/referencia/12_plataforma_y_blender.md`.
- **Plataforma**: la lección muestra el Blender en vivo y ofrece «Enfocar» o «Cambiar a esta práctica»; «Mi Blender» tiene la tarjeta «Tu Blender, desde aquí».

## Revisión técnica y gráfica (segunda petición)

| Falla | Dónde | Arreglo |
|---|---|---|
| La tarjeta de la vista 3D quedaba tapada por el panel «Ajustar última operación» (sale abajo a la izquierda al agregar un cubo) y, con regiones superpuestas, por la barra T | `interfaz/hud.py` | se coloca a la derecha de la barra T y encima de ese panel |
| Con tres teclas en un paso, el texto partía en más líneas de las calculadas y se salía de la tarjeta; el interlineado no crecía con la escala de la interfaz | `interfaz/hud.py` | el alto se calcula con el mismo ancho de teclas que se dibuja y todo escala |
| «Hazlo conmigo» agregaba el cubo sin el rol que traía la acción y luego pedía asignarlo a mano | `guia.py` | el cubo llega con su rol (y en las prácticas que reconocen figuras no se pide rol) |
| La guía pedía «asígnale el rol en la pestaña Amatista» aunque el motor ya reconociera las piezas | `guide/coach.py` | con roles deducidos pide agregar la pieza del modelo («Malla › Cilindro») |
| «Sin plantilla» del modo desarrollador no se podía elegir y Blender avisaba «matches no enum» (un identificador vacío en Blender es un título) | `estado.py`, `desarrollo.py` | identificador propio |

## Pruebas

- Motor: 217 pruebas (33 nuevas del reconocedor y 21 de herramientas); las 18 prácticas pasan sus `pruebas.json`.
- Backend: 326 pruebas (11 del enlace, incluido el servidor sin 010).
- Add-on dentro de Blender 5.0.1 (`addon/tests/en_blender.py`): todas las revisiones en verde, con las nuevas de modo enfocado, órdenes y tren sin roles.
- Frontend: 189 pruebas de vitest, lint y build.

## Pendiente para el usuario

- Revisar y fusionar el PR (no se fusiona sin tu OK).
- Después del piloto, con la fase 1 del despliegue: `010_enlace_blender.sql` en Database Actions (F5) y reinstalar Amatista Motor 3.4. Pasos: `/mnt/project-files/despliegue/2026-10-05_pasos_despliegue.md` §1.9. Tablero: T-087.
- Probar el modo enfocado en tu Blender con ventana (en la nube solo se prueba sin interfaz).
