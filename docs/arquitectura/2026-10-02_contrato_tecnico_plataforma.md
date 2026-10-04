# CONTRATO TÉCNICO — Amatista v2.2 "Plataforma unificada"

> **Qué es este documento.** Especificación con la que se construyó la plataforma unificada
> (2 de octubre de 2026): tablas, API, formatos de lecciones y bloques, la Fórmula Amatista y los
> contratos del frontend. Sirve para terminar lo pendiente (ver
> `docs/bitacora/2026-10-02_estado_plataforma_unificada.txt`). Cuando el código y este documento
> difieran, manda el código; las decisiones tomadas al implementar están en esa bitácora.
>
> **Después de la v2.2:** niveles y versiones de Blender (v3, [docs/reestructuracion/](../reestructuracion/README.md)), motor de prácticas y add-on ([docs/motor/](../motor/README.md)) y la plataforma por módulos con sus herramientas ([docs/plataforma/](../plataforma/README.md)) amplían este contrato sin cambiarlo.


Idioma de código, UI, comentarios y
docs: **español** (como el resto del repo). Estilo: igual al código existente (nombres en español, comentarios
breves que explican el porqué, sin sobre-comentar).

Documentos de referencia:
- docs/arquitectura/2026-10-01_optimizacion_bd_autenticacion_y_escalabilidad.txt (BD 20 GB, auth, roles)
- docs/planeacion/2026-10-01_plan_lanzamiento.txt (plan de lanzamiento, pruebas P01–P10, métricas)

Base compartida (la usan todas las partes):
- backend/database/modelos.py — TODAS las tablas (usuarios, sesiones, progreso_lecciones, logros,
  eventos_aprendizaje, cursos, modulos, lecciones). Constantes ROLES, ESTADOS_CONTENIDO, TIPOS_EVENTO, ahora().
- backend/seguridad.py — hash_password, verificar_password, requiere_rehash, verificar_password_señuelo,
  nuevo_token, hash_token, nuevo_codigo, hash_codigo(email, codigo), codigos_iguales, normalizar_email,
  DURACION_SESION (30 días), DURACION_CODIGO (15 min), MAX_INTENTOS_CODIGO (5).
- backend/api/dependencias.py — extraer_token, sesion_de_token, usuario_opcional, usuario_requerido,
  requiere_rol(*roles), es_cuenta_registrada, resolver_alumno(db, actual, usuario_id), puede_ver_alumno.
- backend/api/comun.py — asegurar_usuario, usuario_publico(usuario) → UsuarioPublico (dict), error_bd.
- backend/main.py — incluye routers: auth (/api/auth), sesiones (heredado), progreso (/api), eventos (/api),
  admin (/api/admin), contenido (/api/contenido). Los archivos api/auth.py, api/eventos.py, api/admin.py,
  api/contenido.py son esqueletos con `router = APIRouter(prefix=..., tags=[...])`: complétalos (conserva el
  nombre `router` y el prefijo).
- backend/tests/conftest.py — fixtures `cliente` (TestClient con SQLite temporal) y `crear_cuenta(rol=...,
  email=..., password=..., es_prueba=...)` → (usuario_id, cabeceras_con_Bearer). Variables de prueba:
  AMATISTA_PBKDF2_ITER=1000, AMATISTA_SIN_LIMITES=1 (desactiva límites por IP), sin AMATISTA_ADMINS ni SMTP.

Comandos de verificación:
- Backend: `cd /home/user/amatista/backend && python -m pytest -q`
- Frontend: `cd /home/user/amatista/frontend && npm run lint && npx vite build --outDir /tmp/amatista-dist-$RANDOM`
  (usa un outDir propio en /tmp: otros agentes compilan en paralelo). `npm test` si existe (vitest).

---------------------------------------------------------------------------------------------------
## 1. Identidad y roles

- Roles: `alumno` (por defecto), `profesor` (lectura de alumnos y métricas), `admin` (todo, incl. contenido).
- Alumno anónimo: fila en USUARIOS sin password_hash, id generado en el dispositivo `alumno-<uuid>`.
- Cuentas nuevas sin id local: id `usr-<uuid4>`. El id NUNCA es el correo.
- Registro con `usuario_local_id` de un anónimo válido (existe o no existe aún, sin password, sin fusionado_en)
  → esa misma fila se convierte en la cuenta (conserva su progreso). Si el id local pertenece a una cuenta
  registrada → se ignora y se crea `usr-<uuid>`.
- Inicio de sesión con `usuario_local_id` de un anónimo con progreso → FUSIÓN: el progreso del anónimo se une al
  de la cuenta con reglas monotónicas (completada OR, puntaje MAX, intentos MAX, completada_en MIN no nulo,
  datos_ligeros: se conserva el de la cuenta salvo que esté vacío), logros se copian, eventos se reasignan al
  id de la cuenta, y la fila anónima queda con `fusionado_en = <id cuenta>` (deja de aceptar escrituras sin
  sesión: resolver_alumno responde 401).
- Admin inicial: variable `AMATISTA_ADMINS="correo1,correo2"`: al registrarse o iniciar sesión con ese correo,
  el rol pasa a `admin`. Además CLI `python herramientas/crear_admin.py correo@x` (desde backend/).
- Bloqueo: 5 contraseñas incorrectas seguidas → `bloqueado_hasta = ahora + 15 min` → 423.
- Límite por IP en memoria (api/limites.py): p. ej. 10 intentos/min en iniciar-sesion, registro, recuperar,
  reenviar-codigo → 429. `AMATISTA_SIN_LIMITES=1` lo desactiva.
- Correo: SMTP con STARTTLS (SMTP_HOST, SMTP_PORT=587, SMTP_USER, SMTP_PASSWORD, SMTP_FROM). Sin SMTP_HOST no
  se envía nada y se registra una advertencia SIN el código. Con `AMATISTA_MOSTRAR_CODIGOS=1` (solo
  desarrollo) la respuesta incluye `codigo_dev` y se registra en consola. Nunca registrar contraseñas ni tokens.
- Confirmación de correo NO es requisito para iniciar sesión, salvo `AMATISTA_REQUIERE_CONFIRMACION=1` (403).

## 2. API (todas las respuestas JSON; errores `{"detail": "mensaje en español"}`)

Token: `Authorization: Bearer <token>`. `UsuarioPublico` =
`{id, nombre, email, telefono, rol, correo_confirmado: bool, es_prueba: bool, creado_en: iso}`.

### /api/auth (api/auth.py)
- POST `/registro` {nombre 1-150, email, password 8-128, telefono? ≤25, usuario_local_id? ≤100, dispositivo? }
  → 201 `{token, usuario: UsuarioPublico, fusion: {lecciones: n}, codigo_dev?}`; 409 si el correo existe.
  Genera código propósito 'correo' y registra evento `account_created` (id uuid4, ocurrido_en ahora).
- POST `/iniciar-sesion` {email, password, usuario_local_id?, dispositivo?} → 200 `{token, usuario, fusion}`;
  401 "Correo o contraseña incorrectos." (mismo mensaje y tiempo si el correo no existe); 423 bloqueado.
  Si el hash requiere rehash, se actualiza.
- POST `/cerrar-sesion` (auth) → `{ok: true}` (activa=0).
- POST `/cerrar-todas` (auth) → `{cerradas: n}`.
- GET `/yo` (auth) → UsuarioPublico. PATCH `/yo` {nombre?, telefono?} → UsuarioPublico.
- POST `/confirmar-correo` {email, codigo} → `{ok: true, usuario}`; 400 código inválido/vencido; tras
  MAX_INTENTOS_CODIGO fallos el código se invalida. Al confirmar: correo_confirmado=1, codigo_*=NULL.
- POST `/reenviar-codigo` {email} → siempre 200 `{ok: true}` (+codigo_dev en modo dev) sin revelar si existe.
- POST `/recuperar` {email} → siempre 200 `{ok: true}`; código propósito 'password'.
- POST `/restablecer` {email, codigo, password} → `{ok: true}`; cierra todas las sesiones de esa cuenta;
  también confirma el correo (demostró acceso al buzón).
- POST `/cambiar-password` (auth) {actual, nueva} → `{ok: true}`; cierra las demás sesiones.

### Heredado: POST /api/iniciar-sesion (api/sesiones.py)
Se conserva para versiones viejas de la PWA (Laboratorio). Solo para ids anónimos: si `usuario_id`/`email`
corresponde a una cuenta registrada → 409 "Esta cuenta usa correo y contraseña: entra desde «Entrar»." Ya no
crea sesiones de autenticación válidas (el sesion_id devuelto es un uuid informativo; guarda en SESIONES
hash_token(uuid) con activa=0 o no guardes nada — lo importante: no debe servir como token Bearer).

### /api progreso (api/progreso.py)
- POST `/api/progreso` {usuario_id?, eventos: [EventoProgreso] 1..500, insignias?: [str ≤100] ≤100}
  EventoProgreso = {curso_id, leccion_id, completada=false, puntaje? 0-100, intentos=0, actualizado_en?,
  datos_ligeros?: objeto JSON o string JSON (serializado compacto ≤250 chars; si al unir con lo guardado
  pasa de 250, se guarda solo el nuevo; si el nuevo solo pasa de 250 → se ignora ese campo)}.
  Identidad: resolver_alumno. Upsert monotónico (como hoy) + completada_en (primera vez) + logros upsert.
  Todos los campos nuevos son opcionales (contratos tolerantes: PWA vieja no recibe 422).
  → `{guardados: n, insignias: n}`.
- GET `/api/progreso` (auth) → `{usuario_id, lecciones: [Fila], insignias: [{id, obtenido_en}]}`.
  Fila = {curso_id, leccion_id, completada: bool, puntaje, intentos, datos_ligeros: objeto|null,
  completada_en, actualizado_en}.
- GET `/api/progreso/{usuario_id}` → mismo formato; permiso con puede_ver_alumno (401 sin sesión para cuenta
  registrada, 403 si es otra cuenta y no es profesor/admin).

### /api eventos (api/eventos.py)
- POST `/api/eventos` {usuario_id?, eventos: [{id uuid ≤36, tipo ∈ TIPOS_EVENTO, curso_id?, leccion_id?,
  sesion_aprendizaje? ≤36, ocurrido_en (iso; si es futuro >5 min se usa ahora), version_app? ≤20, datos?
  objeto|string ≤250}] 1..200} → `{recibidos, nuevos}`. Deduplica por id (también dentro del lote).
  es_prueba se copia del usuario. Identidad: resolver_alumno (anónimos permitidos).

### /api/admin (api/admin.py) — profesor y admin leen; solo admin modifica
- GET `/resumen?dias=7` → `{generado_en, periodo:{desde,hasta}, usuarios:{total, registrados, anonimos,
  confirmados, por_rol:{alumno,profesor,admin}, de_prueba}, registros_periodo, activaciones_periodo,
  activos_semanales, lecciones_completadas:{total, periodo}, actividades_periodo, retencion_semana2:
  {numerador, denominador, porcentaje|null}, serie_diaria:[{fecha:'YYYY-MM-DD', activos, completadas,
  registros}] (últimos 30 días), por_curso:[{curso_id, alumnos, completadas, lecciones_publicadas}],
  embudo:{registros, activaciones, activos}}`.
  Definiciones (plan sec. 9): excluir es_prueba=1 y roles profesor/admin. Activación = completó su primera
  lección (completada_en) o envió activity_submitted dentro de 7 días desde creado_en. Activo semanal =
  eventos de aprendizaje en ≥2 días distintos en la ventana y ≥1 lesson_completed o activity_submitted en la
  ventana. Calcular en Python sobre consultas acotadas por fecha (portátil SQLite/Oracle).
- GET `/usuarios?buscar=&rol=&pagina=1&por_pagina=25(max 100)&orden=reciente|nombre|actividad` →
  `{total, pagina, por_pagina, usuarios:[UsuarioPublico + {ultimo_acceso, lecciones_completadas, xp,
  anonimo: bool, fusionado_en}]}` (por defecto oculta filas fusionadas). xp = 100 por lección completada +
  puntaje.
- GET `/usuarios/{id}` → `{usuario, progreso:[Fila], insignias:[...], sesiones_activas: n,
  eventos_recientes:[{tipo, curso_id, leccion_id, ocurrido_en}] (20)}`.
- PATCH `/usuarios/{id}` (admin) {rol?, es_prueba?: bool, correo_confirmado?: bool} → UsuarioPublico;
  un admin no puede quitarse a sí mismo el rol admin (400). Cambiar rol cierra las sesiones del usuario? No:
  el rol se lee en cada petición.
- POST `/mantenimiento/purgar` (admin) {dias_sesiones=90, dias_eventos=400} → `{sesiones, eventos}` borradas
  (sesiones inactivas o vencidas o sin acceso en N días; eventos más viejos que N días).
- GET `/salud-detallada` (admin) → `{motor, tablas:{nombre: filas}, version_api}`.

### /api/contenido (api/contenido.py + contenido/validacion.py + contenido/plantillas.py)
- GET `/catalogo` (público) → `{version: str, generado_en, cursos: [CursoCatalogo]}` con cabecera ETag =
  version; `If-None-Match` igual → 304. Solo cursos `publicado`, y por curso TODOS sus módulos ordenados por
  numero: módulo `publicado` → `contenido` con sus lecciones `publicado` ordenadas; módulo borrador sin
  publicar → aparece como "Próximamente" (`contenido: null`); `archivado` → no aparece.
  CursoCatalogo = `{id, numero, titulo, subtitulo, descripcion, estado:'disponible', nivel, acento,
  recurso:{texto,url}|null, modulos:[{id, titulo, insignia, contenido: null | ModuloJSON}]}`
  ModuloJSON = `{id, title, description, estimatedTimeMinutes, order, lessons:[LeccionJSON]}` — EXACTAMENTE el
  formato de frontend/src/data/modulos/*.json → `module`. LeccionJSON es el JSON guardado en lecciones.contenido
  (con id, title, type, durationSeconds, isLocked, cover?, contentBlocks? / quizData?, replaces?).
- Admin (rol admin; profesor puede GET):
  - GET `/admin/arbol` → cursos con módulos y lecciones (metadatos + estado + version, sin contenido).
  - POST `/cursos` / PUT `/cursos/{id}`.
  - POST `/modulos` {curso_id, titulo, descripcion?, insignia?, minutos?, id?, numero?, generar_esqueleto?:
    bool} → crea en `borrador` (id por defecto `mod_<curso>_<NNN>`); con generar_esqueleto=true crea las
    lecciones borrador de la FÓRMULA (sección 4) a partir de plantillas.
  - PUT `/modulos/{id}`; POST `/modulos/{id}/publicar` (publica módulo y sus lecciones borrador válidas);
    POST `/modulos/{id}/archivar`; GET `/modulos/{id}/exportar` → `{"module": ModuloJSON + curso, insignia,
    estado}` (formato de archivo de frontend/src/data/modulos).
  - GET `/lecciones/{curso_id}/{leccion_id}` → `{meta..., leccion: LeccionJSON}`.
  - POST `/lecciones` {curso_id, modulo_id, leccion: LeccionJSON (id opcional), posicion?} → id por defecto el
    siguiente libre `les_<curso>_<NNN>` (para blender/aframe respeta prefijos existentes si es fácil).
  - PUT `/lecciones/{curso_id}/{leccion_id}` {leccion} → valida; el id del cuerpo debe coincidir; version+1.
  - POST `/lecciones/{curso_id}/{leccion_id}/publicar` | `/archivar`; POST `.../mover` {orden}.
  - POST `/validar` {leccion} → `{valida: bool, errores: [str]}` (sin guardar).
  - GET `/plantillas` → `{formula:[{paso, nombre, descripcion}], bloques:{tipo: ejemploJSON}, lecciones:
    {paso: LeccionJSON de ejemplo}}` (para el editor y para generar esqueletos).
  - Las lecciones publicadas no se borran (solo archivar). El id es inmutable.
- CLI `backend/herramientas/contenido.py` (desde backend/): `validar [archivos...]` (por defecto
  ../frontend/src/data/modulos/*.json; sale 1 si hay errores), `importar [archivos...]` (upsert en la BD
  configurada: crea cursos blender/aframe si faltan con los datos de frontend/src/data/cursos.js copiados en
  una tabla Python, módulos y lecciones como `publicado` si el JSON dice estado publicado), `exportar
  <modulo_id> [salida.json]`, `nuevo-modulo <curso> <numero> "<titulo>" [--insignia X]` (crea
  ../frontend/src/data/modulos/<curso>-modulo-<n>.json desde la fórmula, estado "borrador").

## 3. Formato de módulos y lecciones (JSON; camelCase como el existente)

Archivo `frontend/src/data/modulos/<curso>-modulo-<n>.json` → `{ "module": {...} }`. Campos nuevos de módulo
(agrégalos a los dos JSON existentes): `"curso": "blender"|"aframe"`, `"insignia": "Explorador 3D"` /
`"Arquitecto WebXR"`, `"estado": "publicado"` (o `borrador`, `revision`). `order` ya existe (= número del
módulo). El frontend carga TODOS los JSON con `import.meta.glob('./modulos/*.json', {eager: true})` y arma el
catálogo: los de estado `publicado` aparecen con contenido; los placeholders "Próximamente" de cursos.js se
mantienen como lista de títulos por número de módulo (si existe un JSON publicado con ese order, lo reemplaza).

Lección: `{id, title, slug?, type, durationSeconds?, isLocked, cover?, contentBlocks?, quizData?, replaces?:
[ids viejos], formula?: 'gancho'|'explora'|'practica'|'reto'|'jefe'}`. Tipos: theory_reading,
theory_interactive, video_lesson, code_interactive, exam (exam usa quizData {passingScore, questions}).

Bloques existentes: markdown_text, image, concept_cards, timeline, pipeline, layers, callout, code_snippet,
video_player (ver docs/arquitectura/2026-09-29_formato-lecciones.txt).

Bloques INTERACTIVOS nuevos (todos llevan `id` único en la lección y `required` opcional, por defecto true;
la lección solo se puede completar cuando todos los bloques interactivos requeridos están resueltos):
- `quiz_inline`: {id, question, options:[{id,text,isCorrect}], explanation?, required?} — 1 correcta mínimo.
- `ordering`: {id, prompt, items:[{id,text}] (orden correcto tal como se listan; se barajan al mostrar),
  explanation?, required?} — 3 a 8 items.
- `matching`: {id, prompt, pairs:[{id,left,right}], explanation?, required?} — 2 a 8 pares.
- `fill_blanks`: {id, prompt, template: "Texto con [[respuesta]] y [[otra|alternativa]]", code?: bool
  (monoespaciado), explanation?, required?} — 1 a 10 huecos; comparación sin mayúsculas ni espacios extra.
- `hotspots`: {id, src, alt, points:[{id, x 0-100, y 0-100, title, text}], required?} — se completa al abrir
  todos los puntos. 1 a 10 puntos.
- `scene_explorer`: {id, title?, primitive: sphere|box|cylinder|cone|torus|icosahedron, controls:[{param:
  'segments'|'color'|'wireframe'|'metalness'|'roughness'|'scale'|'rotationSpeed', label, type?:
  'range'|'color'|'toggle', min?, max?, step?, default?}], goal?: {param, op: '<='|'>='|'=='|'!=', value,
  text}, required?} — escena A-Frame con controles; con goal se completa al cumplirlo; sin goal al
  interactuar con todos los controles.
- `code_challenge`: {id, prompt, language:'html', starter, checks:[{selector, attr?, equals?, contains?,
  min?(cantidad de elementos), text}], solution?, preview?: bool, required?} — los checks se evalúan con
  DOMParser sobre el código; con preview muestra la escena A-Frame en vivo (reutiliza VistaAFrame).
Resultado de un bloque interactivo hacia la lección: `alCompletar({correcto: bool, intentos: n})`.

## 4. LA FÓRMULA AMATISTA (diseño de módulos)

Cada módulo sigue 5 pasos (campo `formula` de cada lección) — "Ciclo del Cristal":
1. `gancho` (2–4 min): pregunta/reto visual que despierta curiosidad (hotspots, quiz_inline, image).
2. `explora` (5–8 min): descubrir el concepto manipulando (scene_explorer, concept_cards, matching).
3. `practica` (6–10 min): aplicar guiado con retroalimentación inmediata (ordering, fill_blanks,
   code_challenge con checks).
4. `reto` (8–15 min): mini proyecto/creación propia con criterio de logro (code_challenge abierto o
   instrucciones Blender + evidencia/checklist).
5. `jefe` (examen final, exam con passingScore 80): desbloquea la insignia del módulo.
Gamificación: XP (100 por lección + puntaje de examen + 10 por actividad perfecta), niveles, racha diaria,
insignias por módulo, "Nuevo contenido" cuando un módulo crece. Ritmo: una idea por lección, ≤ 10 min,
siempre una interacción cada ~2 bloques de texto.

## 5. Frontend — estado y contratos

Rutas por hash (src/rutas.js): `#/` inicio · `#/panel` panel del alumno · `#/curso/:c` ·
`#/curso/:c/leccion/:l` · `#/laboratorio` · `#/entrar` · `#/registro` · `#/confirmar` · `#/recuperar` ·
`#/perfil` · `#/admin` · `#/admin/usuarios` · `#/admin/usuarios/:id` · `#/admin/contenido` ·
`#/admin/contenido/:curso/:leccion` · `#/admin/contenido/nueva/:modulo` (nombres de página en analizarRuta:
inicio, panel, curso, leccion, laboratorio, entrar, registro, confirmar, recuperar, perfil, admin — admin
recibe `seccion` y `params`).

`src/services/api.js` exporta: `API_URL`, `sincronizacionDisponible()`, `pedirJSON(ruta, {metodo='GET',
cuerpo, token, espera=8000, cabeceras})` → `{ok, status, datos, error}` (nunca lanza; error en español),
`consultarSalud()`, `iniciarSesionBD` (heredado), auth: `registrar(datos)`, `iniciarSesion(datos)`,
`cerrarSesion(token)`, `obtenerYo(token)`, `actualizarYo(token, datos)`, `confirmarCorreo(email, codigo)`,
`reenviarCodigo(email)`, `recuperarCuenta(email)`, `restablecerPassword(datos)`, `cambiarPassword(token,
datos)`; progreso: `enviarProgreso({token, usuarioId, eventos, insignias})`, `descargarProgreso(token)`;
eventos: `enviarEventos({token, usuarioId, eventos})`; catálogo: `descargarCatalogo(versionPrevia)` →
`{ok, noModificado, datos}`.

Contextos (cada uno con hook en archivo .js separado como progreso/contexto.js):
- `src/auth/AuthProvider.jsx` + `src/auth/contexto.js` → `useAuth()` = `{usuario|null, token|null,
  listo: bool, esAdmin, esProfesor (profesor o admin), registrar(datos), iniciarSesion(datos),
  cerrarSesion(), confirmarCorreo(codigo), reenviarCodigo(), recuperar(email), restablecer(datos),
  actualizarPerfil(datos), cambiarPassword(datos)}` — cada acción devuelve `{ok, error?, datos?}`. La sesión
  se guarda en IndexedDB (lib/almacen, clave 'sesion'). Al montar, si hay token y conexión, valida con /yo
  (401 → limpia sesión).
- `src/catalogo/CatalogoProvider.jsx` + `src/catalogo/contexto.js` → `useCatalogo()` = `{cursos, version,
  origen: 'app'|'servidor', buscarCurso(id), actualizar()}`. Catálogo base = el empaquetado (data/cursos.js);
  si el servidor responde, se combina con `combinarCatalogos(app, servidor)` (módulo del servidor con mismo id
  reemplaza al empaquetado; módulos/cursos nuevos del servidor se agregan; ordenar por número) y se guarda en
  IndexedDB ('catalogo') para uso offline. data/cursos.js exporta funciones puras que reciben el curso.
- `src/progreso/ProgresoProvider.jsx` → `useProgreso()` = `{progreso, xp, nivel: {nivel, xpNivel,
  xpSiguiente, avance 0-1, titulo}, racha: {actual, mejor, hoy: bool}, completarLeccion(c, l, extra?),
  registrarExamen(c, l, puntaje, aprobado), registrarActividad(c, l, bloqueId, {correcto, intentos}),
  otorgarInsignia(insigniaId), registrarSesionAprendizaje(c, l), sincronizacion: {enviando, error, ultima,
  pendientes, disponible, requiereSesion}, sincronizarAhora()}`.
  Estado local v2 (migrar v1 sin perder nada): `{version: 2, alumnoId, cuentaId|null, lecciones: {"c:l":
  {completada, intentos, puntaje, actualizadoEn, completadaEn?, datos?: {a, p}}}, insignias: {id: iso},
  actividad: {"YYYY-MM-DD": n}, pendientes: [claves], insigniasPendientes: [ids], eventos: [evento
  pendiente] (máx 500)}`. Clave de almacenamiento por identidad: 'progreso' (anónimo) y
  'progreso:<cuentaId>' (cuenta). Al iniciar sesión: el servidor fusiona el anónimo (se envía
  usuario_local_id = alumnoId) → se descarga GET /api/progreso y se combina localmente (monotónico) → el
  anónimo local se reinicia con un alumnoId nuevo. Al cerrar sesión se vuelve al progreso anónimo.
  Sincronización: con token → Bearer (sin usuario_id); sin token → usuario_id anónimo. Respuesta 401 sin
  token → `requiereSesion: true` (se conserva lo local y se muestra "Inicia sesión para sincronizar").
  Eventos se envían junto con el progreso (POST /api/eventos), con id `crypto.randomUUID` (o nuevoId).
- `src/progreso/reglas.js` (puras, con pruebas vitest en src/progreso/reglas.test.js): `claveLeccion`,
  `registroLeccion`, `estaCompletada(progreso, cursoId, leccionOId)` (si recibe el objeto lección considera
  `replaces`), `estaDesbloqueada(progreso, cursoId, modulo, indice)` = índice 0 || !isLocked || esta
  completada || la anterior completada || alguna posterior del módulo completada (ACOPLE: lección insertada
  después no bloquea a quien ya avanzó), `moduloCompletado`, `resumenModulo(progreso, cursoId, modulo,
  insignias)` → `{total, completadas, nuevas (pendientes en módulo con insignia o con lecciones posteriores
  completadas), porcentaje}`, `resumenCurso(progreso, curso)` → `{total, completadas, porcentaje,
  siguiente}`, `calcularXP` (monotónico: suma todos los registros completados, aunque la lección ya no esté
  en el catálogo; +10×datos.p), `calcularNivel(xp)` (umbrales crecientes, títulos: Aprendiz, Modelador,
  Escultor, Arquitecto, Maestro del Cristal...), `calcularRacha(actividad, hoy)`, `fechaLocal(date)`.
  El % de avance SÍ se recalcula contra el catálogo vigente (si se agrega una lección, el % baja y aparece
  "Nueva"); lo completado, el XP y las insignias nunca se pierden.

Páginas: `pages/Panel.jsx` (panel del alumno), `pages/admin/Admin.jsx` (raíz del panel admin, recibe
`{seccion, params}`), páginas de cuenta en `pages/cuenta/` (Entrar, Registro, Confirmar, Recuperar, Perfil).
Diseño: reutiliza el sistema visual existente (Tailwind 4: clases corte-poly, corte-poly-sm, hexagono,
bg-superficie, text-neon, bg-amatista, text-amatista-claro, text-texto, animar-entrar, animar-flotar; fuentes
Outfit y JetBrains Mono; fondo oscuro low poly). Accesible (labels, roles, foco visible), responsive (móvil
primero), sin dependencias pesadas nuevas (gráficas en SVG propio).
