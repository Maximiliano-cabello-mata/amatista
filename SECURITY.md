# Política de Seguridad y Privacidad de Amatista 🛡️

La seguridad del sistema y la privacidad absoluta de los estudiantes y docentes son principios fundacionales del proyecto **Amatista**. Este documento define las políticas de divulgación responsable de vulnerabilidades, las garantías de privacidad de datos infantiles y escolares, y las medidas de blindaje (*hardening*) implementadas en nuestra infraestructura.

---

## 1. Notificación Responsable de Vulnerabilidades

Si descubres una posible vulnerabilidad de seguridad o un fallo en el aislamiento de datos en Amatista, te agradecemos que lo comuniques de forma responsable:

- **Contacto confidencial:** Envía un correo electrónico a `seguridad@amatista-3d.tech` o contacta directamente con el mantenedor principal del repositorio.
- **Plazo de respuesta inicial:** Nos comprometemos a acusar recibo y evaluar el informe en un plazo máximo de **48 horas**.
- **Coordinación:** Te solicitamos no publicar detalles de la vulnerabilidad hasta que se haya publicado un parche correctivo o mitigación oficial.

---

## 2. Privacidad del Alumno y Soberanía de Datos

Dado que Amatista está orientada a contextos educativos y formación técnica de jóvenes, el sistema implementa principios de **Privacidad por Diseño y por Defecto**:

1. **Cero Telemetría de Datos Personales Identificables (PII):**
   - El sistema no recopila nombres reales, ubicaciones geográficas precisas, direcciones IP persistentes ni huellas dactilares biométricas.
   - La integración con Sentry (`backend/observabilidad.py`) cuenta con filtros de sanitización activos que eliminan contraseñas, correos electrónicos y contenidos de lecciones antes de emitir cualquier traza de error.
2. **Soberanía y Almacenamiento Local Primero:**
   - Todo el avance académico, calificaciones BKT e insignias se almacenan de manera predeterminada en el navegador del usuario (`IndexedDB`).
   - El estudiante puede utilizar la plataforma de forma 100 % anónima sin necesidad de crear una cuenta en el servidor. Al registrarse, la asociación se limita a un identificador seudónimo y un correo verificado.
3. **Ausencia de Rastreadores Comerciales:**
   - La plataforma no contiene SDKs publicitarios, píxeles de seguimiento de redes sociales ni librerías de analítica comercial de terceros.
   - Todos los recursos (tipografías, modelos 3D, texturas e iconos) se sirven desde el propio origen del dominio o desde el caché local del Service Worker.

---

## 3. Blindaje de Contenedores y Microservicios (Docker Hardening)

La orquestación de producción y de servidores locales de aula (`docker-compose.yml`) aplica las mejores prácticas de la industria en seguridad de contenedores:

### 3.1. Usuarios sin Privilegios (No-Root)
- Ningún contenedor de la aplicación se ejecuta con permisos de superusuario (`root`).
- Los servicios de backend y tutoría de IA (`ia-tutor`) corren bajo el usuario dedicado `amatista:amatista` con **UID/GID `10001`**:
  ```dockerfile
  RUN groupadd -g 10001 amatista && useradd -u 10001 -g amatista -m -s /usr/sbin/nologin amatista
  USER amatista:amatista
  ```

### 3.2. Sistema de Ficheros de Solo Lectura
- El microservicio de inferencia `ia-tutor:8090` se ejecuta con la bandera `read_only: true`. El contenedor no puede alterar sus binarios ni su código fuente en tiempo de ejecución, previniendo la inyección de cargas maliciosas.

### 3.3. Prevención de Escalada de Privilegios
- Todos los servicios definen:
  ```yaml
  security_opt:
    - "no-new-privileges:true"
  ```
  Esto impide que procesos hijos adquieran privilegios elevados a través de binarios `setuid` o `setgid`.

### 3.4. Aislamiento Estricto del Motor LLM (`red_interna_ia`)
- El motor Ollama (`ollama:11434`) está confinado en la red `red_interna_ia` con la propiedad `internal: true`.
- Esta red **carece de pasarela por defecto hacia Internet** (egress bloqueado). Es físicamente imposible que una consulta pedagógica o un fragmento de código procesado por el modelo local sea transmitido hacia servidores externos.

---

## 4. Matriz de Autorización y Criptografía

1. **Gestión de Credenciales:**
   - Las contraseñas de las cuentas de usuario se almacenan con algoritmos de derivación de claves robustos (PBKDF2 con HMAC-SHA256 y sal aleatoria única por usuario).
2. **Matriz de Permisos Auditada:**
   - Cada ruta de la API está categorizada y protegida por un sistema de control de acceso basado en roles (RBAC: `alumno`, `profesor`, `admin`).
   - La matriz de rutas públicas se audita de forma continua en la suite de seguridad automatizada (`tests/test_seguridad.py`). Cualquier endpoint nuevo que no esté explícitamente listado como público o protegido por rol provoca un fallo inmediato en la integración continua.
3. **Limitación de Tasa (Rate Limiting):**
   - Los endpoints críticos de autenticación (`/api/auth/registro`, `/api/auth/iniciar-sesion`, `/api/auth/recuperar`) cuentan con limitadores de frecuencia por IP para neutralizar ataques de fuerza bruta y denegación de servicio.
