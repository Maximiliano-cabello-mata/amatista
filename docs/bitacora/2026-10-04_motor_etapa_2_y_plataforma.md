# Bitácora · 4 de octubre de 2026 · Motor etapa 2 y plataforma por módulos

Pedido de Maximiliano (4 oct, 03:04): documentar todo lo hecho con una carpeta exclusiva para el motor y la etapa 1 completa; integrar Blender en los módulos (cada módulo con su práctica al final) en lugar de una pestaña aparte; diseñar etiquetas y gráficos nuevos para los módulos y mejores herramientas de enseñanza en el administrador, documentadas; organizar mejor el panel; y llevar el motor a una segunda etapa que acompañe paso a paso en vez de solo exigir.

## Hecho (rama `claude/motor-etapa-2-8z6xd8`, un PR, sin fusionar)

### Motor y add-on (etapa 2)
- Paquete `engine/amatista_engine/guide/`: entrenador por validador (qué hacer, teclas, resaltados, regla, plano, fantasmas, flecha y acción) y acompañante (paso logrado, nuevo paso, vas mejor, retroceso, ¿te ayudo?). Motor 0.3.0.
- Campo opcional `guide: {why, steps}` en los objetivos; la mesa pasa a versión 2 con su porqué en cada paso.
- Add-on 0.3.0: tarjeta del acompañante en la vista 3D con teclas dibujadas y avisos que se desvanecen, guía dibujada en la escena, bloque «Ahora» en el panel, diálogos «Así se hace este paso» y «¿Te ayudo con este paso?», «Hazlo conmigo» y «Muéstrame», preferencias de acompañamiento (Acompañado, Solo tarjeta, Silencioso).

### Plataforma
- Sin pestaña Blender: la práctica cierra cada módulo (ruta del módulo + estación de Blender) y la preparación de Blender vive dentro de la práctica; «Mi Blender» queda en el menú de la cuenta.
- Regla nueva validada en el servidor: después de la práctica en Blender solo puede ir el examen.
- Sistema de etiquetas low poly común a alumno, profesor y administrador.
- Herramientas nuevas: Paso a paso, Atajos de teclado (con «Pruébate») y Comparar.
- Panel de administración agrupado (Enseñanza, Personas, Sistema), página **Herramientas** con vista previa y JSON, paleta del editor agrupada, módulos marcados con o sin práctica.

### Documentación
- `docs/motor/`: referencia movida a `referencia/` (01–06) y nueva `07_guia_y_acompanamiento.md`; `etapas/etapa-1.md` (historia completa de la etapa 1) y `etapas/etapa-2.md`, con maquetas SVG.
- `docs/plataforma/` nueva: mapa por rol, módulos con práctica, etiquetas y gráficos, las 20 herramientas de enseñanza con sus campos y el panel de administración.
- Tablero: T-057 y T-058 en revisión; nuevas T-059 (probar la guía en un Blender real con GPU) y T-060 (guardar las ayudas en Oracle con un 008).

## Segunda parte: estructura fija, repositorio ordenado y tableros (mismo PR)

Pedido de seguimiento (4 oct, 03:07): no reorganizar la página cada vez, sino dejarle una estructura fija y centralizada; que todo sea intuitivo; no poner cosas solo para probar; revisar el repositorio documento por documento; actualizar el tablero actual y también el viejo con lo que se estaba haciendo entonces.

### Estructura fija
- Navegación definitiva: **Cursos · Mi panel · Admin** (Admin solo para el equipo). Se quitó el enlace «Laboratorio» de la barra y del pie de la pantalla de inicio.
- El Laboratorio técnico era una página de prueba visible para alumnos (botón «Crear nueva sesión (prueba)» y una caja de «Tutor IA» sin conectar). Ahora es el **Diagnóstico técnico** (`#/laboratorio`): solo profesores y administradores, se abre desde Admin › Estado, sin botones de prueba.

### Repositorio revisado documento por documento
- `README.md` de la raíz reescrito con el estado real, la estructura con `engine/`, `addon/`, `practices/`, `docs/motor` y `docs/plataforma`, y las 18 tablas de Oracle con 007.
- `PROYECTO.md`: etapa actual, mapa de frentes al 4 de octubre, orden vigente (piloto → después del piloto → fase B) y biblioteca con plataforma, motor y bitácoras nuevas.
- `docs/README.md`: tabla con el estado de cada documento (vigente o historia, y dónde está lo actual).
- Notas de actualización en el formato de lecciones, la Fórmula y el contrato técnico; plan maestro con «Dónde estamos»; manual de Oracle, `backend/sql/LEEME.txt` y `backend/README.md` con el estado de producción (002, 003, 005 y 006 aplicados; 007 después del piloto); READMEs de frontend, motor, add-on y prácticas al día.
- Registro de incidencias: INC-012 (la VM corre `amatista-backend`, no `amatista-api`). `despliegue/actualizar.sh` ahora detecta esa unidad sola.
- `backend/.env.example` documenta `AMATISTA_URL_API` y `AMATISTA_URL_PWA`; `crear-tags.sh` incluye `v3.0.0-alpha.1` y `v3.0.0-alpha.2`.

### Tableros
- **Actual** (`tablero/tareas.yml`): estado real de cada tarea con evidencia y bloqueo (por ejemplo T-035 hecha: 005 y 006 en producción; T-003 en progreso: el servicio corre como `amatista-backend`). El generador ahora muestra `bloqueo`, `evidencia` y `aceptacion` debajo de cada tarea.
- **Viejo** (`tablero/historico/2026-10-03_v2_*`): se conserva tal como se publicó y se le agregó al principio la revisión: qué decía el tablero, estado real al cierre y dónde siguió cada tarea. Al cierre de la v2 había 16 hechas, 4 a medias y 13 pendientes (el tablero mostraba 4 hechas).

## Pruebas

Backend 265 (pytest, ruff limpio), motor y add-on 43 (pytest), tablero 8, frontend 158 (vitest) con lint y build; el add-on dentro de `bpy` 5.0.1 con el recorrido de la etapa 2. Blender sin interfaz no tiene GPU: la guía 3D se probó con un `gpu` simulado y las imágenes de la documentación son maquetas (T-059 pide capturas reales).

## Sin cambios en Oracle

La integración en módulos usa el JSON de las lecciones; las ayudas viajan en el intento y el servidor las ignora. No hay script nuevo que ejecutar.

## Después de fusionar

- Borrar la rama `claude/motor-etapa-2-8z6xd8` desde la computadora del usuario.
- Publicar los tags pendientes: `bash herramientas/crear-tags.sh && git push origin --tags`.
- Después del piloto (junto con T-055): registrar y publicar la mesa versión 2 con `python herramientas/contenido.py practicas --publicar` (desde `backend/`).
