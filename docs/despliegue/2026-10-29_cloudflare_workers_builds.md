# Cloudflare Workers Builds: por qué salió en rojo y cómo evitarlo

**Fecha:** 29 de octubre de 2026. Complementa el [despliegue público](2026-10-29_despliegue_publico_amatista_3d_tech.md).

## 1. Qué pasó

En el PR #39 (rama `docs/despliegue-publico-amatista-tech-20261029`, commit `769a82d`), y después en el
PR #41, el check
**«Workers Builds: amatista»** terminó en rojo a las 15:20:29 UTC. Las pruebas del repositorio
(`frontend`, `backend`, `addon-blender`) pasaron. El bot de Cloudflare comentó en el PR
**«Deploying Preview to Cloudflare… Build: Failed ❌»**, sin URL de vista previa.

Lo importante: **fue una compilación de vista previa** (rama distinta de `main`), no la de producción.
`amatista-3d.tech` se publica solo desde `main` y no se vio afectada por ese rojo.

## 2. Por qué falló (confirmado con el registro del build)

El proyecto del Worker se configuró solo en el panel de Cloudflare y **el repositorio no tenía archivo de
configuración de Wrangler** (`wrangler.jsonc`). Todo lo que Wrangler necesita viajaba en el comando de
producción:

```text
npx wrangler deploy --assets ./frontend/dist --compatibility-date 2026-10-19
```

Las ramas que no son `main` usan **otra configuración** del panel, con dos diferencias. El registro del
build fallido del PR #41 (`7768b93a…`, 29 oct 23:56 UTC) lo muestra:

1. **Comando de despliegue distinto:** `npx wrangler preview` (comando en beta de Wrangler 4). Exige un
   bloque `previews` en el archivo de configuración y, sin él, se detiene:

   ```text
   ✘ [ERROR] Your Wrangler configuration is missing a `previews` block to run this command.
   ```

2. **No hay comando de build ni variables para esas ramas:** el registro pasa de «Installing» a
   «Deploying» sin paso «Building», y «Build variables» dice «None». Aunque el comando de despliegue
   funcionara, `frontend/dist` no existiría y no habría nada que publicar.

Producción (`main`) sí compila y publica bien (build de las 00:05 UTC del 30 oct). Su único aviso fue
`Failed to match Worker name… "undefined"… expected "amatista"`, también por no tener archivo de
configuración; Cloudflare dice que intentará abrir un PR propio para corregirlo.

## 3. Solución en el repositorio

- **`wrangler.jsonc`** en la raíz: nombre `amatista` (igual al del Worker; quita el aviso del nombre),
  `compatibility_date`, `assets.directory = ./frontend/dist` y el bloque **`"previews": {}`** que pide
  `wrangler preview`. La configuración queda versionada en Git en lugar de solo en el panel.
- **`.node-version`** con `22`: Cloudflare compila con la misma versión mayor de Node que el CI de GitHub
  (`.github/workflows/ci.yml`). Vite 8 exige Node ≥ 20.19.

El comando actual de producción (`wrangler deploy --assets … --compatibility-date …`) sigue funcionando
con el archivo presente: las opciones de la línea de comandos tienen prioridad sobre el archivo.
Comprobado con `wrangler deploy --dry-run` (lee los 104 archivos de `frontend/dist`); `wrangler preview`
acepta la configuración y solo se detiene por falta de credenciales, que en Cloudflare pone el build token.

## 4. Qué cambiar en el panel de Cloudflare

Ruta: **dash.cloudflare.com → Workers & Pages → `amatista` → Settings → Build**. Lo que falta para las
ramas no se puede arreglar desde el repositorio. Elige **una** de dos opciones:

**Opción A: sin vistas previas (la más tranquila).** En **Branch control**, desactiva «Builds for
non-production branches». Los PR dejan de mostrar el check de Cloudflare y producción sigue igual.

**Opción B: con vistas previas.** Pulsa el lápiz de **Build configuration** y, en la parte de ramas que
no son de producción:

- Non-production branch build command: `cd frontend && npm ci && npm run build`.
- Non-production branch deploy command: `npx wrangler preview` (el que ya tiene) o, más estable porque no
  es beta, `npx wrangler versions upload`.
- Variables de esas ramas: `VITE_API_URL=https://api.amatista-3d.tech`.

En una vista previa (`*.workers.dev`) no se puede iniciar sesión: la API solo acepta el origen
`amatista-3d.tech` (`CORS_ORIGINS`). Sirve para revisar diseño, no cuentas.

Para producción, después de fusionar, el Deploy command puede quedar en `npx wrangler deploy` (lo demás
lo lee de `wrangler.jsonc`). No es obligatorio cambiarlo.

**Build watch paths** (opcional): incluir `frontend/*`, `wrangler.jsonc` y `.node-version` evita
compilar la PWA en commits que solo tocan documentación, el backend o el tablero.

## 5. Antes de la próxima actualización mayor

- Compila en tu computadora igual que Cloudflare antes de fusionar:
  `cd frontend && npm ci && VITE_API_URL=https://api.amatista-3d.tech npm run build && cd .. && npx wrangler deploy --dry-run`.
  Si esto pasa, el build de Cloudflare también debería pasar.
- Cualquier cambio de nombre del Worker, de carpeta de salida (`frontend/dist`) o de versión de Node se
  hace en `wrangler.jsonc` / `.node-version` dentro del mismo PR, no solo en el panel.
- Un check rojo de Cloudflare en un PR de rama **no** tumba la página publicada; un rojo después de
  fusionar en `main` sí significa que la versión nueva no salió (la anterior sigue en línea). En ese caso,
  **Deployments** permite volver a una versión anterior con «Rollback».
