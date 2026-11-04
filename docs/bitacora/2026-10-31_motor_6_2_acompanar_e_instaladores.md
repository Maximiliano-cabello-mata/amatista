# Motor 6.2: Amatista acompaña e instaladores de verdad (31 oct 2026)

**Pedido del creador (30 oct, noche):** al cambiar de práctica se quedaban los modelos de la anterior; al salir del panel de Amatista no había cómo volver; quería elementos que se iluminen cuando el alumno los necesita, un motor que note la dificultad (intentos, clics, desesperación) y dosifique la ayuda (mucha al principio, más seria con el curso, lo que no domina siempre señalado) y dejar el .zip por un .exe que los antivirus no marquen. También notó que «la actualización del motor no llegó»: el 6.1 (PR #46) seguía sin integrar, así que este PR lo trae incluido.

**Qué se hizo**

- Motor: `taller/acompanamiento.py` (termómetro de ánimo + luz por fase, madurez del curso y habilidades débiles).
- Add-on 6.2: faro sobre la pieza que toca, la herramienta brilla sola, «Te toca · Estás haciendo», ayuda ofrecida al atorarse; cambio de práctica limpio (el molde del proyecto viejo se quedaba dibujado; lo suelto del alumno se usaba como escena de la práctica); pastilla «Volver a mi práctica».
- Instaladores: .exe con Inno Setup (sin administrador) y .deb con el lanzador `amatista`; flujo de CI que los arma en cada PR y los firma con SignPath o un certificado propio; la plataforma los ofrece si están en el servidor.

**Decisión pendiente del creador (T-173):** la firma de Windows. Recomendado SignPath Foundation (gratis para código abierto, el add-on ya es GPL, pide repositorio público). Azure Artifact Signing no admite hoy personas fuera de EE. UU. y Canadá.

**Probado:** motor y add-on (pytest), Blender 5.0.1 sin ventana (`en_blender.py`), backend, vitest y lint. Falta con ventana (T-172).
