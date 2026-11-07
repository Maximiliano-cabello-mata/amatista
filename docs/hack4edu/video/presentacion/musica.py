"""Música y diseño sonoro de la presentación de Hack4Edu (4:20), sintetizados desde cero con las piezas de
../pelicula/musica.py (sin licencias de terceros).      python3 musica.py <salida.wav>

Sigue frontend/presentacion/tiempos.js: prólogo de 16 s, la gema (4 s) y la voz seguida desde el segundo 20.
Psicología del sonido, para que el oído siga atento aunque la vista se distraiga:
  · Motivo de Amatista: tres campanas (Mi–Si–Mi) que suenan siempre con la marca (logo, revelación, pilares,
    cierre). El oído aprende la asociación y la reconoce cada vez.
  · Golpe en cada cifra, con una subida corta antes (20,900+, 1,500+, 500+): anticipación y recompensa.
  · Ruptura de patrón: la música se cae cuando «la red escolar colapsa» y se queda en silencio antes de
    «hasta hoy»; el contraste hace que esa frase pegue.
  · Color emocional por capítulo: menor y grave en el problema, mayor y luminoso en la solución, sereno en la
    telemetría, cálido en la inclusión. Clics de logro en cada pieza revisada y latido en Geoda.
  · Todo va por debajo de la voz (sidechain al mezclar); donde no hay voz se oye más.
"""
import os
import sys
import wave

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'pelicula'))
from musica import (DO, DOsm, FA, LA, LAm, MI, MIm, REm, SIm, SOL, Pista, acto_intimo, acto_ritmo, campana,  # noqa: E402
                    colchon, golpe, latidos, midi, reverberar, soplido, subida)

SR = 44100
PRE, DUR = 20.0, 260.0


def t(v):
    """Segundo del video en que suena el segundo v de la voz."""
    return PRE + v


def motivo(p, x, vol=1.0):
    """El motivo de Amatista: Mi–Si–Mi en campanas, con un brillo debajo."""
    for j, n in enumerate((76, 83, 88)):
        p.poner(x + j * 0.16, campana(midi(n), 3.0), 0.24 * vol, pan=-0.25 + j * 0.25)
    p.poner(x, colchon([midi(64), midi(71), midi(76)], 2.6, ataque=0.05, salida=2.0), 0.18 * vol)


def impacto(p, x, vol=1.0, anticipa=1.0):
    """Subida corta y golpe: anticipación y recompensa en una cifra."""
    p.poner(x - anticipa, subida(anticipa), 0.35 * vol)
    p.poner(x, golpe(2.2), 0.55 * vol)


def acorde(p, x, notas, d, vol=0.6):
    p.poner(x, golpe(3.0), 0.6 * vol)
    p.poner(x, colchon([midi(n) for n in notas], d, ataque=0.05, salida=3), vol)


def clic(p, x, nota=88, vol=0.12):
    p.poner(x, campana(midi(nota), 0.45), vol, pan=0.3)


def componer():
    p = Pista(DUR)

    # Prólogo · nuestra historia: piano íntimo; tensión cuando «no alcanzaba»; sube hacia «Por eso creamos…»
    acto_intimo(p, 0.3, 12.8, [REm, LAm, FA, MIm], bpm=84, vol=0.34)
    latidos(p, 8.3, 12.4, bpm=70, vol=0.3)
    p.poner(12.6, colchon([midi(n) for n in (50, 57, 62, 65)], 4.0, ataque=1.2), 0.45)
    p.poner(13.4, campana(midi(81), 2.5), 0.2)
    p.poner(13.6, subida(2.4), 0.6)
    p.poner(16.0 - 0.55, soplido(1.1), 0.6)

    # La gema se arma: golpe, acorde mayor y el motivo (primera vez que el oído lo aprende)
    acorde(p, t(-0.6), (48, 55, 62, 64, 67), 7, vol=0.5)
    motivo(p, t(-0.4), 1.1)

    # 01 · El problema: grave y en menor
    acto_intimo(p, t(8.1), t(60.2), [LAm, FA, DO, SOL], bpm=72, vol=0.2)
    p.poner(t(35.0), colchon([midi(33), midi(40)], 26, ataque=3), 0.22)  # dron grave bajo la brecha
    impacto(p, t(42.4), 1.0)     # 20,900+
    impacto(p, t(46.0), 0.85)    # 1,500+
    p.poner(t(60.2), colchon([midi(45), midi(52), midi(57)], 7.0, ataque=2, salida=0.3), 0.3)
    # «la red escolar colapsa»: la música se cae (ruptura de patrón)
    p.poner(t(66.9), soplido(0.9, sube=False), 0.6)
    p.poner(t(67.08), golpe(2.4), 0.55)
    latidos(p, t(68.8), t(77.7), bpm=66, vol=0.42)
    p.poner(t(72.8), colchon([midi(40), midi(47)], 5.2, ataque=2, salida=0.4), 0.3)

    # 02 · La solución: un instante de silencio y se abre en mayor
    p.poner(t(78.1) - 0.55, soplido(1.1), 0.65)
    acorde(p, t(79.9), (36, 48, 55, 64, 67), 8, vol=0.55)
    motivo(p, t(80.1), 1.0)
    acto_ritmo(p, t(83.7), t(125.25), [DO, SOL, LAm, FA], bpm=100, vol=0.2, bateria=0.4)
    motivo(p, t(92.52), 0.6)     # pilar 1
    for x in (95.5, 98.2, 99.7, 103.2):
        clic(p, t(x), 84, 0.1)   # cada toma de la demostración web
    motivo(p, t(106.38), 0.6)    # pilar 2
    for x in (119.6, 120.05, 120.5, 120.95, 121.4, 121.85, 122.3, 122.75, 123.25):
        clic(p, t(x))            # cada pieza que el add-on revisa
    acorde(p, t(123.9), (48, 55, 60, 64, 67, 72), 3.5, vol=0.35)  # ¡práctica terminada!

    # Geoda: campanas y el latido del corazón (lub-dub cada 1.1 s desde que se nombra)
    acto_ritmo(p, t(125.25), t(144.1), [MI, DOsm, LA, SIm], bpm=90, vol=0.17, bateria=0, campanas=True)
    p.poner(t(125.25), colchon([midi(n) for n in (52, 59, 64, 68)], 19.5, ataque=2), 0.24)
    motivo(p, t(130.24), 0.7)
    latidos(p, t(130.24), t(144.0), bpm=60 / 1.1, vol=0.42)

    # 03 · Telemetría y sincronización: sereno; la información «viaja»
    p.poner(t(144.1) - 0.55, soplido(1.1), 0.6)
    acto_ritmo(p, t(144.1), t(177.0), [MI, DOsm, LA, SIm], bpm=96, vol=0.18, bateria=0.3, campanas=True)
    p.poner(t(159.0), soplido(1.0), 0.4)          # el texto ligero viaja
    for x, n in ((163.86, 84), (165.36, 88)):    # FastAPI, SQL
        clic(p, t(x), n, 0.14)

    # 04 · Inclusión y escala: cálido y creciendo
    p.poner(t(177.0) - 0.55, soplido(1.1), 0.6)
    acto_ritmo(p, t(177.0), t(223.6), [FA, DO, SOL, LAm], bpm=100, vol=0.21, bateria=0.55)
    impacto(p, t(187.9), 0.85)   # 1,500+ facultades
    impacto(p, t(199.7), 1.0)    # 500+ alumnos
    clic(p, t(206.9), 81, 0.14)  # costo mínimo
    clic(p, t(214.96), 84, 0.14)  # en producción
    p.poner(t(219.6), colchon([midi(n) for n in (53, 60, 65, 69)], 4.5, ataque=1.5), 0.3)  # Latinoamérica

    # Cierre: piano suave… silencio… «hasta hoy» con todo
    acto_intimo(p, t(223.6), t(226.7), [DO, SOL], bpm=80, vol=0.22, mayor=True)
    p.poner(t(228.42) - 0.9, subida(0.9), 0.35)
    acorde(p, t(228.42), (36, 48, 55, 64, 67, 71), 6, vol=0.7)
    motivo(p, t(228.6), 1.2)
    p.poner(t(229.4), colchon([midi(n) for n in (48, 55, 60, 64)], 5, ataque=1.5), 0.3)
    motivo(p, t(233.4), 1.0)     # la tarjeta final: la marca, otra vez
    acto_intimo(p, t(233.6), DUR - 1.2, [DO, FA, DO, SOL], bpm=76, vol=0.26, mayor=True)

    n = int(DUR * SR)
    l, r = reverberar(p.l[:n + SR]), reverberar(p.r[:n + SR])
    l, r = l[:n], r[:n]
    salida = np.minimum(1, (DUR - np.arange(n) / SR) / 2.5)
    estereo = np.stack([l * salida, r * salida], axis=1)
    return np.tanh(estereo / (np.max(np.abs(estereo)) * 0.62)) * 0.89


def main():
    datos = (componer() * 32767).astype('<i2')
    with wave.open(sys.argv[1], 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(datos.tobytes())
    print(f"{sys.argv[1]}: {len(datos) / SR:.1f} s")


if __name__ == '__main__':
    main()
