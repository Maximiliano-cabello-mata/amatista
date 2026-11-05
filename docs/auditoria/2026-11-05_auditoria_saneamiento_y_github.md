# Auditoría minuciosa de Amatista: saneamiento, tecnologías y GitHub

**Fecha:** 2026-11-05  
**Alcance:** árbol actual de `main`, 967 archivos versionados, frontend, backend, motor,
add-on, prácticas, despliegue, tablero, documentación y automatizaciones de GitHub.  
**Método:** inventario de archivos y manifiestos, lectura de los puntos de entrada,
seguimiento de imports y llamadas, revisión de workflows y contraste entre la
documentación operativa y el código. Esta auditoría es documental: no certifica el
estado de la VM, Oracle, Cloudflare ni Blender con ventana.

## 1. Resultado ejecutivo

Amatista ya tiene una separación funcional razonable:

```text
frontend/  PWA y experiencia de aprendizaje
backend/   API, autenticación, contenido, progreso y administración
engine/    lógica de prácticas independiente de Blender
addon/     integración de Blender, empaquetado e instaladores
practices/ contenido declarativo y escenas de referencia
tablero/   planificación y generación de KANBAN.md
despliegue/ operación de la API
docs/      conocimiento del producto y registros históricos
```

El principal riesgo no es la falta de tecnología, sino la acumulación de capas,
versiones y documentos que no siempre distinguen **vigente**, **experimental**,
**histórico** y **reservado**. El saneamiento debe reducir ambigüedad antes de
añadir otra plataforma, otro motor o un servicio nuevo.

### Prioridades

| Prioridad | Hallazgo | Acción recomendada |
|---|---|---|
| P0 | `tablero.yml` tiene `contents: write` y hace push directo a `main` | Separar generación de publicación, limitar el permiso al job y proteger `main` |
| P0 | No hay workflow de CodeQL, Dependabot ni revisión de dependencias en PR | Añadir controles pequeños y obligatorios antes de ampliar funcionalidades |
| P1 | Oracle y SQLite son dos comportamientos de producción/desarrollo | Mantener SQLite para pruebas, pero añadir contrato de compatibilidad y una prueba Oracle programada |
| P1 | El Kanban y la documentación contienen planes vencidos o estados contradictorios | Marcar `vigente`, `histórico`, `bloqueado` y `reservado`; retirar duplicados de estado |
| P1 | El workflow de instaladores mezcla compilación, firma y publicación con permisos de escritura globales | Separar `build`, `sign` y `release`, usando un environment de producción |
| P2 | `ai_tutor/` está reservado y no aporta comportamiento | Mantenerlo fuera del producto hasta tener un prototipo verificable |
| P2 | No hay una estrategia de paquetes compartidos ni contratos formales entre PWA, API y add-on | Documentar contratos y generar validaciones desde una única fuente |

## 2. Inventario de tecnologías y valor real

### 2.1 Tecnologías que sí aportan

| Tecnología | Evidencia | Veredicto |
|---|---|---|
| React 19 + Vite 8 | `frontend/package.json`; páginas, componentes y `vite.config.js` | Mantener: es el núcleo de la PWA |
| Tailwind CSS 4 + PostCSS | `frontend/src/index.css`, `tailwind.config.js`, `postcss.config.js` | Mantener mientras el sistema visual siga usando utilidades; revisar configuración no usada |
| A-Frame 1.8 | `frontend/src/pages/Laboratorio.jsx`, `motor3d/` y `EscenaAFrame.jsx` | Mantener: forma parte del objetivo 3D/web |
| IndexedDB + `vite-plugin-pwa` | `frontend/src/lib/almacen.js`, `frontend/vite.config.js` | Mantener: es una capacidad de producto, no solo una librería |
| FastAPI + Uvicorn | `backend/main.py` y `backend/api/` | Mantener: API clara para PWA y add-on |
| SQLAlchemy + `oracledb` | `backend/database/` y dependencias | Mantener, pero encapsular la diferencia Oracle/SQLite |
| pytest + Vitest + ESLint | `.github/workflows/ci.yml` | Mantener: cubren los cuatro núcleos ejecutables |
| Blender `bpy` | `addon/tests/en_blender.py` y workflow `addon-blender` | Mantener: prueba de integración relevante |
| Cloudflare Workers + Oracle Cloud/Caddy | `wrangler.jsonc`, `despliegue/` y documentación de despliegue | Mantener por ahora: ya corresponde al despliegue publicado |
| Sentry | `frontend/src/lib/sentrySdk.js`, backend y pruebas de diagnóstico | Mantener como observabilidad opcional; definir retención y datos permitidos |

### 2.2 Tecnologías o capacidades que no aportan valor operativo todavía

Estas no deben eliminarse automáticamente; deben tener un criterio de salida.

| Elemento | Evidencia | Decisión de saneamiento |
|---|---|---|
| `ai_tutor/` | Solo contiene `prompts/.gitkeep`; la integración se describe como reservada | No añadir SDK ni servicio. Convertirlo en propuesta con un prototipo de una lección, presupuesto, fallback y prueba de indisponibilidad |
| `frontend` scripts `ilustraciones` y `modelos` | Existen como comandos, pero no forman parte de CI ni del flujo de publicación | Documentar su uso o moverlos a `herramientas/`; no presentarlos como capacidad de producto |
| Instaladores multiplataforma | `.deb` y `.exe` se construyen; macOS tiene scripts manuales, no una ruta equivalente automatizada | Mantener solo si hay usuarios objetivo. Si no, declarar Windows/Linux como soportados y macOS experimental |
| `practices/` y `addon/` | El contenido de prácticas vive separado del motor y del add-on | Mantener, pero definir un contrato de versión y una sola herramienta de validación |
| Sentry | Añade coste y dependencia operativa | Mantener únicamente detrás de configuración explícita; desactivar sin DSN y probar que no bloquea la app |
| Oracle + SQLite | Dos motores son necesarios hoy por producción/pruebas | No migrar por moda. Reducir la superficie incompatible y añadir pruebas de contrato |

### 2.3 Tecnologías que no conviene añadir ahora

No se justifica introducir Docker/Kubernetes, Redis, una cola de trabajos, GraphQL,
microservicios, una segunda base de datos de producción, un gestor de estado
frontend adicional ni un proveedor de IA antes de resolver los P0/P1. Cada una
añadiría operación, secretos, pruebas y documentación sin resolver el cuello de
botella actual: entrega confiable y límites claros.

## 3. Núcleos de cada workflow

### 3.1 Workflow de CI

**Archivo:** `.github/workflows/ci.yml`

| Núcleo | Qué valida | Fuente |
|---|---|---|
| Backend | pytest, validación de contenido y pruebas del tablero | `backend/`, `tablero/` |
| Motor | pruebas de `engine/tests` y `addon/tests` | `engine/`, `addon/` |
| Blender | carga real de `bpy` sin ventana | job `addon-blender` |
| Frontend | lint, Vitest y build | `frontend/package.json` |

**Saneamiento:**

1. Convertir cada job en un check requerido de `main`.
2. Añadir `timeout-minutes` a todos los jobs.
3. Fijar acciones por SHA cuando el nivel de riesgo lo justifique.
4. Usar `pip install --require-hashes` o un mecanismo equivalente cuando las
   dependencias estén estabilizadas.
5. Añadir una prueba explícita de que el build no publica mapas de fuente ni
   variables sensibles.
6. Separar el test de Oracle como job manual/programado con `environment: staging`;
   nunca usar credenciales de producción en PR.

### 3.2 Workflow del tablero

**Archivo:** `.github/workflows/tablero.yml`

El workflow recalcula `KANBAN.md` desde `main` y hace push directo. Es útil porque
evita conflictos del archivo generado, pero contradice la regla documental de que
los cambios llegan por PR y tiene `contents: write` para todo el workflow.

**Diseño recomendado:**

```text
push/PR -> generar KANBAN.md -> comprobar diff
                         ├─ PR: publicar artifact o comentario
                         └─ main: workflow reutilizable de publicación
```

Opciones, en orden preferido:

1. Generar el tablero durante CI y fallar si `KANBAN.md` no está actualizado.
2. Si se conserva el commit automático, limitar el permiso de escritura al job,
   evitar ejecuciones recursivas y documentar la excepción a la protección de
   `main`.
3. A medio plazo, eliminar el archivo generado del control de cambios y publicar
   el tablero como GitHub Project o artefacto.

### 3.3 Workflow de instaladores

**Archivo:** `.github/workflows/instaladores.yml`

Tiene tres responsabilidades distintas:

```text
comun -> construir y probar .deb -> artifact
windows -> construir y firmar .exe -> artifact
publicar -> juntar artefactos -> GitHub Release
```

**Saneamiento:**

- `build` debe ser de solo lectura y ejecutarse en PR/push.
- `sign` debe ejecutarse solo en tag o `workflow_dispatch`, con environment
  protegido y aprobación si el proyecto lo requiere.
- `release` debe tener `contents: write` únicamente en ese job.
- Verificar firmas y hashes como pasos de CI, no solo imprimir el estado.
- No firmar ni publicar desde una rama arbitraria.
- Añadir SBOM y provenance/attestation para los artefactos cuando el plan de
  distribución lo justifique.

## 4. Duplicidades y fronteras que deben quedar claras

### 4.1 Auditoría de contenido

Ya existen dos superficies relacionadas:

- `frontend/src/components/admin/auditoria.js`: auditoría del catálogo que viaja
  a la PWA y revisión manual local.
- `backend/herramientas/auditoria_seguridad.py`: auditoría automatizada de
  entradas de seguridad.

No son la misma auditoría y no deben fusionarse en una clase genérica. Sí deben
compartir un formato de informe:

```text
id, severidad, dominio, evidencia, ruta, criterio, estado, responsable,
fecha_de_detección, fecha_de_revisión
```

La auditoría de contenido debería poder ejecutarse también en CI y producir JSON
para que la interfaz administrativa solo lo presente. La revisión manual en
`localStorage` es útil para una sesión, pero no es evidencia del repositorio:
exportar el informe a un artifact o adjuntarlo al PR.

### 4.2 Validación de contenido y tablero

`backend/herramientas/contenido.py` y `tablero/actualizar.py` son CLIs diferentes
con responsabilidades válidas. El problema no es duplicarlos, sino que cada uno
tiene su propio contrato de salida. Estandarizar:

- código de salida distinto de cero ante errores;
- salida humana para desarrolladores;
- salida JSON opcional para CI;
- versión del esquema validado;
- ruta de origen y commit que se revisó.

### 4.3 Motor, add-on y prácticas

La separación es correcta:

```text
engine/       reglas puras y validadores
practices/    datos declarativos y referencias
addon/        UI, bpy, enlace y distribución
```

No mover código entre carpetas para “unificar”. En cambio, imponer un contrato:

- versión de formato de práctica;
- lista de validadores disponibles;
- versión mínima de Blender;
- hash o identificador de la práctica;
- compatibilidad de la API de enlace;
- una orden para validar todas las prácticas sin abrir Blender.

### 4.4 Despliegue y documentación

`despliegue/actualizar.sh`, `amatista-api.service`, Caddy y los documentos de
despliegue forman un flujo operativo real. El problema es que `README.md`,
`PROYECTO.md`, `KANBAN.md` y las bitácoras pueden describir fechas distintas.

Regla propuesta:

- `README.md`: estado actual y cómo empezar;
- `PROYECTO.md`: decisiones y prioridades vigentes;
- `tablero/tareas.yml`: única fuente de tareas;
- `KANBAN.md`: solo generado;
- `docs/bitacora/`: historia inmutable;
- `docs/incidencias/`: problemas y resolución;
- `docs/auditoria/`: informes fechados, nunca fuente de estado diario.

## 5. Detalles que no aportan o generan confusión

1. **Estados repetidos:** una misma realidad puede aparecer en `tareas.yml`,
   `KANBAN.md`, `PROYECTO.md`, `README.md` y una bitácora. Solo el YAML debe
   determinar el estado de una tarea.
2. **Planes históricos junto a planes activos:** conservarlos, pero añadir una
   cabecera `Estado: histórico` y un enlace al documento vigente.
3. **Versiones de motor en documentos:** el código actual, el manifiesto de Blender,
   la documentación y el despliegue deben derivar de una fuente de versión o
   fallar en CI si difieren.
4. **Comandos manuales no catalogados:** cada script público debe tener `--help`,
   dependencias, ejemplo y criterio de éxito. Si no, debe ser interno.
5. **Contenido reservado:** carpetas vacías como `ai_tutor/` deben indicar
   explícitamente que no hay integración, para no inflar el alcance aparente.
6. **Pruebas con SQLite solamente:** pasan rápido, pero no detectan todas las
   diferencias de Oracle. El README debe decir “pruebas locales” y no insinuar
   certificación de producción.
7. **Permisos globales de workflows:** `contents: write` no debe estar al nivel
   del workflow si solo un job publica.
8. **Publicación mezclada con compilación:** construir artefactos y publicarlos
   son operaciones de riesgo diferente y deben tener gates distintos.

## 6. Cómo sacar más provecho de GitHub

### 6.1 Controles inmediatos

1. Activar protección o ruleset de `main`: PR obligatorio, CI obligatoria,
   conversación resuelta y prohibición de push directo salvo la excepción
   automatizada del tablero.
2. Añadir `.github/dependabot.yml` para npm, pip y GitHub Actions, agrupando
   actualizaciones menores y separando las mayores.
3. Añadir CodeQL para JavaScript y Python; ejecutar en PR y semanalmente.
4. Activar dependency review en PR para detectar cambios vulnerables.
5. Activar secret scanning y push protection si están disponibles para la cuenta.
6. Añadir `CODEOWNERS` por dominio: frontend, backend, motor/add-on y despliegue.
7. Añadir plantillas de issue y PR con problema, resultado, prueba, riesgo y
   rollback.

### 6.2 Entrega y operaciones

1. Usar GitHub Environments `staging` y `production` con secretos separados.
2. Publicar releases desde tags protegidos, nunca desde cualquier push.
3. Subir SBOM, checksums, firmas y provenance junto con cada release.
4. Guardar reportes de pytest, Vitest, cobertura y auditoría como artifacts.
5. Usar `workflow_call` para compartir instalación de Python/Node y evitar
   que CI y los instaladores diverjan.
6. Programar una ejecución semanal de pruebas de enlaces, dependencias y
   compatibilidad de Blender.

### 6.3 Gestión de producto

1. Mantener GitHub Projects como vista de alto nivel y `tareas.yml` como fuente
   declarativa mientras el generador siga siendo útil; no mantener dos estados
   manuales.
2. Usar Discussions para decisiones abiertas y preguntas de comunidad; issues
   para trabajo accionable.
3. Relacionar PR, issue, release y tarea con IDs consistentes (`T-XXX`).
4. Usar milestones para una entrega y no para cada idea.
5. Publicar una página de arquitectura con ADRs y enlazarla desde PRs que cambien
   contratos.

Referencias oficiales:

- [GitHub: seguridad y calidad](https://docs.github.com/en/code-security)
- [GitHub: CodeQL](https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql)
- [GitHub: Dependabot](https://docs.github.com/en/code-security/dependabot)
- [GitHub: environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [GitHub: reutilizar workflows](https://docs.github.com/en/actions/sharing-automations/reusing-workflows)
- [GitHub: artifact attestations](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations-to-establish-provenance-for-builds)

## 7. Arquitectura saneada propuesta

### Núcleo A: aprendizaje web

Responsable de catálogo, lecciones, progreso local, sincronización y experiencia
offline. No debe conocer detalles de `bpy`, Oracle ni firma de instaladores.

### Núcleo B: API y persistencia

Responsable de identidad, autorización, contenido, progreso, eventos y enlace.
Debe exponer contratos versionados y un adaptador de persistencia con pruebas
para SQLite y Oracle.

### Núcleo C: motor educativo

Responsable de prácticas declarativas, validadores, estados y resultados. Debe ser
Python puro y no importar FastAPI ni módulos de Blender.

### Núcleo D: adaptador Blender

Responsable de UI, `bpy`, órdenes, enlace y distribución. Debe consumir el motor y
un contrato de prácticas versionado.

### Núcleo E: entrega y operación

Responsable de CI, releases, instaladores, despliegue, observabilidad y rollback.
No debe contener lógica educativa.

### Contratos mínimos

| Contrato | Validación |
|---|---|
| Práctica declarativa | schema + fixtures + versión |
| API PWA | OpenAPI generado y prueba de compatibilidad |
| API add-on | fixtures de enlace, órdenes y ajustes |
| Persistencia | pruebas de repositorio para SQLite y Oracle |
| Instalador | smoke test, hash y firma |
| Documentación de estado | enlaces y comprobación de comandos |

## 8. Plan por fases

### Fase 0 — proteger la base (1 sesión)

- Abrir esta auditoría como referencia.
- Proteger `main` y exigir CI.
- Reducir permisos de `tablero.yml` e `instaladores.yml`.
- Marcar documentos y carpetas reservadas.

**Salida:** ningún PR puede saltarse CI y ningún job de test tiene escritura
innecesaria.

### Fase 1 — hacer observable la calidad (1–2 sesiones)

- Añadir Dependabot, CodeQL y dependency review.
- Guardar reportes de tests y auditorías.
- Añadir `CODEOWNERS` y plantillas.
- Establecer `staging` para pruebas de integración.

**Salida:** cada PR tiene señales automáticas de calidad, seguridad y dependencia.

### Fase 2 — reducir divergencia (2–3 sesiones)

- Definir contratos de prácticas y enlace.
- Añadir prueba de contrato Oracle programada.
- Hacer que auditoría de contenido y validadores emitan JSON.
- Centralizar versiones de frontend, add-on, motor y formato.

**Salida:** una modificación incompatible falla antes de llegar al despliegue.

### Fase 3 — entrega reproducible (2–3 sesiones)

- Separar build, firma y release.
- Añadir SBOM, hashes, attestation y rollback documentado.
- Convertir el despliegue en un environment protegido.
- Probar rutas profundas, service worker y recuperación offline en staging.

**Salida:** un tag produce artefactos verificables y una publicación reversible.

### Fase 4 — decidir qué ampliar (después de métricas)

- Evaluar el tutor IA solo con una prueba de una lección.
- Evaluar nuevas tecnologías solo contra una métrica: tiempo de entrega,
  estabilidad, experiencia del alumno o coste operativo.
- Retirar o archivar lo que no alcance su criterio de salida.

**Salida:** cada tecnología nueva tiene problema, métrica, dueño, coste y fecha
de revisión.

## 9. Backlog propuesto

| ID sugerido | Trabajo | Dependencia | Aceptación |
|---|---|---|---|
| AUD-01 | Reducir permisos de workflows | ninguna | Solo jobs de publicación tienen escritura |
| AUD-02 | Ruleset de `main` y checks requeridos | AUD-01 | Push directo bloqueado |
| AUD-03 | Dependabot + CodeQL + dependency review | ninguna | PR de prueba produce checks |
| AUD-04 | Plantillas, CODEOWNERS y environments | AUD-02 | PR y release tienen responsables y gates |
| AUD-05 | Contrato de prácticas y enlace | ninguna | Fixtures validados por engine y add-on |
| AUD-06 | Auditoría de contenido en CI con JSON | AUD-05 | CI conserva un informe descargable |
| AUD-07 | Prueba de contrato Oracle programada | AUD-04 | Diferencias Oracle/SQLite visibles sin producción |
| AUD-08 | Fuente única de versiones | AUD-05 | Manifiesto, docs y release no divergen |
| AUD-09 | Separar build/firma/release | AUD-04 | Ramas no pueden publicar ni firmar |
| AUD-10 | Revisión de documentos históricos | ninguna | Cada documento indica su estado |

## 10. Criterio de éxito del saneamiento

El repositorio estará saneado cuando:

- una persona nueva pueda saber qué está vigente sin leer bitácoras históricas;
- cada workflow tenga el mínimo permiso posible;
- un PR reciba CI, seguridad y dependencia antes de fusionarse;
- el contrato PWA/API/add-on/prácticas sea comprobable;
- un release sea reproducible, firmado y reversible;
- las tecnologías reservadas no se presenten como producto terminado;
- las métricas de avance sean tareas aceptadas y recorridos comprobados, no número
  de commits o cantidad de herramientas.

Esta auditoría no recomienda reescribir el producto ni migrar de tecnología por
moda. Recomienda reducir ambigüedad, aislar contratos y convertir las capacidades
existentes en señales verificables de GitHub.
