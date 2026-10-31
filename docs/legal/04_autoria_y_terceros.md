# 04 · Autoría, licencias y materiales de terceros

## Lo observado en el repositorio al abrir el expediente

- Repositorio `Maximiliano-cabello-mata/amatista` **público**.
- En `README.md` se indica que la licencia general de la plataforma **todavía está pendiente**; no se encontró un archivo `LICENSE` en la raíz durante la revisión.
- El manifiesto de `addon/amatista_blender/blender_manifest.toml` declara `SPDX:GPL-3.0-or-later` para el complemento de Blender.
- El mismo manifiesto identifica a **Maximiliano Cabello Mata** como `maintainer`. Ser mantenedor es un dato técnico, **no prueba por sí solo la titularidad de todas las obras**.
- El proyecto utiliza herramientas y bibliotecas de terceros. Sus licencias y condiciones deben evaluarse por separado.

## Matriz de derechos — completar antes del registro

| Componente | Carpeta o referencia | Tipo de aportación | Evidencia de autoría | Licencia / tercero | Derechos o permisos pendientes |
| --- | --- | --- | --- | --- | --- |
| Frontend y UI | `frontend/` | Código y diseño | Commits, bocetos, capturas originales | Revisar `package.json` y dependencias | Confirmar autores y recursos gráficos |
| Backend | `backend/` | Código fuente | Commits, diseños, pruebas | Revisar dependencias Python | Confirmar contratos / colaboraciones |
| Motor de práctica | `engine/` y `practices/` | Implementación y contenidos | Versiones y casos de prueba | Revisar recursos externos | Separar reglas originales de conceptos generales |
| Complemento de Blender | `addon/` | Código de extensión | Commits y manifiesto | GPL-3.0-or-later, `bpy` y otras dependencias | Analizar obligaciones de distribución y obras vinculadas |
| Cursos y lecciones | `frontend/src/data/modulos/` | Contenido educativo | Borradores, commits, archivos originales | Imágenes y recursos de terceros a revisar | Acreditar autoría por recurso |
| Logotipo y recursos | Rutas de diseño por inventariar | Obras gráficas | Fuentes editables y fechas | Revisar tipografías, imágenes y recursos | Autoría/licencia de cada pieza |

## Reglas de trabajo

- No añadir un `LICENSE` global sin decidir antes la política de licencia y verificar compatibilidades.
- No presentar librerías, iconos, fuentes, modelos, música o imágenes de terceros como creaciones propias.
- Si hubo colaboradores, contratistas, estudiantes u otras personas, conservar en privado los acuerdos, autorizaciones o cesiones que correspondan, **sin presumir cesiones automáticas**.
- Mantener un inventario de recursos externos con URL de origen, autor conocido, licencia, versión y atribución requerida.
- Revisar la compatibilidad del software de Blender con GPL antes de modificar la distribución o comercialización.
- Publicar el nombre y logotipo solo dentro de los derechos realmente disponibles; una solicitud de marca no equivale a un registro concedido.

Este documento es un control documental, no un dictamen jurídico sobre compatibilidad GPL, secretos industriales o titularidad.
