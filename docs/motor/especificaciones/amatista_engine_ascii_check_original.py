# AMATISTA ENGINE - ASCII CHECK FOR BLENDER 5.1
# Open this file directly in Blender:
# Scripting > Open > Run Script
#
# Do NOT copy/paste only fragments.
# Run this entire file.

import sys
from pathlib import Path

import bpy


def hr(char="=", n=70):
    print(char * n)


def ok(msg):
    print("[OK] " + msg)


def fail(msg):
    print("[FAIL] " + msg)


def info(msg):
    print("[INFO] " + msg)


hr()
print("AMATISTA ENGINE - BLENDER CHECK")
hr()

info("Blender version: " + bpy.app.version_string)
info("Python version: " + sys.version.split()[0])


def is_project_root(path):
    try:
        return (
            path.is_dir()
            and (path / "amatista_engine").is_dir()
            and (path / "practices" / "sandbox" / "table.json").is_file()
        )
    except Exception:
        return False


def add_candidate(items, path):
    try:
        path = Path(path)
    except Exception:
        return
    if path not in items:
        items.append(path)


candidates = []

# Path of the text opened in Blender, when available.
try:
    text = bpy.context.space_data.text
    if text and text.filepath:
        current_file = Path(bpy.path.abspath(text.filepath)).resolve()
        add_candidate(candidates, current_file.parent)
        add_candidate(candidates, current_file.parent / "amatista_engine_starter")
        add_candidate(candidates, current_file.parent.parent)
except Exception:
    pass

# __file__ when Blender exposes it.
try:
    current_file = Path(__file__).resolve()
    add_candidate(candidates, current_file.parent)
    add_candidate(candidates, current_file.parent / "amatista_engine_starter")
    add_candidate(candidates, current_file.parent.parent)
except Exception:
    pass

# Common locations.
home = Path.home()

for base in (
    home / "Desktop",
    home / "Documents",
    home / "Downloads",
    Path(r"C:\mnt\data"),
    Path(r"C:\amatista"),
    Path(r"C:\amatista_engine_starter"),
):
    add_candidate(candidates, base)
    add_candidate(candidates, base / "amatista_engine_starter")

PROJECT_ROOT = None

for candidate in candidates:
    if is_project_root(candidate):
        PROJECT_ROOT = candidate.resolve()
        break

# One-level search in Desktop/Documents/Downloads.
if PROJECT_ROOT is None:
    for base in (home / "Desktop", home / "Documents", home / "Downloads"):
        try:
            if not base.is_dir():
                continue
            for child in base.iterdir():
                if child.is_dir() and is_project_root(child):
                    PROJECT_ROOT = child.resolve()
                    break
                if child.is_dir():
                    nested = child / "amatista_engine_starter"
                    if is_project_root(nested):
                        PROJECT_ROOT = nested.resolve()
                        break
            if PROJECT_ROOT is not None:
                break
        except Exception:
            pass


hr("-")

if PROJECT_ROOT is None:
    fail("Project folder was not found.")
    print("")
    print("Expected folder structure:")
    print("  amatista_engine_starter/")
    print("    amatista_engine/")
    print("    practices/sandbox/table.json")
    print("")
    print("Put this check file inside amatista_engine_starter")
    print("and run it again from Blender.")
    hr()
    raise RuntimeError("Amatista project folder not found")

ok("Project found: " + str(PROJECT_ROOT))

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

try:
    from amatista_engine import create_default_engine
    from amatista_engine.models import SceneObject, SceneState
    from amatista_engine.practice import load_practice
    from amatista_engine.blender.adapter import capture_scene
except Exception as exc:
    fail("Could not import Amatista Engine.")
    print("Error type: " + type(exc).__name__)
    print("Error: " + str(exc))
    hr()
    raise

ok("Amatista Engine imported correctly.")

practice_path = PROJECT_ROOT / "practices" / "sandbox" / "table.json"

try:
    practice = load_practice(practice_path)
except Exception as exc:
    fail("Could not load table.json.")
    print("Path: " + str(practice_path))
    print("Error type: " + type(exc).__name__)
    print("Error: " + str(exc))
    hr()
    raise

ok("Practice loaded: " + practice.title)
info("Practice id: " + practice.id)
info("Targets: " + str(len(practice.targets)))

engine = create_default_engine()

# ------------------------------------------------------------
# TEST 1: ENGINE CORE WITH A CONTROLLED SCENE
# ------------------------------------------------------------

test_scene = SceneState(
    blender_version=bpy.app.version_string,
    file_path="amatista_test.blend",
    file_saved=True,
    objects=(
        SceneObject(
            name="Top",
            object_type="MESH",
            roles=("cubierta",),
            dimensions=(2.0, 1.0, 0.15),
        ),
        SceneObject(name="Leg1", object_type="MESH", roles=("pata",)),
        SceneObject(name="Leg2", object_type="MESH", roles=("pata",)),
        SceneObject(name="Leg3", object_type="MESH", roles=("pata",)),
        SceneObject(name="Leg4", object_type="MESH", roles=("pata",)),
    ),
)

internal_report = engine.evaluate(practice, test_scene)

hr("-")
print("TEST 1 - ENGINE CORE")
hr("-")

for result in internal_report.results:
    if result.passed is True:
        mark = "OK"
    elif result.passed is False:
        mark = "FAIL"
    else:
        mark = "UNKNOWN"
    print("[" + mark + "] " + result.target_id + ": " + result.message)

print("")
print("Internal progress: " + str(internal_report.progress) + "%")
print("Internal completed: " + str(internal_report.completed))

core_ok = (
    internal_report.progress == 100.0
    and internal_report.completed is True
)

if core_ok:
    ok("Engine core is working.")
else:
    fail("Engine core did not reach 100 percent.")


# ------------------------------------------------------------
# TEST 2: REAL BLENDER SCENE
# ------------------------------------------------------------

try:
    real_scene = capture_scene()
except Exception as exc:
    fail("Blender adapter could not capture the real scene.")
    print("Error type: " + type(exc).__name__)
    print("Error: " + str(exc))
    hr()
    raise

ok("Blender scene captured.")
info("Objects detected: " + str(len(real_scene.objects)))
info("Blend file: " + (real_scene.file_path or "(not saved yet)"))

real_report = engine.evaluate(practice, real_scene)

hr("-")
print("TEST 2 - REAL BLENDER SCENE")
hr("-")

for result in real_report.results:
    if result.passed is True:
        mark = "OK"
    elif result.passed is False:
        mark = "FAIL"
    else:
        mark = "UNKNOWN"
    print("[" + mark + "] " + result.target_id + ": " + result.message)

print("")
print("Real progress: " + str(real_report.progress) + "%")
print("Real completed: " + str(real_report.completed))


# ------------------------------------------------------------
# FINAL RESULT
# ------------------------------------------------------------

hr()
print("FINAL RESULT")
hr()

if core_ok:
    ok("AMATISTA ENGINE IS RUNNING INSIDE BLENDER.")
    ok("JSON loader works.")
    ok("Validator registry works.")
    ok("Progress calculation works.")
    ok("bpy adapter works.")
    ok("Real Blender scene can be evaluated.")
else:
    fail("Amatista Engine core still has an internal problem.")

print("")

if real_report.completed:
    ok("Your current Blender scene completes the practice at 100 percent.")
else:
    info("Engine works, but the current scene does not complete the practice.")
    print("")
    print("To complete the sample practice:")
    print("  1. One object needs custom property:")
    print('       amatista_role = "cubierta"')
    print("  2. Four objects need custom property:")
    print('       amatista_role = "pata"')
    print("  3. The cubierta Z dimension must be between 0.05 and 0.30.")
    print("  4. Save the .blend file.")

hr()
print("END OF AMATISTA ENGINE CHECK")
hr()
