# Guion del video (2:09)

Voz en off en español, tono cercano y directo. El montaje ya existe sin voz (`generar.cjs` → `salida/amatista_hack4edu_borrador.mp4`): la voz se graba con este guion y se pone encima. Si hace falta recortar a 2:00, se quitan `p_jefe` y la mitad de `e7`.

| Tiempo | Parte | En pantalla | Voz en off (sugerida) |
|---|---|---|---|
| 0:00–0:06 | `e1` título | La gema, «AMATISTA», «Aprende 3D paso a paso, en la computadora que tienes», Hack4Edu 2026 | «Esto es Amatista.» |
| 0:06–0:15 | `e2` problema | Tres razones por las que aprender 3D se complica | «Aprender 3D pide cada vez más computadora. Desde la versión 4, Blender ya no abre en muchas laptops y laboratorios escolares. Y casi todos los cursos están en inglés y suponen buena conexión.» |
| 0:15–0:23 | `e3` solución | 15 módulos · 58 prácticas · sin conexión · ≤10 minutos por lección | «Amatista enseña 3D paso a paso, en español, y funciona aunque se vaya el internet.» |
| 0:23–0:31 | `p_portada` (PWA real) | Portada viva: rótulo inferior | «Eliges qué quieres crear y sigues el camino, un paso a la vez.» |
| 0:31–0:37 | `p_curso` | Los cuatro niveles de Blender | «Del primer cubo a proyectos completos.» |
| 0:37–0:45 | `p_leccion` | Lección interactiva, desplazándose | «Cada lección dura menos de diez minutos y se aprende haciendo.» |
| 0:45–0:51 | `p_practica` | La práctica del módulo | «Y cada módulo termina con una práctica real dentro de Blender…» |
| 0:51–0:56 | `p_jefe` | El jefe final | «…y un jefe final que te da tu insignia.» |
| 0:56–1:04 | `p_estudio` | Estudio A-Frame con el sistema solar | «Con A-Frame, ese 3D llega a la web y a la realidad virtual: escribes una escena y la ves al instante.» |
| 1:04–1:13 | `e4` Blender conectado | PWA → Amatista Motor → corazón/1; 43 · 33 · 58/58 | «Nuestro add-on revisa tu escena cada medio segundo y te guía, como un profe al lado.» |
| 1:13–1:19 | `p_blender` | Página «Cómo se unen la plataforma y Blender» | «Conectar Blender a tu cuenta toma un clic.» |
| 1:19–1:29 | `e5` G7B | Geodar Radar → Azure → embudo → MongoDB (987); sonda → telemetría → cubo (3,003) | «Detrás está G7B: mide cómo corre Blender en equipos reales y reúne el conocimiento del 3D libre, con su fuente y su licencia.» |
| 1:29–1:39 | `e6` Geoda | Niveles N0–N4; el plan de un equipo N2 con «Ajustar» y «Deshacer» | «Con esas mediciones, Geoda reconoce tu equipo y ajusta Blender para que vaya fluido. Si no te gusta, lo deshaces con un clic.» |
| 1:39–1:45 | `p_panel` | Mi panel con el alumno de demostración | «Tu avance se guarda en tu equipo y se sincroniza cuando hay señal.» |
| 1:45–1:53 | `e7` ciclo | Amatista ⇄ Geoda ⇄ G7B; la regla de datos | «Cada estudiante mejora la experiencia del siguiente, y sus datos personales nunca salen de Amatista.» |
| 1:53–2:02 | `e8` evidencia | 1,542 pruebas; antes y durante Hack4Edu | «Todo es comprobable: más de mil quinientas pruebas automáticas, y una etiqueta en Git separa lo que ya teníamos de lo que construimos en Hack4Edu.» |
| 2:02–2:09 | `e9` cierre | «3D para quien aprende con lo que tiene» y los repositorios | «Amatista: 3D para quien aprende con lo que tiene.» |

## De dónde sale cada cifra

Verificadas el 3 de noviembre de 2026. Si cambian antes de entregar, se actualiza `escenas/index.html` y se vuelve a generar.

| Cifra | Fuente |
|---|---|
| 15 módulos, 58 prácticas, 43 validadores, 33 habilidades | `backend/herramientas/contenido.py validar`, `engine/herramientas/practicas.py probar`, `practices/blender/habilidades.json`, README del repo |
| 390 · 446 · 594 pruebas | `npm test` (frontend), `pytest` (backend), `pytest tablero engine/tests` |
| 112 pruebas de G7B y Geoda | `python -m pytest pruebas` en `amatista-g7b-etl` (rama de consolidación) |
| 987 documentos | Bitácora de G7B del 2 de noviembre (integración real Zyte → Azure → MongoDB) |
| 3,003 mediciones | `docs/CUBO.md` de G7B (cubo publicado y verificado en Azure el 3 de noviembre) |
| 31 fuentes | `python -m geodar mapa` en G7B |
| Blender 4.0 exige OpenGL 4.3 | Requisitos oficiales de Blender 4.0 |

## Avisos honestos

- **Alumno de demostración:** el avance de «Mi panel» (nivel 3, 1000 XP, 5 lecciones) está sembrado en el navegador para el video. El rótulo lo dice. No son datos de alumnos reales.
- **Geoda (escena 6):** el clasificador y el plan ya existen y tienen pruebas en G7B. El botón «Ajustar a mi equipo» dentro de Blender es la tarea T-188, que se cierra durante Hack4Edu. Si no está terminada al grabar, la voz debe decir «estamos construyendo», no «ya hace».
- **Música:** usar una pista con licencia libre (CC0 o CC BY, con atribución en la descripción). El montaje actual no tiene audio.
