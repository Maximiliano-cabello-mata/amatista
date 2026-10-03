# 02 · Manual de Oracle para la reestructuración (v3)

> Qué hacer en la base real (Oracle Autonomous Database, Free Tier de 20 GB) para pasar a la v3, y cómo usar
> las herramientas de autor para crear lecciones desde Database Actions. Sigue los pasos en orden; cada uno dice
> cómo comprobar que salió bien.
>
> **Probado el 3 de octubre de 2026** en Oracle 23ai real (contenedor `gvenzl/oracle-free:23-slim-faststart`):
> (a) una base con datos creada con el código de `main` (001 → 002 → 003, catálogo importado, una alumna con
> progreso) a la que se le aplicó 005 → 006, dos veces seguidas, sin perder filas; (b) una base vacía
> 001 → 002 → 003 → 005 → 006 en una sola pasada; (c) 004 con `AMATISTA_APP` antes y después de 005;
> (d) el backend de `main` sobre una base con 005 (sigue funcionando) y el backend nuevo sobre la misma base
> (niveles, mapa, versiones, verificaciones, publicar y catálogo); (e) todos los procedimientos del paquete
> `AMATISTA_AUTOR` y sus mensajes de error.

---

## 1. Punto de partida

Según la [incidencia del 2 de octubre](../incidencias/2026-10-02_despliegue-sql-v2.2-en-produccion.txt), la base de producción ya tiene **002 y 003** aplicados (8 tablas, purga diaria, catálogo importado). Para la v3 solo faltan:

| Script | Qué hace | ¿Borra algo? | ¿Se puede repetir? |
|---|---|---|---|
| [`005_niveles_habilidades_versiones.sql`](../../backend/sql/005_niveles_habilidades_versiones.sql) | 6 tablas nuevas y la columna `MODULOS.NIVEL_ID` | No | Sí |
| [`006_herramientas_autor.sql`](../../backend/sql/006_herramientas_autor.sql) | 3 vistas y el paquete `AMATISTA_AUTOR` | No | Sí |

**Regla de oro (sigue igual): NUNCA ejecutes `001_esquema_amatista.sql` en la base real.**

## 2. El orden importa: primero Oracle, después el código

| Combinación | Resultado (probado) |
|---|---|
| Código de `main` (v2.2) + base **sin** 005 | Funciona (lo que hay hoy) |
| Código de `main` (v2.2) + base **con** 005 | Funciona: las tablas y la columna nuevas no le estorban |
| Código v3 + base **con** 005 | Funciona |
| Código v3 + base **sin** 005 | ✗ `/api/contenido/catalogo` responde 503 (el código lee `MODULOS.NIVEL_ID`) |

Por eso: **005 y 006 se pueden ejecutar ya, incluso antes del piloto**, sin tocar el servidor. El código v3 se despliega después, cuando decidas (recomendado: después del piloto del 8 de octubre).

## 3. Resumen

| # | Dónde | Qué | Cómo sabes que salió bien |
|---|---|---|---|
| 1 | OCI | Respaldo | Tienes el respaldo o los CSV |
| 2 | Servidor | Diagnóstico inicial (código de `main`) | `✓ Las tablas coinciden` (aún sin v3) |
| 3 | Database Actions | `005` | Última consulta: 14 tablas con `OK` |
| 4 | Database Actions | `006` | `AMATISTA_AUTOR` (PACKAGE y PACKAGE BODY) y 3 vistas `VALID` |
| 5 | Servidor | Actualizar el código a la v3 (`actualizar.sh`) | Pruebas en verde y `/api/salud` con `"motor":"oracle"` |
| 6 | Servidor | Diagnóstico final | `✓ Las tablas coinciden con lo que espera el backend.` |
| 7 | Servidor | `importar` (crea los niveles y asigna el módulo 1) | `Niveles creados (en borrador): blender-n1 …` |
| 8 | Database Actions | Mirar el mapa | `SELECT … FROM v_amatista_mapa` muestra el Nivel 1 |

## Paso 1 · Respaldo

Igual que en la [guía de la v2.2](../despliegue/2026-10-02_oracle_paso_a_paso.md#paso-1--respaldo): respaldo de OCI o CSV de `usuarios`, `progreso_lecciones`, `logros`, `cursos`, `modulos` y `lecciones`. 005 no borra nada, pero el respaldo es la costumbre antes de cambiar la estructura.

## Paso 2 · Diagnóstico inicial

```bash
cd ~/amatista/backend && source venv/bin/activate
python diagnostico_oracle.py
```

Con el código de `main` debe decir `✓ Las tablas coinciden…`. (Con el código v3 diría «Falta la reestructuración por niveles: ejecuta 005 y luego 006»: es la señal de que toca el paso 3.)

## Paso 3 · Ejecutar 005

1. OCI → Autonomous Database → **Database Actions → SQL**, como **ADMIN** (dueño de las tablas).
2. Abre `backend/sql/005_niveles_habilidades_versiones.sql` desde GitHub (botón *Raw*), copia todo y pégalo.
3. Pulsa **Ejecutar script (F5)**, no «Ejecutar sentencia».
4. En *Salida de script* verás líneas `OK: CREATE TABLE niveles …`, `OK: ALTER TABLE MODULOS ADD (NIVEL_ID …)`, etc., y al final `005 aplicado.`
5. La consulta de verificación debe mostrar **14 tablas con `OK`**: las 8 de antes (MODULOS ahora con 12 columnas) y NIVELES 10, HABILIDADES 7, HABILIDADES_ALUMNO 5, EVALUACIONES_RUBRICA 8, VERSIONES_BLENDER 6, VERIFICACIONES_BLENDER 12.
6. La consulta de filas muestra las tablas nuevas en 0 y «MODULOS sin nivel» con 2 (todavía nadie los asignó).

Si usas `AMATISTA_APP` (004), 005 le da permisos sobre las tablas nuevas solo (verás `OK: GRANT …`). Si algo falla a la mitad, corrige la causa y vuelve a ejecutar el archivo completo: lo que ya existe se salta.

## Paso 4 · Ejecutar 006

Igual que el paso 3 con `backend/sql/006_herramientas_autor.sql`. La última consulta debe mostrar:

```
AMATISTA_AUTOR                 PACKAGE        VALID
AMATISTA_AUTOR                 PACKAGE BODY   VALID
V_AMATISTA_COMPATIBILIDAD      VIEW           VALID
V_AMATISTA_FICHAS_INCOMPLETAS  VIEW           VALID
V_AMATISTA_MAPA                VIEW           VALID
```

Si `PACKAGE BODY` dice `INVALID`: `SELECT line, text FROM user_errors WHERE name = 'AMATISTA_AUTOR';` y revisa la sección 8.

## Paso 5 · Actualizar el código a la v3

Después de fusionar el PR de la reestructuración en `main`:

```bash
bash ~/amatista/despliegue/actualizar.sh
```

El script descarga `main`, instala dependencias, corre las pruebas (SQLite), reinicia el servicio y comprueba `/api/salud`. Si algo falla, vuelve solo al commit anterior (que, como viste en la sección 2, funciona con 005 aplicado).

## Paso 6 · Diagnóstico final

```bash
python diagnostico_oracle.py
```

Debe terminar en `✓ Las tablas coinciden con lo que espera el backend.` y listar las 14 tablas.

## Paso 7 · Crear los niveles y asignar el módulo 1

```bash
python herramientas/contenido.py validar
python herramientas/contenido.py importar
```

Salida esperada (la primera vez):

```
Niveles creados (en borrador): blender-n1, blender-n2, blender-n3, blender-n4, blender-n5-web, blender-n5-animacion, blender-n5-producto, blender-n5-procedural
OK    …/aframe-modulo-1.json: módulo mod_aframe_001 (sin cambios, publicado) …
OK    …/blender-modulo-1.json: módulo mod_teoria_001 (actualizado, publicado) …
```

Los niveles nacen en **borrador**: no aparecen en el catálogo hasta publicarlos (paso 8 o panel). El módulo 1 de Blender queda en `blender-n1` porque su JSON dice `"nivel": "blender-n1"`.

## Paso 8 · Ver el mapa y publicar el Nivel 1

En Database Actions:

```sql
SELECT nivel_numero, modulo_numero, leccion_orden, leccion_id, leccion_estado, pendientes
  FROM v_amatista_mapa
 WHERE curso_id = 'blender'
 ORDER BY nivel_numero, modulo_numero, leccion_orden;

BEGIN amatista_autor.publicar_nivel('blender-n1'); END;
/
```

Las lecciones actuales dirán `pendientes = ficha`: es lo esperado (se llenan en la fase B, T-039).

---

## 5. Crear lecciones desde Oracle (herramientas de autor)

Todo se ejecuta en **Database Actions → SQL** con «Ejecutar script (F5)». Activa la salida para ver los mensajes: cada bloque empieza con `SET SERVEROUTPUT ON`. Cada procedimiento valida, confirma (`COMMIT`) y escribe lo que hizo.

### 5.1 Niveles y habilidades

```sql
SET SERVEROUTPUT ON
BEGIN
  -- Crea o actualiza un nivel (id = blender-n2). Solo cambia lo que no sea NULL.
  amatista_autor.guardar_nivel('blender', 2, 'Básico con conocimientos previos',
    p_proyecto => 'Mesa con una lámpara estilizada.');
  -- Una rama del nivel 5 (id = blender-n5-web).
  amatista_autor.guardar_nivel('blender', 5, 'Avanzado: web y videojuegos', p_rama => 'web');
  amatista_autor.publicar_nivel('blender-n2');

  -- Habilidades observables (las citan las fichas de las lecciones).
  amatista_autor.guardar_habilidad('bl-navegar-vista', 'blender', 'Navegar la vista sin mover objetos', 'blender-n1');
  amatista_autor.guardar_habilidad('bl-transformar', 'blender', 'Mover, rotar y escalar objetos', 'blender-n1');

  -- Poner un módulo en un nivel (NULL lo saca del nivel).
  amatista_autor.asignar_nivel('mod_teoria_001', 'blender-n1');
END;
/
```

### 5.2 Una lección nueva con la estructura de 10 pasos

Primero crea el módulo (panel → Contenido → Nuevo módulo, o `contenido.py nuevo-modulo … --nivel blender-n1` e `importar`). Después:

```sql
SET SERVEROUTPUT ON
BEGIN
  amatista_autor.nueva_leccion(
    p_modulo_id   => 'mod_blender_002',
    p_leccion_id  => 'les_n1_navegar',
    p_titulo      => 'Navegar sin mover los objetos',
    p_objetivo    => 'Orbitar, desplazar y acercar la vista sin cambiar la escena.',
    p_habilidades => 'bl-navegar-vista');
END;
/
```

Queda en **borrador** al final del módulo, con los 10 pasos («Reemplaza este contenido: …») y su ficha. Una habilidad que no existe produce un aviso, no un error.

### 5.3 Llenar la ficha

```sql
SET SERVEROUTPUT ON
BEGIN
  amatista_autor.guardar_ficha(
    p_curso_id     => 'blender',
    p_leccion_id   => 'les_n1_navegar',
    p_blender      => '4.2',                         -- versión en la que la verificaste
    p_notas_blender => 'En 4.1 el gizmo de navegación es más pequeño.',
    p_comprobacion => 'La escena no cambió|Puede volver a la vista frontal|Archivo guardado',
    p_offline      => 'si');
END;
/
```

Solo cambia lo que mandas (lo demás queda como estaba). Habilidades separadas por comas; criterios de comprobación separados por `|`.

### 5.4 Copiar una lección (variante o transferencia)

```sql
BEGIN
  amatista_autor.duplicar_leccion('blender', 'les_n1_mesa', 'les_n1_banco',
    p_titulo => 'Construir un banco (transferencia)');
END;
/
```

### 5.5 Escribir el contenido y publicar

El texto de los pasos, las imágenes y los bloques interactivos se escriben en el **editor del panel** (`#/admin` → Contenido → la lección), que muestra la vista previa y valida. **Publicar se hace desde el panel** (o con `importar`): el paquete no publica lecciones a propósito, para que nada que la PWA no sepa mostrar llegue a los alumnos.

### 5.6 Versiones de Blender y verificaciones

```sql
SET SERVEROUTPUT ON
BEGIN
  -- Cuando T-038 decida la versión principal (con el soporte oficial consultado):
  amatista_autor.guardar_version_blender('X.Y.Z', 'principal', p_es_lts => 1,
    p_soporte_hasta => DATE '2027-01-01', p_notas => 'Fuente: página oficial de soporte LTS, consultada el …');
  -- Cada prueba de una lección:
  amatista_autor.registrar_verificacion('blender', 'les_n1_navegar', 'X.Y.Z', 'Windows 11', 'verificada',
    p_responsable => 'Maximiliano', p_evidencia => 'captura en drive/…');
END;
/
```

(`X.Y.Z` es un marcador: la versión principal es una decisión pendiente y este manual no la elige.) Solo puede haber una `principal`; al marcar otra, la anterior pasa a `compatible`. Resultados: `verificada`, `con_diferencias`, `falla`.

### 5.7 Consultas útiles

```sql
-- Qué le falta a cada lección (sin lo archivado)
SELECT * FROM v_amatista_fichas_incompletas ORDER BY curso_id, nivel_numero, modulo_numero, leccion_orden;

-- Matriz de compatibilidad del curso de Blender
SELECT leccion_id, version_blender, categoria, resultado, estado_prueba, verificado_en
  FROM v_amatista_compatibilidad
 WHERE curso_id = 'blender'
 ORDER BY leccion_id, version_blender;

-- Lecciones cuya prueba hay que repetir porque cambiaron
SELECT leccion_id, version_blender FROM v_amatista_compatibilidad WHERE estado_prueba LIKE 'repetir%';

-- Estado de las habilidades de los alumnos (cuando T-042 empiece a llenarlas)
SELECT h.nombre, a.estado, COUNT(*) AS alumnos
  FROM habilidades_alumno a JOIN habilidades h ON h.id = a.habilidad_id
 GROUP BY h.nombre, a.estado ORDER BY h.nombre, a.estado;
```

## 6. Lo mismo sin Oracle (SQLite, en tu computadora)

Las vistas y el paquete solo existen en Oracle. En tu computadora, con la base SQLite de desarrollo, lo equivalente es:

```bash
cd backend
python herramientas/contenido.py mapa blender                  # el mapa, desde los archivos
python herramientas/contenido.py nueva-leccion ../frontend/src/data/modulos/blender-modulo-2.json les_n1_mesa "Construir una mesa" --objetivo "…"
DATABASE_URL=sqlite:///./amatista_local.db python herramientas/contenido.py importar
```

y la API: `GET /api/contenido/mapa/blender`, `PUT /api/blender/versiones/{v}`, `POST /api/blender/verificaciones`.

## 7. Espacio

005 agrega ~10 KB por alumno en el peor caso (habilidades y rúbrica) y menos de 10 MB fijos (niveles, habilidades, matriz). Lo permanente pasa de ~12 KB a ~22 KB por alumno: los 20 GB siguen alcanzando para más de 200,000 alumnos. Detalle en el encabezado de 005; seguimiento en `V_AMATISTA_ESPACIO` (003).

## 8. Problemas encontrados en las pruebas (ya corregidos en los scripts)

| Error | Causa | Corrección aplicada |
|---|---|---|
| `ORA-01429: Index-Organized Table: no data segment to store overflow row-pieces` | `EVALUACIONES_RUBRICA` como IOT con textos largos (evidencia + comentario) | Es tabla normal; `HABILIDADES_ALUMNO` sí es IOT (fila corta) |
| `ORA-00923: FROM keyword not found` al crear `V_AMATISTA_MAPA` | `OFFLINE` es palabra reservada | La columna se llama `ES_OFFLINE` |
| `ORA-40573: invalid use of PL/SQL JSON object type` | Métodos de `JSON_ARRAY_T`/`JSON_OBJECT_T` dentro de una sentencia SQL | Se copian a una variable antes del `SELECT`/`INSERT`/`UPDATE` |
| `PLS-00231` (posible) | Una función privada del paquete usada en SQL | `amatista_autor.ahora` es pública |

Errores propios del paquete (`ORA-200xx`) explican qué falta: módulo o nivel inexistente (-20014/-20015), nivel de otro curso (-20016), id repetido (-20019), versión mal escrita (-20022), versión no registrada (-20027), etc.

## 9. Volver atrás

- **Código:** `actualizar.sh` vuelve solo al commit anterior si algo falla; a mano, `git reset --keep <commit>` y reiniciar. El código de `main` funciona con 005 aplicado.
- **Base:** no hace falta deshacer 005: lo que agrega no estorba al código anterior. Si de verdad quisieras quitar el paquete: `DROP PACKAGE amatista_autor;` y las vistas con `DROP VIEW …` (no tienen datos). Las tablas nuevas no se borran si ya tienen datos de alumnos.
