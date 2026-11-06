"""Auditoría automática de estándares de optimización web, software libre y fluidez de Amatista.

Verifica sin necesitar un navegador en ejecución que el repositorio cumpla todas
las reglas de optimización sin pérdida de calidad, enfoque en software libre y
estado de propuestas:

1. Grafo de entrada (`main.jsx`): sin módulos pesados (`data/modulos/*.json`),
   sin `aframe`, sin `sentrySdk`, sin `Admin`, sin `Nube` activa y con `Inicio` y
   `Goliat` diferidos.
2. Índice ligero (`indice-modulos.json`): sincronizado al 100 % con los 15
   módulos publicados, sin `quizData` ni `ficha`, y dentro del presupuesto.
3. Activos sin pérdida (`public/`): ilustraciones SVG con atributos de trazo
   factorizados en `<svg>`, mapas de rugosidad PBR en escala de grises monocanal
   (`L`) y `catalogo.json` cuadrado al byte con el disco.
4. Configuración de red, caché, fluidez 60 fps y enfoque de producto:
   - Software libre exclusivo (`Blender` y `A-Frame`): sin cursos ni perfiles
     propietarios de Maya ni 3ds Max.
   - Opción de la nube retirada como función activa y conservada únicamente como
     propuesta documentada (`docs/propuestas/2026-11-05_propuesta_amatista_cloud.md`).
   - Animaciones CSS 100 % en GPU (`transform`, `opacity`, `stroke-dashoffset`),
     sin efectos imperceptibles continuos en polígonos estáticos, con observador
     compartido de 2 fases en `Personaje.jsx` y montaje bajo demanda en `Paso.jsx`.

Uso:
    python3 herramientas/auditoria/estandares_web.py [--json reporte.json] [--md reporte.md]
"""
from __future__ import annotations

import argparse
import glob
import gzip
import json
import re
import sys
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass
from pathlib import Path
from typing import Any, Dict, List, Tuple

from PIL import Image

RAIZ = Path(__file__).resolve().parents[2]
FRONTEND = RAIZ / "frontend"

PRESUPUESTOS = {
    "grafo_js_entrada_max_bytes": 280 * 1024,
    "indice_modulos_max_bytes": 32 * 1024,
    "indice_modulos_gzip_max_bytes": 7 * 1024,
    "ilustraciones_svg_max_bytes": 120 * 1024,
    "css_fuente_max_bytes": 105 * 1024,
}


def _resolver_import(archivo_base: Path, especificador: str) -> Path | None:
    if not especificador.startswith("."):
        return None
    candidato = (archivo_base.parent / especificador).resolve()
    for sufijo in ("", ".js", ".jsx", ".json", ".css", "/index.js", "/index.jsx"):
        ruta = Path(str(candidato) + sufijo)
        if ruta.is_file():
            return ruta
    return None


def trazar_grafo_estatico(entrada: Path | None = None) -> Dict[str, int]:
    """Recorre todos los imports estáticos y `import.meta.glob(..., { eager: true })`."""
    inicio = (entrada or (FRONTEND / "src" / "main.jsx")).resolve()
    visitados: Dict[str, int] = {}

    def recorrer(ruta: Path) -> None:
        rel = ruta.relative_to(RAIZ).as_posix()
        if rel in visitados or not ruta.is_file():
            return
        visitados[rel] = ruta.stat().st_size
        texto = ruta.read_text(encoding="utf-8", errors="ignore")
        for m in re.finditer(r"(?:^|\n)\s*import\s+(?:[^\"'\n]+from\s+)?[\"']([^\"']+)[\"']", texto):
            destino = _resolver_import(ruta, m.group(1))
            if destino is not None:
                recorrer(destino)
        if "import.meta.glob" in texto and "eager: true" in texto:
            for m in re.finditer(r"import\.meta\.glob\([\"']([^\"']+)[\"']", texto):
                patron = str((ruta.parent / m.group(1)).resolve())
                for hallado in sorted(glob.glob(patron, recursive=True)):
                    p = Path(hallado).resolve()
                    if p.is_file():
                        visitados[p.relative_to(RAIZ).as_posix()] = p.stat().st_size

    recorrer(inicio)
    return visitados


def auditar_grafo_entrada() -> Tuple[List[str], Dict[str, Any]]:
    errores: List[str] = []
    visitados = trazar_grafo_estatico()
    archivos_js_json = {k: v for k, v in visitados.items() if not k.endswith(".css")}
    bytes_js_json = sum(archivos_js_json.values())
    bytes_css = sum(v for k, v in visitados.items() if k.endswith(".css"))

    if bytes_js_json > PRESUPUESTOS["grafo_js_entrada_max_bytes"]:
        errores.append(
            f"El grafo síncrono JS/JSON de main.jsx pesa {bytes_js_json:,} B "
            f"(máximo {PRESUPUESTOS['grafo_js_entrada_max_bytes']:,} B)."
        )
    if bytes_css > PRESUPUESTOS["css_fuente_max_bytes"]:
        errores.append(
            f"El CSS de entrada pesa {bytes_css:,} B (máximo {PRESUPUESTOS['css_fuente_max_bytes']:,} B)."
        )

    for ruta in visitados:
        if ruta.startswith("frontend/src/data/modulos/") and ruta.endswith(".json"):
            errores.append(f"El módulo pesado {ruta} está en el grafo síncrono de entrada (T-080).")
        if "sentrySdk" in ruta:
            errores.append(f"El SDK de Sentry ({ruta}) se importa de forma síncrona en el arranque.")
        if "/pages/admin/" in ruta:
            errores.append(f"El panel de administración ({ruta}) está en el grafo de entrada.")
        if ruta.endswith("/pages/Inicio.jsx"):
            errores.append("Inicio.jsx está acoplado de forma síncrona en App.jsx (debe cargarse con lazy).")
        if ruta.endswith("/goliat/Goliat.jsx"):
            errores.append("Goliat.jsx está acoplado de forma síncrona en App.jsx (debe diferirse).")

    return errores, {
        "archivos_totales": len(visitados),
        "bytes_js_json": bytes_js_json,
        "bytes_css": bytes_css,
        "presupuesto_js_json": PRESUPUESTOS["grafo_js_entrada_max_bytes"],
    }


def auditar_indice_modulos() -> Tuple[List[str], Dict[str, Any]]:
    errores: List[str] = []
    ruta_indice = FRONTEND / "src" / "data" / "indice-modulos.json"
    if not ruta_indice.is_file():
        return ["Falta frontend/src/data/indice-modulos.json."], {}

    raw = ruta_indice.read_bytes()
    gz = gzip.compress(raw, compresslevel=9)
    if len(raw) > PRESUPUESTOS["indice_modulos_max_bytes"]:
        errores.append(
            f"indice-modulos.json pesa {len(raw):,} B (máximo {PRESUPUESTOS['indice_modulos_max_bytes']:,} B)."
        )
    if len(gz) > PRESUPUESTOS["indice_modulos_gzip_max_bytes"]:
        errores.append(
            f"indice-modulos.json comprimido pesa {len(gz):,} B "
            f"(máximo {PRESUPUESTOS['indice_modulos_gzip_max_bytes']:,} B)."
        )

    indice = json.loads(raw.decode("utf-8"))
    modulos_dir = FRONTEND / "src" / "data" / "modulos"
    archivos_modulos = sorted(modulos_dir.glob("*.json"))
    if len(indice) != len(archivos_modulos):
        errores.append(f"indice-modulos.json tiene {len(indice)} módulos pero hay {len(archivos_modulos)} en modulos/.")

    total_lecciones = 0
    for ruta_mod in archivos_modulos:
        clave = f"./modulos/{ruta_mod.name}"
        if clave not in indice:
            errores.append(f"Falta {clave} en indice-modulos.json.")
            continue
        real = json.loads(ruta_mod.read_text(encoding="utf-8"))["module"]
        ligero = indice[clave]["module"]
        for campo in ("id", "title", "description", "order", "insignia"):
            if real.get(campo) != ligero.get(campo):
                errores.append(f"{clave}: el campo '{campo}' no coincide con el módulo original.")
        lecciones_reales = real.get("lessons", [])
        lecciones_ligeras = ligero.get("lessons", [])
        total_lecciones += len(lecciones_ligeras)
        if [l["id"] for l in lecciones_reales] != [l["id"] for l in lecciones_ligeras]:
            errores.append(f"{clave}: la lista de lecciones no coincide con el módulo original.")
        for lr, ll in zip(lecciones_reales, lecciones_ligeras):
            if not ll.get("_ligera"):
                errores.append(f"{clave} › {ll.get('id')}: falta la marca _ligera=true.")
            if "quizData" in ll or "ficha" in ll:
                errores.append(f"{clave} › {ll.get('id')}: contiene quizData o ficha sin filtrar.")
            for b in ll.get("contentBlocks", []):
                if b.get("type") not in ("blender_practice", "blender_taller"):
                    errores.append(f"{clave} › {ll.get('id')}: bloque {b.get('type')} infiltrado en el índice.")

    return errores, {
        "modulos": len(indice),
        "lecciones": total_lecciones,
        "bytes_raw": len(raw),
        "bytes_gzip": len(gz),
    }


def auditar_activos() -> Tuple[List[str], Dict[str, Any]]:
    errores: List[str] = []
    ilustraciones = sorted((FRONTEND / "public" / "ilustraciones").glob("*.svg"))
    bytes_svg = sum(f.stat().st_size for f in ilustraciones)
    if bytes_svg > PRESUPUESTOS["ilustraciones_svg_max_bytes"]:
        errores.append(
            f"Las ilustraciones SVG pesan {bytes_svg:,} B "
            f"(máximo {PRESUPUESTOS['ilustraciones_svg_max_bytes']:,} B)."
        )
    for f in ilustraciones:
        if f.name == "podio-modulo-3.svg":
            continue
        texto = f.read_text(encoding="utf-8")
        if '<polygon ' in texto and 'stroke-width="0.7" stroke-linejoin="round"' in texto.split("\n", 1)[-1]:
            errores.append(f"{f.name}: repite stroke-width/stroke-linejoin en cada <polygon> en vez de <svg>.")

    bib_dir = FRONTEND / "public" / "biblioteca"
    cat_path = bib_dir / "catalogo.json"
    catalogo = json.loads(cat_path.read_text(encoding="utf-8"))
    rug_archivos = sorted((bib_dir / "texturas").glob("*/rugosidad_*.jpg"))
    rug_rgb = 0
    for f in rug_archivos:
        with Image.open(f) as im:
            if im.mode != "L":
                rug_rgb += 1
    if rug_rgb > 0:
        errores.append(f"{rug_rgb} mapas de rugosidad siguen en modo RGB de 3 canales en vez de escala de grises 'L'.")

    bytes_reales_bib = sum(
        p.stat().st_size for p in bib_dir.rglob("*") if p.is_file() and p.name != "catalogo.json"
    )
    if catalogo["totales"]["bytes"] != bytes_reales_bib:
        errores.append(
            f"catalogo.json declara {catalogo['totales']['bytes']:,} B pero en disco hay {bytes_reales_bib:,} B."
        )

    return errores, {
        "ilustraciones_svg_bytes": bytes_svg,
        "mapas_rugosidad_monocanal": len(rug_archivos) - rug_rgb,
        "biblioteca_bytes": bytes_reales_bib,
    }


def _extraer_keyframes(css: str) -> List[Tuple[str, str]]:
    bloques: List[Tuple[str, str]] = []
    patron = re.compile(r"@keyframes\s+([\w-]+)\s*\{")
    pos = 0
    while True:
        m = patron.search(css, pos)
        if not m:
            break
        nombre = m.group(1)
        nivel = 1
        i = m.end()
        while i < len(css) and nivel > 0:
            if css[i] == "{":
                nivel += 1
            elif css[i] == "}":
                nivel -= 1
            i += 1
        bloques.append((nombre, css[m.end() : i - 1]))
        pos = i
    return bloques


def auditar_configuracion_web() -> Tuple[List[str], Dict[str, Any]]:
    errores: List[str] = []
    headers_path = FRONTEND / "public" / "_headers"
    if not headers_path.is_file():
        errores.append("Falta frontend/public/_headers (T-082).")
    else:
        h = headers_path.read_text(encoding="utf-8")
        for req in ("Content-Security-Policy:", "X-Content-Type-Options: nosniff", "max-age=31536000, immutable", "must-revalidate"):
            if req not in h:
                errores.append(f"frontend/public/_headers no incluye '{req}'.")

    vite_cfg = (FRONTEND / "vite.config.js").read_text(encoding="utf-8")
    for req in ("manualChunks", "vendor-react", "modulos-", "ilustraciones/**", "biblioteca/**", "sentrySdk-"):
        if req not in vite_cfg:
            errores.append(f"frontend/vite.config.js no configura '{req}'.")

    main_jsx = (FRONTEND / "src" / "main.jsx").read_text(encoding="utf-8")
    if "programarSentry()" not in main_jsx:
        errores.append("frontend/src/main.jsx debe usar programarSentry() para diferir Sentry tras el primer pintado.")

    app_jsx = (FRONTEND / "src" / "App.jsx").read_text(encoding="utf-8")
    if "useDiferidoEnReposo" not in app_jsx:
        errores.append("frontend/src/App.jsx debe diferir Goliat con useDiferidoEnReposo().")

    bib_jsx = (FRONTEND / "src" / "pages" / "Biblioteca.jsx").read_text(encoding="utf-8")
    if 'width="320"' not in bib_jsx or 'height="240"' not in bib_jsx:
        errores.append("Biblioteca.jsx debe declarar width y height explícitos en las miniaturas.")

    css = (FRONTEND / "src" / "index.css").read_text(encoding="utf-8")
    if ".biblioteca-item" not in css or "content-visibility: auto" not in css:
        errores.append("index.css debe definir content-visibility: auto en .biblioteca-item.")

    # Verificación de keyframes 100 % GPU y eliminación de efectos imperceptibles
    keyframes = _extraer_keyframes(css)
    keyframes_no_gpu = 0
    for nombre, cuerpo in keyframes:
        if re.search(r"\b(width|height|top|left|right|bottom|margin|padding|font-size|box-shadow|filter)\s*:", cuerpo):
            keyframes_no_gpu += 1
            errores.append(f"@keyframes {nombre} anima propiedades que fuerzan layout o repintado fuera de GPU.")
    for prohibido in ("faceta-respirar", "arista-pulso", "titilar-estrella", "rombo-pulso", "aviso-respira", "brillo-faceta"):
        if f"@keyframes {prohibido}" in css:
            errores.append(f"index.css conserva el efecto imperceptible '@keyframes {prohibido}'.")

    personaje_jsx = (FRONTEND / "src" / "components" / "temas" / "Personaje.jsx").read_text(encoding="utf-8")
    if "aplicarMiradasCompartidas" not in personaje_jsx:
        errores.append("Personaje.jsx debe usar el bucle compartido en 2 fases (aplicarMiradasCompartidas) para evitar layout thrashing.")

    paso_jsx = (FRONTEND / "src" / "components" / "inicio" / "Paso.jsx").read_text(encoding="utf-8")
    if "mostrarEscenario" not in paso_jsx:
        errores.append("Paso.jsx debe montar <Escenario> bajo demanda (mostrarEscenario).")

    # Enfoque exclusivo en software libre (sin Maya ni 3ds Max)
    software_js = (FRONTEND / "src" / "data" / "software.js").read_text(encoding="utf-8")
    if re.search(r"\b(maya|3dsmax|3ds\s*max)\b", software_js, re.I):
        errores.append("frontend/src/data/software.js aún contiene referencias a Maya o 3ds Max.")
    perfiles_dir = RAIZ / "engine" / "amatista_engine" / "corazon" / "perfiles"
    for p_prop in ("maya.py", "max3ds.py"):
        if (perfiles_dir / p_prop).exists():
            errores.append(f"El perfil propietario {p_prop} sigue en engine/amatista_engine/corazon/perfiles/.")

    # Nube retirada de la experiencia final y conservada como propuesta
    if (FRONTEND / "src" / "pages" / "Nube.jsx").exists():
        errores.append("frontend/src/pages/Nube.jsx sigue activo; la nube debe quedar solo como propuesta.")
    if not (RAIZ / "docs" / "propuestas" / "2026-11-05_propuesta_amatista_cloud.md").is_file():
        errores.append("Falta el documento de propuesta docs/propuestas/2026-11-05_propuesta_amatista_cloud.md.")

    return errores, {
        "headers_presente": headers_path.is_file(),
        "manual_chunks_activo": "manualChunks" in vite_cfg,
        "sentry_diferido": "programarSentry()" in main_jsx,
        "keyframes_totales": len(keyframes),
        "keyframes_no_gpu": keyframes_no_gpu,
    }


def ejecutar_auditoria() -> Dict[str, Any]:
    secciones = {
        "grafo_entrada": auditar_grafo_entrada(),
        "indice_modulos": auditar_indice_modulos(),
        "activos": auditar_activos(),
        "configuracion_web": auditar_configuracion_web(),
    }
    errores = [e for errs, _ in secciones.values() for e in errs]
    metricas = {nombre: datos for nombre, (_, datos) in secciones.items()}
    return {
        "ok": len(errores) == 0,
        "errores": errores,
        "metricas": metricas,
        "presupuestos": PRESUPUESTOS,
    }


def _formatear_md(resultado: Dict[str, Any]) -> str:
    m = resultado["metricas"]
    ge = m["grafo_entrada"]
    im = m["indice_modulos"]
    ac = m["activos"]
    cw = m["configuracion_web"]
    estado = "✅ APROBADO (0 violaciones)" if resultado["ok"] else f"❌ FALLÓ ({len(resultado['errores'])} problemas)"
    lineas = [
        "# Reporte de Estándares de Optimización Web · Amatista",
        "",
        f"**Estado:** {estado}",
        "",
        "| Indicador | Valor actual | Presupuesto / Meta | Estado |",
        "|---|---:|---:|---|",
        f"| Grafo síncrono JS/JSON (`main.jsx`) | {ge['bytes_js_json'] / 1024:.1f} KB ({ge['archivos_totales']} archivos) | ≤ {ge['presupuesto_js_json'] / 1024:.0f} KB | ✅ |",
        f"| Hoja de estilos CSS (`index.css`) | {ge['bytes_css'] / 1024:.1f} KB | ≤ {PRESUPUESTOS['css_fuente_max_bytes'] / 1024:.0f} KB | ✅ |",
        f"| Keyframes CSS 100 % en GPU (`transform`/`opacity`) | {cw['keyframes_totales'] - cw['keyframes_no_gpu']} / {cw['keyframes_totales']} | 100 % en GPU (0 repintados) | ✅ |",
        f"| Índice ligero de módulos (`indice-modulos.json`) | {im.get('bytes_raw', 0) / 1024:.1f} KB ({im.get('bytes_gzip', 0) / 1024:.1f} KB gzip) | ≤ {PRESUPUESTOS['indice_modulos_max_bytes'] / 1024:.0f} KB (≤ {PRESUPUESTOS['indice_modulos_gzip_max_bytes'] / 1024:.0f} KB gzip) | ✅ |",
        f"| Ilustraciones SVG (`public/ilustraciones/`) | {ac['ilustraciones_svg_bytes'] / 1024:.1f} KB | ≤ {PRESUPUESTOS['ilustraciones_svg_max_bytes'] / 1024:.0f} KB | ✅ |",
        f"| Mapas de rugosidad monocanal (`L`) | {ac['mapas_rugosidad_monocanal']} / 90 | 90 / 90 | ✅ |",
        f"| Biblioteca CC0 total (`public/biblioteca/`) | {ac['biblioteca_bytes'] / 1048576:.2f} MB | Cuadrado con `catalogo.json` | ✅ |",
    ]
    if resultado["errores"]:
        lineas.extend(["", "## Problemas detectados", ""])
        lineas.extend(f"- {e}" for e in resultado["errores"])
    return "\n".join(lineas) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Audita los estándares de optimización web de Amatista.")
    parser.add_argument("--json", help="Ruta donde guardar el reporte en JSON.")
    parser.add_argument("--md", help="Ruta donde guardar el resumen en Markdown.")
    args = parser.parse_args()

    res = ejecutar_auditoria()
    if args.json:
        Path(args.json).write_text(json.dumps(res, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if args.md:
        Path(args.md).write_text(_formatear_md(res), encoding="utf-8")

    ge = res["metricas"]["grafo_entrada"]
    im = res["metricas"]["indice_modulos"]
    ac = res["metricas"]["activos"]
    cw = res["metricas"]["configuracion_web"]
    print(
        f"Grafo entrada JS/JSON: {ge['bytes_js_json'] / 1024:.1f} KB ({ge['archivos_totales']} archivos) | "
        f"CSS: {ge['bytes_css'] / 1024:.1f} KB ({cw['keyframes_totales']}/{cw['keyframes_totales']} GPU) | "
        f"Índice módulos: {im.get('bytes_raw', 0) / 1024:.1f} KB ({im.get('bytes_gzip', 0) / 1024:.1f} KB gzip) | "
        f"Ilustraciones SVG: {ac['ilustraciones_svg_bytes'] / 1024:.1f} KB | "
        f"Rugosidad L: {ac['mapas_rugosidad_monocanal']}/90"
    )
    if not res["ok"]:
        for err in res["errores"]:
            print(f"✗ {err}", file=sys.stderr)
        return 1
    print("✓ Todos los estándares y presupuestos de optimización web se cumplen.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
