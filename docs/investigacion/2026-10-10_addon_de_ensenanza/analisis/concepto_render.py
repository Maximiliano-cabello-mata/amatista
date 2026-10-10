"""Renders de concepto (Cycles) del modo «Llena el molde»: molde translúcido + piezas del alumno."""
import json, math, sys
import bpy
from mathutils import Vector

OUT = sys.argv[-1]
REF = json.load(open('practices/blender/principiante/m1-tren/practica.json'))['reference']['parts']

def hexrgb(h):
    h = h.lstrip('#'); c = [int(h[i:i+2], 16)/255 for i in (0, 2, 4)]
    return tuple(x**2.2 for x in c) + (1,)

def limpiar():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 48; sc.cycles.device = 'CPU'
    sc.cycles.use_denoising = True
    sc.render.resolution_x, sc.render.resolution_y = 1280, 760
    sc.view_settings.view_transform = 'Standard'
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (0.045, 0.045, 0.05, 1); bg.inputs[1].default_value = 1.0
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.lens = 42
    cam.location = (6.4, -7.6, 4.6)
    d = Vector((0.1, 0, 0.8)) - cam.location
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    for loc, en in (((4, -4, 7), 600), ((-5, -2, 4), 180), ((0, 6, 5), 220)):
        l = bpy.data.objects.new('l', bpy.data.lights.new('l', 'AREA')); l.data.energy = en; l.data.size = 4
        l.location = loc; sc.collection.objects.link(l)
        l.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    # suelo con cuadrícula estilo vista 3D
    bpy.ops.mesh.primitive_plane_add(size=40)
    p = bpy.context.active_object
    m = bpy.data.materials.new('suelo'); m.use_nodes = True; nt = m.node_tree
    bsdf = nt.nodes['Principled BSDF']; bsdf.inputs['Base Color'].default_value = (0.09, 0.09, 0.1, 1); bsdf.inputs['Roughness'].default_value = 0.9
    tc = nt.nodes.new('ShaderNodeTexCoord'); br = nt.nodes.new('ShaderNodeTexBrick')
    br.inputs['Scale'].default_value = 40; br.inputs['Mortar Size'].default_value = 0.006; br.offset = 0; br.squash = 1
    br.inputs['Color1'].default_value = (0.08, 0.08, 0.09, 1); br.inputs['Color2'].default_value = (0.08, 0.08, 0.09, 1)
    br.inputs['Mortar'].default_value = (0.16, 0.16, 0.18, 1); br.inputs['Brick Width'].default_value = 1.0; br.inputs['Row Height'].default_value = 1.0
    nt.links.new(tc.outputs['Object'], br.inputs['Vector']); nt.links.new(br.outputs['Color'], bsdf.inputs['Base Color'])
    p.data.materials.append(m)
    return sc

def mat_solido(nombre, color):
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = color; b.inputs['Roughness'].default_value = 0.45
    return m

def mat_molde(nombre, color, fuerza=1.0, alfa=0.22):
    m = bpy.data.materials.new(nombre); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial'); mix = nt.nodes.new('ShaderNodeMixShader')
    tr = nt.nodes.new('ShaderNodeBsdfTransparent'); em = nt.nodes.new('ShaderNodeEmission')
    em.inputs[0].default_value = color; em.inputs[1].default_value = fuerza
    lw = nt.nodes.new('ShaderNodeLayerWeight'); lw.inputs[0].default_value = 0.35
    mt = nt.nodes.new('ShaderNodeMath'); mt.operation = 'MULTIPLY_ADD'; mt.inputs[1].default_value = 0.6; mt.inputs[2].default_value = alfa
    nt.links.new(lw.outputs['Facing'], mt.inputs[0])
    nt.links.new(mt.outputs[0], mix.inputs[0]); nt.links.new(tr.outputs[0], mix.inputs[1]); nt.links.new(em.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs[0])
    return m

def mat_borde(nombre, color, fuerza=4.0):
    m = bpy.data.materials.new(nombre); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial'); em = nt.nodes.new('ShaderNodeEmission')
    em.inputs[0].default_value = color; em.inputs[1].default_value = fuerza
    nt.links.new(em.outputs[0], out.inputs[0]); return m

def pieza(p, material, borde=None, escala=1.0, mover=(0, 0, 0), primitiva=None):
    prim = primitiva or p['primitive']
    if prim == 'cube': bpy.ops.mesh.primitive_cube_add(size=1)
    elif prim == 'cylinder': bpy.ops.mesh.primitive_cylinder_add(radius=0.5, depth=1, vertices=40)
    elif prim == 'plane': return None
    o = bpy.context.active_object
    o.scale = [s*escala for s in p['size']]
    o.location = [a+b for a, b in zip(p['location'], mover)]
    o.rotation_euler = [math.radians(a) for a in p.get('rotation', (0, 0, 0))]
    if prim == 'cylinder':
        bpy.ops.object.shade_smooth()
    if prim == 'cube':
        bv = o.modifiers.new('b', 'BEVEL'); bv.width = 0.03; bv.segments = 3
    o.data.materials.append(material)
    if borde is not None:
        w = o.modifiers.new('w', 'WIREFRAME'); w.thickness = 0.018; w.use_replace = False; w.material_offset = 1
        o.data.materials.append(borde)
    return o

AZUL = (0.25, 0.75, 1.0, 1); AMBAR = (1.0, 0.62, 0.15, 1); CORAL = (1.0, 0.35, 0.3, 1); VERDE = (0.3, 1.0, 0.55, 1)

def escena(nombre, hechas, actual=None, error=None, todo_solido=False):
    sc = limpiar()
    molde = mat_molde('molde', AZUL); borde = mat_borde('borde', AZUL, 2.5)
    molde_a = mat_molde('molde_a', AMBAR, 1.4, 0.32); borde_a = mat_borde('borde_a', AMBAR, 6)
    molde_e = mat_molde('molde_e', CORAL, 1.4, 0.3); borde_e = mat_borde('borde_e', CORAL, 6)
    borde_ok = mat_borde('ok', VERDE, 3)
    for i, p in enumerate(REF):
        if p['primitive'] == 'plane': continue
        if todo_solido or i in hechas:
            o = pieza(p, mat_solido('s%d' % i, hexrgb(p.get('color', '#cccccc'))), escala=1.0)
            if not todo_solido and i in hechas:
                w = o.modifiers.new('w', 'WIREFRAME'); w.thickness = 0.012; w.use_replace = False; w.material_offset = 1
                o.data.materials.append(borde_ok)
        elif i == actual:
            pieza(p, molde_a, borde_a)
        elif error and i == error[0]:
            pieza(p, molde_e, borde_e)
            pieza(p, mat_solido('mal', hexrgb('#2c3e50')), primitiva='cube', escala=0.92, mover=(0.05, 0, -0.02))
        else:
            pieza(p, molde, borde)
    sc.render.filepath = OUT + '/' + nombre + '.png'
    bpy.ops.render.render(write_still=True)

escena('a_molde_vacio', hechas=set())
escena('a_molde_progreso', hechas={0, 1}, actual=2)
escena('a_molde_error', hechas={0, 1}, error=(2,))
escena('c_completo', hechas=set(), todo_solido=True)
