# 01 · Mapa de la plataforma

## Alumno

| Dónde | Ruta | Qué hace ahí |
|---|---|---|
| Cursos | `#/` | Los cursos disponibles. |
| Curso | `#/curso/<curso>` | El mapa: módulos (con la etiqueta «Nivel N» en su encabezado; el mapa de niveles completo es T-041) con sus **etiquetas**, la **ruta** de cada módulo y su **estación de práctica en Blender**. Ver [02](02_modulos_y_practica.md). |
| Lección | `#/curso/<curso>/leccion/<leccion>` | Los bloques de la lección ([04](04_herramientas_de_ensenanza.md)). En la lección de práctica, la tarjeta de Blender: **Prepara tu Blender** en tres pasos, **El ejemplo resuelto**, el botón **Abrir en Blender** y, con Blender en esa práctica, la tarjeta **Ahora en Blender**, que maneja la práctica desde la lección ([02](02_modulos_y_practica.md#dentro-de-la-práctica)). |
| Mi panel | `#/panel` | Nivel, racha, qué sigue, avance por curso, exámenes, retos y **Tus prácticas en Blender** (la práctica de cada módulo con su estado). |
| Mi Blender | `#/blender` (menú de la cuenta) | Descargar el add-on, computadoras conectadas, compatibilidad y **Tu Blender, desde aquí**: cómo se ve Blender para el alumno (modo enfocado, acompañamiento, tarjeta con el paso actual en la vista 3D y avisos si usa una herramienta de otro nivel), guardado con `GET/PUT /api/addon/v1/ajustes` y aplicado en el siguiente latido. Ya no está en la barra superior: se llega desde el menú de la cuenta o desde cualquier práctica. |
| Vincular | `#/vincular?codigo=…` | Confirmar el código que muestra Blender. |
| Perfil | `#/perfil` | Datos de la cuenta. |

**Recorrido típico:** abre el curso → entra al módulo → hace las lecciones en orden (cada una desbloquea la siguiente) → la estación de Blender se ilumina → abre la práctica → si es la primera vez, prepara Blender en la misma tarjeta → **Abrir en Blender** → practica en Blender acompañado por el motor, mientras la lección muestra «Ahora en Blender», el ejemplo resuelto y la lista «Comparado con el ejemplo» → el avance aparece en la lección y en el panel → examen del módulo e insignia.

## Profesor

Rol `profesor`. Ve el **Diagnóstico técnico** (`#/laboratorio`) de su dispositivo. Entra al panel de administración (`#/admin`) en **solo lectura**: ve resumen, módulos, prácticas de Blender, herramientas y usuarios, pero no publica ni edita (el servidor lo valida en cada petición). En Blender, el add-on le muestra el **modo Desarrollador** (Amatista Author) para crear y probar prácticas y subirlas como borrador. Su recorrido para preparar una clase: revisar el módulo y su práctica en el panel, abrir **Herramientas** para ver qué piezas hay y probar la práctica en Blender como alumno.

## Administrador

Rol `admin`. Todo lo del profesor y además: crea y edita módulos y lecciones, publica y archiva, publica versiones de prácticas, gestiona usuarios y ve el estado del sistema. Detalle en [05 · Panel de administración](05_panel_de_administracion.md).

## Barra superior

| Antes (v3.0) | Ahora (v3.1) |
|---|---|
| Cursos · Mi panel · **Laboratorio** · **Blender** · Admin (profesor/admin) | Cursos · Mi panel · Admin (profesor/admin) |
| Menú de la cuenta: Perfil · Mi panel · Cerrar sesión | Menú de la cuenta: Perfil · Mi panel · **Mi Blender** · Cerrar sesión (también en el menú del celular) |

La ruta `#/blender` sigue funcionando (enlaces viejos, el add-on y los correos la usan).

**Estructura fija.** La barra no cambia de una pantalla a otra ni según el módulo: todo lo del alumno cuelga de *Cursos* (aprender, incluida la práctica en Blender) y de *Mi panel* (su avance). El antiguo «Laboratorio técnico» era una página de pruebas (estado del backend, una sesión de prueba y un recuadro de tutor IA que no existía): salió de la navegación y de la portada, quedó como **Diagnóstico técnico** solo para profesores y administradores (se abre desde Admin › Estado) y perdió los botones de prueba. El laboratorio 3D para alumnos es otra cosa y llega con la v3.2 (T-049).
