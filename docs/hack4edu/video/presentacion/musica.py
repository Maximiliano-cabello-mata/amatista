"""Música de la presentación de Hack4Edu (5:00), sintetizada desde cero con las piezas de ../pelicula/musica.py.

    python3 musica.py <salida.wav>

Sigue la misma línea de tiempo que frontend/presentacion/tiempos.js (PRE = 4 s, historia de 52 s en el
segundo 78.1 de la voz). Va por debajo de la voz; donde no hay voz (la historia y el final) se oye más.
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
PRE, HUECO, D_HUECO, DUR = 4.0, 78.1, 52.0, 300.0


def t_voz(v):
    """Segundo del video en que suena el segundo v de la voz."""
    return PRE + v + (D_HUECO if v >= HUECO else 0)


def acorde_mayor(p, t, notas, d, vol=0.6):
    p.poner(t, golpe(3.0), 0.7 * vol)
    p.poner(t, colchon([midi(n) for n in notas], d, ataque=0.05, salida=3), vol)
    for j, n in enumerate((72, 76, 79, 84)):
        p.poner(t + 0.25 + j * 0.18, campana(midi(n), 4), 0.22 * vol / 0.6, pan=-0.3 + j * 0.2)


def componer():
    p = Pista(DUR)
    historia, fin_historia = t_voz(HUECO) - D_HUECO, t_voz(HUECO)

    # Apertura: la gema se arma
    p.poner(0.2, colchon([midi(n) for n in (45, 52, 57, 64)], 12, ataque=2.5), 0.4)
    p.poner(1.6, subida(1.8), 0.45)
    acorde_mayor(p, 3.4, (48, 55, 62, 64, 67), 8, vol=0.45)

    # 01 · El problema
    acto_intimo(p, t_voz(8.1), t_voz(60.2), [LAm, FA, DO, SOL], bpm=72, vol=0.2)
    p.poner(t_voz(60.2), colchon([midi(45), midi(52), midi(57)], 18.5, ataque=3), 0.3)
    latidos(p, t_voz(67.1), t_voz(78.0), bpm=66, vol=0.45)
    p.poner(t_voz(67.1), golpe(2.2), 0.35)

    # Nuestra historia (sin voz)
    p.poner(historia - 0.55, soplido(1.1), 0.6)
    acto_intimo(p, historia + 0.4, fin_historia - 6.0, [REm, LAm, FA, MIm], bpm=70, vol=0.34)
    p.poner(fin_historia - 6.0, colchon([midi(n) for n in (50, 57, 62, 65)], 6.5, ataque=2), 0.45)
    p.poner(fin_historia - 2.4, subida(2.4), 0.6)

    # 02 · La solución
    p.poner(fin_historia - 0.55, soplido(1.1), 0.7)
    acorde_mayor(p, t_voz(79.9), (36, 48, 55, 64, 67), 9, vol=0.55)
    acto_ritmo(p, t_voz(90.2), t_voz(125.3), [DO, SOL, LAm, FA], bpm=96, vol=0.2, bateria=0.35)
    # Geoda: campanas y el latido del corazón (lub-dub cada 1.1 s desde que se nombra)
    acto_ritmo(p, t_voz(125.3), t_voz(144.1), [MI, DOsm, LA, SIm], bpm=90, vol=0.17, bateria=0, campanas=True)
    p.poner(t_voz(125.3), colchon([midi(n) for n in (52, 59, 64, 68)], 19.5, ataque=2), 0.26)
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
