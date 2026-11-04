# Generador de la biblioteca de recursos

Crea la biblioteca que se ve en `#/biblioteca`: **45 texturas, 38 modelos y 19 animaciones**, todo hecho por código y con licencia **CC0** (sin pedir permiso ni dar crédito). El resultado va a `frontend/public/biblioteca/`, junto con `catalogo.json` (contrato `amatista.biblioteca/1`).

| Archivo | Qué hace |
|---|---|
| `texturas.py` | Ruido espectral que se repite sin costuras, celdas de Voronoi y ladrillos; mapas de color, normal y rugosidad |
| `modelos.py` | Primitivas low poly, escritor de glTF 2.0 (`.glb`) con materiales y animaciones, y un rasterizador para las vistas previas |
| `generar.py` | Genera todo: texturas en 512 y 1K (y 2K con `--con-2k`), `.glb` con vista `.jpg` y animaciones con vista `.webp` animada |
| `test_biblioteca.py` | Comprueba que las 45 texturas no tengan costuras y que los modelos y animaciones sean glTF válidos con las caras hacia afuera |

```bash
pip install numpy pillow
python herramientas/biblioteca/generar.py            # ≈ 35 s, 20 MB
python herramientas/biblioteca/generar.py --con-2k   # ≈ 70 MB, para la app de escritorio
python -m pytest -q herramientas/biblioteca
```

**Determinista:** misma versión, mismos archivos, byte por byte. Para agregar un recurso, se suma una entrada a `MATERIALES`, `MODELOS` o `ANIMACIONES` y se vuelve a generar.

**En la PWA:** la biblioteca no se precachea. Cada archivo se guarda la primera vez que se abre, con `CacheFirst`. Geoda elige la resolución recomendada: 512 en equipos N0 y N1, 1K desde N2.
