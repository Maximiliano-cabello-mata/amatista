# AMATISTA  
## Bitácora técnica completa — Reestructuración v3, Oracle y validación del servidor

**Fecha:** 3 de octubre de 2026  
**Proyecto:** Amatista  
**Responsable:** Maximiliano Cabello Mata  
**Etapa:** v3 — Reestructuración  
**Repositorio:** `Maximiliano-cabello-mata/amatista`

---

## 1. Propósito de la jornada

El trabajo realizado tuvo como objetivo avanzar Amatista desde la planificación de la reestructuración v3 hasta una comprobación real de que la nueva arquitectura podía convivir con la plataforma existente.

La intención no fue comenzar nuevamente el proyecto, sino ampliar lo que ya funcionaba en la v2.2 conservando:

- usuarios;
- sesiones;
- progreso;
- logros;
- cursos;
- módulos;
- lecciones;
- eventos de aprendizaje;
- integración FastAPI + Oracle;
- funcionamiento actual del piloto.

Sobre esa base se incorporó la estructura necesaria para organizar el aprendizaje por niveles, habilidades, evaluación por rúbricas y compatibilidad con diferentes versiones de Blender.

Al finalizar la jornada quedó comprobado que la nueva estructura de base de datos funciona en Oracle y que el backend puede ejecutarse correctamente contra ella.

---

# 2. Punto de partida

Antes de comenzar esta etapa, Amatista ya disponía de una plataforma educativa funcional en la rama principal.

La v2.2 ya incluía:

- autenticación;
- cuentas de usuario;
- roles;
- progreso;
- funcionamiento offline;
- sincronización;
- cursos;
- módulos;
- lecciones;
- eventos de aprendizaje;
- panel del alumno;
- panel administrativo;
- contenido administrable;
- backend FastAPI;
- Oracle como base de datos;
- PWA;
- contenido inicial de Blender;
- contenido inicial de A-Frame.

En producción ya se habían aplicado los scripts anteriores de Oracle y la base contenía las ocho tablas principales de la plataforma.

La reestructuración v3 tenía que crecer encima de esa arquitectura sin destruir ni reinicializar los datos existentes.

---

# 3. Reestructuración v3 preparada en el repositorio

Se desarrolló una nueva etapa denominada:

**v3 — Reestructuración**

Esta etapa reorganiza el modelo educativo alrededor de la jerarquía:

**Curso → Nivel → Módulo → Lección → Actividad**

El objetivo es que Amatista pueda dejar de ser únicamente una plataforma que presenta lecciones y convertirse progresivamente en una plataforma capaz de representar una ruta educativa completa.

Se definieron cinco niveles conceptuales:

1. Desde cero.
2. Básico con conocimientos previos.
3. Consolidación y autonomía.
4. Intermedio.
5. Avanzado por especialidad.

El quinto nivel puede dividirse posteriormente en diferentes ramas, por ejemplo:

- web y videojuegos;
- animación;
- producto;
- procedimientos y automatización.

---

# 4. Documentación creada para la reestructuración

La reestructuración quedó documentada dentro de:

`docs/reestructuracion/`

Se incorporaron los siguientes documentos.

### `00_plan_maestro.md`

Define:

- dirección general de la v3;
- fases de desarrollo;
- dependencias;
- riesgos;
- prioridades;
- versiones;
- tareas;
- orden de implementación.

La hoja de ruta quedó dividida aproximadamente en:

**Fase A — Estructura**  
Base de datos, niveles, herramientas de autor y documentación.

**Fase B — Ruta visible para el alumno**  
Asignar contenido existente a niveles y mostrar la estructura educativa.

**Fase C — Mi primer espacio 3D**  
Construcción del primer recorrido completo de Blender.

**Fase D — Laboratorio y GLB**  
Integración entre Blender, modelos exportados y el entorno web.

**Fase E — Add-on de Blender**  
Conexión progresiva entre Blender y Amatista.

**Fase F — Especialidades y Tutor IA**  
Expansiones posteriores.

---

### `01_modelo_de_contenido.md`

Define formalmente cómo deberá organizarse el contenido educativo.

Incluye conceptos como:

- niveles;
- habilidades;
- ficha de lección;
- prerrequisitos;
- objetivo observable;
- actividades;
- comprobaciones;
- rúbricas;
- versiones de Blender;
- evidencias;
- progreso educativo.

Esto permite separar tres conceptos diferentes que anteriormente podían confundirse:

- avance del curso;
- gamificación/XP;
- habilidades realmente demostradas.

---

### `02_manual_oracle.md`

Se creó un manual específico para realizar la migración de Oracle a la arquitectura v3.

Documenta:

- orden correcto de scripts;
- diagnóstico de la base;
- aplicación de `005`;
- aplicación de `006`;
- comprobación de objetos;
- importación del contenido;
- creación de niveles;
- herramientas de autor;
- recuperación ante errores;
- validación del backend.

---

### `03_addon_blender.md`

Se dejó definida la arquitectura prevista para el futuro add-on de Blender.

El add-on todavía no es requisito para utilizar el primer recorrido educativo.

La decisión principal fue mantener la siguiente regla:

> El alumno debe poder completar inicialmente las lecciones sin depender del add-on.

El complemento se incorporará después como herramienta contextual de ayuda, verificación e integración.

---

# 5. Propuesta educativa de Blender

También quedó archivada la propuesta:

`docs/propuestas/2026-10-03_propuesta_contenido_blender.txt`

En ella se definió una ruta educativa progresiva para Blender.

La primera entrega educativa futura recibió el nombre:

**“Mi primer espacio 3D”**

La propuesta contempla actividades como:

- preparar Blender;
- aprender navegación;
- diferenciar movimiento de cámara y movimiento de objetos;
- seleccionar y transformar primitivas;
- construir una habitación;
- guardar y recuperar proyectos;
- construir objetos simples;
- introducir edición de malla;
- trabajar materiales;
- utilizar cámara e iluminación;
- corregir errores;
- crear una variante personal;
- evaluar el trabajo mediante una rúbrica;
- posteriormente exportar modelos para el laboratorio web.

Esta parte continúa principalmente como diseño educativo. La infraestructura necesaria para soportarla ya comenzó a implementarse.

---

# 6. Nuevas migraciones de Oracle

Se incorporaron dos migraciones nuevas.

## 6.1 Script 005

Archivo:

`backend/sql/005_niveles_habilidades_versiones.sql`

Su objetivo es ampliar el esquema de datos sin borrar información existente.

El script incorpora las tablas:

- `NIVELES`;
- `HABILIDADES`;
- `HABILIDADES_ALUMNO`;
- `EVALUACIONES_RUBRICA`;
- `VERSIONES_BLENDER`;
- `VERIFICACIONES_BLENDER`.

También incorpora:

`MODULOS.NIVEL_ID`

Con esto un módulo puede quedar asociado a un nivel determinado.

El script se diseñó para ser:

- incremental;
- aditivo;
- repetible;
- idempotente;
- compatible con los datos existentes.

No elimina alumnos, progreso ni contenido.

---

# 7. Herramientas de autor en Oracle

## 7.1 Script 006

Archivo:

`backend/sql/006_herramientas_autor.sql`

Este script incorpora herramientas adicionales directamente dentro de Oracle.

Se añadieron vistas destinadas a inspeccionar la estructura educativa y la compatibilidad.

Entre ellas:

- `V_AMATISTA_MAPA`;
- `V_AMATISTA_FICHAS_INCOMPLETAS`;
- `V_AMATISTA_COMPATIBILIDAD`.

También se incorporó el paquete:

`AMATISTA_AUTOR`

El paquete permitirá progresivamente realizar operaciones de autoría directamente desde Oracle, por ejemplo:

- crear niveles;
- asignar módulos;
- registrar habilidades;
- generar lecciones;
- completar fichas;
- copiar lecciones;
- registrar versiones de Blender;
- registrar verificaciones.

---

# 8. Pruebas previas de las migraciones

Antes de utilizarlas en la base real se comprobaron diferentes escenarios.

Se verificó que:

- una base de la v2.2 puede recibir `005` y `006`;
- ejecutar nuevamente los scripts no destruye los datos;
- una base vacía puede recorrer la secuencia completa;
- el backend anterior sigue funcionando después de aplicar `005`;
- el backend nuevo reconoce la nueva estructura;
- las herramientas del paquete de Oracle pueden ejecutarse correctamente.

La suite del backend alcanzó **236 pruebas en verde** durante la preparación de la reestructuración.

---

# 9. Integración de la reestructuración en `main`

La reestructuración fue incorporada posteriormente a la rama principal mediante el trabajo asociado al PR de la v3.

El commit principal de integración fue:

`2337fd5b1687fa1c49579ef5da58ebb901c1303a`

con el mensaje:

**“Reestructuración v3: niveles, versiones de Blender, herramientas de autor y tablero nuevo (#12)”**

La integración incluyó:

- nuevas migraciones;
- documentación;
- nueva organización educativa;
- cambios del backend;
- herramientas de contenido;
- APIs;
- tablero actualizado;
- documentación de dirección del proyecto.

También se actualizaron:

- `README.md`;
- `PROYECTO.md`;
- `CHANGELOG.md`;
- documentación del backend;
- documentación de versiones;
- tablero Kanban.

---

# 10. Actualización del tablero

El tablero anterior de la etapa v2 fue conservado como historial.

La v3 recibió un tablero nuevo.

El roadmap pasa ahora aproximadamente por:

`v2.2.0 piloto → v3.0.0 → v3.1.0 → v3.2.0 → v3.3.0 → v3.4.0`

Esto evita perder las decisiones y tareas anteriores mientras permite que el proyecto tenga una dirección nueva.

También se mantuvo la filosofía de trabajo para un desarrollador principal:

- una tarea activa;
- pocas tareas preparadas;
- una sola meta concreta de entrega;
- ramas pequeñas;
- evidencia antes de cerrar una tarea.

---

# 11. Trabajo realizado en el servidor

Posteriormente se trabajó directamente con la instalación de Amatista existente en la VM.

Ruta utilizada:

`/home/opc/amatista`

El backend utilizado se encuentra en:

`/home/opc/amatista/backend`

Durante esta etapa se trabajó sobre una rama local identificada como:

`despliegue/v3-2026-10-03`

El objetivo fue comprobar la nueva estructura contra el entorno real en lugar de limitar la validación a SQLite o a pruebas locales.

---

# 12. Dependencias del backend

Se revisó el entorno virtual de Python utilizado por el backend.

Las dependencias necesarias quedaron instaladas.

Posteriormente se ejecutó la comprobación de dependencias de `pip`.

Resultado:

`No broken requirements found.`

Esto confirmó que el entorno virtual no presentaba dependencias rotas desde el punto de vista de `pip`.

También apareció la recomendación de actualizar `pip`, pero esta advertencia no impidió el funcionamiento del backend.

---

# 13. Diagnóstico contra Oracle real

Se ejecutó el diagnóstico de Oracle mediante:

```bash
cd ~/amatista/backend
source venv/bin/activate
python diagnostico_oracle.py
```

La conexión se realizó correctamente contra Oracle.

Resultado confirmado:

**Oracle 23.26.3.3.0**

Usuario/esquema:

**ADMIN**

El diagnóstico reconoció correctamente las tablas existentes.

---

# 14. Aplicación de las migraciones 005 y 006 en Oracle

Se procedió a aplicar las migraciones correspondientes a la v3.

Se ejecutó:

`005_niveles_habilidades_versiones.sql`

y posteriormente:

`006_herramientas_autor.sql`

Después de completar las migraciones, el esquema quedó compuesto por **14 tablas de Amatista**.

Entre las tablas reconocidas se encontraron:

- `USUARIOS`;
- `SESIONES`;
- `PROGRESO_LECCIONES`;
- `LOGROS`;
- `EVENTOS_APRENDIZAJE`;
- `CURSOS`;
- `MODULOS`;
- `LECCIONES`;
- `NIVELES`;
- `HABILIDADES`;
- `HABILIDADES_ALUMNO`;
- `EVALUACIONES_RUBRICA`;
- `VERSIONES_BLENDER`;
- `VERIFICACIONES_BLENDER`.

Esto confirmó que la migración amplió la base anterior sin sustituirla.

---

# 15. Conservación de los datos existentes

Después de la migración se comprobó que la información previamente almacenada seguía presente.

Entre los valores observados durante el diagnóstico se encontraban:

```text
USUARIOS                        3
SESIONES                        1
PROGRESO_LECCIONES              9
LOGROS                          1
EVENTOS_APRENDIZAJE            19
CURSOS                          2
MODULOS                         2
LECCIONES                       7
```

Esto es especialmente importante porque demuestra que la migración no reinicializó la plataforma.

Los alumnos, progreso y contenido anteriores continuaron existiendo después de ampliar el esquema.

---

# 16. Validación de los objetos del script 006

También se verificaron los objetos de Oracle creados para las herramientas de autor.

El paquete y las vistas quedaron en estado válido.

El objetivo era obtener objetos equivalentes a:

```text
AMATISTA_AUTOR                 PACKAGE        VALID
AMATISTA_AUTOR                 PACKAGE BODY   VALID
V_AMATISTA_COMPATIBILIDAD      VIEW           VALID
V_AMATISTA_FICHAS_INCOMPLETAS  VIEW           VALID
V_AMATISTA_MAPA                VIEW           VALID
```

La validación final confirmó que los objetos necesarios se encontraban correctamente compilados.

---

# 17. Validación del contenido

Se ejecutó también la herramienta de contenido del backend.

Se comprobaron los archivos JSON utilizados actualmente por la plataforma.

La validación de los **dos archivos de contenido existentes** terminó sin errores.

Esto permitió comprobar que la nueva estructura no había dejado inválidos los módulos educativos existentes.

---

# 18. Importación y creación de niveles

Después de validar el contenido se realizó la importación correspondiente a la nueva estructura.

Se crearon ocho entradas de nivel para Blender:

- `blender-n1`;
- `blender-n2`;
- `blender-n3`;
- `blender-n4`;
- `blender-n5-web`;
- `blender-n5-animacion`;
- `blender-n5-producto`;
- `blender-n5-procedural`.

Los niveles fueron creados deliberadamente en:

**estado borrador**

Esto significa que la arquitectura ya existe en la base de datos, pero todavía no se está presentando automáticamente al alumno como contenido educativo terminado.

---

# 19. Situación del Nivel 1

La intención es que el contenido introductorio existente de Blender comience a formar parte de:

`blender-n1`

Sin embargo, crear el nivel en Oracle no significa que el Nivel 1 educativo esté terminado.

Todavía deben completarse progresivamente:

- fichas;
- habilidades;
- objetivos;
- actividades;
- recursos;
- comprobaciones;
- rúbricas;
- versión de Blender verificada.

Por eso la estructura técnica está creada, aunque parte importante de su contenido sigue siendo planificación.

---

# 20. Validación del servicio del backend

Durante la revisión del servidor se identificó el servicio real que mantiene la API activa.

Se esperaba inicialmente encontrar un servicio llamado:

`amatista-api`

Sin embargo, el servidor tenía configurado el servicio:

`amatista-backend`

El backend terminó identificado y operativo mediante el servicio existente.

Esto fue importante para evitar modificar o reiniciar una unidad de `systemd` que realmente no era la utilizada por la VM.

---

# 21. Pruebas de la API

Después de validar Oracle y el backend se realizaron comprobaciones directas sobre la API.

## Salud del backend

El endpoint:

`/api/salud`

respondió correctamente.

Esto confirmó que FastAPI estaba operativo después de las modificaciones.

---

## Catálogo

También se consultó el catálogo de contenido.

La petición terminó con:

**HTTP 200**

Por lo tanto, la migración de Oracle no rompió la consulta principal del catálogo.

Esto era una comprobación crítica porque el backend v3 consulta ahora información relacionada con `MODULOS.NIVEL_ID`.

---

## Versiones de Blender

También se comprobó:

`/api/blender/versiones`

Respuesta observada:

```json
{
  "principal": null,
  "versiones": []
}
```

Este resultado es correcto para el estado actual.

Significa que:

- la API funciona;
- la tabla existe;
- el endpoint consulta correctamente Oracle;
- todavía no se ha elegido una versión principal de Blender.

No se inventó una versión únicamente para llenar la tabla.

---

# 22. Estado final de Oracle

Al finalizar las comprobaciones:

- la conexión con Oracle era correcta;
- el esquema utilizado era `ADMIN`;
- existían 14 tablas de Amatista;
- los datos anteriores seguían presentes;
- las nuevas tablas estaban disponibles;
- las vistas estaban válidas;
- el paquete `AMATISTA_AUTOR` estaba válido;
- el backend podía consultar la base;
- el catálogo respondía correctamente.

La migración de estructura quedó, por lo tanto, funcional.

---

# 23. Dificultades encontradas

## 23.1 Nombre diferente del servicio

La documentación de despliegue hacía referencia a:

`amatista-api`

pero la VM utilizaba:

`amatista-backend`

Esto causó confusión durante las primeras comprobaciones del servicio.

La solución fue identificar la unidad realmente instalada y continuar las pruebas utilizando `amatista-backend`.

---

## 23.2 Error `PLS-00103`

Durante una ejecución inicial de SQL apareció:

`PLS-00103`

La causa no era un problema de diseño de la migración completa, sino que Oracle había recibido una porción incompleta del script PL/SQL.

Los scripts de este tipo contienen bloques y declaraciones que necesitan ejecutarse completos.

La corrección consistió en ejecutar el archivo completo mediante el modo de script correspondiente.

Después de hacerlo, la migración pudo continuar correctamente.

---

## 23.3 Desconexión SSH

Durante una de las etapas de diagnóstico la conexión SSH con la VM se interrumpió.

Esto detuvo temporalmente el proceso de validación.

Después de recuperar la conexión se repitieron las comprobaciones necesarias para no asumir que una operación interrumpida había terminado correctamente.

No se utilizó la desconexión como evidencia de éxito o fallo de Oracle.

---

## 23.4 Diferencia entre infraestructura terminada y contenido terminado

Una dificultad conceptual importante fue distinguir entre:

**tener la infraestructura para los niveles**

y

**tener realmente los niveles educativos terminados**.

Al finalizar la jornada ya existían:

- tablas;
- relaciones;
- APIs;
- herramientas;
- niveles en Oracle.

Pero esto no significa que los cinco niveles estén completamente desarrollados como cursos.

Gran parte del trabajo educativo continúa pendiente.

---

# 24. Qué quedó completamente funcional

Al cierre de la sesión se pudo considerar comprobado:

- backend instalado;
- dependencias consistentes;
- conexión FastAPI → Oracle;
- Oracle funcionando con el esquema de Amatista;
- migración `005`;
- migración `006`;
- 14 tablas;
- datos anteriores conservados;
- objetos de autor válidos;
- contenido JSON válido;
- creación de niveles;
- ocho niveles registrados;
- servicio del backend activo;
- `/api/salud` operativo;
- catálogo operativo mediante HTTP 200;
- endpoint de versiones de Blender operativo.

---

# 25. Qué continúa en teoría o pendiente de construcción

Aunque la infraestructura v3 ya comenzó a funcionar, todavía existen elementos que permanecen fundamentalmente en fase de diseño.

### Contenido de los niveles

Los ocho niveles existen como estructura de datos, pero todavía deben poblarse y comprobarse educativamente.

### Versión principal de Blender

Todavía no se ha elegido una versión.

Por eso:

```json
"principal": null
```

es actualmente el resultado esperado.

La versión deberá decidirse después de verificar:

- soporte oficial;
- compatibilidad;
- sistema operativo;
- actividades;
- archivos;
- add-on futuro.

### Habilidades del estudiante

Las tablas existen, pero todavía falta integrar completamente la captura y visualización de habilidades.

### Rúbricas

La infraestructura de datos existe, pero aún debe vincularse completamente con la experiencia del alumno.

### Diagnóstico de entrada

Está diseñado conceptualmente, pero aún no constituye un flujo terminado para el estudiante.

### “Mi primer espacio 3D”

Existe como propuesta y secuencia pedagógica, pero todavía debe convertirse en contenido completo.

### Laboratorio GLB

Continúa como fase posterior.

### Add-on de Blender

Está diseñado arquitectónicamente, pero no forma todavía parte del recorrido obligatorio.

### Tutor IA

Permanece como ampliación futura y separada del núcleo.

---

# 26. Diferencia entre el estado anterior y el actual

Antes de esta jornada, hablar de niveles, habilidades, versiones de Blender y herramientas de autor era principalmente una propuesta arquitectónica.

Después del trabajo realizado, esos conceptos ya tienen representación técnica dentro de Amatista.

Ahora existen físicamente en la arquitectura:

```text
NIVELES
HABILIDADES
HABILIDADES_ALUMNO
EVALUACIONES_RUBRICA
VERSIONES_BLENDER
VERIFICACIONES_BLENDER
```

junto con las herramientas necesarias para administrarlos.

Por lo tanto, la v3 dejó de ser únicamente una idea documental.

Lo que continúa en teoría es principalmente **el contenido y la experiencia educativa que utilizarán esa infraestructura**.

---

# 27. Estado general de Amatista al cierre

El estado puede resumirse de la siguiente manera:

### Infraestructura

**FUNCIONAL**

### Backend

**FUNCIONAL**

### Oracle

**FUNCIONAL**

### Migración v3

**APLICADA Y VALIDADA**

### Conservación de datos anteriores

**COMPROBADA**

### APIs principales comprobadas

**FUNCIONALES**

### Estructura de niveles

**IMPLEMENTADA**

### Niveles educativos

**CREADOS EN BORRADOR**

### Versión principal de Blender

**PENDIENTE**

### Contenido completo por niveles

**EN DESARROLLO**

### Laboratorio

**PENDIENTE**

### Add-on

**PLANIFICADO**

### Tutor IA

**PLANIFICADO PARA UNA FASE POSTERIOR**

---

# 28. Resultado de la jornada

La jornada permitió pasar de una reestructuración planteada documentalmente a una arquitectura v3 que ya puede convivir con la plataforma real.

La base Oracle fue ampliada correctamente y conserva la información previa.

El backend reconoce la nueva estructura.

Los endpoints principales continúan respondiendo.

Las herramientas necesarias para organizar niveles, habilidades, versiones y verificaciones ya tienen soporte técnico.

El siguiente problema principal ya no es demostrar que Oracle puede soportar la reestructuración.

El siguiente problema es **llenar esa estructura con contenido educativo real, probado y observable por alumnos**.

---

# 29. Conclusión

Amatista cerró esta etapa con una separación mucho más clara entre infraestructura, contenido y futuras ampliaciones.

La plataforma conserva el núcleo v2.2 que ya funcionaba, pero ahora dispone de las bases técnicas de la v3.

El resultado más importante es que la migración no requirió comenzar nuevamente ni sacrificar el trabajo existente.

La arquitectura anterior fue ampliada.

Oracle pasó de la estructura educativa básica a un modelo capaz de representar niveles, habilidades, evaluaciones y compatibilidad con Blender.

FastAPI continuó funcionando sobre esa estructura.

El proyecto se encuentra ahora en un punto donde la mayor prioridad puede pasar de la arquitectura interna a la construcción y prueba del recorrido real del estudiante.

**Estado final:** la base técnica de la reestructuración v3 funciona; la siguiente etapa consiste en convertir esa infraestructura en experiencia educativa real.