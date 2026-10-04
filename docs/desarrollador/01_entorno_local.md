# 01 · Entorno local

Cómo dejar Amatista corriendo en tu computadora: requisitos, variables de entorno, SQLite u Oracle local y el primer administrador. Para desarrolladores.

Actualizado: 4 de octubre de 2026 (main en c730c0e)

1. [Requisitos](#1-requisitos)
2. [Variables de entorno](#2-variables-de-entorno)
3. [SQLite: la opción por defecto](#3-sqlite-la-opción-por-defecto)
4. [Oracle local (opcional)](#4-oracle-local-opcional)
5. [Crear el primer administrador](#5-crear-el-primer-administrador)
6. [El add-on de Blender contra tu backend local](#6-el-add-on-de-blender-contra-tu-backend-local)

---

## 1. Requisitos

| Qué | Versión | Por qué |
|---|---|---|
| Git | cualquiera reciente | Clon completo si vas a crear tags (`crear-tags.sh` falla con un clon superficial) |
| Python | 3.12 (backend en CI) · 3.11+ (motor) · **3.11** para `bpy` | `ci.yml` usa 3.12 para el backend y 3.11 para el job `addon-blender`, porque `bpy==5.0.1` de PyPI es para 3.11. El [README raíz](../../README.md) pide 3.12+ |
| Node.js y npm | 22 (la de CI) | Vite 8, React 19, Vitest 5 (`frontend/package.json`) |
| Blender | 4.2 o más nuevo (5.x recomendado) | Solo si trabajas en el add-on; el instalador rechaza versiones anteriores (`instalar_en_blender.py`, `MINIMA = (4, 2, 0)`) |
| PyYAML | cualquiera | Solo para `tablero/actualizar.py` y sus pruebas (no está en `requirements-dev.txt`; CI la instala aparte) |
| Docker o Podman | — | Solo si quieres Oracle local (§4) |

Dependencias de Python: [`backend/requirements.txt`](../../backend/requirements.txt) (fastapi, uvicorn, sqlalchemy, oracledb, python-dotenv) y [`backend/requirements-dev.txt`](../../backend/requirements-dev.txt) (lo anterior más pytest y httpx). El motor (`engine/`) y el constructor del add-on no tienen dependencias propias.

## 2. Variables de entorno

Hay tres archivos de ejemplo. Se copian sin el `.example`; los `.env` reales están en `.gitignore` y nunca se suben.

### `backend/.env` (copia de [`backend/.env.example`](../../backend/.env.example))

`backend/database/conexion.py` lo carga con `load_dotenv()` al importar la conexión. Las variables que ya existen en el entorno **no** se sobrescriben: `DATABASE_URL=... uvicorn ...` en la línea gana sobre el archivo.

| Variable | Para qué | Dónde se lee |
|---|---|---|
| `DATABASE_URL` | Si existe, se usa SQLAlchemy con esa URL (SQLite en desarrollo) y se ignora todo lo de Oracle | `database/conexion.py:93` |
| `DB_USER`, `DB_PASSWORD` | Usuario de Oracle (`ADMIN` o `AMATISTA_APP` tras `sql/004`) | `conexion.py:98` |
| `DB_DSN` | Cadena de conexión completa (la TLS de OCI, o `host:puerto/servicio` para un Oracle local) | `conexion.py:33` |
| `DB_HOST`, `DB_PORT` (1522), `DB_SERVICE` | Si `DB_DSN` está vacío, se arma `tcps://host:puerto/servicio` | `conexion.py:36` |
| `DB_ESQUEMA` | Esquema dueño de las tablas si el usuario no lo es (`ALTER SESSION SET CURRENT_SCHEMA`) | `conexion.py:50` |
| `DB_POOL`, `DB_POOL_EXTRA` | Conexiones por proceso (5 + 5 por defecto) | `conexion.py` |
| `AMATISTA_ADMINS` | Correos que reciben el rol admin al registrarse o iniciar sesión | `api/auth.py:224` |
| `AMATISTA_PBKDF2_ITER` | Iteraciones de PBKDF2 (600000) | `seguridad.py:30` |
| `AMATISTA_MOSTRAR_CODIGOS=1` | **Solo desarrollo**: el código de confirmación sale en la consola y en la respuesta (`codigo_dev`) | `api/correo.py:37` |
| `AMATISTA_REQUIERE_CONFIRMACION=1` | No deja entrar sin confirmar el correo | `api/auth.py:234` |
| `AMATISTA_SIN_LIMITES=1` | Desactiva los límites por IP (429). Pruebas automáticas | `api/limites.py:72` |
| `AMATISTA_PROXY_CONFIABLE=1` | Toma la IP de `X-Forwarded-For` (solo detrás de Caddy) | `api/limites.py:76` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Envío de códigos por correo; sin `SMTP_HOST` no se envía nada | `api/correo.py:74` |
| `CORS_ORIGINS` | Orígenes extra; `localhost` en cualquier puerto ya está permitido | `main.py:42` |
| `AMATISTA_URL_API`, `AMATISTA_URL_PWA` | Direcciones públicas que el backend escribe en el add-on descargado | `api/addon.py:122` y `:133` |

Valores recomendados para trabajar en tu PC:

```dotenv
DATABASE_URL=sqlite:///./amatista_local.db
AMATISTA_ADMINS=tu-correo@ejemplo.com
AMATISTA_MOSTRAR_CODIGOS=1
```

### `frontend/.env` (copia de [`frontend/.env.example`](../../frontend/.env.example))

Una sola variable: `VITE_API_URL=http://localhost:8000` (sin barra al final). Vite la incrusta al compilar. Si la PWA se publica con https, el backend también debe ser https.

### `.env` de la raíz (copia de [`.env.example`](../../.env.example))

Solo tiene `OLLAMA_URL=http://localhost:11434`, pensado para el tutor IA. **Hoy ningún código la lee**: `ai_tutor/` solo contiene la carpeta vacía `prompts/`. Puedes omitir este archivo.

## 3. SQLite: la opción por defecto

```bash
cd backend
source venv/bin/activate
DATABASE_URL=sqlite:///./amatista_local.db uvicorn main:app --reload
```

- La ruta es relativa a la carpeta desde donde lanzas el comando: `backend/amatista_local.db` (los `*.db` están en `.gitignore`).
- En SQLite las tablas las crea el propio backend (`Base.metadata.create_all` en `main.py`, `contenido.py` y `crear_admin.py`). En Oracle **no**: allí las crean los scripts de `backend/sql/`.
- Para empezar de cero, borra el archivo `.db`.
- Las vistas y el paquete `AMATISTA_AUTOR` solo existen en Oracle. El equivalente en SQLite está en el [manual de Oracle §6](../reestructuracion/02_manual_oracle.md#6-lo-mismo-sin-oracle-sqlite-en-tu-computadora): `contenido.py mapa`, `nueva-leccion` e `importar`.

## 4. Oracle local (opcional)

Producción usa Oracle Autonomous Database (Free Tier, 20 GB) y solo acepta conexiones desde la IP de la VM (INC-008 en el [registro de incidencias](../incidencias/README.md)). Para reproducir fallas de Oracle fuera de la VM, el proyecto usa el contenedor **`gvenzl/oracle-free`**: así se probaron los scripts del 2 de octubre ([Oracle paso a paso](../despliegue/2026-10-02_oracle_paso_a_paso.md)) y la v3 (`gvenzl/oracle-free:23-slim-faststart`, [manual de Oracle v3](../reestructuracion/02_manual_oracle.md), 3 y 4 de octubre).

**Aviso:** el repositorio no trae una guía paso a paso del contenedor (INC-008 dice «guía en docs/despliegue/», pero esa carpeta solo tiene `2026-10-02_oracle_paso_a_paso.md`). Lo siguiente es una receta mínima con las opciones documentadas de la imagen; ajústala a tu equipo:

```bash
# 1. Levantar Oracle 23ai Free con un usuario de aplicación
docker run -d --name amatista-oracle -p 1521:1521 \
  -e ORACLE_PASSWORD=ClaveSys123 \
  -e APP_USER=amatista -e APP_USER_PASSWORD=ClaveApp123 \
  gvenzl/oracle-free:23-slim-faststart

# 2. Crear el esquema en orden (base vacía): 001 → 002 → 003 → 005 → 006 → 007
for s in 001_esquema_amatista 002_autenticacion_contenido_eventos 003_mantenimiento \
         005_niveles_habilidades_versiones 006_herramientas_autor 007_motor_practicas; do
  docker exec -i amatista-oracle sqlplus -s amatista/ClaveApp123@FREEPDB1 < backend/sql/$s.sql
done
```

```dotenv
# 3. backend/.env (sin DATABASE_URL)
DB_USER=amatista
DB_PASSWORD=ClaveApp123
DB_DSN=localhost:1521/FREEPDB1
```

```bash
# 4. Verificar y arrancar
cd backend && python diagnostico_oracle.py     # debe terminar con «✓ Las tablas coinciden…»
uvicorn main:app --reload                      # /api/salud → "motor": "oracle"
```

Notas:

- **`001` borra y vuelve a crear las tablas**: úsalo solo en una base vacía. En una base con datos el orden es `002 → 003 → 005 → 006 → 007` ([`backend/sql/LEEME.txt`](../../backend/sql/LEEME.txt)).
- `003` crea un job de `DBMS_SCHEDULER` y `004` crea el usuario `AMATISTA_APP`; si tu usuario no tiene permisos para eso, ejecútalos con `system` o sáltalos (no son necesarios para desarrollar).
- `DB_DSN` sin `tcps://` usa una conexión normal (el contenedor no tiene TLS); `DB_HOST`/`DB_SERVICE` siempre arman `tcps://`, así que con el contenedor usa `DB_DSN`.
- Cómo verificar cada script, el orden exacto en producción y las recetas del paquete de autor: [manual de Oracle v3](../reestructuracion/02_manual_oracle.md) y [Oracle paso a paso](../despliegue/2026-10-02_oracle_paso_a_paso.md).

## 5. Crear el primer administrador

Dos formas, ambas desde `backend/` con la misma base que usa la API (`.env` o `DATABASE_URL` en la línea):

1. **Por variable** (la cuenta se promueve al registrarse o iniciar sesión):
   ```dotenv
   AMATISTA_ADMINS=tu-correo@ejemplo.com
   ```
   Reinicia `uvicorn`, regístrate en `#/registro` (con `AMATISTA_MOSTRAR_CODIGOS=1` el código de confirmación sale en la consola) e inicia sesión.
2. **Por terminal** con [`crear_admin.py`](02_herramientas_de_linea_de_comandos.md#2-backendherramientascrear_adminpy):
   ```bash
   python herramientas/crear_admin.py tu@correo.com                       # la cuenta ya existe
   python herramientas/crear_admin.py tu@correo.com --crear --nombre "Ana" # la crea (pide la contraseña)
   python herramientas/crear_admin.py profe@correo.com --rol profesor
   ```
   Las cuentas creadas así quedan con el correo confirmado.

Con la cuenta admin abre `http://localhost:5173/#/admin`. Los roles: `profesor` lee todo el panel; `admin` además modifica ([03](03_herramientas_dentro_de_la_plataforma.md)).

## 6. El add-on de Blender contra tu backend local

1. `python addon/herramientas/construir.py` arma `dist/amatista-0.3.0.zip` con `servidor=http://localhost:8000` y `plataforma=http://localhost:5173` por defecto ([02 §9](02_herramientas_de_linea_de_comandos.md#9-addonherramientasconstruirpy)).
2. En Blender: arrastra el `.zip` a la ventana (o *Preferencias › Extensiones › Instalar desde el disco*).
3. En *Preferencias › Extensiones › Amatista* puedes cambiar **Servidor** y **Plataforma** (vacío = lo del paquete) y activar **Modo desarrollador**.
4. Vincula la cuenta desde la pestaña Amatista (N) y escribe el código en `#/vincular`.

Las prácticas deben estar registradas en tu base (`python herramientas/contenido.py practicas --publicar`). Detalle del add-on: [docs/motor/referencia/03_addon.md](../motor/referencia/03_addon.md) e [instalación del alumno](../motor/referencia/04_instalacion_alumno.md).
