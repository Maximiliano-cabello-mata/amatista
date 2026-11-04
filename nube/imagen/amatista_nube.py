"""Ajustes de Blender dentro de una sesión de Amatista Cloud.

Se ejecuta al abrir Blender (`blender --python amatista_nube.py`). Hace tres cosas:

1. **Rinde en un servidor sin tarjeta gráfica.** Es el perfil «mínimo» de Geoda para llvmpipe:
   vista sólida sin suavizado, subdivisión limitada y texturas de 1K como máximo.
2. **Es para aprender, no una granja de render.**
   - Los renders se limitan a 1280×720 y 32 muestras, con 2 hilos.
   - Se quita «Render Animation» del menú y de Ctrl+F12.
   - La barra de estado muestra cuánto queda de la hora.
   - Los límites duros (CPU, memoria, red y tiempo) los pone el contenedor; esto solo ordena la experiencia.
3. **No se pierde el trabajo.**
   - Guarda solo cada 2 minutos en ~/Proyectos/autoguardado.
   - 5 minutos antes del final guarda una copia en ~/Proyectos.
   - Todo lo de ~/Proyectos se descarga desde la página «Archivos» de la sesión.
"""
import os
import time

import bpy

EXPIRA = float(os.environ.get("AMATISTA_EXPIRA", "0") or 0)
PROYECTOS = os.path.expanduser("~/Proyectos")
AUTOGUARDADO = os.path.join(PROYECTOS, "autoguardado")
MAX_X, MAX_Y, MAX_MUESTRAS = 1280, 720, 32
HILOS = int(os.environ.get("AMATISTA_HILOS", "2") or 2)
_aviso_final = {"hecho": False}


def ajustar_preferencias():
    p = bpy.context.preferences
    # Vista: lo más barato que se ve bien con llvmpipe.
    for nombre, valor in (("viewport_aa", "OFF"), ("anisotropic_filter", "FILTER_0"), ("gl_texture_limit", "CLAMP_1024"),
                          ("use_region_overlap", False), ("use_online_access", False)):
        for grupo in (p.system, p.view):
            if hasattr(grupo, nombre):
                try:
                    setattr(grupo, nombre, valor)
                except (TypeError, ValueError):
                    pass
    p.view.show_splash = False
    p.edit.undo_steps = 24
    p.edit.undo_memory_limit = 384
    os.makedirs(AUTOGUARDADO, exist_ok=True)
    p.filepaths.use_auto_save_temporary_files = True
    p.filepaths.auto_save_time = 2
    p.filepaths.temporary_directory = AUTOGUARDADO
    p.filepaths.use_file_compression = True
    if hasattr(p.view, "show_statusbar_memory"):
        p.view.show_statusbar_memory = True


def limitar_escena(escena):
    r = escena.render
    if r.resolution_x > MAX_X:
        r.resolution_x = MAX_X
    if r.resolution_y > MAX_Y:
        r.resolution_y = MAX_Y
    if r.resolution_percentage > 100:
        r.resolution_percentage = 100
    r.threads_mode = "FIXED"
    r.threads = HILOS
    eevee = getattr(escena, "eevee", None)
    if eevee is not None and eevee.taa_render_samples > MAX_MUESTRAS:
        eevee.taa_render_samples = MAX_MUESTRAS
    cycles = getattr(escena, "cycles", None)
    if cycles is not None:
        if getattr(cycles, "samples", 0) > MAX_MUESTRAS:
            cycles.samples = MAX_MUESTRAS
        if hasattr(cycles, "device"):
            cycles.device = "CPU"
        # El Blender de Ubuntu no trae OpenImageDenoise: con el denoiser prendido el render falla.
        for nombre in ("use_denoising", "use_preview_denoising"):
            if getattr(cycles, nombre, False):
                setattr(cycles, nombre, False)
    if r.use_simplify is False:
        r.use_simplify = True
    r.simplify_subdivision = min(r.simplify_subdivision, 1)
    r.simplify_subdivision_render = min(r.simplify_subdivision_render, 2)


def vista_ligera():
    for pantalla in bpy.data.screens:
        for area in pantalla.areas:
            if area.type != "VIEW_3D":
                continue
            for espacio in area.spaces:
                if espacio.type == "VIEW_3D" and espacio.shading.type in ("MATERIAL", "RENDERED"):
                    espacio.shading.type = "SOLID"


def cada_dos_segundos():
    for escena in bpy.data.scenes:
        limitar_escena(escena)
    if EXPIRA:
        quedan = EXPIRA - time.time()
        if quedan < 300 and not _aviso_final["hecho"]:
            _aviso_final["hecho"] = True
            guardar_copia()
    return 2.0


def guardar_copia():
    nombre = time.strftime("rescate_%H%M.blend")
    try:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(PROYECTOS, nombre), copy=True, compress=True)
    except Exception as error:  # noqa: BLE001 - guardar nunca debe tumbar la sesión
        print("Amatista Cloud: no se pudo guardar la copia:", error)


def barra_de_estado(self, _context):
    if not EXPIRA:
        return
    minutos = max(0, int((EXPIRA - time.time()) // 60))
    texto = f"Amatista Cloud · quedan {minutos} min · guarda en Proyectos"
    self.layout.label(text=texto, icon="TIME" if minutos > 5 else "ERROR")


def quitar_render_de_animacion():
    """Fuera «Render Animation» (menú Render y Ctrl+F12): una hora es para aprender, no para renderizar series."""
    for mapa in (bpy.context.window_manager.keyconfigs.default, bpy.context.window_manager.keyconfigs.addon):
        if mapa is None:
            continue
        for km in mapa.keymaps:
            for kmi in km.keymap_items:
                if kmi.idname == "render.render" and getattr(kmi.properties, "animation", False):
                    kmi.active = False
    menu = getattr(bpy.types, "TOPBAR_MT_render", None)
    if menu is not None and not getattr(menu, "_amatista", False):
        original = menu.draw

        def dibujar(self, context):
            fila = self.layout
            fila.operator("render.render", text="Render Image", icon="RENDER_STILL").use_viewport = True
            fila.separator()
            fila.operator("render.view_show", text="View Render")
            fila.label(text="Render Animation no está disponible en Amatista Cloud", icon="INFO")

        menu.draw = dibujar
        menu._amatista = original


@bpy.app.handlers.persistent
def al_cargar(_archivo):
    for escena in bpy.data.scenes:
        limitar_escena(escena)
    vista_ligera()


def iniciar():
    ajustar_preferencias()
    quitar_render_de_animacion()
    bpy.app.handlers.load_post.append(al_cargar)
    bpy.app.timers.register(cada_dos_segundos, first_interval=1.0, persistent=True)
    bpy.types.STATUSBAR_HT_header.prepend(barra_de_estado)
    al_cargar(None)
    print("Amatista Cloud: listo")


iniciar()
