# 06 · Modo desarrollador (Amatista Author)

> **Motor v3:** las prácticas nuevas usan `amatista.practice/2` (píldoras, vigilantes, escena de inicio y curso) y se crean y prueban con `engine/herramientas/practicas.py`. Ver [prácticas v3 y herramientas de autor](08_practicas_v3_y_herramientas.md). Este documento sigue valiendo para todo lo que la v2 no cambió.

Crear una práctica nueva sin escribir código, desde Blender, y registrarla en Oracle. Es la versión construida del [Motor de Desarrollo v0.1](../especificaciones/2026-10-03_motor_de_desarrollo_v0.1.md).

## Activarlo

- Cuentas con rol **profesor** o **admin**: el selector de modo aparece solo.
- Cualquier otra persona: *Preferencias › Complementos › Amatista › Modo desarrollador*. Puede diseñar y exportar, pero **Subir a Amatista** exige una cuenta de profesor o admin (la API responde 403).

En la pestaña Amatista, cambia el modo a **Desarrollador**.

## Flujo

1. **Borrador de práctica** › **Crear borrador** (id, título, nivel) o **Partir de la práctica abierta** o **Abrir practice.json**. El borrador vive en un bloque de texto del `.blend` (`amatista_practica.json`): se guarda con la escena de referencia y se puede editar a mano en el Editor de texto.
2. Arma la escena de referencia, la solución que esperas del alumno.
3. **Tagger: roles y etiquetas**: **Declarar rol** (crea el rol en la práctica) y asígnalo a los objetos; **Etiquetar** para etiquetas libres.
4. **Inspector**: medidas, ubicación, materiales y modificadores del objeto activo, tal como los ve el motor.
5. **Constructor de objetivos**: elige una plantilla (las etiquetas de los validadores: «Cantidad por rol», «Dimensión», «Debajo de»…), llena sus parámetros (**Usar sus medidas** llena el rango con la medida del objeto activo, con margen), título, peso, requisito y consejo, y pulsa **Agregar objetivo**. Ordena con las flechas y agrega de 1 a 6 pistas, de la general al paso a paso.
6. **Validación y depurador**: **Validar práctica** compila el borrador (errores en español con la ruta del campo) y lo evalúa contra la escena actual. Con la escena de referencia todo debe quedar en verde; con una escena vacía, en rojo.
7. **Vista previa como alumno**: carga el borrador en el modo Alumno, con tarjetas, pistas y diálogos, sin enviar nada a la plataforma.
8. **Exportar y publicar**:
   - **Exportar practice.json**: para guardarlo en el repositorio, en `practices/blender/level_<n>/`.
   - **Subir a Amatista** (curso, lección y nota opcionales): `POST /api/addon/v1/practicas`. Oracle guarda la versión siguiente en `PRACTICA_VERSIONES` con la versión del add-on y de Blender. Si nada cambió desde la última subida, no crea otra. **Queda en borrador.**
   - **Registrar verificación**: anota en la matriz de compatibilidad (`VERIFICACIONES_BLENDER`) que la lección funciona en este Blender.

## Publicar (admin)

En la PWA: **Admin › Prácticas**. Se ven todas las prácticas con su estado, la versión publicada y la última, el autor, alumnos y completadas. **Versiones** muestra cada versión con su nota; **Publicar vN** pone la última versión a disposición de los alumnos; **Archivar** la retira del catálogo sin borrar el progreso.

**Registrar las del repositorio** registra todas las prácticas de `practices/blender/` como borrador; **Registrar y publicar** además las publica. Lo mismo desde la VM:

```bash
cd /home/opc/amatista/backend
python herramientas/contenido.py practicas             # registra (borrador)
python herramientas/contenido.py practicas --publicar  # registra y publica
```

## Conectar la práctica con una lección

En el JSON del módulo, agrega un bloque a la lección:

```json
{
  "type": "blender_practice",
  "id": "practica_mesa",
  "practica": "blender.n1.mesa",
  "title": "Construye una mesa en Blender",
  "text": "Pulsa **Abrir en Blender**…",
  "minutes": 20,
  "steps": ["Crea la cubierta", "Hazla delgada", "…"],
  "allowManual": false
}
```

- `steps` es lo que se ve sin conexión o antes de abrir Blender: conviene que sean los títulos de los objetivos obligatorios (la prueba `logica.test.js` lo comprueba para la mesa).
- `allowManual: true` deja marcar la actividad como hecha sin Blender (para quien no puede instalarlo).
- Al importar el módulo (`herramientas/contenido.py importar` o Admin › Contenido), cada práctica queda enlazada con su lección: al completarla en Blender, la lección se marca sola.

La plantilla está en `backend/contenido/plantillas.py` y la validación del bloque en `backend/contenido/validacion.py`.
