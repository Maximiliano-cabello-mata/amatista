# 09 · Guía para alumnos nuevos, vista de alumno y auditoría (10 oct 2026)

> «Hacer muy claras las instrucciones dentro de la plataforma, reorganizar ciertos elementos de un curso, crear una lección clave para alumnos nuevos que les enseñe cómo funciona la plataforma y el add-on; para los administradores una interfaz especial para saltar cursos, una auditoría y ver la plataforma con la vista de alumno y de administrador.» (Maximiliano, 10 oct 2026)

## 1. Para el alumno

### Guía de primeros pasos (`#/guia`)

La lección clave para alumnos nuevos. Cinco capítulos cortos (unos 6 minutos), cada uno con una comprobación que abre el siguiente:

| Capítulo | Qué explica | Comprobación |
|---|---|---|
| Organización | Curso → nivel → módulo → lección; teoría, estación en Blender y jefe final; el botón «Continuar». | Pregunta: qué hay al final de cada módulo. |
| Lecciones | Paso a paso de una lección: abrirla, resolver las actividades, «Completar lección», XP y la siguiente. | Pregunta: qué hacer si el botón está gris. |
| Tu avance | XP, nivel, racha, insignias, Mi panel; sin cuenta, con cuenta y sin Internet. | Pregunta: si hace falta cuenta. |
| Instalar | Blender 4.2+, «Mi Blender», el instalador, la pestaña Amatista (N) y el código para conectar. | Pregunta: dónde está el add-on en Blender. |
| El taller | El ciclo Mira → Hazlo conmigo → Hazlo tú → Úsalo → Recuérdalo, los colores del molde, las pistas y Tu isla. | Ordenar el ciclo. |

Al terminar, la guía lleva a la lección que le toca al alumno, a «Mi Blender» o a «Mi panel». La guía **no da XP ni cambia el progreso**: su avance se guarda en el navegador (`amatista:guia`). Se llega desde:

- el botón **«?»** de la barra superior (siempre visible, con o sin cuenta),
- el aviso «¿Primera vez en Amatista?» en la portada y en «Mi panel» (desaparece al terminar la guía),
- el menú de la cuenta, el menú del celular, el pie de la portada y el recuadro «Así avanzas en este curso».

El contenido vive en `frontend/src/data/guia.js` y usa los mismos bloques que las lecciones. **Si cambia la plataforma o el add-on, se actualiza ese archivo.**

### Instrucciones claras dentro de cada página

- **Lección:** debajo del título, una línea **«Qué hacer:»** que dice cómo se completa esa lección (cuántas actividades, que se hace en Blender, o cuántas preguntas tiene el jefe y con qué porcentaje se aprueba).
- **Curso:** la leyenda suelta «Así avanzas» pasó a ser un recuadro con tres pasos numerados (Teoría, En Blender, Jefe final), qué hacer en cada uno y cómo funcionan los candados, justo debajo del árbol de niveles.
- **Reorganización del curso:** el orden ahora es encabezado → niveles → «Así avanzas» → Tu Blender → módulos → **Tu isla** (antes estaba arriba, antes de los módulos que la llenan).

Mismo diseño y misma paleta.

## 2. Para el equipo (profesores y administradores)

### Vista de administrador y vista de alumno

El equipo elige cómo recorrer la plataforma (Admin › **Ver la plataforma** o la franja de color que aparece debajo de la barra superior):

| Vista | Qué ve |
|---|---|
| **Administrador** (por defecto) | La pestaña Admin y **todas las lecciones abiertas** para revisar: puede saltar a cualquier curso, lección, estación de Blender o jefe final sin completar lo anterior. Lo que abre por revisión lleva la etiqueta «Abierta por revisión». |
| **Alumno** | Lo mismo que un alumno: sin la pestaña Admin y con los candados en su lugar. La franja «Vista de alumno» trae los botones para volver. |

Solo cambia lo que se muestra en ese navegador (`amatista:vista-equipo`). Saltar una lección **no la marca como hecha**; si el miembro del equipo la completa, cuenta en su propio progreso, y las métricas del panel no incluyen a profesores ni administradores. El servidor sigue validando el rol en cada petición.

### Ver la plataforma (`#/admin/revision`)

1. Elegir la vista.
2. Abrir las páginas que ve un alumno (portada, guía, Mi panel, Mi Blender, Conectar Blender, Perfil).
3. **Saltar a cualquier lección**: todos los cursos, módulos y lecciones con su tipo, filtro por curso y búsqueda por título o id. Muestra si la lección ya se marcó en la revisión a mano.

### Auditoría (`#/admin/auditoria`)

Solo lee: nada cambia el progreso de los alumnos.

| Parte | De dónde sale | Qué muestra |
|---|---|---|
| Revisiones del contenido | El catálogo que ven los alumnos | Errores (lección sin contenido, examen sin preguntas o con 0 o 2 respuestas correctas, pregunta rápida sin respuesta correcta, id repetido, estación de Blender sin taller o práctica) y avisos (sin duración, imagen sin texto alternativo, actividad sin id, módulo sin insignia o sin jefe final). Cada hallazgo enlaza a la lección. |
| Revisión lección por lección | El equipo, en ese navegador (`amatista:revision-manual`) | Marcar cada lección como «Revisada» o «Necesita cambios» con una nota. **Copiar** o **descargar** el informe en Markdown (hallazgos + lecciones con cambios). |
| Dónde se atascan | `GET /api/admin/auditoria` | Lecciones que 2 o más alumnos abrieron en el periodo (7, 30 o 90 días) y no todos terminaron, de menor a mayor porcentaje de quienes terminan. |
| Equipo con acceso al panel | idem | Profesores y administradores, correo confirmado, sesiones activas y último acceso. |
| Cuentas que requieren atención | idem | Bloqueadas ahora, sin confirmar hace más de 7 días, de prueba. |
| Contenido en la base | idem | Lecciones por estado, sin publicar y cambiadas en el periodo, con enlace al editor. |

`GET /api/admin/auditoria?dias=30` (profesor o admin; 401 sin sesión, 403 alumno). Solo consultas de lectura; **no necesita script SQL nuevo**.

## 3. Código

| Archivo | Qué hace |
|---|---|
| `frontend/src/data/guia.js` | Contenido de la guía. |
| `frontend/src/guia/estado.js` | Avance de la guía en el navegador. |
| `frontend/src/pages/Guia.jsx` | Página `#/guia`. |
| `frontend/src/components/AvisoGuia.jsx` | Aviso para quien no terminó la guía. |
| `frontend/src/components/leccion/queHacer.js` | La línea «Qué hacer» de cada lección. |
| `frontend/src/vista/` | Vista del equipo: reglas, proveedor y franja `BarraVista`. |
| `frontend/src/pages/admin/Revision.jsx` | Ver la plataforma y saltar a cualquier lección. |
| `frontend/src/components/admin/auditoria.js` | Revisiones del catálogo, revisión a mano e informe. |
| `frontend/src/pages/admin/Auditoria.jsx` | Página de auditoría. |
| `backend/api/admin.py` (`/auditoria`) | Lo que solo sabe el servidor. |
