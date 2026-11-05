# 03 · Preservación, integridad y cadena de custodia

## Objetivo

Poder demostrar a qué **estado exacto del código** corresponde cada respaldo, quién lo conservó y cómo se verificó que no cambió. Este procedimiento facilita un expediente técnico, pero no sustituye una certificación de autoridad o fedatario.

## Crear un corte técnico fuera del repositorio público

Desde una computadora propia con Git, sobre una copia local de Amatista:

```bash
cd amatista
git status --short
git fetch origin
git rev-parse origin/main
git log -1 --format='%H%n%aI%n%cI%n%s' origin/main
```

Antes de preservar, comprobar que el árbol de trabajo esté limpio y que no haya archivos confidenciales rastreados.

Crear una copia **solo de archivos rastreados** por Git (no incluye archivos ignorados):

```bash
mkdir -p ../evidencias-amatista-privadas
CORTE="$(git rev-parse origin/main)"
git archive --format=zip --output="../evidencias-amatista-privadas/amatista-${CORTE}.zip" "$CORTE"
sha256sum "../evidencias-amatista-privadas/amatista-${CORTE}.zip"
```

En PowerShell, para calcular la misma huella:

```powershell
Get-FileHash "RUTA_COMPLETA_AL_ARCHIVO.zip" -Algorithm SHA256
```

**Atención:** `git archive` incluye todo lo rastreado en ese commit. Antes de guardar o enviar, verificar manualmente que nunca se hayan incorporado credenciales, información de alumnos ni material de terceros que no debas redistribuir. No subir el ZIP al repositorio público.

## Ficha mínima por preservación (almacenamiento privado)

```text
ID del corte:
Proyecto y componente:
Fecha/hora UTC de creación:
Responsable del corte:
URL del repositorio:
Rama y SHA completo del commit:
Versión de manifest/paquete (si aplica):
Nombre exacto del archivo preservado:
Tamaño (bytes):
SHA-256:
Herramienta y versión empleada:
Origen del archivo:
Destino del archivo y copia cifrada:
Fecha/hora y resultado de verificación posterior:
Vínculos de documentación y evidencia de pruebas:
Observaciones (cambios, incidencias o restricciones):
```

## Conservación

1. Guardar el ZIP, manifiesto, capturas originales y documentos de soporte en un **repositorio privado independiente**, con acceso limitado; para evidencia sensible, preferir archivo cifrado fuera de GitHub.
2. Mantener una segunda copia cifrada fuera del servicio GitHub.
3. Usar nombres estables; no reemplazar ni editar el archivo de un corte anterior.
4. Recalcular SHA-256 al transferir o recuperar el archivo y anotar cuándo se verificó.
5. Conservar acuses, mensajes y documentos externos originales con sus metadatos, sin publicar datos personales.
6. Considerar, cuando se necesite mayor fuerza probatoria, mecanismos especializados de sello de tiempo y asesoría jurídica. El hash por sí solo no demuestra quién creó un archivo ni una fecha oficial.

## Precauciones

- No confundir SHA de Git con un dictamen de autoría.
- No confundir fecha de un commit con sello de tiempo certificado.
- No guardar en GitHub secretos ni respaldos de producción, aun si se agregan a una rama aparte de un repositorio público.
