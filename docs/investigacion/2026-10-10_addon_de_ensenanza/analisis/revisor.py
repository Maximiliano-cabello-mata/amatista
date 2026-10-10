"""Experimento: ¿el revisor actual acepta trenes sensatos y rechaza sinsentidos?"""
import sys, json, math, copy, random
from dataclasses import replace
sys.path.insert(0, 'engine')
from amatista_engine import create_default_engine
from amatista_engine.practice.loader import parse_practice
from amatista_engine.testing import Escena

motor = create_default_engine()
DATOS = json.load(open('practices/blender/principiante/m1-tren/practica.json'))
REF = [p for p in DATOS['reference']['parts'] if p.get('compare', True) is not False]

def practica(nivel):
    d = copy.deepcopy(DATOS); d['level'] = nivel
    return parse_practice(d)

def escena(partes):
    e = Escena()
    for p in partes:
        e.malla(p['primitive'], nombre=p.get('name', ''), dims=p['size'], loc=p['location'], rot=p.get('rotation', (0, 0, 0)))
    s = e.construir()
    return replace(s, file_path='/tmp/mi_tren.blend', file_saved=True)

def base():
    return copy.deepcopy(REF)

def transformar(f):
    ps = base()
    for i, p in enumerate(ps): f(i, p)
    return ps

def es(prim, rol=None): return lambda p: p['primitive'] == prim and (rol is None or p.get('role') == rol)
RUEDA = lambda p: p.get('role') == 'rueda'

def escalar_todo(k):
    def f(i, p):
        p['size'] = [s * k for s in p['size']]; p['location'] = [c * k for c in p['location']]
    return f

def girar_z(i, p):
    x, y, z = p['location']; p['location'] = [-y, x, z]
    r = list(p.get('rotation', (0, 0, 0))); r[2] += 90; p['rotation'] = r
    if p['primitive'] == 'cube': p['size'] = [p['size'][1], p['size'][0], p['size'][2]]

SENSATOS = {
    'Copia exacta del modelo': base(),
    'Todo 30 % más grande': transformar(escalar_todo(1.3)),
    'Todo 30 % más chico': transformar(escalar_todo(0.7)),
    'Armado 3 m a un lado': transformar(lambda i, p: p.__setitem__('location', [p['location'][0] + 3, p['location'][1], p['location'][2]])),
    'Ruedas más gruesas y grandes': transformar(lambda i, p: RUEDA(p) and (p.__setitem__('size', [0.85, 0.85, 0.35]), p.__setitem__('location', [p['location'][0], p['location'][1] * 1.1, 0.425]))),
    'Ruedas con 5 cm de aire': transformar(lambda i, p: RUEDA(p) and p.__setitem__('location', [p['location'][0], p['location'][1], 0.40])),
    'Locomotora más larga': transformar(lambda i, p: i == 0 and (p.__setitem__('size', [2.7, 1.2, 1.1]), p.__setitem__('location', [1.5, 0, 0.9]))),
    'Tren girado 90°': transformar(girar_z),
    'Con faro decorativo': base() + [{'primitive': 'sphere', 'size': [0.3, 0.3, 0.3], 'location': [2.45, 0, 1.0]}],
}

def pila(i, p): p['location'] = [0, 0, p['size'][2] / 2]
def acostar(i, p):
    if RUEDA(p): p['rotation'] = [0, 0, 0]; p['size'] = [0.7, 0.7, 0.2]; p['location'] = [p['location'][0], p['location'][1], 0.1]
random.seed(4)
SINSENTIDO = {
    'Todas las piezas apiladas en el centro': transformar(pila),
    'Ruedas acostadas como platos': transformar(acostar),
    'Chimenea debajo del tren': transformar(lambda i, p: i == 2 and p.__setitem__('location', [1.9, 0, -0.3])),
    'Ruedas flotando a 1 m': transformar(lambda i, p: RUEDA(p) and p.__setitem__('location', [p['location'][0], p['location'][1], 1.35])),
    'Todo hecho con cubos': transformar(lambda i, p: p.__setitem__('primitive', 'cube')),
    'Ruedas tiradas lejos del tren': transformar(lambda i, p: RUEDA(p) and p.__setitem__('location', [random.uniform(-4, 4), random.choice((-3, 3)), 0.35])),
    'Vagón encima de la locomotora': transformar(lambda i, p: i == 1 and p.__setitem__('location', [1.25, 0, 2.0])),
    'Vagones separados 3 m': transformar(lambda i, p: i == 1 and p.__setitem__('location', [-4.0, 0, 0.85])),
    'Ruedas enterradas a la mitad': transformar(lambda i, p: RUEDA(p) and p.__setitem__('location', [p['location'][0], p['location'][1], 0.0])),
}

def revisar(partes, nivel):
    pr = practica(nivel); s = escena(partes)
    r = motor.evaluate(pr, s)
    fallan = [x.target_id for x in r.results if not x.passed and not pr.target(x.target_id).optional] if hasattr(r.results[0], 'target_id') else None
    return r.completed, fallan

filas = []
for grupo, casos in (('sensato', SENSATOS), ('sinsentido', SINSENTIDO)):
    for nombre, partes in casos.items():
        fila = {'grupo': grupo, 'caso': nombre}
        for nivel in (1, 3, 5):
            ok, fallan = revisar(partes, nivel)
            fila['n%d' % nivel] = ok; fila['f%d' % nivel] = fallan
        filas.append(fila)
for f in filas:
    print(f"{f['grupo']:10} {f['caso']:40} n1={'pasa' if f['n1'] else 'NO'}  n3={'pasa' if f['n3'] else 'NO'}  n5={'pasa' if f['n5'] else 'NO'}  fallan(n1)={f['f1']}")
json.dump(filas, open(sys.argv[-1], 'w'), ensure_ascii=False, indent=1)
