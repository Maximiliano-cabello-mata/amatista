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
│   ├── herramientas.js     # catálogo de herramientas de enseñanza (bloques) por categoría
│   └── modulos/*.json      # contenido de cada módulo (se cargan solos)
├── modulos/practica.js     # la práctica de Blender que cierra cada módulo (funciones puras)
├── progreso/               # progreso v2: proveedor, reglas de acople, XP, nivel y racha
├── blender/                # conexión con Blender: descarga, código de vínculo, «Prepara tu Blender»
├── lib/                    # IndexedDB y generador de identificadores
├── hooks/                  # conexión y botón de instalar la PWA
├── services/               # api.js, admin.js y blender.js (API del add-on)
├── components/
│   ├── leccion/            # los bloques de contenido (Paso a paso, Atajos, Comparar…), examen y vista A-Frame
│   │   └── interactivos/   # bloques interactivos (quiz, ordenar, …, práctica en Blender)
│   ├── modulo/             # ruta del módulo y estación de la práctica en Blender
│   ├── etiquetas/          # sistema de etiquetas low poly (íconos, catálogo, chip)
│   ├── panel/              # tarjetas del panel del alumno
│   ├── graficas/           # anillo, barras, mapa de calor y medidor (SVG)
│   ├── admin/              # piezas del panel de administración
│   └── ...                 # barra superior, fondo low poly, tarjetas, íconos
└── pages/
    ├── Inicio, Curso, Leccion, Panel, Blender (Mi Blender), Vincular
    ├── Laboratorio         # diagnóstico técnico (solo profesor y admin)
    ├── cuenta/             # Entrar, Registro, Confirmar, Recuperar, Perfil
    └── admin/              # Resumen, Contenido (Módulos), EditorLeccion, Practicas, Herramientas, Usuarios, Usuario, Sistema
```

| Ruta | Página |
|---|---|
| `#/` · `#/curso/:id` · `#/curso/:id/leccion/:id` | Cursos, mapa del curso (módulos con su práctica en Blender) y lección |
| `#/panel` | Panel del alumno |
| `#/blender` · `#/vincular?codigo=…` | Mi Blender (menú de la cuenta) y vincular el add-on |
| `#/entrar` · `#/registro` · `#/confirmar` · `#/recuperar` · `#/perfil` | Cuenta |
| `#/admin` · `#/admin/contenido[/...]` · `#/admin/practicas` · `#/admin/herramientas` · `#/admin/usuarios[/:id]` · `#/admin/sistema` | Panel de administración (profesor lee, admin modifica) |
| `#/laboratorio` | Diagnóstico técnico del dispositivo (solo profesor y admin; se abre desde Admin › Estado) |

La organización de la plataforma por rol, las etiquetas y las herramientas están en [`docs/plataforma/`](../docs/plataforma/README.md).

## Contenido

Para agregar un módulo o una lección no hace falta tocar componentes: los
bloques disponibles y sus campos están en
[`docs/plataforma/04_herramientas_de_ensenanza.md`](../docs/plataforma/04_herramientas_de_ensenanza.md)
(formato base: `docs/arquitectura/2026-09-29_formato-lecciones.txt`) y cómo
diseñar un módulo en `docs/arquitectura/2026-10-02_formula_modulos.txt`. Cada
módulo de Blender cierra con su práctica en Blender
([docs/plataforma/02](../docs/plataforma/02_modulos_y_practica.md)). También se
puede editar desde `#/admin/contenido`.

## Progreso

Se guarda en el dispositivo (IndexedDB), así funciona sin conexión y aunque
el backend esté caído. Cuando el backend responde, los cambios pendientes se
envían a `POST /api/progreso` (con el token de la cuenta si el alumno inició
sesión). Al crear una cuenta, el progreso anónimo del dispositivo se une a ella.

La identidad visual está documentada en
`docs/arquitectura/2026-09-28_identidad_visual_interfaz.txt`.
