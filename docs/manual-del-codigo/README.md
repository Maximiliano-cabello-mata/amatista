# Manual del código

El código de Amatista explicado como un manual de uso: qué hay en cada carpeta, qué hace cada archivo importante, cómo fluyen los datos y qué tocar para cada cambio típico. Para quien va a leer o modificar el código.

Actualizado: 4 de octubre de 2026 (main en `c730c0e`).

| # | Documento | Qué responde |
|---|---|---|
| 01 | [Mapa del repositorio](01_mapa_del_repositorio.md) | Dónde está cada cosa, cómo se conectan las piezas y por dónde empezar a leer |
| 02 | [Frontend (PWA)](02_frontend.md) | Rutas, páginas, componentes, bloques de lección, progreso offline, servicios y recetas |
| 03 | [Backend (API)](03_backend.md) | Arranque, configuración, todos los endpoints, autenticación y roles, flujos y recetas |
| 04 | [Motor, add-on y prácticas](04_motor_addon_y_practicas.md) | Amatista Engine por dentro, el add-on de Blender, el formato de práctica y el recorrido completo de una práctica |

Documentos hermanos que no se repiten aquí:

- **Base de datos**: [esquema SQL completo](../base-de-datos/README.md) (tablas, columnas, relaciones, vistas y paquete).
- **Herramientas del desarrollador** (CLI, scripts, pruebas, CI, flujo de trabajo): [manual del desarrollador](../desarrollador/README.md).
- **Tecnologías**: [herramientas que usa la plataforma](../herramientas-de-la-plataforma.md).
- **Referencia del motor** (formato, API del add-on, instalación): [docs/motor/](../motor/README.md).
- **Qué ve cada rol en la plataforma**: [docs/plataforma/](../plataforma/README.md).

## Cómo leer este manual

1. Empieza por el [mapa del repositorio](01_mapa_del_repositorio.md): en diez minutos sabes dónde vive cada pieza.
2. Ve al documento del componente que vas a tocar y busca la receta del cambio («agregar una página», «agregar un endpoint», «crear una práctica»…).
3. Antes de abrir un PR, corre las comprobaciones del [manual del desarrollador](../desarrollador/04_pruebas_y_ci.md).

Regla: cuando un cambio de código haga falso algo de este manual, el mismo PR actualiza el documento.
