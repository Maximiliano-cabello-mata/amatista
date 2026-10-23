# Módulos archivados

Archivo: los tres módulos del curso `blender` de la v2, reemplazado el 4 de octubre de 2026 por los cursos `blender_principiante`, `blender_principiante_intermedio` y `blender_intermedio` (los `blender_*-modulo-*.json` de la carpeta de arriba).

No se empaquetan en la PWA (`cursos.js` solo carga `./modulos/*.json`) ni los valida `contenido.py validar`. Se conservan porque los usan pruebas (`frontend/src/modulos/practica.test.js`, `frontend/src/blender/logica.test.js`, `engine/tests/test_motor_podio.py`) y como referencia del progreso de los alumnos de la v2, que la base conserva (009 archiva, no borra). No se editan.

## Curso «primeros_pasos» (v3.7)

`primeros_pasos-modulo-1.json` («La estación del enlace») se retiró el 11 de octubre de 2026: un curso de
introducción dentro del árbol de Blender confundía a los alumnos. Lo reemplazan el **recorrido guiado por
la plataforma** (botón «?» de la barra superior) y las **tres prácticas del add-on** de #/blender
(«Conoce Amatista Motor»). Su `estado` es `archivado`: `python herramientas/contenido.py importar
../frontend/src/data/modulos/archivo/primeros_pasos-modulo-1.json` lo archiva en la base sin borrar el
progreso. La PWA tampoco lo muestra aunque el servidor lo envíe (`catalogo/combinar.js` › `CURSOS_ARCHIVADOS`).

## Módulos 4 y 5 del curso «aframe» (2026-10-23)

`aframe-modulo-4.json` y `aframe-modulo-5.json` (`mod_aframe_004` y `mod_aframe_005`) se archivaron cuando el
programa A-Frame se dividió en dos cursos compactos: **A-Frame Inicial** (`aframe`, módulos 1-3) y
**A-Frame Interactivo** (`aframe_interactivo`). Su contenido vive ahora en
`aframe_interactivo-modulo-1.json` (`mod_afi_001`) y `aframe_interactivo-modulo-3.json` (`mod_afi_003`) con
**los mismos ids de lección** (`af4_*`, `af5_*`): la PWA traslada el avance guardado
(`progreso/estado.js` › `TRASLADOS_LECCION`) y oculta estos dos módulos aunque el servidor los envíe
(`catalogo/combinar.js` › `MODULOS_ARCHIVADOS`). En producción: importar los tres `aframe_interactivo-*` y
luego estos dos archivos (su `estado` es `archivado`).
