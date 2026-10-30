# Amatista dentro de Blender y el enlace amatista:// (add-on 5.4)

Código: `addon/amatista_blender/integracion.py` (lo que se ve en Blender) y `addon/amatista_blender/protocolo.py` (el enlace, sin `bpy`). Contexto y motivo: `docs/plataforma/14_refinamiento_y_dinamicas.md`.

## Por qué

Hasta el 5.3, todo Amatista vivía en la barra lateral de la vista 3D (tecla N), que viene cerrada. Un alumno que nunca abrió Blender no sabe que existe, y la plataforma tenía que explicarle «pulsa N › pestaña Amatista». Además, «Abrir en Blender» solo funcionaba con Blender ya abierto.

## Dónde aparece Amatista

| Lugar de Blender | Qué hay | Clase o función |
|---|---|---|
| Barra de arriba (junto a Ayuda) | Menú **Amatista**: empezar o seguir el taller, pista, «Mírame», pausa, Mi isla, ir al espacio Amatista, mostrar el panel, abrir la plataforma, la cuenta, «¿Cómo funciona Amatista?» y «Reparar “Abrir en Blender”». | `AMATISTA_MT_principal`, agregado a `TOPBAR_MT_editor_menus` |
| Cabecera de la vista 3D | Botón **Amatista · lo que toca** («Hazlo conmigo · 2 de 5», «En pausa», «¡Lograda!»). Despliega el taller entero (el mismo dibujo que `AMATISTA_PT_taller`) y, sin cuenta, «Conectar mi cuenta». | `AMATISTA_PT_rapido` (popover), agregado a `VIEW3D_HT_header` |
| Barra de estado (abajo) | «Amatista: Mover en un eje · Hazlo conmigo · 2 de 5». | `_barra_estado`, agregado a `STATUSBAR_HT_header` |
| Pestañas de espacios de trabajo | **Amatista**, junto a Layout, Modeling… Se crea duplicando Layout la primera vez y Blender pasa a ella al abrir una práctica o un taller, con la barra lateral abierta en la pestaña Amatista. | `entrar_al_espacio`, `AMATISTA_OT_espacio` |
| Preferencias › Amatista | «Amatista dentro de Blender»: espacio de trabajo sí o no, y «Reparar “Abrir en Blender”». | `ajustes.PreferenciasAmatista` (`espacio_amatista`, `protocolo_version`, `protocolo_blender`) |

`practicas.mostrar_en_amatista` (la llaman las órdenes de la plataforma y «Abrir el taller») pasa primero al espacio Amatista. Todo se quita al desactivar el add-on (`integracion.unregister`, comprobado en `addon/tests/en_blender.py › probar_integracion`).

## El enlace amatista://

1. **Registro.** El instalador llama a `protocolo.registrar(bpy.app.binary_path)` con el `protocolo.py` de la extensión recién instalada. El add-on lo vuelve a hacer al arrancar si `protocolo_version` es menor que `protocolo.VERSION` o si cambió el Blender (`protocolo_blender`), así sirve también para quien instaló arrastrando el zip. Solo toca el usuario actual:
   - Windows: `HKCU\Software\Classes\amatista` → `"…\blender-launcher.exe" -- --amatista "%1"`.
   - macOS: `~/Applications/Amatista para Blender.app` (AppleScript con `on open location`, `CFBundleURLTypes` con el esquema y `LSUIElement`), registrada con `lsregister`.
   - Linux: `~/.local/share/applications/amatista-blender.desktop` con `MimeType=x-scheme-handler/amatista;` y `xdg-mime default`. Con Flatpak, `flatpak run <id>`; con Snap, `/snap/bin/blender`.
2. **La plataforma lo abre** solo si ningún Blender abierto recibió la orden (`frontend/src/services/lanzador.js › hayQueLanzar`).
3. **Blender arranca** con `-- --amatista <dirección>`. Lo que va después de `--` Blender no lo lee: queda en `sys.argv` para el add-on.
4. **El add-on la cumple** (`integracion.orden_de_inicio` → `enlace.cumplir`) cuando ya hay ventana: abre la práctica, el taller, Mi isla o «Conoce Amatista Motor», y pasa al espacio Amatista. La orden lleva un id `inicio-<tipo>-<huella>`, así un latido no la repite.

| Dirección | Orden |
|---|---|
| `amatista://abrir` | solo abre Blender (y el espacio Amatista) |
| `amatista://practica/<id>` | `abrir_practica` |
| `amatista://taller/<id>?actividad=<id>` | `taller_abrir` |
| `amatista://isla` | `isla` |
| `amatista://recorrido/<pestana·vista·taller>` | `recorrido` con `accion: empezar` |

**Seguridad.** Cualquier página web puede pedir un `amatista://`. Por eso la dirección solo elige una actividad: los ids deben cumplir `^[A-Za-z0-9][A-Za-z0-9._:-]{0,119}$` y cualquier otra cosa se descarta (`addon/tests/test_protocolo.py › test_nunca_acepta_rutas_ni_codigo`). No hay órdenes que borren, guarden fuera de la escena de la práctica ni lean archivos.

## Probado y por probar

- Sin ventana (CI, bpy 5.0.1): registro y desregistro del menú, del botón y de la barra de estado; que se dibujan; la orden de inicio; que sin ventana no se registra el enlace ni se cambia de espacio. Duplicar Layout funciona en bpy 5.0.1 (`bpy.ops.workspace.duplicate`).
- Por probar en un equipo real (T-133, T-134): que el sistema abra Blender desde el navegador en Windows, macOS y Linux, y cómo se ven el botón y el espacio con ventana.
