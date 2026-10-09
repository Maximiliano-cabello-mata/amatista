# Plataforma y Blender integrados · hallazgos y plan (9 de octubre de 2026)

Pedido de Maximiliano (9 oct, 02:40): que la plataforma **administre** Blender en vez de sentirse como dos cosas separadas; que dentro de Blender el alumno vea **solo las herramientas de su práctica**, con diálogos que le enseñen a usarlas; y que el motor **identifique la figura** por sí mismo, con poca exigencia de medidas al principio y más exigencia en niveles avanzados.

## 1. Debilidades encontradas

### La conexión plataforma ↔ Blender

| # | Debilidad | Dónde se ve | Efecto para el alumno |
|---|---|---|---|
| D1 | **«Abrir en Blender» solo marca la práctica en el servidor.** Blender la pide únicamente al arrancar o con el botón «Abrir mi lección actual». | `POST /practicas/{id}/abrir` + `cuenta.al_iniciar()` | Si Blender ya estaba abierto no pasa nada: el alumno tiene que ir a N › Amatista y pulsar otro botón. |
| D2 | **La plataforma no sabe si Blender está abierto.** No hay presencia: la lección consulta el progreso cada 6 s, pero solo cambia cuando llega un intento. | `PracticaBlender.jsx` | La tarjeta dice «Abre Blender…» aunque ya esté abierto; no hay un «conectado ✓». |
| D3 | **La configuración de Blender vive en Blender.** Acompañamiento, tarjeta 3D, avisos de herramientas: todo en Preferencias de Blender. | `ajustes.py` | La plataforma no puede decidir cómo se ve Blender para un alumno; cada computadora queda distinta. |
| D4 | **Una sola dirección.** Blender habla con la plataforma (intentos), la plataforma nunca le habla a Blender. | API `/api/addon/v1` | No hay forma de «mandar» nada: abrir, cambiar el modo, cerrar. |

### Blender abruma

| # | Debilidad | Efecto |
|---|---|---|
| D5 | Blender se muestra completo: barra de herramientas con ~20 herramientas, 6 menús, línea de tiempo, 13 pestañas de propiedades. La práctica declara `tools.allowed` pero **solo se usa para avisar después** («usaste una herramienta de otro nivel»). | El alumno de nivel 1 busca entre todo; la política es corregir, no prevenir. |
| D6 | El panel Amatista crece por capas (cuenta, práctica, Ahora, pasos, roles, aprender, mi curso): mucha información a la vez en la barra lateral. | Se siente como «otra aplicación» dentro de Blender. |
| D7 | No hay una explicación **por herramienta**: las teclas aparecen dentro del paso, pero no hay un lugar con «esta es la herramienta, así se usa, pruébala». | La curva de aprendizaje depende de leer cada paso. |

### El motor y las figuras

| # | Debilidad | Efecto |
|---|---|---|
| D8 | `figure.resembles` **necesita roles**: el alumno debe asignar «Vagón», «Rueda»… en el panel para que el motor sepa qué es cada pieza. | Paso extra que no es de Blender; si no asigna roles, el motor «no ve» la figura. |
| D9 | La exigencia es **la misma en todos los niveles** (±35 %, aprueba con 70 %). | Al nivel 1 se le exige igual que al 3; en el 4 y 5 no se puede pedir precisión. |
| D10 | El motor compara contra **su** modelo, pero no **identifica** qué construyó el alumno. | No puede decir «esto parece una mesa, no un tren». |
| D11 | El sentido físico se revisa caso por caso (`spatial.grounded`, `on_top` escritos a mano en cada práctica). No hay una regla general de «nada flota, todo está unido». | Hay que prever cada figura sin sentido en el JSON. |

## 2. Qué hacen plataformas y documentación comparables

- **Unity · In-Editor Tutorials (IET).** El tutorial vive dentro del editor, **enmascara** todo el editor y deja visible solo lo que toca en esa página; cada página avanza sola cuando se cumple un *criterio* (por ejemplo, que la herramienta correcta esté activa). Es exactamente el modelo que buscamos: ocultar por defecto, revelar lo de este paso. ([framework](https://docs.unity3d.com/Packages/com.unity.learn.iet-framework@2.0/manual/index.html), [guía de resaltado](https://docs.unity3d.com/Packages/com.unity.learn.iet-framework@5.0/manual/highlight-guide.html))
- **Adobe Photoshop · tutoriales prácticos en Descubrir.** El tutorial se abre dentro de la aplicación, con el archivo de ejemplo listo y el panel que no se cierra mientras se sigue. La plataforma «abre» la práctica en la herramienta, no al revés. ([Adobe Tutorial Builder](https://helpx.adobe.com/tutorial-builder-web/tbw-user-guide/overview/sections-and-steps.html))
- **Carroll y Carrithers (IBM, 1984) · «Training wheels».** Bloquear las funciones avanzadas a los principiantes los hizo aprender más rápido y con menos errores, y después usaban el sistema completo **mejor** que quienes empezaron con todo visible. Es la base para el modo enfocado por nivel. ([resumen de Nielsen Norman Group](https://www.nngroup.com/articles/training-wheels-user-interface/))
- **Blender · espacios de trabajo y plantillas de aplicación.** Blender mismo permite construir «tu propia aplicación sobre Blender» con su interfaz, y las extensiones pueden cambiar paneles, menús y regiones. Lo usamos sin plantilla (sin archivos binarios en el repositorio): el add-on ajusta la ventana al abrir la práctica y la deja como estaba al cerrar. ([plantillas de aplicación](https://docs.blender.org/manual/en/2.83/advanced/app_templates.html))
- **Biederman · reconocimiento por componentes (RBC).** Las personas reconocen un objeto por sus partes simples (cilindros, cajas, conos) **y por cómo se relacionan** (encima de, a los lados de, del mismo tamaño). Una taza y una cubeta tienen las mismas partes con otra relación. Es la idea del reconocedor: piezas + relaciones, sin pedir medidas exactas. ([teoría RBC](https://en.wikipedia.org/wiki/Recognition-by-components_theory))
- **Roblox, extensiones de Blender y similares** abren la aplicación de escritorio desde la web con un protocolo registrado (`roblox-player:`) o con arrastrar y soltar. Lo dejamos para una fase siguiente: requiere probar el instalador en Windows y Mac reales (T-056).

## 3. Plan (lo que se implementa en esta rama)

### A. Enlace en vivo: la plataforma manda, Blender obedece

1. **Latido del add-on** (`POST /api/addon/v1/enlace`, cada 5 s mientras Blender tiene una sesión): dice que está abierto, qué práctica tiene, en qué paso va, su progreso y si está en modo enfocado. La respuesta trae **órdenes pendientes** y los **ajustes de Blender** del alumno.
2. **Órdenes**: «Abrir en Blender» en la lección deja una orden `abrir_practica`; el Blender abierto la recibe en el siguiente latido y abre la práctica solo, con su escena y su modo enfocado. Confirma con su próximo latido.
3. **Ajustes de Blender administrados desde la plataforma** («Mi Blender»): modo enfocado (automático por nivel / siempre / nunca), acompañamiento (Acompañado / Solo tarjeta / Silencioso) y avisos. Blender los aplica al recibirlos; las preferencias locales quedan como respaldo sin conexión.
4. **La lección muestra a Blender en vivo**: «Blender conectado · Paso 3 de 7 · Modo enfocado», o «Blender no está abierto» con lo que hay que hacer.
5. Oracle **010** (aditivo): `ADDON_ENLACES` (una fila por sesión del add-on: último latido y estado) y `ADDON_ORDENES` (órdenes con su entrega), más `ADDON_AJUSTES` (una fila por alumno).

### B. Modo enfocado en Blender

1. Al abrir una práctica (si el modo está activo), el add-on **enfoca la ventana**: oculta la barra de herramientas de Blender, el encabezado de herramientas, la línea de tiempo (salvo en animación) y deja la barra lateral abierta en Amatista.
2. **Menús filtrados**: el menú Agregar (Shift+A) muestra solo lo que la práctica usa (por ejemplo cubo y cilindro para el tren; luces y cámara en la de iluminación). Los demás menús del encabezado se ocultan; Ver y Agregar quedan si la práctica los usa.
3. Panel **«Tus herramientas»**: una tarjeta por herramienta de la práctica (las de `tools.allowed`), con su tecla, botón **Usar** y botón **¿Cómo se usa?**, que abre un diálogo con qué hace, los pasos con teclas y un error común. La herramienta del paso actual aparece marcada como «la de ahora».
4. El catálogo de herramientas (`tools/catalogo.json`) gana los campos `howto` (pasos), `mistake` (error común) y `operator` (lo que ejecuta «Usar»), así cada práctica solo cita ids.
5. **Ver todo Blender** devuelve la interfaz completa en cualquier momento (no se bloquea nada, solo se oculta). Al cerrar la práctica o desactivar el add-on todo vuelve a como estaba.
6. Por defecto: enfocado en niveles 1 y 2, opcional en 3 a 5 (la plataforma lo puede cambiar).

### C. El motor reconoce figuras (motor 3.4)

1. **Sin roles obligatorios**: el motor deduce qué pieza del alumno corresponde a cada pieza del modelo por su forma (primitiva, proporciones, si es delgada o alargada) y su lugar en la figura. Los roles siguen funcionando cuando el alumno los pone, pero ya no son necesarios.
2. **Relaciones (la figura tiene sentido)**: del modelo se deducen solas las relaciones que importan: qué toca el suelo, qué va encima de qué, qué va a cada lado, qué piezas son pares simétricos. El motor revisa esas relaciones en la figura del alumno, sin importar sus medidas.
3. **Sentido físico general**: nada flota (todo toca el suelo o se apoya en otra pieza) y la figura es una sola pieza armada.
4. **Identificación**: el motor compara la figura con su biblioteca (los modelos de todas las prácticas y figuras comunes: mesa, silla, casa, torre, coche, muñeco) y dice qué parece. Si se parece más a otra cosa, lo dice: «Tu figura se parece más a una mesa que a un tren».
5. **Exigencia por nivel** (nuevo validador `figure.recognize`):

   | Nivel | Qué se exige | Medidas | Aprueba con |
   |---|---|---|---|
   | 1 | Forma identificable: piezas y relaciones | ±60 %, escala libre | 55 % |
   | 2 | Forma y proporción | ±45 % | 65 % |
   | 3 | Proporción cercana | ±35 % (como hoy) | 70 % |
   | 4 | Medidas cercanas en metros | ±20 %, escala real ±25 % | 80 % |
   | 5 | Medidas exactas | ±10 %, escala real ±10 % | 88 % |

   La práctica puede fijar su exigencia con `reference.strictness` (`forma`, `proporcion`, `cercana`, `medidas`, `exacta`). La libertad creativa se respeta: las piezas **extra** (decoración) no restan mientras estén apoyadas y la figura del modelo siga reconocible.
6. Las prácticas con modelo por piezas (tren, muñeco, cojín, puente, aldea) pasan a `figure.recognize`. Sus casos «Sin sentido» de `pruebas.json` deben seguir reprobando y se agregan casos sin roles y con decoración.

### Fuera de esta rama (siguiente fase)

- Abrir Blender desde el navegador con un protocolo `amatista://` registrado por el instalador (necesita prueba en Windows y Mac reales, T-056).
- Exámenes calificados en el servidor (T-083) y licencia del contenido: siguen pendientes de decisión.

## 4. Cómo se prueba

- Motor: pruebas nuevas del reconocedor (sin roles, giros, decoración, cada nivel, figura confundida con otra) y todos los `pruebas.json`.
- Add-on: `en_blender.py` con bpy 5.0.1 (modo enfocado entra y sale dejando la ventana igual, menús filtrados, panel de herramientas y diálogo, órdenes del latido).
- Backend: pruebas de `/enlace`, órdenes, ajustes y permisos; `test_esquema` con el 010.
- Frontend: vitest de la tarjeta en vivo y de los ajustes de Blender.
