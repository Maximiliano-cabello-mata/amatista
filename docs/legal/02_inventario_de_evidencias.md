# 02 · Inventario de evidencias

Este índice apunta solo a **fuentes públicas existentes**. Las copias certificadas, capturas, archivos originales y datos de identificación se guardan en el expediente **privado**.

| ID | Tipo de evidencia | Fuente pública / referencia | Qué puede respaldar | Estado |
| --- | --- | --- | --- | --- |
| EV-001 | Historial Git | [Commits](https://github.com/Maximiliano-cabello-mata/amatista/commits/main) | Orden temporal de cambios rastreados por Git | Referencia disponible; falta preservación independiente |
| EV-002 | Commit de corte técnico | [`ac13276113c8a240c81ad7eb6e18d083d3cf6b8f`](https://github.com/Maximiliano-cabello-mata/amatista/commit/ac13276113c8a240c81ad7eb6e18d083d3cf6b8f) | Identificación exacta de un estado del repositorio | Referencia disponible |
| EV-003 | Historia del desarrollo | [docs/historia](../historia/README.md) | Secuencia declarada de etapas y funciones | Documental; contrastar con commits |
| EV-004 | Registro de cambios | [CHANGELOG.md](../../CHANGELOG.md) | Funcionalidades y versiones declaradas | Documental; no sustituye Git |
| EV-005 | Bitácoras de trabajo | [docs/bitacora](../bitacora/) | Decisiones de implementación y pruebas declaradas | Documental |
| EV-006 | PR y revisiones | [Pull requests](https://github.com/Maximiliano-cabello-mata/amatista/pulls?q=is%3Apr) | Revisión y fusión de cambios | Referencia disponible |
| EV-007 | Código fuente y arquitectura | [Repositorio](../../README.md) | Expresión técnica de los componentes | Disponible públicamente, con dependencias de terceros |
| EV-008 | Licencia del add-on | [Manifiesto](../../addon/amatista_blender/blender_manifest.toml) | Declaración GPL-3.0-or-later y metadatos del add-on | Revisada al abrir expediente |
| EV-009 | Diseño de interfaz | [Facetas](../diseno/2026-10-11_sistema_facetas.md) | Documentación de decisiones visuales | Documental |
| EV-010 | Evidencia de producción / pruebas | [Despliegue](../despliegue/2026-10-29_despliegue_publico_amatista_3d_tech.md) | Operación documentada; requiere respaldos originales | Documento público disponible |
| EV-011 | Paquete inmutable de fuentes y SHA-256 | Archivo cifrado externo con manifiesto privado | Integridad de una copia específica | **Pendiente de generar y resguardar** |
| EV-012 | Evidencia personal de autoría, titularidad y contratos | Expediente privado | Identidad y alcance de derechos | **Pendiente de recopilar** |
| EV-013 | Comprobante de registro de software | Expediente privado / autoridad | Inscripción cuando exista | **No acreditado** |
| EV-014 | Solicitud y resolución de marca | Expediente privado / autoridad | Trámite y resultado cuando exista | **No acreditado** |

## Registro para futuras evidencias

| ID | Fecha UTC | Tipo | Commit SHA / nombre de archivo | Huella SHA-256 | Custodio | Ruta privada y respaldo | Observaciones |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EV-015 | PENDIENTE | PENDIENTE | PENDIENTE | PENDIENTE | PENDIENTE | **No anotar secretos en público** | PENDIENTE |

**Regla:** nunca llenar los campos de huella, posesión o registro con datos supuestos. Una evidencia se marca como verificada solo después de conservar el archivo y comprobar su integridad.
