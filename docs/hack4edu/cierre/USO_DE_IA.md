# Declaración de uso de inteligencia artificial

Amatista y su ecosistema se han desarrollado con una participación sustancial de inteligencia artificial generativa. Una buena parte del código, incluidas partes esenciales, se ha redactado y trabajado con asistencia de IA. Esta declaración se publica por indicación expresa del responsable del proyecto.

## En qué intervino

- Diseño y discusión de la arquitectura, contratos e integraciones.
- Redacción e implementación de componentes de la interfaz, lógica, servicios y automatizaciones.
- Desarrollo y revisión de partes del motor, del procesamiento de datos y de los cuadernos de análisis.
- Diagnóstico de errores, refactorización, optimización, pruebas y revisión de resultados.
- Documentación técnica, bitácoras, organización del repositorio y preparación de este cierre.

La asistencia incluyó generación de código que forma parte de la solución. Por ejemplo, la pausa de animaciones y visores se implementó con ChatGPT/Codex y quedó registrada en el [PR 63](https://github.com/Maximiliano-cabello-mata/amatista/pull/63). El historial conserva además referencias a otras sesiones y ramas de asistentes. El nombre de una rama o de un autor de Git, por sí solo, no permite calcular qué porcentaje escribió cada herramienta.

## Responsabilidad humana y comprobación

Maximiliano Cabello Mata dirige el proyecto y decide sus objetivos, alcance, integración y presentación. Las propuestas de los asistentes se incorporan mediante cambios versionados y se contrastan con las pruebas y resultados disponibles. La declaración de responsabilidad humana no presupone que se haya auditado manualmente cada línea.

No se dispone de una medición fiable de porcentaje por líneas generado por IA. Se reconoce de forma explícita su aportación sustancial, incluidos componentes esenciales, sin inventar una cifra ni presentar todo el código como escrito manualmente.

La compilación, las pruebas automáticas y la inspección ayudan a detectar fallos. Los pendientes de la versión entregada figuran en el [acta de cierre](ACTA.md). También se declaran los materiales y dependencias de terceros mediante sus archivos y el [expediente de autoría](../../legal/04_autoria_y_terceros.md).

## IA utilizada al desarrollar e IA dentro del producto

La asistencia de IA para construir el proyecto es independiente de las funciones que se ofrecen al estudiante. Goliat dispone de respuestas basadas en reglas locales. El repositorio incorpora un servicio de tutoría local y un cliente que recurre a Goliat cuando ese servicio falla. Ejecutar un modelo local requiere instalar y configurar ese entorno. Esta entrega no certifica que cada equipo o el sitio público tenga un modelo generativo activo.

Este documento y la portada permiten que el jurado evalúe el trabajo con conocimiento de cómo se produjo. La selección del problema, la integración, la verificación y las limitaciones forman parte de la entrega.
