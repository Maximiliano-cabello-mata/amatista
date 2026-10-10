# Plan de despliegue de Amatista (v3.4)

Actualizado: 5 de octubre de 2026; la fase 1 se revisó el 10 de octubre para Amatista Motor 3.5.1 y los scripts 010 y 011. Reemplaza el orden de trabajo de los documentos anteriores; los detalles de cada paso siguen en sus guías:

- [Despliegue en OCI](2026-10-04_despliegue_oci.md): VM, systemd, Caddy, SMTP, actualizar y revertir.
- [Dominio amatista-3d.me](2026-10-04_dominio_amatista-3d.md): Cloudflare, DNS, certificados, PWA en Pages.
- [Pasos en Oracle y el servidor](../../backend/sql/LEEME.txt) y la [auditoría de seguridad](../seguridad/01_auditoria_2026-10-05.md).
- [Actualizar a Motor 3.5.1](2026-10-09_correcciones_3_5_1.md): el script 011 y la comprobación del detalle del instructor.

> **Regla de oro.** El piloto del **8 de octubre** corre sobre la v2.2 tal como está. Antes de esa fecha no se toca la VM ni Oracle. Todo lo de las fases 1 a 4 es para el **9 de octubre en adelante**, en ese orden. Cada fase termina con una comprobación; si falla, no se pasa a la siguiente.

## Resumen

| Fase | Cuándo | Qué cambia | Quién | Se puede deshacer |
|---|---|---|---|---|
| 0. Preparar sin tocar la VM | Hasta el 7/10 | Cloudflare, PWA en Pages, secretos | Max, desde su PC y el navegador | Sí |
| Piloto | 8/10 | Nada | — | — |
| 1. Actualizar la plataforma | 9/10 | Código de `main` en la VM, scripts 007 a 011 y las prácticas de Motor 3.5.1 en Oracle ([sección propia](#subir-el-motor-33-a-oracle-parte-de-la-fase-1)) | Max, por SSH | Sí (`actualizar.sh` vuelve solo) |
| 2. HTTPS con el dominio | 9–10/10 | Caddy, firewall, `api.amatista-3d.me` | Max, por SSH y en OCI | Sí (volver a abrir el 8000) |
| 3. Correo y cuentas | Después de la fase 2 | SMTP, administrador, confirmación de correo | Max | Sí |
| 4. Comprobar y cerrar | Una semana después | Auditoría contra producción, HSTS, repo privado | Max | HSTS no se deshace rápido |

## Fase 0. Preparar sin tocar la VM (hasta el 7 de octubre)

1. **Fusionar el PR de hoy** (seguridad, rendimiento, Motor 3.3 y mundos por módulo) cuando lo apruebes. El servidor no cambia hasta la fase 1.
2. **Cloudflare y DNS**: pasos 1 a 3 de la [guía del dominio](2026-10-04_dominio_amatista-3d.md#antes-del-piloto-no-tocan-la-vm). Al terminar, `dig NS amatista-3d.me +short` muestra los dos `*.ns.cloudflare.com`.
3. **Registro `api`**: en Cloudflare, *DNS › Add record*: `A`, nombre `api`, valor `158.101.118.222`, **proxy activado (nube naranja)**. Hasta la fase 2 no responde (Caddy no existe todavía); es normal.
4. **PWA en Cloudflare Pages**: paso 4 de la guía del dominio, con `VITE_API_URL=https://api.amatista-3d.me`. Mientras GitHub Pages siga sirviendo el dominio, no quites su registro; el cambio de registros se hace en la fase 2.
5. **Genera el secreto de firma del add-on** en tu PC y guárdalo en tu gestor de contraseñas (se usa en la fase 1):

   ```bash
   python3 -c "import secrets; print(secrets.token_hex(32))"
   ```

6. **Tags y ramas** (desde tu PC; la nube no tiene permiso):

   ```bash
   git checkout main && git pull
   bash herramientas/crear-tags.sh          # incluye v3.0.0-alpha.5 a alpha.9
   git push origin --tags
   git push origin --delete claude/reestructuracion-niveles-9xym5f claude/project-thread-bpfcse \
     claude/amatista-engine-x71veq claude/motor-etapa-2-8z6xd8 claude/documentacion-completa-s4sztc \
     claude/motor-v3-plan-estudios-ankwl7 claude/curso-blender-unificado-8rjww7
   ```

   Después de fusionar el PR de hoy, borra también `claude/seguridad-rendimiento-motor-dd3iuh`.

**Comprobación:** la PWA abre en la dirección de Pages (`*.pages.dev`) y funciona sin conexión; el sitio de siempre sigue igual.

## Piloto (8 de octubre)

No se actualiza nada. Si algo se cae, la única acción es `sudo systemctl restart amatista-backend` y revisar `sudo journalctl -u amatista-backend -n 80 --no-pager`. Anota lo que pase en [incidencias](../incidencias/README.md).

## Fase 1. Actualizar la plataforma (9 de octubre)

Sigue el archivo de pasos del servidor (`/mnt/project-files/despliegue/2026-10-05_pasos_despliegue.md`, el mismo contenido que esta sección con los comandos exactos). En corto:

1. **Respaldo**: `python herramientas/migrar.py exportar ~/respaldos/$(date +%F)`; debe terminar con `manifiesto.json`.
2. **Oracle** (Database Actions como ADMIN, **F5**): `007_motor_practicas.sql`, `008_cursos_por_ruta.sql` y, desde el Motor 3.4 (9 de octubre), `010_enlace_blender.sql` (enlace en vivo con Blender: `ADDON_ENLACES` y `ADDON_AJUSTES`) y, desde Motor 3.5.1 (9 de octubre, PR #26), `011_detalle_instructor.sql` (la columna `ADDON_ENLACES.DETALLE`, que guarda lo que muestra el instructor). 010 y 011 se pueden dejar para después: sin ellos la plataforma funciona igual, solo sin el estado de Blender en vivo. Si aplicas 010, aplica también 011 antes de subir el backend 3.5.1 ([guía](2026-10-09_correcciones_3_5_1.md)). El siguiente libre es el **012**.
3. **Variables nuevas** en `backend/.env` (todas explicadas en `backend/.env.example`):

   ```
   AMATISTA_URL_API=http://158.101.118.222:8000
   AMATISTA_URL_PWA=<la dirección donde abres la plataforma>
   AMATISTA_SECRETO_FIRMA=<el secreto de la fase 0>
   AMATISTA_OCULTAR_DOCS=1
   ```

   `AMATISTA_OCULTAR_DOCS=1` esconde `/docs` mientras la API siga expuesta sin Caddy. `AMATISTA_ADDON_VERIFICADO` se queda en `registrar` (acepta y marca las copias modificadas); pásalo a `exigir` solo cuando todos los alumnos tengan el Motor 3.5.1.
4. **Código**: `bash /home/opc/amatista/despliegue/actualizar.sh`. El script ya resuelve los dos problemas que encontró la revisión del 4 de octubre: si la VM está en la rama local `despliegue/v3-2026-10-03` sin commits propios, se cambia sola a `main`; y si no existe la unidad `amatista-api`, reinicia `amatista-backend`.
5. **Tablas y contenido**: `python diagnostico_oracle.py` (20 tablas con 010 y 12 columnas en `ADDON_ENLACES` con 011; si falta 010 u 011, el diagnóstico dice cuál), `python herramientas/contenido.py validar` y `importar`.
6. **Prácticas**: al reiniciar, el servidor registra y actualiza las 18 prácticas solo (en la prueba sobre Oracle: «0 nuevas, 13 actualizadas»). `python herramientas/contenido.py practicas --revisar` debe decir **18 de 18**.
7. **Archivar lo viejo**: `009_archivar_blender_v2.sql` con F5.
8. **Add-on**: en la plataforma, **Mi Blender** debe ofrecer **Amatista Motor 3.5** (versión 3.5.1, PR #25 y #26). Abrir otra práctica empieza en su propia escena, «Ver el ejemplo» arma el ejemplo resuelto en otra escena y la lección muestra «Ahora en Blender» con la lista «Comparado con el ejemplo». La versión 3.5.1 necesita 011 para que ese detalle llegue a la lección. Reinstálalo en tu Blender y abre la práctica del tren: el panel muestra «Así se debe ver» con la imagen y el plano Blender se enfoca y la lección dice «Tu Blender está en esta práctica».

**Comprobación:** `curl -s http://127.0.0.1:8000/api/salud` → `{"estado":"ok","motor":"oracle"}`; `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8000/docs` → `404`; una práctica entregada desde Blender aparece calificada en el panel.

**Si falla:** `actualizar.sh` vuelve solo al commit anterior. La base no se revierte, pero ningún script borra datos; el respaldo del paso 1 se puede cargar en una base vacía con `migrar.py importar` y comprobar con `migrar.py verificar`.

## Subir el Motor 3.3 a Oracle (parte de la fase 1)

Esta sección se escribió para el Motor 3.3 y el procedimiento sigue igual con 3.5.1: las prácticas entran como filas nuevas al arrancar el servidor. El esquema sí cambió después: 3.4 agregó 010 y 3.5.1 agregó 011 (paso 2 de la fase 1).

El Motor 3.3 **no cambiaba el esquema**: no traía script SQL nuevo. Lo que cambia en Oracle son **filas**: las prácticas rehechas (tren, muñeco de nieve, cojín, puente, aldea…) entran como una versión nueva en `PRACTICAS` y quedan en el historial de `PRACTICA_VERSIONES`. El servidor lo hace solo al arrancar con el código nuevo.

1. **Antes**: respaldo (`migrar.py exportar`) y anota cómo están las prácticas hoy, en Database Actions:

   ```sql
   SELECT id, version, version_publicada, estado, actualizado_en FROM practicas ORDER BY id;
   ```

2. **Subir**: `actualizar.sh` trae el código del motor 3.3 y reinicia `amatista-backend`. Al arrancar, el registro dice cuántas prácticas son nuevas y cuántas se actualizaron:

   ```bash
   sudo journalctl -u amatista-backend -n 80 --no-pager | grep -i "prácticas"
   ```

   En la prueba sobre Oracle Free 23 salió «0 nuevas, 13 actualizadas».
3. **Comprobar**:
   - `python herramientas/contenido.py practicas --revisar` → **18 de 18** publicadas y al día.
   - La misma consulta del paso 1: las 13 prácticas cambiadas tienen `version` y `version_publicada` una más alta y `actualizado_en` de hoy.
   - `SELECT practica_id, version, version_addon, creado_en FROM practica_versiones WHERE creado_en > SYSDATE - 1 ORDER BY practica_id;` muestra una fila nueva por práctica actualizada.
   - En la plataforma, **Mi Blender** ofrece **Amatista Motor 3.3** y la práctica del tren muestra «Así se debe ver».
   - En Blender, con el add-on 3.3 instalado, entrega el tren: debe calificarse y aparecer en el panel.
4. **Qué pasa con los alumnos**: su progreso en `PROGRESO_PRACTICAS` se conserva. Un alumno que tenía el tren aprobado con las reglas viejas lo sigue teniendo aprobado; los intentos nuevos se califican con las reglas nuevas. El add-on 3.2 sigue funcionando (`AMATISTA_ADDON_VERIFICADO=registrar`), pero sin la imagen de referencia: pide a los alumnos que lo reinstalen desde Mi Blender.
5. **Si hay que volver atrás**: `actualizar.sh` regresa el código solo si fallan las pruebas o `/api/salud`. Para regresar a mano al motor 3.2, vuelve al commit anterior y reinicia: el servidor registra otra vez las prácticas del repositorio viejo como versión nueva. El historial de `PRACTICA_VERSIONES` nunca se borra.

## Fase 2. HTTPS con el dominio (9 y 10 de octubre)

Hoy la API viaja en **HTTP plano** por el puerto 8000: contraseñas y tokens cruzan Internet sin cifrar. Es el riesgo más alto que quedó en la auditoría y por eso va primero después de actualizar.

1. **Caddy**: instalación oficial para RHEL (`dnf copr enable @caddy/caddy`, comandos exactos en el archivo de pasos) y el resto en [Despliegue en OCI §8](2026-10-04_despliegue_oci.md#8-https-con-caddy) y configuración con el certificado de origen de Cloudflare (pasos 5 y 6 de la guía del dominio). El [`Caddyfile`](../../despliegue/Caddyfile) ya está listo.
2. **Firewall de OCI**: 443 solo desde los rangos de Cloudflare; **quita la regla pública del 8000**.
3. **Variables** en `backend/.env`:

   ```
   AMATISTA_URL_API=https://api.amatista-3d.me
   AMATISTA_URL_PWA=https://amatista-3d.me
   CORS_ORIGINS=https://amatista-3d.me,https://www.amatista-3d.me
   AMATISTA_PROXY_CONFIABLE=1
   ```

   `AMATISTA_PROXY_CONFIABLE=1` solo con Caddy delante y el 8000 cerrado: hace que los límites por IP usen la IP real del alumno.
4. **Unidad endurecida (opcional, recomendada)**: cambiar `amatista-backend` por [`amatista-api.service`](../../despliegue/amatista-api.service), que solo escucha en `127.0.0.1`, no puede escribir en el sistema y lee los secretos de `/etc/amatista/amatista-api.env` (root, 600). Pasos en [Despliegue en OCI §7](2026-10-04_despliegue_oci.md#7-servicio-systemd-dos-opciones). Nunca dejes las dos habilitadas.
5. **Dominio de la PWA**: en Cloudflare, quita los registros de GitHub Pages y agrega el dominio propio en Pages (paso 4 de la guía del dominio).
6. **Add-on**: vuelve a descargarlo desde la plataforma; el instalador nuevo trae `https://api.amatista-3d.me`.

**Comprobación:** desde tu PC, `curl -s https://api.amatista-3d.me/api/salud` responde; `curl -m 5 http://158.101.118.222:8000/api/salud` **no** responde; la plataforma en `https://amatista-3d.me` inicia sesión y sincroniza.

**Si falla:** vuelve a abrir el 8000 en OCI y deja `AMATISTA_URL_API` con la IP; la PWA vieja sigue funcionando con ella.

## Fase 3. Correo y cuentas

1. SMTP en `backend/.env` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`), detalles en [Despliegue en OCI §10](2026-10-04_despliegue_oci.md#10-correo-smtp).
2. `AMATISTA_ADMINS=<tu correo>` y reinicia.
3. Con el correo funcionando: `AMATISTA_REQUIERE_CONFIRMACION=1`.

**Comprobación:** registrar una cuenta de prueba manda el correo; recuperar contraseña funciona.

## Fase 4. Comprobar contra producción y cerrar

1. **Auditoría de seguridad contra el dominio** (desde tu PC, con dos cuentas de prueba: una de administrador y una de alumno; con un respaldo reciente y fuera del horario de clases, porque manda ~1,500 peticiones y bloquea cuentas a propósito):

   ```bash
   cd backend && source venv/bin/activate
   python herramientas/auditoria_seguridad.py --url https://api.amatista-3d.me \
     --token-admin <token> --token-alumno <token> --salida auditoria_produccion.json
   ```

   Debe terminar con **0 hallazgos**, como en la prueba del 5 de octubre (1,449 ataques).
2. **Rendimiento**: `rendimiento.py` **no se corre contra producción** (su `medir` manda miles de peticiones y necesita las sesiones de prueba que crea `sembrar`). Contra producción solo se mide la web, que no escribe nada: desde `frontend/`, `CHROMIUM=<ruta de Chrome> node scripts/rendimiento.mjs --url https://amatista-3d.me --salida web_produccion.json`. El backend se mide contra una copia (respaldo de la fase 1 cargado con `migrar.py importar` en el contenedor de Oracle de las pruebas).
3. **HSTS en Cloudflare** cuando todo lleve una semana bien (6 meses, sin `preload`).
4. **Repositorio privado**: hoy es público, así que cualquiera puede leer el código del servidor y del add-on. Hazlo privado **después** de mover la PWA a Cloudflare Pages: GitHub Pages en un repositorio privado necesita un plan de pago, y Pages de Cloudflare no. Revisa antes que Cloudflare Pages siga teniendo acceso al repositorio.
5. `AMATISTA_ADDON_VERIFICADO=exigir` cuando todos los alumnos usen el Motor 3.5.1.

## Qué quedó fuera de este plan

- Usuario `AMATISTA_APP` (script 004): sigue pendiente (T-004); producción usa `ADMIN`.
- Más de un proceso de uvicorn: los límites por IP viven en memoria; con un solo proceso y las cachés nuevas, la API aguantó el catálogo de 40 peticiones simultáneas en 77 ms (p50). Ver el [informe de rendimiento](../rendimiento/2026-10-05_informe.md).
- Política de seguridad de contenido (CSP) para la PWA en Cloudflare Pages: pendiente de probar con todas las páginas antes de activarla.
