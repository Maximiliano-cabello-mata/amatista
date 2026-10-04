# Amatista Engine

El motor de prácticas de Amatista: el alumno practica **dentro de Blender**, Amatista revisa su escena mientras trabaja y su avance queda en Oracle junto con el resto de su progreso.

| Pieza | Carpeta | Qué es |
|---|---|---|
| Motor | [`engine/`](../../engine/) | Python puro, sin `bpy`. Lee una práctica declarativa (`amatista.practice/1`), evalúa una foto de la escena y decide progreso, pistas y autonomía. |
| Add-on | [`addon/`](../../addon/) | Extensión de Blender 4.2+ («Amatista»). Captura la escena, la evalúa con el motor (copia incluida en el `.zip`) y habla con la API. Modos **Alumno** y **Desarrollador** (Amatista Author). |
| Prácticas | [`practices/`](../../practices/) | Las prácticas oficiales en JSON. La primera: [`blender/level_1/mesa.json`](../../practices/blender/level_1/mesa.json). |
| Plataforma | `backend/api/addon.py`, `frontend/src/pages/Blender.jsx` | API `/api/addon/v1`, página **Blender** (descarga y conexión), bloque de lección `blender_practice` y sección **Prácticas** del panel admin. |
| Oracle | `backend/sql/007_motor_practicas.sql` | `ADDON_VINCULOS`, `PRACTICAS`, `PRACTICA_VERSIONES`, `PROGRESO_PRACTICAS`. Aditivo e idempotente. |

## Documentos

1. [Arquitectura](01_arquitectura.md): cómo encajan las piezas y por qué el servidor vuelve a evaluar.
2. [Formato de práctica](02_formato_de_practica.md): `amatista.practice/1`, validadores, pistas y requisitos.
3. [El add-on](03_addon.md): paneles, modos, sin conexión, cola de envíos.
4. [Instalación para el alumno](04_instalacion_alumno.md): descarga, instalador, compatibilidad y conexión, con solución de problemas.
5. [API del add-on](05_api.md): endpoints, permisos y tablas.
6. [Modo desarrollador](06_modo_desarrollador.md): crear, probar y subir una práctica nueva; publicarla.

Especificaciones originales (3 de octubre de 2026): [`especificaciones/`](especificaciones/) (concepto del motor, Motor de Desarrollo v0.1 y el `ascii_check.py` original).

## En una frase por persona

- **Alumno:** descarga «Amatista para Blender» desde la página Blender, abre el instalador, abre Blender y la práctica de su lección ya está ahí. Lo que avanza aparece en su panel.
- **Desarrollador (profesor o admin):** en Blender cambia al modo Desarrollador, arma la práctica con el constructor de objetivos, la prueba como alumno y pulsa **Subir a Amatista**: queda registrada en Oracle como borrador con número de versión.
- **Administrador:** en Admin › Prácticas revisa las versiones y publica. Nada llega a los alumnos sin ese paso.

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
