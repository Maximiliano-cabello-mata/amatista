# Referencia técnica y antecedentes

> Documento conservado desde la revisión de código del cierre. Algunas cifras y estados pertenecen a revisiones anteriores. Para la entrega de Hack4Edu prevalece el [acta de cierre](docs/hack4edu/cierre/ACTA.md).

# Amatista 💎

**🌐 Plataforma pública: [https://amatista-3d.tech](https://amatista-3d.tech)** · **API: [https://api.amatista-3d.tech](https://api.amatista-3d.tech)** · [Guía del despliegue público (Cloudflare Workers + Oracle Cloud)](docs/despliegue/2026-10-29_despliegue_publico_amatista_3d_tech.md)

[![Hack4Edu 2026](https://img.shields.io/badge/Hack4Edu-2026-9b59b6?style=flat-square&logo=target)](docs/hack4edu/README.md)
[![Reto 02](https://img.shields.io/badge/Reto_02-Aprender_sin_conexi%C3%B3n-00e5ff?style=flat-square)](docs/hack4edu/RETO_02_APRENDER_SIN_CONEXION.md)
[![Software Libre](https://img.shields.io/badge/Software_Libre-100%25_Blender_%2B_A--Frame-f5792a?style=flat-square)](#1-estado-actual)
[![Offline First PWA](https://img.shields.io/badge/PWA-Offline--First-emerald?style=flat-square)](https://amatista-3d.tech)
[![Presupuesto Web](https://img.shields.io/badge/Presupuesto_Web-250.8_KB_%E2%89%A4_280_KB-blue?style=flat-square)](herramientas/auditoria/estandares_web.py)
[![Docker](https://img.shields.io/badge/Docker-Orquestaci%C3%B3n_Local-orange?style=flat-square)](docker-compose.yml)

**Plataforma educativa 100 % de Software Libre para aprender creación 3D con Blender (GPL) y A-Frame (MIT), optimizada para funcionar sin conexión y en equipos escolares modestos.**

---

## ⚡ Guía para Evaluadores (Entiende y Prueba Todo en 5 Minutos)

Si tienes **entre 5 y 10 minutos** para evaluar el repositorio y la plataforma, aquí tienes exactamente qué hace única a **Amatista** y cómo probar cada flujo al instante **sin necesidad de crear cuenta ni configurar servidores externos**:

### 1. ¿Qué problema resuelve y cómo funciona?
En escuelas con conectividad intermitente o nula y computadoras de bajos recursos:
1. **100 % Software Libre y Cero Licencias:** Todo el plan de estudios (15 módulos, 9 talleres y 9 proyectos guiados) se enfoca exclusivamente en **Blender** y **A-Frame / WebXR**, eliminando dependencias de suites propietarias. Available con adaptación automática de hardware **Geoda (`N0–N4`)** y **100 % de animaciones en GPU (60 FPS)**.
2. **Innovación en Aula — Captura del Código del Modelo (~1 KB) en vez de Archivos Binarios (20 MB):**
   - Enviar archivos `.blend` o `.glb` por red escolar colapsa el ancho de banda.
   - En Amatista, el alumno **se une a una clase con un código (`AMA-7K2P`)** y **sube el código de su modelo** (script Python `bpy.ops.mesh...`, escena declarativa `<a-scene>` de A-Frame o receta JSON `amatista.modelo/1`).
   - La **interfaz del profesor (`#/profesor`) captura ese código y recrea el modelo 3D interactivo en vivo** en un lienzo `<canvas>` propio (sin depender de servidores de renderizado), permitiendo rotar la pieza, inspeccionar vértices/triángulos, auditar el código fuente enviado y calificar (`0–10`).
   - *Nota arquitectónica:* La opción de renderizado remoto (`Amatista Cloud`) fue retirada de la versión final para priorizar la ejecución local fluida y se conserva documentada como propuesta técnica en [`docs/propuestas/2026-11-05_propuesta_amatista_cloud.md`](docs/propuestas/2026-11-05_propuesta_amatista_cloud.md).

### 2. Recorrido práctico en 3 clics (5 minutos)

| Tiempo | Qué probar en la aplicación | Ruta directa | Qué observar |
|---|---|---|---|
| **Min 1** | **Portada, Cursos Libres y Estudio 3D** | `#/` y `#/estudio` | En la portada verás el bloque **«⚡ Recorrido rápido para evaluadores»**, los caminos de **Blender** y **A-Frame**, y el **Estudio Web 3D** offline. |
| **Min 2–3** | **Rol Alumno: Unirse a una clase y subir el código del modelo** | `#/panel` *(Mi panel · Clase)* | 1. En la tarjeta superior **«Mi clase»**, pulsa **«Unirse rápido a AMA-7K2P»**.<br>2. En cualquiera de las 3 prácticas del grupo, pulsa **«Subir código del modelo»**.<br>3. Elige una plantilla (**Tren Low-Poly en Python `bpy`**, **Faro y Cristal en `<a-scene>` A-Frame** o **Mesa en JSON**), edita el código, verifica el conteo de mallas/triángulos en vivo y pulsa **«Capturar código y enviar al profesor»**. |
| **Min 4–5** | **Rol Profesor: Recrear el modelo 3D desde el código y calificar** | `#/profesor` o `#/profesor/practica/asg-tren-m1` | 1. Al abrir la entrega del alumno, el motor **compila el código capturado y recrea el modelo 3D interactivo** en pantalla.<br>2. Rota la cámara (`Perspectiva`, `Frente`, `Lado`, `Arriba`), despliega **«Código capturado del alumno»** para revisar el script exacto y asigna nota (`0–10`) + comentario. |

### 3. Verificación rápida por terminal (1 minuto)

```bash
# 1. Auditar presupuestos web (≤ 280 KB JS/JSON, ≤ 105 KB CSS, 64/64 keyframes en GPU, 100 % software libre)
python3 herramientas/auditoria/estandares_web.py

# 2. Validar los 15 módulos curriculares (Blender + A-Frame) y las 30 pruebas del Corazón Amatista 1.0
python3 backend/herramientas/contenido.py validar
python3 -m unittest discover -s engine/tests -v
```

---

> **Despliegue verificado con registros del 23 de octubre de 2026; código en `main` actualizado al 5 de noviembre de 2026.** La PWA pública utiliza Cloudflare Workers; la API funciona en Oracle Cloud con Caddy y Oracle Database.
>
> **Hack4Edu 2026 · Reto 02: Aprender sin conexión:** Consulta el **[Dossier Técnico del Reto 02](docs/hack4edu/RETO_02_APRENDER_SIN_CONEXION.md)**, la **[Auditoría y Optimización Integral](docs/auditoria/2026-11-05_auditoria_y_optimizacion_integral.md)** y la arquitectura en **[ARQUITECTURA.md](ARQUITECTURA.md)**.

**Todo el proyecto en un vistazo:** [índice de la documentación](docs/README.md) · [auditoría y optimización 2026-11-05](docs/auditoria/2026-11-05_auditoria_y_optimizacion_integral.md) · [propuesta Amatista Cloud](docs/propuestas/2026-11-05_propuesta_amatista_cloud.md) · [arquitectura C4](ARQUITECTURA.md) · [reto 02 hack4edu](docs/hack4edu/RETO_02_APRENDER_SIN_CONEXION.md) · [guía de contribución](CONTRIBUTING.md) · [seguridad y privacidad](SECURITY.md) · [mapa del repositorio](docs/manual-del-codigo/01_mapa_del_repositorio.md) · [esquema SQL](docs/base-de-datos/README.md) · [tablero](KANBAN.md) · [versiones](CHANGELOG.md)

---

## Contenido

1. [Estado actual](#1-estado-actual)
2. [Hack4Edu 2026 · Reto 02: Aprender sin conexión](#2-hack4edu-2026--reto-02-aprender-sin-conexión)
3. [Cómo llegamos hasta aquí](#3-cómo-llegamos-hasta-aquí)
4. [Qué hace la plataforma](#4-qué-hace-la-plataforma)
5. [Arquitectura y microservicios](#5-arquitectura-y-microservicios)
6. [Estructura del repositorio](#6-estructura-del-repositorio)
7. [Base de datos](#7-base-de-datos)
8. [Tecnologías](#8-tecnologías)
9. [Ejecutar en local](#9-ejecutar-en-local)
10. [Herramientas del desarrollador](#10-herramientas-del-desarrollador)
11. [Cómo se trabaja](#11-cómo-se-trabaja)
12. [Versiones](#12-versiones)
13. [Qué sigue](#13-qué-sigue)
14. [Documentación](#14-documentación)
15. [Licencia](#15-licencia)

---

## 1. Estado actual

Código revisado al **5 de noviembre de 2026**:

| Frente | Dónde está |
|---|---|
| **Producción** | Verificada en `amatista-3d.tech` (Cloudflare Workers) y `api.amatista-3d.tech` (Oracle Cloud + Caddy + FastAPI + Oracle). [Bitácora pública](docs/despliegue/2026-10-29_despliegue_publico_amatista_3d_tech.md). |
| **Aula y Recreación 3D por Código** | Flujo completo Alumno ↔ Profesor (`frontend/src/profesor/modelo.js`, `aulaLocal.js`, `GrupoPanel.jsx`, `VisorModelo.jsx`): el alumno se une a una clase (`AMA-7K2P`) y envía el código de su modelo (`bpy`, `<a-scene>` o JSON ~1 KB); la interfaz del profesor (`#/profesor`) compila el código y recrea la malla 3D interactiva en vivo. |
| **Corazón Amatista 1.0 y Motor 7.1** | Núcleo determinista en Python puro (`engine/amatista_engine/corazon/`, contrato `amatista.corazon/1`) con perfiles 100 % de software libre (`blender` y `aframe`), director, andamio por herramienta y señales comprobadas cada 0,5 s. Add-on **Amatista Motor 7.1** (`addon/amatista_blender/guion/`). [Corazón](docs/motor/referencia/23_corazon.md) · [Motor 7 Guion](docs/motor/referencia/22_motor_7.md). |
| **Amatista Taller y Fichas (Motor 5 a 6.2)** | 33 habilidades en 9 talleres (`practices/blender/habilidades.json`), 26 fichas de herramientas y 9 zonas de Blender (`practices/blender/fichas.json`), termómetro de ánimo, autosanación de copias instaladas, plantilla «Blender Amatista», enlace `amatista://` e instaladores `.exe` y `.deb`. [Motor 6.2](docs/motor/referencia/21_motor_6_2.md). |
| **Cursos publicados (15 módulos libres)** | **Blender** en tres niveles (**Principiante**, **Principiante-Intermedio** e **Intermedio**: 9 módulos, 9 talleres y 9 proyectos) y **A-Frame** en dos cursos (**Inicial** con 3 módulos e **Interactivo** con 3 módulos, incluido WebXR). [Ruta de Blender](docs/cursos/03_ruta_de_aprendizaje_blender.md) · [Camino y Motor Web](docs/plataforma/13_camino_graficos_y_motor_web.md). |
| **Estudio A-Frame y Motor Web** | Editor libre en `#/estudio` con vista 3D en vivo, 8 plantillas, piezas insertables, modelos GLB low poly offline y el Motor Web (`frontend/src/motor3d/`) para entornos generados y retos. [Multiplataforma](docs/plataforma/12_multiplataforma_y_accesible.md). |
| **Goliat, Avatares y Buzón** | **Goliat** (`frontend/src/goliat/`), compañero low poly en navegador que apoya cuando una práctica se complica con 0 ms de latencia; **avatares low poly** por cuenta y **Buzón del creador** (`#/buzon`, SQL `013`). [Goliat](docs/plataforma/15_goliat.md) · [Avatares y buzón](docs/plataforma/16_avatares_y_buzon.md). |
| **Escuelas con pocos datos y Brevo** | Sincronización en una sola petición comprimida con gzip (`POST /api/sincronizar`), cola Outbox transaccional en `IndexedDB`, modo «Ahorro de datos» y correos transaccionales personalizados con Brevo API v3 y SMTP relay. [Pocos datos](docs/plataforma/17_pocos_datos.md). |
| **Centro 3D, Geoda e IA Local** | Adaptación de hardware N0–N4 (`frontend/src/geoda/`), 64/64 `@keyframes` compuestos en GPU, servidor de IA local del aula (`ai_tutor:8090` con Ollama confinado sin Internet) y Circuit Breaker. [Reto 02](docs/hack4edu/RETO_02_APRENDER_SIN_CONEXION.md) · [Arquitectura](ARQUITECTURA.md). |

---

## 2. Hack4Edu 2026 · Reto 02: Aprender sin conexión

> **Desafío Oficial:** *«¿Cómo ofrecer una experiencia de aprendizaje digital de calidad cuando Internet es lento, caro o simplemente no existe?»*

Amatista resuelve el desafío mediante una arquitectura **Offline-First Radical** estructurada en cinco capas de resiliencia técnica:

1. **Grafo Mínimo y Caché Estática Universal (≤ 280 KB):** El grafo JavaScript inicial de la PWA se mantiene bajo el presupuesto estricto de **280 KB**, complementado por un índice completo de cursos de **5,5 KB gzip**. Toda la plataforma, lecciones y visor WebXR quedan precacheados tras la primera visita.
2. **Entregas de Aula por Código (~1 KB vs 20 MB):** Los alumnos entregan el código declarativo o script de su modelo 3D y el visor del profesor reconstruye la geometría en el navegador, reduciendo el consumo de red en un **99,9 %**.
3. **Cola Transaccional Outbox (`colaSincronizacion.js`):** El avance académico se persiste atómicamente en `IndexedDB`. Las escrituras consecutivas se compactan en el cliente y, al detectar red, se sincronizan en un único lote comprimido con gzip (`POST /api/sincronizar`).
4. **Perfilado y Adaptación de Hardware N0–N4 (`Geoda`):** Clasifica el dispositivo escolar sin enviar datos a la red. Adapta el DPR (1.0× a 2.0×), la resolución de texturas (512 px vs 1024 px PBR) y activa el modo ligero (`html.ligero`) para netbooks modestas de 2 GB de RAM.
5. **Inteligencia Artificial Local en Servidor de Aula (`ai_tutor:8090`):** Con `make up`, el servidor del aula levanta el microservicio RAG local sobre 26 fichas técnicas de Blender y el motor LLM Ollama (`qwen2.5-coder:3b`), aislado en la red interna `red_interna_ia` (`internal: true`, sin salida a Internet). Cuenta con Circuit Breaker y fallback en 0 ms a Goliat en navegador.

- 📄 **Dossier técnico completo:** **[docs/hack4edu/RETO_02_APRENDER_SIN_CONEXION.md](docs/hack4edu/RETO_02_APRENDER_SIN_CONEXION.md)**
- 🏛️ **Diagrama C4 y Decisiones ADR:** **[ARQUITECTURA.md](ARQUITECTURA.md)**
- 📹 **Requisitos y kit del vídeo:** **[docs/hack4edu/README.md](docs/hack4edu/README.md)**

---

## 3. Cómo llegamos hasta aquí

Amatista nació el **27 de septiembre de 2026** y en seis semanas evolucionó de un prototipo a una plataforma educativa multiplataforma con su propio motor 3D declarativo y tutor de IA local:

| Fecha | Etapa | Qué se logró | Tag / Hito |
|---|---|---|---|
| 27 sep | Prototipo | Monorepo, App Shell en React + Tailwind y visor A-Frame | `v0.1.0` |
| 27–28 sep | Integración | La PWA habla con FastAPI y Oracle Autonomous; ORA-01400 y CORS resueltos | `v1.0.0` |
| 28–29 sep | Plataforma educativa | Identidad low poly, «Elige tu curso», Módulo 1, lecciones, progreso offline | `v2.0.0` |
| 1–2 oct | Plataforma unificada | Cuentas y roles, Oracle para 20 GB, bloques interactivos, panel del alumno, Admin y CI | `v2.2.0-alpha.2` |
| 3–4 oct | Reestructuración y Amatista Engine | Niveles, habilidades, Amatista Engine (etapas 1 a 3), add-on 3.0 y plan de estudios | `v3.0.0-alpha.1` a `alpha.6` |
| 5–10 oct | Seguridad, enlace en vivo y ejemplo | Auditoría (1,449 ataques), reconocimiento de figura y silueta, enlace en vivo (SQL 010/011) | `v3.0.0-alpha.7` a `alpha.10` |
| 10–11 oct | Amatista Taller, Auditoría y Facetas | Motor 5 (aprendizaje por habilidades, SQL 012), auditoría de 270 commits, CSS «Facetas» | `alpha.11` a `alpha.15` |
| 21–29 oct | Multiplataforma, Motor Web y `.tech` | Estudio A-Frame (`#/estudio`), Motor Web 3D, 6 módulos de A-Frame y despliegue en `amatista-3d.tech` | PR #37 a #39 |
| 30–31 oct | Motores 6 a 7.1, Corazón y Goliat | Blender Amatista, fichas (`fichas.json`), Goliat, avatares y buzón (SQL 013), **Corazón Amatista 1.0** | PR #41 a #50 |
| 1–3 nov | Centro 3D y Geoda | Detección N0–N4, perfiles por hardware y corte oficial de Hack4Edu | Etiqueta `hack4edu` |
| 4–5 nov | Notificaciones, Aula por Código y Optimización GPU | Flujo Alumno/Profesor por código de modelo, 100 % software libre (`Blender` + `A-Frame`), 64/64 keyframes GPU e IA Local | `v3.6.0` |

---

## 4. Qué hace la plataforma

### Para cada persona

| Rol | Qué hace en Amatista |
|---|---|
| **Alumno** | Sigue el camino guiado de **Blender** (9 módulos) y **A-Frame** (6 módulos), se une a una clase con código (ej. `AMA-7K2P`), **envía el código de sus modelos 3D** desde `Mi panel · Clase` (`#/panel`), practica en el **Estudio A-Frame** (`#/estudio`), recibe apoyo de **Goliat** y consulta su avance sin conexión. |
| **Profesor** | Crea grupos y prácticas en `#/profesor`, recibe el código de los modelos enviados por sus alumnos, **recrea la escena 3D interactiva en vivo** desde el código capturado, inspecciona geometría/dimensiones y asigna calificaciones (`0–10`) con retroalimentación. |
| **Administrador** | Crea y publica módulos con la Fórmula Amatista, edita lecciones con más de 25 bloques interactivos y gráficos, responde el buzón del creador y audita contenido en `#/admin`. |

Detalle por pantalla: [mapa de la plataforma](docs/plataforma/01_mapa_de_la_plataforma.md).

---

## 5. Arquitectura y microservicios

El sistema opera tanto en la nube pública de producción como en servidores locales de centros educativos mediante contenedores Docker:

```text
             Alumno / Profesor / Admin (Navegador o Móvil)
                                │
                ┌───────────────▼───────────────┐
                │   PWA React 19 + IndexedDB   │
                │  Service Worker + Goliat 0 ms │
                └───────┬───────────────┬───────┘
     HTTP :8000 (Sincronizar gzip)      │ HTTP :8090 (RAG Local)
                        │               │
            ┌───────────▼────────┐ ┌────▼────────────────────────┐
            │   api:8000         │ │ ia-tutor:8090 (UID 10001)   │
            │   FastAPI + SQLite │ │ RAG Fichas en Memoria       │
            └───────────┬────────┘ └────┬────────────────────────┘
                        │               │ HTTP :11434 (red_interna_ia)
                        │          ┌────▼────────────────────────┐
                        │          │ ollama:11434 (LLM Local)    │
                        │          │ qwen2.5-coder:3b (Sin WAN)  │
                        │          └─────────────────────────────┘
                ┌───────▼───────┐
                │ Datos locales │
                │  /datos/*.db  │
                └───────────────┘
```

Consulta el diagrama C4 detallado, el aislamiento de redes y los registros de decisiones en **[ARQUITECTURA.md](ARQUITECTURA.md)**.

---

## 6. Estructura del repositorio

```text
amatista/
├── frontend/                  PWA React 19 + Vite 8 + Tailwind 4 (308 archivos en src/)
│   ├── src/pages/             Inicio, Curso, Leccion, Estudio, Panel, Profesor, Blender, Vincular, Guia, Buzon, cuenta/*, admin/*
│   ├── src/profesor/          Compilador de código a 3D (modelo.js), aulaLocal.js, VisorModelo.jsx y proyección 3D (dibujo.js)
│   ├── src/nucleo/            dispositivo.js (N0–N4), colaSincronizacion.js (Outbox), iaLocal.js (Circuit Breaker)
│   ├── src/components/        estructura/ (Facetas), leccion/, modulo/, panel/ (GrupoPanel + EditorCodigoModelo), admin/
│   ├── src/motor3d/           Motor Web de Amatista sobre A-Frame (escenas, física ligera, retos)
│   ├── src/estudio/           Estudio A-Frame (#/estudio): plantillas, piezas y modelos GLB offline
│   ├── src/goliat/            Goliat: asistente por reglas en el navegador y proyectos guiados (latencia 0 ms)
│   ├── src/avatares/          Avatares low poly por cuenta (zorro, búho, ajolote… y pavo real del creador)
│   ├── src/buzon/             Cliente del buzón del creador
│   ├── src/progreso/          Sincronización offline-first, compresión gzip y modo Ahorro de datos
│   └── src/data/modulos/      15 módulos publicados en JSON (9 de Blender + 6 de A-Frame) y archivo/
├── backend/                   API FastAPI + SQLAlchemy 2 (67 archivos)
│   ├── api/                   Routers activos: auth, sesiones, progreso, eventos, sincronizar, admin, contenido,
│   │                          niveles, blender, addon, enlace, taller, perfil, buzon, evaluacion (y nube como propuesta opcional)
│   ├── contenido/             Motor de validación, plantillas y cálculo de Amatista Taller en servidor
│   ├── database/              Conexión dual (Oracle ATP / SQLite) y 27 tablas en modelos.py
│   ├── sql/                   Scripts aditivos de Oracle 001–014 (orden en sql/LEEME.txt)
│   └── herramientas/          contenido.py, crear_admin.py, migrar.py, auditoria_seguridad.py, rendimiento.py
├── ai_tutor/                  Microservicio de IA Local RAG + LLM (Python 3.11-slim, UID 10001, read_only)
│   ├── motor_ia.py            RAG en memoria sobre practices/blender/fichas.json + cliente Ollama
│   ├── servicio.py            Endpoints FastAPI (:8090) para tutoría y diagnóstico geométrico
│   └── Dockerfile             Contenedor endurecido multi-etapa para ejecución en servidor de aula
├── engine/                    Amatista Engine en Python puro, sin bpy (96 archivos)
│   ├── amatista_engine/
│   │   ├── corazon/           Corazón Amatista 1.0 (amatista.corazon/1): director, andamio, señales y perfiles libres (blender, aframe)
│   │   ├── guion/             Motor 7 «Guion»: pasos con verbo, pistas reales y evaluación sin orden fijo
│   │   ├── taller/            Motor 5 «Amatista Taller»: habilidades BKT, molde, demostraciones y repaso Leitner
│   │   └── validators/        43 validadores declarativos (incluidos example.matches y taller.molde)
│   └── herramientas/          corazon.py, practicas.py, referencias.py, formato_json.py, run_in_blender.py
├── addon/                     Extensión Amatista Motor 7.1.0 para Blender 4.2+ (76 archivos)
│   ├── amatista_blender/      corazon/, guion/, taller/, interfaz/, plantilla_amatista/, modelo_ligero.py, fichas.py, protocolo.py
│   └── herramientas/          construir.py, instaladores.py (.exe y .deb)
├── practices/                 Contenido declarativo del motor
│   ├── blender/               9 prácticas de proyecto, cursos.json, habilidades.json, fichas.json, palabras.json
│   └── ramas/                 Ramas del Corazón (blender-principiante.json, blender-reto.json, aframe-web.json)
├── despliegue/                amatista-api.service, Caddyfile y actualizar.sh
├── docker-compose.yml         Orquestación local del stack completo (PWA, API, IA Tutor, Ollama)
├── Makefile                   Comandos estándar: make up, make down, make test, make audit, make health
├── ARQUITECTURA.md            Diagrama C4 de contenedores, aislamiento de redes y decisiones ADR
├── CONTRIBUTING.md            Guía de contribución, presupuestos web y flujo de desarrollo
├── SECURITY.md                Política de seguridad, divulgación y privacidad estudiantil
├── docs/                      Documentación técnica, auditorías y propuestas (incl. propuesta Amatista Cloud) → docs/README.md
└── CHANGELOG.md               Historial detallado de entregas
```

---

## 7. Base de datos

Oracle Autonomous Database 23ai en producción (esquema `ADMIN`); SQLite en desarrollo local, Docker y pruebas automáticas. Los scripts de `backend/sql/` son aditivos e idempotentes y se ejecutan en el orden de [`backend/sql/LEEME.txt`](backend/sql/LEEME.txt). Nunca se ejecuta `001` sobre una base con datos.

| Script | Qué agrega |
|---|---|
| `001` | Esquema inicial (solo instalación desde cero) |
| `002` | Autenticación, contenido y eventos particionados |
| `003` | Mantenimiento (purga diaria y vista `V_AMATISTA_ESPACIO`) |
| `004` | Usuario de aplicación `AMATISTA_APP` con permisos mínimos |
| `005` | Niveles, habilidades, rúbrica y versiones de Blender |
| `006` | Vistas y paquete PL/SQL `AMATISTA_AUTOR` |
| `007` | Motor de prácticas (`ADDON_VINCULOS`, `PRACTICAS`, `PRACTICA_VERSIONES`, `PROGRESO_PRACTICAS`: **18 tablas**) |
| `008` | Cursos por ruta (`CURSOS.RUTA` y `CURSOS.REQUISITO_ID`) |
| `009` | Archiva el curso `blender` de la v2 sin borrar progreso |
| `010` | Enlace en vivo con Blender (`ADDON_ENLACES` y `ADDON_AJUSTES`: **20 tablas**) |
| `011` | Detalle del instructor compartido entre procesos (`ADDON_ENLACES.DETALLE`) |
| `012` | Amatista Taller: modelo BKT por habilidad y `TALLERES_ALUMNO` (**21 tablas**) |
| `013` | Avatares y buzón del creador (`PERFILES`, `SUGERENCIAS`, `SUGERENCIA_MENSAJES`: **24 tablas**) |
| `014` | Grupos escolares, miembros, asignaciones y entregas con código/modelo (`GRUPOS`, `GRUPO_MIEMBROS`, `ASIGNACIONES`, `ENTREGAS`: **27 tablas**) |

---

## 8. Tecnologías

| Capa | Herramientas |
|---|---|
| PWA | React 19, Vite 8, Tailwind CSS 4, vite-plugin-pwa, IndexedDB, A-Frame 1.8, Vitest, ESLint |
| API | FastAPI, Uvicorn, SQLAlchemy 2, python-oracledb, compresión GZip bidireccional, pytest |
| IA Local | Microservicio FastAPI (`ia-tutor:8090`), RAG en memoria (`fichas.json`), Ollama (`qwen2.5-coder:3b`), red interna Docker |
| Datos | Oracle Autonomous Database 23ai (27 tablas), SQLite, PL/SQL (`AMATISTA_AUTOR`) |
| Blender | Blender 4.2+ (probado en 4.2 y 5.0), add-on **Amatista Motor 7.1.0**, **Corazón Amatista 1.0** y **Amatista Engine** |
| Servidor | Cloudflare Workers (PWA), VM en Oracle Cloud, Docker Compose, Caddy y Cloudflare SSL |
| Proceso | GitHub Actions (CI, instaladores y tablero), commits firmados con SSH |

---

## 9. Ejecutar en local

Requisitos: Node.js 22, npm, Python 3.12, Docker Compose y Git.

### Opción A: Stack completo en Docker (Recomendada)

```bash
git clone https://github.com/Maximiliano-cabello-mata/amatista.git
cd amatista

# Levantar todos los servicios (PWA :8080, API :8000, IA Tutor :8090, Ollama :11434)
make up

# Descargar modelo LLM en Ollama local
make ia-pull-model

# Comprobar salud de los servicios
make health
```

### Opción B: Ejecución nativa para desarrollo

```bash
# 1. Backend con SQLite (crea las tablas automáticamente)
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements-dev.txt
DATABASE_URL=sqlite:///./amatista_local.db AMATISTA_MOSTRAR_CODIGOS=1 uvicorn main:app --reload

# 2. Frontend en otra terminal
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

Comprobaciones completas:
```bash
make test
make audit
```

---

## 10. Herramientas del desarrollador

| Herramienta | Para qué |
|---|---|
| `backend/herramientas/contenido.py` | Validar, importar, exportar y crear módulos y lecciones; niveles; publicar prácticas |
| `backend/herramientas/crear_admin.py` | Dar el rol de administrador a una cuenta |
| `backend/diagnostico_oracle.py` | Comparar las tablas de Oracle con `modelos.py` |
| `engine/herramientas/corazon.py` | Inspeccionar ramas, perfiles y simular turnos del Corazón Amatista sin Blender |
| `engine/herramientas/practicas.py` | Crear, revisar y probar prácticas (58 casos resueltos) sin Blender |
| `backend/herramientas/auditoria_seguridad.py` | Auditar todas las rutas de la API contra inyección SQL, permisos y fuerza bruta |
| `herramientas/auditoria/estandares_web.py` | Verificar presupuestos de tamaño web (≤ 280 KB), 100 % keyframes en GPU, exclusividad de software libre y rugosidad de mallas |
| `addon/herramientas/construir.py` e `instaladores.py` | Construir `dist/amatista-7.1.0.zip` e instaladores `.exe` / `.deb` |
| `tablero/actualizar.py` | Regenerar `KANBAN.md` a partir de `tablero/tareas.yml` y el historial de Git |

---

## 11. Cómo se trabaja

- **Gobernanza y contribución:** Consulta **[CONTRIBUTING.md](CONTRIBUTING.md)** para conocer las normas de estilo, presupuestos web innegociables y estándares de código abierto.
- **Seguridad y privacidad:** Consulta **[SECURITY.md](SECURITY.md)** para la política de divulgación de vulnerabilidades y privacidad de menores.
- **Ramas:** `main` más una sola rama de trabajo a la vez; todo cambio entra mediante Pull Request revisado.
- **Commits:** `tipo(alcance): descripción` conforme a Conventional Commits.
- **Tareas:** Tablero gestionado en [`tablero/tareas.yml`](tablero/tareas.yml) y sincronizado en [KANBAN.md](KANBAN.md).

---

## 12. Versiones

Tags publicados en GitHub hasta `v3.0.0-alpha.10`; corte oficial de Hack4Edu en la etiqueta `hack4edu`. Detalle completo de cada entrega en [CHANGELOG.md](CHANGELOG.md).

---

## 13. Qué sigue

1. **Cerrar despliegue en producción y pruebas con ventana en Blender**: aplicar `007` a `014` en Oracle, actualizar el backend en la VM, reinstalar el add-on 7.1 y ejecutar las pruebas visuales pendientes (`T-113`, `T-143`, `T-178`, `T-182`).
2. **Seguridad y operación del servidor**: pasar al usuario `AMATISTA_APP` (`004`, `T-004`), cerrar el puerto 8000 directo en OCI (`T-130`), configurar SMTP (`T-032`) y activar Sentry (`T-185`).
3. **Centro 3D y experimento de estadía con G7B (`v3.5.0`)**: detección de nivel de equipo (`N0`–`N4`) en el add-on (`T-188`), telemetría agregada con consentimiento (`T-187`, `T-189`, `T-190`) y recomendaciones adaptadas en Mi panel (`T-192`).

---

## 14. Documentación

| Sección | Qué encuentras |
|---|---|
| [Auditoría y Optimización 2026-11-05](docs/auditoria/2026-11-05_auditoria_y_optimizacion_integral.md) | Informe completo de auditoría, enfoque 100 % software libre, flujo de aula por código y optimización 60 FPS en GPU |
| [Propuesta Amatista Cloud](docs/propuestas/2026-11-05_propuesta_amatista_cloud.md) | Documento de arquitectura de sesiones efímeras en contenedor (conservado como propuesta técnica, fuera de la versión final) |
| [Hack4Edu 2026](docs/hack4edu/README.md) | Reto 02, requisitos, antes y ahora, y [dossier técnico offline](docs/hack4edu/RETO_02_APRENDER_SIN_CONEXION.md) |
| [Arquitectura C4](ARQUITECTURA.md) | Diagrama de contenedores, microservicios, aislamiento de IA y registros ADR |
| [Contribución](CONTRIBUTING.md) | Guía para desarrolladores, comandos Makefile y presupuestos web auditados |
| [Seguridad](SECURITY.md) | Política de seguridad, hardening de Docker y privacidad de datos estudiantiles |
| [Historia](docs/historia/README.md) | Cronología exacta, ideas y cómo se implementaron, la plataforma en cada versión |
| [Plataforma](docs/plataforma/README.md) | Mapa por rol, herramientas de enseñanza, Estudio A-Frame, Motor Web, Goliat y pocos datos |
| [Amatista Engine](docs/motor/README.md) | Corazón Amatista 1.0, Motor 7 «Guion», Amatista Taller (Motor 5) y referencia del add-on |
| [Manual del código](docs/manual-del-codigo/README.md) | Mapa del repositorio, frontend, backend, motor y add-on explicados con recetas |
| [Manual del desarrollador](docs/desarrollador/README.md) | Entorno, herramientas CLI, pruebas, CI y flujo de trabajo |
| [Base de datos](docs/base-de-datos/README.md) | Esquema SQL completo (27 tablas), diagrama entidad-relación y migración |
| [Despliegue público .tech](docs/despliegue/2026-10-29_despliegue_publico_amatista_3d_tech.md) | Cloudflare Workers, OCI, Caddy, Oracle, Motor 6/7 y Sentry |

---

## 15. Licencia

El código fuente de la plataforma se publica con fines educativos y de impacto social abierto. El add-on de Blender (`addon/`) se distribuye bajo licencia **GPL-3.0-or-later** en cumplimiento con los términos de enlace de la API `bpy` de la Blender Foundation. Todos los modelos 3D y texturas de la biblioteca cuentan con licencia de dominio público **Creative Commons Zero (CC0)**.
