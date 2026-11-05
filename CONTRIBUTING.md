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

# 2. Pruebas de la API FastAPI, IA Tutor y Seguridad (Pytest)
cd backend
python -m pytest -q
python herramientas/contenido.py validar
cd ..
python -m pytest -q ai_tutor

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

## 6. Flujo de Trabajo con Ramas, Colaboradores y Forks

Amatista admite dos modalidades de contribución:

### 6.1. Colaboradores Invitados (Subida Directa de Ramas)

Si formas parte del equipo o has sido invitado como colaborador con permisos de escritura (como Diana Paola):

1. **Aceptar la invitación de GitHub:**
   - Abre `https://github.com/Maximiliano-cabello-mata/amatista/invitations` y pulsa **Aceptar**.
2. **Crear una rama temática propia:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/nombre-de-tu-mejora
   ```
3. **Subir tu rama directamente a GitHub:**
   ```bash
   git push -u origin feature/nombre-de-tu-mejora
   ```
4. **Abrir un Pull Request:**
   - En GitHub aparecerá el aviso «Compare & pull request». Ábrelo indicando los cambios realizados y enlazando las tareas del tablero Kanban (`T-xxx`).

### 6.2. Contribuidores Comunitarios (Flujo mediante Fork)

Si has realizado un *fork* del repositorio (p. ej. `https://github.com/<tu-usuario>/amatista`):

1. **Mantener tu fork al día con el repositorio central (`upstream`):**
   ```bash
   # Configurar el repositorio central una sola vez:
   git remote add upstream https://github.com/Maximiliano-cabello-mata/amatista.git

   # Traer los últimos cambios:
   git fetch upstream
   git checkout main
   git merge upstream/main
   git push origin main
   ```
2. **Crear tu rama de trabajo en tu fork:**
   ```bash
   git checkout -b fix/mi-aporte
   ```
3. **Subir la rama a tu fork personal:**
   ```bash
   git push -u origin fix/mi-aporte
   ```
4. **Abrir el Pull Request:**
   - Ve a `https://github.com/Maximiliano-cabello-mata/amatista/pulls` y haz clic en **New pull request**.
   - Haz clic en **compare across forks**, selecciona tu fork y tu rama, y envía el Pull Request.
   - La suite automatizada de CI ejecutará las pruebas en tu PR para certificar que cumple con todos los estándares y presupuestos web.
