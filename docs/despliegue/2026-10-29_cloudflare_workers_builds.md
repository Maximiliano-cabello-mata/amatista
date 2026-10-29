# Cloudflare Workers Builds: por qué salió en rojo y cómo evitarlo

**Fecha:** 29 de octubre de 2026. Complementa el [despliegue público](2026-10-29_despliegue_publico_amatista_3d_tech.md).

## 1. Qué pasó

En el PR #39 (rama `docs/despliegue-publico-amatista-tech-20261029`, commit `769a82d`) el check
**«Workers Builds: amatista»** terminó en rojo a las 15:20:29 UTC. Las pruebas del repositorio
(`frontend`, `backend`, `addon-blender`) pasaron. El bot de Cloudflare comentó en el PR
**«Deploying Preview to Cloudflare… Build: Failed ❌»**, sin URL de vista previa.

Lo importante: **fue una compilación de vista previa** (rama distinta de `main`), no la de producción.
`amatista-3d.tech` se publica solo desde `main` y no se vio afectada por ese rojo.

## 2. Por qué falló

El proyecto del Worker se configuró solo en el panel de Cloudflare y **el repositorio no tenía archivo de
configuración de Wrangler** (`wrangler.jsonc` / `wrangler.toml`). Todo lo que Wrangler necesita viajaba
en el comando de producción:

```text
npx wrangler deploy --assets ./frontend/dist --compatibility-date 2026-10-19
```

Workers Builds usa **otro comando para las ramas que no son de producción** («Non-production branch
deploy command»), que por omisión es:

```text
npx wrangler versions upload
```

Ese comando no recibe `--assets` ni la fecha de compatibilidad y, sin archivo de configuración, Wrangler
no sabe qué publicar. Reproducido el 29 oct con Wrangler 4.156.0 y el `dist/` real:

```text
✘ [ERROR] Missing entry-point to Worker script or to assets directory
```

Con `wrangler.jsonc` en la raíz, el mismo comando (`versions upload --dry-run`) y `deploy --dry-run`
leen los 104 archivos de `frontend/dist` sin error.

La causa exacta queda escrita en el registro del build `71e4389a-c72a-4e2b-9381-7bf1473f6fbe`
(ver §4). Si el registro mostrara otra cosa (por ejemplo, un token de build borrado o la cuota de minutos
agotada), la configuración de abajo sigue siendo correcta y conviene igual.

## 3. Solución en el repositorio

- **`wrangler.jsonc`** en la raíz: nombre `amatista` (debe ser igual al del Worker en el panel; si no,
  Workers Builds falla), `compatibility_date` y `assets.directory = ./frontend/dist`. Así producción y
  vistas previas publican exactamente lo mismo, y la configuración vive versionada en Git en lugar de solo
  en el panel.
- **`.node-version`** con `22`: Cloudflare compila con la misma versión mayor de Node que el CI de GitHub
  (`.github/workflows/ci.yml`). Vite 8 exige Node ≥ 20.19; sin el archivo, Cloudflare usa la versión por
  omisión de su imagen de build, que puede cambiar.

El comando actual del panel (`wrangler deploy --assets … --compatibility-date …`) sigue funcionando con
el archivo presente: las opciones de la línea de comandos tienen prioridad sobre el archivo.

## 4. Qué revisar en el panel de Cloudflare

Ruta: **dash.cloudflare.com → Workers & Pages → `amatista`**.

1. **Deployments → Builds** (o el enlace «View logs» del comentario del bot): abre el build
   `71e4389a…` y mira la última línea roja del registro. Confirma la causa de §2.
2. **Settings → Build → Build configuration**, después de fusionar este cambio:
   - Build command: `cd frontend && npm ci && npm run build` (sin cambios).
   - Deploy command: `npx wrangler deploy`.
   - Non-production branch deploy command: `npx wrangler versions upload`.
   - Root directory: `/`.
3. **Settings → Build → Branch control**: rama de producción `main`. Decide si quieres builds de
   vista previa para las demás ramas:
   - **Activadas**: cada PR recibe una URL de vista previa en `workers.dev` para mirar la interfaz.
     El inicio de sesión no funcionará ahí, porque la API solo acepta el origen `amatista-3d.tech`
     (`CORS_ORIGINS`); sirve para revisar diseño, no cuentas.
   - **Desactivadas**: los PR dejan de mostrar el check de Cloudflare. Es la opción más tranquila si las
     vistas previas no se usan.
4. **Settings → Build → Variables and secrets**: `VITE_API_URL=https://api.amatista-3d.tech`. Es de
   compilación, se aplica a todas las ramas y no debe contener credenciales.
5. **Settings → Build → Build watch paths** (opcional): incluir `frontend/*`, `wrangler.jsonc` y
   `.node-version` evita compilar la PWA en commits que solo tocan documentación, el backend o el
   tablero.

## 5. Antes de la próxima actualización mayor

- Compila en tu computadora igual que Cloudflare antes de fusionar:
  `cd frontend && npm ci && VITE_API_URL=https://api.amatista-3d.tech npm run build && cd .. && npx wrangler deploy --dry-run`.
  Si esto pasa, el build de Cloudflare también debería pasar.
- Cualquier cambio de nombre del Worker, de carpeta de salida (`frontend/dist`) o de versión de Node se
  hace en `wrangler.jsonc` / `.node-version` dentro del mismo PR, no solo en el panel.
- Un check rojo de Cloudflare en un PR de rama **no** tumba la página publicada; un rojo después de
  fusionar en `main` sí significa que la versión nueva no salió (la anterior sigue en línea). En ese caso,
  **Deployments** permite volver a una versión anterior con «Rollback».
