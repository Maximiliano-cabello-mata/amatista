# Bitácora · 10 de octubre de 2026 · Renovación del repositorio

Pedido de Maximiliano (9 oct, 19:22Z, y 10 oct, 01:04Z): revisar toda la documentación y la mayor parte del código buscando errores y lo que ya no se alinea con lo que buscamos, y preparar un tag nuevo con commits que actualicen todo el repositorio. Pidió commits separados y claros, para leer el historial en GitKraken.

## Cómo se hizo

Cinco auditorías de solo lectura (documentación general, motor y su documentación, add-on y backend, PWA, y el resto: CI, despliegue, tablero y limpieza), y luego una corrección por área con sus pruebas. A mitad del trabajo se fusionaron en `main` el PR #25 (Motor 3.5), el #26 (Motor 3.5.1, script 011) y el #27 (auditoría educativa); se trajeron a la rama antes de seguir.

## Lo más importante que se corrigió

- **La aldea era imposible si el alumno abría primero el ejemplo**: el ejemplo creaba las colecciones «Casas» y «Techos» y las del alumno quedaban como «Casas.001». Ahora todo lo del ejemplo se llama «Ejemplo · …».
- **Tres puntos de luz empezaba solo con el piso** porque tomaba la nave de otra escena.
- **Un alumno podía calificarse contra un borrador** de práctica.
- **Los intentos sin conexión se perdían** con un 429 o un 401, y en una computadora compartida se podían enviar con la cuenta de otro alumno.
- **Una orden de la plataforma pisaba a la anterior** («Abrir en Blender» seguido de un cambio de ajustes).
- **El límite de tamaño del cuerpo se saltaba** con una petición sin Content-Length.
- **La lección no se completaba** si la práctica se abría con «Cambiar a esta práctica».
- **El motor**: varias prácticas mal escritas daban «Error interno»; ahora todas dan un error en español con la ruta del campo (se probó con unas 43,000 variantes rotas). `example.matches` aprobaba una escena vacía si no le quedaban aspectos.
- **La documentación** decía 6 prácticas, add-on 0.3.0, 38 o 41 validadores, scripts hasta 009 o 010, y el PR #25 abierto. Ahora está al 10 de octubre: 18 prácticas, Motor 3.5.1, 42 validadores, scripts 001 a 011 (siguiente libre 012).

## Pruebas

- Backend: 373. Motor y add-on (pytest): 330. Tablero: 8. Prácticas: 96 de 96 casos.
- Add-on dentro de Blender 5.0.1: RESULTADO OK (con una revisión nueva de la auditoría).
- PWA: 190 pruebas de vitest, lint y build.

## Pendiente para el usuario

- Revisar el PR y dar el OK para fusionarlo. Después de la fusión se agrega `v3.0.0-alpha.10` a `herramientas/crear-tags.sh` y se publica desde tu computadora.
- Decisiones abiertas (no se tocaron): licencia de la raíz del repositorio, la URL por defecto de la API en la PWA (hoy la IP de la VM), el nombre del servicio (`amatista-api` o `amatista-backend`, T-003), borrar `ai_tutor/`, y juntar en el tablero la cadena de tareas de despliegue.
