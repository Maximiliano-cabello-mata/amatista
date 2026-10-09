# 08 · Auditoría educativa de Amatista (9 de octubre de 2026)

Documento único de auditoría del repositorio y de los cambios documentados hasta hoy. Resume qué está funcionando, qué está fallando y qué se corrige primero para mantener a Amatista como entorno de aprendizaje.

Actualizado: 9 de octubre de 2026

## 1) Hallazgos de exploración (datos concretos)

- **Catálogo educativo actual**
  - 5 cursos base en `frontend/src/data/cursos.js` (3 Blender publicados, 1 Blender Avanzado bloqueado, 1 A-Frame).
  - 10 módulos publicados en `KANBAN.md` (9 Blender + 1 A-Frame).
- **Prácticas Blender**
  - 18 prácticas activas (`practica.json`) y 18 baterías (`pruebas.json`) en `practices/blender/**`.
- **Herramientas de enseñanza**
  - 20 bloques en `frontend/src/data/herramientas.js`.
- **Herramientas gráficas en producto**
  - 4 componentes base en `frontend/src/components/graficas/`: `AnilloProgreso`, `Barras`, `MapaCalor`, `Medidor`.
- **Capacidad pendiente visible**
  - Deuda abierta alta en tablero (`KANBAN.md`): pendientes, en progreso y revisión en volumen mayor al cierre.

## 2) Qué está bien (fortalezas reales)

- La visión educativa sí está implementada: ruta por módulos, práctica de Blender al cierre, progreso y panel.
- Arquitectura pedagógica clara: contenido declarativo, validación y práctica guiada.
- Base técnica sólida: PWA offline-first, backend FastAPI, prácticas y pruebas.
- Trazabilidad fuerte: changelog, tablero, bitácoras y documentación extensa.

## 3) Qué está mal (fallas de plataforma)

1. **Desalineación documental crítica (visión vs estado actual)**  
   Documentos vigentes estaban congelados en 4–5 de octubre mientras el 9 de octubre se añadieron cambios de motor y flujo (3.4, 3.5, 3.5.1).

2. **Narrativa educativa inconsistente para usuarios nuevos**  
   Se mezclaba estado histórico del piloto con estado operativo actual, reduciendo confianza en la lectura inicial.

3. **Brecha plataforma ↔ Blender aún sensible en la narrativa**  
   Hay avances reales en motor y add-on, pero faltaba un relato unificado en documentos base y en la UI de alumno.

4. **Herramientas gráficas limitadas para la etapa actual**  
   La analítica visual estaba concentrada en cuatro piezas base; faltaba mayor variedad para lectura pedagógica de evolución.

5. **Placeholders visibles en el panel del alumno**  
   Tarjetas de “Próximamente” para funciones no cerradas generaban percepción de producto incompleto.

## 4) Fragmentos que ya no alineaban

- Fechas de “Actualizado” desfasadas en documentos clave.
- Referencia externa no portable en herramientas gráficas (`/mnt/project-files/...`).
- Mensajes de “Próximamente” en panel de alumno (`frontend/src/components/panel/Proximamente.jsx`).
- Cobertura parcial de A-Frame respecto al discurso amplio de ruta.

## 5) Plan aplicado (documentación + código)

### Fase A — Alineación documental
- Estado oficial unificado en README raíz, `docs/README.md`, `docs/plataforma/README.md`, `docs/historia/01_cronologia.md` y `PROYECTO.md`.
- Separación explícita entre estado vigente e histórico.
- Este documento consolida auditoría educativa.

### Fase B — Higiene de producto educativo
- Se retiró el enfoque de “próximamente” del panel del alumno y se reemplazó por foco en capacidades ya activas de aprendizaje.
- Lo reservado queda documentado en áreas técnicas/internas.

### Fase C — Expansión de herramientas gráficas
- Se definió el **catálogo gráfico educativo v2** y su prioridad en `07_herramientas_graficas.md`.
- Se añadió una gráfica de tendencia reutilizable y se integró en panel de alumno y resumen admin.

### Fase D — Integración plataforma-Blender orientada a aprendizaje
- Se unifica en documentación base que la plataforma guía y Blender instruye con evidencia observable.
- Se prioriza feedback pedagógico (qué corregir, por qué y cómo mejora).

### Fase E — Gobernanza de calidad continua
- Regla activa: documento vigente desactualizado bloquea cierre de entrega.
- Check de consistencia entre changelog, tablero y docs antes de release.
- Auditoría mensual de deuda pedagógica/UX y deuda documental.

## 6) Resumen honesto

- **Lo que Amatista hace bien:** base educativa-técnica sólida e integración progresiva real con Blender.
- **Lo que Amatista hace mal:** coherencia narrativa y actualización transversal de documentación; variedad gráfica pedagógica todavía en crecimiento.
- **Prioridad inmediata:** mantener una sola verdad operativa (docs + UI) antes de ampliar alcance funcional.
