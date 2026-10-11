# 11 · Recorrido guiado, página Blender y «Conoce Amatista Motor»

Auditoría del 11 de octubre de 2026 (T-110 a T-112, informe en `docs/auditoria/2026-10-11_auditoria_completa.md`). La plataforma queda en **tres lugares**: **Cursos** (lo que aprendes), **Blender** (cómo se une con la plataforma, instalar, conocer el add-on y tus ajustes) y **Mi panel** (tu avance). El equipo además ve **Admin**.

## Recorrido guiado (no es un curso)

Reemplaza al curso «Primeros pasos con Amatista» (retirado; su JSON vive en `frontend/src/data/modulos/archivo/`). Diez paradas por las páginas reales: la portada, la barra, las tarjetas de curso, «Así avanzas» y los módulos del curso de Blender, la tarjeta de la fusión, la instalación y las tres prácticas en la página Blender, Mi panel y el botón «?».

- Lo ofrece una invitación en Inicio y Mi panel («Te muestro la plataforma en un minuto», con «Ahora no»), y siempre está en **Ayuda** (`#/guia`, botón «?»).
- Cada parada abre su página, oscurece el resto e ilumina el elemento marcado con `data-recorrido="…"`. Teclado (flechas y Escape), teléfono (la tarjeta va abajo) y movimiento reducido.
- No da XP ni cambia el progreso. Se recuerda en el navegador (`amatista:recorrido`).
- Código: `frontend/src/recorrido/` (`pasos.js` con las paradas y su prueba, `RecorridoProvider.jsx` con la capa). Para agregar una parada: marcar el elemento con `data-recorrido` y sumar la parada en `pasos.js` (máximo 12).

## Página Blender (`#/blender`)

1. **Cómo se unen la plataforma y Blender** (`components/blender/FusionPlataformaBlender.jsx`): las dos partes, los 7 pasos del proceso (aprendes la idea, instalas, vinculas, la lección abre tu taller, Blender te guía, la lección te ve en vivo, tu avance queda en tu cuenta) marcados según lo que el alumno ya tiene, y «Qué viaja entre los dos» (código de 8 caracteres que vale 10 minutos, órdenes, latido cada 5 segundos; no viajan el `.blend` ni la contraseña). También está en Ayuda.
2. **Prepárate (una sola vez)**: descargar e instalar; se pliega cuando Blender ya está vinculado.
3. **Conoce el add-on**: las tres prácticas (abajo).
4. **Tu Blender y tus prácticas**: cómo se ve Blender (modo enfocado, acompañamiento, tarjeta 3D), computadoras conectadas y prácticas.

## Conoce Amatista Motor (add-on 5.2)

Tres prácticas cortas dentro de Blender que explican todo el add-on. No son un curso: se hacen una vez (unos 3 minutos cada una) y se repiten cuando se quiera.

| Práctica | Paradas |
|---|---|
| Tu pestaña Amatista (`pestana`) | hola, barra N, cuenta, plataforma, lección, ajustes, guardar, listo |
| Muévete y usa tus herramientas (`vista`) | orbitar, acercar, elegir, mover, girar, escalar, herramientas, ayuda, enfoque, listo |
| Así te enseña el taller (`taller`) | ciclo, tarjeta, Mira, molde, comprobar, pistas, pausa, isla, enlace, listo |

- Las paradas que piden hacer algo se comprueban solas: el add-on mira la escena (orbitar, acercar, elegir, mover, girar, escalar) o anota el botón que el alumno pulsó (`recorrido.anotar()` en «Abrir la plataforma», «Guardar», «Usar», «¿Cómo se usa?», «Enfocar»).
- En la plataforma, `components/blender/ConoceAmatistaMotor.jsx` muestra las tres con su estado (hecha, en Blender ahora, te toca, después), «Empezar en Blender ▶» y, con una en curso, el mismo paso que la pestaña Amatista con Anterior, Siguiente y Salir.
- Enlace: el latido manda `detalle.recorrido = {id, nombre, hechos, activo, hecho, paso, total, titulo, texto, hacer, teclas, pasos}`; la plataforma manda la orden `recorrido` con `accion` (`empezar`, `siguiente`, `anterior`, `salir`) y `recorrido` (`pestana`, `vista`, `taller`). Validado en `backend/api/enlace.py`. Sin SQL.
- Código: `addon/amatista_blender/recorrido_pasos.py` (las paradas, sin `bpy`, con pruebas en `addon/tests/test_recorrido.py`) y `recorrido.py` (escena aparte «Amatista · Conoce el add-on», comprobaciones, panel y órdenes).

## Ayuda (`#/guia`)

El recorrido, la tarjeta de la fusión y cinco **preguntas rápidas** que se abren de a una (organización, lecciones, avance, conectar Blender y cómo enseña el add-on; contenido en `frontend/src/data/guia.js`). Sin candados ni comprobaciones.

## Mi panel

Índice de secciones; una tarjeta por ruta en **Cursos** (Blender con sus niveles dentro); **Talleres y proyectos**, **Exámenes** e **Insignias** muestran primero lo que toca y el resto con «Ver todos» (`components/panel/VerTodo.jsx`).

## Publicar

`docs/despliegue/2026-10-11_auditoria_y_motor_5_2.md`.
