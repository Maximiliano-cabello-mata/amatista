# Amatista · Frontend

PWA de Amatista hecha con React 19, Vite 8, Tailwind v4 y A-Frame.

```bash
npm install
npm run dev            # desarrollo (sin service worker)
npm run build          # producción: genera dist/ con manifest y service worker
npm run preview        # sirve dist/ para probar la PWA y el modo sin conexión
npm run ilustraciones  # regenera los SVG de public/ilustraciones/
npm run lint           # ESLint (CI lo exige)
npm test               # pruebas con Vitest (CI lo exige)
```

El backend se configura con `VITE_API_URL` (ver `.env.example`).

## Estructura

```text
src/
├── App.jsx                 # proveedores y rutas por hash
├── rutas.js                # todas las rutas (#/, #/panel, #/entrar, #/admin/..., ver abajo)
├── auth/                   # sesión del alumno (AuthProvider, guardada en IndexedDB)
├── catalogo/               # catálogo combinado: JSON empaquetados + catálogo del servidor
├── data/
│   ├── cursos.js           # cursos y títulos de módulos «Próximamente»
│   └── modulos/*.json      # contenido de cada módulo (se cargan solos)
├── progreso/               # progreso v2: proveedor, reglas de acople, XP, nivel y racha
├── lib/                    # IndexedDB y generador de identificadores
├── hooks/                  # conexión y botón de instalar la PWA
├── services/               # api.js (salud, auth, progreso, eventos) y admin.js
├── components/
│   ├── leccion/            # bloques de contenido, examen y vista 3D (A-Frame)
│   │   └── interactivos/   # los 7 bloques interactivos
│   ├── panel/              # tarjetas del panel del alumno
│   ├── graficas/           # anillo, barras, mapa de calor y medidor (SVG)
│   ├── admin/              # piezas del panel de administración
│   └── ...                 # barra superior, fondo low poly, tarjetas, íconos
└── pages/
    ├── Inicio, Curso, Leccion, Panel, Laboratorio
    ├── cuenta/             # Entrar, Registro, Confirmar, Recuperar, Perfil
    └── admin/              # Resumen, Usuarios, Usuario, Contenido, EditorLeccion, Sistema
```

| Ruta | Página |
|---|---|
| `#/` · `#/curso/:id` · `#/curso/:id/leccion/:id` | Inicio, mapa del módulo y lección |
| `#/panel` | Panel del alumno |
| `#/entrar` · `#/registro` · `#/confirmar` · `#/recuperar` · `#/perfil` | Cuenta |
| `#/admin` · `#/admin/usuarios[/:id]` · `#/admin/contenido[/...]` · `#/admin/sistema` | Panel de administración (profesor lee, admin modifica) |
| `#/laboratorio` | Laboratorio técnico (estado del backend y de Oracle, visor A-Frame) |

## Contenido

Para agregar un módulo o una lección no hace falta tocar componentes: el
formato de los JSON y los bloques disponibles están en
`docs/arquitectura/2026-09-29_formato-lecciones.txt` y cómo diseñar un módulo
en `docs/arquitectura/2026-10-02_formula_modulos.txt`. También se puede editar
desde `#/admin/contenido`.

## Progreso

Se guarda en el dispositivo (IndexedDB), así funciona sin conexión y aunque
el backend esté caído. Cuando el backend responde, los cambios pendientes se
envían a `POST /api/progreso` (con el token de la cuenta si el alumno inició
sesión). Al crear una cuenta, el progreso anónimo del dispositivo se une a ella.

La identidad visual está documentada en
`docs/arquitectura/2026-09-28_identidad_visual_interfaz.txt`.
