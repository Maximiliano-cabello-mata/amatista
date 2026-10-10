"""Experimento 2: el revisor de forma en las 13 prácticas con modelo de referencia (variantes sensatas y sinsentido)."""
import sys, json, glob, copy, random
from dataclasses import replace
sys.path.insert(0, 'engine')
from amatista_engine import create_default_engine
from amatista_engine.practice.loader import parse_practice
from amatista_engine.testing import Escena
motor = create_default_engine()
FORMA = ('shape.', 'spatial.', 'object.', 'role.', 'figure.', 'logic.')

def escena(partes):
    e = Escena()
    for p in partes:
        e.malla(p.get('primitive', 'cube'), dims=p['size'], loc=p['location'], rot=p.get('rotation', (0, 0, 0)))
    return replace(e.construir(), file_path='/tmp/x.blend', file_saved=True)

def acepta(practica, partes):
    s = escena(partes)
    r = motor.evaluate(practica, s)
    forma = {t.id for t in practica.targets if not t.optional and t.validator.startswith(FORMA)}
    fallan = [x.target_id for x in r.results if x.target_id in forma and not x.passed]
    return not fallan, fallan

def mod(partes, f):
    ps = copy.deepcopy(partes)
    for i, p in enumerate(ps): f(i, p)
    return ps

def escala(k):
    def f(i, p): p['size'] = [x * k for x in p['size']]; p['location'] = [c * k for c in p['location']]
    return f

def variantes(partes, semilla):
    rnd = random.Random(semilla)
    sens = {
        'copia': partes,
        '+25 %': mod(partes, escala(1.25)),
        '-20 %': mod(partes, escala(0.8)),
        'a 2 m': mod(partes, lambda i, p: p.__setitem__('location', [p['location'][0] + 2, p['location'][1] + 1, p['location'][2]])),
        'medidas ±15 %': mod(partes, lambda i, p: p.__setitem__('size', [x * rnd.uniform(0.87, 1.15) for x in p['size']])),
    }
    rnd2 = random.Random(semilla + 1)
    sin = {
        'apiladas': mod(partes, lambda i, p: p.__setitem__('location', [0, 0, p['size'][2] / 2])),
        'flotando 1.5 m': mod(partes, lambda i, p: p.__setitem__('location', [p['location'][0], p['location'][1], p['location'][2] + 1.5])),
        'todo cubos': mod(partes, lambda i, p: p.__setitem__('primitive', 'cube')),
        'piezas tiradas': mod(partes, lambda i, p: p.__setitem__('location', [rnd2.uniform(-5, 5), rnd2.uniform(-5, 5), p['size'][2] / 2])),
        'falta la mitad': partes[: max(1, len(partes) // 2)],
    }
    return sens, sin

tabla = []; tot = {'sens': [0, 0], 'sin': [0, 0]}
for ruta in sorted(glob.glob('practices/blender/*/*/practica.json')):
    d = json.load(open(ruta))
    partes = [p for p in (d.get('reference') or {}).get('parts', []) if p.get('compare', True) is not False and p.get('primitive') != 'plane']
    if len(partes) < 2: continue
    if any(p.get('join') for p in partes):
        print(f"{ruta.split('/')[2] + '/' + ruta.split('/')[3]:38} (malla modelada en Modo Edición: no se puede armar con primitivas, se excluye)"); continue
    pr = parse_practice(d)
    sens, sin = variantes(partes, 7)
    fila = {'practica': ruta.split('/')[2] + '/' + ruta.split('/')[3], 'nivel': d['level']}
    for grupo, casos, clave in (('sensatas aceptadas', sens, 'sens'), ('sinsentido rechazadas', sin, 'sin')):
        buenos = 0; detalle = {}
        for n, ps in casos.items():
            ok, f = acepta(pr, ps)
            bien = ok if clave == 'sens' else not ok
            buenos += bien; detalle[n] = ('ok' if bien else 'FALLA') + ('' if ok else ' ' + ','.join(f[:3]))
        fila[clave] = f'{buenos}/{len(casos)}'; fila[clave + '_detalle'] = detalle
        tot[clave][0] += buenos; tot[clave][1] += len(casos)
    tabla.append(fila)
    print(f"{fila['practica']:38} n{fila['nivel']} sensatas aceptadas {fila['sens']}  sinsentido rechazadas {fila['sin']}")
    for k in ('sens', 'sin'):
        malos = {n: v for n, v in fila[k + '_detalle'].items() if v.startswith('FALLA')}
        if malos: print('      ', k, malos)
print('TOTAL', tot)
json.dump({'tabla': tabla, 'total': tot}, open(sys.argv[-1], 'w'), ensure_ascii=False, indent=1)
