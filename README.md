# Amatista · Hack4Edu 2026

**Aprender creación 3D en español, con Blender y A-Frame, aprovechando el equipo disponible y los recursos previamente descargados cuando falta Internet.**

**Entrega en parque cerrado para la presentación del sábado 7 de noviembre.** Incluye el trabajo del 5 de noviembre posterior a las 08:00, por confirmación del responsable. La versión, la hora real de sellado y los límites se registran en el [acta](docs/hack4edu/cierre/ACTA.md) y en el manifiesto del paquete.

**Transparencia sobre IA.** Una parte sustancial del código, incluidas partes esenciales, se desarrolló con asistencia de inteligencia artificial generativa. También se utilizó para diagnóstico, pruebas, documentación y este cierre. Maximiliano Cabello Mata dirige y asume las decisiones del proyecto. [Declaración completa](docs/hack4edu/cierre/USO_DE_IA.md).

## Evaluar en cinco minutos

| Tiempo | Qué revisar | Qué permite comprobar |
|---|---|---|
| 0:00–0:40 | Este resumen y el esquema inferior | Problema educativo y componentes |
| 0:40–2:00 | [Abrir Amatista](https://amatista-3d.tech), elegir Blender y comenzar una lección | Actividades guiadas y progreso en el dispositivo |
| 2:00–3:00 | [Estudio 3D](https://amatista-3d.tech/#/estudio), abrir una plantilla | Edición y visualización de una escena web |
| 3:00–4:00 | [Panel del profesor](https://amatista-3d.tech/#/profesor) y [Mi panel](https://amatista-3d.tech/#/panel) | Aula de demostración `AMA-7K2P`, entregas de ejemplo y reconstrucción de modelos |
| 4:00–5:00 | [Qué hicimos](docs/hack4edu/cierre/BITACORA.md) y [qué está comprobado](docs/hack4edu/cierre/ACTA.md#resultado-comprobado-al-cerrar) | Trabajo previo, aportación del evento, IA y pendientes |

La web pública depende de su despliegue. La referencia congelada es el paquete de entrega y su etiqueta. El aula local contiene datos de demostración y funciona en el navegador que los guarda. La demostración entre dispositivos y la operación de los servicios remotos requieren sus configuraciones correspondientes.

## Cómo encajan las piezas

```text
Estudiante ──► Amatista web ──► lecciones, práctica y progreso local
                    │
                    ├──► Blender + complemento + motor de evaluación
                    ├──► Estudio A-Frame y aula de demostración
                    └──► servidor para cuentas y sincronización

Documentación y mediciones ──► G7B ──► cubo de datos ──► Geoda
                                                        │
                                      recomendaciones según el equipo
```

G7B aporta documentación técnica y mediciones de rendimiento. Geoda prepara perfiles y recomendaciones. La [bitácora](docs/hack4edu/cierre/BITACORA.md) distingue los registros reales de las muestras de demostración y las propuestas.

## Estado de la entrega

- **Código y expediente reunidos.** Plataforma, servidor, motor, complemento, prácticas, tutor local, cuadernos y proyecto G7B se identifican por revisión en el [manifiesto](docs/hack4edu/cierre/MANIFIESTO.json).
- **Comprobaciones disponibles.** En la última CI consultada de Amatista pasan servidor y complemento de Blender. El frontend presenta un error de revisión estática en `Asignacion.jsx`; las pruebas y la compilación siguientes se omitieron.
- **Servicios externos.** Las pruebas de G7B y una ejecución de cuadernos pasan. La construcción reciente del cubo falla por autenticación de Azure con firma vencida. [Resultados y enlaces](docs/hack4edu/cierre/ACTA.md#resultado-comprobado-al-cerrar).
- **Alcance.** La propuesta de Blender en la nube quedó fuera del recorrido principal. La tutoría con modelo local necesita preparación. Las cifras históricas de rendimiento no garantizan el mismo resultado en todos los equipos.

## Dónde está cada cosa

| Carpeta o documento | Contenido |
|---|---|
| [docs/hack4edu/cierre](docs/hack4edu/cierre/ACTA.md) | Acta, trabajo de cada día, IA, pendientes, historial y manifiesto |
| [frontend](frontend/) | Aplicación web, cursos, estudio 3D, aula, Goliat y Geoda |
| [backend](backend/) | Cuentas, API, sincronización y persistencia |
| [engine](engine/) · [addon](addon/) · [practices](practices/) | Motor, complemento de Blender y prácticas |
| [ai_tutor](ai_tutor/) | Servicio de tutoría local |
| [G7B](https://github.com/Maximiliano-cabello-mata/amatista-g7b-etl/tree/667f708ca50e239c2fb4518843c5b708ba9b9e54) | Captura, lago, cubo, Geoda y análisis; incluido en el paquete único |
| [Material de presentación](docs/hack4edu/video/README.md) | Guiones, capturas y fuentes del vídeo |
| [Referencia técnica](REFERENCIA_TECNICA.md) · [Documentación](docs/README.md) | Instalación y antecedentes detallados |

## Reproducir la interfaz desde el código

Con Node.js 22 y npm, dentro de `frontend/`:

```bash
npm ci
npm run dev
```

La primera instalación descarga dependencias. Para comprobar la revisión, `npm run lint`, `npm test` y `npm run build`; el error conocido de revisión estática está registrado en el acta. La instalación completa del servidor y de Blender tiene sus guías en la referencia técnica.

La entrega conserva las licencias de los componentes y recursos de terceros. La revisión congelada no contiene una licencia general de Amatista en la raíz. [Autoría y terceros](docs/legal/04_autoria_y_terceros.md).
