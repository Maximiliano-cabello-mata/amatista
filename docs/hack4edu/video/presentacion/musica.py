"""Música de la presentación de Hack4Edu (5:00), sintetizada desde cero con las piezas de ../pelicula/musica.py.

    python3 musica.py <salida.wav>

Sigue la misma línea de tiempo que frontend/presentacion/tiempos.js (PRE = 4 s y tres pausas con música:
nuestra historia, la demostración web y la del add-on). Va por debajo de la voz; en las pausas se oye más.
  Problema   piano íntimo en menor; latidos graves cuando la red colapsa
  Historia   piano más presente (no hay voz); sube hacia «Por eso…»
  Amatista   golpe y acorde mayor cuando aparece la gema
  Solución   arpegio luminoso con batería suave
  Geoda      campanas y un latido sincronizado con el corazón que late en pantalla
  Cierre     el tema en mayor, golpe en «hasta hoy» y acorde final
"""
import os
import sys
import wave

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'pelicula'))
from musica import (DO, DOsm, FA, LA, LAm, MI, MIm, REm, SIm, SOL, Pista, acto_intimo, acto_ritmo, campana,  # noqa: E402
                    colchon, golpe, latidos, midi, reverberar, soplido, subida)

SR = 44100
PRE, DUR = 4.0, 300.0
PAUSAS = [('historia', 78.1, 16.0), ('demo-web', 106.25, 18.0), ('demo-addon', 125.25, 20.0)]


def t_voz(v):
    """Segundo del video en que suena el segundo v de la voz."""
    return PRE + v + sum(d for _i, en, d in PAUSAS if v >= en)


def t_pausa(nombre):
    """Segundo del video en que empieza una pausa."""
    en = next(e for i, e, _d in PAUSAS if i == nombre)
    return PRE + en + sum(d for _i, e, d in PAUSAS if e < en)


def acorde_mayor(p, t, notas, d, vol=0.6):
    p.poner(t, golpe(3.0), 0.7 * vol)
    p.poner(t, colchon([midi(n) for n in notas], d, ataque=0.05, salida=3), vol)
    for j, n in enumerate((72, 76, 79, 84)):
        p.poner(t + 0.25 + j * 0.18, campana(midi(n), 4), 0.22 * vol / 0.6, pan=-0.3 + j * 0.2)


def componer():
    p = Pista(DUR)

    # Apertura: la gema se arma
    p.poner(0.2, colchon([midi(n) for n in (45, 52, 57, 64)], 12, ataque=2.5), 0.4)
    p.poner(1.6, subida(1.8), 0.45)
    acorde_mayor(p, 3.4, (48, 55, 62, 64, 67), 8, vol=0.45)

    # 01 · El problema
    acto_intimo(p, t_voz(8.1), t_voz(60.2), [LAm, FA, DO, SOL], bpm=72, vol=0.2)
    p.poner(t_voz(60.2), colchon([midi(45), midi(52), midi(57)], 18.5, ataque=3), 0.3)
    latidos(p, t_voz(67.1), t_voz(78.0), bpm=66, vol=0.45)
    p.poner(t_voz(67.1), golpe(2.2), 0.35)

    # Nuestra historia (16 s, sin voz): piano íntimo que sube hacia «Por eso…»
    h0 = t_pausa('historia')
    p.poner(h0 - 0.55, soplido(1.1), 0.6)
    acto_intimo(p, h0 + 0.3, h0 + 12.6, [REm, LAm, FA, MIm], bpm=84, vol=0.36)
    p.poner(h0 + 12.4, colchon([midi(n) for n in (50, 57, 62, 65)], 4.0, ataque=1.2), 0.45)
    p.poner(h0 + 13.4, campana(midi(81), 2.5), 0.2)
    p.poner(h0 + 14.0, subida(2.0), 0.6)
    fin_historia = h0 + 16.0
    # 02 · La solución
    p.poner(fin_historia - 0.55, soplido(1.1), 0.7)
    acorde_mayor(p, t_voz(79.9), (36, 48, 55, 64, 67), 9, vol=0.55)
    acto_ritmo(p, t_voz(90.2), t_pausa('demo-web'), [DO, SOL, LAm, FA], bpm=96, vol=0.2, bateria=0.35)

    # Demostración web (18 s): ritmo luminoso; una campana en cada cambio de toma
    d0 = t_pausa('demo-web')
    p.poner(d0 - 0.55, soplido(1.1), 0.6)
    acto_ritmo(p, d0, d0 + 18.0, [FA, DO, SOL, LAm], bpm=104, vol=0.3, bateria=0.8)
    for k, a in enumerate((0.7, 3.8, 6.7, 9.9, 14.1)):
        p.poner(d0 + a, campana(midi((79, 81, 84, 86, 88)[k]), 1.6), 0.2, pan=-0.3 + 0.15 * k)
    p.poner(d0 + 18.0 - 0.55, soplido(1.1), 0.6)
    acto_ritmo(p, t_voz(106.25), t_pausa('demo-addon'), [DO, SOL, LAm, FA], bpm=96, vol=0.2, bateria=0.35)

    # Demostración del add-on (20 s): cada pieza revisada suena; acorde de logro al terminar la práctica
    a0 = t_pausa('demo-addon')
    p.poner(a0 - 0.55, soplido(1.1), 0.6)
    acto_ritmo(p, a0, a0 + 15.6, [MI, DOsm, LA, SIm], bpm=104, vol=0.28, bateria=0.7, campanas=True)
    t = 0.7
    for nombre, d in [('i', 1.5), ('p', 1.7), ('0', 1.0), ('1', 1.0), ('2', 0.9), ('p', 1.7)] + [('x', 0.65)] * 7 + [('x', 0.8), ('g', 1.5)]:
        if nombre not in ('i', 'p'):
            p.poner(a0 + t, campana(midi(88), 0.5), 0.12, pan=0.3)
        t += d
    acorde_mayor(p, a0 + 15.6, (40, 52, 59, 64, 68, 71), 4.8, vol=0.55)
    p.poner(a0 + 20.0 - 0.55, soplido(1.1), 0.6)

    # Geoda: campanas y el latido del corazón (lub-dub cada 1.1 s desde que se nombra)
    acto_ritmo(p, t_voz(125.25), t_voz(144.1), [MI, DOsm, LA, SIm], bpm=90, vol=0.17, bateria=0, campanas=True)
    p.poner(t_voz(125.25), colchon([midi(n) for n in (52, 59, 64, 68)], 19.5, ataque=2), 0.26)
    latidos(p, t_voz(130.24), t_voz(144.0), bpm=60 / 1.1, vol=0.42)

    # 03 · Telemetría y sincronización
    p.poner(t_voz(144.1) - 0.55, soplido(1.1), 0.6)
    acto_ritmo(p, t_voz(144.1), t_voz(177.0), [MI, DOsm, LA, SIm], bpm=96, vol=0.19, bateria=0.4, campanas=True)

    # 04 · Inclusión y escala
    p.poner(t_voz(177.0) - 0.55, soplido(1.1), 0.6)
    acto_ritmo(p, t_voz(177.0), t_voz(223.6), [FA, DO, SOL, LAm], bpm=96, vol=0.21, bateria=0.55)

    # Cierre: «hasta hoy» y la tarjeta final
    acto_intimo(p, t_voz(223.6), t_voz(228.3), [DO, SOL], bpm=80, vol=0.24, mayor=True)
    p.poner(t_voz(227.6), subida(0.8), 0.4)
    p.poner(t_voz(228.42), golpe(4), 0.6)
    p.poner(t_voz(228.42), colchon([midi(n) for n in (36, 48, 55, 64, 67, 71)], DUR - t_voz(228.42), ataque=0.1, salida=5), 0.7)
    for j, n in enumerate((72, 76, 79, 83, 84)):
        p.poner(t_voz(228.6) + j * 0.22, campana(midi(n), 5), 0.26, pan=-0.4 + j * 0.2)
    acto_intimo(p, t_voz(234.0), DUR - 1.5, [DO, FA, DO, SOL], bpm=76, vol=0.26, mayor=True)

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
