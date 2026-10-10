# 02 · Herramientas de línea de comandos

Cada script del repositorio: qué hace, desde dónde se ejecuta, todos sus subcomandos y opciones (leídos del `argparse` o del código real) y ejemplos. Para desarrolladores y para quien administra el servidor.

Actualizado: 10 de octubre de 2026 (main con los PR #25, #26 y #27; Amatista Motor 3.5.1)

| § | Herramienta | Se ejecuta desde |
|---|---|---|
| 1 | [`backend/herramientas/contenido.py`](#1-backendherramientascontenidopy) | `backend/` |
| 2 | [`backend/herramientas/crear_admin.py`](#2-backendherramientascrear_adminpy) | `backend/` |
| 3 | [`backend/diagnostico_oracle.py`](#3-backenddiagnostico_oraclepy) | `backend/` (en la VM) |
| 4 | [`tablero/actualizar.py`](#4-tableroactualizarpy) | raíz |
| 5 | [`herramientas/crear-tags.sh`](#5-herramientascrear-tagssh) | raíz (en tu PC) |
| 6 | [`despliegue/actualizar.sh`](#6-despliegueactualizarsh) | VM |
| 7 | [`engine/demo.py`](#7-enginedemopy) | cualquiera |
| 8 | [`engine/herramientas/run_in_blender.py`](#8-engineherramientasrun_in_blenderpy) | Blender › Scripting |
| 9 | [`addon/herramientas/construir.py`](#9-addonherramientasconstruirpy) | raíz |
| 10 | [`addon/herramientas/generar_iconos.py`](#10-addonherramientasgenerar_iconospy) | cualquiera |
| 11 | [`addon/herramientas/instalador/`](#11-addonherramientasinstalador) | dentro del paquete del alumno |
| 12 | [`frontend/scripts/ilustraciones.mjs`](#12-frontendscriptsilustracionesmjs) | `frontend/` |
| 13 | [Scripts npm del frontend](#13-scripts-npm-del-frontend) | `frontend/` |
| 14 | [`engine/herramientas/referencias.py`](#14-engineherramientasreferenciaspy) | raíz (con `bpy`) |
| 15 | [`engine/herramientas/formato_json.py`](#15-engineherramientasformato_jsonpy) | raíz |
| 16 | [`backend/herramientas/auditoria_seguridad.py`](#16-backendherramientasauditoria_seguridadpy) | `backend/` |
| 17 | [`backend/herramientas/rendimiento.py`](#17-backendherramientasrendimientopy) | `backend/` (nunca contra producción) |
| 18 | [`frontend/scripts/rendimiento.mjs`](#18-frontendscriptsrendimientomjs) | `frontend/` |
| 19 | [`backend/herramientas/verificar_licencia.py`](#19-backendherramientasverificar_licenciapy) | `backend/` (en la VM) |
| — | `backend/herramientas/migrar.py` y `engine/herramientas/practicas.py` | ver [migración](../base-de-datos/03_migracion.md) y [prácticas v3](../motor/referencia/08_practicas_v3_y_herramientas.md) |

Las herramientas de Python del backend usan la base configurada en `backend/.env` (o `DATABASE_URL` en la línea): actívalas con el venv del backend (`source venv/bin/activate`). Ver [01 · Entorno local](01_entorno_local.md).

---

## 1. `backend/herramientas/contenido.py`

Contenido de los cursos desde la terminal. Código: [`backend/herramientas/contenido.py`](../../backend/herramientas/contenido.py) (usa `backend/contenido/plantillas.py` y `backend/contenido/validacion.py`, la misma validación que el panel de administración). Sin subcomando imprime la ayuda y sale con código 2.

```text
python herramientas/contenido.py {validar,importar,exportar,nuevo-modulo,nueva-leccion,mapa,sembrar-niveles,practicas} ...
```

| Subcomando | Argumentos y opciones | ¿Base de datos? | Qué hace |
|---|---|---|---|
| `validar` | `[archivos ...]` (por defecto `../frontend/src/data/modulos/*.json`) | No | Valida cada módulo y los ids repetidos entre archivos del mismo curso. Sale con **1** si hay errores (CI y `actualizar.sh` lo usan) |
| `importar` | `[archivos ...]` (mismo defecto) | Sí | Valida todo primero (si un archivo falla no importa nada). Crea los cursos de `CURSOS_BASE` que falten (`blender_principiante`, `blender_principiante_intermedio`, `blender_intermedio`, el `blender` de la v2 y `aframe`) y los niveles de Blender que falten, y hace upsert de cada módulo. Lo que está en la base y no en el archivo no se toca (se avisa) |
| `exportar` | `modulo_id [salida]` · `--borradores` | Sí | Escribe el módulo de la base en formato de archivo (sin `salida`, lo imprime). `--borradores` incluye lecciones en borrador |
| `nuevo-modulo` | `curso numero titulo` · `--insignia NOMBRE` · `--nivel NIVEL_ID` · `--destino CARPETA` · `--forzar` | No | Crea `<curso>-modulo-<n>.json` en borrador con las 5 lecciones de la Fórmula (gancho, explora, practica, reto, jefe), id `mod_<curso>_<nnn>` y numeración de lecciones continuada. `--forzar` sobrescribe |
| `nueva-leccion` | `archivo leccion_id titulo` · `--objetivo "frase"` | No | Agrega al final del módulo una lección con la estructura de 10 pasos y su ficha (v3). Los ids no se reutilizan |
| `mapa` | `[curso]` · `--carpeta CARPETA` | No | Imprime curso › nivel › módulo › lección desde los archivos, con lo que falta en cada ficha y el total de fichas completas |
| `sembrar-niveles` | — | Sí | Crea en la base los 5 niveles de Blender que falten, en borrador |
| `practicas` | `--publicar` | Sí (Oracle con `sql/007`) | Registra en la base las prácticas de `practices/blender/` (versión nueva solo si cambió) y las enlaza con sus lecciones. `--publicar` además las publica |

Ejemplos (desde `backend/`):

```bash
python herramientas/contenido.py validar
python herramientas/contenido.py validar ../frontend/src/data/modulos/blender_principiante-modulo-1.json
python herramientas/contenido.py importar                                  # todos los módulos
python herramientas/contenido.py importar ../frontend/src/data/modulos/blender_principiante-modulo-1.json
python herramientas/contenido.py exportar mod_bp_001 ../frontend/src/data/modulos/blender_principiante-modulo-1.json --borradores
python herramientas/contenido.py nuevo-modulo blender_principiante 4 "Modelado básico" --insignia "Modeladora"
python herramientas/contenido.py nueva-leccion ../frontend/src/data/modulos/blender_principiante-modulo-4.json les_110 "Una silla" --objetivo "Construye una silla con cuatro patas"
python herramientas/contenido.py mapa blender_principiante
python herramientas/contenido.py sembrar-niveles
python herramientas/contenido.py practicas --publicar
python herramientas/contenido.py practicas --revisar   # cuáles faltan en la base o están sin publicar
```

Desde la v3.3 la API registra sola, al arrancar, los `practica.json` nuevos o cambiados de `practices/blender/` y publica los nuevos (los que el equipo dejó en borrador se quedan así). Se apaga con `AMATISTA_SINCRONIZAR_PRACTICAS=0` en `backend/.env`.

**`nueva-leccion` agrega la lección siempre al final del módulo.** La validación ya no exige que la práctica en Blender cierre el módulo (un módulo puede tener una exploración entre lecciones de teoría y la práctica de cierre; solo no se permite repetir la misma práctica), así que el archivo sigue siendo válido. Si la lección nueva debe ir antes de la práctica de cierre o del examen, muévela a mano en el JSON (o en Admin › Módulos) y vuelve a validar. El docstring de `contenido.py` y el [manual de Oracle §6](../reestructuracion/02_manual_oracle.md#6-lo-mismo-sin-oracle-sqlite-en-tu-computadora) todavía usan de ejemplo `blender-modulo-2.json`, que hoy está archivado en `frontend/src/data/modulos/archivo/`.

Salida real al 10 de octubre: `mapa blender_principiante` termina con «15 de 15 lecciones con la ficha completa» y `mapa` (todos los cursos) con «45 de 48 lecciones con la ficha completa» (las 3 de A-Frame no tienen ficha).

Formato de los módulos: [docs/plataforma/04](../plataforma/04_herramientas_de_ensenanza.md) (bloques), [docs/plataforma/02](../plataforma/02_modulos_y_practica.md) (práctica al final del módulo) y [la Fórmula](../arquitectura/2026-10-02_formula_modulos.txt). Flujo de estados `borrador → revision → publicado → archivado`: [tablero/README.md](../../tablero/README.md#flujo-de-contenido).

## 2. `backend/herramientas/crear_admin.py`

Da el rol de administrador (o profesor) a una cuenta y, si se pide, la crea. Código: [`backend/herramientas/crear_admin.py`](../../backend/herramientas/crear_admin.py).

```text
python herramientas/crear_admin.py email [--crear] [--nombre NOMBRE] [--rol {alumno,profesor,admin}]
```

| Opción | Efecto |
|---|---|
| `email` | Correo de la cuenta (se normaliza y valida) |
| `--crear` | Si no existe, la crea; pide la contraseña dos veces con `getpass` (no queda en el historial). Queda con el correo confirmado |
| `--nombre` | Nombre de la cuenta nueva (o de una existente sin nombre). Por defecto, lo que va antes de `@` |
| `--rol` | Rol asignado; por defecto `admin`. Opciones: `ROLES` de `database/modelos.py` |

Códigos de salida: 0 bien, 1 no existe sin `--crear` o error de base, 2 correo inválido. En SQLite crea las tablas si faltan.

```bash
python herramientas/crear_admin.py ana@ejemplo.com
python herramientas/crear_admin.py ana@ejemplo.com --crear --nombre "Ana López"
python herramientas/crear_admin.py profe@ejemplo.com --rol profesor
```

Alternativa sin terminal: `AMATISTA_ADMINS` ([01 §5](01_entorno_local.md#5-crear-el-primer-administrador)).

## 3. `backend/diagnostico_oracle.py`

Revisa la conexión a Oracle, muestra usuario, esquema y versión, compara las tablas y columnas reales con `ESPERADO` (lo que espera `database/modelos.py`), cuenta filas, muestra el espacio usado contra los 20 GB del Free Tier y el estado del mantenimiento (job de purga). **No modifica nada.** No tiene opciones. Código: [`backend/diagnostico_oracle.py`](../../backend/diagnostico_oracle.py).

```bash
cd ~/amatista/backend          # en la VM de producción: /home/opc/amatista/backend
source venv/bin/activate
python diagnostico_oracle.py
```

| Código | Significado |
|---|---|
| 0 | `✓ Las tablas coinciden con lo que espera el backend.` |
| 1 | No pudo conectar (con pistas según el error ORA-) o la base configurada no es Oracle (quita `DATABASE_URL`) |
| 2 | Faltan tablas o columnas: imprime cada problema y `→` qué script ejecutar (detecta, por ejemplo, «solo falta 005» o «solo falta 007») |

Funciona con `AMATISTA_APP` + `DB_ESQUEMA=ADMIN`. `backend/tests/test_esquema.py` y `test_diagnostico.py` comprueban que `ESPERADO` no se desalinee de los modelos y de los scripts SQL. Uso dentro del despliegue: [manual de Oracle v3](../reestructuracion/02_manual_oracle.md) (pasos 2 y 6).

## 4. `tablero/actualizar.py`

Genera [`KANBAN.md`](../../KANBAN.md) desde [`tablero/tareas.yml`](../../tablero/tareas.yml) y el historial de **todas** las ramas (`git log --all`), y la sección de contenido desde `frontend/src/data/modulos/*.json`. No tiene opciones; requiere PyYAML y un clon con historial.

```bash
pip install pyyaml
python tablero/actualizar.py
```

En CI lo corre `tablero.yml` y publica el resultado en `main` ([04 §8](04_pruebas_y_ci.md#8-workflow-tablero-kanban-githubworkflowstableroyml)). En tu rama **no hagas commit de `KANBAN.md`**: solo el bot lo publica en `main`. Palabras clave y campos: [05 §3](05_flujo_de_trabajo.md#3-tablero-kanban).

## 5. `herramientas/crear-tags.sh`

Crea los tags de versión anotados (o firmados con `-s` si `git config user.signingkey` existe), cada uno con la fecha de su commit. Es idempotente: los tags que ya existen se saltan. Hace `git fetch origin --tags` antes. Código: [`herramientas/crear-tags.sh`](../../herramientas/crear-tags.sh).

```bash
bash herramientas/crear-tags.sh                       # crea los que falten, localmente
bash herramientas/crear-tags.sh --reemplazar-v0.2.0   # además borra el tag local v0.2.0
git push origin --tags                                # publica (solo desde tu PC)
git push origin :refs/tags/v0.2.0                     # quita v0.2.0 de GitHub, si hiciera falta
```

| Opción | Efecto |
|---|---|
| (ninguna) | Recorre la lista `VERSIONES` (`tag|commit|título`) y crea los que falten |
| `--reemplazar-v0.2.0` | Borra localmente `v0.2.0` (apuntaba a lo mismo que `v2.0.1`) |

Falla con `✗ No encuentro el commit` si el clon es superficial (`git fetch --unshallow`). Lista actual: `v0.1.0`, `v1.0.0`, `v2.0.0`, `v2.0.1`, `v2.2.0-alpha.2` y `v3.0.0-alpha.1` a `v3.0.0-alpha.9` (alpha.9 = `255d054`, Motor 3.4, PR #24). `v2.2.0-alpha.1` se creó a mano y no está en la lista. Política de versiones: [05 §4](05_flujo_de_trabajo.md#4-tags-y-versiones).

## 6. `despliegue/actualizar.sh`

Actualiza la API en el servidor: `git fetch` + `merge --ff-only` → dependencias → `pytest` → `contenido.py validar` → reinicio del servicio → prueba de `/api/salud`. Si algo falla antes de reiniciar, vuelve al commit anterior (`git reset --keep`) sin tocar el servicio; si `/api/salud` no responde en 30 s, restaura el commit anterior y reinicia de nuevo. Código: [`despliegue/actualizar.sh`](../../despliegue/actualizar.sh).

```bash
bash /home/opc/amatista/despliegue/actualizar.sh          # rama main (VM de producción)
bash /home/opc/amatista/despliegue/actualizar.sh otra-rama
AMATISTA_SERVICIO=amatista-backend bash despliegue/actualizar.sh
```

| Parámetro / variable | Por defecto | Uso |
|---|---|---|
| `$1` (rama) | `main` | El repositorio debe estar ya en esa rama (si no, falla con `git switch <rama>`) |
| `AMATISTA_REPO` | la carpeta del repositorio donde está el script | Otra ruta del repositorio |
| `AMATISTA_SERVICIO` | `amatista-api`; si esa unidad no existe y `amatista-backend` sí, usa `amatista-backend` | Forzar la unidad systemd |
| `AMATISTA_URL_SALUD` | `http://127.0.0.1:8000/api/salud` | URL de la prueba final |

Requisitos y avisos:

- Sin cambios locales en el servidor (`git diff` limpio) o falla.
- Crea `backend/venv` si no existe e instala `requirements-dev.txt` (las pruebas lo necesitan).
- Si existe `backend/.env`, avisa que sus variables también llegan a las pruebas (las pruebas usan SQLite temporal de todos modos).
- **No aplica scripts SQL.** Los de `backend/sql/` se ejecutan a mano en Database Actions **antes** de actualizar el código que los necesita; revertir el código no revierte la base.
- Usa `sudo systemctl restart` y `sudo journalctl`.
- El encabezado del script muestra rutas de ejemplo bajo `/opt/amatista`; en la VM real el repositorio está en `/home/opc/amatista`. Como `REPO` sale de la ubicación del script, basta con ejecutar el que está dentro del repositorio.

### Otros archivos de despliegue

| Archivo | Qué es | Instalación (encabezado del archivo) |
|---|---|---|
| [`despliegue/amatista-api.service`](../../despliegue/amatista-api.service) | Unidad systemd endurecida: usuario `amatista`, repo en `/opt/amatista`, `EnvironmentFile=/etc/amatista/amatista-api.env`, uvicorn en `127.0.0.1:8000` con 1 worker y `--proxy-headers` | `sudo cp despliegue/amatista-api.service /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable --now amatista-api` |
| [`despliegue/Caddyfile`](../../despliegue/Caddyfile) | Caddy detrás de Cloudflare para `api.amatista-3d.me`: HTTPS con el certificado de origen de Cloudflare (opción A; Let's Encrypt es la opción B, sin Cloudflare), cabeceras de seguridad y proxy a `127.0.0.1:8000` | `sudo cp despliegue/Caddyfile /etc/caddy/Caddyfile && sudo caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy` (antes copia el certificado de origen a `/etc/caddy/certs/`) |

La diferencia entre esta unidad y la que corre hoy en la VM (`amatista-backend`) está en [05 §6](05_flujo_de_trabajo.md#6-despliegue-en-la-vm).

## 7. `engine/demo.py`

Demostración del motor sin Blender: carga la práctica del tren (`practices/blender/principiante/m1-tren/practica.json`), arma la escena que deja su ejemplo resuelto sin el último objeto (le falta una rueda) y muestra el reporte. Sin opciones; funciona desde cualquier carpeta.

```bash
python engine/demo.py
```

Salida real:

```text
Práctica: Tren de juguete
Progreso: 77.78%
Completada: False
Paso actual: 3 de 12

✓ Dos vagones: Tienes 2 de tipo «Vagón». Objetivo completado.
✓ Vagones alargados: Las proporciones de «vagon» están bien.
▶ Ocho ruedas: Tienes 7 de tipo «Rueda»; se necesitan al menos 8.
...
```

Útil para probar un validador o una práctica nueva: cambia la escena o la ruta de la práctica en el script. Motor: [docs/motor/referencia/01_arquitectura.md](../motor/referencia/01_arquitectura.md) y [02_formato_de_practica.md](../motor/referencia/02_formato_de_practica.md).

## 8. `engine/herramientas/run_in_blender.py`

Prueba manual del motor dentro de Blender, con la escena abierta (`capture_scene()` del adaptador `bpy`). Uso según su docstring:

1. Ajusta `PROJECT_ROOT` en el archivo.
2. Ábrelo en Blender › Scripting.
3. Pulsa *Run Script*; el reporte sale en la consola del sistema.

**Está desactualizado respecto del repositorio** (es del prototipo v0.1): `PROJECT_ROOT` se usa a la vez para importar `amatista_engine` (que vive en `engine/`) y para buscar `practices/archivo/v2/table.json` (que vive en la raíz). Con la estructura actual hay que agregar **las dos** rutas a `sys.path` / apuntar la práctica a la raíz, por ejemplo poner `PROJECT_ROOT` en la raíz del repo y agregar también `PROJECT_ROOT / "engine"` a `sys.path`. Para la práctica oficial usa `practices/archivo/v2/mesa.json`. Para probar el add-on completo dentro de Blender es más práctico [`addon/tests/en_blender.py`](04_pruebas_y_ci.md#6-add-on-dentro-de-blender-addontestsen_blenderpy) o el modo Desarrollador.

## 9. `addon/herramientas/construir.py`

Arma el add-on: copia `addon/amatista_blender/` (sin `tests` ni cachés), mete dentro el motor (`engine/amatista_engine/`) y las prácticas de `practices/blender/`, escribe `config.json` con las direcciones y comprime con fechas fijas (mismo código → mismo `.zip` y mismo hash). El backend importa este módulo para armar las descargas al vuelo (`GET /api/addon/v1/descargas/{sistema}`), así que no hay binarios en el repositorio. Código: [`addon/herramientas/construir.py`](../../addon/herramientas/construir.py).

```text
python addon/herramientas/construir.py [--sistema {windows,macos,linux}] [--servidor URL] [--plataforma URL] [--canal CANAL] [--salida CARPETA]
```

| Opción | Por defecto | Efecto |
|---|---|---|
| `--sistema` | (ninguno) | Sin él: solo la extensión `amatista-<versión>.zip`. Con él: paquete `amatista-<versión>-<sistema>.zip` con la extensión, `instalar_en_blender.py`, el lanzador del sistema y `LEEME.txt` |
| `--servidor` | `http://localhost:8000` | URL de la API que se escribe en `config.json` |
| `--plataforma` | `http://localhost:5173` | URL de la PWA |
| `--canal` | `estable` | Canal escrito en `config.json` |
| `--salida` | `<raíz>/dist` | Carpeta de salida (se crea) |

La versión sale de `addon/amatista_blender/blender_manifest.toml` (hoy `0.3.0`).

```bash
python addon/herramientas/construir.py                                    # dist/amatista-3.5.1.zip
python addon/herramientas/construir.py --sistema windows \
       --servidor https://api.ejemplo.cl --plataforma https://ejemplo.cl  # dist/amatista-3.5.1-windows.zip
```

El vínculo de un solo uso (conectar la cuenta sin pasos) solo lo agrega el backend al descargar; la terminal no lo ofrece. Documentación: [addon/README.md](../../addon/README.md) y [docs/motor/referencia/03_addon.md](../motor/referencia/03_addon.md).

## 10. `addon/herramientas/generar_iconos.py`

Genera los íconos PNG de 64 px del add-on en `addon/amatista_blender/iconos/`, sin dependencias (solo `zlib`), con los colores de la [identidad visual](../arquitectura/2026-09-28_identidad_visual_interfaz.txt). Sin opciones; sobrescribe los PNG. Haz commit de los PNG resultantes.

```bash
python addon/herramientas/generar_iconos.py
```

## 11. `addon/herramientas/instalador/`

Plantillas que `construir.py --sistema` mete en el paquete que descarga el alumno. No se ejecutan desde el repositorio (`{{VERSION}}` y `{{LANZADOR}}` se reemplazan al construir).

| Archivo | Sistema | Qué hace |
|---|---|---|
| `Instalar Amatista.bat` | Windows | Busca `blender.exe` (Archivos de programa, Steam, `PATH`, o lo pide), luego ejecuta `instalar_en_blender.py` |
| `Instalar Amatista.command` | macOS | Busca `Blender.app` en Aplicaciones (la más nueva) o la pide |
| `instalar-amatista.sh` | Linux | Busca `blender` en `PATH`, `/snap/bin`, descargas de blender.org en `~` u `/opt`, o Flatpak |
| `instalar_en_blender.py` | todos | Se corre como `blender --background --python-exit-code 9 --python instalar_en_blender.py -- amatista-X.Y.Z.zip`: comprueba Blender ≥ 4.2, instala y activa la extensión, permite el acceso en línea y guarda preferencias. Códigos: 0 instalado, 3 Blender no compatible, 4 error; última línea `AMATISTA_RESULTADO=...` |
| `LEEME.txt` | todos | Instrucciones para el alumno (instalar, instalar a mano, desinstalar) |

Los tres lanzadores aceptan `AMATISTA_BLENDER=/ruta/a/blender` para indicar el ejecutable. Para probar el instalador: arma un paquete con `--sistema linux`, descomprímelo y ejecuta `bash instalar-amatista.sh`. Guía del alumno: [docs/motor/referencia/04_instalacion_alumno.md](../motor/referencia/04_instalacion_alumno.md).

## 12. `frontend/scripts/ilustraciones.mjs`

Genera las ilustraciones low poly (SVG de polígonos planos) de las lecciones en `frontend/public/ilustraciones/`: `blender-historia.svg`, `concepto-malla.svg`, `concepto-materiales.svg`, `concepto-render.svg` y `aframe-webxr.svg`. Determinista (generador aleatorio con semilla). Sin opciones.

```bash
cd frontend && npm run ilustraciones      # = node scripts/ilustraciones.mjs
```

## 13. Scripts npm del frontend

Definidos en [`frontend/package.json`](../../frontend/package.json). Desde `frontend/`, tras `npm install` (o `npm ci`, como CI):

| Comando | Ejecuta | Para qué |
|---|---|---|
| `npm run dev` | `vite` | Desarrollo con recarga en `http://localhost:5173` (sin service worker) |
| `npm run build` | `vite build` y después `node scripts/revisar-publicacion.mjs` (`postbuild`) | Producción en `dist/` con manifest y service worker (CI lo exige). La revisión falla si `dist/` trae mapas de fuente, rutas locales, comentarios de desarrollo o secretos ([protección del código](../seguridad/02_proteccion_del_codigo.md)) |
| `npm run preview` | `vite preview` | Sirve `dist/` para probar la PWA instalada y el modo sin conexión |
| `npm run lint` | `eslint .` | ESLint (`eslint.config.js`); CI lo exige |
| `npm test` | `vitest run` | Pruebas unitarias ([04 §2](04_pruebas_y_ci.md#2-frontend-vitest)); CI lo exige |
| `npm run ilustraciones` | `node scripts/ilustraciones.mjs` | §12 |

Para Vitest en modo observador: `npx vitest`. Estructura del frontend: [frontend/README.md](../../frontend/README.md).

## 14. `engine/herramientas/referencias.py`

Construye en Blender el **modelo de referencia** de cada práctica (bloque `reference` del `practica.json`), lo califica con el propio motor (debe sacar 100 % en `figure.resembles`) y genera `referencia.jpg` (render Cycles 800×500) y `plano.svg` (tres vistas con medidas aproximadas). Actualiza `practices/blender/referencias.json`. Necesita `bpy` (Blender como módulo de Python). Detalle: [modelo de referencia](../motor/referencia/10_modelo_de_referencia.md).

| Opción | Por defecto | Qué hace |
|---|---|---|
| `practicas…` | todas con `reference` | Carpetas (`m1-tren`) o ids de las prácticas a generar |
| `--sin-render` | — | Solo arma, califica y escribe `plano.svg` (rápido, sin imagen) |
| `--muestras N` | 24 | Muestras de Cycles (más = más calidad y más tiempo) |

```bash
pip install bpy
python engine/herramientas/referencias.py m1-tren          # una práctica
python engine/herramientas/referencias.py --sin-render     # solo planos
```

## 15. `engine/herramientas/formato_json.py`

Reescribe archivos JSON con el formato compacto del repositorio (listas cortas en una línea, ancho 118) para que los cambios en las prácticas den diferencias pequeñas. Sin opciones: recibe las rutas.

```bash
python engine/herramientas/formato_json.py practices/blender/temas.json
```

## 16. `backend/herramientas/auditoria_seguridad.py`

Recorre todas las rutas de la API (las lee de FastAPI) y les manda inyección SQL (clásica, UNION y a ciegas por tiempo), XSS, recorrido de rutas, cuerpos gigantes y fuerza bruta; revisa permisos con tres identidades y las cabeceras de seguridad. Termina con código 1 si hay hallazgos altos o críticos. Detalle: [auditoría](../seguridad/01_auditoria_2026-10-05.md).

| Opción | Qué hace |
|---|---|
| `--url` | API a revisar (por defecto `http://localhost:8000`) |
| `--token-admin`, `--token-alumno` | Sesiones de cuentas **de prueba** para la matriz de permisos |
| `--salida archivo.json` | Guarda el informe |
| `--sin-tiempo` | Omite la inyección a ciegas por tiempo (más rápido) |

Bloquea cuentas a propósito (fuerza bruta): contra producción solo con cuentas de prueba, respaldo reciente y fuera de horario.

## 17. `backend/herramientas/rendimiento.py`

Pruebas de carga del backend en tres pasos. **Nunca contra producción.**

| Subcomando | Opciones | Qué hace |
|---|---|---|
| `sembrar` | `--alumnos 2000 --eventos 60000` | Crea alumnos de prueba (`rend-…`, `es_prueba = 1`) con progreso y eventos; guarda sus sesiones en `rendimiento_tokens.json` (ignorado por git) |
| `medir` | `--url`, `--concurrencia 1,10,40`, `--peticiones 200`, `--solo texto`, `--salida rendimiento.json` | Golpea cada ruta importante y anota p50, p95, p99, peticiones por segundo y errores |
| `limpiar` | — | Borra todo lo que creó `sembrar` |

## 18. `frontend/scripts/rendimiento.mjs`

Mide la PWA compilada en una computadora y en un «teléfono modesto» (CPU 4 veces más lenta y 4G lenta): FCP, LCP, TBT, CLS, fps y KB descargados. Necesita Playwright y Chromium (`CHROMIUM=ruta`). Solo lee: se puede correr contra producción.

```bash
cd frontend && npm run build && npx vite preview --port 4173 &
node scripts/rendimiento.mjs --url http://localhost:4173 --salida web.json --paginas "#/,#/panel"
```

## 19. `backend/herramientas/verificar_licencia.py`

Dice de qué cuenta salió una copia del add-on (marca de agua `licencia.json` firmada con `AMATISTA_SECRETO_FIRMA`), si la firma es válida y si los archivos son los originales. Se corre en el servidor, donde está el secreto.

```bash
python herramientas/verificar_licencia.py Amatista-Motor-3.5-windows.zip
```

