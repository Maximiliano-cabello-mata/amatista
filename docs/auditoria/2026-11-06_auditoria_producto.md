# Auditoría de producto (viernes 6 de noviembre de 2026)

**Pregunta:**
- ¿Qué mejoró desde el 3 de noviembre?
- ¿Qué empeoró?
- ¿Qué está mal y por qué?
- Como producto, ¿funciona?

**Qué se auditó:** `main` en `4b8aaba`, que incluye la etiqueta `hack4edu-cierre-2026-11-05` y el expediente del acta. Se comparó con el estado del 3 de noviembre (`cb03247`, PR #62). En G7B se auditó `main` en `667f708`.

**Cómo se auditó:**
- Todas las suites de pruebas, lint y build.
- La PWA compilada (`vite preview`) con la API local en SQLite y cuentas de alumna, profesor y admin.
- Playwright en escritorio (1366×800) y celular (390×844): 13 rutas, flujos completos, uso sin conexión y servidor caído.
- `herramientas/auditoria/peso.cjs` para el peso.

**Respeto del parque cerrado:**
- No se tocó `main` ni la etiqueta sellada.
- Las correcciones van como **propuesta** en la PR de esta auditoría.
- Fusionarlas requiere levantar el cierre, según el [acta](../hack4edu/cierre/ACTA.md#regla-de-parque-cerrado).

## 1. Veredicto: ¿funciona como producto?

**Sí, en el recorrido que va a ver el jurado:**
- en línea y con el servidor de producción, que tiene el contenido en Oracle;
- la portada, los cursos, las lecciones, el Estudio 3D, Geoda, la biblioteca, el panel del profesor con su aula de demostración y Mi panel cargan sin errores de JavaScript;
- las lecciones se completan, el progreso se guarda y la app vuelve a abrir sin conexión.

**Pero la versión sellada tiene dos fallas graves que el acta no menciona:**

1. **Seguridad (crítica):**
   - cualquiera puede entrar a **cualquier cuenta, incluida la del administrador**, escribiendo solo su correo en «Continuar con Google»;
   - también funciona mandando `test_google_<correo>` a la API.
2. **Sin conexión (grave para el Reto 02):**
   - si el servidor no responde desde la primera visita, **las lecciones y los exámenes se abren vacíos**;
   - aun así se pueden «completar» y dan +100 XP;
   - pasa con el servidor caído, sin internet y en la app de escritorio usada desde una USB.

**Conclusión:** como demostración en línea, funciona. Como producto para estudiantes reales, **no debe desplegarse el backend del 5 de noviembre** sin la corrección de seguridad. Y la promesa central de «aprender sin conexión» hoy se rompe en el primer uso sin internet.

## 2. Qué mejoró (del 3 al 6 de noviembre)

| Frente | Antes (3-nov) | Ahora (6-nov) | Por qué es mejor |
|---|---|---|---|
| **Pruebas** | 400 frontend · 469 backend · 594 motor y tablero | 426 · 489 · 594, más 85 del add-on en la suite | Más cobertura, sobre todo en cuentas, profesor y seguridad |
| **Producto docente** | El profesor solo existía como rol | **Panel del profesor**: clases con código (`AMA-7K2P`), asignaciones, entregas y **recreación del modelo 3D a partir de unos 1 KB de código** | Es el primer flujo de aula completo: alumno → entrega → profesor evalúa |
| **Mantenibilidad** | Archivos de 900 a 1,500 líneas (`validacion.py`, `paneles.py`, `loader.py`, `en_blender.py`) | Separados en módulos (refactors del 5-nov guiados por CodeScene) | Cambios más chicos y revisables |
| **Rendimiento en uso** | Animaciones y 3D siempre activos | Se pausan fuera de vista (PR #63) | Primer contenido de la portada: 164 → 144 ms; del curso: 140 → 100 ms; menos CPU en equipos modestos |
| **Navegación** | Cinco pestañas | Barra simple (Cursos · Mi panel · Clase) y dock lateral de herramientas con explicación de cada una | Menos ruido; las herramientas siguen a un clic |
| **Alcance** | Amatista Cloud en el recorrido | Pasó a propuesta documentada, con ruta redirigida y API apagada por defecto | Coherente con «100 % software libre local» y con costo cero |
| **Cuentas** | Solo correo y contraseña | Enlace de confirmación directo, correo con Brevo y Google (pero ver la sección 4) | Menos fricción para entrar |
| **Transparencia** | — | **Acta, bitácora consolidada, declaración de uso de IA, historiales y manifiesto con SHA-256** | Un evaluador puede verificar qué se hizo y cuándo |
| **G7B** | PR #10 abierta; 108 pruebas en `main` | PR #10 consolidada; **122 pruebas**; OIDC; captura de contingencia | Repo ordenado y más resistente |

## 3. Qué empeoró

| Qué | 3-nov | 6-nov (`main`) | Causa |
|---|---|---|---|
| **CI de `main`** | Verde | **Roja** desde el 5-nov a las 19:44 | Error de lint en `pages/profesor/Asignacion.jsx:78` (`setState` síncrono en un efecto). Ese error hace que la CI salte las pruebas y el build del frontend. El acta lo reconoce |
| **Lecciones sin servidor** | Con contenido | **Vacías** (477 caracteres contra 5,140) | `4ebc067` (4-nov, 21:42) cambió el catálogo de arranque por `indice-modulos.json`, que no trae `contentBlocks` ni `quizData`. La lección no recupera el contenido, aunque está empaquetado en la app |
| **Precache (lo que baja al instalar)** | 1.75 MB | **2.98 MB (+70 %)** | PR #63 hizo que A-Frame (1.3 MB) quedara en un chunk llamado `visibilidad3d-*.js`. La regla que lo excluía busca `aframe-master*.js` y ya no coincide |
| **Primera visita** | Portada 300 KB · curso 326 · panel 332 | 373 · 383 · 406 KB | Más código común (Google, núcleo, panel del profesor) |
| **Seguridad de cuentas** | Sin hallazgos en la auditoría propia | **Acceso total sin contraseña** | Ver la sección 4, falla 1 |
| **Datos de G7B** | Cubo construido y verificado en Azure | **El cubo falla** (`AuthenticationFailed`, SAS vencida); Geoda deja de recibir análisis nuevo | La SAS temporal venció y el cubo todavía no usa OIDC. El acta lo reconoce |

**Mejoró en peso:**
- Estudio: 656 → 365 KB;
- biblioteca: 722 → 571 KB;
- biblioteca con un modelo abierto: 1.6 → 1.25 MB.

## 4. Qué está mal y por qué (priorizado)

| # | Gravedad | Hallazgo | Por qué pasa | Evidencia | Estado |
|--:|---|---|---|---|---|
| 1 | **Crítica** | **Cualquiera entra como cualquier usuario, también como admin** | `verificar_token_google` acepta `test_google_<correo>` sin ninguna condición. Si no hay `VITE_GOOGLE_CLIENT_ID`, el botón de Google **pide escribir un correo** y crea ese token. Además, sin `GOOGLE_CLIENT_ID` no se comprueba `aud`, y `email_verified` se calcula pero no se exige | API local: `POST /api/auth/google {"credencial":"test_google_equipo@amatista.local"}` → sesión con rol **admin**. En la interfaz: «Continuar con Google» → cuadro → correo del admin → aparece la pestaña **Admin** | **Corregido en esta PR.** Los tokens de prueba solo valen con `AMATISTA_GOOGLE_PRUEBAS=1`; sin `GOOGLE_CLIENT_ID` no se acepta ningún token real; se exige `aud` y `email_verified`; en producción no hay cuadro de correo. 5 pruebas nuevas |
| 2 | **Alta** | **Lecciones y exámenes vacíos sin servidor**, pero se pueden completar y dan XP | El catálogo inicial ligero no trae bloques ni `quizData`. `Leccion.jsx` no recupera el contenido local. Las pruebas no lo detectaron porque usan el catálogo completo | Servidor bloqueado desde el inicio: 477 caracteres y solo «Completar lección». Regresión de `4ebc067` | **Corregido en esta PR:** `conContenido()` completa la lección desde los módulos empaquetados. 3 pruebas, una de ellas recorre las 73 lecciones |
| 3 | **Alta** | **CI de `main` en rojo** | `react-hooks/set-state-in-effect` en `Asignacion.jsx` | CI 42148364560 | **Corregido en esta PR:** el efecto actualiza el estado al llegar la respuesta y el modelo se asocia a la entrega |
| 4 | Media | Precache de 2.98 MB, porque A-Frame entra en él | Vite 8 compila con rolldown, que **ignora `rollupOptions.output.manualChunks`**. Los grupos `vendor-react`, `sentrySdk` y `modulos-*` tampoco se generan; esa configuración no tiene efecto | `ls dist/assets`: no existen esos chunks; A-Frame está en `visibilidad3d-*.js` | **Corregido en esta PR:** `rolldownOptions.output.advancedChunks` lo deja en `aframe-master-*.js`. Precache: **1.70 MB**. El Estudio funciona en línea y, desde la segunda visita, sin conexión |
| 5 | Media | **Geoda se sale de la pantalla en el celular** (751 px de ancho en una pantalla de 390) | Las tarjetas del equipo (`Dato`) no tienen `min-w-0`; un nombre de GPU largo empuja la página. En Windows los nombres ANGLE siempre son largos | Playwright a 390 px | **Corregido en esta PR** (el error venía del 3-nov) |
| 6 | Baja | Mi panel se sale 21 px en el celular | El botón «Abrir interfaz del profesor (#/profesor)» es `shrink-0` y su texto es largo | Playwright a 390 px | **Corregido en esta PR** |
| 7 | Media | **G7B: el cubo no se construye** | SAS vencida; el cubo todavía no usa OIDC | Acta, CI 42097116915 | Pendiente: pasar `cubo.yml` a OIDC o renovar la SAS |
| 8 | Baja | El dock dice «Tools», en inglés | Texto fijo en `BarraLateralHerramientas.jsx:98` | Captura | Pendiente («Herramientas») |
| 9 | Baja | Cualquiera ve la interfaz del profesor sin entrar | Es el aula de demostración local (`aulaLocal.js`) y es intencional para el jurado. Como producto real, conviene pedir el rol de profesor | `#/profesor` sin sesión | Pendiente: decidirlo después de la presentación |
| 10 | Baja | El tutor de IA local llama a `http://localhost:8090` desde la web pública (`https`) | `iaLocal.js`. Los navegadores pueden bloquear las peticiones de una web pública a la red local (Private Network Access). El circuito cae a Goliat sin romperse | Código | Pendiente: documentar que el tutor local es para la app de escritorio o el modo laboratorio |
| 11 | Baja | Amatista Cloud (propuesta) quedó con el dominio `utn.mx` | El correo institucional de los alumnos es `@alumnos.utn.edu.mx`; con `utn.mx`, ningún alumno real entraría | `backend/api/nube.py:75` | Pendiente; no afecta mientras sea propuesta |
| 12 | Baja | El nombre de la etiqueta dice 05, pero apunta al commit del 6 | Decisión documentada en el acta | — | Sin acción |

## 5. Cifras

| | 3-nov | 6-nov `main` | 6-nov con esta PR |
|---|--:|--:|--:|
| Pruebas del backend | 469 | 489 | **495** |
| Pruebas del frontend | 400 | 426 | **429** |
| Motor y tablero / add-on | 594 / — | 594 / 85 | 594 / 85 |
| Biblioteca y nodo | 56 | 56 | 56 |
| G7B | 108 | 122 | 122 |
| Lint | ✓ | ✗ (1 error) | ✓ |
| Precache | 1.75 MB | 2.98 MB | **1.70 MB** |
| Lección sin servidor | con contenido | **vacía** | con contenido |
| Acceso sin contraseña vía Google | — | **sí** | no |
| Archivos versionados | 1,478 | 1,610 | — |

## 6. Recomendación

1. **Antes de la presentación del sábado:**
   - **no actualizar el backend de la VM** con el código del 5 de noviembre;
   - si ya se actualizó, **levantar el cierre solo para la falla 1**, desplegar el backend corregido y registrar la diferencia, como pide el acta.

   Mientras tanto, se puede cerrar el agujero sin desplegar código: quitar `GOOGLE_CLIENT_ID` no basta, porque los tokens `test_google_` no dependen de él. Lo único que sirve sin código nuevo es **bloquear `POST /api/auth/google` en Caddy**.
2. **En la demostración:** usarla en línea y con el servidor de producción, con su contenido en Oracle. Así las lecciones se ven con contenido. Evitar mostrar «sin conexión desde cero» o el `.exe` sin internet hasta fusionar la falla 2.
3. **Después del sábado:** fusionar esta PR completa, pasar el cubo de G7B a OIDC y resolver las bajas (6 a 11).

## 7. Lo que no se pudo verificar desde aquí

- **Producción** (`amatista-3d.tech` y la API): la red de esta sesión no la alcanza. No se sabe si la VM ya corre el backend del 5 de noviembre.
- **Google real** (sin Client ID ni cuenta de prueba), **Brevo** (sin claves) y el **tutor de IA local** (sin Ollama).
- **Windows real** para la app de escritorio.
