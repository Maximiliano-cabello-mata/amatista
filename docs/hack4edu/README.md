# Amatista en Hack4Edu

Todo lo que pide la competencia, en un solo lugar: qué es el proyecto, qué ya teníamos, qué se construye durante Hack4Edu, cómo comprobarlo y el material para el video.

| Documento | Para qué |
|---|---|
| **Este README** | El proyecto, el antes y el ahora, y cómo comprobarlo |
| [REQUISITOS.md](REQUISITOS.md) | Lo que suele pedir Hack4Edu y cómo lo cumplimos (hay que confirmarlo con las bases 2026) |
| [video/](video/README.md) | Guion, escenas gráficas, capturas reales y el primer corte del video |
| [../CORTE_HACK4EDU.md](../CORTE_HACK4EDU.md) | La auditoría del corte y el plan por día hasta el viernes 6 |
| [G7B › docs/hack4edu](https://github.com/Maximiliano-cabello-mata/amatista-g7b-etl/tree/main/docs/hack4edu) | El mismo antes y ahora, del lado del motor de datos |

## 1. El proyecto en un párrafo

**Amatista** enseña 3D paso a paso, en español, con Blender y A-Frame, **en la computadora que cada estudiante tiene**:
- es una PWA que funciona sin conexión;
- sus lecciones duran menos de diez minutos;
- tiene prácticas en Blender que un add-on revisa en vivo;
- tiene un Estudio A-Frame para llevar el 3D a la web y a la realidad virtual.

La rodean dos proyectos hermanos:
- **G7B**, que mide cómo corre el 3D libre en equipos reales y reúne el conocimiento técnico;
- **Geoda**, el kernel que usa esas mediciones para **adaptar Blender a cada equipo**, con una versión y unos ajustes que se pueden deshacer.

La regla de datos: lo personal se queda en Amatista; G7B solo recibe mediciones sin identificar o agregados de 5 equipos o más.

## 2. La línea que separa el antes del ahora

La etiqueta de Git **`hack4edu`** existe en los dos repositorios y marca el corte del **3 de noviembre de 2026**:

| Repo | La etiqueta apunta a | Lo que contiene |
|---|---|---|
| `amatista` | `7c8be0e` | La plataforma hasta el corte, más la portada viva y el documento del corte (trabajo del 3-nov, antes de etiquetar) |
| `amatista-g7b-etl` | `3aad461` | El `main` del 2 de noviembre: la primera integración de datos real |

```bash
git show hack4edu --stat            # el corte
git log --oneline hack4edu          # lo que ya teníamos
git log --oneline hack4edu..main    # lo construido durante Hack4Edu
git diff --stat hack4edu..main      # qué archivos cambiaron desde el corte
```

> **Nota del 3 de noviembre:** los cuatro commits del corte en `amatista` (`1e34d28`, `df5c7c4`, `732bb94` y `7c8be0e`) solo estaban en la etiqueta: su rama no se subió. Desde ahora también están en la rama `claude/peaceful-tesla-ctqaps` y entran a `main` con su PR, sin perder la etiqueta.

## 3. Lo que YA TENÍAMOS (hasta la etiqueta `hack4edu`)

Proyecto iniciado el 27 de septiembre de 2026 (prototipo 0.1.0): 16 versiones etiquetadas, de `v1.0.0` a `v3.0.0-alpha.10`, más el corte. Cifras **comprobadas el 3 de noviembre** corriendo cada comando en la etiqueta:

| Pieza | Evidencia | Comando |
|---|---|---|
| **PWA** (React + Vite, sin conexión, diseño Facetas v4.4, portada viva) | 46 suites y **390 pruebas** pasan; lint sin errores; 87 recursos precacheados; revisión de publicación en verde | `cd frontend && npm ci && npm run lint && npm test && npm run build` |
| **API** (FastAPI + Oracle, sincronización comprimida, Sentry sin datos personales) | **446 pruebas** pasan | `cd backend && pip install -r requirements-dev.txt && python -m pytest -q` |
| **Motor, Corazón 1.0 y tablero** (Python puro, sin Blender) | **594 pruebas** pasan | `pip install pyyaml && python -m pytest -q tablero engine/tests` |
| **Prácticas de Blender** | **58 de 58** pasan con su ejemplo resuelto | `python -X utf8 engine/herramientas/practicas.py probar` |
| **Catálogo** | **15 de 15** módulos cumplen la Fórmula Amatista | `cd backend && python herramientas/contenido.py validar` |
| **Producción** | `amatista-3d.tech` (Cloudflare Workers) y `api.amatista-3d.tech` (Oracle Cloud) | [Bitácora del despliegue](../despliegue/2026-10-29_despliegue_publico_amatista_3d_tech.md) |
| **G7B** (repo hermano) | 987 documentos publicados en MongoDB; sonda v0 | [G7B › hack4edu](https://github.com/Maximiliano-cabello-mata/amatista-g7b-etl/tree/main/docs/hack4edu) |

## 4. Lo construido DURANTE Hack4Edu (después de la etiqueta)

| Fecha | Repo | Qué | Evidencia |
|---|---|---|---|
| 3-nov | G7B | **Telemetría real** (sonda y Blender Open Data) y **cubo** Parquet + DuckDB verificados en Azure: 3,003 mediciones | PR #14 y #15 de G7B |
| 3-nov | G7B | **Geoda, cimientos:** nivel N0–N4 de cada equipo, perfiles con evidencia desde el cubo, modelo de costos v0 y plan con acciones reversibles para Blender (18 pruebas) | `geoda/` y `docs/GEODA.md` de G7B |
| 3-nov | G7B | **Consolidación:** Geodar Radar (31 fuentes), Azure privado, auditoría documental y Deepnote (112 pruebas en total) | PR #10 de G7B |
| 3-nov | Amatista | **Centro de Hack4Edu** (este directorio), requisitos y **kit del video**: 9 escenas gráficas, 14 capturas reales y el primer corte del video de 2:09 | `docs/hack4edu/` |
| 3-nov | Amatista | Rescate de los commits del corte a una rama y corrección de dos comandos del documento del corte | `git log hack4edu..claude/peaceful-tesla-ctqaps` |
| 4 al 6-nov | Ambos | El puente G7B ↔ Amatista: `perfiles.json` en el add-on (T-188), caché y `/api/g7b/v1/recomendacion` (T-196 a T-198), consentimiento (T-187) y recomendaciones en Mi panel (T-192) | [Plan por día](../CORTE_HACK4EDU.md#3-lo-que-se-va-a-trabajar-hasta-el-viernes-hack4edu--4-al-6-de-noviembre) |

**Total de pruebas automáticas en verde al 3 de noviembre: 1,542** (390 + 446 + 594 + 112).

## 5. Cómo probar la plataforma en 5 minutos

1. Abrir <https://amatista-3d.tech>. Funciona sin cuenta y, una vez cargada, sin conexión.
2. **Portada:** «¿Qué quieres crear?» → Blender → «Empezar el paso 1».
3. **Lección:** las actividades se resuelven ahí mismo; al final, «Completar lección» (+100 XP).
4. **Estudio A-Frame** (`#/estudio`): elegir «Sistema solar» y cambiar un número en el código; la escena se actualiza sola.
5. **Mi panel** (`#/panel`): nivel, XP, racha y «continúa donde te quedaste».
6. **Blender** (opcional): página «Conecta tu Blender» → instalar Amatista Motor → la práctica se revisa dentro de Blender.
