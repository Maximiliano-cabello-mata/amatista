"""Modelos low poly y animaciones en glTF binario (.glb), más su vista previa. Todo CC0: lo genera Amatista."""
import json
import math
import struct

import numpy as np
from PIL import Image, ImageDraw

# ---------------------------------------------------------------- primitivas (triángulos, sombreado plano)


def _caras(vertices, caras):
    tri = []
    for cara in caras:
        for i in range(1, len(cara) - 1):
            tri.append([vertices[cara[0]], vertices[cara[i]], vertices[cara[i + 1]]])
    return np.array(tri, dtype=np.float32)


def hacia_afuera(tri, centro=None):
    """Orienta cada triángulo (antihorario visto desde fuera, como pide glTF): su normal apunta lejos del centro."""
    c = tri.reshape(-1, 3).mean(0) if centro is None else centro
    n = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    medio = tri.mean(1)
    if callable(c):
        afuera = medio - np.array([c(m) for m in medio])
    else:
        afuera = medio - c
    voltear = (n * afuera).sum(1) < 0
    tri = tri.copy()
    tri[voltear] = tri[voltear][:, ::-1]
    return tri


def caja(w=1, h=1, d=1):
    x, y, z = w / 2, h / 2, d / 2
    v = [(-x, -y, -z), (x, -y, -z), (x, y, -z), (-x, y, -z), (-x, -y, z), (x, -y, z), (x, y, z), (-x, y, z)]
    return hacia_afuera(_caras(v, [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (2, 3, 7, 6), (1, 2, 6, 5), (0, 4, 7, 3)]))


def cilindro(r=0.5, h=1, seg=10, r2=None, tapas=True):
    r2 = r if r2 is None else r2
    a = [2 * math.pi * i / seg for i in range(seg)]
    abajo = [(r * math.cos(t), -h / 2, r * math.sin(t)) for t in a]
    arriba = [(r2 * math.cos(t), h / 2, r2 * math.sin(t)) for t in a]
    v = abajo + arriba + [(0, -h / 2, 0), (0, h / 2, 0)]
    caras = [(i, (i + 1) % seg, seg + (i + 1) % seg, seg + i) for i in range(seg)]
    if tapas:
        caras += [(2 * seg, (i + 1) % seg, i) for i in range(seg)]
        caras += [(2 * seg + 1, seg + i, seg + (i + 1) % seg) for i in range(seg)]
    return hacia_afuera(_caras(v, caras))


def cono(r=0.5, h=1, seg=10):
    return cilindro(r, h, seg, r2=0.001)


def esfera(r=0.5, seg=10, anillos=6):
    v, caras = [], []
    for j in range(anillos + 1):
        p = math.pi * j / anillos
        for i in range(seg):
            t = 2 * math.pi * i / seg
            v.append((r * math.sin(p) * math.cos(t), r * math.cos(p), r * math.sin(p) * math.sin(t)))
    for j in range(anillos):
        for i in range(seg):
            a, b = j * seg + i, j * seg + (i + 1) % seg
            caras.append((a, b, b + seg, a + seg))
    tri = _caras(v, caras)
    area = np.linalg.norm(np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0]), axis=1)
    return hacia_afuera(tri[area > 1e-9])


def toro(R=0.5, r=0.15, seg=14, lados=6):
    v, caras = [], []
    for i in range(seg):
        t = 2 * math.pi * i / seg
        for j in range(lados):
            p = 2 * math.pi * j / lados
            v.append(((R + r * math.cos(p)) * math.cos(t), r * math.sin(p), (R + r * math.cos(p)) * math.sin(t)))
    for i in range(seg):
        for j in range(lados):
            a = i * lados + j
            b = i * lados + (j + 1) % lados
            c = ((i + 1) % seg) * lados + (j + 1) % lados
            d = ((i + 1) % seg) * lados + j
            caras.append((a, b, c, d))
    eje = lambda p: np.array([p[0], 0, p[2]]) / (np.hypot(p[0], p[2]) + 1e-9) * R  # noqa: E731
    return hacia_afuera(_caras(v, caras), eje)


def mover(tri, x=0, y=0, z=0, rx=0, ry=0, rz=0, s=1):
    t = tri.reshape(-1, 3) * s
    for eje, ang in ((0, rx), (1, ry), (2, rz)):
        if ang:
            c, sn = math.cos(math.radians(ang)), math.sin(math.radians(ang))
            i, j = [(1, 2), (2, 0), (0, 1)][eje]
            a, b = t[:, i].copy(), t[:, j].copy()
            t[:, i], t[:, j] = a * c - b * sn, a * sn + b * c
    return (t + np.array([x, y, z], dtype=np.float32)).reshape(-1, 3, 3)


# ---------------------------------------------------------------- glTF binario


def _malla_gltf(partes, gltf, binario, nombre):
    """partes: [(triángulos, color RGB)] → índice de malla (una primitiva por color)."""
    primitivas = []
    por_color = {}
    for tri, rgb in partes:
        por_color.setdefault(tuple(rgb), []).append(tri)
    for rgb, lista in por_color.items():
        tri = np.concatenate(lista).astype(np.float32)
        pos = tri.reshape(-1, 3)
        normales = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
        normales /= np.linalg.norm(normales, axis=1, keepdims=True) + 1e-9
        nrm = np.repeat(normales, 3, axis=0).astype(np.float32)
        accesos = []
        for datos, minmax in ((pos, True), (nrm, False)):
            inicio = len(binario)
            binario.extend(datos.tobytes())
            while len(binario) % 4:
                binario.append(0)
            gltf['bufferViews'].append({'buffer': 0, 'byteOffset': inicio, 'byteLength': datos.nbytes, 'target': 34962})
            acceso = {'bufferView': len(gltf['bufferViews']) - 1, 'componentType': 5126, 'count': len(datos), 'type': 'VEC3'}
            if minmax:
                acceso['min'] = pos.min(0).tolist()
                acceso['max'] = pos.max(0).tolist()
            gltf['accessors'].append(acceso)
            accesos.append(len(gltf['accessors']) - 1)
        gltf['materials'].append({'name': 'color_%02x%02x%02x' % rgb, 'pbrMetallicRoughness': {
            'baseColorFactor': [c / 255 for c in rgb] + [1], 'metallicFactor': 0.0, 'roughnessFactor': 0.8}})
        primitivas.append({'attributes': {'POSITION': accesos[0], 'NORMAL': accesos[1]}, 'material': len(gltf['materials']) - 1})
    gltf['meshes'].append({'name': nombre, 'primitives': primitivas})
    return len(gltf['meshes']) - 1


def _acceso(gltf, binario, datos, tipo):
    datos = np.asarray(datos, dtype=np.float32)
    inicio = len(binario)
    binario.extend(datos.tobytes())
    while len(binario) % 4:
        binario.append(0)
    gltf['bufferViews'].append({'buffer': 0, 'byteOffset': inicio, 'byteLength': datos.nbytes})
    acceso = {'bufferView': len(gltf['bufferViews']) - 1, 'componentType': 5126, 'count': len(datos), 'type': tipo}
    if tipo == 'SCALAR':
        acceso['min'], acceso['max'] = [float(datos.min())], [float(datos.max())]
    gltf['accessors'].append(acceso)
    return len(gltf['accessors']) - 1


def quat(eje, grados):
    a = math.radians(grados) / 2
    x, y, z = eje
    n = math.sqrt(x * x + y * y + z * z) or 1
    return [x / n * math.sin(a), y / n * math.sin(a), z / n * math.sin(a), math.cos(a)]


def glb(nodos, animacion=None, nombre='modelo'):
    """nodos: [{'nombre', 'partes', 'pos', 'padre'(índice o None)}]; animacion: {'tiempos', 'pistas': [(nodo, ruta, valores)]}."""
    gltf = {'asset': {'version': '2.0', 'generator': 'Amatista · biblioteca de recursos (CC0)'}, 'scene': 0,
            'scenes': [{'nodes': []}], 'nodes': [], 'meshes': [], 'materials': [], 'accessors': [], 'bufferViews': [], 'buffers': []}
    binario = bytearray()
    for i, n in enumerate(nodos):
        nodo = {'name': n['nombre'], 'translation': list(map(float, n.get('pos', (0, 0, 0))))}
        if n.get('partes'):
            nodo['mesh'] = _malla_gltf(n['partes'], gltf, binario, n['nombre'])
        gltf['nodes'].append(nodo)
    for i, n in enumerate(nodos):
        padre = n.get('padre')
        if padre is None:
            gltf['scenes'][0]['nodes'].append(i)
        else:
            gltf['nodes'][padre].setdefault('children', []).append(i)
    if animacion:
        entrada = _acceso(gltf, binario, animacion['tiempos'], 'SCALAR')
        muestreos, canales = [], []
        for nodo, ruta, valores in animacion['pistas']:
            tipo = 'VEC4' if ruta == 'rotation' else 'VEC3'
            muestreos.append({'input': entrada, 'output': _acceso(gltf, binario, valores, tipo), 'interpolation': 'LINEAR'})
            canales.append({'sampler': len(muestreos) - 1, 'target': {'node': nodo, 'path': ruta}})
        gltf['animations'] = [{'name': animacion.get('nombre', nombre), 'samplers': muestreos, 'channels': canales}]
    gltf['buffers'].append({'byteLength': len(binario)})
    texto = json.dumps(gltf, separators=(',', ':')).encode()
    texto += b' ' * ((4 - len(texto) % 4) % 4)
    cuerpo = struct.pack('<I4s', len(texto), b'JSON') + texto + struct.pack('<I4s', len(binario), b'BIN\x00') + bytes(binario)
    return struct.pack('<4sII', b'glTF', 2, 12 + len(cuerpo)) + cuerpo


# ---------------------------------------------------------------- vista previa (rasterizador propio)


def _rotq(v, q):
    x, y, z, w = q
    u = np.array([x, y, z])
    return v + 2 * np.cross(u, np.cross(u, v) + w * v)


def triangulos_mundo(nodos, estado=None):
    """Todos los triángulos con su color, aplicando posiciones (y el estado animado: {nodo: {ruta: valor}})."""
    salida = []
    estado = estado or {}

    def transformar(i, tri):
        n = nodos[i]
        e = estado.get(i, {})
        t = tri * np.array(e.get('scale', (1, 1, 1)), dtype=np.float32)
        if 'rotation' in e:
            t = _rotq(t.reshape(-1, 3), e['rotation']).reshape(-1, 3, 3)
        t = t + np.array(e.get('translation', n.get('pos', (0, 0, 0))), dtype=np.float32)
        return t if n.get('padre') is None else transformar(n['padre'], t)

    for i, n in enumerate(nodos):
        for tri, rgb in n.get('partes', []):
            salida.append((transformar(i, tri), rgb))
    return salida


def vista(nodos, estado=None, tam=(320, 240), giro=35, alto=25, fondo=(22, 20, 28), centro=None, escala=None):
    tri = triangulos_mundo(nodos, estado)
    todos = np.concatenate([t for t, _ in tri]).reshape(-1, 3)
    c = np.array(centro) if centro is not None else (todos.max(0) + todos.min(0)) / 2
    radio = escala or (np.linalg.norm(todos - c, axis=1).max() + 1e-6)
    g, a = math.radians(giro), math.radians(alto)
    rot = np.array([[math.cos(g), 0, -math.sin(g)], [0, 1, 0], [math.sin(g), 0, math.cos(g)]])
    inc = np.array([[1, 0, 0], [0, math.cos(a), -math.sin(a)], [0, math.sin(a), math.cos(a)]])
    m = inc @ rot
    img = Image.new('RGB', tam, fondo)
    d = ImageDraw.Draw(img)
    w, h = tam
    d.ellipse([w * 0.22, h * 0.78, w * 0.78, h * 0.9], fill=tuple(int(x * 0.6) for x in fondo))
    luz = np.array([0.4, 0.8, 0.5]) / np.linalg.norm([0.4, 0.8, 0.5])
    lista = []
    for t, rgb in tri:
        p = (t.reshape(-1, 3) - c) @ m.T
        p = p.reshape(-1, 3, 3)
        nrm = np.cross(p[:, 1] - p[:, 0], p[:, 2] - p[:, 0])
        nrm /= np.linalg.norm(nrm, axis=1, keepdims=True) + 1e-9
        for k in range(len(p)):
            if nrm[k, 2] < 0:
                continue
            brillo = 0.35 + 0.65 * max(0.0, float(nrm[k] @ luz))
            lista.append((p[k][:, 2].mean(), p[k], tuple(int(min(255, v * brillo)) for v in rgb)))
    lista.sort(key=lambda x: x[0])
    s = min(w, h) * 0.42 / radio
    for _, p, col in lista:
        d.polygon([(w / 2 + x * s, h * 0.52 - y * s) for x, y, _ in p], fill=col)
    return img


# ---------------------------------------------------------------- catálogo de modelos

MADERA, MADERA2, HOJA, HOJA2, ROCA, ROJO, BLANCO = (130, 85, 50), (95, 60, 35), (70, 140, 60), (50, 110, 45), (120, 118, 112), (190, 50, 45), (225, 222, 215)
GRIS, OSCURO, AMATISTA, NEON, AMARILLO, AZUL = (140, 142, 150), (55, 55, 62), (155, 89, 182), (0, 200, 230), (240, 190, 50), (60, 110, 200)


def _arbol():
    return [(mover(cilindro(0.12, 0.8, 7), y=0.4), MADERA), (mover(esfera(0.55, 8, 5), y=1.15), HOJA), (mover(esfera(0.38, 7, 4), x=0.25, y=1.45), HOJA2)]


def _pino():
    return [(mover(cilindro(0.1, 0.5, 6), y=0.25), MADERA), (mover(cono(0.6, 0.9, 8), y=0.9), HOJA2), (mover(cono(0.45, 0.7, 8), y=1.35), HOJA), (mover(cono(0.3, 0.5, 8), y=1.75), HOJA)]


def _casa():
    techo = mover(cilindro(0.85, 1.6, 3), rz=90, y=1.35, rx=0) 
    return [(mover(caja(1.4, 1, 1.2), y=0.5), BLANCO), (mover(techo, ry=0), ROJO), (mover(caja(0.3, 0.55, 0.05), y=0.28, z=0.61), MADERA2),
            (mover(caja(0.3, 0.3, 0.05), x=0.45, y=0.6, z=0.61), AZUL)]


def _silla():
    p = [(mover(caja(0.6, 0.08, 0.6), y=0.5), MADERA), (mover(caja(0.6, 0.6, 0.08), y=0.8, z=-0.26), MADERA)]
    for x in (-0.25, 0.25):
        for z in (-0.25, 0.25):
            p.append((mover(caja(0.07, 0.5, 0.07), x=x, y=0.25, z=z), MADERA2))
    return p


def _mesa():
    p = [(mover(caja(1.4, 0.08, 0.8), y=0.75), MADERA)]
    for x in (-0.6, 0.6):
        for z in (-0.32, 0.32):
            p.append((mover(caja(0.08, 0.72, 0.08), x=x, y=0.36, z=z), MADERA2))
    return p


def _lampara():
    return [(mover(cilindro(0.25, 0.05, 10), y=0.03), OSCURO), (mover(cilindro(0.03, 1.2, 6), y=0.6), OSCURO), (mover(cilindro(0.3, 0.35, 10, r2=0.15), y=1.25), AMARILLO)]


def _barril():
    return [(mover(cilindro(0.4, 0.9, 12), y=0.45), MADERA), (mover(toro(0.41, 0.03, 12, 4), y=0.2), OSCURO), (mover(toro(0.41, 0.03, 12, 4), y=0.7), OSCURO)]


def _cofre():
    return [(mover(caja(0.9, 0.5, 0.6), y=0.25), MADERA), (mover(cilindro(0.3, 0.9, 8), rz=90, y=0.5), MADERA2), (mover(caja(0.12, 0.16, 0.05), y=0.45, z=0.31), AMARILLO)]


def _cristal():
    return [(mover(cilindro(0.3, 0.6, 6, r2=0.32), y=0.5), AMATISTA), (mover(cono(0.32, 0.5, 6), y=1.05), AMATISTA), (mover(cono(0.3, 0.3, 6), rx=180, y=0.05), AMATISTA)]


def _roca():
    t = esfera(0.6, 7, 4)
    rng = np.random.default_rng(3)
    t = t * (1 + rng.random((1, 1, 3)) * 0.0)
    return [(mover(t, y=0.35, s=1.0) * np.array([1.2, 0.7, 1.0], dtype=np.float32), ROCA)]


def _columna():
    return [(mover(caja(0.7, 0.15, 0.7), y=0.07), BLANCO), (mover(cilindro(0.25, 1.8, 12), y=1.05), BLANCO), (mover(caja(0.7, 0.15, 0.7), y=2.02), BLANCO)]


def _farol():
    return [(mover(cilindro(0.06, 2, 6), y=1), OSCURO), (mover(caja(0.3, 0.35, 0.3), y=2.15), AMARILLO), (mover(cono(0.26, 0.2, 4), y=2.42, ry=45), OSCURO)]


def _banca():
    p = [(mover(caja(1.6, 0.08, 0.45), y=0.45), MADERA), (mover(caja(1.6, 0.35, 0.06), y=0.7, z=-0.2), MADERA)]
    for x in (-0.7, 0.7):
        p.append((mover(caja(0.08, 0.45, 0.4), x=x, y=0.22), OSCURO))
    return p


def _hongo():
    return [(mover(cilindro(0.15, 0.5, 8), y=0.25), BLANCO), (mover(esfera(0.45, 10, 5), y=0.55) * np.array([1, 0.6, 1], dtype=np.float32), ROJO)]


def _maceta():
    return [(mover(cilindro(0.3, 0.45, 10, r2=0.4), y=0.22), (180, 90, 55)), (mover(esfera(0.35, 8, 5), y=0.65), HOJA)]


def _cohete():
    return [(mover(cilindro(0.3, 1.4, 12), y=0.9), BLANCO), (mover(cono(0.3, 0.5, 12), y=1.85), ROJO), (mover(caja(0.08, 0.5, 0.5), x=0.3, y=0.4), ROJO),
            (mover(caja(0.08, 0.5, 0.5), x=-0.3, y=0.4), ROJO), (mover(cilindro(0.12, 0.05, 10), rx=90, y=1.1, z=0.3), AZUL)]


def _robot():
    return [(mover(caja(0.7, 0.8, 0.5), y=0.9), GRIS), (mover(caja(0.5, 0.4, 0.4), y=1.55), GRIS), (mover(caja(0.1, 0.08, 0.02), x=-0.12, y=1.58, z=0.21), NEON),
            (mover(caja(0.1, 0.08, 0.02), x=0.12, y=1.58, z=0.21), NEON), (mover(caja(0.2, 0.5, 0.2), x=-0.2, y=0.25), OSCURO), (mover(caja(0.2, 0.5, 0.2), x=0.2, y=0.25), OSCURO),
            (mover(caja(0.16, 0.6, 0.16), x=-0.45, y=0.95), OSCURO), (mover(caja(0.16, 0.6, 0.16), x=0.45, y=0.95), OSCURO), (mover(cilindro(0.02, 0.25, 4), y=1.85), OSCURO)]


def _auto():
    p = [(mover(caja(1.8, 0.4, 0.9), y=0.4), AZUL), (mover(caja(1, 0.35, 0.8), y=0.78, x=-0.1), AZUL), (mover(caja(0.9, 0.3, 0.82), y=0.78, x=-0.1, s=0.98), (150, 200, 230))]
    for x in (-0.6, 0.6):
        for z in (-0.45, 0.45):
            p.append((mover(cilindro(0.2, 0.15, 10), rx=90, x=x, y=0.2, z=z), OSCURO))
    return p


def _vagon():
    p = [(mover(caja(1.6, 0.7, 0.8), y=0.55), AMARILLO), (mover(caja(1.7, 0.1, 0.9), y=0.95), ROJO)]
    for x in (-0.55, 0.55):
        for z in (-0.42, 0.42):
            p.append((mover(cilindro(0.18, 0.1, 10), rx=90, x=x, y=0.18, z=z), OSCURO))
    return p


def _barco():
    casco = mover(cilindro(0.5, 1.8, 6, r2=0.35), rz=90, y=0.3) * np.array([1, 0.6, 0.7], dtype=np.float32)
    return [(casco, MADERA), (mover(cilindro(0.04, 1.4, 5), y=1.0), MADERA2), (mover(cilindro(0.6, 0.02, 3), rx=90, ry=90, y=1.1, x=0.15), BLANCO)]


def _avion():
    return [(mover(cilindro(0.18, 1.8, 10), rz=90, y=0.6), BLANCO), (mover(caja(0.5, 0.05, 2.0), y=0.6), AZUL), (mover(caja(0.3, 0.05, 0.8), x=-0.8, y=0.65), AZUL),
            (mover(caja(0.3, 0.4, 0.05), x=-0.8, y=0.85), ROJO), (mover(cono(0.18, 0.3, 10), rz=-90, x=1.05, y=0.6), GRIS)]


def _espada():
    return [(mover(caja(0.12, 1.3, 0.03), y=1.05), GRIS), (mover(caja(0.45, 0.08, 0.1), y=0.38), AMARILLO), (mover(cilindro(0.04, 0.3, 6), y=0.2), MADERA2),
            (mover(esfera(0.06, 6, 4), y=0.03), AMARILLO)]


def _escudo():
    return [(mover(cilindro(0.55, 0.1, 12), rx=90, y=0.6), ROJO), (mover(cilindro(0.2, 0.12, 12), rx=90, y=0.6, z=0.02), AMARILLO)]


def _llave():
    return [(mover(toro(0.18, 0.05, 12, 5), rx=90, y=0.9), AMARILLO), (mover(caja(0.06, 0.8, 0.04), y=0.35), AMARILLO), (mover(caja(0.18, 0.06, 0.04), x=0.09, y=0.1), AMARILLO)]


def _moneda():
    return [(mover(cilindro(0.4, 0.06, 18), rx=90, y=0.45), AMARILLO), (mover(cilindro(0.3, 0.07, 18), rx=90, y=0.45), (210, 160, 40))]


def _corona():
    p = [(mover(cilindro(0.4, 0.25, 12), y=0.12), AMARILLO)]
    for i in range(6):
        a = 2 * math.pi * i / 6
        p.append((mover(cono(0.08, 0.25, 4), x=0.38 * math.cos(a), y=0.37, z=0.38 * math.sin(a)), AMARILLO))
    return p


def _trofeo():
    return [(mover(caja(0.5, 0.15, 0.5), y=0.07), OSCURO), (mover(cilindro(0.06, 0.4, 8), y=0.35), AMARILLO), (mover(cilindro(0.15, 0.45, 12, r2=0.35), y=0.75), AMARILLO),
            (mover(toro(0.12, 0.03, 10, 4), rx=90, x=0.38, y=0.8), AMARILLO), (mover(toro(0.12, 0.03, 10, 4), rx=90, x=-0.38, y=0.8), AMARILLO)]


def _taza():
    return [(mover(cilindro(0.3, 0.45, 14), y=0.22), BLANCO), (mover(toro(0.12, 0.04, 10, 4), rx=90, x=0.35, y=0.25), BLANCO)]


def _escalera():
    return [(mover(caja(1, 0.2, 0.35), y=0.1 + i * 0.2, z=-i * 0.35), ROCA) for i in range(6)]


def _puerta():
    return [(mover(caja(1.0, 2.0, 0.12), y=1), MADERA), (mover(caja(1.2, 0.1, 0.2), y=2.05), MADERA2), (mover(esfera(0.05, 6, 4), x=0.38, y=1, z=0.08), AMARILLO)]


def _valla():
    p = [(mover(caja(0.12, 0.9, 0.08), x=x, y=0.45), MADERA) for x in (-0.9, -0.45, 0, 0.45, 0.9)]
    return p + [(mover(caja(2, 0.1, 0.06), y=y, z=0.06), MADERA2) for y in (0.3, 0.65)]


def _puente():
    return [(mover(caja(3, 0.15, 1), y=0.6), MADERA), (mover(caja(0.2, 0.8, 0.2), x=-1.3, y=0.3, z=-0.4), ROCA), (mover(caja(0.2, 0.8, 0.2), x=1.3, y=0.3, z=0.4), ROCA),
            (mover(caja(0.2, 0.8, 0.2), x=-1.3, y=0.3, z=0.4), ROCA), (mover(caja(0.2, 0.8, 0.2), x=1.3, y=0.3, z=-0.4), ROCA), (mover(caja(3, 0.06, 0.06), y=1.0, z=0.47), MADERA2)]


def _faro():
    return [(mover(cilindro(0.5, 2.2, 10, r2=0.35), y=1.1), BLANCO), (mover(cilindro(0.51, 0.3, 10, r2=0.45), y=0.7), ROJO), (mover(cilindro(0.38, 0.4, 8), y=2.4), AMARILLO),
            (mover(cono(0.45, 0.4, 8), y=2.8), ROJO)]


def _molino_base():
    return [(mover(cilindro(0.6, 2, 8, r2=0.4), y=1), BLANCO), (mover(cono(0.5, 0.6, 8), y=2.3), ROJO)]


def _nube():
    return [(mover(esfera(0.4, 8, 5), x=x, y=1.5 + y), BLANCO) for x, y in ((-0.4, 0), (0, 0.15), (0.4, 0), (0.15, -0.05))]


def _isla():
    tierra = mover(cono(1.2, 0.8, 9), rx=180, y=0.4)
    return [(tierra, (110, 80, 55)), (mover(cilindro(1.2, 0.12, 9), y=0.85), HOJA)] + [(mover(t, x=0.3, y=0.9, s=0.6), c) for t, c in _pino()]


def _montana():
    return [(mover(cono(1.2, 1.6, 7), y=0.8), ROCA), (mover(cono(0.45, 0.6, 7), y=1.32), BLANCO)]


def _engrane(radio=0.5, dientes=10, grosor=0.15, color=GRIS):
    p = [(cilindro(radio * 0.8, grosor, dientes * 2), color)]
    for i in range(dientes):
        a = 360 * i / dientes
        p.append((mover(caja(radio * 0.3, grosor, radio * 0.25), x=radio * 0.85, ry=0) if False else mover(mover(caja(radio * 0.3, grosor, radio * 0.25), x=radio * 0.85), ry=a), color))
    return p


MODELOS = [
    ('arbol', 'Árbol frondoso', 'naturaleza', _arbol), ('pino', 'Pino', 'naturaleza', _pino), ('roca', 'Roca', 'naturaleza', _roca),
    ('hongo', 'Hongo', 'naturaleza', _hongo), ('nube', 'Nube', 'naturaleza', _nube), ('montana', 'Montaña nevada', 'naturaleza', _montana),
    ('isla', 'Isla flotante', 'naturaleza', _isla), ('maceta', 'Maceta', 'hogar', _maceta), ('casa', 'Casa', 'construcción', _casa),
    ('columna', 'Columna', 'construcción', _columna), ('escalera', 'Escalera', 'construcción', _escalera), ('puerta', 'Puerta', 'construcción', _puerta),
    ('valla', 'Valla', 'construcción', _valla), ('puente', 'Puente', 'construcción', _puente), ('faro', 'Faro', 'construcción', _faro),
    ('molino', 'Molino (base)', 'construcción', _molino_base), ('silla', 'Silla', 'hogar', _silla), ('mesa', 'Mesa', 'hogar', _mesa),
    ('lampara', 'Lámpara', 'hogar', _lampara), ('taza', 'Taza', 'hogar', _taza), ('banca', 'Banca', 'ciudad', _banca),
    ('farol', 'Farol', 'ciudad', _farol), ('barril', 'Barril', 'utilería', _barril), ('cofre', 'Cofre', 'utilería', _cofre),
    ('cristal', 'Cristal de amatista', 'fantasía', _cristal), ('espada', 'Espada', 'fantasía', _espada), ('escudo', 'Escudo', 'fantasía', _escudo),
    ('llave', 'Llave', 'fantasía', _llave), ('moneda', 'Moneda', 'juego', _moneda), ('corona', 'Corona', 'juego', _corona),
    ('trofeo', 'Trofeo', 'juego', _trofeo), ('cohete', 'Cohete', 'vehículos', _cohete), ('auto', 'Auto', 'vehículos', _auto),
    ('vagon', 'Vagón de tren', 'vehículos', _vagon), ('barco', 'Barco de vela', 'vehículos', _barco), ('avion', 'Avión', 'vehículos', _avion),
    ('robot', 'Robot', 'personajes', _robot), ('engrane', 'Engrane', 'mecánica', lambda: _engrane()),
]


# ---------------------------------------------------------------- animaciones (cuadros clave)

def _tiempos(segundos, n=25):
    return np.linspace(0, segundos, n)


def _anim_simple(id_, partes, segundos, ruta, valores_fn, n=25):
    nodos = [{'nombre': id_, 'partes': partes}]
    t = _tiempos(segundos, n)
    return nodos, {'nombre': id_, 'tiempos': t, 'pistas': [(0, ruta, [valores_fn(k / (n - 1)) for k in range(n)])]}


def _anim_girar():
    return _anim_simple('girar', _cristal(), 3, 'rotation', lambda k: quat((0, 1, 0), 360 * k))


def _anim_rebotar():
    pelota = [(mover(esfera(0.35, 12, 7), y=0.35), ROJO)]
    def tr(k):
        return [0, abs(math.sin(math.pi * 2 * k)) * 1.2, 0]
    nodos = [{'nombre': 'pelota', 'partes': pelota}]
    t = _tiempos(2, 41)
    trans = [tr(k / 40) for k in range(41)]
    escala = [[1 + 0.25 * max(0, 0.15 - h[1]) / 0.15, 1 - 0.3 * max(0, 0.15 - h[1]) / 0.15, 1 + 0.25 * max(0, 0.15 - h[1]) / 0.15] for h in trans]
    return nodos, {'nombre': 'rebotar', 'tiempos': t, 'pistas': [(0, 'translation', trans), (0, 'scale', escala)]}


def _anim_flotar():
    return _anim_simple('flotar', _isla(), 4, 'translation', lambda k: [0, math.sin(2 * math.pi * k) * 0.25, 0])


def _anim_latido():
    corazon = [(mover(esfera(0.3, 10, 6), x=-0.18, y=0.9), ROJO), (mover(esfera(0.3, 10, 6), x=0.18, y=0.9), ROJO), (mover(cono(0.45, 0.6, 10), rx=180, y=0.5), ROJO)]
    return _anim_simple('latido', corazon, 1.2, 'scale', lambda k: [1 + 0.15 * max(0, math.sin(2 * math.pi * k)) ** 3] * 3)


def _anim_pendulo():
    nodos = [{'nombre': 'soporte', 'partes': [(mover(caja(1.2, 0.1, 0.2), y=2), MADERA2)]},
             {'nombre': 'pendulo', 'pos': (0, 2, 0), 'partes': [(mover(cilindro(0.02, 1.4, 5), y=-0.7), GRIS), (mover(esfera(0.2, 10, 6), y=-1.5), AMARILLO)]}]
    t = _tiempos(2, 33)
    return nodos, {'nombre': 'pendulo', 'tiempos': t, 'pistas': [(1, 'rotation', [quat((0, 0, 1), 35 * math.cos(2 * math.pi * k / 32)) for k in range(33)])]}


def _anim_puerta():
    nodos = [{'nombre': 'marco', 'partes': [(mover(caja(0.1, 2.1, 0.15), x=-0.55, y=1.05), MADERA2), (mover(caja(0.1, 2.1, 0.15), x=0.55, y=1.05), MADERA2), (mover(caja(1.2, 0.1, 0.15), y=2.1), MADERA2)]},
             {'nombre': 'hoja', 'pos': (-0.5, 0, 0), 'partes': [(mover(caja(1.0, 2.0, 0.08), x=0.5, y=1), MADERA), (mover(esfera(0.05, 6, 4), x=0.88, y=1, z=0.06), AMARILLO)]}]
    t = _tiempos(3, 31)
    return nodos, {'nombre': 'puerta', 'tiempos': t, 'pistas': [(1, 'rotation', [quat((0, 1, 0), -100 * math.sin(math.pi * k / 30)) for k in range(31)])]}


def _anim_molino():
    aspas = []
    for i in range(4):
        aspas.append((mover(caja(0.12, 1.1, 0.04), y=0.55, rz=90 * i) if False else mover(mover(caja(0.14, 1.1, 0.04), y=0.55), rz=90 * i), MADERA))
    nodos = [{'nombre': 'torre', 'partes': _molino_base()}, {'nombre': 'aspas', 'pos': (0, 2.0, 0.55), 'partes': aspas}]
    t = _tiempos(4, 25)
    return nodos, {'nombre': 'molino', 'tiempos': t, 'pistas': [(1, 'rotation', [quat((0, 0, 1), -360 * k / 24) for k in range(25)])]}


def _anim_orbita():
    nodos = [{'nombre': 'sol', 'partes': [(esfera(0.45, 12, 7), AMARILLO)], 'pos': (0, 1, 0)},
             {'nombre': 'orbita', 'pos': (0, 1, 0)},
             {'nombre': 'planeta', 'pos': (1.4, 0, 0), 'padre': 1, 'partes': [(esfera(0.2, 10, 6), AZUL)]},
             {'nombre': 'orbita_luna', 'pos': (0, 0, 0), 'padre': 2},
             {'nombre': 'luna', 'pos': (0.4, 0, 0), 'padre': 3, 'partes': [(esfera(0.08, 8, 4), GRIS)]}]
    t = _tiempos(6, 49)
    return nodos, {'nombre': 'orbita', 'tiempos': t, 'pistas': [(1, 'rotation', [quat((0, 1, 0), 360 * k / 48) for k in range(49)]),
                                                                (3, 'rotation', [quat((0, 1, 0), 360 * 4 * k / 48) for k in range(49)])]}


def _anim_cohete():
    def tr(k):
        return [0, max(0, (k - 0.3)) ** 2 * 6, 0]
    nodos = [{'nombre': 'plataforma', 'partes': [(mover(caja(1.2, 0.1, 1.2), y=0.05), OSCURO)]}, {'nombre': 'cohete', 'partes': _cohete()}]
    t = _tiempos(4, 41)
    tras = [tr(k / 40) for k in range(41)]
    return nodos, {'nombre': 'despegue', 'tiempos': t, 'pistas': [(1, 'translation', tras), (1, 'rotation', [quat((0, 1, 0), 120 * k / 40) for k in range(41)])]}


def _anim_reloj():
    nodos = [{'nombre': 'caratula', 'pos': (0, 1, 0), 'partes': [(mover(cilindro(0.7, 0.08, 20), rx=90), BLANCO), (mover(toro(0.7, 0.05, 20, 4), rx=90), OSCURO)]},
             {'nombre': 'minutero', 'pos': (0, 1, 0.06), 'partes': [(mover(caja(0.04, 0.55, 0.02), y=0.27), OSCURO)]},
             {'nombre': 'horario', 'pos': (0, 1, 0.07), 'partes': [(mover(caja(0.06, 0.35, 0.02), y=0.17), ROJO)]}]
    t = _tiempos(6, 49)
    return nodos, {'nombre': 'reloj', 'tiempos': t, 'pistas': [(1, 'rotation', [quat((0, 0, 1), -360 * k / 48) for k in range(49)]),
                                                               (2, 'rotation', [quat((0, 0, 1), -30 * k / 48) for k in range(49)])]}


def _anim_caminar():
    cuerpo = [p for p in _robot() if p[1] != OSCURO or p[0][:, :, 1].min() > 0.6]
    nodos = [{'nombre': 'robot', 'partes': cuerpo},
             {'nombre': 'pierna_izq', 'pos': (-0.2, 0.5, 0), 'partes': [(mover(caja(0.2, 0.5, 0.2), y=-0.25), OSCURO)]},
             {'nombre': 'pierna_der', 'pos': (0.2, 0.5, 0), 'partes': [(mover(caja(0.2, 0.5, 0.2), y=-0.25), OSCURO)]},
             {'nombre': 'brazo_izq', 'pos': (-0.45, 1.25, 0), 'partes': [(mover(caja(0.16, 0.6, 0.16), y=-0.3), OSCURO)]},
             {'nombre': 'brazo_der', 'pos': (0.45, 1.25, 0), 'partes': [(mover(caja(0.16, 0.6, 0.16), y=-0.3), OSCURO)]}]
    n = 33
    t = _tiempos(1.2, n)
    ang = [30 * math.sin(2 * math.pi * k / (n - 1)) for k in range(n)]
    return nodos, {'nombre': 'caminar', 'tiempos': t, 'pistas': [(1, 'rotation', [quat((1, 0, 0), a) for a in ang]), (2, 'rotation', [quat((1, 0, 0), -a) for a in ang]),
                                                                 (3, 'rotation', [quat((1, 0, 0), -a) for a in ang]), (4, 'rotation', [quat((1, 0, 0), a) for a in ang]),
                                                                 (0, 'translation', [[0, abs(math.sin(2 * math.pi * k / (n - 1))) * 0.05, 0] for k in range(n)])]}


def _anim_aleteo():
    ala = [(mover(caja(0.8, 0.04, 0.4), x=0.4), AZUL)]
    nodos = [{'nombre': 'cuerpo', 'pos': (0, 1, 0), 'partes': [(mover(esfera(0.25, 10, 6)) * np.array([1.6, 1, 1], dtype=np.float32), AZUL), (mover(cono(0.06, 0.15, 6), rz=-90, x=0.45), AMARILLO)]},
             {'nombre': 'ala_izq', 'pos': (0, 0.05, 0.1), 'padre': 0, 'partes': [(mover(t, ry=90), c) for t, c in ala]},
             {'nombre': 'ala_der', 'pos': (0, 0.05, -0.1), 'padre': 0, 'partes': [(mover(t, ry=-90), c) for t, c in ala]}]
    n = 21
    t = _tiempos(0.8, n)
    ang = [45 * math.sin(2 * math.pi * k / (n - 1)) for k in range(n)]
    return nodos, {'nombre': 'aleteo', 'tiempos': t, 'pistas': [(1, 'rotation', [quat((1, 0, 0), a) for a in ang]), (2, 'rotation', [quat((1, 0, 0), -a) for a in ang])]}


def _anim_ola():
    nodos, pistas = [], []
    n = 25
    for i in range(7):
        nodos.append({'nombre': f'cubo_{i}', 'pos': (i * 0.45 - 1.35, 0.2, 0), 'partes': [(caja(0.38, 0.38, 0.38), NEON if i % 2 else AMATISTA)]})
        pistas.append((i, 'translation', [[i * 0.45 - 1.35, 0.2 + 0.5 * max(0, math.sin(2 * math.pi * k / (n - 1) - i * 0.6)), 0] for k in range(n)]))
    return nodos, {'nombre': 'ola', 'tiempos': _tiempos(2, n), 'pistas': pistas}


def _anim_engranes():
    nodos = [{'nombre': 'grande', 'pos': (-0.55, 1, 0), 'partes': [(mover(t, rx=90), c) for t, c in _engrane(0.6, 12, 0.15, GRIS)]},
             {'nombre': 'chico', 'pos': (0.5, 1, 0), 'partes': [(mover(t, rx=90), c) for t, c in _engrane(0.4, 8, 0.15, AMARILLO)]}]
    n = 25
    return nodos, {'nombre': 'engranes', 'tiempos': _tiempos(4, n), 'pistas': [(0, 'rotation', [quat((0, 0, 1), 360 * k / (n - 1)) for k in range(n)]),
                                                                               (1, 'rotation', [quat((0, 0, 1), -360 * 1.5 * k / (n - 1)) for k in range(n)])]}


def _anim_resorte():
    espiras = [(mover(toro(0.3, 0.04, 12, 4), y=0.1 + i * 0.12), GRIS) for i in range(8)]
    n = 25
    return _anim_simple('resorte', espiras + [(mover(caja(0.7, 0.08, 0.7), y=1.05), ROJO)], 1.5, 'scale', lambda k: [1, 1 - 0.35 * (0.5 + 0.5 * math.cos(2 * math.pi * k)), 1], n)


def _anim_trompo():
    trompo = [(mover(cono(0.4, 0.6, 12), rx=180, y=0.35), ROJO), (mover(cilindro(0.4, 0.1, 12), y=0.7), AMARILLO), (mover(cilindro(0.05, 0.25, 6), y=0.88), MADERA2)]
    n = 33
    nodos = [{'nombre': 'trompo', 'partes': trompo}]
    rot = []
    for k in range(n):
        q1 = quat((0, 1, 0), 720 * k / (n - 1))
        inclina = quat((1, 0, 0), 8 * math.sin(2 * math.pi * k / (n - 1)))
        x1, y1, z1, w1 = inclina
        x2, y2, z2, w2 = q1
        rot.append([w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2, w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2, w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2, w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2])
    return nodos, {'nombre': 'trompo', 'tiempos': _tiempos(2, n), 'pistas': [(0, 'rotation', rot)]}


def _anim_columpio():
    nodos = [{'nombre': 'estructura', 'partes': [(mover(caja(1.6, 0.1, 0.1), y=2), MADERA2), (mover(caja(0.1, 2, 0.1), x=-0.75, y=1), MADERA2), (mover(caja(0.1, 2, 0.1), x=0.75, y=1), MADERA2)]},
             {'nombre': 'asiento', 'pos': (0, 2, 0), 'partes': [(mover(cilindro(0.015, 1.5, 4), x=-0.3, y=-0.75), GRIS), (mover(cilindro(0.015, 1.5, 4), x=0.3, y=-0.75), GRIS),
                                                                 (mover(caja(0.7, 0.06, 0.3), y=-1.5), ROJO)]}]
    n = 33
    return nodos, {'nombre': 'columpio', 'tiempos': _tiempos(2.4, n), 'pistas': [(1, 'rotation', [quat((1, 0, 0), 30 * math.sin(2 * math.pi * k / (n - 1))) for k in range(n)])]}


def _anim_moneda():
    return _anim_simple('moneda_gira', _moneda(), 1.5, 'rotation', lambda k: quat((0, 1, 0), 360 * k))


def _anim_cofre():
    nodos = [{'nombre': 'base', 'partes': [(mover(caja(0.9, 0.5, 0.6), y=0.25), MADERA), (mover(caja(0.12, 0.16, 0.05), y=0.45, z=0.31), AMARILLO)]},
             {'nombre': 'tapa', 'pos': (0, 0.5, -0.3), 'partes': [(mover(caja(0.92, 0.18, 0.62), y=0.09, z=0.3), MADERA2)]},
             {'nombre': 'brillo', 'pos': (0, 0.55, 0), 'partes': [(cristal, c) for cristal, c in [(mover(cono(0.15, 0.3, 6), y=0.1), AMATISTA)]]}]
    n = 31
    return nodos, {'nombre': 'cofre', 'tiempos': _tiempos(3, n), 'pistas': [(1, 'rotation', [quat((1, 0, 0), -80 * min(1, k / 12)) for k in range(n)]),
                                                                           (2, 'translation', [[0, 0.3 + 0.5 * max(0, (k - 10) / 20), 0] for k in range(n)]),
                                                                           (2, 'rotation', [quat((0, 1, 0), 360 * k / (n - 1)) for k in range(n)])]}


ANIMACIONES = [
    ('girar', 'Girar en su lugar', 'básicas', _anim_girar), ('rebotar', 'Rebote con squash and stretch', 'básicas', _anim_rebotar),
    ('flotar', 'Flotar', 'básicas', _anim_flotar), ('latido', 'Latido', 'básicas', _anim_latido), ('pendulo', 'Péndulo', 'física', _anim_pendulo),
    ('columpio', 'Columpio', 'física', _anim_columpio), ('resorte', 'Resorte', 'física', _anim_resorte), ('trompo', 'Trompo', 'física', _anim_trompo),
    ('puerta', 'Puerta que se abre', 'objetos', _anim_puerta), ('cofre', 'Cofre del tesoro', 'objetos', _anim_cofre), ('moneda_gira', 'Moneda que gira', 'juego', _anim_moneda),
    ('molino', 'Molino de viento', 'mecánica', _anim_molino), ('engranes', 'Engranes', 'mecánica', _anim_engranes), ('reloj', 'Reloj', 'mecánica', _anim_reloj),
    ('orbita', 'Órbita (sol, planeta y luna)', 'jerarquía', _anim_orbita), ('despegue', 'Despegue del cohete', 'vehículos', _anim_cohete),
    ('caminar', 'Ciclo de caminata (robot)', 'personajes', _anim_caminar), ('aleteo', 'Aleteo de pájaro', 'personajes', _anim_aleteo),
    ('ola', 'Ola de cubos', 'movimiento', _anim_ola),
]


def estado_en(animacion, k):
    """Estado de cada nodo en la fracción k (0..1) de la animación, interpolando entre cuadros clave."""
    n = len(animacion['tiempos'])
    pos = k * (n - 1)
    i = min(int(pos), n - 2)
    f = pos - i
    estado = {}
    for nodo, ruta, valores in animacion['pistas']:
        a, b = np.array(valores[i], dtype=float), np.array(valores[i + 1], dtype=float)
        if ruta == 'rotation' and np.dot(a, b) < 0:
            b = -b
        v = a * (1 - f) + b * f
        if ruta == 'rotation':
            v = v / (np.linalg.norm(v) + 1e-9)
        estado.setdefault(nodo, {})[ruta] = v
    return estado
