"""Pruebas del generador de la biblioteca: texturas que se repiten sin costuras y modelos glTF válidos.

    python -m pytest -q herramientas/biblioteca
"""
import json
import struct
import sys
from pathlib import Path

import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).parent))
import modelos as M  # noqa: E402
import texturas as T  # noqa: E402


def leer_glb(datos):
    magia, version, largo = struct.unpack_from('<III', datos, 0)
    assert magia == 0x46546C67 and version == 2 and largo == len(datos)
    largo_json, tipo = struct.unpack_from('<II', datos, 12)
    assert tipo == 0x4E4F534A
    return json.loads(datos[20:20 + largo_json])


@pytest.mark.parametrize('id_', [m[0] for m in T.MATERIALES])
def test_textura_sin_costuras(id_):
    color, altura, rugosidad, fuerza = T.generar(id_, 128)
    assert color.shape == (128, 128, 3) and altura.shape == (128, 128)
    assert np.ndim(rugosidad) == 0 or np.shape(rugosidad) == (128, 128)  # constante o mapa
    assert fuerza > 0
    # Al repetirse, el salto entre el borde derecho y el izquierdo no puede ser mayor que el
    # mayor salto que ya hay dentro de la imagen (por ejemplo, la junta entre dos ladrillos).
    for eje in (0, 1):
        borde = np.abs(np.take(altura, -1, axis=eje) - np.take(altura, 0, axis=eje)).mean()
        interior = np.abs(np.diff(altura, axis=eje)).mean(axis=1 - eje).max()
        assert borde <= interior * 1.05 + 1e-6, (id_, eje)


def test_hay_materiales_unicos():
    ids = [m[0] for m in T.MATERIALES]
    assert len(ids) == len(set(ids)) >= 40


def test_modelos_glb_validos_y_hacia_afuera():
    for id_, _, _, fn in M.MODELOS[:10]:
        partes = fn()
        gltf = leer_glb(M.glb([{'nombre': id_, 'partes': partes}], nombre=id_))
        assert gltf['asset']['version'] == '2.0' and gltf['meshes']
        for tri, _ in partes:
            # Volumen con signo positivo: las caras miran hacia afuera.
            t = np.asarray(tri).reshape(-1, 3, 3)
            volumen = np.einsum('ij,ij->i', t[:, 0], np.cross(t[:, 1], t[:, 2])).sum() / 6
            assert volumen > -1e-9, id_


def test_animaciones_traen_pistas():
    for id_, _, _, fn in M.ANIMACIONES[:6]:
        nodos, anim = fn()
        gltf = leer_glb(M.glb(nodos, anim, nombre=id_))
        assert gltf['animations'][0]['channels'], id_
