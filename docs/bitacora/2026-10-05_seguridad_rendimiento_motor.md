# Bitácora · 5 de octubre de 2026 · Seguridad, rendimiento, Motor 3.3, mundos por módulo y plan de despliegue

Pedido de Maximiliano (5 oct, 03:27), en orden:

1. Pruebas de todo tipo en la plataforma: ciberseguridad (sobre todo inyección SQL) y proteger el código aunque viva en la computadora de otras personas y sin Internet.
2. Pruebas de rendimiento con un archivo que muestre todo el rendimiento, y optimizar los puntos más débiles a partir de él.
3. Actualizar el motor: prácticas como el tren pedían medidas muy exactas y las figuras no tenían sentido. Dar libertad con medidas «medianamente cercanas, más no exactas», que la figura sea la de la práctica, y mostrar cómo se espera que se vea.
4. Actualizar el CSS en general, muchas más animaciones; que el tema de cada módulo no sea un cuadrito sino toda la sección, con el personaje platicando constantemente.
5. Actualizar todo el plan de despliegue.
6. Documentar todo y hacer la bitácora del día.

Rama `claude/seguridad-rendimiento-motor-dd3iuh`. Producción no se tocó (piloto del 8 de octubre).

## Decisiones tomadas sin preguntar (se pueden cambiar)

| Tema | Decisión | Por qué |
|---|---|---|
| Dónde probar | Copia local con Oracle Free 23 sembrada con 2,000 alumnos y 60,000 eventos | La nube no alcanza la VM y no se toca producción antes del piloto. El plan trae los comandos para repetirlo contra producción. |
| Protección del código | Integridad, marca de agua firmada y calificación en el servidor; **no** ofuscar | Ofuscar Python no protege (se revierte en segundos) y rompe entre versiones de Blender. El límite está escrito en `docs/seguridad/02_proteccion_del_codigo.md`. |
| Copias modificadas | `AMATISTA_ADDON_VERIFICADO=registrar` por defecto | Con `exigir` desde el primer día, los alumnos con el add-on 3.2 quedarían fuera. |
| Inicio de sesión lento (~430 ms) | Se queda | Es PBKDF2 con 600,000 iteraciones: la defensa de las contraseñas. |
| Límites por IP | Por cuenta en rutas con sesión; registro e inicio 60/min por IP | Un aula entera sale con una sola IP y en el piloto recibiría 429. El bloqueo de la cuenta a los 5 fallos se mantiene. |
| Tolerancia del motor | ±35 % en medidas, posición libre ~9 % del largo, escala y orientación libres | «Medianamente cercanas, más no exactas». Las figuras sin sentido (ruedas en el techo, vagones apilados, todas las ruedas de un lado) reprueban. |
| Tren | 8 ruedas (4 por vagón) y chimenea obligatoria | Un tren con 4 ruedas para dos vagones no tenía sentido. |
| Muñeco, cojín, tabla | El «explora» del módulo 1 pasó a muñeco de nieve; el del módulo 3, a cojín; la tabla revisa que sea plana, no una proporción exacta | Eran figuras sin forma reconocible. |
| Mascota | Habla cada 24 s, el globo dura 9 s, se puede callar y lo recuerda | «Constantemente ahí» sin estorbar la lectura. |
| Animaciones | Sin desenfoque en la barra, luz fija, 7 partículas por página | Con todo encendido la lección bajaba a 37 fps. |
| `npm run dev` sin `.env` | Habla con la VM, no con `localhost:8000` | Era la causa del «No se pudo contactar al servidor» (hilo «Revisar conexión con Oracle»). |

## Hecho

### Seguridad

- `backend/herramientas/auditoria_seguridad.py`: recorre las 69 rutas con inyección SQL (clásica, UNION, a ciegas por tiempo con `DBMS_PIPE` y `SLEEP`), XSS, recorrido de rutas, matriz de permisos con tres identidades, fuerza bruta y cuerpos gigantes. Resultado sobre Oracle: **1,449 peticiones, 0 hallazgos**.
- Arreglos: errores de Oracle reducidos a código y folio, cabeceras de seguridad desde la API, `no-store` en datos personales, `AMATISTA_OCULTAR_DOCS`, `AMATISTA_MAX_CUERPO` (413), límites por cuenta.
- Add-on: `integridad.json` por paquete y chequeo sin red, cabeceras de integridad en cada intento, `licencia.json` firmada con `AMATISTA_SECRETO_FIRMA`, `verificar_licencia.py`.
- bandit, pip-audit y npm audit: sin vulnerabilidades; 2 falsos positivos revisados.

### Protección del código de la PWA (aclaración de Maximiliano, 03:29)

La plataforma sigue siendo PWA. El build ya salía minificado y sin mapas de fuente; ahora queda fijo en `vite.config.js` (`sourcemap: false`, sin comentarios de licencia) y `npm run build` corre `scripts/revisar-publicacion.mjs`, que falla si se cuelan mapas de fuente, rutas locales, comentarios de desarrollo o secretos. Las dos fugas reales son el repositorio público (T-079) y las respuestas de los exámenes dentro del JavaScript (T-083, decisión pendiente). Ofuscar se descartó: se revierte fácil y vuelve lenta la PWA en teléfonos. Detalle en `docs/seguridad/02_proteccion_del_codigo.md`.

### Rendimiento

- `backend/herramientas/rendimiento.py` (sembrar, medir, limpiar) y `frontend/scripts/rendimiento.mjs` (FCP, LCP, TBT, CLS, fps en computadora y teléfono modesto).
- Backend: caché del catálogo con ETag y del resumen del panel, paquete base del add-on en caché, GZip. Catálogo con 40 alumnos **747 → 77 ms**; resumen del panel **97 → 7 ms**; descarga con cuenta **55 → 22 ms**.
- Web: lección con su mundo **37 → 54–60 fps**; panel en computadora **44 → 58 fps**; en teléfono, portada **45 → 60 fps** y panel **41 → 56 fps** (`content-visibility` en lo que no se ve).
- Informe: `docs/rendimiento/2026-10-05_informe.md` y la versión con gráficas `/mnt/project-files/rendimiento/2026-10-05_informe_rendimiento_y_seguridad.html`.

### Motor 3.3

- Bloque `reference` en `practica.json` (piezas, tolerancia, cámara, grupos flexibles, luces) y validadores `figure.resembles`, `spatial.on_top` y `dimension.approx` (38 en total).
- `engine/herramientas/referencias.py` construye cada modelo en Blender (bpy), lo califica con el propio motor (100 % obligatorio) y genera `referencia.jpg` y `plano.svg` para 13 prácticas.
- Plataforma: «Así se debe ver» con pestañas Imagen y Plano en la práctica de Blender. Add-on **3.3.0**: la misma imagen en el panel y botón para abrirla grande.
- Prácticas rehechas: tren, muñeco de nieve, cojín, puente (pilares flexibles), aldea (techos encima), tabla. Casos «Sin sentido» en `pruebas.json`.

### Mundos por módulo (v3.4)

- `MundoTema.jsx`: toda la lección se pinta con el mundo de su módulo (cielo, luz, suelo y partículas propias: engranes, chispas, estrellas, gotas, confeti, hojas…). En la página del curso, la tarjeta de cada módulo es un mundo completo con su escenario arriba y abajo.
- `CompaneroMascota.jsx`: la mascota vive en la esquina durante toda la lección, saluda con el título, platica (consejos, charla y datos curiosos), celebra aciertos, anima tras un fallo, avisa a la mitad y al final, y pregunta si sigues ahí. Botones «Otro», cerrar y «Callar».
- `temas.json`: charla y reacciones para las 11 mascotas (también en el add-on).
- Animaciones de entrada al hacer scroll, botones con presión, brillo en tarjetas, subrayado animado de títulos. Todo se apaga en modo ligero y con «reducir movimiento».

### Despliegue

- `docs/despliegue/2026-10-05_plan_de_despliegue.md`: fase 0 (hasta el 7/10, sin tocar la VM), piloto, fase 1 (actualizar), fase 2 (HTTPS), fase 3 (correo), fase 4 (auditoría contra producción, HSTS, repositorio privado).
- Pasos exactos para el servidor: `/mnt/project-files/despliegue/2026-10-05_pasos_despliegue.md` (reemplaza `oracle/2026-10-05_pasos_motor_3_2.md`).
- `backend/.env.example` con las variables nuevas; `crear-tags.sh` con `v3.0.0-alpha.5` a `alpha.7`.
- Los dos hallazgos de despliegue de la revisión del 4 de octubre (rama de la VM y nombre de la unidad) ya estaban resueltos en `actualizar.sh`; quedó escrito en el plan.

### Tablero

T-075 (auditorías y optimización), T-076 (Motor 3.3) y T-077 (mundos y mascota) cerradas con este PR; T-078 (aplicar en producción), T-079 (secreto, repositorio privado, «exigir»), T-080 (portada en teléfono), T-081 (varias aulas) y T-082 (CSP) nuevas. Siguiente id libre: T-084.

## Pruebas

| Suite | Resultado |
|---|---|
| Backend | pytest 311 (seguridad, protección del add-on, rendimiento) |
| Motor | pytest 119 (19 nuevas de figuras) |
| Add-on | pytest 36; `en_blender.py` con bpy 5.0.1: panel con la imagen de referencia |
| Prácticas | 71 de 71 casos de `pruebas.json` |
| Frontend | vitest 183, ESLint limpio, build correcto |
| Oracle real (Free 23) | Sincronización «0 nuevas, 13 actualizadas»; intento del tren calificado 100 % por la API; auditoría 0 hallazgos |

## Pendiente para Maximiliano

1. Revisar y aprobar el PR (no se fusiona sin tu visto bueno).
2. Antes del piloto, solo lo que no toca la VM: Cloudflare, Pages, generar `AMATISTA_SECRETO_FIRMA`, tags y borrar ramas viejas (comandos en el plan, fase 0).
3. Después del piloto: fases 1 a 4 del plan.
4. Decidir si el contenido de los cursos y las prácticas lleva una licencia distinta de la GPL del add-on.

## Lo que queda por mejorar

- Portada en teléfono: LCP ~2.7 s y TBT ~650 ms (T-080).
- Escrituras con 40 alumnos a la vez: 400–500 ms con un proceso (T-081).
- «Mi Blender» en teléfono mueve el contenido al cargar (CLS 0.087).
