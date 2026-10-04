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
| INC-005 | 2026-10-02 | ORA-12899 al iniciar sesión | La 002 no ampliaba `SESIONES.ID` a 64 | ✅ Resuelta: 002 corregida ejecutada en producción el 2/10 (INC-010) | [2 de octubre](2026-10-02_oracle-sesiones-id-json-y-enlaces.txt) |
| INC-006 | 2026-10-02 | 500 al abrir una lección desde Oracle | python-oracledb entrega `IS JSON` como dict | ✅ Resuelta (PR #11, en `main`) | [2 de octubre](2026-10-02_oracle-sesiones-id-json-y-enlaces.txt) |
| INC-007 | 2026-10-02 | Documentos enlazados que no existían (la Fórmula y la guía de despliegue OCI) | Se enlazaron antes de escribirlos | 🟠 La Fórmula, resuelta; la guía OCI, pendiente (T-031) | [2 de octubre](2026-10-02_oracle-sesiones-id-json-y-enlaces.txt) |
| INC-008 | 2026-10-02 | No se puede probar contra el Oracle real fuera de la VM | ACL de OCI (esperado) | 🔵 Mitigada con contenedor Oracle | [2 de octubre](2026-10-02_oracle-sesiones-id-json-y-enlaces.txt) |
| INC-009 | 2026-10-02 | El tag de cierre no se pudo publicar desde la nube | Sin permiso de escritura de tags; firma SSH personal | 🟠 Pendiente desde la computadora del usuario: `v2.2.0-alpha.2`, `v3.0.0-alpha.1` y `v3.0.0-alpha.2` ya están en `crear-tags.sh` (`bash herramientas/crear-tags.sh && git push origin --tags`) | [2 de octubre](2026-10-02_oracle-sesiones-id-json-y-enlaces.txt) |
| INC-010 | 2026-10-02 | Despliegue de la v2.2 en la VM: `.env` con `<` `>`, remoto antiguo, `curl` vacío tras reiniciar, segmentos `BIN$` | Remoto apuntaba al repositorio viejo; Uvicorn tarda en arrancar; papelera de Oracle | ✅ Resuelta (8 tablas OK, catálogo importado) | [despliegue v2.2](2026-10-02_despliegue-sql-v2.2-en-produccion.txt) |
| INC-011 | 2026-10-03 | Al probar 005/006 en Oracle real: ORA-01429, ORA-00923 y ORA-40573 | IOT con filas largas, `OFFLINE` reservada, objetos JSON de PL/SQL dentro de SQL | ✅ Corregida antes de entregar | [manual Oracle v3, sección 8](../reestructuracion/02_manual_oracle.md#8-problemas-encontrados-en-las-pruebas-ya-corregidos-en-los-scripts) |
| INC-012 | 2026-10-03 | La documentación hablaba del servicio `amatista-api` y la VM corre `amatista-backend` | La VM conservó la unidad instalada antes de `despliegue/amatista-api.service` | 🔵 Mitigada: `despliegue/actualizar.sh` detecta la unidad (o `AMATISTA_SERVICIO`); unificar el nombre queda con T-003 | [bitácora técnica, §20 y §23.1](../bitacora/2026-10-03_bitacora_tecnica_v3_servidor.md) |

Estados: ✅ resuelta · 🟠 corregida o con acción pendiente · 🔵 mitigada · 🔴 abierta sin solución.
