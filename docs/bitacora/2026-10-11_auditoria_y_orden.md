# Bitácora · Auditoría completa y orden de la plataforma (11 oct 2026)

**Pedido (Maximiliano, 05:16 UTC):** organizar la plataforma y el admin; auditar todo desde el primer commit (commits, tags, errores gráficos, visuales, de conflicto, de seguridad y de código) y corregirlo. Puntos concretos: las tarjetas «¿Verdad o mito?» no funcionan; el curso de introducción del árbol de Blender no debe ser un curso sino algo que te guíe por la plataforma; la plataforma se siente desconectada y compleja, debe ser simple y no exigir saber programar; el add-on solo explica dos o tres cosas: hacen falta una a tres prácticas (no un curso) que expliquen todas sus herramientas; lavado de cara, y una tarjeta que explique en detalle cómo se fusionan la plataforma y el add-on.

**Decisiones por defecto (sin preguntar, reversibles):** informe de auditoría en el repositorio y copia en los archivos del proyecto; correcciones en el mismo PR, un commit por tema; el curso de nivel 0 se archiva y lo reemplaza un recorrido guiado; tres prácticas del add-on; misma paleta y mismo diseño.

## Qué se hizo

1. **Auditoría** (`docs/auditoria/2026-10-11_auditoria_completa.md`): clon completo, 270 commits y 49 merges, búsqueda de secretos y archivos pesados en toda la historia (limpia), tags (todos en `main`; faltaban alpha.11 a alpha.14), todas las suites, todas las páginas a 390 y 1280 px con tres roles y las 48 lecciones a 390 px.
2. **Correcciones** (16): la principal, «¿Verdad o mito?» no volteaba porque la animación de entrada pisaba el giro. Las demás: desbordes a 390 px, el curso v2 archivado en Mi panel, «código de 6 letras», el conteo de Admin › Resumen, la duración del jefe de A-Frame, la opción de comentarios del build en Vite 8, el CHANGELOG y los tags.
3. **Add-on 5.2 «Conoce Amatista Motor»**: tres prácticas (tu pestaña Amatista; muévete y usa tus herramientas; así te enseña el taller) que cubren 24 temas y se comprueban solas, incluidos los botones del add-on.
4. **Plataforma**: barra Cursos · Blender · Mi panel; recorrido guiado de 10 paradas; página Blender con la tarjeta de la fusión, instalar, las tres prácticas en vivo y los ajustes; Ayuda sin candados; Mi panel con una tarjeta por curso y listas cortas.

## Segunda parte: diseño «Facetas» (05:28 UTC)

Pedido: reorganizar los recursos de la plataforma, organización de páginas a nivel empresarial, mejor CSS y que el tema low poly brille, todo planificado. Plan en `docs/diseno/2026-10-11_sistema_facetas.md`. Se hizo: piezas comunes en `components/estructura/`, todas las páginas interiores con migas y encabezado facetado, pie global, títulos de sección, «Tres lugares» en la portada y destellos en el fondo. Pruebas: vitest 286, lint y build sin avisos, todas las páginas y las 48 lecciones a 390 y 1280 px sin desbordes ni errores, recorrido guiado completo en ambos anchos (T-115).

## Commits (rama `claude/auditoria-orden-plataforma-wfzu65`)

`c6c5de4` arreglos gráficos · `8af56a8` retirar «Primeros pasos» · `4d45128` add-on 5.2 · `efe01e3` API del enlace · `59f863d` página Blender · `62f48ee` bloque de Blender en lecciones · `e1c1287` recorrido, pestaña Blender y Ayuda · `970b88d` Mi panel · `e93545b` Admin › Resumen · `e07bb30` duración A-Frame · `57475fe` comentarios del build · `fb3955d` desborde de Mi panel · documentación y tablero. Diseño «Facetas»: `71327b3` plan · `9cad9be` CSS y piezas comunes · `ff4bb0c` páginas · `dcb443a` fondo · `08707fc` documentación y T-115.

## Pruebas

Backend 391, motor y add-on 553, add-on dentro de Blender 5.0.1 sin ventana OK, vitest 286, lint y build sin avisos, contenido 0 errores, recorrido de pantallas sin problemas. Las tres prácticas se probaron de punta a punta con un Blender simulado que late y cumple las órdenes de la página.

## Fusión

Maximiliano dio el visto bueno el 11 de octubre a las 18:40 UTC («Fusiona con main y documenta»). Se trajo `main` (solo chocaba `KANBAN.md`, regenerado con `tablero/actualizar.py`), el CI quedó en verde y el PR #35 se fusionó con merge commit (`28b8772`) para conservar los commits por tema. La documentación (README, índice, despliegue y esta bitácora) entró después, en un paso aparte, como pidió Maximiliano («Pero primero fusiona»).

## Pendiente del usuario

- **Publicar en producción:** `docs/despliegue/2026-10-11_auditoria_y_motor_5_2.md` (sin SQL; archivar el módulo de «Primeros pasos» con `contenido.py importar`, publicar el build nuevo y reinstalar Amatista Motor 5.2).
- **Probar con ventana** en Blender el add-on 5.2 y «Conoce Amatista Motor» (T-113).
- **Tags** desde su computadora (T-114): `git checkout main && git pull && bash herramientas/crear-tags.sh && git push origin --tags`, que ya incluye `v3.0.0-alpha.15` sobre `28b8772`.
- **Borrar la rama** `claude/auditoria-orden-plataforma-wfzu65`.
- **Decidir** los puntos abiertos P-01 a P-05 del informe (HTTPS en producción es el importante).
