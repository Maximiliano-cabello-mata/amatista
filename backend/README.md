# Amatista · Backend

API de FastAPI que guarda las cuentas, las sesiones y el progreso de los
alumnos en Oracle Autonomous Database.

La app funciona aunque este backend esté caído: el progreso se guarda
primero en el dispositivo del alumno (IndexedDB) y se sincroniza aquí
cuando el servidor responde.

## Rutas

| Método | Ruta | Para qué |
|---|---|---|
| GET | `/` | Saber si el backend está vivo |
| GET | `/api/salud` | Comprobar que la base de datos responde (503 si no) |
| POST | `/api/auth/registro` | Crear cuenta `{nombre, email, password, telefono?, usuario_id?}` |
| POST | `/api/auth/iniciar-sesion` | Entrar `{email, password, usuario_id?}` |
| GET | `/api/auth/yo` | Datos de la cuenta de la sesión |
| POST | `/api/auth/cerrar-sesion` | Cerrar esta sesión |
| POST | `/api/auth/cerrar-todas` | Cerrar la sesión en todos los dispositivos |
| POST | `/api/auth/confirmar-correo` | Confirmar el correo `{email, codigo}` (también `/api/confirmar-correo`) |
| POST | `/api/auth/reenviar-codigo` | Mandar otro código de confirmación `{email}` |
| POST | `/api/auth/recuperar` | Mandar un código para crear contraseña nueva `{email}` |
| POST | `/api/auth/restablecer` | Contraseña nueva con el código `{email, codigo, password_nueva}` |
| POST | `/api/auth/cambiar-password` | Cambiar la contraseña `{password_actual, password_nueva}` |
| GET | `/api/admin/usuarios` | Padrón de cuentas (profesor y admin) |
| PATCH | `/api/admin/usuarios/{id}` | Cambiar rol o marcar cuenta de prueba `{rol?, es_prueba?}` (admin) |
| POST | `/api/iniciar-sesion` | Sesión heredada para alumnos anónimos `{email o usuario_id, dispositivo}` |
| POST | `/api/progreso` | Guardar progreso `{usuario_id?, eventos: [...]}` |
| GET | `/api/progreso/{usuario_id}` | Leer el progreso de un alumno |

La documentación interactiva queda en `http://<servidor>:8000/docs`.

## Cuentas y sesiones

- Las rutas que piden sesión leen el token de `Authorization: Bearer <token>`
  (o de `X-Sesion-Id`). El registro, el inicio de sesión y `/restablecer`
  devuelven ese token; en la tabla `SESIONES` solo queda su SHA-256.
  La sesión dura 30 días y se renueva sola mientras se use.
- **Sin cuenta** la app sigue funcionando: el progreso se guarda con el id
  local del dispositivo. Al registrarse con ese `usuario_id`, la cuenta se
  queda con el progreso. Al iniciar sesión con el `usuario_id` de otro
  dispositivo, su progreso se fusiona sin retroceder.
- **Con cuenta**, el progreso solo se escribe con sesión y se guarda siempre
  en la cuenta de la sesión, aunque el cuerpo diga otro `usuario_id`. Solo el
  alumno, los profesores y los administradores pueden leerlo.
- Contraseñas con PBKDF2-SHA256 (600 000 iteraciones). Tras 5 contraseñas
  incorrectas la cuenta se bloquea 15 minutos; además hay un límite de
  intentos por IP.
- Los códigos de 6 dígitos vencen en 15 minutos y se anulan tras 5 intentos.
  Sin `SMTP_HOST` el código aparece en la terminal del backend.
- **Primer administrador:** pon su correo en `AMATISTA_ADMINS` (backend/.env).
  Recibe el rol `admin` en cuanto confirma su correo. Desde ahí puede
  nombrar profesores con `PATCH /api/admin/usuarios/{id}`.

## Probar en tu computadora sin Oracle (SQLite)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements-dev.txt
DATABASE_URL=sqlite:///./amatista_local.db uvicorn main:app --reload
```

En otra terminal, `cd frontend && npm run dev`. El frontend usa
`VITE_API_URL` de `frontend/.env` (ver `frontend/.env.example`).

Pruebas automáticas: `python -m pytest`.

Las mismas pruebas corren contra Oracle (borran todas las filas: usa un
esquema de pruebas, nunca el de producción):

```bash
AMATISTA_PRUEBAS_ORACLE=1 DB_USER=... DB_PASSWORD=... DB_DSN=... python -m pytest
```

## Dejar Oracle funcionando (en el servidor ARM)

La base solo acepta conexiones desde la IP del servidor (ACL), así que
estos pasos se hacen ahí.

1. **Respaldar y actualizar.** El código que hoy corre en el servidor no
   está en el repositorio, así que primero se guarda una copia:
   ```bash
   cp -r ~/amatista/backend ~/backend_respaldo_$(date +%F)
   cd ~/amatista
   git stash --include-untracked   # aparta los cambios locales del servidor
   git pull origin main
   ```
   `git stash` no toca `backend/.env` ni `venv/` (están en `.gitignore`).
2. **Instalar dependencias:** `cd backend && source venv/bin/activate && pip install -r requirements.txt`
3. **Revisar la conexión.** Tu `backend/.env` actual sirve tal cual si tiene
   `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` y `DB_SERVICE`: el backend
   arma la conexión cifrada (`tcps`) con ellos. Si no existe, créalo con
   `cp .env.example .env`. Si falla, pega en `DB_DSN` la cadena **TLS** de la
   consola de OCI (Autonomous Database → Conexión a la base de datos).
4. **Actualizar las tablas:** abre Database Actions → SQL, pega
   `sql/002_autenticacion_y_contenido.sql` y pulsa **Ejecutar script (F5)**.
   Agrega las columnas de cuentas y las tablas nuevas **sin borrar datos**, y
   se puede repetir sin problema. En una base vacía ejecuta antes
   `sql/001_esquema_amatista.sql` (ese sí borra las tablas).
5. **Verificar:** `python diagnostico_oracle.py`. Debe terminar con
   «✓ Las tablas coinciden con lo que espera el backend».
6. **Arrancar:** `uvicorn main:app --host 0.0.0.0 --port 8000` y abre
   `http://<servidor>:8000/api/salud`. Debe responder `{"estado": "ok", "motor": "oracle"}`.

### Dejarlo como servicio (evita el error del puerto ocupado, Errno 98)

`/etc/systemd/system/amatista-backend.service`:

```ini
[Unit]
Description=Amatista API
After=network-online.target

[Service]
User=opc
WorkingDirectory=/home/opc/amatista/backend
ExecStart=/home/opc/amatista/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Cambia `opc` por tu usuario del servidor (en Ubuntu suele ser `ubuntu`). Luego:
`sudo systemctl daemon-reload && sudo systemctl enable --now amatista-backend`.
Para ver los errores: `journalctl -u amatista-backend -f`.

## Errores de Oracle frecuentes

| Error | Causa real | Solución |
|---|---|---|
| ORA-00942 table or view does not exist | La tabla no existe con ese nombre (o se creó con comillas en minúsculas) | Ejecutar el script SQL |
| ORA-01722 invalid number | Se guarda texto (correo, UUID) en una columna NUMBER | Todas las columnas de usuario son VARCHAR2 en el script |
| ORA-02267 column type incompatible with referenced column type | Llave foránea entre columnas de tipos distintos (VARCHAR2 → NUMBER) | Mismo tipo en ambos lados: lo hace el script |
| ORA-12506 / timeout | La ACL no incluye la IP desde donde te conectas | Ejecutar desde el servidor o agregar tu IP en OCI |
| Errno 104 Connection reset | Conexión sin cifrar al puerto 1522 | Usar la cadena TLS (`tcps`) |
