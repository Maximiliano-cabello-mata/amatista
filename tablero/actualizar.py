"""Genera KANBAN.md a partir de tablero/tareas.yml y del historial de git.

Kanban dirigido por git: el estado de cada tarea se deduce de los commits que
la mencionan (en cualquier rama). No se guarda estado: cada ejecución
recalcula todo, así que no hay conflictos entre ramas.

Palabras clave en el mensaje del commit (mayúsculas o minúsculas):
    T-007                     → en progreso
    revision T-007            → en revisión
    cierra T-007 / closes T-007 / fix T-007
                              → hecho si el commit ya está en main;
                                en revisión si todavía está en otra rama
    reabre T-007              → vuelve a pendiente

Además publica la sección "Contenido": el estado de cada módulo de
frontend/src/data/modulos/*.json (borrador → revision → publicado), así el
flujo de contenido se ve en el mismo tablero sin mantenerlo a mano.

Uso: python tablero/actualizar.py   (requiere PyYAML)
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import yaml

RAIZ = Path(__file__).resolve().parent.parent
TAREAS = RAIZ / "tablero" / "tareas.yml"
SALIDA = RAIZ / "KANBAN.md"
MODULOS = RAIZ / "frontend" / "src" / "data" / "modulos"

ESTADOS = ["pendiente", "en-progreso", "revision", "hecho"]
COLUMNAS = {
    "pendiente": "📋 Pendiente",
    "en-progreso": "🔨 En progreso",
    "revision": "👀 Revisión",
    "hecho": "✅ Hecho",
}

ID = r"T-(\d+)"
CIERRA = re.compile(r"\b(?:cierra|cerrar|closes?|closed|fix(?:es|ed)?|resuelve|hecho)\s+" + ID, re.I)
REVISION = re.compile(r"\b(?:revisi[oó]n|review)\s+" + ID, re.I)
REABRE = re.compile(r"\b(?:reabre|reopen)\s+" + ID, re.I)
MENCION = re.compile(r"\b" + ID)

# Flujo de contenido (mismos estados que valida backend/contenido/validacion.py).
ESTADOS_CONTENIDO = ["borrador", "revision", "publicado", "archivado"]
ICONOS_CONTENIDO = {"borrador": "📝", "revision": "👀", "publicado": "✅", "archivado": "🗄️", "error": "⚠️"}
BLOQUES_INTERACTIVOS = {
    "quiz_inline", "ordering", "matching", "fill_blanks", "hotspots", "scene_explorer", "code_challenge",
}
PASOS_FORMULA = ["gancho", "explora", "practica", "reto", "jefe"]
PREFIJO_MODULO = re.compile(r"^\s*M[óo]dulo\s+\d+\s*[:.\-–—]\s*", re.I)
ARCHIVO_MODULO = re.compile(r"^(.+)-modulo-(\d+)\.json$")


def git(*args):
    return subprocess.run(["git", *args], cwd=RAIZ, capture_output=True, text=True, check=True).stdout


def normalizar(numero):
    return f"T-{int(numero):03d}"


def existe(ref):
    return subprocess.run(["git", "rev-parse", "-q", "--verify", ref], cwd=RAIZ, capture_output=True).returncode == 0


def ramas_principales():
    """main local y remoto: en una copia local main puede ir adelante o atrás de origin/main."""
    return [ref for ref in ("main", "origin/main") if existe(ref)] or ["HEAD"]


def leer_commits():
    """Commits de todas las ramas, del más viejo al más nuevo."""
    salida = git("log", "--all", "--reverse", "--format=%H%x1f%cs%x1f%B%x1e")
    commits = []
    for bloque in salida.split("\x1e"):
        if bloque.strip():
            sha, fecha, mensaje = bloque.strip("\n").split("\x1f", 2)
            commits.append((sha, fecha, mensaje))
    return commits


def calcular_estados(tareas, commits, en_main):
    estado = {t["id"]: t.get("estado", "pendiente") for t in tareas}
    actividad = {t["id"]: [] for t in tareas}
    desconocidas = set()

    def avanzar(tarea, nuevo):
        if ESTADOS.index(nuevo) > ESTADOS.index(estado[tarea]):
            estado[tarea] = nuevo

    for sha, fecha, mensaje in commits:
        cerradas = {normalizar(n) for n in CIERRA.findall(mensaje)}
        revision = {normalizar(n) for n in REVISION.findall(mensaje)}
        reabiertas = {normalizar(n) for n in REABRE.findall(mensaje)}
        for tarea in {normalizar(n) for n in MENCION.findall(mensaje)}:
            if tarea not in estado:
                desconocidas.add(tarea)
                continue
            actividad[tarea].append((sha[:7], fecha))
            if tarea in reabiertas:
                estado[tarea] = "pendiente"
            elif tarea in cerradas:
                avanzar(tarea, "hecho" if sha in en_main else "revision")
            elif tarea in revision:
                avanzar(tarea, "revision")
            else:
                avanzar(tarea, "en-progreso")
    return estado, actividad, desconocidas


def leer_modulos(carpeta=MODULOS):
    """Un resumen por archivo de módulo, en orden estable (curso, número, archivo).

    Un archivo ilegible no detiene el tablero: aparece con estado "error".
    """
    filas = []
    for ruta in sorted(carpeta.glob("*.json")):
        nombre = ARCHIVO_MODULO.match(ruta.name)
        fila = {
            "archivo": ruta.name,
            "curso": nombre.group(1) if nombre else "—",
            "numero": int(nombre.group(2)) if nombre else 0,
            "titulo": ruta.stem,
            "estado": "error",
            "lecciones": 0,
            "interactivos": 0,
            "pasos": [],
        }
        try:
            modulo = json.loads(ruta.read_text(encoding="utf-8"))["module"]
            lecciones = [l for l in modulo.get("lessons") or [] if isinstance(l, dict)]
        except (OSError, ValueError, KeyError, TypeError, AttributeError):
            filas.append(fila)
            continue
        bloques = [b for l in lecciones for b in l.get("contentBlocks") or [] if isinstance(b, dict)]
        # Sin "estado" el frontend lo toma como publicado (JSON anteriores a la v2.2).
        estado = modulo.get("estado") or "publicado"
        orden = modulo.get("order")
        fila.update(
            curso=modulo.get("curso") or fila["curso"],
            numero=orden if isinstance(orden, int) else fila["numero"],
            titulo=PREFIJO_MODULO.sub("", str(modulo.get("title") or ruta.stem)),
            estado=estado if estado in ESTADOS_CONTENIDO else "error",
            lecciones=len(lecciones),
            interactivos=sum(b.get("type") in BLOQUES_INTERACTIVOS for b in bloques),
            pasos=[p for p in PASOS_FORMULA if any(l.get("formula") == p for l in lecciones)],
        )
        filas.append(fila)
    return sorted(filas, key=lambda f: (str(f["curso"]), f["numero"], f["archivo"]))


def seccion_contenido(modulos):
    lineas = [
        "## 📚 Contenido",
        "",
        "> Sale de `frontend/src/data/modulos/*.json` (campo `estado` de cada módulo). Flujo:",
        "> 📝 borrador → 👀 revision → ✅ publicado. Solo lo publicado llega a los alumnos",
        "> ([la Fórmula](docs/arquitectura/2026-10-02_formula_modulos.txt)).",
        "",
    ]
    if not modulos:
        return lineas + ["Todavía no hay módulos en `frontend/src/data/modulos/`.", ""]
    cuenta = {e: sum(m["estado"] == e for m in modulos) for e in ESTADOS_CONTENIDO + ["error"]}
    resumen = " → ".join(f"{ICONOS_CONTENIDO[e]} {e} ({cuenta[e]})" for e in ESTADOS_CONTENIDO[:3])
    extras = [f"{ICONOS_CONTENIDO[e]} {e} ({cuenta[e]})" for e in ("archivado", "error") if cuenta[e]]
    lineas += [resumen + (" · " + " · ".join(extras) if extras else ""), ""]
    lineas += [
        "| Curso | Módulo | Título | Estado | Lecciones | Bloques interactivos | Fórmula |",
        "|---|---|---|---|---|---|---|",
    ]
    for m in modulos:
        titulo = m["titulo"].replace("|", "\\|")
        estado = f"{ICONOS_CONTENIDO[m['estado']]} {m['estado']}"
        formula = f"{len(m['pasos'])}/{len(PASOS_FORMULA)}" if m["pasos"] else "—"
        lineas.append(
            f"| {m['curso']} | {m['numero']} | {titulo} | {estado} | {m['lecciones']} | {m['interactivos']} | {formula} |"
        )
    return lineas + [""]


def barra(hechas, total, ancho=10):
    llenos = round(ancho * hechas / total) if total else 0
    return "▰" * llenos + "▱" * (ancho - llenos)


def generar(datos, estado, actividad, publicadas, principal, modulos=()):
    tareas = datos["tareas"]
    por_id = {t["id"]: t for t in tareas}
    # Fecha del último commit (no la hora actual): si nada cambió, el archivo
    # queda igual y el workflow no hace un commit vacío.
    ultimo = git("log", "--all", "-1", "--format=%cd", "--date=format:%Y-%m-%d %H:%M").strip()
    cabeza = git("rev-parse", "--short", principal).strip()

    lineas = [
        "# Tablero de Amatista",
        "",
        "> Se genera solo con cada push: **no se edita a mano**. Las tareas se crean en",
        "> [`tablero/tareas.yml`](tablero/tareas.yml) y se mueven con los commits",
        "> ([cómo](tablero/README.md)).",
        "",
        f"Último commit: {ultimo} · `{principal}` en `{cabeza}`",
        "",
        "## 🗺️ Roadmap",
        "",
        "| Versión | Meta | Objetivo | Avance |",
        "|---|---|---|---|",
    ]
    for etapa in datos["roadmap"]:
        suyas = [t for t in tareas if t["version"] == etapa["version"]]
        hechas = sum(estado[t["id"]] == "hecho" for t in suyas)
        version = etapa["version"] + (" ✔️ publicada" if etapa["version"] in publicadas else "")
        avance = f"{barra(hechas, len(suyas))} {hechas}/{len(suyas)}"
        lineas.append(f"| **{version}** | {etapa['nombre']} | {etapa['objetivo']} | {avance} |")
    if publicadas:
        lineas += ["", "Versiones publicadas (tags): " + " · ".join(f"`{v}`" for v in publicadas)]

    lineas += ["", "## 📌 Kanban", ""]
    columnas = {e: [t["id"] for t in tareas if estado[t["id"]] == e] for e in ESTADOS}
    lineas.append("| " + " | ".join(f"{COLUMNAS[e]} ({len(columnas[e])})" for e in ESTADOS) + " |")
    lineas.append("|" + "---|" * len(ESTADOS))
    for fila in range(max(len(c) for c in columnas.values()) or 1):
        celdas = []
        for e in ESTADOS:
            if fila < len(columnas[e]):
                t = por_id[columnas[e][fila]]
                celdas.append(f"**{t['id']}** {t['titulo']}<br><sub>{t['version']} · {t.get('area', '—')}</sub>")
            else:
                celdas.append(" ")
        lineas.append("| " + " | ".join(celdas) + " |")

    lineas += [""] + seccion_contenido(list(modulos))
    lineas += ["## 🧾 Detalle por versión", ""]
    for etapa in datos["roadmap"]:
        lineas += [f"### {etapa['version']} · {etapa['nombre']}", ""]
        for t in (t for t in tareas if t["version"] == etapa["version"]):
            marca = "x" if estado[t["id"]] == "hecho" else " "
            ultimos = actividad[t["id"]][-3:]
            commits = f" — commits: {', '.join(f'`{s}` ({f})' for s, f in ultimos)}" if ultimos else ""
            lineas.append(f"- [{marca}] **{t['id']}** {t['titulo']} · _{estado[t['id']]}_{commits}")
        lineas.append("")
    return "\n".join(lineas).rstrip() + "\n"


def main():
    datos = yaml.safe_load(TAREAS.read_text(encoding="utf-8"))
    ids = [t["id"] for t in datos["tareas"]]
    repetidas = {i for i in ids if ids.count(i) > 1}
    if repetidas:
        sys.exit(f"IDs repetidos en tareas.yml: {', '.join(sorted(repetidas))}")

    principales = ramas_principales()
    principal = principales[0]
    en_main = set(git("rev-list", *principales).split())
    estado, actividad, desconocidas = calcular_estados(datos["tareas"], leer_commits(), en_main)
    publicadas = git("tag", "-l", "v*", "--sort=-v:refname").split()

    modulos = leer_modulos()
    SALIDA.write_text(generar(datos, estado, actividad, publicadas, principal, modulos), encoding="utf-8")
    resumen = ", ".join(f"{e}: {sum(v == e for v in estado.values())}" for e in ESTADOS)
    print(f"KANBAN.md actualizado ({resumen}; módulos: {len(modulos)})")
    con_error = [m["archivo"] for m in modulos if m["estado"] == "error"]
    if con_error:
        print(f"Aviso: módulos ilegibles o con estado desconocido: {', '.join(con_error)}")
    if desconocidas:
        print(f"Aviso: commits mencionan tareas que no están en tareas.yml: {', '.join(sorted(desconocidas))}")


if __name__ == "__main__":
    main()
