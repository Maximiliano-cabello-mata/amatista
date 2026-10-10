# Centro de dirección de Amatista

Punto de entrada para Maximiliano como desarrollador único. Aquí se decide **qué sigue, por qué y dónde está la información**. Las carpetas técnicas y los documentos existentes conservan su ubicación.

[Tablero actual](KANBAN.md) · [Tareas y versiones](tablero/tareas.yml) · [Operar el Kanban](tablero/README.md) · [Historial de entregas](CHANGELOG.md) · [Índice de docs](docs/README.md) · [Reestructuración v3](docs/reestructuracion/README.md) · [Plataforma](docs/plataforma/README.md) · [Amatista Engine](docs/motor/README.md) · [Último registro (9 oct)](docs/bitacora/2026-10-09_el_ejemplo_manda.md) · [Plan de despliegue](docs/despliegue/2026-10-05_plan_de_despliegue.md) · [Cronología](docs/historia/01_cronologia.md) · [Manual del desarrollador](docs/desarrollador/README.md)

## 1. Dirección y límite de trabajo

**Producto principal:** una plataforma educativa para aprender creación 3D y llevarla a la web con Blender, GLB y A-Frame/WebXR, manteniendo el aprendizaje y el progreso local cuando no hay conexión.

**Etapa actual (desde el 3 de octubre de 2026): v3 «Reestructuración».** Es una ampliación, no un reinicio: el curso se organiza en cinco niveles, cada lección declara su versión de Blender verificada y su ficha (objetivo, habilidades, comprobación), el avance se mide también por habilidades, y un add-on de Blender se conectará a la plataforma. Todo con migraciones aditivas que conservan usuarios y progreso. Plan, fases y decisiones pendientes: [plan maestro](docs/reestructuracion/00_plan_maestro.md).

**Dos frentes en paralelo, sin mezclarse:** el piloto del 8 de octubre se hace con la v2.2 (servicio, HTTPS, SMTP, pruebas y seguridad: versión `v2.2.0` del tablero); la v3 avanza por fases (A base → B contenido existente en niveles → C «Mi primer espacio 3D» → D laboratorio GLB → E add-on → F especialidades y tutor). Los scripts 005 y 006 pueden ejecutarse en Oracle antes del piloto; el código nuevo se despliega después.

**Adelantado a pedido del usuario (4 de octubre): Amatista Engine y plataforma por módulos.** El motor de prácticas y su add-on (fase E) llegaron antes que las fases B y C: etapa 1 (evalúa) en el PR #13 y etapa 2 (acompaña paso a paso) en el PR #14. La plataforma deja de tener pestañas sueltas: estructura fija **Cursos · Mi panel · Admin**, y cada módulo cierra con su práctica en Blender ([plataforma](docs/plataforma/README.md), [motor](docs/motor/README.md)). Nada de esto toca el piloto: el script 007 se ejecuta después (T-055).

**9 de octubre: integración educativa plataforma ↔ Blender reforzada.** En bitácoras del 9 oct (motor 3.4, 3.5 y 3.5.1) el flujo se consolidó: reconocimiento de figura, instructor por checklist y revisión autónoma contra ejemplo (`example.matches`). Referencias: [plataforma y blender integrados](docs/bitacora/2026-10-09_plataforma_y_blender_integrados.md), [blender como instructor](docs/bitacora/2026-10-09_blender_como_instructor.md), [el ejemplo manda](docs/bitacora/2026-10-09_el_ejemplo_manda.md).

**9 de octubre: la plataforma maneja Blender y el ejemplo manda.** El PR #24 (Motor 3.4, en `main` desde `255d054`) trajo `figure.recognize` (el motor deduce qué es cada pieza por su forma), el enlace en vivo entre la lección y Blender, el modo enfocado en Blender y el script de Oracle 010. El PR #25 (Motor 3.5, fusionado el 10 de octubre) abre cada práctica en su propia escena, reconoce la silueta de una figura hecha en una sola malla (`figure.silhouette`) y da a cada práctica su ejemplo resuelto en código: el motor revisa la escena del alumno contra ese ejemplo y la lección maneja la práctica desde la tarjeta «Ahora en Blender» ([el ejemplo y la revisión](docs/motor/referencia/14_ejemplo_y_revision.md)). El PR #26 (Motor 3.5.1) comparte entre procesos el detalle del instructor con el script de Oracle 011 (`ADDON_ENLACES.DETALLE`). Nada de esto está en producción: faltan T-087 (010 en Oracle), 011 y T-092 (entregar Amatista Motor 3.5).

Tutor IA y motor generativo siguen entrando por incrementos independientes. Las lecciones de lectura e interactivas de cada módulo se completan sin add-on; la práctica en Blender es la estación final del módulo.

**Regla personal:** una tarea en ejecución, hasta tres preparadas para continuar y una sola meta de entrega. Revisión cuenta dentro del trabajo activo. Estos límites son una política manual; el generador actual no los impone.

## 2. Qué fuente responde cada pregunta

| Pregunta | Fuente que se mantiene |
|---|---|
| ¿Hacia dónde voy y cómo trabajo? | Este centro |
| ¿Qué tareas y versiones existen? | [tablero/tareas.yml](tablero/tareas.yml) |
| ¿Qué estado deduce Git para cada tarea? | [KANBAN.md](KANBAN.md), generado |
| ¿Cómo se ejecuta cada componente? | [Frontend](frontend/README.md) y [backend](backend/README.md) |
| ¿Qué se entregó? | [CHANGELOG.md](CHANGELOG.md), tags y PR correspondiente |
| ¿Por qué se tomó una decisión técnica? | Documento específico en [arquitectura](docs/arquitectura/) |
| ¿Qué ocurrió durante una sesión? | [Bitácora](docs/bitacora/) |
| ¿Cómo se diagnosticó un problema? | [Incidencias](docs/incidencias/) |
| ¿Qué ampliaciones se están considerando? | [Propuestas](docs/propuestas/) |

El README presenta el producto; sus fases describen la visión general. Para priorizar trabajo se consulta este centro y el roadmap de tareas. No mantener una segunda lista manual de estados aquí. Cuando cambie una decisión técnica, actualizar su documento y enlazarla desde este centro; los reportes fechados siguen siendo historia.

## 3. Mapa de frentes y evidencia disponible

Revisión del 4 de octubre de 2026 (`main` en `c730c0e`, con el PR #14 fusionado); las filas de cursos, motor y seguridad se actualizaron el 5 de octubre (`main` en `2402549`), y las de Oracle y motor el 10 de octubre (`main` con los PR #25, #26 y #27). Es una fotografía del repositorio y de lo que el usuario reportó del servidor el 3 de octubre, no una certificación del servidor.

| Frente | Evidencia y ubicación | Estado y enfoque |
|---|---|---|
| Cursos y módulos | [Módulos JSON](frontend/src/data/modulos/), [módulos con práctica](docs/plataforma/02_modulos_y_practica.md), [la Fórmula](docs/arquitectura/2026-10-02_formula_modulos.txt) | Blender Principiante, Principiante-Intermedio e Intermedio publicados (9 módulos, 18 prácticas); Avanzado bloqueado (T-067); A-Frame módulo 1. La mesa y el curso v2, archivados (009). Consolidar con alumnos antes de multiplicar contenido (T-066) |
| Herramientas de enseñanza | [Catálogo](frontend/src/data/herramientas.js), [documentación](docs/plataforma/04_herramientas_de_ensenanza.md) | 20 bloques de lección, con vista previa en Admin › Herramientas |
| PWA y progreso | [Configuración PWA](frontend/vite.config.js), [almacén](frontend/src/lib/almacen.js), [progreso](frontend/src/progreso/) | Funciona offline y sincroniza; falta probarlo de punta a punta en el servidor (T-030) |
| API y Oracle | [Backend](backend/README.md), [scripts](backend/sql/LEEME.txt), [manual](docs/reestructuracion/02_manual_oracle.md) | En producción con 002, 003, 005 y 006 (14 tablas, usuario ADMIN). Falta servicio con HTTPS (T-003, T-005). Faltan 007, 008, 009, 010 y 011 después del piloto (T-055, T-064, T-087; con 010 son 20 tablas y 011 agrega una columna) |
| Amatista Engine y add-on | [engine/](engine/README.md), [addon/](addon/README.md), [practices/](practices/README.md), [docs/motor](docs/motor/README.md) | Motor 3.5.1 y add-on Amatista Motor 3.5.1 en `main` (PR #25 y #26: ejemplo resuelto por práctica y revisión contra él, 42 validadores). Falta subirlo a producción (T-078, T-087 y T-092), probar el instalador en Windows y Mac reales (T-056) y la guía en un Blender con GPU (T-059) |
| Panel de administración | [Panel](docs/plataforma/05_panel_de_administracion.md) | Agrupado por tareas (Enseñanza, Personas, Sistema); el diagnóstico técnico, antes «Laboratorio», vive en Admin › Estado |
| Visor GLB | [Vista A-Frame](frontend/src/components/leccion/VistaAFrame.jsx) | Hay base 3D en las lecciones; el laboratorio GLB es la fase D (T-011) |
| Tutor IA | [Prompts](ai_tutor/prompts/) | Carpeta reservada; no presentar la integración como terminada |
| Motor generativo | [Propuesta del motor](docs/propuestas/2026-09-27_motor_generativo_3d.txt) | Investigación separada; requiere límites de ejecución y prueba de viabilidad |

## 4. Orden de ejecución propuesto

> **Orden vigente (9 de octubre):**
> 1. **Alinear verdad operativa:** documentación base + auditoría educativa + UI de alumno sin placeholders.
> 2. **Cerrar integración Blender:** T-087, T-091, T-092 y T-093 con evidencia funcional.
> 3. **Operación y despliegue:** T-065, T-078, T-079, T-032.
> 4. **Siguiente bloque:** T-083, T-080, T-081, T-067.
>
> **Orden anterior (4 de octubre), como historia:**
> 1. **Piloto del 8 de octubre con la v2.2:** T-003 (servicio), T-005 (HTTPS), T-032 (SMTP), T-029 y T-030 (seguridad y prueba de punta a punta).
> 2. **Después del piloto:** T-055 (ejecutar 007 y publicar la mesa versión 2), T-056 (instalador en Windows y Mac) y T-059 (guía en Blender con GPU).
> 3. **Fase B:** T-038 (decidir la versión LTS de Blender), T-039, T-044 y T-041.
>
> T-035 (005 y 006 en Oracle) ya está hecha. El detalle vive en el [plan maestro](docs/reestructuracion/00_plan_maestro.md) (sección 3) y en el [tablero](KANBAN.md). La tabla siguiente es la del 1 de octubre y se conserva como historia; cómo terminó cada tarea de entonces está en el [tablero de la v2 revisado](tablero/historico/2026-10-03_v2_KANBAN.md).

Las versiones originales se conservan en el YAML. El orden de trabajo puede adelantar un habilitador de otra versión sin dar por publicada esa versión.

| Orden | Trabajo existente | Dependencia y evidencia para cerrarlo |
|---|---|---|
| 1 | T-007 · CI | Ejecutar lint/build del frontend y pytest del backend en PR; un fallo debe impedir considerar validado el cambio |
| 2 | T-004 · Usuario Oracle | Crear y probar usuario de aplicación con permisos necesarios; conexión y operaciones sin ADMIN |
| 3 | T-002 · Esquema Oracle | Diagnóstico correcto en el esquema del usuario de aplicación y prueba de guardar/leer progreso; revisar antes el SQL, que recrea tablas y borra datos de prueba |
| 4 | T-003 · Servicio backend | Usa la configuración anterior; servicio inicia después de reiniciar y salud devuelve Oracle disponible |
| 5 | T-005 · HTTPS | Frontend desplegado consume API por HTTPS sin contenido mixto ni errores CORS; comprobar el recorrido offline/reconexión |
| 6 | T-006 · Cuentas | Identidad autenticada y comprobación de que un alumno no puede consultar ni modificar progreso ajeno |
| 7 | T-008 · Protección de main | CI operativa; resolver antes la publicación automática del Kanban, que hoy hace push directo a main |
| 8 | T-009 y T-010 · Módulo 2 | Una tarea por vez; contenido, evaluación y progreso comprobados. Definir si T-010 necesita antes el visor de T-011 |
| 9 | T-011, T-012 y T-013 · 3D Lab | Un incremento por vez: visor GLB → tutor contextual → puente con Blender. Cada uno debe seguir funcionando sin depender del siguiente |

T-001 ya figura cerrada en el tablero consultado; su estado vigente siempre se consulta allí.

**Antes de abrir el producto a alumnos reales:** completar cuentas y autorización. La meta de Oracle puede validarse primero con datos de prueba en un entorno controlado.

**Alcance del primer ciclo:** preparar y cerrar T-007. Después preparar T-004, T-002 y T-003. Si el servidor no está disponible, registrar el bloqueo y realizar una sola tarea independiente; no declarar completada la integración por pasar pruebas con SQLite.

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

Desde el 4 de octubre el generador muestra `bloqueo`, `evidencia` y `aceptacion` como notas debajo de cada tarea en el detalle por versión de `KANBAN.md`; no valida dependencias. Son información manual, no estados nuevos del Kanban. Para lo que pasa fuera de git (un script ejecutado en Oracle, una prueba en el servidor) se usa el campo `estado` como estado mínimo puesto a mano.

Dividir cualquier trabajo que no pueda verificarse en una o dos sesiones. Usar el siguiente ID libre. No reutilizar IDs ni crear una tarea genérica como «terminar toda la IA».

### Ejecutar y revisar

1. Elegir una sola tarea preparada y crear una rama corta desde main actualizado.
2. Mencionar únicamente la tarea trabajada en los commits; mencionar otros IDs puede mover sus tarjetas.
3. Implementar el resultado mínimo y ejecutar las comprobaciones relacionadas.
4. Abrir PR con resultado, prueba, limitación conocida y enlace a evidencia.
5. Hacer revisión propia: leer el diff, probar el recorrido afectado y actualizar documentación si cambió el comportamiento.
6. Usar `cierra T-XXX` solo cuando el criterio se haya cumplido. En una rama significa revisión; al llegar a main, hecho.
7. Integrar, comprobar el resultado y retirar la rama cuando ya no sea necesaria.

No se requiere inventar roles ni reuniones. La revisión propia es una pausa deliberada para verificar el resultado, no una aprobación ficticia de otra persona.

### Bloqueos y cierre de sesión

Si falta acceso, información o una dependencia, anotar causa, siguiente acción y condición de desbloqueo en la tarea. El Kanban no tiene columna Bloqueado: el campo manual, que el tablero muestra como «⏸️ Espera», evita ocultarlo. Puede mantenerse una tarea bloqueada y trabajar en una alternativa; nunca dos implementaciones simultáneas.

Al terminar una sesión, dejar en el PR o bitácora tres líneas: qué quedó comprobado, qué falta y cuál es el siguiente paso. No duplicar el mismo informe en varios archivos.

### Revisión semanal de 20 minutos

- Revisar la meta y retirar del ciclo lo que no contribuya a ella.
- Elegir hasta tres tareas preparadas y resolver dependencias.
- Revisar bloqueos y ramas abiertas.
- Promover como máximo una ampliación si el incremento anterior quedó validado.
- Medir tareas aceptadas, antigüedad de la tarea activa y bloqueos. No usar número de commits como medida de avance.

## 6. Ramas y versiones

Una línea de producto es un frente del roadmap; una rama Git es un cambio temporal.

| Rama | Uso |
|---|---|
| `main` | Base integrada; cada cambio debe tener evidencia verificable |
| `feat/T-XXX-descripcion` | Un resultado nuevo |
| `fix/T-XXX-descripcion` | Una corrección |
| `docs/descripcion` | Centralización o documentación |
| `claude/...` | La rama de trabajo de una sesión de Claude: solo una a la vez además de `main`; se borra al fusionar |
| Rama experimental | Solo durante una prueba acotada, con criterio de salida y fecha de revisión |

La rama `dev` ya no existe en GitHub (al 5 de octubre solo quedan `main` y una rama vieja de Claude por borrar).

Cerrar una versión exige: tareas aceptadas, evidencia del recorrido de usuario, notas en CHANGELOG y tag conforme a la [convención existente](docs/guias/2026-10-01_versiones-y-tablero.txt). Un tag por sí solo no demuestra que un despliegue esté operativo.

## 7. Entrada de futuras ampliaciones

Antes de promover una propuesta a tarea, responder:

1. ¿Qué problema del estudiante resuelve?
2. ¿Cuál es la demostración mínima que permite aceptarla?
3. ¿Qué parte ya existente reutiliza y qué dependencia añade?
4. ¿Cuántas sesiones se dedicarán a validar su viabilidad?
5. ¿Qué se pausa para hacerle espacio?

Para el motor generativo, empezar con una prueba acotada de una escena simple y un GLB visible. Para el add-on, empezar con un único intercambio verificable. Para el tutor, empezar con una lección y manejo de indisponibilidad. La propuesta completa no se convierte en una única tarea gigante.

Registrar decisiones importantes en un documento de arquitectura fechado: contexto, decisión, alternativa descartada y condición para revisarla. Enlazarlo aquí al cambiar la dirección.

## 8. Biblioteca central

La lista de documentos vive en un solo lugar: el [índice de la documentación](docs/README.md), ordenado en diez secciones (historia, plataforma, motor, manual del código, manual del desarrollador, base de datos, herramientas, despliegue, dirección y registros). Accesos rápidos:

- **Cómo llegamos aquí**: [cronología exacta](docs/historia/01_cronologia.md) · [ideas y cómo se implementaron](docs/historia/02_ideas_y_como_se_implementaron.md) · [la plataforma en cada versión](docs/historia/03_la_plataforma_en_cada_version.md)
- **El código**: [manual del código](docs/manual-del-codigo/README.md) · [esquema SQL](docs/base-de-datos/README.md) · [herramientas de la plataforma](docs/herramientas-de-la-plataforma.md)
- **Trabajar en el repo**: [manual del desarrollador](docs/desarrollador/README.md) · [despliegue en OCI](docs/despliegue/2026-10-04_despliegue_oci.md)
- **Dirección**: [plan maestro v3](docs/reestructuracion/00_plan_maestro.md) · [plataforma](docs/plataforma/README.md) · [Amatista Engine](docs/motor/README.md) · [plan de lanzamiento](docs/planeacion/2026-10-01_plan_lanzamiento.txt)
- **Registros**: [bitácora](docs/bitacora/) · [incidencias](docs/incidencias/README.md)

## 9. Mantenimiento de este centro

Al agregar un frente, registrar aquí su objetivo y documento de referencia. Al crear una tarea, hacerlo en el YAML. Al cambiar su estado, usar el flujo de commits. Al terminar una entrega, actualizar el historial. Revisar los enlaces y la prioridad semanalmente.

Este centro es el módulo documental de gestión del desarrollador. Una pantalla administrativa en la PWA puede ser una ampliación posterior si aporta valor; la organización diaria ya puede operar desde GitHub.
