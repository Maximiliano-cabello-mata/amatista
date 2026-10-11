# Bitácora · Auditoría completa y orden de la plataforma (11 oct 2026)

**Pedido (Maximiliano, 05:16 UTC):** organizar la plataforma y el admin; auditar todo desde el primer commit (commits, tags, errores gráficos, visuales, de conflicto, de seguridad y de código) y corregirlo. Puntos concretos: las tarjetas «¿Verdad o mito?» no funcionan; el curso de introducción del árbol de Blender no debe ser un curso sino algo que te guíe por la plataforma; la plataforma se siente desconectada y compleja, debe ser simple y no exigir saber programar; el add-on solo explica dos o tres cosas: hacen falta una a tres prácticas (no un curso) que expliquen todas sus herramientas; lavado de cara, y una tarjeta que explique en detalle cómo se fusionan la plataforma y el add-on.

**Decisiones por defecto (sin preguntar, reversibles):** informe de auditoría en el repositorio y copia en los archivos del proyecto; correcciones en el mismo PR, un commit por tema; el curso de nivel 0 se archiva y lo reemplaza un recorrido guiado; tres prácticas del add-on; misma paleta y mismo diseño.

## Qué se hizo

1. **Auditoría** (`docs/auditoria/2026-10-11_auditoria_completa.md`): clon completo, 270 commits y 49 merges, búsqueda de secretos y archivos pesados en toda la historia (limpia), tags (todos en `main`; faltaban alpha.11 a alpha.14), todas las suites, todas las páginas a 390 y 1280 px con tres roles y las 48 lecciones a 390 px.
2. **Correcciones** (16): la principal, «¿Verdad o mito?» no volteaba porque la animación de entrada pisaba el giro. Las demás: desbordes a 390 px, el curso v2 archivado en Mi panel, «código de 6 letras», el conteo de Admin › Resumen, la duración del jefe de A-Frame, la opción de comentarios del build en Vite 8, el CHANGELOG y los tags.
3. **Add-on 5.2 «Conoce Amatista Motor»**: tres prácticas (tu pestaña Amatista; muévete y usa tus herramientas; así te enseña el taller) que cubren 24 temas y se comprueban solas, incluidos los botones del add-on.
4. **Plataforma**: barra Cursos · Blender · Mi panel; recorrido guiado de 10 paradas; página Blender con la tarjeta de la fusión, instalar, las tres prácticas en vivo y los ajustes; Ayuda sin candados; Mi panel con una tarjeta por curso y listas cortas.

## Commits (rama `claude/auditoria-orden-plataforma-wfzu65`)

`c6c5de4` arreglos gráficos · `8af56a8` retirar «Primeros pasos» · `4d45128` add-on 5.2 · `efe01e3` API del enlace · `59f863d` página Blender · `62f48ee` bloque de Blender en lecciones · `e1c1287` recorrido, pestaña Blender y Ayuda · `970b88d` Mi panel · `e93545b` Admin › Resumen · `e07bb30` duración A-Frame · `57475fe` comentarios del build · `fb3955d` desborde de Mi panel · documentación y tablero.

## Pruebas

Backend 391, motor y add-on 553, add-on dentro de Blender 5.0.1 sin ventana OK, vitest 282, lint y build sin avisos, contenido 0 errores, recorrido de pantallas sin problemas. Las tres prácticas se probaron de punta a punta con un Blender simulado que late y cumple las órdenes de la página.

## Pendiente del usuario

- Revisar y fusionar el PR (sin fusionar hasta su visto bueno).
- Publicar: `docs/despliegue/2026-10-11_auditoria_y_motor_5_2.md` (sin SQL; archivar el módulo de «Primeros pasos» con `contenido.py importar`).
- Probar con ventana (T-113) y publicar los tags desde su computadora (T-114).
- Decidir los puntos abiertos P-01 a P-05 del informe (HTTPS en producción es el importante).
