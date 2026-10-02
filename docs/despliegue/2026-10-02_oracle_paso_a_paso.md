# Oracle paso a paso: dejar la parte SQL 100 % funcional

> Guía para hacerlo **una sola vez** en la base real (Oracle Autonomous Database, Free Tier de 20 GB) y en
> el servidor ARM de OCI. Sigue los pasos en orden; cada uno dice cómo comprobar que salió bien antes de pasar
> al siguiente. Tiempo estimado: 30 a 45 minutos.
>
> Probada el 2 de octubre de 2026 en un Oracle 26ai real (contenedor `gvenzl/oracle-free`, la misma versión de
> la Autonomous Database): base con datos del diseño 001 → 002 → 003 → 004, diagnóstico con `AMATISTA_APP`,
> importación del contenido y el recorrido completo de la API y del panel de administración (registro, fusión
> del progreso anónimo, progreso, eventos, métricas, crear, editar, publicar y mover lecciones, purga).

---

## Resumen (lo que vas a hacer)

| # | Dónde | Qué | Cómo sabes que salió bien |
|---|---|---|---|
| 0 | Servidor | Traer el código nuevo (`git pull`) | `git log -1` muestra el commit de esta guía |
| 1 | OCI | Respaldo | Tienes el respaldo o los CSV |
| 2 | Servidor | Diagnóstico inicial | Te dice qué script falta |
| 3 | Database Actions | `002` | Última consulta: las 8 tablas con `OK` |
| 4 | Database Actions | `003` | El job `AMATISTA_PURGA_DIARIA` aparece `SCHEDULED` |
| 5 | Database Actions | `004` (usuario `AMATISTA_APP`) | `AMATISTA_APP` aparece `OPEN` |
| 6 | Servidor | `backend/.env` | — |
| 7 | Servidor | Diagnóstico final | `✓ Las tablas coinciden con lo que espera el backend.` |
| 8 | Servidor | Importar el contenido | `OK … publicado` por cada módulo |
| 9 | Servidor | Reiniciar el backend y crear el primer admin | `/api/salud` dice `"motor":"oracle"` |
| 10 | Navegador | Panel de administración | `#/admin/sistema` muestra las 8 tablas con filas |

**Regla de oro: NUNCA ejecutes `001_esquema_amatista.sql` en la base real.** Borra y vuelve a crear las tablas
(perderías alumnos y progreso). Todo lo que necesitas lo agregan 002, 003 y 004 sin borrar nada.

---

## Paso 0 · Traer el código nuevo al servidor

Conéctate por SSH al servidor ARM (es la única IP que la base acepta) y actualiza el repositorio:

```bash
cd ~/amatista
git pull origin main
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

> **Importante:** usa los scripts SQL de `main` a partir del 2 de octubre de 2026. La versión anterior de `002`
> no ampliaba `SESIONES.ID` a 64 caracteres (por un error al leer el número de `VARCHAR2(64)`), e iniciar
> sesión fallaba con `ORA-12899`. Si ya ejecutaste esa versión, no pasa nada: ejecuta la nueva en el paso 3 y
> lo corrige sin borrar datos.

## Paso 1 · Respaldo

Antes de cambiar la estructura, guarda una copia:

- **Opción A:** en la consola de OCI, *Autonomous Database > tu base > Respaldos* (Backups). Si tu instancia
  permite un respaldo manual, créalo y espera a que diga *Active*. Las bases Always Free tienen además respaldos
  automáticos.
- **Opción B (siempre funciona):** en *Database Actions > SQL*, ejecuta `SELECT * FROM usuarios;` y descarga el
  resultado como CSV. Repite con `progreso_lecciones`, `sesiones` y, si existen, `logros` y `sesiones_web`.

## Paso 2 · Diagnóstico inicial

En el servidor, con el `backend/.env` que ya tienes (todavía con `ADMIN`):

```bash
cd ~/amatista/backend
source venv/bin/activate
python diagnostico_oracle.py
```

Te dice qué tablas y columnas faltan y qué script ejecutar. No modifica nada. Casos posibles:

- **Faltan columnas o tablas** → sigue con el paso 3.
- **"USUARIOS.ID es NUMBER (diseño anterior…)"** → la base viene del diseño del 27 de septiembre, con ids
  numéricos. 002 se detendrá con un mensaje. Si no hay alumnos reales, ahí sí se puede usar `001 → 002 → 003`.
  Si hay alumnos reales, no sigas: ve a la sección 5 de `backend/sql/LEEME.txt`.
- **No hay ninguna tabla** (base nueva) → `001 → 002 → 003 → 004`. Es el único caso en que 001 está permitido.

## Paso 3 · Ejecutar 002 (cuentas, roles, eventos y contenido)

1. Consola de OCI > *Autonomous Database* > tu base > **Database Actions > SQL**, entrando como **ADMIN**.
2. Abre `backend/sql/002_autenticacion_contenido_eventos.sql` (en GitHub, botón *Raw*), copia **todo** y pégalo.
3. Pulsa **"Ejecutar script" (F5)**, no "Ejecutar sentencia" (Ctrl+Enter). Los bloques PL/SQL terminan con una
   línea `/` y solo el modo script los entiende.
4. En la pestaña **Salida de script** verás una línea `OK: …` por cada cambio aplicado. Al final aparece una
   tabla de verificación: las **8 tablas** (`USUARIOS`, `SESIONES`, `PROGRESO_LECCIONES`, `LOGROS`,
   `EVENTOS_APRENDIZAJE`, `CURSOS`, `MODULOS`, `LECCIONES`) deben decir **OK**.

Si lo vuelves a ejecutar, no aparece ningún `OK:` nuevo: ya no hay nada que agregar. Es seguro repetirlo.

## Paso 4 · Ejecutar 003 (mantenimiento de los 20 GB)

Igual que el paso 3, con `backend/sql/003_mantenimiento.sql` y **F5**. Crea:

- el procedimiento `AMATISTA_PURGAR` (borra sesiones viejas y eventos de más de 400 días),
- el job diario `AMATISTA_PURGA_DIARIA` (09:15 UTC, 03:15 en hora de México),
- la vista `V_AMATISTA_ESPACIO` (cuánto de los 20 GB está en uso).

Al final de la salida verás el job con estado **SCHEDULED** y la partición `P_INICIAL` de los eventos.

## Paso 5 · Ejecutar 004 (usuario de la aplicación)

Sirve para que el backend deje de conectarse como ADMIN: si alguien obtiene `backend/.env`, solo podría leer y
escribir filas de las 8 tablas.

1. Genera una contraseña en el servidor:
   ```bash
   python3 -c "import secrets; print(secrets.token_urlsafe(18) + 'Aa1')"
   ```
   Guárdala en tu gestor de contraseñas.
2. En Database Actions pega `backend/sql/004_usuario_aplicacion.sql` y **solo en la hoja** cambia
   `'ESCRIBE_AQUI_LA_CONTRASENA'` por tu contraseña. Nunca la guardes en el archivo del repositorio.
3. **F5**. Al final debe aparecer `AMATISTA_APP` con estado **OPEN**.

Si lo repites, solo vuelve a dar los permisos (no cambia la contraseña).

## Paso 6 · Configurar `backend/.env` en el servidor

Edita `~/amatista/backend/.env` (o `/etc/amatista/amatista-api.env` si ya usas `despliegue/amatista-api.service`):

```ini
# Oracle: el backend entra como AMATISTA_APP y trabaja sobre las tablas de ADMIN
DB_USER=AMATISTA_APP
DB_PASSWORD=<la contraseña del paso 5>
DB_DSN=<la misma cadena TLS que ya usabas>
DB_ESQUEMA=ADMIN

# Tu correo: al registrarte o entrar quedas como administrador
AMATISTA_ADMINS=tu-correo@ejemplo.com

# Producción: nunca mostrar los códigos en las respuestas
AMATISTA_MOSTRAR_CODIGOS=0

# Opcional pero recomendado: correo para los códigos de confirmación y recuperación
# SMTP_HOST=smtp.ejemplo.com
# SMTP_PORT=587
# SMTP_USER=
# SMTP_PASSWORD=
# SMTP_FROM=Amatista <no-responder@ejemplo.com>

# El dominio del frontend, si no es localhost
# CORS_ORIGINS=https://amatista.pages.dev
```

`DB_ESQUEMA=ADMIN` es obligatorio con `AMATISTA_APP`: sin él, el backend busca las tablas en el esquema de
`AMATISTA_APP` y responde `ORA-00942: table or view does not exist`.

## Paso 7 · Diagnóstico final

```bash
cd ~/amatista/backend && source venv/bin/activate
python diagnostico_oracle.py
```

Debe decir:

```
✓ Conectado a Oracle … como AMATISTA_APP (esquema ADMIN).
  Tablas en el esquema: CURSOS, EVENTOS_APRENDIZAJE, LECCIONES, LOGROS, MODULOS, PROGRESO_LECCIONES, SESIONES, USUARIOS
  …
✓ Las tablas coinciden con lo que espera el backend.
```

El aviso "No se pudo leer el espacio usado (permiso)" es normal con `AMATISTA_APP`; el espacio se consulta como
ADMIN (paso 10).

## Paso 8 · Cargar el contenido en la base

Los módulos de Blender y A-Frame del repositorio pasan a las tablas `CURSOS`, `MODULOS` y `LECCIONES`:

```bash
python herramientas/contenido.py validar
python herramientas/contenido.py importar
```

Debe mostrar `OK … (creado, publicado)` por cada módulo. Se puede repetir: la segunda vez dice
`sin cambios`.

## Paso 9 · Reiniciar el backend y crear el primer administrador

```bash
sudo systemctl restart amatista-backend      # o amatista-api, según el servicio que uses
journalctl -u amatista-backend -n 30         # no debe haber errores ORA-
curl -s http://localhost:8000/api/salud      # {"estado":"ok","motor":"oracle"}
```

Luego, en la PWA, **regístrate con el correo de `AMATISTA_ADMINS`**: quedarás como administrador. Si ya tenías
cuenta, entra de nuevo o ejecuta `python herramientas/crear_admin.py tu-correo@ejemplo.com`.

## Paso 10 · Comprobar que todo funciona

En la PWA, con tu cuenta de administrador:

- `#/admin/sistema`: motor **Oracle** y las 8 tablas con su número de filas (ninguna "No existe").
- `#/admin/contenido`: Blender y A-Frame con sus módulos **Publicado**.
- `#/admin`: el resumen carga sin error.

En Database Actions (como ADMIN):

```sql
-- Espacio usado de los 20 GB (avisa si pasa del 70 %)
SELECT * FROM v_amatista_espacio ORDER BY mb DESC;

-- El job de purga está programado
SELECT job_name, state, next_run_date FROM user_scheduler_jobs;

-- Las cuentas y sus roles
SELECT email, rol, correo_confirmado, creado_en FROM usuarios WHERE email IS NOT NULL;

-- SESIONES.ID debe medir 64 (si mide 36, vuelve a ejecutar la 002 nueva)
SELECT char_length FROM user_tab_columns WHERE table_name = 'SESIONES' AND column_name = 'ID';
```

Con esto la parte SQL queda completa: tablas, restricciones, índices, purga automática, usuario con permisos
mínimos y contenido cargado.

---

## Problemas frecuentes

| Mensaje | Causa | Solución |
|---|---|---|
| `ORA-12899 … SESIONES.ID (actual: 64, máximo: 36)` al iniciar sesión | Se ejecutó la versión vieja de 002 | Ejecuta la 002 de `main` (paso 3) |
| `ORA-00942: table or view does not exist` | `DB_USER=AMATISTA_APP` sin `DB_ESQUEMA=ADMIN` | Agrega `DB_ESQUEMA=ADMIN` (paso 6) |
| `ORA-01017: invalid username/password` | Contraseña de `AMATISTA_APP` mal copiada | Revisa `DB_PASSWORD`; para cambiarla: `ALTER USER amatista_app IDENTIFIED BY "nueva";` como ADMIN |
| `ORA-20002 Escribe la contraseña…` | No cambiaste `v_password` en 004 | Escríbela en la hoja y vuelve a pulsar F5 |
| `ORA-01722` / `ORA-02267` | La base tiene ids numéricos (diseño anterior) | Sección 5 de `backend/sql/LEEME.txt` |
| `PLS-00103` o el script se detiene a la mitad | Se usó Ctrl+Enter en lugar de F5 | Vuelve a pegar el archivo completo y usa **F5** |
| El diagnóstico no conecta desde tu computadora | La ACL de la base solo acepta la IP del servidor ARM | Ejecútalo en el servidor |
| `V_AMATISTA_ESPACIO` pasa del 70 % | Muchos eventos guardados | `BEGIN amatista_purgar(p_dias_sesiones => 90, p_dias_eventos => 180); END;` + `/` (ver `LEEME.txt`, sección 7) |

Más detalle de cada script: `backend/sql/LEEME.txt`. Qué guarda cada tabla y por qué: encabezado de
`backend/sql/002_autenticacion_contenido_eventos.sql`.
