-- =============================================================================
-- AMATISTA · 002 · CUENTAS, SESIONES SEGURAS Y CONTENIDO (Oracle Autonomous Database)
--
-- Amplía el esquema de 001 SIN BORRAR DATOS: solo agrega columnas, amplía
-- SESIONES.ID y crea las tablas nuevas. Se puede ejecutar varias veces: lo
-- que ya existe se salta.
--
-- Cómo ejecutarlo:
--   1. Entra a Database Actions > SQL como ADMIN (o el dueño del esquema).
--   2. Pega este archivo completo.
--   3. Pulsa "Ejecutar script" (F5), NO "Ejecutar sentencia" (Ctrl+Enter).
--   4. Verifica en el servidor: python diagnostico_oracle.py
--
-- Requiere que antes se haya ejecutado 001_esquema_amatista.sql.
-- =============================================================================

DECLARE
  -- Ejecuta una sentencia y se salta solo los errores de "ya existe".
  PROCEDURE ejecutar(sentencia IN VARCHAR2) IS
  BEGIN
    EXECUTE IMMEDIATE sentencia;
  EXCEPTION
    WHEN OTHERS THEN
      -- ORA-00955 nombre ya usado · ORA-01430 columna ya existe
      -- ORA-02260/02261 llave primaria o única ya existe · ORA-02264 nombre de restricción ya usado
      -- ORA-02275 llave foránea ya existe · ORA-01408 índice ya existe sobre esas columnas
      -- ORA-01442 la columna ya es NOT NULL
      IF SQLCODE IN (-955, -1430, -2260, -2261, -2264, -2275, -1408, -1442) THEN
        NULL;
      ELSE
        RAISE;
      END IF;
  END;
BEGIN
  -- 1. USUARIOS: correo, contraseña, rol y códigos de verificación.
  ejecutar('ALTER TABLE usuarios ADD (email VARCHAR2(100))');
  ejecutar('ALTER TABLE usuarios ADD (telefono VARCHAR2(25))');
  ejecutar('ALTER TABLE usuarios ADD (rol VARCHAR2(20) DEFAULT ''alumno'' NOT NULL)');
  ejecutar('ALTER TABLE usuarios ADD (password_hash VARCHAR2(255))');
  ejecutar('ALTER TABLE usuarios ADD (correo_confirmado NUMBER(1) DEFAULT 0 NOT NULL)');
  ejecutar('ALTER TABLE usuarios ADD (codigo_verificacion VARCHAR2(64))');
  ejecutar('ALTER TABLE usuarios ADD (codigo_proposito VARCHAR2(12))');
  ejecutar('ALTER TABLE usuarios ADD (codigo_expira TIMESTAMP)');
  ejecutar('ALTER TABLE usuarios ADD (codigo_intentos NUMBER(3) DEFAULT 0 NOT NULL)');
  ejecutar('ALTER TABLE usuarios ADD (intentos_fallidos NUMBER(3) DEFAULT 0 NOT NULL)');
  ejecutar('ALTER TABLE usuarios ADD (bloqueado_hasta TIMESTAMP)');
  ejecutar('ALTER TABLE usuarios ADD (es_prueba NUMBER(1) DEFAULT 0 NOT NULL)');
  ejecutar('ALTER TABLE usuarios ADD (fusionado_en VARCHAR2(100))');
  ejecutar('ALTER TABLE usuarios ADD (ultimo_acceso TIMESTAMP)');
  -- UNIQUE ya crea su índice y admite varios NULL (alumnos anónimos).
  ejecutar('ALTER TABLE usuarios ADD CONSTRAINT uq_usuarios_email UNIQUE (email)');
  ejecutar('ALTER TABLE usuarios ADD CONSTRAINT ck_usuarios_rol CHECK (rol IN (''alumno'', ''profesor'', ''admin''))');
  ejecutar('ALTER TABLE usuarios ADD CONSTRAINT ck_usuarios_confirmado CHECK (correo_confirmado IN (0, 1))');
  ejecutar('ALTER TABLE usuarios ADD CONSTRAINT ck_usuarios_prueba CHECK (es_prueba IN (0, 1))');
  ejecutar('ALTER TABLE usuarios ADD CONSTRAINT ck_usuarios_email_min CHECK (email = LOWER(email))');

  -- 2. SESIONES: el id ahora guarda el SHA-256 del token (64 caracteres hex).
  --    Ampliar un VARCHAR2 no toca los datos existentes.
  ejecutar('ALTER TABLE sesiones MODIFY (id VARCHAR2(64))');
  ejecutar('ALTER TABLE sesiones ADD (creado_en TIMESTAMP DEFAULT SYSTIMESTAMP)');
  ejecutar('ALTER TABLE sesiones ADD (expira_en TIMESTAMP)');

  -- 3. PROGRESO_LECCIONES: metadatos ligeros y fecha en que se completó.
  ejecutar('ALTER TABLE progreso_lecciones ADD (datos_ligeros VARCHAR2(250 CHAR))');
  ejecutar('ALTER TABLE progreso_lecciones ADD (completada_en TIMESTAMP)');

  -- 4. LOGROS: insignias ganadas.
  ejecutar('CREATE TABLE logros (
    usuario_id   VARCHAR2(100) NOT NULL,
    insignia_id  VARCHAR2(100) NOT NULL,
    obtenido_en  TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT pk_logros PRIMARY KEY (usuario_id, insignia_id),
    CONSTRAINT fk_logros_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
  )');

  -- 5. EVENTOS_APRENDIZAJE: particionada por mes para purgar meses completos.
  ejecutar('CREATE TABLE eventos_aprendizaje (
    id                  VARCHAR2(36)  NOT NULL,
    usuario_id          VARCHAR2(100) NOT NULL,
    tipo                VARCHAR2(30)  NOT NULL,
    curso_id            VARCHAR2(50),
    leccion_id          VARCHAR2(50),
    sesion_aprendizaje  VARCHAR2(36),
    ocurrido_en         TIMESTAMP NOT NULL,
    recibido_en         TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    version_app         VARCHAR2(20),
    es_prueba           NUMBER(1) DEFAULT 0 NOT NULL,
    datos               VARCHAR2(250 CHAR),
    CONSTRAINT pk_eventos_aprendizaje PRIMARY KEY (id),
    CONSTRAINT fk_eventos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
    CONSTRAINT ck_eventos_prueba CHECK (es_prueba IN (0, 1))
  )
  PARTITION BY RANGE (ocurrido_en) INTERVAL (NUMTOYMINTERVAL(1, ''MONTH''))
  (PARTITION p_inicio VALUES LESS THAN (TIMESTAMP ''2026-10-01 00:00:00''))');
  ejecutar('CREATE INDEX ix_eventos_usuario_fecha ON eventos_aprendizaje (usuario_id, ocurrido_en) LOCAL');
  ejecutar('CREATE INDEX ix_eventos_fecha ON eventos_aprendizaje (ocurrido_en) LOCAL');

  -- 6. Contenido que administra el panel.
  ejecutar('CREATE TABLE cursos (
    id              VARCHAR2(50)  NOT NULL,
    numero          VARCHAR2(5),
    titulo          VARCHAR2(100 CHAR) NOT NULL,
    subtitulo       VARCHAR2(150 CHAR),
    descripcion     VARCHAR2(1000 CHAR),
    nivel           VARCHAR2(30 CHAR),
    acento          VARCHAR2(20),
    recurso_texto   VARCHAR2(100 CHAR),
    recurso_url     VARCHAR2(300),
    orden           NUMBER(5) DEFAULT 0 NOT NULL,
    estado          VARCHAR2(12) DEFAULT ''publicado'' NOT NULL,
    actualizado_en  TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT pk_cursos PRIMARY KEY (id),
    CONSTRAINT ck_cursos_estado CHECK (estado IN (''borrador'', ''publicado'', ''archivado''))
  )');

  ejecutar('CREATE TABLE modulos (
    id              VARCHAR2(50)  NOT NULL,
    curso_id        VARCHAR2(50)  NOT NULL,
    numero          NUMBER(5)     NOT NULL,
    titulo          VARCHAR2(200 CHAR) NOT NULL,
    descripcion     VARCHAR2(1000 CHAR),
    insignia        VARCHAR2(80 CHAR),
    minutos         NUMBER(5),
    estado          VARCHAR2(12) DEFAULT ''borrador'' NOT NULL,
    version         NUMBER(5) DEFAULT 1 NOT NULL,
    actualizado_en  TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    publicado_en    TIMESTAMP,
    CONSTRAINT pk_modulos PRIMARY KEY (id),
    CONSTRAINT fk_modulos_curso FOREIGN KEY (curso_id) REFERENCES cursos (id),
    CONSTRAINT ck_modulos_estado CHECK (estado IN (''borrador'', ''publicado'', ''archivado''))
  )');
  ejecutar('CREATE INDEX ix_modulos_curso ON modulos (curso_id, numero)');

  ejecutar('CREATE TABLE lecciones (
    curso_id           VARCHAR2(50)  NOT NULL,
    id                 VARCHAR2(50)  NOT NULL,
    modulo_id          VARCHAR2(50)  NOT NULL,
    orden              NUMBER(5)     NOT NULL,
    titulo             VARCHAR2(200 CHAR) NOT NULL,
    tipo               VARCHAR2(30)  NOT NULL,
    duracion_segundos  NUMBER(6),
    bloqueada          NUMBER(1) DEFAULT 1 NOT NULL,
    contenido          CLOB NOT NULL,
    reemplaza          VARCHAR2(250),
    estado             VARCHAR2(12) DEFAULT ''borrador'' NOT NULL,
    version            NUMBER(5) DEFAULT 1 NOT NULL,
    actualizado_en     TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    publicado_en       TIMESTAMP,
    CONSTRAINT pk_lecciones PRIMARY KEY (curso_id, id),
    CONSTRAINT fk_lecciones_curso FOREIGN KEY (curso_id) REFERENCES cursos (id),
    CONSTRAINT fk_lecciones_modulo FOREIGN KEY (modulo_id) REFERENCES modulos (id),
    CONSTRAINT ck_lecciones_json CHECK (contenido IS JSON),
    CONSTRAINT ck_lecciones_bloqueada CHECK (bloqueada IN (0, 1)),
    CONSTRAINT ck_lecciones_estado CHECK (estado IN (''borrador'', ''publicado'', ''archivado''))
  )');
  ejecutar('CREATE INDEX ix_lecciones_modulo ON lecciones (modulo_id, orden)');
END;
/

-- 7. Verificar: deben aparecer las 8 tablas.
SELECT table_name, COUNT(*) AS columnas
  FROM user_tab_columns
 WHERE table_name IN ('USUARIOS', 'SESIONES', 'PROGRESO_LECCIONES', 'LOGROS',
                      'EVENTOS_APRENDIZAJE', 'CURSOS', 'MODULOS', 'LECCIONES')
 GROUP BY table_name
 ORDER BY table_name;
