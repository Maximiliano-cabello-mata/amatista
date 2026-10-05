# Bitácora · 5 de octubre de 2026 · Prácticas detectadas, temáticas por módulo y Amatista Motor 3.2

Pedido de Maximiliano (4 oct, 23:57, y 5 oct, 00:14):

- corregir que solo se detecta la práctica de la mesa y no los JSON nuevos («actualiza el esquema de base de datos para que las detecte»);
- una temática distinta y un jefe final distinto por módulo, con fondo propio y personajes de videojuego que digan qué hacer y den datos curiosos (eligió personajes **originales**, no famosos);
- un motor gráfico del add-on mucho más profesional y alineado con la temática de cada práctica;
- CSS mejorado, más logos y animaciones ligeras pero vistosas;
- que la plataforma descargue la versión nueva y que el descargable se llame «Amatista Motor 3.2».

## Por qué solo aparecía la mesa

No era el esquema: la tabla `PRACTICAS` (sql/007) ya admite las 18 prácticas (ids de hasta 80 caracteres, JSON en CLOB, niveles 1 a 5). Las prácticas solo llegan a la base cuando alguien corre `contenido.py practicas --publicar`; en el servidor eso se hizo cuando existía únicamente la mesa (motor v1) y nunca después. La mesa sigue visible porque `009` (que la archiva) tampoco se ha corrido. Ahora la API las registra sola al arrancar (ver abajo), así que no hace falta un script SQL nuevo.

## Decisiones tomadas sin preguntar (se pueden cambiar)

| Tema | Decisión | Por qué |
|---|---|---|
| Detección | La API registra al arrancar los `practica.json` nuevos o cambiados; publica los nuevos y los que seguían al repositorio; respeta los que el equipo dejó en borrador | Es lo que hacía a mano `practicas --publicar`; se apaga con `AMATISTA_SINCRONIZAR_PRACTICAS=0`. |
| Una sola fuente | `practices/blender/temas.json` con nombre, colores, escenario, mascota y jefe | La plataforma y el add-on muestran el mismo mundo. |
| Mascotas | 11 personajes originales en pixel art 10 × 10 (Tuerca, Chispa, Orbi, Gotita, Foco, Boing, Cota, Índigo, Marco, Píxel, Ami) | Maximiliano eligió «Originales»: los personajes famosos tienen marca registrada. |
| Gráficos | SVG y CSS propios; solo se anima transform y opacity; todo se apaga en modo ligero | Sin librerías nuevas y sin costo en equipos modestos. |
| Add-on | El fondo de la vista toma el color del módulo; no se agregan objetos | Los validadores del motor cuentan objetos; la foto de la escena no incluye el World. |
| Nombre | `name = "Amatista Motor"`, versión 3.2.0; descarga `Amatista-Motor-3.2-<sistema>.zip` | Pedido explícito. El archivo interno sigue siendo `amatista-3.2.0.zip` para no romper el instalador. |

## Hecho

- Backend: `sincronizar_al_arrancar` (api/addon.py) llamado desde `main.py`; `contenido.py practicas --revisar`; `/api/addon/v1/estado` devuelve `nombre`; nombre de la descarga.
- Plataforma: `Escenario.jsx` (11 escenarios animados), `Mascota.jsx` y `sprites.js`, `Jefe.jsx` con 5 siluetas, `MundosModulos.jsx` en la portada, escenario y mascota en el mapa del módulo, en la lección y en la arena del jefe, logo del curso en la lección, logos de Blender y A-Frame en el pie, destello en botones principales, transición de página. «Mi Blender» muestra qué versión entrega el servidor.
- Add-on 3.2.0 «Amatista Motor»: `temas.py`; tarjeta de la vista 3D con franja del color del módulo, mascota en pixel art con globo de consejos y datos, jefe del cierre; paneles Practicar y Mi curso con la temática; color del cielo por práctica que se restaura al cerrar.

## Pruebas

| Suite | Resultado |
|---|---|
| Frontend | vitest 178, ESLint limpio, build correcto |
| Backend | pytest 298 (nuevas: prácticas al arrancar, descarga «Amatista Motor 3.2» con 18 prácticas y temas.json) |
| Motor + add-on | pytest 133; `en_blender.py` probado en Blender 4.2.0 y 5.0.1 (paquetes bpy): 84 comprobaciones bien |
| Prácticas | 63 de 63 casos |

No probado: el dibujo real en una pantalla con GPU (la tarjeta se revisó con una simulación) y el examen con jefe en el navegador (necesita una práctica de Blender terminada antes).

## Pasos en el servidor (después del piloto del 8 de octubre)

1. `despliegue/actualizar.sh` (trae main y reinicia `amatista-backend`).
2. Si no se ha hecho: `007`, `008` en Database Actions y `python herramientas/contenido.py importar`.
3. Al reiniciar, el log dice «Prácticas del repositorio: 18 nuevas…». Comprobar con `python herramientas/contenido.py practicas --revisar` → «18 de 18».
4. `009` para archivar la mesa y el curso v2.
5. En «Mi Blender» debe decir «✓ El servidor entrega Amatista Motor 3.2».
