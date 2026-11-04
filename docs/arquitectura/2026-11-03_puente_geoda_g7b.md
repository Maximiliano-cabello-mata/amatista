# Geoda recibe G7B — puente de lectura y operación

**Estado:** entrega inicial en rama de desarrollo. El backend + la PWA necesitan fusionarse y desplegarse por separado; **no se ha desplegado esta rama en Oracle Cloud ni Cloudflare**.

## Cómo funciona

G7B publica un JSON agregado verificable en
`https://raw.githubusercontent.com/Maximiliano-cabello-mata/amatista-g7b-etl/main/publicacion/geoda.json`.

1. `backend/api/g7b.py` lo obtiene por HTTPS con límite de tamaño y timeout; valida contrato, versión, conteos y la prohibición actual de perfiles sin evidencia. La API lo cachea 15 minutos.
2. `GET /api/g7b/v1/estado` entrega a Amatista únicamente conteos de documentos y mediciones. Si el upstream falla, devuelve la última copia validada (`estado=cache`) o `sin_conexion` con `perfiles=[]` y HTTP 200.
3. `frontend/src/pages/Geoda.jsx` consulta **nuestra propia API** con el cliente HTTP existente, muestra la conexión y sigue usando reglas locales N0–N4. Si G7B está caído no bloquea la PWA.
4. Se mantiene `#/biblioteca`: las texturas 512/1K siguen dependiendo del perfil local; las prácticas, el progreso y Oracle no se modifican.

El nuevo contrato `g7b.geoda.estado/1` **no es** `g7b.perfil/1`: informa de la tubería. En esta etapa su lista de perfiles es vacía porque los datos documentales no representan FPS y las mediciones aún no autorizan recomendaciones automáticas.

## Migraciones y conflictos

**No se requiere ninguna migración Oracle en esta entrega.** El PR #50 ya propone `014_panel_del_profesor.sql`; no hay que crear otro archivo 014 ni modificar el esquema de producción por este puente. La futura caché persistente de perfiles medidos necesitará una migración con el siguiente número libre una vez resuelto #50.

## Cómo desplegar después de validar y fusionar PR

En la VM Oracle (usuario `opc`), con copia de seguridad y el servicio funcionando:

```bash
cd ~/amatista/backend
PYTHON_DOTENV_DISABLED=1 env -u AMATISTA_URL_PWA -u AMATISTA_PROXY_CONFIABLE -u AMATISTA_CREADOR venv/bin/python -m pytest -q
python diagnostico_oracle.py
bash ~/amatista/despliegue/actualizar.sh
curl -fsS http://127.0.0.1:8000/api/salud
curl -fsS http://127.0.0.1:8000/api/g7b/v1/estado
```

El script `actualizar.sh` se corrige en este PR para aislar las pruebas de `backend/.env`, **sin** aislar el diagnóstico Oracle. No aplicar el script hasta que el PR esté fusionado; no ejecutar una versión temporal sin revisar.

Después publicar la nueva compilación de `frontend` mediante **el proceso habitual de despliegue de Cloudflare** (no basta actualizar el backend). Verificar `https://amatista-3d.tech/#/geoda` y `https://api.amatista-3d.tech/api/g7b/v1/estado`.

Mientras el JSON público aún no exista, `sin_conexion` es un resultado esperado, no un fallo de la API.

## Operación 24/7

- Oracle VM: `systemctl is-enabled amatista-backend`, `systemctl is-active amatista-backend`; habilitar el servicio si procede.
- Servidor inverso Caddy, Cloudflare y dominio: verificar de extremo a extremo con HTTPS.
- G7B: procesa con GitHub Actions programadas y eventos, sin requerir una sesión de Cloud Shell; **cron no equivale a garantía de ejecución exacta**.
- Los secretos Azure SAS expiran: debe instalarse autenticación duradera (por ejemplo OIDC de GitHub con Azure) y alarmas antes de activar ingestión y publicación continua.
- Se recomienda monitorizar `/api/salud` y `/api/g7b/v1/estado` desde fuera de la VM.

Esta entrega **conecta el estado**. La siguiente conectará perfiles `g7b.perfil/1` solo tras validar mediciones de varios equipos y las acciones reversibles del add-on. No activar optimización automática aún.
