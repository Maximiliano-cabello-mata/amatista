# Bitácora · 4 de octubre de 2026 · Rediseño de Amatista Engine

Pedido de Maximiliano (3 oct, 23:53): ordenar y documentar Amatista Engine, add-on práctico con modo desarrollador, paquete descargable con instalación automática y comprobación de compatibilidad, Blender conectado a la plataforma, progreso y prácticas nuevas registradas en Oracle, y una primera práctica dentro de los módulos.

## Hecho (rama claude/amatista-engine-x71veq, fusionada en main a pedido del usuario)

- `engine/`: motor reorganizado y ampliado (18 validadores, pistas por niveles, autonomía, herramientas).
- `addon/`: extensión Blender 4.2+ «Amatista» 0.2.0, modos Alumno y Desarrollador; constructor de la extensión y de paquetes con instalador (Windows, macOS, Linux).
- Oracle `007_motor_practicas.sql` (aditivo) y API `/api/addon/v1`.
- PWA: página Blender, `#/vincular`, bloque `blender_practice`, tarjeta en el panel, Admin › Prácticas.
- Práctica `blender.n1.mesa` en el módulo 2 de Blender (`estado: revision`).
- Documentación en `docs/motor/`; tablero: T-050 a T-053 en revisión, nuevas T-055 y T-056.

## Pruebas

Backend, motor y add-on con pytest; el add-on dentro de `bpy` 5.0.1 (instalación real de la extensión); frontend con vitest, lint y build.

## Pendiente

- 007 no se probó en un Oracle real: ejecutarlo después del piloto (manual Oracle, sección 10) — T-055.
- Probar el instalador en Windows y macOS reales — T-056.
- Versión principal de Blender del curso sigue abierta (T-038).
