# Amatista · Frontend

PWA de Amatista hecha con React 19, Vite 8, Tailwind v4 y A-Frame 1.8.

```bash
npm install
npm run dev            # desarrollo (sin service worker)
npm run build          # producción: genera dist/ con manifest, service worker y revisión postbuild
npm run preview        # sirve dist/ para probar la PWA y el modo sin conexión
npm run ilustraciones  # regenera los SVG de public/ilustraciones/
npm run modelos        # regenera los modelos GLB low poly de public/modelos/
npm run lint           # ESLint (CI lo exige)
npm test               # pruebas con Vitest (CI lo exige)
```

El backend se configura con `VITE_API_URL` y Sentry opcional con `VITE_SENTRY_DSN` (ver `.env.example`).

## Estructura (`src/`, 310 archivos)

```text
src/
├── App.jsx                 # proveedores globales, carga diferida (lazy) y rutas por hash
├── rutas.js                # analizador y generador de todas las rutas (#/...)
├── auth/                   # sesión del alumno (AuthProvider, guardada en IndexedDB)
├── avatares/               # avatares low poly por cuenta (zorro, búho, ajolote… y pavo real del creador)
├── buzon/                  # cliente y componentes del Buzón del creador (#/buzon)
├── catalogo/               # catálogo combinado: 15 módulos JSON empaquetados + catálogo del servidor
├── data/
│   ├── cursos.js           # rutas de aprendizaje (Blender, A-Frame Inicial e Interactivo)
│   ├── herramientas.js     # catálogo de bloques de enseñanza por categoría
│   └── modulos/*.json      # 15 módulos publicados (9 de Blender + 6 de A-Frame) y archivo/
├── estudio/                # Estudio A-Frame (#/estudio): plantillas, piezas insertables y descarga HTML
├── motor3d/                # Motor Web de Amatista sobre A-Frame (entornos con semilla, arrastrar, zonas, retos)
├── goliat/                 # Goliat: compañero low poly con reglas locales, apoyo en prácticas y proyecto guiado
├── modulos/practica.js     # la práctica de Blender que cierra cada módulo
├── progreso/               # proveedor offline-first, sincronización comprimida (gzip) y modo Ahorro de datos
├── recorrido/              # recorrido guiado interactivo de 10 paradas por la plataforma
├── vista/                  # cambio de vista (Alumno / Profesor / Admin) y salto rápido de lecciones
├── blender/                # conexión en vivo con Blender, instaladores (.exe, .deb, .zip), taller e isla
├── lib/                    # IndexedDB (almacen.js), telemetría opcional Sentry y utilidades
├── hooks/                  # estado de red, ahorro de datos e instalación de la PWA
├── services/               # api.js, admin.js y blender.js (API del add-on, enlace y taller)
├── components/
│   ├── estructura/         # sistema de diseño «Facetas»: Pagina, EncabezadoPagina, Migas, TituloSeccion, PiePagina
│   ├── leccion/            # reproductor de lecciones, bloques gráficos v4.2, dinámicas v4.3, fichas y examen
│   │   └── interactivos/   # bloques interactivos (quiz, ordenar, emparejar, visor de malla, nodos, Mundo 3D, Blender)
│   ├── modulo/             # ruta del módulo y estación de Blender
│   ├── etiquetas/          # sistema de etiquetas low poly
│   ├── panel/              # tarjetas de Mi panel y ajuste de Ahorro de datos
│   ├── graficas/           # anillo, barras, mapa de calor y medidor (SVG)
│   └── admin/              # piezas del panel de administración
└── pages/
    ├── Inicio, Curso, Leccion, Estudio, Panel, Blender, Vincular, Guia (Ayuda), Buzon
    ├── Laboratorio         # diagnóstico técnico (solo profesor y admin)
    ├── cuenta/             # Entrar, Registro, Confirmar, Recuperar, Perfil (con selector de avatar)
    └── admin/              # Admin, Resumen, Contenido, EditorLeccion, Practicas, Herramientas,
                            # Usuarios, Usuario, Auditoria, Revision, Buzon, Sistema
```

| Ruta | Página |
|---|---|
| `#/` · `#/curso/:id` · `#/curso/:id/leccion/:id` | Cursos (camino guiado), mapa del curso (con Tu isla) y lección |
| `#/estudio` | Estudio A-Frame: editor 3D libre con vista en vivo, plantillas y modelos GLB sin conexión |
| `#/panel` | Mi panel: avance por programa, talleres, exámenes, insignias y modo Ahorro de datos |
| `#/blender` · `#/vincular?codigo=…` | Página Blender (fusión plataforma ↔ add-on, instaladores, «Conoce Amatista Motor») y vincular |
| `#/guia` · `#/buzon` | Ayuda (recorrido guiado, preguntas rápidas y Goliat) · Buzón del creador |
| `#/entrar` · `#/registro` · `#/confirmar` · `#/recuperar` · `#/perfil` | Cuenta y elección de avatar low poly |
| `#/admin` · `#/admin/contenido` · `#/admin/practicas` · `#/admin/herramientas` · `#/admin/usuarios` · `#/admin/auditoria` · `#/admin/revision` · `#/admin/buzon` · `#/admin/sistema` | Panel de administración (profesor lee, admin modifica) |
| `#/laboratorio` | Diagnóstico técnico del dispositivo (desde Admin › Estado) |
