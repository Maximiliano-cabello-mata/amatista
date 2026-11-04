# Amatista Motor 6.2: Amatista acompaña, se vuelve fácil y se instala con doble clic

31 de octubre de 2026 · add-on 6.2.0 · tareas T-170 a T-175 · **sin SQL** (el siguiente libre sigue siendo 013).

Lo pidió el creador al probar el 6.0 (el 6.1 todavía no estaba publicado):

> Cuando estás haciendo una práctica pero quieres realizar otra, se cruzan y se quedan los modelos de la anterior. Cuando sales del panel de Amatista no sabes cómo regresar. Elementos que se iluminen cada que un alumno los necesite, que señalen qué tiene que hacer y qué está haciendo. Que el motor identifique qué tanto se le dificulta (muchos intentos, muchos clics, desesperación) y lo ilumine. Al inicio todo activo; conforme avanza el curso se vuelve más serio, pero lo que no domine se lo seguimos señalando. No quiero que se frustre. Y que deje de ser un zip: un .exe seguro que Windows y Linux no detecten como malicioso.

Este documento incluye también todo el Motor 6.1 (`20_motor_6_1.md`), que llega en la misma versión.

## 1. El termómetro de ánimo (motor)

`engine/amatista_engine/taller/acompanamiento.py`, Python puro y probado en `engine/tests/test_acompanamiento.py`.

Señales que el add-on ya puede ver, sin leer el teclado ni la pantalla:

| Señal | De dónde sale | Peso |
| --- | --- | --- |
| Intentos fallidos | piezas con la forma equivocada, «Comprobar» sin éxito | 0.22 c/u (hasta 4) |
| Deshacer seguidos | `undo_post` | 0.10 c/u desde el 2.º |
| Ráfaga de clics | 14 operaciones o más en 30 s sin avanzar (`wm.operators`) | 0.35 a 0.70 |
| La misma operación una y otra vez | 5 seguidas sin avanzar | 0.25 |
| Retroceso | una pieza que estaba llena y se vació | 0.12 c/u |
| Saltos | saltó esta habilidad antes | 0.18 c/u |
| Tiempo sin avanzar | 45 s (duda) / 100 s (atorado) | 0.28 / 0.50 |

Puntaje 0 a 1: **tranquilo** (< 0.25), **duda** (< 0.5), **atorado** (< 0.8), **frustrado**. Avanzar (llenar una pieza, cumplir un objetivo) calma: borra las ráfagas, los deshacer y un fallo.

## 2. La luz: cuánta ayuda se enciende sola

`luz_para(fase, madurez, ánimo, débil, reto)` devuelve el nivel **apagada · tenue · media · plena** y qué se enciende:

- **La fase de la habilidad manda.** Nueva → plena; con ayuda → media; ya te sale → tenue; dominada → apagada.
- **La madurez del curso baja el techo** (fracción de habilidades del curso que ya salen): < 0.25 plena, < 0.55 media, < 0.85 tenue, después apagada. Una habilidad que todavía no sale nunca queda a oscuras (mínimo tenue).
- **Lo que no domina se sigue señalando.** Una habilidad nueva o con ayuda **después de 3 intentos** es «débil»: la madurez no la apaga (mínimo media).
- **El ánimo sube la luz un rato.** Duda +1, atorado o frustrado +2, y además Amatista **ofrece** la siguiente pista (nunca la impone) con una frase de ánimo.
- **En retos y repasos** la luz no pasa de tenue: son para demostrar.

| Nivel | Qué se ve en Blender |
| --- | --- |
| tenue | la pieza que toca pulsa con un faro encima (flecha que baja y anillo en el suelo) |
| media | + la tarjeta dice «Te toca: Extruir» y «Estás haciendo: Mover ✓» (verde si es la herramienta que toca, ámbar si es otra); la herramienta brilla si duda |
| plena | + la herramienta brilla sola desde el principio en su lugar (barra T, menú o su zona: Propiedades para modificadores y materiales) y vuelve a brillar cada 14 s si no avanza |

Nunca se dictan las teclas: siguen saliendo solo al pedir «¿Cómo?» (la escalera con freno de `ayudas.py`).

## 3. En Blender (add-on 6.2)

- `taller/acompanar.py` junta las señales, lee el ánimo cada segundo y reparte la luz. Se reinicia con cada actividad.
- `taller/vista/molde.py` dibuja el faro sobre la pieza que toca con la fuerza de la luz.
- `taller/vista/tarjeta.py` agrega la línea «Te toca · Estás haciendo» (la operación modal en curso, como mover con G, o la última que hiciste).
- El latido manda `detalle.taller.acompanamiento = {animo, razones, luz}` (`backend/api/enlace.py`): el panel del profesor puede ver **dónde** se atora cada quien, sin contar errores.

## 4. Cambiar de práctica sale limpio

Lo que se cruzaba y ya no:

- **El molde del proyecto anterior** seguía dibujándose encima de una práctica suelta (la sesión del taller no se soltaba si lo de antes era un proyecto). Ahora se suelta (`sesion.al_abrir_practica`).
- **Lo suelto del alumno** (una escena sin práctica pero con cosas: lo que modeló libre, el cubo del recorrido, la isla) se usaba como escena de la práctica. Ahora la práctica empieza en una escena propia y limpia; lo de antes queda en su escena (`practicas._escena_para`).
- **La demostración, la ficha y el brillo** de la actividad anterior se apagan al abrir otra práctica (`practicas._cambio_limpio`), y el ánimo vuelve a cero.

## 5. «Volver a mi práctica» desde cualquier lado

`navegar.py`. Si hay una actividad o práctica en curso y la vista 3D muestra otra escena:

- abajo al centro aparece una **pastilla que respira**: «Tu práctica sigue en otra escena · Volver a … ›»;
- el botón Amatista de la cabecera cambia a **«Volver a Amatista»** (en rojo suave) y el menú Amatista lo pone primero;
- un clic lleva a la escena de lo que estabas haciendo (en Modo Objeto), al espacio «Amatista» con la barra lateral abierta y despierta la tarjeta con «Aquí sigues».

Nunca borra ni empieza de nuevo. El turno de tarjetas suma `volver` al final: recorrido > taller > ficha > misión > volver.

## 6. Instaladores de verdad (adiós al zip)

| Sistema | Archivo | Cómo se arma |
| --- | --- | --- |
| Windows | `Amatista-6.2.0-Windows.exe` | Inno Setup 6 con `addon/herramientas/instalador/windows/amatista.iss` |
| Linux (Debian, Ubuntu, Mint) | `amatista_6.2.0_all.deb` | `python addon/herramientas/instaladores.py deb` (dpkg-deb) |
| macOS | el .zip de siempre | un .pkg firmado necesita cuenta Apple Developer (99 USD/año) y notarización |

Lo arma el flujo **Instaladores** (`.github/workflows/instaladores.yml`): en cada PR sin firmar (para ver que compila), a mano o con una etiqueta `v*` firmado y publicado en Releases.

**Windows (.exe):** se instala sin administrador en `%LOCALAPPDATA%\Programs\Amatista`, busca Blender (Archivos de programa, Steam, la carpeta del usuario o pregunta), le pide a ese Blender que compruebe su versión e instale la extensión, y ofrece abrir «Blender Amatista». Se desinstala desde Configuración › Aplicaciones (quita Amatista de ese Blender; el avance no se toca).

**Linux (.deb):** `sudo apt install ./amatista_6.2.0_all.deb` deja el comando `amatista` y el ícono «Amatista» en el menú. Al abrirlo instala o actualiza Amatista en el Blender del usuario (la primera vez y con cada versión nueva) y abre Blender Amatista. También recibe los enlaces `amatista://`. `amatista --desinstalar` lo quita.

**Un solo instalador para todos.** La firma sella el archivo: no se le puede meter un vínculo de cuenta por alumno. La cuenta se conecta después, desde Blender («Conectar mi cuenta»), con el código de siempre. El .zip personalizado sigue disponible como plan B.

**En la plataforma:** el servidor sirve el instalador si está en `AMATISTA_INSTALADORES` (por defecto `backend/instaladores/`, fuera de git): `GET /api/addon/v1/instaladores/{windows|linux}` y `estado.instaladores`. La página Blender y «Prepara tu Blender» bajan el .exe o el .deb si existe; si no, el .zip.

### Qué hace que Windows y los antivirus no lo marquen

1. **Firma de código Authenticode con marca de tiempo** (lo único que quita «Editor desconocido»). Requiere un certificado; ver abajo.
2. Datos del editor en el .exe (VersionInfo), sin empaquetadores (UPX), sin descargar ni ejecutar nada mientras instala, sin administrador.
3. **SmartScreen se gana con reputación:** aun firmado, las primeras descargas pueden mostrar «Windows protegió tu PC» hasta que el certificado junta descargas limpias (días o semanas). Desde 2024 ni el certificado EV da reputación inmediata.
4. Si algún antivirus lo marca igual: enviarlo como falso positivo en https://www.microsoft.com/wdsi/filesubmission (y al fabricante que corresponda).

En Linux no hay un SmartScreen: lo que da confianza es instalar desde un paquete con firma. El flujo firma el .deb con GPG (`.asc`) y publica `SHA256SUMS` firmado.

### Lo que necesita el creador (T-173)

Para Windows hay que elegir **una** vía de firma:

| Vía | Costo | Para quién | Qué cargar en GitHub |
| --- | --- | --- | --- |
| **SignPath Foundation** (recomendada) | gratis | proyectos de código abierto con licencia OSI y repositorio público; el add-on ya es GPL-3.0. El editor que aparece es «SignPath Foundation» | secreto `SIGNPATH_API_TOKEN`; variables `SIGNPATH_ORGANIZATION_ID`, `SIGNPATH_PROJECT_SLUG`, `SIGNPATH_POLICY_SLUG` |
| **Certificado propio (OV)** de una autoridad (Certum, Sectigo, SSL.com…) | ~25 a 400 USD/año | a tu nombre; desde 2023 la llave vive en un token o en la nube del proveedor, así que la firma en CI depende de que el proveedor lo permita | secretos `WINDOWS_CERT_PFX` (base64) y `WINDOWS_CERT_PASSWORD`, o el paso de firma del proveedor |
| Azure Artifact Signing | ~10 USD/mes | hoy solo personas en EE. UU. y Canadá, u organizaciones con 3 años en EE. UU., Canadá, UE o Reino Unido | no aplica por ahora |

Para Linux: una llave GPG (`gpg --full-generate-key`) y los secretos `LINUX_GPG_PRIVATE_KEY` (la llave exportada con `gpg --armor --export-secret-keys`) y `LINUX_GPG_PASSPHRASE`. La llave pública se publica en la página de Amatista para quien quiera verificar.

SignPath pide que el repositorio sea público y que el binario se arme en CI desde ese código: si el repositorio pasa a privado (fase 4 del plan de despliegue), hay que elegir el certificado propio.

## 7. Pruebas

- `engine/tests/test_acompanamiento.py` (12): ánimo, madurez, débiles, luz por fase, reto y frustración.
- `addon/tests/test_addon_motor62.py`: versión, lo que lleva cada instalador, el .iss, el lanzador de Linux y el árbol del .deb.
- `addon/tests/en_blender.py › probar_motor62`: cambio limpio, molde del proyecto suelto, luz plena con habilidad nueva, tres fallos → atorado con ayuda ofrecida y brillo, latido con el ánimo, «Volver a mi práctica».
- `backend/tests/test_addon.py`: instaladores en `estado` y su descarga.
- Pendiente con ventana (T-172): ver el faro, la línea «Te toca · Estás haciendo» y la pastilla en Blender de verdad.
