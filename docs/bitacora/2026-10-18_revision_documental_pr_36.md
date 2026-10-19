# Revisión documental del PR #36 · 18 de octubre de 2026

Se contrastó la rama del PR (`f9e2174`) con `main` (`abd9928`). El PR #35 está fusionado desde el 11 de octubre mediante `28b8772`; Motor 5.2 y Facetas ya están en el código.

## Correcciones

- Incorporar `main` a la rama del PR y resolver el conflicto de `KANBAN.md` conservando el archivo generado de `main`. El workflow existente ejecuta `tablero/actualizar.py` tras el push; las ramas de trabajo no mantienen copias manuales del tablero.
- README: motor 5 y add-on 5.2.0, SQL 012 y 21 tablas, siguiente script 013, tags publicados hasta alpha.10 y pendientes alpha.11–15. Alpha.15 identifica el código del PR #35, no esta documentación posterior.
- Índice: estado de main, enlaces al despliegue, Amatista Taller y bitácoras del 11 y 18 de octubre.
- Despliegue: ausencia de SQL nuevo en el PR no implica que Oracle esté actualizado; exigir diagnóstico y migraciones anteriores antes de reiniciar el backend.
- Conteos históricos: auditoría 282 pruebas frontend; cierre del PR #35 con Facetas, 286. La ejecución de CI del nuevo commit es la evidencia vigente.

## Validación y pendientes

El push de esta corrección debe ejecutar el workflow CI (backend, frontend y add-on dentro de Blender sin ventana). Consultar sus resultados en el PR #36 antes de marcarlo listo para revisión.

**T-113 permanece pendiente:** prueba con un alumno nuevo en Blender con ventana y recorrido de las tres prácticas conectado a la plataforma. No se ha comprobado la VM ni Oracle ni se ha desplegado código. Los tags alpha.11–15 no se publican con esta corrección. El PR #36 debe permanecer sin fusionar hasta la revisión del usuario.
