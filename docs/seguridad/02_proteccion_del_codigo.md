# Protección del código del add-on

Pregunta de Max (5 de octubre): que el código de Amatista esté protegido aunque viva en la computadora de otra persona, incluso sin Internet. Este documento dice qué se hizo, qué protege de verdad y qué **no se puede** proteger.

## El límite honesto

Un programa que corre en la computadora de alguien se puede leer, copiar y modificar. Blender ejecuta Python: el add-on llega como archivos `.py` que cualquiera puede abrir. Ofuscarlo o compilarlo a `.pyc` solo hace la lectura más incómoda (los `.pyc` se descompilan en segundos) y además rompe entre versiones de Python de Blender. Ninguna empresa, tampoco las grandes, lo consigue con código que entrega al usuario. Por eso la protección real va por otro lado:

1. **Lo valioso no vive en la computadora del alumno.** La calificación oficial la calcula **el servidor** con su propia copia del motor y de las prácticas. Un add-on modificado puede decir «saqué 100», pero lo que se guarda es lo que calcula el servidor con la escena que recibe.
2. **Saber si una copia es la oficial** (integridad).
3. **Saber de quién salió una copia** que circule por fuera (marca de agua firmada).
4. **La licencia**: el add-on se publica como GPL-3.0-or-later, como pide Blender para los add-ons que usan su API de Python (y exige su plataforma de extensiones). Esa licencia permite copiar y modificar el add-on; lo que protege la propiedad de Amatista es el servidor, las prácticas y el contenido de los cursos, que no van en el add-on con esa licencia. Si se quiere otra licencia para el contenido, hay que decidirlo (pendiente con Max).

## Qué se hizo

| Pieza | Qué hace | Dónde |
|---|---|---|
| `integridad.json` en cada paquete | El servidor anota el SHA-256 de cada archivo y una huella del conjunto. El add-on los recalcula **sin red** al arrancar: «oficial», «modificada» o «desarrollo». El panel avisa si es «modificada». | `addon/herramientas/construir.py`, `addon/amatista_blender/integridad.py` |
| Cabeceras de integridad | Cada intento lleva `X-Amatista-Integridad` y `X-Amatista-Huella`. El servidor guarda si la copia estaba verificada (`copia_verificada`). | `addon/amatista_blender/red.py`, `backend/api/addon.py` |
| Política de copias | `AMATISTA_ADDON_VERIFICADO=registrar` (acepta y marca) o `exigir` (rechaza con 403 los intentos de alumnos con copias no verificadas). | `backend/api/addon.py` |
| Marca de agua | Cada descarga con cuenta lleva `licencia.json`: cuenta, fecha, versión y una firma HMAC-SHA256 con `AMATISTA_SECRETO_FIRMA`. No se puede falsificar sin el secreto del servidor. | `backend/api/addon.py` |
| Verificador | `python herramientas/verificar_licencia.py <zip o carpeta>` dice de qué cuenta salió una copia, si la firma es válida y si los archivos son los originales. | `backend/herramientas/verificar_licencia.py` |
| Permisos declarados | El manifiesto de Blender declara solo red (descargar prácticas, enviar progreso) y archivos (caché local). | `addon/amatista_blender/blender_manifest.toml` |

## Qué protege y qué no

| Situación | ¿Protegido? |
|---|---|
| Un alumno edita el add-on para aprobar sin hacer la práctica | **Sí**: el servidor califica con su motor; con `exigir`, ni siquiera acepta la copia. |
| Un alumno modifica el add-on y también el chequeo de integridad para que diga «oficial» | **Parcial**: la huella que manda debe coincidir con la del servidor; si la falsifica también, el servidor sigue calificando con su propio motor. |
| Alguien sube el add-on a otro sitio | **Se rastrea**: la marca de agua dice qué cuenta lo descargó. No se puede impedir la copia. |
| Alguien lee el código del add-on para aprender cómo funciona | **No**: es Python y GPL. Mientras el repositorio sea público, además se puede leer todo desde GitHub. |
| Alguien copia las prácticas y cursos | **Parcial**: las prácticas llegan al add-on para poder trabajar sin Internet. El contenido completo y el progreso viven en el servidor. |

## Pruebas

`backend/tests/test_proteccion_addon.py`: el paquete trae la integridad de cada archivo; el mismo código da el mismo paquete; la descarga con cuenta trae una marca de agua con firma válida; una copia «modificada» queda marcada y con `exigir` una copia que miente sobre su huella recibe 403. `addon/tests/test_integridad.py`: el chequeo sin red detecta archivos cambiados o agregados, y sin `integridad.json` dice «desarrollo».
