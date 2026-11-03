# Centro de dirección de Amatista

Punto de entrada para Maximiliano como desarrollador único. Aquí se decide **qué sigue, por qué y dónde está la información**. Las carpetas técnicas y los documentos existentes conservan su ubicación.

[Corte hack4edu (3–6 nov)](docs/CORTE_HACK4EDU.md) · [Léeme primero](docs/LEEME_PRIMERO.md) · [Tablero actual](KANBAN.md) · [Tareas y versiones](tablero/tareas.yml) · [Operar el Kanban](tablero/README.md) · [Historial de entregas](CHANGELOG.md) · [Índice de docs](docs/README.md) · [Mapa del repositorio](docs/manual-del-codigo/01_mapa_del_repositorio.md) · [Plataforma](docs/plataforma/README.md) · [Amatista Engine](docs/motor/README.md) · [Última bitácora (1 nov)](docs/bitacora/2026-11-01_g7b_y_centro_3d.md) · [Despliegue público .tech](docs/despliegue/2026-10-29_despliegue_publico_amatista_3d_tech.md) · [Cronología](docs/historia/01_cronologia.md) · [Manual del desarrollador](docs/desarrollador/README.md)

## 1. Dirección y límite de trabajo

**Producto principal:** una plataforma educativa para aprender creación 3D y llevarla a la web con Blender, GLB y A-Frame/WebXR, manteniendo el aprendizaje y el progreso local cuando no hay conexión.

**Etapa actual: v3 «Reestructuración» y convergencia hacia el Corazón Amatista 1.0 y el Centro 3D (v3.5.0).**
- **Octubre de 2026 (Motores 3.4 a 7.0 y plataforma completa):** se construyeron el reconocimiento de figuras y siluetas (`figure.recognize`, `figure.silhouette`), la revisión autónoma contra ejemplo (`example.matches`), **Amatista Taller** por habilidades (Motor 5, `sql/012`), el sistema de diseño **Facetas**, el **Estudio A-Frame** (`#/estudio`), el **Motor Web** (`frontend/src/motor3d/`), **Goliat** (`frontend/src/goliat/`), los **avatares y el buzón del creador** (`sql/013`), la sincronización comprimida para **escuelas con pocos datos** (`POST /api/sincronizar`), las **fichas de herramientas** (`practices/blender/fichas.json`), la plantilla **Blender Amatista**, los instaladores `.exe`/`.deb` y el **Motor 7 «Guion»** (pasos con verbo evaluados por el resultado en la escena).
- **31 de octubre de 2026 (Corazón Amatista 1.0 y Add-on 7.1):** para detener la proliferación de versiones en el add-on, la lógica de qué ve el alumno se extrajo a `engine/amatista_engine/corazon/` (contrato estable `amatista.corazon/1`), con director, andamio por herramienta, señales verificadas cada 0,5 s (que no caducan por reloj), perfiles por programa y ramas en `practices/ramas/`. Referencia: [Corazón Amatista](docs/motor/referencia/23_corazon.md) · [bitácora](docs/bitacora/2026-10-31_corazon_amatista.md).
- **1 de noviembre de 2026 (Segundo objetivo: Centro de conocimiento 3D alimentado por G7B):** además de enseñar, Amatista recomendará versiones, perfiles de rendimiento (`N0` a `N4`) y prácticas según el equipo y el avance de cada persona, con datos agregados del proyecto hermano [G7B](https://github.com/Maximiliano-cabello-mata/amatista-g7b-etl). Son **proyectos separados que se alimentan**: G7B mide y modela costos; Amatista enseña, recomienda y es la única que guarda datos personales. Propuesta: [centro 3D y G7B](docs/propuestas/2026-11-01_centro_3d_y_g7b.md) · [bitácora](docs/bitacora/2026-11-01_g7b_y_centro_3d.md) · versión `v3.5.0` del tablero.

**Regla personal:** una tarea en ejecución, hasta tres preparadas para continuar y una sola meta de entrega. Revisión cuenta dentro del trabajo activo.

## 2. Qué fuente responde cada pregunta

| Pregunta | Fuente que se mantiene |
|---|---|
| ¿Hacia dónde voy y cómo trabajo? | Este centro (`PROYECTO.md`) |
| ¿Qué tareas y versiones existen? | [tablero/tareas.yml](tablero/tareas.yml) |
| ¿Qué estado deduce Git para cada tarea? | [KANBAN.md](KANBAN.md), generado |
| ¿Dónde está cada carpeta y archivo del código? | [Mapa del repositorio](docs/manual-del-codigo/01_mapa_del_repositorio.md) |
| ¿Cómo se ejecuta cada componente? | [Frontend](frontend/README.md), [backend](backend/README.md), [engine](engine/README.md) y [addon](addon/README.md) |
| ¿Qué se entregó? | [CHANGELOG.md](CHANGELOG.md), tags y PR correspondiente |
| ¿Por qué se tomó una decisión técnica? | Documento específico en [arquitectura](docs/arquitectura/) o [motor/referencia](docs/motor/referencia/) |
| ¿Qué ocurrió durante una sesión? | [Bitácora](docs/bitacora/) |
| ¿Cómo se diagnosticó un problema? | [Incidencias](docs/incidencias/) |
| ¿Qué ampliaciones se están considerando? | [Propuestas](docs/propuestas/) |

## 3. Mapa de frentes y evidencia disponible

Fotografía actualizada al **2 de noviembre de 2026** (`main` en `99d6ea2`):

| Frente | Evidencia y ubicación | Estado y enfoque |
|---|---|---|
| **Cursos y módulos** | [Módulos JSON](frontend/src/data/modulos/), [ruta de Blender](docs/cursos/03_ruta_de_aprendizaje_blender.md), [camino y Motor Web](docs/plataforma/13_camino_graficos_y_motor_web.md) | **15 módulos publicados**: 9 de Blender (Principiante, Principiante-Intermedio e Intermedio) y 6 de A-Frame (Inicial e Interactivo). Avanzado bloqueado (`T-067`). |
| **Estudio A-Frame y Motor Web** | [Estudio.jsx](frontend/src/pages/Estudio.jsx), [motor3d/](frontend/src/motor3d/), [estudio/](frontend/src/estudio/) | Editor libre en `#/estudio` con vista en vivo, plantillas, modelos GLB low poly offline y bloque `motor_scene`. |
| **Compañero Goliat, Avatares y Buzón** | [goliat/](frontend/src/goliat/), [avatares/](frontend/src/avatares/), [buzon/](frontend/src/buzon/), [api/perfil.py](backend/api/perfil.py), [api/buzon.py](backend/api/buzon.py) | En `main` con `sql/013_avatares_y_buzon.sql`. Falta aplicar `013` y `AMATISTA_CREADOR` en el servidor (`T-149`) y revisar gestos con el creador (`T-147`). |
| **PWA y ahorro de datos** | [progreso/](frontend/src/progreso/), [api/sincronizar.py](backend/api/sincronizar.py), [17_pocos_datos.md](docs/plataforma/17_pocos_datos.md) | Sincronización comprimida con gzip (`POST /api/sincronizar`), reintentos y modo Ahorro de datos listos en `main`. Pendiente desplegar y probar en red móvil (`T-161`). |
| **API, Oracle y Despliegue `.tech`** | [main.py](backend/main.py), [sql/LEEME.txt](backend/sql/LEEME.txt), [despliegue .tech](docs/despliegue/2026-10-29_despliegue_publico_amatista_3d_tech.md) | PWA en `amatista-3d.tech` (Cloudflare Workers) y API en `api.amatista-3d.tech` (OCI + Caddy). Esquema en código con **24 tablas** (`001`–`013`). Falta aplicar `007`–`013` en producción, pasar a `AMATISTA_APP` (`T-004`), cerrar el puerto 8000 en OCI (`T-130`) y configurar SMTP (`T-032`). |
| **Corazón Amatista 1.0 y Add-on 7.1** | [engine/amatista_engine/corazon/](engine/amatista_engine/corazon/), [addon/amatista_blender/guion/](addon/amatista_blender/guion/), [23_corazon.md](docs/motor/referencia/23_corazon.md) | Contrato `amatista.corazon/1`, Motor 7 «Guion», 43 validadores, 33 habilidades, 26 fichas e instaladores `.exe`/`.deb` en `main` (99/100 alumnos simulados aprueban). Faltan las pruebas con ventana real (`T-113`, `T-143`, `T-172`, `T-178`, `T-182`) y el despliegue del Motor 7.1 (`T-179`). |
| **Observabilidad (Sentry)** | [observabilidad.py](backend/observabilidad.py), [2026-10-31_sentry.md](docs/despliegue/2026-10-31_sentry.md) | Integrado en backend y PWA sin datos personales (`T-184`). Falta cargar los DSN en la VM y Cloudflare (`T-185`). |
| **Centro 3D y G7B (Estadía)** | [2026-11-01_centro_3d_y_g7b.md](docs/propuestas/2026-11-01_centro_3d_y_g7b.md), [bitácora](docs/bitacora/2026-11-01_g7b_y_centro_3d.md) | Tareas `T-186` a `T-195` definidas en `v3.5.0`: protocolo experimental, perfiles `N0`–`N4` en el add-on y telemetría anónima agregada (mínimo 5 equipos). |

## 4. Orden de ejecución vigente

1. **Cerrar la brecha entre `main` y producción (Despliegue y Base de Datos):**
   - Ejecutar `python diagnostico_oracle.py` en la VM, respaldar con `migrar.py exportar` y aplicar en orden los scripts pendientes (`007` a `013`) más `004` (`T-004`, `T-149`).
   - Desplegar backend y PWA actualizados (`T-161`, `T-179`), configurar `SENTRY_DSN` (`T-185`), cerrar el puerto 8000 directo en OCI (`T-130`) y configurar SMTP (`T-032`).
2. **Pruebas en Blender con ventana real y GPU:**
   - Validar en escritorio el Motor 7 «Guion» y el Corazón Amatista 1.0 (`T-178`, `T-182`), las fichas y el faro (`T-143`, `T-172`) y el recorrido de «Conoce Amatista Motor» (`T-113`).
3. **Experimento de estadía y Centro 3D con G7B (`v3.5.0`):**
   - Definir protocolo y consentimiento (`T-186`, `T-187`), implementar el detector y aplicador de perfiles `N0`–`N4` en el add-on (`T-188`) y la extensión observadora del Corazón (`T-189`, `T-190`).

## 5. Flujo de una sola persona

### Capturar

Una idea nueva entra como propuesta fechada en `docs/propuestas/`: problema, usuario beneficiado, resultado mínimo, dependencia y condición para retomarla. Las ideas no necesitan una rama Git abierta.

### Preparar

Elegir la tarea que más acerque a la meta vigente. En `tablero/tareas.yml`, una tarea preparada puede añadir estos campos opcionales:

```yaml
    resultado: "Resultado observable por el usuario o desarrollador"
    depende_de: []             # IDs existentes; [] si no hay dependencia
    aceptacion:
      - "Comprobación concreta para aceptar el resultado"
    evidencia: []              # enlaces a PR, informe o documento, sin secretos
    bloqueo: null              # causa y siguiente acción cuando corresponda
```

### Ejecutar y revisar

1. Elegir una sola tarea preparada y crear una rama corta desde `main` actualizado.
2. Mencionar únicamente la tarea trabajada en los commits; mencionar otros IDs puede mover sus tarjetas.
3. Implementar el resultado mínimo y ejecutar las comprobaciones relacionadas.
4. Abrir PR con resultado, prueba, limitación conocida y enlace a evidencia.
5. Hacer revisión propia: leer el diff, probar el recorrido afectado y actualizar documentación si cambió el comportamiento.
6. Usar `cierra T-XXX` solo cuando el criterio se haya cumplido. En una rama significa revisión; al llegar a `main`, hecho.
7. Integrar, comprobar el resultado y retirar la rama cuando ya no sea necesaria.

## 6. Ramas y versiones

| Rama | Uso |
|---|---|
| `main` | Base integrada; cada cambio debe tener evidencia verificable |
| `feat/T-XXX-descripcion` | Un resultado nuevo |
| `fix/T-XXX-descripcion` | Una corrección |
| `docs/descripcion` | Centralización o documentación |
| `claude/...` | Rama de trabajo de una sesión asistida: solo una a la vez además de `main`; se borra al fusionar |

Cerrar una versión exige: tareas aceptadas, evidencia del recorrido de usuario, notas en `CHANGELOG.md` y tag conforme a la [convención existente](docs/guias/2026-10-01_versiones-y-tablero.txt).

## 7. Entrada de futuras ampliaciones

Antes de promover una propuesta a tarea, responder:

1. ¿Qué problema del estudiante resuelve?
2. ¿Cuál es la demostración mínima que permite aceptarla?
3. ¿Qué parte ya existente reutiliza y qué dependencia añade?
4. ¿Cuántas sesiones se dedicarán a validar su viabilidad?
5. ¿Qué se pausa para hacerle espacio?

## 8. Biblioteca central

La lista de documentos vive en un solo lugar: el [índice de la documentación](docs/README.md), ordenado en diez secciones:
- **Cómo llegamos aquí**: [cronología exacta](docs/historia/01_cronologia.md) · [ideas y cómo se implementaron](docs/historia/02_ideas_y_como_se_implementaron.md) · [la plataforma en cada versión](docs/historia/03_la_plataforma_en_cada_version.md)
- **El código**: [mapa del repositorio](docs/manual-del-codigo/01_mapa_del_repositorio.md) · [manual del código](docs/manual-del-codigo/README.md) · [esquema SQL](docs/base-de-datos/README.md) · [herramientas de la plataforma](docs/herramientas-de-la-plataforma.md)
- **Trabajar en el repo**: [manual del desarrollador](docs/desarrollador/README.md) · [despliegue público en .tech](docs/despliegue/2026-10-29_despliegue_publico_amatista_3d_tech.md)
- **Dirección**: [plan maestro v3](docs/reestructuracion/00_plan_maestro.md) · [Centro 3D y G7B](docs/propuestas/2026-11-01_centro_3d_y_g7b.md) · [Amatista Engine](docs/motor/README.md)
- **Registros**: [bitácora](docs/bitacora/) · [incidencias](docs/incidencias/README.md)
