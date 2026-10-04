"""Pruebas del generador del tablero: python -m pytest -q tablero (requiere PyYAML)."""
import json
import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))

import actualizar  # noqa: E402


def escribir(carpeta, nombre, modulo):
    (carpeta / nombre).write_text(json.dumps({"module": modulo}), encoding="utf-8")


def test_tareas_yml_es_valido():
    datos = yaml.safe_load(actualizar.TAREAS.read_text(encoding="utf-8"))
    versiones = {etapa["version"] for etapa in datos["roadmap"]}
    ids = [t["id"] for t in datos["tareas"]]
    archivadas = set((datos.get("etapa") or {}).get("archivadas", []))
    assert len(ids) == len(set(ids))
    assert not archivadas & set(ids)
    for tarea in datos["tareas"]:
        assert tarea["version"] in versiones, tarea["id"]
        assert set(tarea.get("depende_de", [])) <= set(ids) | archivadas, tarea["id"]


def test_historico_del_tablero_existe():
    datos = yaml.safe_load(actualizar.TAREAS.read_text(encoding="utf-8"))
    etapa = datos.get("etapa") or {}
    for clave in ("plan", "historico"):
        if etapa.get(clave):
            assert (actualizar.RAIZ / etapa[clave]).exists(), etapa[clave]


def test_estados_por_commits():
    tareas = [{"id": "T-001"}, {"id": "T-002"}, {"id": "T-003"}, {"id": "T-004"}]
    commits = [
        ("a" * 40, "2026-10-01", "feat: algo T-1"),
        ("b" * 40, "2026-10-01", "fix: otra cosa\n\ncierra T-002"),
        ("c" * 40, "2026-10-02", "docs: revision T-003"),
        ("d" * 40, "2026-10-02", "feat: cierra T-004"),
        ("e" * 40, "2026-10-02", "reabre T-004"),
        ("f" * 40, "2026-10-02", "menciona T-099"),
    ]
    estado, actividad, desconocidas = actualizar.calcular_estados(tareas, commits, en_main={"b" * 40})
    assert estado == {"T-001": "en-progreso", "T-002": "hecho", "T-003": "revision", "T-004": "pendiente"}
    assert actividad["T-001"] == [("aaaaaaa", "2026-10-01")]
    assert desconocidas == {"T-099"}


def test_cierra_fuera_de_main_queda_en_revision():
    estado, _, _ = actualizar.calcular_estados([{"id": "T-007"}], [("a" * 40, "2026-10-02", "cierra T-007")], set())
    assert estado["T-007"] == "revision"


def test_leer_modulos_resume_el_flujo_de_contenido(tmp_path):
    escribir(tmp_path, "blender-modulo-2.json", {
        "title": "Módulo 2: Interfaz y navegación",
        "curso": "blender",
        "estado": "borrador",
        "order": 2,
        "lessons": [
            {"id": "les_005", "formula": "gancho", "contentBlocks": [
                {"type": "markdown_text"}, {"type": "hotspots"}, {"type": "quiz_inline"},
            ]},
            {"id": "les_006", "formula": "jefe", "type": "exam"},
        ],
    })
    # Sin "estado" ni "curso": publicado y curso deducido del nombre del archivo.
    escribir(tmp_path, "aframe-modulo-1.json", {"title": "La web en 3D", "lessons": [{"id": "les_af_001"}]})
    (tmp_path / "blender-modulo-3.json").write_text("{roto", encoding="utf-8")
    escribir(tmp_path, "blender-modulo-1.json", {"title": "Módulo 1: Base", "order": 1, "estado": "revision", "lessons": []})

    modulos = actualizar.leer_modulos(tmp_path)

    assert [(m["curso"], m["numero"]) for m in modulos] == [("aframe", 1), ("blender", 1), ("blender", 2), ("blender", 3)]
    aframe, uno, dos, roto = modulos
    assert aframe["estado"] == "publicado" and aframe["lecciones"] == 1
    assert uno["estado"] == "revision" and uno["titulo"] == "Base"
    assert dos["titulo"] == "Interfaz y navegación"
    assert dos["lecciones"] == 2 and dos["interactivos"] == 2
    assert dos["pasos"] == ["gancho", "jefe"]
    assert roto["estado"] == "error"


def test_seccion_contenido_es_determinista(tmp_path):
    escribir(tmp_path, "aframe-modulo-1.json", {"title": "A | B", "estado": "publicado", "lessons": [{"id": "x"}]})
    escribir(tmp_path, "blender-modulo-1.json", {"title": "C", "estado": "borrador", "lessons": [{"id": "y"}]})
    texto = "\n".join(actualizar.seccion_contenido(actualizar.leer_modulos(tmp_path)))
    assert texto == "\n".join(actualizar.seccion_contenido(actualizar.leer_modulos(tmp_path)))
    assert "📝 borrador (1) → 👀 revision (0) → ✅ publicado (1)" in texto
    assert "| aframe | 1 | A \\| B | ✅ publicado | 1 | 0 | — |" in texto
    assert "| blender | 1 | C | 📝 borrador | 1 | 0 | — |" in texto


def test_seccion_contenido_sin_modulos():
    assert "Todavía no hay módulos" in "\n".join(actualizar.seccion_contenido([]))


def test_notas_del_yaml_en_el_detalle():
    tarea = {"id": "T-001", "bloqueo": "después del piloto", "evidencia": ["PR #1", "bitácora"], "aceptacion": ""}
    assert actualizar.notas_de(tarea) == [
        "  - ⏸️ Espera: después del piloto",
        "  - 🔎 Evidencia: PR #1; bitácora",
    ]
    assert actualizar.notas_de({"id": "T-002"}) == []
