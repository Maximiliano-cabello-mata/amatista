# Requisitos de Hack4Edu y cómo los cumplimos

**Importante:** no se encontraron publicadas las bases de la edición 2026. Esta lista sale de lo que pidieron las ediciones anteriores de #hack4edu (ProFuturo, Universidad Pontificia de Salamanca y Red de Cátedras Telefónica) y de lo que nos pidieron a nosotros: **orden y evidencia comprobable de qué había antes y qué se trabaja en estos días**.

**Cuando lleguen las bases oficiales,** se agrega o se quita lo que corresponda y se marca la fecha de verificación.

Referencias de ediciones anteriores:
- en 2024 se pedía una presentación de 5 minutos o un video de 3 minutos, más el enlace al código en GitHub o GitLab ([bases 2024](https://profuturo.education/wp-content/uploads/2024/08/Bases-participacion-hack4edu-2024.pdf));
- la edición 2025 tuvo como tema la IA generativa en la educación, con premios en las categorías innovadora, impacto social y sénior ([ProFuturo 2025](https://profuturo.education/en/?p=89402)).

## Lista de verificación

| # | Requisito (probable) | Cómo lo cumplimos | Estado |
|---|---|---|---|
| 1 | **Video** | Película de 4:14 con historia, plataforma real y música de prueba ([video/pelicula/](video/pelicula/README.md)); locución opcional en `LOCUCION.md`. Si las bases piden 3 minutos, se recorta ahí | ✅ · 🟡 Confirmar duración |
| 2 | **Código público** en GitHub | `amatista` y `amatista-g7b-etl`, con licencias declaradas | ✅ |
| 3 | **Separar lo previo de lo hecho en el evento** | Etiqueta `hack4edu` en los dos repos + `git log hack4edu..main` + tablas de [README.md](README.md) | ✅ |
| 4 | **Evidencia comprobable** | Comandos con resultados: 1,542 pruebas, 58/58 prácticas, 15/15 módulos, cubo verificado en Azure | ✅ |
| 5 | **Problema educativo claro** | Aprender 3D pide cada vez más equipo (Blender 4.0 exige OpenGL 4.3); los cursos suelen estar en inglés y dar por hecha buena conexión | ✅ Ver la escena 2 del guion |
| 6 | **Impacto en contextos vulnerables** | Funciona sin conexión, ahorra datos al sincronizar, está en español, apaga sus animaciones en equipos modestos, y Geoda adapta Blender al equipo | ✅ Plataforma · 🟡 Geoda (cimientos) |
| 7 | **Uso de IA** (si el tema 2026 lo pide, como en 2025) | Goliat (asistente con reglas locales y conocimiento de G7B); modelo de costos de Geoda (aprendido, en camino); clasificación de texturas por IA (plan) | 🟡 Confirmar con las bases si es obligatorio |
| 8 | **Ética y privacidad** | Datos personales solo en Amatista; sin datos personales en Sentry; huella de equipo sin identificar; consentimiento antes de medir (T-187) | 🟡 Falta el aviso de consentimiento (T-187) |
| 9 | **Viabilidad y costo** | Corre en servicios gratuitos o de estudiante: Oracle Always Free, Cloudflare, GitHub, Azure for Students (≈$1 al mes) y MongoDB M0 | ✅ [Plan maestro de G7B](https://github.com/Maximiliano-cabello-mata/amatista-g7b-etl/blob/main/docs/PLAN_MAESTRO.md) |
| 10 | **Demo funcionando** | <https://amatista-3d.tech> en producción; recorrido de 5 minutos en [README.md](README.md#5-cómo-probar-la-plataforma-en-5-minutos) | ✅ |
| 11 | **Equipo y roles** | Por definir con las bases (formulario de inscripción) | ⬜ |
| 12 | **Presentación (pitch)** | Las 9 escenas sirven también como diapositivas (`video/fotogramas/`) | ✅ Base lista |

## Lo que falta antes de entregar

1. **Leer las bases oficiales 2026** y actualizar esta lista: duración del video, idioma, plantilla, fecha y formulario.
2. **Grabar la voz** del guion ([video/GUION.md](video/GUION.md)) y montarla sobre el primer corte, o rehacer el montaje en Canva, Visme o DaVinci con las mismas escenas.
3. **Cerrar el puente** antes del viernes 6 (T-187, T-188, T-196 a T-198): así el video puede mostrar la recomendación por equipo **funcionando**, no solo diseñada.
4. **Etiqueta de cierre** el viernes (por ejemplo `hack4edu-cierre`) en los dos repos, para que `git log hack4edu..hack4edu-cierre` sea exactamente lo hecho en el evento.
