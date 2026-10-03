"""Adaptador Blender -> Amatista SceneState.

Este archivo se ejecuta únicamente dentro de Blender.
"""

from ..models import SceneObject, SceneState


def capture_scene():
    import bpy

    objects = []

    for obj in bpy.context.scene.objects:
        role = obj.get("amatista_role")
        roles = (str(role),) if role else ()

        modifiers = tuple(
            modifier.type
            for modifier in getattr(obj, "modifiers", ())
        )

        objects.append(
            SceneObject(
                name=obj.name,
                object_type=obj.type,
                roles=roles,
                location=tuple(float(v) for v in obj.location),
                rotation=tuple(float(v) for v in obj.rotation_euler),
                scale=tuple(float(v) for v in obj.scale),
                dimensions=tuple(float(v) for v in obj.dimensions),
                modifiers=modifiers,
            )
        )

    file_path = bpy.data.filepath or ""

    return SceneState(
        blender_version=bpy.app.version_string,
        file_path=file_path,
        file_saved=bool(file_path) and not bpy.data.is_dirty,
        objects=tuple(objects),
    )
