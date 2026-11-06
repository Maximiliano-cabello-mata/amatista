# Acta de cierre · Parque cerrado de Hack4Edu

**Responsable:** Maximiliano Cabello Mata. **Presentación prevista:** sábado 7 de noviembre de 2026. **Zona horaria:** Ciudad de México, UTC−6.

## Decisión de cierre

El responsable solicitó inicialmente un cierre a las 08:00 del 5 de noviembre. Al comprobar que esa hora ya había pasado y que existía trabajo posterior, confirmó expresamente congelar **la versión actual, incluyendo todo lo realizado hoy, y registrar la hora real**. La entrega no se fecha retroactivamente a las 08:00.

La selección de código queda fijada por estas revisiones completas. La hora real en que se termina de generar y comprobar el paquete se consigna en su `MANIFIESTO_ENTREGA.json` exterior y en el mensaje de la etiqueta de cierre.

La preparación documental y el sellado se completan el **6 de noviembre de 2026**. El nombre de la etiqueta conserva el día 5 como fecha del trabajo de código seleccionado. Ningún registro afirma que la copia se selló a las 08:00 del día 5.

| Repositorio | Revisión congelada de código |
|---|---|
| Amatista | `4986448ad17baeecb711e755a0a25f510e0995f2` |
| G7B | `667f708ca50e239c2fb4518843c5b708ba9b9e54` |

La etiqueta documental `hack4edu-cierre-2026-11-05` añade a la versión de Amatista la portada y este expediente. La comparación con la revisión de código solo debe mostrar documentación. Los dos historiales tabulados preservan los identificadores completos de los cambios incorporados desde las etiquetas iniciales `hack4edu`.

## Regla de parque cerrado

Desde este cierre y hasta la presentación del sábado 7 de noviembre, la copia de entrega conserva el código, sus dependencias declaradas y sus configuraciones. Se permite leer, ejecutar demostraciones y guardar resultados fuera de la copia. Una corrección posterior requiere levantar explícitamente el cierre, crear una versión distinta y registrar su diferencia. La etiqueta de cierre y el archivo entregado se conservan sin sustituirlos.

El archivo ZIP y su huella SHA-256 son la referencia de evaluación. `main`, los servicios en la nube y el tablero automatizado pueden cambiar de forma independiente. El paquete no depende de que esas referencias permanezcan inmóviles. Este cierre establece una regla de trabajo y una copia identificable; no equivale a una protección de rama impuesta por GitHub ni a archivar administrativamente el repositorio.

## Qué contiene la entrega única

1. `00_EMPEZAR_AQUI.md`, guía breve para el jurado.
2. `amatista/`, código y documentación versionados de la plataforma, motor y complemento.
3. `amatista-g7b-etl/`, código y documentación versionados de datos, telemetría, cubo, Geoda y cuadernos.
4. `MANIFIESTO_ENTREGA.json`, revisiones, fecha real de empaquetado, inventario y huellas SHA-256 de cada archivo.
5. La huella SHA-256 del ZIP se entrega junto al archivo.

Se empaquetan archivos versionados. Las dependencias instaladas, credenciales locales, bases privadas, archivos `.git`, recursos descargados fuera de Git y vídeos generados no forman parte de ese conjunto. Los guiones, capturas y fuentes del vídeo sí se conservan. Las instrucciones de instalación permanecen en cada proyecto.

## Resultado comprobado al cerrar

| Área | Evidencia consultada | Resultado |
|---|---|---|
| Servidor, contenido, IA local, presupuestos web, tablero y motor de Amatista | [CI 42148364560](https://github.com/Maximiliano-cabello-mata/amatista/actions/runs/42148364560) | Trabajo del servidor aprobado |
| Complemento de Blender | Misma CI | Aprobado con Blender en la automatización |
| Interfaz de Amatista | Misma CI, trabajo `frontend` | Un error de revisión estática en `frontend/src/pages/profesor/Asignacion.jsx`, línea 78, regla `react-hooks/set-state-in-effect`. Las pruebas y la compilación posteriores se omitieron |
| Pruebas de G7B | [42096885575](https://github.com/Maximiliano-cabello-mata/amatista-g7b-etl/actions/runs/42096885575) | Aprobadas |
| Telemetría de G7B | [42096885581](https://github.com/Maximiliano-cabello-mata/amatista-g7b-etl/actions/runs/42096885581) | Ejecución aprobada; el código incluye captura local de contingencia, por lo que ese estado no demuestra por sí solo publicación en Azure |
| Cubo de G7B | [42097116915](https://github.com/Maximiliano-cabello-mata/amatista-g7b-etl/actions/runs/42097116915) | Falló al enumerar telemetría en Azure por `AuthenticationFailed`; el registro indica firma SAS vencida |
| Cuadernos | [42101605123](https://github.com/Maximiliano-cabello-mata/amatista-g7b-etl/actions/runs/42101605123) | Ejecución aprobada |

La CI anterior del PR 63 estaba aprobada para aquella revisión. El código del 5 de noviembre contiene cambios adicionales y tiene el resultado indicado arriba. Las cifras históricas de pruebas, tamaños y rendimiento pertenecen a sus respectivas revisiones.

## Límites de la demostración

- El aula local incluye clase, alumnos y entregas de ejemplo en `frontend/src/profesor/aulaLocal.js`. Sus registros demuestran el flujo de interacción, no una implantación con esos alumnos reales ni una transferencia entre dos equipos desconectados.
- Los lotes documentales y de rendimiento de G7B tienen procedencia y evidencia propia. Los 2.353 registros extraídos, 987 documentos publicados y 3.003 mediciones del cubo son cifras históricas de las pruebas documentadas, no contadores actuales consultados en la nube durante este cierre.
- La operación sin conexión cubre recursos previamente disponibles. El acceso a Google, correos, sincronización remota y descargas nuevas requiere los servicios correspondientes.
- La tutoría local requiere preparación del entorno. La propuesta Amatista Cloud quedó retirada del recorrido principal y condicionada por configuración del servidor.
- El paquete no contiene una copia de las bases remotas ni asegura disponibilidad continua de Azure, MongoDB, Deepnote o Camber. Las ejecuciones omitidas de Geoda posteriores al fallo del cubo no certifican análisis nuevo.
- La plataforma enseña con Blender y A-Frame, que tienen sus propias licencias. El repositorio de Amatista carece de un `LICENSE` general en la revisión congelada; se conserva la declaración GPL del complemento y las licencias de terceros sin inventar una licencia global.

Los planes y auditorías anteriores se conservan como antecedentes. Para estado, alcance y límites de esta entrega prevalecen este acta y su manifiesto.
