"""Biblioteca de recursos de Amatista: genera texturas PBR, modelos y animaciones (todo CC0) y su catálogo.

    python3 herramientas/biblioteca/generar.py                 # → frontend/public/biblioteca/
    python3 herramientas/biblioteca/generar.py --con-2k        # agrega texturas 2K (para la app de escritorio)

Salida:
    texturas/<id>/{color,normal,rugosidad}_{512,1k[,2k]}.jpg + vista.jpg
    modelos/<id>.glb + vista.jpg
    animaciones/<id>.glb + vista.webp (animada)
    catalogo.json  (contrato amatista.biblioteca/1: nombre, categoría, archivos, bytes, licencia)
Determinista: la misma versión del generador produce los mismos archivos.
"""
import argparse
import io
import json
import os
import sys
from datetime import date

import numpy as np
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import modelos as M  # noqa: E402
import texturas as T  # noqa: E402

RAIZ = os.path.abspath(os.path.join(AQUI, '..', '..'))
SALIDA = os.path.join(RAIZ, 'frontend', 'public', 'biblioteca')
VERSION = '1.0.0'
LICENCIA = {'id': 'CC0-1.0', 'texto': 'Dominio público: úsalo como quieras, sin atribución.', 'autor': 'Amatista (generado)'}


def jpg(img, ruta, calidad=86):
    modo = 'L' if img.mode == 'L' else 'RGB'
    img.convert(modo).save(ruta, 'JPEG', quality=calidad, optimize=True, progressive=True)
    return os.path.getsize(ruta)


def a_imagen(arr):
    return Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8))


def textura(id_, nombre, categoria, tamanos):
    carpeta = os.path.join(SALIDA, 'texturas', id_)
    os.makedirs(carpeta, exist_ok=True)
    n = max(tamanos.values())
    col, alto, rug, fuerza = T.generar(id_, n)
    alto = np.asarray(alto, dtype=np.float32)
    rug = np.broadcast_to(np.asarray(rug, dtype=np.float32), alto.shape)
    mapas = {'color': a_imagen(col), 'normal': a_imagen(T.mapa_normal(alto, fuerza)), 'rugosidad': a_imagen(rug)}
    archivos = {}
    for etiqueta, lado in tamanos.items():
        for mapa, img in mapas.items():
            ruta = os.path.join(carpeta, f'{mapa}_{etiqueta}.jpg')
            bytes_ = jpg(img.resize((lado, lado), Image.LANCZOS) if lado != n else img, ruta)
            archivos.setdefault(etiqueta, {})[mapa] = {'ruta': f'texturas/{id_}/{mapa}_{etiqueta}.jpg', 'bytes': bytes_}
    vista = os.path.join(carpeta, 'vista.jpg')
    jpg(mapas['color'].resize((256, 256), Image.LANCZOS), vista, 82)
    return {'id': id_, 'tipo': 'textura', 'nombre': nombre, 'categoria': categoria, 'vista': f'texturas/{id_}/vista.jpg',
            'mapas': ['color', 'normal', 'rugosidad'], 'resoluciones': archivos, 'tileable': True,
            'bytes': sum(m['bytes'] for r in archivos.values() for m in r.values())}


def modelo(id_, nombre, categoria, fn):
    carpeta = os.path.join(SALIDA, 'modelos')
    os.makedirs(carpeta, exist_ok=True)
    nodos = [{'nombre': id_, 'partes': fn()}]
    datos = M.glb(nodos, nombre=id_)
    ruta = os.path.join(carpeta, f'{id_}.glb')
    open(ruta, 'wb').write(datos)
    vista = M.vista(nodos, tam=(640, 480)).resize((320, 240), Image.LANCZOS)
    jpg(vista, os.path.join(carpeta, f'{id_}.jpg'), 84)
    triangulos = sum(len(t) for t, _ in nodos[0]['partes'])
    return {'id': id_, 'tipo': 'modelo', 'nombre': nombre, 'categoria': categoria, 'vista': f'modelos/{id_}.jpg',
            'archivo': {'ruta': f'modelos/{id_}.glb', 'bytes': len(datos), 'formato': 'glb'}, 'triangulos': triangulos, 'bytes': len(datos)}


def animacion(id_, nombre, categoria, fn):
    carpeta = os.path.join(SALIDA, 'animaciones')
    os.makedirs(carpeta, exist_ok=True)
    nodos, anim = fn()
    datos = M.glb(nodos, anim, nombre=id_)
    open(os.path.join(carpeta, f'{id_}.glb'), 'wb').write(datos)
    # Encuadre fijo para toda la animación (que no «brinque» la cámara).
    todos = np.concatenate([np.concatenate([t for t, _ in M.triangulos_mundo(nodos, M.estado_en(anim, k / 8))]).reshape(-1, 3) for k in range(9)])
    centro = (todos.max(0) + todos.min(0)) / 2
    radio = np.linalg.norm(todos - centro, axis=1).max()
    cuadros = [M.vista(nodos, M.estado_en(anim, k / 24), tam=(480, 360), centro=centro, escala=radio).resize((240, 180), Image.LANCZOS) for k in range(24)]
    duracion = float(anim['tiempos'][-1])
    ruta_vista = os.path.join(carpeta, f'{id_}.webp')
    cuadros[0].save(ruta_vista, 'WEBP', save_all=True, append_images=cuadros[1:], duration=int(duracion * 1000 / 24), loop=0, quality=72)
    return {'id': id_, 'tipo': 'animacion', 'nombre': nombre, 'categoria': categoria, 'vista': f'animaciones/{id_}.webp',
            'archivo': {'ruta': f'animaciones/{id_}.glb', 'bytes': len(datos), 'formato': 'glb'}, 'duracion': duracion,
            'pistas': len(anim['pistas']), 'bytes': len(datos)}


def main():
    global SALIDA
    p = argparse.ArgumentParser()
    p.add_argument('--con-2k', action='store_true')
    p.add_argument('--salida', default=SALIDA)
    o = p.parse_args()
    SALIDA = os.path.abspath(o.salida)
    tamanos = {'512': 512, '1k': 1024, **({'2k': 2048} if o.con_2k else {})}
    recursos = []
    for i, (id_, nombre, cat) in enumerate(T.MATERIALES):
        recursos.append(textura(id_, nombre, cat, tamanos))
        print(f'textura {i + 1}/{len(T.MATERIALES)} {id_}', flush=True)
    recursos += [modelo(*m) for m in M.MODELOS]
    recursos += [animacion(*a) for a in M.ANIMACIONES]
    total = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(SALIDA) for f in fs if f != 'catalogo.json')
    catalogo = {'contrato': 'amatista.biblioteca/1', 'version': VERSION, 'generado': date.today().isoformat(), 'licencia': LICENCIA,
                'totales': {'texturas': len(T.MATERIALES), 'modelos': len(M.MODELOS), 'animaciones': len(M.ANIMACIONES), 'bytes': total},
                'recursos': recursos}
    with open(os.path.join(SALIDA, 'catalogo.json'), 'w', encoding='utf-8') as f:
        json.dump(catalogo, f, ensure_ascii=False, separators=(',', ':'))
    print(json.dumps(catalogo['totales'], ensure_ascii=False))


if __name__ == '__main__':
    main()
