# Guía de Contribución a Amatista 💎

¡Te damos la bienvenida al proyecto Amatista! Agradecemos tu interés en colaborar para hacer el aprendizaje de la computación 3D y la WebXR accesible, inclusivo y resiliente ante la desconexión.

Este documento establece las directrices de ingeniería, convenciones de código y estándares de calidad requeridos para cualquier contribución al repositorio.

---

## 1. Requisitos del Entorno

Para colaborar en Amatista necesitas contar con las siguientes herramientas en tu equipo:

- **Node.js**: Versión 22 LTS (gestión mediante `.node-version`).
- **Python**: Versión 3.12 (con soporte para `venv` o `pipenv`).
- **Docker & Docker Compose**: Versión v2.20+ (para la orquestación de servicios locales y tutor de IA).
- **Git**: Con soporte para firma de commits (recomendado SSH o GPG).

---

## 2. Comandos de Operación con Makefile

El repositorio incluye un `Makefile` en la raíz para simplificar el flujo de desarrollo:

```bash
# Levantar el entorno completo de producción local en Docker
make up

# Detener todos los contenedores y redes
make down

# Comprobar la salud del motor de IA y microservicios
make health

# Descargar el modelo de lenguaje local dentro del contenedor Ollama
make ia-pull-model

# Ejecutar auditoría estricta de presupuestos web y validación de lecciones
make audit

# Ejecutar todas las pruebas del proyecto (Frontend, Backend, Motor y Add-on)
make test
```

---

## 3. Presupuestos y Estándares Web Innegociables

Amatista está diseñada para funcionar en entornos de conectividad limitada (2G / 3G) y ordenadores escolares modestos (perfil `N0`–`N1`). Para evitar la degradación del rendimiento, los siguientes presupuestos son auditados de forma estricta en la integración continua (CI):

| Métrica | Presupuesto máximo | Estado actual |
|---|---|---|
| **Grafo JavaScript/JSON inicial** | **≤ 280 KB** | **252,6 KB** (54 módulos) |
| **Índice de módulos comprimido** | **≤ 6,0 KB gzip** | **5,5 KB gzip** |
| **Ilustraciones SVG optimizadas** | **≤ 120 KB** | **107,9 KB** |
| **Rugosidad geométrica de mallas** | **90/90** | **90/90** |

Para verificar los presupuestos antes de enviar un cambio:
```bash
python herramientas/auditoria/estandares_web.py
```

---

## 4. Batería de Pruebas Automatizadas

Antes de abrir una solicitud de incorporación (Pull Request), verifica que todas las suites de pruebas pasen en verde:

```bash
# 1. Pruebas unitarias de la PWA (Vitest - 54 suites, 418 pruebas)
cd frontend
npm test
npm run lint
npm run build
cd ..

# 2. Pruebas de la API FastAPI y Seguridad (Pytest)
cd backend
python -m pytest -q
python herramientas/contenido.py validar
cd ..

# 3. Pruebas del Motor Determinista y Add-on de Blender
python -m pytest -q tablero engine/tests addon/tests
```

---

## 5. Convenciones de Código y Estilo

### 5.1. Norma Lingüística
Toda la documentación técnica y los textos de cara al usuario en la interfaz deben redactarse en **Español de España (`es-ES`)**, respetando las equivalencias acordadas:
- Utilizar **«ordenador»** o **«equipo»** (evitar *«computadora»* o *«PC»*).
- Utilizar **«móvil»** o **«dispositivo móvil»** (evitar *«celular»*).
- Utilizar **«vídeo»** (con tilde) en lugar de *«video»*.
- En mensajes del asistente Goliat, preferir fórmulas como **«Me he atascado»** o **«compañero»**.

### 5.2. Convención de Commits
Seguimos el estándar de **Conventional Commits**:
```text
tipo(alcance): descripción breve en minúsculas

[cuerpo opcional detallando el porqué del cambio]

[referencias a tareas, ej: T-188 o cierra T-192]
```

Tipos comunes:
- `feat`: Nueva característica para el usuario o la plataforma.
- `fix`: Corrección de un fallo o error en tests/producción.
- `docs`: Modificaciones exclusivas en documentación.
- `refactor`: Cambio de código que no altera la funcionalidad ni añade pruebas.
- `perf`: Optimización orientada al rendimiento o reducción de peso.
- `test`: Añadir o corregir pruebas existentes.
- `chore`: Tareas auxiliares de mantenimiento o actualización del tablero Kanban.

---

## 6. Flujo de Trabajo con Ramas y Pull Requests

1. Crea una rama descriptiva a partir de `main` (ejemplo: `feat/ia-tutor-diagnostico` o `fix/sw-cache-texturas`).
2. Implementa tus cambios manteniendo el principio de responsabilidad única.
3. Asegura que las pruebas nuevas acompañen al código desarrollado.
4. Ejecuta `make audit` y `make test`.
5. Abre el Pull Request en GitHub detallando el problema resuelto y la evidencia de pruebas. Todo PR debe ser revisado y aprobado antes de fusionarse a `main`.
