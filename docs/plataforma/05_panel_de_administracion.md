# 05 · Panel de administración

`#/admin`. Profesores (`profesor`) lo ven completo en **solo lectura**; el administrador (`admin`) hace cambios. El servidor revisa el rol en cada petición, así que ocultar un botón nunca es la única protección.

![Navegación por tareas y página Herramientas](img/panel_admin.svg)

## Organización (v3.1)

Antes la navegación era una lista plana (Resumen, Usuarios, Contenido, Prácticas, Sistema). Ahora se agrupa por **lo que se viene a hacer**:

| Grupo | Sección | Ruta | Qué se hace |
|---|---|---|---|
| — | **Resumen** | `#/admin` | Indicadores del lanzamiento, actividad diaria, embudo y avance por curso. |
| Enseñanza | **Módulos** (antes «Contenido») | `#/admin/contenido` | Árbol cursos → módulos → lecciones. Crear un módulo con la Fórmula, editar y crear lecciones, publicar, archivar, reordenar, exportar el JSON. |
| | **Prácticas de Blender** | `#/admin/practicas` | Las prácticas del motor registradas en Oracle, su historial de versiones y cuál ven los alumnos (publicar, archivar, sincronizar desde el repositorio). |
| | **Herramientas** *(nueva)* | `#/admin/herramientas` | El catálogo de bloques de lección por categoría, con vista previa y JSON ([04](04_herramientas_de_ensenanza.md)). |
| Personas | **Usuarios** | `#/admin/usuarios` | Buscar, filtrar por rol, ver el detalle, cambiar rol, confirmar correo, cuentas de prueba. |
| Sistema | **Estado** (solo admin) | `#/admin/sistema` | Motor de base de datos, filas por tabla, purga de sesiones y eventos viejos y enlace al **Diagnóstico técnico** del dispositivo (`#/laboratorio`). |

En escritorio la navegación es una columna con los títulos de grupo; en el celular, una fila de pestañas desplazable.

## Qué cambió en cada pantalla

### Módulos

- Cada módulo muestra la etiqueta **Incluye práctica en Blender** o **Sin práctica en Blender** (para ver de un vistazo qué módulos todavía no cierran en Blender).
- Cada lección lleva la etiqueta de su tipo (Lectura, Interactiva, Video, Código, Examen) y la lección de práctica, **Práctica en Blender**. El dato viene del árbol del servidor (`GET /api/contenido/admin/arbol`, campo `practica_blender` de cada lección).
- Al reordenar o importar, si la práctica no queda al final, el servidor responde con el error que dice qué lección mover ([02](02_modulos_y_practica.md)).

### Editor de lecciones

- **Agregar bloque** agrupa las herramientas por categoría (Explicar, Visualizar, Practicar en el navegador, Practicar en Blender) y marca las nuevas.
- Debajo, el enlace **Ver todas las herramientas** abre la página Herramientas.
- La vista previa usa los mismos componentes que ve el alumno, incluidas las herramientas nuevas.

### Herramientas (nueva)

- A la izquierda, las herramientas por categoría; a la derecha, la elegida: **Para qué**, **Cuándo usarla**, los pasos de la Fórmula donde encaja y la **vista previa** con el ejemplo del servidor.
- **Ver JSON** y **Copiar JSON** dan el bloque listo para pegar en el editor.
- Sirve también para profesores: pueden ver qué piezas existen antes de proponer una lección.

## Flujo: subir un módulo con su práctica

1. **Módulos › Crear módulo**: curso, título, número, insignia y «Generar esqueleto con la Fórmula». Quedan cinco lecciones en borrador.
2. Abrir cada lección y armarla con **Agregar bloque** (consultar **Herramientas** si hace falta). Validar: el servidor marca cualquier campo mal escrito con su ruta.
3. **Prácticas de Blender**: registrar la práctica (desde el repositorio con *Sincronizar* o subida desde Amatista Author) y publicar la versión.
4. Volver a **Módulos**, agregar la lección con el bloque **Práctica en Blender** apuntando a esa práctica y dejarla al final (antes del examen). El módulo pasa a «Incluye práctica en Blender».
5. Publicar las lecciones y luego el módulo. Los alumnos lo ven en el mapa del curso con su estación de Blender.

Alternativa por archivo: escribir el módulo en `frontend/src/data/modulos/*.json` e importarlo con `python herramientas/contenido.py importar <archivo>` (desde `backend/`); la validación es la misma.

## Código

| Archivo | Qué hace |
|---|---|
| `frontend/src/components/admin/NavAdmin.jsx` | Navegación agrupada (`SECCIONES`). |
| `frontend/src/pages/admin/Admin.jsx` | Títulos y enrutado de secciones. |
| `frontend/src/pages/admin/Herramientas.jsx` | Página de herramientas. |
| `frontend/src/data/herramientas.js` | Catálogo de herramientas: nombres, categorías, para qué, cuándo, Fórmula, nuevas. |
| `frontend/src/pages/admin/Contenido.jsx` | Árbol de módulos con etiquetas de práctica y tipo. |
| `frontend/src/pages/admin/EditorLeccion.jsx` | Editor con la paleta agrupada. |
| `frontend/src/rutas.js` | `#/admin/herramientas` → sección `herramientas`. |
