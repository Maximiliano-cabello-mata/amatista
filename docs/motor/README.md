# Amatista Engine

El motor de prácticas de Amatista: el alumno practica **dentro de Blender**, Amatista revisa su escena mientras trabaja y su avance queda en Oracle junto con el resto de su progreso.

| Pieza | Carpeta | Qué es |
|---|---|---|
| Motor | [`engine/`](../../engine/) | Python puro, sin `bpy`. Lee una práctica declarativa (`amatista.practice/1`), evalúa una foto de la escena y decide progreso, pistas y autonomía. |
| Add-on | [`addon/`](../../addon/) | Extensión de Blender 4.2+ («Amatista»). Captura la escena, la evalúa con el motor (copia incluida en el `.zip`) y habla con la API. Modos **Alumno** y **Desarrollador** (Amatista Author). |
| Prácticas | [`practices/`](../../practices/) | Las prácticas oficiales en JSON. La primera: [`blender/level_1/mesa.json`](../../practices/blender/level_1/mesa.json). |
| Plataforma | `backend/api/addon.py`, `frontend/src/blender/`, `frontend/src/components/modulo/` | API `/api/addon/v1`, la práctica al final de cada módulo (bloque `blender_practice` con la preparación de Blender integrada), **Mi Blender** en el menú de la cuenta y **Prácticas de Blender** en el panel admin. |
| Oracle | `backend/sql/007_motor_practicas.sql` | `ADDON_VINCULOS`, `PRACTICAS`, `PRACTICA_VERSIONES`, `PROGRESO_PRACTICAS`. Aditivo e idempotente. |

## Etapas

| Etapa | Qué logró | Documento |
|---|---|---|
| 1 · El motor que evalúa | Motor declarativo, add-on con modos Alumno y Desarrollador, instalador, Oracle 007, API y la práctica de la mesa (PR #13). | [etapas/etapa-1.md](etapas/etapa-1.md) |
| 2 · El motor que acompaña | Guía paso a paso con teclas, guía dibujada en la escena, «Hazlo conmigo», acompañante que felicita y ofrece ayuda. | [etapas/etapa-2.md](etapas/etapa-2.md) |

## Referencia (estado actual)

1. [Arquitectura](referencia/01_arquitectura.md): cómo encajan las piezas y por qué el servidor vuelve a evaluar.
2. [Formato de práctica](referencia/02_formato_de_practica.md): `amatista.practice/1`, validadores, pistas, guía y requisitos.
3. [El add-on](referencia/03_addon.md): paneles, modos, sin conexión, cola de envíos.
4. [Instalación para el alumno](referencia/04_instalacion_alumno.md): descarga, instalador, compatibilidad y conexión, con solución de problemas.
5. [API del add-on](referencia/05_api.md): endpoints, permisos y tablas.
6. [Modo desarrollador](referencia/06_modo_desarrollador.md): crear, probar y subir una práctica nueva; publicarla.
7. [Guía paso a paso y acompañamiento](referencia/07_guia_y_acompanamiento.md): entrenadores, señales en la escena, «Hazlo conmigo», acompañante y preferencias (etapa 2).

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
