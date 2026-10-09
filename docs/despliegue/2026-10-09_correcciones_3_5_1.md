# Actualizar a Motor 3.5.1

Esta corrección requiere una columna nueva aunque 3.5.0 no cambiaba el esquema.

1. Partir de 010 aplicado. Antes del backend, ejecutar `backend/sql/011_detalle_instructor.sql` completo como ADMIN en Database Actions (F5). Es incremental e idempotente. No modifica alumnos, contenido ni progreso. Los permisos existentes de AMATISTA_APP cubren la columna.
2. Actualizar código y dependencias; ejecutar las pruebas y `python diagnostico_oracle.py`. Deben coincidir las 20 tablas, con 12 columnas en ADDON_ENLACES.
3. Reiniciar `amatista-backend` y comprobar `/api/salud`, `/api/addon/v1/estado` (3.5.1) y `python herramientas/contenido.py practicas --revisar`.
4. Reinstalar el complemento 3.5.1 y reiniciar Blender. No hay cambios adicionales del frontend en este parche; debe estar actualizado a 3.5 para mostrar el ejemplo y los controles.
5. Comprobar una práctica con silueta: una captura sin silueta no obtiene aprobación y una solución válida sí. Abrir la lección, observar el detalle, cambiar de práctica y cerrar Blender: no debe quedar un detalle anterior.

DETALLE es un CLOB JSON anulable con el último mensaje del instructor, no un historial. Se actualiza cuando cambia el detalle/estado o al renovar el latido cada 15 segundos. La lectura oculta detalles sin latido reciente (25 segundos). Se limpia cuando no hay práctica/detalle y se elimina con la fila de enlace mediante la purga existente. No se agrega Redis ni otro servicio. El coste adicional son escrituras cuando cambia el detalle: medirlo con la carga del aula antes de aumentar capacidad.

Compartir este detalle no hace que todo el backend admita varios procesos: los límites de peticiones y otras cachés aún requieren su propia revisión antes de aumentar workers. Mantener la configuración actual mientras eso se resuelve.

Reversión: volver al código anterior y reiniciar; la columna anulable puede permanecer. No ejecutar DROP ni restaurar progreso. Las aprobaciones históricas no se recalifican automáticamente.

Validación automatizada: silueta ausente en ambos validadores, lectura desde un proceso Python independiente, caducidad, aislamiento entre alumnos, cambio de práctica y diagnóstico/esquema. Backend probado con SQLite temporal; ejecutar el SQL en Oracle y comprobar la interacción gráfica de Blender durante el despliegue.
