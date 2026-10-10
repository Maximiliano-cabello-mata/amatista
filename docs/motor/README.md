# Amatista Engine

El motor de prácticas de Amatista: el alumno practica **dentro de Blender**, Amatista revisa su escena mientras trabaja y su avance queda en Oracle junto con el resto de su progreso.

| Pieza | Carpeta | Qué es |
|---|---|---|
| Motor | [`engine/`](../../engine/) | Python puro, sin `bpy`. Lee una práctica declarativa (`amatista.practice/1` y `/2`), evalúa una foto de la escena y decide progreso, pistas y autonomía. |
| Add-on | [`addon/`](../../addon/) | Extensión de Blender 4.2+ («Amatista Motor», versión 4.0.0). Captura la escena, la evalúa con el motor (copia incluida en el `.zip`) y habla con la API. Modos **Alumno** y **Desarrollador** (Amatista Author). |
| Prácticas | [`practices/`](../../practices/) | Las 18 prácticas del plan de estudios (`amatista.practice/2`), cada una con su ejemplo resuelto y sus casos de prueba, y el mapa de cursos [`blender/cursos.json`](../../practices/blender/cursos.json). Las de la v2 (mesa, podio) están en `archivo/v2/`. |
| Plataforma | `backend/api/addon.py`, `frontend/src/blender/`, `frontend/src/components/modulo/` | API `/api/addon/v1`, la práctica al final de cada módulo (bloque `blender_practice` con la preparación de Blender integrada), **Mi Blender** en el menú de la cuenta y **Prácticas de Blender** en el panel admin. |
| Oracle | `backend/sql/007_motor_practicas.sql`, `010_enlace_blender.sql`, `011_detalle_instructor.sql` | `ADDON_VINCULOS`, `PRACTICAS`, `PRACTICA_VERSIONES`, `PROGRESO_PRACTICAS`; desde el motor 3.4, `ADDON_ENLACES` y `ADDON_AJUSTES` (enlace en vivo, `010_enlace_blender.sql`); desde el 3.5.1, la columna `ADDON_ENLACES.DETALLE` (`011_detalle_instructor.sql`). Aditivos e idempotentes. |

## Etapas

| Etapa | Qué logró | Documento |
|---|---|---|
| 1 · El motor que evalúa | Motor declarativo, add-on con modos Alumno y Desarrollador, instalador, Oracle 007, API y la práctica de la mesa (PR #13). | [etapas/etapa-1.md](etapas/etapa-1.md) |
| 2 · El motor que acompaña | Guía paso a paso con teclas, guía dibujada en la escena, «Hazlo conmigo», acompañante que felicita y ofrece ayuda. | [etapas/etapa-2.md](etapas/etapa-2.md) |
| 3 · El motor que enseña | Motor v3 y add-on 3.0: pestañas Aprender · Practicar · Mi curso, píldoras de teoría con repaso espaciado, vigilantes que pausan el progreso, escenas de inicio, plan de estudios de 2 cursos y 6 prácticas, y herramientas de autor (plantillas, casos de prueba, `practicas.py`). | [etapas/etapa-3.md](etapas/etapa-3.md) |
| 3.2 y 3.3 · Mundos y figuras con sentido | Amatista Motor 3.2 (temática por módulo en el add-on) y 3.3: modelo de referencia por práctica (imagen y plano), `figure.resembles` con medidas aproximadas, `spatial.on_top` y `dimension.approx`. | [referencia/10_modelo_de_referencia.md](referencia/10_modelo_de_referencia.md) |
| 3.4 · La plataforma maneja Blender | `figure.recognize`: el motor reconoce la figura sin roles, revisa que tenga sentido y exige según el nivel. Enlace en vivo (Blender late, la plataforma le abre prácticas y decide cómo se ve), modo enfocado y panel «Tus herramientas» con «¿Cómo se usa?». Oracle 010. | [referencia/11_reconocer_figuras.md](referencia/11_reconocer_figuras.md), [referencia/12_plataforma_y_blender.md](referencia/12_plataforma_y_blender.md) |
| 3.5 · Blender como instructor | Cada práctica en su propia escena (abrir otra ya no arrastra lo de la anterior). `figure.silhouette`: la silueta de una figura hecha en una sola malla (la espada), parte por parte, con lo que falta y su tecla. Lista «Tu figura» (hoy «Comparado con el ejemplo») en Blender y en la lección, y la plataforma maneja la práctica (comprobar, pista, «Hazlo conmigo», guardar, empezar de nuevo). Sin cambios en Oracle. | [referencia/13_instructor_y_silueta.md](referencia/13_instructor_y_silueta.md) |
| 3.5 · El ejemplo manda | Cada práctica trae su **ejemplo resuelto en código**. El motor arma con él la escena esperada y revisa sola la del alumno aspecto por aspecto (figura, malla, modificadores, materiales, colecciones, luces, cámara, animación, render y archivo), con exigencia según el nivel: objetivo `example.matches`, que se agrega a toda práctica. «Ver el ejemplo» lo arma en Blender en su propia escena, y la lección lo muestra con su código. Sin cambios en Oracle. | [referencia/14_ejemplo_y_revision.md](referencia/14_ejemplo_y_revision.md) |
| 3.5.1 · Correcciones | Una foto sin silueta ya no aprueba `figure.silhouette` ni `example.matches` (pide actualizar el complemento y volver a comprobar). El último mensaje del instructor (`detalle`) se guarda en Oracle, en `ADDON_ENLACES.DETALLE`, y lo leen todos los procesos del backend. Oracle 011. | [referencia/13_instructor_y_silueta.md](referencia/13_instructor_y_silueta.md), [guía de actualización](../despliegue/2026-10-09_correcciones_3_5_1.md) |
| 4.0 · La experiencia del alumno | La práctica como **ruta de misiones**: partes con nombre y una sola misión explicada a la vez (`ruta/`, `stage` en cada objetivo). **Medidas amables** según el nivel (la forma tiene que tener sentido, los decimales no estorban) y el instructor sin decimales en los niveles 1 a 3. En Blender, una sola **tarjeta de la misión** con animaciones, teclas que se encienden al usarlas y herramientas iluminadas (y elegidas en la barra T en los niveles 1 y 2); la barra lateral muestra solo la misión y deja lo demás cerrado; «Tu misión» al abrir y sin diálogo por cada paso. La lección ve la misma misión. Sin cambios en Oracle. | [referencia/15_experiencia_del_alumno.md](referencia/15_experiencia_del_alumno.md) |

## Referencia (estado actual)

1. [Arquitectura](referencia/01_arquitectura.md): cómo encajan las piezas y por qué el servidor vuelve a evaluar.
2. [Formato de práctica](referencia/02_formato_de_practica.md): `amatista.practice/1`, validadores, pistas, guía y requisitos.
3. [El add-on](referencia/03_addon.md): paneles, modos, sin conexión, cola de envíos.
4. [Instalación para el alumno](referencia/04_instalacion_alumno.md): descarga, instalador, compatibilidad y conexión, con solución de problemas.
5. [API del add-on](referencia/05_api.md): endpoints, permisos y tablas.
6. [Modo desarrollador](referencia/06_modo_desarrollador.md): crear, probar y subir una práctica nueva; publicarla.
7. [Guía paso a paso y acompañamiento](referencia/07_guia_y_acompanamiento.md): entrenadores, señales en la escena, «Hazlo conmigo», acompañante y preferencias (etapa 2).
8. [Prácticas v3 y herramientas de autor](referencia/08_practicas_v3_y_herramientas.md): `amatista.practice/2` (píldoras, vigilantes, escena de inicio, curso), `cursos.json`, `pruebas.json` y `practicas.py` (motor v3).
9. [Catálogo de validadores](referencia/09_validadores.md): los 42, con sus parámetros (generado).
10. [Modelo de referencia](referencia/10_modelo_de_referencia.md): la figura terminada, su imagen y su plano, y cómo `figure.resembles` califica figuras con sentido (motor 3.3).
11. [Reconocer figuras](referencia/11_reconocer_figuras.md): `figure.recognize`, roles deducidos por la forma, relaciones con sentido y exigencia por nivel (motor 3.4).
12. [La plataforma maneja Blender](referencia/12_plataforma_y_blender.md): enlace en vivo, órdenes y ajustes desde «Mi Blender», modo enfocado y «Tus herramientas» (motor 3.4).
13. [Blender como instructor](referencia/13_instructor_y_silueta.md): una escena por práctica, `figure.silhouette`, la lista del instructor (hoy «Comparado con el ejemplo») y la plataforma que maneja la práctica (motor 3.5).
14. [El ejemplo manda](referencia/14_ejemplo_y_revision.md): el ejemplo resuelto en código de cada práctica y la revisión autónoma contra él, en el motor, en Blender y en la plataforma (motor 3.5).
15. [La experiencia del alumno](referencia/15_experiencia_del_alumno.md): la ruta de misiones, las medidas amables, el instructor sin decimales, la tarjeta de la misión con animaciones y herramientas iluminadas, y la psicología detrás (motor 4).

Especificaciones originales (3 de octubre de 2026): [`especificaciones/`](especificaciones/) (concepto del motor, Motor de Desarrollo v0.1 y el `ascii_check.py` original).

Cómo se ve en la plataforma (la práctica al cierre de cada módulo): [`docs/plataforma/`](../plataforma/README.md).

## En una frase por persona

- **Alumno:** termina las lecciones del módulo y llega a su práctica en Blender; ahí mismo descarga «Amatista para Blender», lo conecta y abre Blender: la práctica ya está ahí y Amatista lo acompaña paso a paso. Lo que avanza aparece en su panel.
- **Desarrollador (profesor o admin):** en Blender cambia al modo Desarrollador, arma la práctica con el constructor de objetivos, la prueba como alumno y pulsa **Subir a Amatista**: queda registrada en Oracle como borrador con número de versión.
- **Administrador:** en Admin › Prácticas de Blender revisa las versiones y publica. Nada llega a los alumnos sin ese paso.

## Probarlo en tu computadora

```bash
# Motor y constructor del paquete (sin Blender)
python -m pytest engine/tests addon/tests -q
python engine/demo.py

# El add-on dentro de Blender sin interfaz (bpy de PyPI o un Blender instalado)
python addon/tests/en_blender.py            # con pip install bpy==5.0.1 (Python 3.11)
blender --background --python addon/tests/en_blender.py

# El paquete para el alumno (lo mismo que descarga la plataforma)
python addon/herramientas/construir.py --sistema windows --servidor http://localhost:8000 --salida dist/
```

La versión de Blender que el curso toma como principal sigue abierta (T-038); el add-on exige 4.2 como mínimo porque es la primera con extensiones.
