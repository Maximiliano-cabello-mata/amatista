# Módulo 3 de Blender: Modelado con precisión

Estado: borrador para revisión. Continúa el módulo 2 y la mesa. No está publicado en Oracle.
Tiempo estimado: 39 minutos, ajustable tras probarlo con alumnos.

## Resultado y contenido

El alumno construye un podio de tres cubos, introduce dimensiones y posiciones, distingue aplicar de borrar escala y guarda un archivo independiente. Se usan exclusivamente bloques y validadores existentes; no hay migraciones SQL ni cambios al motor.

| Lección | Fórmula | Minutos | Herramientas |
|---|---|---:|---|
| ¿Por qué un cubo se hunde en el suelo? | Gancho | 4 | Imagen propia, pregunta y comparación |
| Dimensiones, ubicación y escala | Explora | 7 | Tarjetas, emparejar, pasos y completar |
| Duplica y conserva el tamaño al aplicar escala | Práctica | 8 | Atajos, comparación, ordenar y pregunta |
| Práctica: construye tu podio | Reto | 15 | Tabla, referencia frontal, pasos y motor |
| Jefe final: precisión 3D | Jefe | 5 | Cinco preguntas; aprobación 80 |

Los 15 minutos de práctica son una excepción explícita al objetivo de lecciones de hasta 10 minutos: es la entrega de cierre. Módulo y práctica deben probarse antes de publicar.

## Archivos

- frontend/src/data/modulos/blender-modulo-3.json: cinco lecciones completas en borrador.
- frontend/public/ilustraciones/podio-modulo-3.svg: diagrama original de referencia, no captura ni prueba de Blender.
- practices/archivo/v2/podio.json: práctica blender.n1.podio.
- engine/tests/test_motor_podio.py: referencia correcta, errores de posición, tamaño, roles, escala, guardado y enlace.

## Revisión desde la plataforma

Después de fusionar y desplegar esta rama, desde backend y con el entorno configurado para la base deseada:

```bash
python herramientas/contenido.py validar ../frontend/src/data/modulos/blender-modulo-3.json
python herramientas/contenido.py importar ../frontend/src/data/modulos/blender-modulo-3.json
python herramientas/contenido.py practicas
```

La última orden registra las prácticas del repositorio como borradores nuevos sin publicar automáticamente. No usar --publicar para esta revisión: afectaría también otras prácticas del repositorio. Después, revisar SOLO blender.n1.podio en Admin → Prácticas y mod_blender_003 en Admin → Contenido. La imagen requiere desplegar también el frontend que incluye el SVG.

Con un usuario profesor/admin vinculado a Blender se puede revisar el borrador. Para probar el recorrido completo como alumno en un entorno de pruebas: publicar la versión revisada del podio desde Admin → Prácticas; publicar las lecciones y el módulo desde Contenido, y comprobar que el curso y nivel están publicados. Conservar los ids si se corrige contenido.

Para practicar autoría manual: crear el módulo desde Admin → Contenido y usar los textos/bloques del JSON como referencia; el JSON completo puede importarse con la CLI. No se presupone que el panel tenga un importador de archivos de módulo.

## Criterios de evaluación

Tres roles únicos (Centro, Izquierda, Derecha), dimensiones y ubicación de cada eje con tolerancia ±0.01, escala aplicada y archivo guardado: 25 controles, peso total 100. Referencia:

| Rol | Dimensiones X/Y/Z | Ubicación X/Y/Z |
|---|---|---|
| Centro | 1 / 1 / 1.5 | 0 / 0 / 0.75 |
| Izquierda | 1 / 1 / 1 | -1.1 / 0 / 0.5 |
| Derecha | 1 / 1 / 0.5 | 1.1 / 0 / 0.25 |

Los tamaños y posiciones implican tres alturas, bases en Z=0 y separaciones de 0.1 PARA cubos rectos con origen central. Usar Modo Objeto, unidades Ninguno/None y objetos sin padres ni modificadores. La evaluación NO acredita topología, estética ni el uso real del comando duplicar. El profesor revisa visualmente esas condiciones.

La variante libre usa otro archivo y evaluación manual: cambiar las dimensiones objetivo no pasa la rúbrica fija. Materiales, números de puesto y render no son requisitos. Cámara y luz pueden permanecer en escena; no tienen roles evaluados.

Se reutilizan las habilidades ya existentes de la mesa. No se añade una habilidad específica para escala aplicada sin registrarla primero en el sistema.

## Validación antes de publicar

- CI: validar los cuatro módulos; ejecutar pruebas del motor y tests del podio.
- Blender con interfaz real: completar desde una escena nueva, revisar que las pistas sirvan, probar una copia con rol incorrecto y comprobar mensajes.
- No declarar una versión verificada en ficha hasta realizar esa prueba.
- Verificar la imagen, el desbloqueo de lecciones, examen y registro del progreso en la PWA.
- Confirmar sincronización, guardado y restauración del progreso.
- Probar offline antes de cambiar ficha.offline a true.

La terminal de la sesión de preparación no estaba disponible. La ejecución automatizada se delega al workflow CI existente; la validación visual y pedagógica queda pendiente.
