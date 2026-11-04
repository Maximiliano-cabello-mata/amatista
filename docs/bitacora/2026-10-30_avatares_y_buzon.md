# Bitácora · 30 oct 2026 · Interfaz libre, avatares y buzón del creador

Pedido de Maximiliano (20:32): liberar la interfaz sin llenarla de avisos, avatares low poly para cada cuenta, un pavo real para su cuenta de creador, un buzón para que los alumnos le escriban con una animación de gracias, y arreglar los checks rojos de Cloudflare. Rama `claude/project-thread-38q6id`, PR #47. Tareas T-148 (hecha) y T-149 (producción).

## Qué se hizo

1. **Cloudflare.** Workers Builds corría `wrangler versions upload`/`wrangler preview` en las ramas sin comando de compilación, así que no había `frontend/dist`. `wrangler.jsonc` trae ahora `build.command` (compila solo si falta `dist/index.html`); probado con wrangler 4.156.
2. **Interfaz libre.** Goliat sin presentación ni cinta con su nombre (opacidad 0.8 hasta el foco); la mascota del módulo solo reacciona a fallo o final.
3. **Servidor.** Script 013 (`PERFILES`, `SUGERENCIAS`, `SUGERENCIA_MENSAJES`; 24 tablas), `api/perfil.py`, `api/buzon.py`, `AMATISTA_CREADOR`, diagnóstico y 004 al día, esquema PostgreSQL regenerado. 7 pruebas nuevas.
4. **Avatares.** 8 personajes + pavo real del creador (original: blanco porcelana, carmesí, cola con los colores de Amatista; gestos quieto/abierto/gracias). `AvatarProvider` con copia local; Perfil › Tu personaje; barra con el avatar.
5. **Buzón.** `#/buzon` (categorías, hilo, gracias animado) y `#/admin/buzon` (sin leer primero, responder como creador, resolver). Entradas discretas: menú de la cuenta, pie, Ayuda y Goliat («reportar», «sugerencia»).

## Verificación

- Backend: 425 pruebas en verde.
- Frontend: lint, 360 pruebas de vitest y build en verde.
- Capturas a 1280 y 390 px con la API simulada: sin desbordes. La lista del buzón desbordaba en móvil por el texto truncado dentro de un grid; se corrigió con `grid-cols-1`.

## Pendiente del usuario (T-149)

Ejecutar 013 en Database Actions, poner `AMATISTA_CREADOR=cabellomaximiliano86@gmail.com` en `backend/.env`, reiniciar `amatista-backend` y publicar. Pasos en `docs/plataforma/16_avatares_y_buzon.md` §5.
