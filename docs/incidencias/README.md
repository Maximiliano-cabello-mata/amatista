# Registro de incidencias

Cada falla diagnosticada tiene su documento fechado en esta carpeta (`AAAA-MM-DD_tema.txt`).
Esta tabla es el índice: al registrar una incidencia nueva, agrégala con el siguiente número
y actualiza su estado cuando cambie.

| # | Fecha | Incidencia | Causa en una línea | Estado | Documento |
|---|---|---|---|---|---|
| INC-001 | 2026-09-27 | ORA-01400 al registrar usuarios | Llaves primarias sin `Identity` | ✅ Resuelta (v1.0.0) | [ora-01400](2026-09-27_ora-01400-autoincremento.txt) |
| INC-002 | 2026-09-27 | Errno 98 (puerto 8000 ocupado) y bloqueo de CORS | Proceso uvicorn duplicado y orígenes sin permitir | ✅ Resuelta (v1.0.0) | [puerto y CORS](2026-09-27_puerto-ocupado-y-cors.txt) |
| INC-003 | 2026-09-29 | Integración FastAPI ↔ Oracle (ORA-00942, ORA-01722, ORA-02267) | Tipos incompatibles y tabla inexistente | ✅ Resuelta (esquema 001) | [reporte](2026-09-29_reporte-integracion-fastapi-oracle.txt) |
| INC-004 | 2026-09-29 | Oracle no guardaba sesiones ni progreso | `SESIONES_WEB` no existía; correos en columnas NUMBER | ✅ Resuelta (esquema 001 y diagnóstico) | [diagnóstico](2026-09-29_diagnostico-oracle-progreso.txt) |
| INC-005 | 2026-10-02 | ORA-12899 al iniciar sesión | La 002 no ampliaba `SESIONES.ID` a 64 | 🟠 Corregida en PR #9, falta fusionar y ejecutar la 002 | [2 de octubre](2026-10-02_oracle-sesiones-id-json-y-enlaces.txt) |
| INC-006 | 2026-10-02 | 500 al abrir una lección desde Oracle | python-oracledb entrega `IS JSON` como dict | 🟠 Corregida en PR #9, falta fusionar | [2 de octubre](2026-10-02_oracle-sesiones-id-json-y-enlaces.txt) |
| INC-007 | 2026-10-02 | Documentos enlazados que no existían (la Fórmula y la guía de despliegue OCI) | Se enlazaron antes de escribirlos | 🟠 La Fórmula, resuelta; la guía OCI, pendiente (T-031) | [2 de octubre](2026-10-02_oracle-sesiones-id-json-y-enlaces.txt) |
| INC-008 | 2026-10-02 | No se puede probar contra el Oracle real fuera de la VM | ACL de OCI (esperado) | 🔵 Mitigada con contenedor Oracle | [2 de octubre](2026-10-02_oracle-sesiones-id-json-y-enlaces.txt) |
| INC-009 | 2026-10-02 | El tag de cierre no se pudo publicar desde la nube | Sin permiso de escritura de tags; firma SSH personal | 🟠 Pendiente: crearlo con `crear-tags.sh` | [2 de octubre](2026-10-02_oracle-sesiones-id-json-y-enlaces.txt) |

Estados: ✅ resuelta · 🟠 corregida o con acción pendiente · 🔵 mitigada · 🔴 abierta sin solución.
