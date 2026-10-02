#!/usr/bin/env bash
# =============================================================================
# Crea los tags de versión de Amatista sobre el historial existente.
#
# Uso (desde la raíz del repositorio):
#   bash herramientas/crear-tags.sh                      # crea los tags localmente
#   bash herramientas/crear-tags.sh --reemplazar-v0.2.0  # además quita v0.2.0
#   git push origin --tags                               # publica los tags
#
# Si tienes la firma SSH de git configurada (user.signingkey), los tags se
# firman (-s). Cada tag lleva la fecha de su commit, no la de hoy.
# v2.2.0-alpha.1 se creó a mano; v2.2.0-alpha.2 es el cierre del 2/10 (main con el panel de administración).
# Es seguro ejecutarlo varias veces: los tags que ya existen se saltan.
# =============================================================================
set -euo pipefail

# tag | commit | título
VERSIONES=(
  "v0.1.0|0772159|Prototipo: monorepo base y App Shell (React, Tailwind, visor A-Frame)"
  "v1.0.0|cde262b|V1 Integración: React → FastAPI → Oracle, sesiones y documentación organizada"
  "v2.0.0|0ea0e8a|V2 Plataforma educativa: identidad low poly, PWA offline, Módulo 1, progreso y backend en el repo"
  "v2.0.1|573ea89|Migración al repositorio oficial y firma SSH de commits"
  "v2.2.0-alpha.2|88dd539|Plataforma unificada (avance): panel de administración en la PWA (resumen, usuarios, contenido, editor de lecciones y sistema)"
)

git fetch --quiet origin --tags

if [[ "${1:-}" == "--reemplazar-v0.2.0" ]]; then
  # v0.2.0 apuntaba a la misma versión que ahora es v2.0.1.
  if git rev-parse -q --verify refs/tags/v0.2.0 >/dev/null; then
    git tag -d v0.2.0
    echo "· v0.2.0 eliminado localmente. Para quitarlo de GitHub: git push origin :refs/tags/v0.2.0"
  fi
fi

FIRMA="-a"
if git config --get user.signingkey >/dev/null; then FIRMA="-s"; fi

for linea in "${VERSIONES[@]}"; do
  IFS='|' read -r tag commit titulo <<<"$linea"
  if git rev-parse -q --verify "refs/tags/$tag" >/dev/null; then
    echo "· $tag ya existe, se salta"
    continue
  fi
  if ! git cat-file -e "$commit^{commit}" 2>/dev/null; then
    echo "✗ No encuentro el commit $commit para $tag (¿clon superficial? usa: git fetch --unshallow)" >&2
    exit 1
  fi
  fecha=$(git log -1 --format=%cI "$commit")
  GIT_COMMITTER_DATE="$fecha" git tag "$FIRMA" "$tag" "$commit" \
    -m "$tag — $titulo" \
    -m "Detalle de la versión en CHANGELOG.md."
  echo "✓ $tag → $commit ($fecha)"
done

echo
echo "Tags locales:"
git tag -n1 --sort=creatordate
echo
echo "Revisa y publica con: git push origin --tags"
