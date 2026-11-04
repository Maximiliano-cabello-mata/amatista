# Amatista Cloud

Blender en la nube para alumnos de la UTN: una hora por sesión, desde el navegador.

| Carpeta | Qué es |
|---|---|
| `nodo/` | `amatista_nodo.py`: el programa que presta los recursos de un equipo. Incluye `nodo.env.ejemplo`, el servicio de systemd, el túnel de Cloudflare y las pruebas (`test_nodo.py` y `prueba_punta_a_punta.py`) |
| `imagen/` | La sesión: Dockerfile con Ubuntu 24.04, Blender 4.0 y KasmVNC 1.4, y `amatista_nube.py`, el perfil de Blender sin GPU con límites de render |

- **Cómo funciona, investigación, mediciones y seguridad:** [docs/nube/README.md](../docs/nube/README.md)
- **Qué hacer en cada dispositivo:** [docs/nube/INSTRUCCIONES.md](../docs/nube/INSTRUCCIONES.md)

```bash
python nube/nodo/amatista_nodo.py diagnostico          # cuántas sesiones caben en este equipo
python -m pytest -q nube/nodo                          # pruebas del nodo
python nube/nodo/prueba_punta_a_punta.py               # API + nodo + Docker, de punta a punta
```
