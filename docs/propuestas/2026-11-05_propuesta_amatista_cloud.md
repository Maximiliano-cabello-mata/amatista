# Propuesta Técnica: Amatista Cloud (Sesiones Efímeras de Blender en la Nube)

- **Estado:** Propuesta en evaluación / Prototipo experimental (**NO incluida en la versión final en producción**)
- **Fecha de consolidación:** 2026-11-05
- **Referencias técnicas:** `nube/` (prototipo de nodo e imagen Docker), `backend/api/nube.py` (coordinador desactivado por defecto en producción), `docs/nube/INSTRUCCIONES.md`

---

## 1. Decisión de Producto (Por qué queda como propuesta y no en la versión final)

El enfoque definitivo de **Amatista** prioriza:
1. **100 % Software Libre local y abierto:** enseñanza centrada en **Blender** (GPL) y **A-Frame** (MIT) ejecutados directamente en el dispositivo del estudiante.
2. **Arquitectura Offline-First y soberanía escolar:** la PWA, la biblioteca CC0, el asistente Goliat y la adaptación de hardware **Geoda (`N0–N4`)** permiten que incluso ordenadores modestos (2 a 4 GB de RAM, sin GPU dedicada) ejecuten la versión y los ajustes óptimos de Blender o el Estudio Web 3D sin depender de ancho de banda continuo (4–20 Mbit/s) ni de servidores de streaming.
3. **Coste operativo cero:** mantener contenedores con escritorio remoto KasmVNC y renderizado por CPU (`llvmpipe`) consume núcleos completos por alumno en la VM de Oracle o en equipos prestados.

Por ello, **la opción de la nube se retiró de la navegación, de la portada y de las rutas activas de la plataforma final**, conservándose únicamente como **propuesta técnica documentada** para laboratorios universitarios que en el futuro deseen evaluar préstamos de sesiones remotas en red local o híbrida.

---

## 2. Resumen del Diseño Propuesto

La propuesta plantea prestar **una hora de Blender en un equipo remoto** a cuentas institucionales verificadas (`@utn.mx`), desde el navegador y sin instalar nada, repartiendo sesiones entre:
- una instancia en la nube (Oracle Ampere A1);
- ordenadores del laboratorio que ejecuten el demonio ligero `nube/nodo/amatista_nodo.py`.

```text
 Alumno (navegador)                 API de Amatista                        Nodo (VM o PC de laboratorio)
 ──────────────────                 ───────────────                        ─────────────────────────────
 Solicitud de sesión ──────────────► ¿cuenta institucional confirmada?
                                     ¿sin sesión abierta? ¿cuota del día?
                                     elige el nodo con más lugar
                                     guarda NUBE_SESIONES (hash del token)
           ◄── token de 60 min ───── (el token solo se muestra una vez)
                                                          ◄──── latido cada 3–5 s (sin abrir puertos)
                                     «abre nube-…» + hash del token ──►     docker run (aislado, sin WAN)
                                     ◄──────────────────────────── «lista»
 Formulario POST con el token ───────────────────────────────────────────► /entrar → cookie HttpOnly
 Blender en el navegador (KasmVNC, WebSocket) ◄══════ túnel de Cloudflare ══ proxy del nodo ⇄ contenedor
```

---

## 3. Mediciones del Prototipo (Referencia Experimental)

Medido con la imagen `amatista-nube-sesion:1` en un contenedor `x86_64` de 4 núcleos sin GPU, con 2 hilos de `llvmpipe` por sesión:

| Indicador | Resultado medido |
|---|--:|
| Imagen de la sesión (Ubuntu 24.04 + Blender 4.0.2 + KasmVNC 1.4) | 1.66 GB (una vez por nodo) |
| Tiempo desde pedir la sesión hasta tenerla lista | 3 s |
| RAM de una sesión con Blender abierto | ≈ 535 MB |
| CPU de una sesión en reposo | 1–2 % de un núcleo |
| CPU girando la vista 3D de forma continua | ≈ 0.55 núcleos |
| Ancho de banda girando la vista (1600×900) | ≈ 4.2 Mbit/s (en reposo ≈ 0) |
| Render 1280×720 Workbench | 0.8 s |

---

## 4. Criterios para Retomar la Propuesta en el Futuro

Esta propuesta solo deberá reactivarse si se cumplen simultáneamente estas condiciones:
1. Un laboratorio escolar carece de permisos para instalar Blender Portable o ejecutar el ejecutable portátil `Amatista.exe` incluso con el perfil `N0/N1` de **Geoda**.
2. Se dispone de al menos un servidor dedicado en LAN con ≥ 8 núcleos físicos para alojar los contenedores sin degradar la API principal de Amatista.
3. Se habilita un proxy con lista blanca hacia la API de Amatista para que el add-on **Amatista Motor** pueda sincronizar el progreso desde dentro del contenedor aislado.
