# Centro de dirección de Amatista

Punto de entrada para Maximiliano como desarrollador único. Aquí se decide **qué sigue, por qué y dónde está la información**. Las carpetas técnicas y los documentos existentes conservan su ubicación.

[Tablero actual](KANBAN.md) · [Tareas y versiones](tablero/tareas.yml) · [Operar el Kanban](tablero/README.md) · [Historial de entregas](CHANGELOG.md)

## 1. Dirección y límite de trabajo

**Producto principal:** una plataforma educativa para aprender creación 3D y llevarla a la web con Blender, GLB y A-Frame/WebXR, manteniendo el aprendizaje y el progreso local cuando no hay conexión.

**Siguiente resultado propuesto:** completar y comprobar el recorrido de una lección: abrir → estudiar → completar → recargar sin conexión → recuperar conexión → sincronizar y recuperar el progreso. La integración con Oracle debe tener evidencia en el entorno real.

La visión 3D Lab se conserva como ampliación. Tutor IA, add-on y motor generativo entran por incrementos independientes cuando el núcleo tiene una prueba reproducible. Que exista una propuesta no obliga a abrir su desarrollo esta semana.

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

Revisión documental de main del 1 de octubre de 2026, base `36db25e`. Es una fotografía del repositorio, no una certificación de funcionamiento del servidor.

| Frente | Evidencia y ubicación | Decisión de enfoque |
|---|---|---|
| Cursos y lecciones | [Catálogo](frontend/src/data/cursos.js), [módulos](frontend/src/data/modulos/), [formato](docs/arquitectura/2026-09-29_formato-lecciones.txt) | Consolidar el recorrido del módulo 1 antes de multiplicar contenido |
| PWA y progreso | [Configuración PWA](frontend/vite.config.js), [almacén](frontend/src/lib/almacen.js), [progreso](frontend/src/progreso/) | Validar offline, recarga y recuperación de conexión |
| API y Oracle | [Backend](backend/README.md), [SQL](backend/sql/001_esquema_amatista.sql), [diagnóstico](backend/diagnostico_oracle.py) | Prioridad de integración; despliegue real pendiente de comprobar |
| Laboratorio y GLB | [Laboratorio](frontend/src/pages/Laboratorio.jsx), [vista A-Frame](frontend/src/components/leccion/VistaAFrame.jsx) | Hay base 3D; visor GLB ampliado sigue en el backlog |
| Tutor IA | [Prompts](ai_tutor/prompts/), tarea del roadmap | Carpeta reservada; no presentar la integración como terminada |
| Add-on de Blender | [Visión 3D Lab](docs/propuestas/2026-09-27_amatista_3d_lab.txt) | Propuesta futura con contrato de intercambio por definir |
| Motor generativo | [Propuesta del motor](docs/propuestas/2026-09-27_motor_generativo_3d.txt) | Investigación separada; requiere límites de ejecución y prueba de viabilidad |

## 4. Orden de ejecución propuesto

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

El script actual admite campos adicionales pero **no los muestra ni valida dependencias o bloqueos**. Se consultan en el YAML. Son información manual, no estados nuevos del Kanban.

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

Si falta acceso, información o una dependencia, anotar causa, siguiente acción y condición de desbloqueo en la tarea. El Kanban actual no tiene columna Bloqueado: el campo manual evita ocultarlo. Puede mantenerse una tarea bloqueada y trabajar en una alternativa; nunca dos implementaciones simultáneas.

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
| `dev` | Rama existente; conservarla y decidir su uso explícitamente, sin exigir pasar por ella para cada cambio |
| Rama experimental | Solo durante una prueba acotada, con criterio de salida y fecha de revisión |

En la consulta inicial, dev estaba ocho commits detrás de main y no tenía commits exclusivos. Es un dato histórico, no un estado permanente. No se elimina ni se sincroniza automáticamente.

Cerrar una versión exige: tareas aceptadas, evidencia del recorrido de usuario, notas en CHANGELOG y tag conforme a la [convención existente](docs/2026-10-01_versiones-y-tablero.txt). Un tag por sí solo no demuestra que un despliegue esté operativo.

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

### Arquitectura y operación

- [Arquitectura general](docs/arquitectura/2026-09-27_arquitectura_general.txt)
- [Backend y base de datos](docs/arquitectura/2026-09-27_backend_y_base_de_datos.txt)
- [Recomendaciones de arquitectura](docs/arquitectura/2026-09-27_recomendaciones_arquitectura.txt)
- [Mapa conceptual](docs/arquitectura/2026-09-27_mindmap.png)
- [Identidad visual](docs/arquitectura/2026-09-28_identidad_visual_interfaz.txt)
- [Formato de lecciones](docs/arquitectura/2026-09-29_formato-lecciones.txt)
- [Convención de commits](docs/2026-09-27_convencion_commits.txt)
- [Versiones y tablero](docs/2026-10-01_versiones-y-tablero.txt)

### Evidencia e historial

- [Investigación y desarrollo](docs/bitacora/2026-09-27_investigacion_desarrollo.txt)
- [Reporte App Shell](docs/bitacora/2026-09-27_reporte_app_shell.txt)
- [Resumen inicial](docs/bitacora/2026-09-27_resumen.txt)
- [Lecciones y progreso](docs/bitacora/2026-09-29_lecciones-y-progreso.txt)
- [ORA-01400](docs/incidencias/2026-09-27_ora-01400-autoincremento.txt)
- [Puerto ocupado y CORS](docs/incidencias/2026-09-27_puerto-ocupado-y-cors.txt)
- [Diagnóstico Oracle/progreso](docs/incidencias/2026-09-29_diagnostico-oracle-progreso.txt)
- [Integración FastAPI/Oracle](docs/incidencias/2026-09-29_reporte-integracion-fastapi-oracle.txt)

### Expansión

- [Amatista 3D Lab](docs/propuestas/2026-09-27_amatista_3d_lab.txt)
- [Motor generativo 3D](docs/propuestas/2026-09-27_motor_generativo_3d.txt)

## 9. Mantenimiento de este centro

Al agregar un frente, registrar aquí su objetivo y documento de referencia. Al crear una tarea, hacerlo en el YAML. Al cambiar su estado, usar el flujo de commits. Al terminar una entrega, actualizar el historial. Revisar los enlaces y la prioridad semanalmente.

Este centro es el módulo documental de gestión del desarrollador. Una pantalla administrativa en la PWA puede ser una ampliación posterior si aporta valor; la organización diaria ya puede operar desde GitHub.

