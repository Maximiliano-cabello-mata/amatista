# 31 de octubre de 2026 · El Corazón Amatista

**Pedido** (Maximiliano, 16:48 UTC): analizar todo lo hecho en el repositorio, encontrar lo más débil y lo desatendido de la plataforma y sobre todo del motor («no es un motor, es un add-on»; «hay cosas que desaparecen, no te señala claramente»), ver cómo otros enseñan dentro de la interfaz de un programa 3D y qué dice la investigación sobre la curva de aprendizaje, y convertir el add-on en un motor de verdad: un corazón estable del que salgan ramas, en lugar de versiones infinitas.

**Lo que se encontró**

- 15 versiones del motor en 27 días (3.2 a 7), casi todas por la misma queja: el alumno no sabe qué hacer ni dónde.
- Cinco formas de decir «qué hago ahora» y cuatro sistemas de pistas conviviendo; pruebas con el número de versión en el nombre.
- Las señales caducaban por reloj (brillo 9 s, ficha 16 s o 45 s, avisos 5 s) y nadie volvía a comprobar si seguían siendo verdad.
- La decisión de qué ver vivía en estados globales del add-on: no se podía probar sin Blender ni reusar en A-Frame, Maya o 3ds Max.
- Ninguna prueba con ventana hecha todavía (T-099, T-102, T-113, T-143, T-178).

**Lo que se hizo** (T-180 a T-183, `docs/motor/referencia/23_corazon.md`)

- `engine/amatista_engine/corazon/`: contrato `amatista.corazon/1`, director, andamio por herramienta, ciclo de vida de las señales, perfiles (Blender, A-Frame estables; Maya, 3ds Max borrador), extensiones en ocho puntos, ramas en JSON con herencia y kit de conformidad.
- `practices/ramas/`: `blender-principiante`, `blender-reto`, `aframe-web`.
- Add-on 7.1: `addon/amatista_blender/corazon/` (adaptador de Blender y puente); el guion le pasa cada reporte al director, la señal se comprueba cada 0,5 s y la banda ofrece «Señálalo otra vez».
- Pruebas: 30 del corazón, `probar_corazon` en Blender sin ventana, 100 alumnos simulados (99 terminan, como con el 7.0).

**Pendiente del usuario**: la prueba con ventana (T-182) y reinstalar el add-on 7.1. Sin SQL.
