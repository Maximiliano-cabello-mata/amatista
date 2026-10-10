"""Auditoría de las 18 prácticas: estructura, guía, propósito, repetición de habilidades."""
import sys, json, glob, re, collections
sys.path.insert(0, 'engine')
from amatista_engine import create_default_engine
from amatista_engine.practice.loader import parse_practice
from amatista_engine.testing import Escena
motor = create_default_engine()
TECLAS = re.compile(r"\b(Shift|Ctrl|Alt|Tab|Enter|F\d+)\b|(?<![\wáéíóú])[GRSEIXYZ](?:\s*[,y]?\s*(?:luego\s+)?[XYZ])?\s*(?:-?\d+(?:[.,]\d+)?)?(?![\wáéíóú])|Num\s*\d|\(\d\)")
DECIMAL = re.compile(r"\b\d+[.,]\d+\b|\b\d+\s*(?:m|cm|°|grados)\b")
SISTEMA = {'figure.recognize', 'example.matches', 'file.named', 'file.saved', 'role.assigned'}
filas = []; usos = collections.Counter(); usos_tool = collections.Counter(); orden = []
for ruta in sorted(glob.glob('practices/blender/*/*/practica.json'), key=lambda r: (['principiante','principiante-intermedio','intermedio'].index(r.split('/')[2]), r)):
    d = json.load(open(ruta)); p = parse_practice(d)
    req = [t for t in d['targets'] if not t.get('optional')]
    textos = []
    for t in req:
        textos += [t.get('title', ''), t.get('tip', '')] + list(t.get('hints', []) or [])
        g = t.get('guide') or {}
        textos += [s if isinstance(s, str) else s.get('text', '') for s in (g.get('steps') or [])]
    con_teclas = sum(1 for t in req if TECLAS.search(' '.join([t.get('tip', '')] + list(t.get('hints', []) or []))))
    numeros = sum(len(DECIMAL.findall(x)) for x in textos)
    e = Escena().construir(); r = motor.evaluate(p, e); g = motor.guide(p, e, r); ru = motor.route(p, r, g)
    sistema = sum(1 for t in req if t['validator'] in SISTEMA)
    for s in d.get('skills', []): usos[s] += 1
    for s in (d.get('tools') or {}).get('allowed', []): usos_tool[s] += 1
    filas.append(dict(practica=ruta.split('/')[2] + '/' + ruta.split('/')[3], titulo=d['title'], nivel=d['level'],
                      tipo='exploración' if 'exploracion' in d.get('tags', []) else 'proyecto',
                      minutos=d.get('estimatedMinutes'), misiones=ru.total, partes=len(ru.partes),
                      con_teclas=con_teclas, pct_teclas=round(100 * con_teclas / max(1, len(req))), numeros=numeros,
                      del_sistema=sistema, caracteres=sum(len(x) for x in textos), habilidades=d.get('skills', []),
                      descripcion=d.get('description', ''), referencia=len((d.get('reference') or {}).get('parts', []))))
    orden.append(d['id'])
for f in filas:
    print(f"{f['practica']:38} n{f['nivel']} {f['tipo']:11} {f['minutos']:>3}min mis={f['misiones']:>2} teclas={f['pct_teclas']:>3}% num={f['numeros']:>2} sis={f['del_sistema']} car={f['caracteres']:>5} hab={f['habilidades']}")
print('habilidades por cantidad de prácticas:', sorted(usos.items(), key=lambda x: -x[1]))
print('veces que aparece cada habilidad: 1 vez =', sum(1 for v in usos.values() if v == 1), 'de', len(usos))
print('herramientas:', sorted(usos_tool.items(), key=lambda x: -x[1]))
json.dump(dict(filas=filas, habilidades=usos, herramientas=usos_tool), open(sys.argv[-1], 'w'), ensure_ascii=False, indent=1)
