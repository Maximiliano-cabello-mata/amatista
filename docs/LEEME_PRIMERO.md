# Léeme primero: Amatista en una página

Para quien necesita entender el proyecto sin leer los 150+ documentos. Verificado el 3 de noviembre de 2026 corriendo las pruebas en el corte [`hack4edu`](CORTE_HACK4EDU.md).

> **Corte actual (`hack4edu`):** consulta en [`docs/CORTE_HACK4EDU.md`](CORTE_HACK4EDU.md) la división exacta y comprobable entre **lo que ya está terminado hoy (martes 3 de noviembre)** y **lo que se trabajará de aquí al viernes 6 de noviembre**.

## Qué es

Una plataforma para **aprender 3D con Blender y llevarlo a la web** (GLB, A-Frame, WebXR). Tiene tres piezas que trabajan juntas:

```
 Alumno ──► PWA (frontend) ──► API (backend) ──► Base de datos Oracle
   │            ▲ funciona sin conexión
   └──► Blender + add-on ──► Motor (engine) evalúa lo que hace en la escena
```

## Las 5 piezas

| Carpeta | Qué hace | Lenguaje | Importancia |
|---|---|---|---|
| `frontend/` | La web (PWA): cursos, lecciones, panel, admin, Estudio A-Frame, asistente Goliat | JavaScript (React + Vite) | Alta: es lo que ve el alumno |
| `backend/` | La API: cuentas, progreso, sincronización, panel de administración | Python (FastAPI) | **Crítica**: guarda datos de personas |
| `engine/` | El «cerebro» que revisa el trabajo del alumno en Blender. Funciona sin Blender | Python puro | Alta: es la parte más original |
| `addon/` | Extensión de Blender que usa el motor y guía al alumno paso a paso | Python (`bpy`) | Alta, pero con pruebas pendientes |
| `practices/` | Las prácticas (ejercicios) de Blender, en archivos JSON | JSON | Contenido, no código |

Apoyo: `despliegue/` (scripts del servidor), `tablero/` (genera `KANBAN.md`), `docs/` (documentación), `ai_tutor/prompts/` (textos para el asistente) y `herramientas/` (scripts sueltos).

## Dónde corre en producción

- Web: `amatista-3d.tech` en Cloudflare Workers.
- API: `api.amatista-3d.tech` en Oracle Cloud (Caddy, FastAPI y Oracle Database).
- **La fusión en `main` no despliega sola el backend**; se actualiza a mano en la VM con `despliegue/actualizar.sh`.

## Cómo comprobar que todo sigue sano (sin leer código)

Desde la raíz del repo, con Python 3.12 y Node instalados:

| Qué | Comando | Resultado esperado (3-nov-2026) |
|---|---|---|
| Backend | `cd backend` y `python -m pytest -q` | 446 pasan |
| Motor, add-on, tablero | `python -m pytest -q tablero engine/tests addon/tests` | Todas pasan en CI (Linux). En Windows pasan 672 y fallan 3 por saltos de línea, ver más abajo |
| Frontend | `cd frontend`, `npm ci`, `npm run lint`, `npm test`, `npm run build` | 390 pruebas pasan y el build termina |

Si algo de esto se pone en rojo, **no sigas añadiendo funciones**: arréglalo primero.

## Qué hay que hacer antes de seguir creciendo

1. **Cerrar producción**: aplicar en Oracle los scripts `007` a `013`, cerrar el puerto 8000 en OCI, usar el usuario `AMATISTA_APP` y configurar SMTP.
2. **Probar con Blender real** y con 3 a 5 alumnos de verdad. Hoy el motor está validado con simulaciones.
3. **Decidir la licencia**: sin archivo `LICENSE`, el código no es reutilizable legalmente.
4. **Privacidad**: antes de activar telemetría, aviso de privacidad y consentimiento claros, porque hay datos de alumnos.
5. **Revisar dependencias del frontend**: `npm audit` reporta 21 vulnerabilidades (4 altas).
6. **No abrir frentes nuevos** hasta cerrar los puntos anteriores.

## Cosas que conviene saber

- `backend/requirements.txt` usa versiones mínimas (`>=`). `backend/requirements.lock` guarda las versiones exactas que pasaron las pruebas; úsalo si una actualización rompe algo.
- Los 3 fallos del add-on en Windows no son errores de lógica: vienen de que Git convertía los saltos de línea y de que Windows no guarda el permiso de ejecución. `.gitattributes` evita lo primero.
- Los archivos de lógica del frontend terminan en `Logica` (por ejemplo `atajosLogica.js`) para no chocar en Windows y Mac con los componentes `Atajos.jsx` y `Personaje.jsx`.
- Para saber qué hace una carpeta concreta: [mapa del repositorio](manual-del-codigo/01_mapa_del_repositorio.md). Para la dirección y las tareas: [PROYECTO.md](../PROYECTO.md) y [KANBAN.md](../KANBAN.md).
