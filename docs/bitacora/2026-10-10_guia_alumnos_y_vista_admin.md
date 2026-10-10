# 10 oct 2026 · Guía para alumnos nuevos, vista de alumno y auditoría

**Pedido (Maximiliano, 23:23Z):** instrucciones muy claras dentro de la plataforma, reorganizar elementos del curso, una lección clave que enseñe a los alumnos nuevos cómo funcionan la plataforma y el add-on; para los administradores, una interfaz para saltar cursos, una auditoría y ver la plataforma con la vista de alumno y de administrador.

## Qué se hizo

- **Guía de primeros pasos** (`#/guia`, T-103): cinco capítulos con comprobación (organización, lecciones, tu avance, instalar el add-on, el taller). No da XP ni toca el progreso. Botón «?» en la barra y aviso en portada y panel hasta terminarla.
- **Instrucciones claras:** línea «Qué hacer:» en cada lección; recuadro «Así avanzas en este curso» con tres pasos; Tu isla se movió después de los módulos.
- **Vista del equipo** (T-104): vista de administrador (todo abierto para revisar, etiqueta «Abierta por revisión») o de alumno (igual que un alumno, sin Admin), con una franja para cambiar.
- **Admin › Ver la plataforma:** elegir la vista, páginas del alumno y saltar a cualquier lección.
- **Admin › Auditoría:** revisiones automáticas del catálogo, revisión lección por lección con informe en Markdown, y del servidor (`GET /api/admin/auditoria`): dónde se atascan los alumnos, equipo con permisos, cuentas que requieren atención y contenido sin publicar.

Detalle: `docs/plataforma/09_guia_vista_y_auditoria.md`.

## Decisiones por defecto

- La vista y el salto de lecciones son para **profesores y administradores** (el panel ya era de ambos); solo cambian lo que se ve en ese navegador y nunca el progreso de los alumnos.
- La revisión a mano se guarda en el navegador de quien revisa y se comparte con el informe; guardarla en Oracle pediría el script 013.
- No se tocó `engine/` ni `addon/` (los lleva el hilo «Rediseño del motor para el alumno»).

## Despliegue

Sin SQL. Actualizar el backend (nuevo endpoint) y publicar la PWA. Prueba: T-105.
