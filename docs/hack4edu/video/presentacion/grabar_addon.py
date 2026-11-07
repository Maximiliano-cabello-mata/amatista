"""Graba el add-on de Amatista en Blender (Xvfb): la práctica del tren armada pieza por pieza.
Cada captura es un estado real del add-on después de revisar la escena."""
import math
import os
import traceback

import addon_utils
import bpy

SALIDA = os.path.abspath(os.environ.get("SALIDA", "capturas"))
os.makedirs(SALIDA, exist_ok=True)
N = {"captura": 0}


def zona():
    win = bpy.context.window_manager.windows[0]
    for area in win.screen.areas:
        if area.type == "VIEW_3D":
            region = next(r for r in area.regions if r.type == "WINDOW")
            return win, area, region
    return win, None, None


def capturar(nombre):
    win, area, region = zona()
    N["captura"] += 1
    ruta = os.path.join(SALIDA, f"{N['captura']:03d}_{nombre}.png")
    with bpy.context.temp_override(window=win, screen=win.screen):
        bpy.ops.wm.redraw_timer(type="DRAW_WIN_SWAP", iterations=2)
    import subprocess
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "x11grab", "-video_size", "1920x1080", "-i",
                    os.environ.get("DISPLAY", ":99"), "-frames:v", "1", ruta], check=False)
    print("CAPTURA", ruta, flush=True)


def en_vista(fn):
    win, area, region = zona()
    with bpy.context.temp_override(window=win, area=area, region=region, screen=win.screen):
        return fn()


def preparar():
    from amatista_blender import ajustes, integracion
    from amatista_blender.taller import datos, sesion

    p = ajustes.prefs()
    p.guion_paso_a_paso = True
    p.presentar_herramientas = True
    p.enfoque = "nunca"
    bpy.context.preferences.view.ui_scale = 1.25
    bpy.context.window_manager.amatista.modo = "alumno"
    sesion.terminar()
    datos.reiniciar_cache()
    for obj in list(bpy.context.scene.objects):
        bpy.data.objects.remove(obj)
    en_vista(lambda: sesion.abrir(bpy.context, "blender.bp.m1", "proyecto:blender.bp.m1"))
    win, area, region = zona()
    integracion.abrir_barra_lateral(win.screen)
    r3d = area.spaces.active.region_3d
    from mathutils import Quaternion, Vector
    r3d.view_rotation = Quaternion((0.82, 0.42, 0.18, 0.35)).normalized()
    r3d.view_distance = 8.0
    derecha = r3d.view_rotation @ Vector((1, 0, 0))
    r3d.view_location = Vector((0, 0, 0.8)) + derecha * 2.3  # el tren queda a la izquierda, fuera del panel
    space = area.spaces.active
    space.overlay.show_floor = True
    space.shading.type = "SOLID"
    space.shading.color_type = "OBJECT"


PIEZAS = [("cube", (1.0, 0.6, 0.5), (1.0, 0, 0.9), (0, 0, 0)), ("cube", (0.9, 0.6, 0.5), (-1.0, 0, 0.9), (0, 0, 0))]
PIEZAS += [("cylinder", (0.35, 0.35, 0.1), (x, y, 0.35), (math.radians(90), 0, 0)) for x in (1.6, 0.4, -0.4, -1.6) for y in (0.75, -0.75)]
PIEZAS += [("cylinder", (0.2, 0.2, 0.35), (1.5, 0, 1.75), (0, 0, 0))]


COLORES = [(0.85, 0.2, 0.2, 1), (0.2, 0.45, 0.9, 1)] + [(0.12, 0.12, 0.14, 1)] * 8 + [(0.95, 0.75, 0.2, 1)]


def agregar(i):
    tipo, escala, lugar, giro = PIEZAS[i]

    def hacer():
        getattr(bpy.ops.mesh, f"primitive_{tipo}_add")()
        obj = bpy.context.active_object
        obj.scale, obj.location, obj.rotation_euler = escala, lugar, giro
        obj.color = COLORES[i]
    en_vista(hacer)
    bpy.context.view_layer.update()


def revisar():
    from amatista_blender import guion
    guion.revisar_ya(bpy.context)


def pista(n):
    from amatista_blender import guion
    def hacer():
        guion.pedir_pista(bpy.context, n)
    en_vista(hacer)


def girar(grados):
    win, area, region = zona()
    r3d = area.spaces.active.region_3d
    from mathutils import Quaternion
    from mathutils import Vector
    r3d.view_rotation = Quaternion((0, 0, 1), math.radians(grados)) @ r3d.view_rotation
    r3d.view_location = Vector((0, 0, 0.8)) + (r3d.view_rotation @ Vector((1, 0, 0))) * 2.3


def guardar():
    bpy.ops.wm.save_as_mainfile(filepath="/tmp/tren_amatista.blend")


GUION = [("inicio", lambda: None), ("pista_donde", lambda: pista(2))]
for i in range(len(PIEZAS)):
    GUION.append((f"pieza_{i:02d}", (lambda k: (lambda: (agregar(k), girar(-2.5), revisar())))(i)))
GUION.insert(5, ("pista_como", lambda: pista(3)))
GUION += [("guardar", lambda: (guardar(), revisar())), ("final", lambda: girar(-4))]
PASO = {"i": -1}


def tic():
    try:
        if PASO["i"] == -1:
            preparar()
        else:
            if PASO["i"] >= 1:
                capturar(GUION[PASO["i"] - 1][0])
                if GUION[PASO["i"] - 1][0].startswith("pista"):
                    import subprocess
                    subprocess.run(["xdotool", "mousemove", "300", "700", "key", "Escape"], check=False)
            if PASO["i"] >= len(GUION):
                bpy.ops.wm.quit_blender()
                return None
            GUION[PASO["i"]][1]()
        PASO["i"] += 1
        return 1.6  # tiempo para que el guion revise y la banda se dibuje
    except Exception:
        traceback.print_exc()
        bpy.ops.wm.quit_blender()
        return None


addon_utils.enable("amatista_blender", default_set=True, handle_error=None)
bpy.context.preferences.view.show_splash = False
bpy.app.timers.register(tic, first_interval=3.0)
