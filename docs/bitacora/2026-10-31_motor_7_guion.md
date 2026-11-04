# Motor 7 «Guion»: la práctica avanza con la escena (31 oct 2026)

**Pedido del creador (31 oct, madrugada):** el motor siempre habla de «la herramienta que brilla a la izquierda» y ninguna brilla; las instrucciones son vagas; paneles y cuadros se enciman y las señales no son correctas; un alumno que terminó el tren no avanza porque el paso le exige la herramienta indicada. Rehacer el motor desde cero para que avance sincronizado con el resultado real de Blender y guíe desde la interfaz. Analizar lo que se hizo mal con 20 a 100 simulaciones. Y que un administrador no lleve progreso: cada vez que entra, todo desde cero.

**Lo que encontramos (Blender 5.0.1 sin ventana)**

- La pista «Con qué» era un texto fijo que decía «brilla a la izquierda» aunque no brillara nada; el modo enfocado escondía la barra de herramientas; Agregar y Guardar no viven en esa barra.
- La instrucción de cada paso del proyecto era el lema («Tu tren llega a la estación de la isla.»), mientras el motor revisaba otra cosa.
- El objetivo automático «ejemplo» era obligatorio y quedaba al final: con el tren completo, la práctica no cerraba.
- Pistas sin números («un poco más adelante») y un tercer nivel que decía «tú puedes».
- Guardar y deshacer no volvían a evaluar.

**Simulaciones** (`addon/tests/simular_alumnos.py`, 100 alumnos, semilla 2026): el 6.2 deja terminar a 24; el 7 a 99. Resultados en `/mnt/project-files/motor/2026-10-31_simulaciones_motor_7/`.

**Qué se hizo**

- Motor: paquete `guion/` (pasos con verbo desde los objetivos, avance por resultado, tres pistas, tabla `donde.py` con el lugar real de cada herramienta); `ejemplo` opcional; mensajes de proporción con números.
- Add-on 7.0: revisión 0,15 s después de cada cambio, al guardar, deshacer y abrir; una banda arriba y el panel N › Paso a paso; señales comprobadas; el modo enfocado ya no esconde la barra.
- Administrador sin progreso: add-on (en memoria), backend (`sin_progreso`) y PWA (borra lo local al entrar y no guarda).

**Probado:** pytest del motor, add-on y backend; `en_blender.py` completo con `probar_motor7`; vitest (384) y lint. Falta con ventana (T-178) y el despliegue (T-179).
