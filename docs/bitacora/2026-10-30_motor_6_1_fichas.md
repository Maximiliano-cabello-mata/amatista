# Bitácora · Amatista Motor 6.1: Blender como extensión de la plataforma (30 oct 2026)

**Pedido (Maximiliano, 06:19 UTC, después de fusionar el 6.0):** pulir detalles del motor.

- El paso entre lecciones tiene que mostrar que la plataforma y Blender son una sola cosa («una no puede vivir sin la otra»), usando nuestro Blender Amatista.
- La teoría es genérica: hay que reforzarla con las herramientas gráficas, para que enseñe y no solo muestre texto.
- El motor debe ser muy intuitivo y fácil de navegar.
- La ayuda debe acompañar mucho al principio: explicar conceptos y la ruta correcta, con algo mejor que «tarjetitas». Que muestre y resalte las herramientas, que explique para qué sirve cada parte al tocarla, y que toda herramienta nueva de una práctica se explique como a un novato sin regalar la respuesta.

**Decisiones por defecto (reversibles):**

- Las fichas viven en un solo JSON compartido.
- Se presentan como mucho 2 herramientas por actividad.
- La ficha se recuerda hasta haberla visto 3 veces.
- El modo curioso es automático mientras el alumno tiene menos de 10 habilidades que «ya le salen», y explica cada herramienta como mucho 2 veces.
- La lección pasa sola a la siguiente con 6 s para frenarla.
- Blender abierto en otra cosa se lleva solo al taller de la lección, una vez por visita.
- En la teoría, encontrar la herramienta en el esquema es lo normal (`check` por defecto).
- Sin SQL.

## Qué se hizo (rama `claude/project-thread-nmryzr`)

1. **Motor** (T-142): `practices/blender/fichas.json` (9 zonas, 26 fichas) y `taller/fichas.py` (andamio, modo curioso).
2. **Add-on 6.1** (T-142, T-143):
   - `fichas.py`, la ficha en la vista 3D y el estado `PRESENTANDO`.
   - El brillo por zona en cada editor y el panel «¿Qué es esto?».
   - `plataforma.py`, que guarda la lección de la plataforma.
   - Al cumplir la etapa no se abre otra pestaña si la plataforma está abierta.
   - «Mi lección» lleva a la lección actual.
3. **Servidor**: la orden `leccion` (una pendiente se reemplaza por la nueva), la ficha en el latido y los bloques `herramienta_blender` y `blender_mapa` en el validador y las plantillas.
4. **Plataforma** (T-144):
   - Los bloques con el esquema de la ventana de Blender.
   - La orden `leccion` cada 90 s.
   - El avance automático con «Quedarme aquí».
   - Blender que sigue a la lección.
   - La ficha en vivo. Versión 6.1.0.
5. **Contenido**: los 9 módulos de Blender con fichas en el gancho y el explora, y el mapa completo en `bp1_gancho`.
6. **Docs y tablero**: `docs/motor/referencia/20_motor_6_1.md`, la guía `docs/despliegue/2026-10-30_motor_6_1.md` y las tareas T-142 a T-145.

## Notas

- Blender sin ventana no registra `wm.operators`, así que la prueba del modo curioso en `en_blender.py` simula el toque.
- Las pruebas viejas de `en_blender.py` apagan las presentaciones para no cambiar su recorrido.

## Validación

Motor y add-on 606, `en_blender.py` sin fallas en Blender 5.0.1, backend 418, vitest 345, lint y build. Se miró en el navegador el mapa y la ficha de `bp1_gancho`.
