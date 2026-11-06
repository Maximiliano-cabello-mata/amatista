# Bitácora consolidada de Hack4Edu

Periodo documentado de trabajo e integración, del 3 al 5 de noviembre de 2026. Se usan fechas locales de Ciudad de México (UTC−6). La base de Amatista es la etiqueta `hack4edu`, revisión `7c8be0e`. La de G7B es `3aad461`.

## Punto de partida

Amatista comenzó el 27 de septiembre. Antes del corte existían la plataforma educativa, cursos, progreso local, servidor, motor de prácticas, complemento de Blender y Goliat. G7B ya había probado la ruta Zyte → Azure → embudo → MongoDB con 2.353 registros y 987 documentos publicados. Estos antecedentes se preservan en [la memoria del evento](../README.md) y en la documentación del repositorio hermano.

`git log hack4edu..revision` muestra cambios incorporados desde la base. Algunas ramas integradas contienen trabajo fechado antes del evento. Por eso los inventarios tabulados separan esos registros. La fecha del commit es evidencia de Git, no una certificación del momento en que una persona escribió cada línea.

## 3 de noviembre

| Frente | Trabajo incorporado | Evidencia |
|---|---|---|
| Evaluación y presentación | Centro documental, guion, capturas, escenas y fuentes de la película | Amatista `763c6df`, `0d39703`, `01b650b` |
| Telemetría | Captura de sonda y Blender Open Data con controles numéricos y procedencia | G7B `a3dcfc1`, `6e28f81` |
| Cubo | Construcción Parquet y DuckDB versionada; documentación de descarga y comprobación en Azure | G7B `408ef9c`, `728ed2b` |
| Geoda | Detección N0–N4, perfiles, costes y planes reversibles; ejecución del núcleo sobre artefactos del cubo | G7B `20fa3d6`, `946cda1` |
| Puente entre proyectos | Estado agregado de G7B y consumo con caché y alternativa local en Amatista | G7B `218f97c`; Amatista `c74adfd` |
| Análisis | Cuaderno de calidad documental y cuadernos con instrucciones declarativas para Deepnote y Camber; corrección de instalación del cliente Azure | G7B `b7c8a11`, `8769547`, `5897103` |
| Recursos y distribución | Geoda en la aplicación, biblioteca CC0, auditoría de peso, aplicación de escritorio y documentación de la propuesta de nube | Amatista `ff5368c`, `b6229ea` |

Los dos últimos commits aparecen con fecha UTC del 4 de noviembre en algunas vistas de GitHub y corresponden todavía al día 3 en Ciudad de México. El inventario conserva ambas fechas de manera normalizada a UTC−6.

## 4 de noviembre

| Frente | Trabajo | Evidencia |
|---|---|---|
| Navegación | Simplificación de la barra superior y acceso lateral a herramientas | `8c6af8b` |
| Rendimiento | Pausa de animaciones y renderizado fuera de vista, reanudación, atención a WebXR y pruebas de regresión | `a72960a`, [PR 63](https://github.com/Maximiliano-cabello-mata/amatista/pull/63) |
| Cuentas | Enlace directo de confirmación, soporte de correo Brevo y aislamiento de configuración en pruebas | `2fb74cb`, `5e89469` |
| Presupuestos web | Estándares y auditoría automatizada de recursos | `4ebc067` |

En la revisión del PR 63 se comprobaron 402 pruebas locales y una CI correcta, además de pausa/reanudación en Edge Chromium y presentación móvil/escritorio. Es evidencia histórica de esa revisión.

## 5 de noviembre, todo lo incorporado hoy

| Frente | Trabajo y resultado en el código | Revisiones |
|---|---|---|
| Identidad y cuentas | Inicio de sesión con Google en servidor e interfaz, política de contenido y matriz de permisos | `c2ab001`, `c3b5eea`, `50e0c9b`, `fb93ab4` |
| Arquitectura educativa | Núcleo de dispositivo, cliente del tutor local, alternativa con Goliat y orquestación del entorno local | `92dd026`, `d2f1447` |
| Comunicación | Personalización de correo de verificación y herramienta para mensajes de reenganche | `f3b3fa3`, `1a6d976` |
| Presentación y evidencia | Dossier del Reto 02, arquitectura y auditoría del uso de GitHub | `ee64f26`, `fb770f9` |
| Integración continua | Adaptación a colaboradores y pruebas de IA local, revisión del script SQL y correcciones de configuración | `688b430`, `e0317a9` |
| Base de datos | Herramienta idempotente para DDL 014 y correcciones de carga del entorno Oracle | `b1b4343`, `6f0daa1`, `de008d5` |
| Mantenimiento | Separación de componentes grandes de la interfaz, validadores, paneles del complemento, pruebas de Blender y cargador del motor | `4571470`, `15784df`, `5185095`, `2abeed8`, `639f42e`, `e3b0e09` |
| Despliegue | Prioridad del archivo de entorno del servicio en la herramienta de despliegue | `8175e9f` |
| Fluidez y alcance | Ajustes de animación, seguimiento compartido de mascotas, carga diferida, catálogo centrado en Blender/A-Frame y traslado de Amatista Cloud a propuesta | `3e6927d`, `e224dcd` |
| Aula y evaluación | Clase por código, captura del código del modelo, reconstrucción 3D y evaluación en el aula local; correcciones de contratos de datos | `c246ce9`, `28d20c0` |
| G7B | Captura local de contingencia frente a la expiración de la firma de Azure | G7B `667f708` |
| Cierre | Portada para cinco minutos, declaración de IA, estado y pendientes, historiales, versiones fijas y paquete único | Expediente `docs/hack4edu/cierre/` y etiqueta de cierre |

La lista documenta la presencia de cambios en el repositorio. Las pruebas y los servicios comprobados están detallados en el [acta](ACTA.md). El envío efectivo de correos, el uso de Google con cuentas reales y la disponibilidad de cada servicio no se deducen del asunto de un commit.

## Inventarios completos

- [Historial de Amatista](historial-amatista.tsv), con revisión completa, hora local, clasificación y enlace.
- [Historial de G7B](historial-amatista-g7b-etl.tsv), con el mismo formato.
- [Revisiones de cierre y verificaciones](MANIFIESTO.json).
- [Participación sustancial de IA](USO_DE_IA.md).

Los asuntos originales de Git se mantienen en el inventario para no alterar la evidencia. La guía de evaluación y las explicaciones se redactan en español.
