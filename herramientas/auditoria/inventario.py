"""Inventario del repositorio, archivo por archivo.

Recorre lo que Git versiona y, por cada archivo, anota: área, tipo, bytes, líneas, si es prueba,
si tiene una prueba hermana, y cuántas marcas pendientes (TODO, FIXME, XXX, HACK) tiene.
Luego resume por área y señala huecos: código sin prueba, archivos muy grandes, pendientes.

Uso:
    python herramientas/auditoria/inventario.py                    # resumen en la terminal
    python herramientas/auditoria/inventario.py --csv inventario.csv --md resumen.md
"""
from __future__ import annotations

import argparse
import csv
import re
import subprocess
from collections import defaultdict
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
CODIGO = {'.py', '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx'}
TEXTO = CODIGO | {'.md', '.json', '.yml', '.yaml', '.toml', '.css', '.html', '.txt', '.sh', '.ps1', '.sql', '.jsonc', '.ini', '.cfg'}
PENDIENTE = re.compile(r'\b(TODO|FIXME|XXX|HACK)\b')
GRANDE = 600  # líneas: a partir de aquí conviene partir el archivo

TIPOS = {
    **{e: 'código' for e in CODIGO}, '.md': 'documentación', '.json': 'datos', '.yml': 'configuración', '.yaml': 'configuración',
    '.toml': 'configuración', '.css': 'estilos', '.html': 'página', '.png': 'imagen', '.jpg': 'imagen', '.jpeg': 'imagen',
    '.webp': 'imagen', '.svg': 'imagen', '.glb': 'modelo 3D', '.woff2': 'fuente', '.ttf': 'fuente', '.sh': 'script',
    '.ps1': 'script', '.sql': 'datos', '.blend': 'modelo 3D', '.zip': 'paquete', '.mp4': 'video', '.wav': 'audio', '.mp3': 'audio',
}


def es_prueba(ruta: str) -> bool:
    nombre = Path(ruta).name
    return bool(re.search(r'(^test_|_test\.py$|\.test\.(js|jsx|mjs|ts|tsx)$|\.spec\.)', nombre)) or '/tests/' in f'/{ruta}' or '/pruebas/' in f'/{ruta}'


def area(ruta: str) -> str:
    partes = ruta.split('/')
    if partes[0] == 'frontend' and len(partes) > 2 and partes[1] == 'src':
        return f'frontend/src/{partes[2]}' if len(partes) > 3 else 'frontend/src'
    if partes[0] == 'frontend' and len(partes) > 2 and partes[1] == 'public':
        return f'frontend/public/{partes[2]}' if len(partes) > 3 else 'frontend/public'
    if partes[0] in {'backend', 'engine', 'docs', 'addon', 'herramientas'} and len(partes) > 2:
        return f'{partes[0]}/{partes[1]}'
    return partes[0] if len(partes) > 1 else '(raíz)'


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('--csv')
    ap.add_argument('--md')
    args = ap.parse_args()

    rutas = subprocess.run(['git', 'ls-files'], cwd=RAIZ, capture_output=True, text=True, check=True).stdout.split('\n')
    rutas = [r for r in rutas if r and (RAIZ / r).is_file()]
    pruebas_por_nombre = defaultdict(set)
    for r in rutas:
        if es_prueba(r):
            base = re.sub(r'(^test_|_test$|\.test$|\.spec$)', '', Path(r).stem)
            pruebas_por_nombre[base.lower()].add(r)

    # Un módulo cuenta como probado si tiene prueba hermana o si alguna prueba lo importa por su nombre.
    textos_prueba = '\n'.join((RAIZ / r).read_text(encoding='utf-8', errors='replace') for r in rutas if es_prueba(r) and Path(r).suffix in CODIGO)
    importados = set(re.findall(r"(?:from\s+[\w.]*?\.?|import\s+|/)(\w+)(?:['\".\s]|$)", textos_prueba))

    filas = []
    for r in rutas:
        p = RAIZ / r
        ext = p.suffix.lower()
        bytes_ = p.stat().st_size
        lineas = pendientes = 0
        if ext in TEXTO and bytes_ < 3_000_000:
            texto = p.read_text(encoding='utf-8', errors='replace')
            lineas = texto.count('\n') + (0 if texto.endswith('\n') or not texto else 1)
            pendientes = len(PENDIENTE.findall(texto)) if ext in CODIGO and r != 'herramientas/auditoria/inventario.py' else 0
        prueba = es_prueba(r)
        tiene_prueba = None
        if ext in CODIGO and not prueba:
            tiene_prueba = Path(r).stem.lower() in pruebas_por_nombre or Path(r).stem in importados
        filas.append({
            'ruta': r, 'area': area(r), 'tipo': TIPOS.get(ext, 'otro'), 'bytes': bytes_, 'lineas': lineas,
            'es_prueba': prueba, 'tiene_prueba': tiene_prueba, 'pendientes': pendientes,
        })

    por_area = defaultdict(lambda: defaultdict(int))
    for f in filas:
        a = por_area[f['area']]
        a['archivos'] += 1
        a['bytes'] += f['bytes']
        a['lineas'] += f['lineas']
        a['pruebas'] += f['es_prueba']
        a['codigo'] += f['tipo'] == 'código' and not f['es_prueba']
        a['sin_prueba'] += f['tiene_prueba'] is False
        a['pendientes'] += f['pendientes']

    total = sum(f['bytes'] for f in filas)
    print(f'{len(filas)} archivos versionados, {total / 1048576:.1f} MB, {sum(f["lineas"] for f in filas):,} líneas')
    print(f'{"Área":38} {"arch":>5} {"MB":>6} {"líneas":>8} {"código":>6} {"pruebas":>7} {"sin prueba":>10} {"pend":>4}')
    for nombre, a in sorted(por_area.items(), key=lambda x: -x[1]['bytes']):
        print(f'{nombre:38} {a["archivos"]:5} {a["bytes"] / 1048576:6.2f} {a["lineas"]:8,} {a["codigo"]:6} {a["pruebas"]:7} {a["sin_prueba"]:10} {a["pendientes"]:4}')

    if args.csv:
        with open(args.csv, 'w', newline='', encoding='utf-8') as fh:
            w = csv.DictWriter(fh, fieldnames=list(filas[0]), lineterminator='\n')
            w.writeheader()
            w.writerows(filas)
    if args.md:
        grandes = sorted((f for f in filas if f['tipo'] == 'código' and f['lineas'] >= GRANDE), key=lambda f: -f['lineas'])
        pend = sorted((f for f in filas if f['pendientes']), key=lambda f: -f['pendientes'])
        lineas = ['| Área | Archivos | MB | Líneas | Código | Pruebas | Código sin prueba hermana | Pendientes |', '|---|--:|--:|--:|--:|--:|--:|--:|']
        for nombre, a in sorted(por_area.items()):
            lineas.append(f'| `{nombre}` | {a["archivos"]} | {a["bytes"] / 1048576:.2f} | {a["lineas"]:,} | {a["codigo"]} | {a["pruebas"]} | {a["sin_prueba"]} | {a["pendientes"]} |')
        lineas += ['', f'**Archivos de código con {GRANDE} líneas o más** (candidatos a dividir):', '']
        lineas += [f'- `{f["ruta"]}`: {f["lineas"]:,} líneas' for f in grandes] or ['- ninguno']
        lineas += ['', '**Marcas pendientes en el código** (TODO, FIXME, XXX, HACK):', '']
        lineas += [f'- `{f["ruta"]}`: {f["pendientes"]}' for f in pend[:25]] or ['- ninguna']
        Path(args.md).write_text('\n'.join(lineas) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
