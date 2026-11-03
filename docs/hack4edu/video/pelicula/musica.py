"""Música y efectos de la película de Hack4Edu, sintetizados desde cero (sin muestras ni licencias de terceros).

    python3 musica.py <linea.json> <salida.wav>

Lee los tiempos de cada escena (render.cjs escribe linea.json) para que la música siga la historia:
  Acto I    piano íntimo → tensión con latidos y golpes graves en cada muro
  Título    subida y golpe cuando se arma la gema, acorde mayor que se abre
  Acto II   ritmo luminoso (arpegio, bajo y batería suave); destello cuando cae un muro
  Acto III  Geoda: campanas y atmósfera de asombro
  Final     el tema del inicio, ahora en mayor, y un último acorde
Es una pista de prueba: la versión final puede llevar otra música (y la voz).
"""
import json
import sys
import wave

import numpy as np

SR = 44100
rng = np.random.default_rng(7)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


class Pista:
    def __init__(self, segundos):
        self.l = np.zeros(int(segundos * SR) + SR * 4, dtype=np.float32)
        self.r = np.zeros_like(self.l)

    def poner(self, t, senal, vol=1.0, pan=0.0):
        i = int(t * SR)
        if i < 0 or i >= len(self.l):
            return
        n = min(len(senal), len(self.l) - i)
        izq, der = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        self.l[i:i + n] += senal[:n] * vol * izq
        self.r[i:i + n] += senal[:n] * vol * der


def tiempo(d):
    return np.arange(int(d * SR)) / SR


def envolvente(d, ataque=0.005, caida=1.0):
    t = tiempo(d)
    return np.minimum(1, t / ataque) * np.exp(-t / caida)


def piano(f, d=2.5, brillo=1.0):
    t = tiempo(d)
    s = sum((0.6 ** k) * brillo ** (k > 0) * np.sin(2 * np.pi * f * (k + 1) * t) * np.exp(-t * (1.2 + k * 0.9)) for k in range(5))
    return (s * np.minimum(1, t / 0.004)).astype(np.float32)


def campana(f, d=3.0):
    t = tiempo(d)
    s = np.sin(2 * np.pi * f * t + 2.2 * np.exp(-t * 2) * np.sin(2 * np.pi * f * 3.5 * t))
    return (s * np.exp(-t * 1.4) * np.minimum(1, t / 0.002)).astype(np.float32)


def colchon(freqs, d, ataque=1.5, salida=1.5):
    """Pad suave: armónicos tenues y dos voces un poco desafinadas."""
    t = tiempo(d)
    s = np.zeros_like(t)
    for f in freqs:
        for des in (-0.12, 0.12):
            for k in range(1, 6):
                s += np.sin(2 * np.pi * (f * (1 + des / 100)) * k * t + k) / (k ** 1.6)
    env = np.minimum(1, t / ataque) * np.minimum(1, (d - t) / salida)
    return (s * env / (len(freqs) * 6)).astype(np.float32)


def bombo(d=0.45, f0=120, f1=42):
    t = tiempo(d)
    fase = 2 * np.pi * np.cumsum(f1 + (f0 - f1) * np.exp(-t * 22)) / SR
    return (np.sin(fase) * np.exp(-t * 7)).astype(np.float32)


def ruido(d):
    return rng.standard_normal(int(d * SR)).astype(np.float32)


def caja(d=0.22):
    n = ruido(d)
    n = np.diff(n, prepend=0) * 0.6
    t = tiempo(d)
    return (n * np.exp(-t * 18) * 0.7 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25) * 0.4).astype(np.float32)


def platillo(d=0.06):
    n = np.diff(np.diff(ruido(d), prepend=0), prepend=0)
    return (n * np.exp(-tiempo(d) * 60) * 0.25).astype(np.float32)


def filtrar(senal, bajo=None, alto=None):
    """Filtro en frecuencia (FFT): deja pasar entre «alto» y «bajo» Hz."""
    espectro = np.fft.rfft(senal)
    f = np.fft.rfftfreq(len(senal), 1 / SR)
    m = np.ones_like(f)
    if bajo:
        m *= 1 / (1 + (f / bajo) ** 4)
    if alto:
        m *= 1 / (1 + (alto / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(espectro * m, len(senal)).astype(np.float32)


def soplido(d=1.1, sube=True):
    """Whoosh: ruido que barre de grave a agudo (o al revés)."""
    n = ruido(d)
    graves, agudos = filtrar(n, bajo=600), filtrar(n, alto=1800, bajo=9000)
    t = tiempo(d)
    k = t / d if sube else 1 - t / d
    env = np.sin(np.pi * t / d) ** 2
    return ((graves * (1 - k) + agudos * k) * env * 0.5).astype(np.float32)


def golpe(d=2.5):
    t = tiempo(d)
    grave = np.sin(2 * np.pi * np.cumsum(38 + 50 * np.exp(-t * 9)) / SR) * np.exp(-t * 2.2)
    cuerpo = filtrar(ruido(d), bajo=900) * np.exp(-t * 7) * 0.6
    return (grave + cuerpo).astype(np.float32)


def subida(d=2.0):
    t = tiempo(d)
    tono = np.sin(2 * np.pi * np.cumsum(180 * 2 ** (t * 2.2)) / SR) * (t / d) ** 2 * 0.25
    return (tono + soplido(d) * 0.8 * (t / d)).astype(np.float32)


# Acordes (notas MIDI)
LAm, FA, DO, SOL, REm, MIm = [57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62], [50, 57, 62], [52, 55, 59]
MI, DOsm, LA, SIm = [52, 56, 59], [49, 56, 61], [57, 61, 64], [47, 54, 59]


def acto_intimo(p, a, b, acordes, bpm=76, vol=0.32, mayor=False):
    """Piano en arpegio lento con colchón."""
    pulso = 60 / bpm
    compas = pulso * 4
    t, i = a, 0
    while t < b - 0.5:
        acorde = acordes[i % len(acordes)]
        p.poner(t, colchon([midi(n - 12) for n in acorde], min(compas + 1.5, b - t + 1.5)), vol * 0.55)
        for j, n in enumerate([acorde[0], acorde[1], acorde[2], acorde[1] + 12, acorde[2], acorde[1] + (12 if mayor else 0)]):
            tt = t + j * (compas / 6)
            if tt < b:
                p.poner(tt, piano(midi(n + 12), 2.4), vol * (0.75 if j else 1.0), pan=(-0.35 + 0.14 * j))
        t += compas
        i += 1


def acto_ritmo(p, a, b, acordes, bpm=100, vol=0.3, bateria=1.0, campanas=False):
    pulso = 60 / bpm
    compas = pulso * 4
    t, i = a, 0
    while t < b - 0.2:
        acorde = acordes[i % len(acordes)]
        fin = min(t + compas, b)
        p.poner(t, colchon([midi(n) for n in acorde], fin - t + 1.0, ataque=0.3, salida=0.8), vol * 0.5)
        for k in range(16):  # arpegio en semicorcheas
            tt = t + k * pulso / 4
            if tt >= b:
                break
            n = acorde[k % 3] + 12 * (1 + (k // 3) % 2)
            sonido = campana(midi(n), 0.6) if campanas else piano(midi(n), 0.5, brillo=0.8)
            p.poner(tt, sonido, vol * (0.42 if k % 4 else 0.6), pan=0.4 * np.sin(k))
        for k in range(4):  # bajo y batería
            tt = t + k * pulso
            if tt >= b:
                break
            p.poner(tt, piano(midi(acorde[0] - 24), pulso * 0.95) * 1.3, vol * 0.8)
            if bateria:
                if k in (0, 2):
                    p.poner(tt, bombo(), vol * 1.5 * bateria)
                if k in (1, 3):
                    p.poner(tt, caja(), vol * 0.55 * bateria)
                for m in range(2):
                    p.poner(tt + m * pulso / 2, platillo(), vol * 0.6 * bateria, pan=0.3)
        t += compas
        i += 1


def latidos(p, a, b, bpm=66, vol=0.6):
    t = a
    while t < b:
        p.poner(t, bombo(0.5, 90, 38), vol)
        p.poner(t + 0.22, bombo(0.4, 80, 36), vol * 0.6)
        t += 60 / bpm


def reverberar(senal, segundos=2.6, mezcla=0.28):
    n = int(segundos * SR)
    ir = rng.standard_normal(n).astype(np.float32) * np.exp(-np.arange(n) / SR * 3.2).astype(np.float32)
    ir = filtrar(ir, bajo=5000)
    tam = 1 << int(np.ceil(np.log2(len(senal) + n)))
    humedo = np.fft.irfft(np.fft.rfft(senal, tam) * np.fft.rfft(ir, tam), tam)[:len(senal)]
    humedo *= np.max(np.abs(senal)) / (np.max(np.abs(humedo)) + 1e-9)
    return (senal * (1 - mezcla) + humedo * mezcla).astype(np.float32)


def componer(linea):
    dur = linea['duracion']
    E = {e['id']: e for e in linea['escenas']}
    ini = lambda i: E[i]['inicio']  # noqa: E731
    fin = lambda i: E[i]['inicio'] + E[i]['d']  # noqa: E731
    p = Pista(dur)

    # ACTO I
    acto_intimo(p, 0.3, ini('muros'), [LAm, FA, DO, SOL], vol=0.2)
    p.poner(ini('muros'), colchon([midi(45), midi(52), midi(57)], fin('no_es_la_unica') - ini('muros') + 1, ataque=3), 0.35)
    latidos(p, ini('muros') + 0.5, ini('muros') + 19.5)
    for k in range(3):  # cada muro que sube
        p.poner(ini('muros') + 0.6 + k * 6.6 + 0.65, golpe(2.2), 0.55)
    acto_intimo(p, ini('no_es_la_unica') + 0.2, fin('no_es_la_unica') - 1.6, [REm, LAm, FA, MIm], bpm=70, vol=0.26)
    p.poner(ini('titulo') - 2.0, subida(2.0), 0.7)

    # TÍTULO
    p.poner(ini('titulo') + 2.0, golpe(3.5), 0.9)
    p.poner(ini('titulo') + 2.0, colchon([midi(n) for n in (48, 55, 62, 64, 67)], 7.5, ataque=0.05, salida=3), 0.5)
    for j, n in enumerate((72, 76, 79, 84)):
        p.poner(ini('titulo') + 2.3 + j * 0.18, campana(midi(n), 4), 0.22, pan=-0.3 + j * 0.2)

    # ACTO II
    acto_ritmo(p, ini('camino'), ini('aprender'), [DO, SOL, LAm, FA], vol=0.26, bateria=0.6)
    acto_ritmo(p, ini('aprender'), fin('sin_conexion') - 0.4, [DO, SOL, LAm, FA], vol=0.28, bateria=1.0)
    for momento in (ini('aprender') + 19.4, ini('sin_conexion') + 14.2):  # un muro cae
        for j, n in enumerate((79, 84, 88, 91)):
            p.poner(momento + j * 0.07, campana(midi(n), 2.2), 0.2, pan=-0.4 + j * 0.25)
    p.poner(ini('sin_conexion') + 4.2, soplido(0.8, sube=False), 0.6)  # se va la red

    # ACTO III
    p.poner(ini('pregunta'), colchon([midi(40), midi(47)], E['pregunta']['d'] + 1, ataque=1), 0.45)
    latidos(p, ini('pregunta') + 0.4, fin('pregunta') - 0.5, bpm=60, vol=0.55)
    p.poner(ini('pregunta') + 3.3, golpe(2.5), 0.6)
    acto_ritmo(p, ini('geoda'), fin('geoda'), [MI, DOsm, LA, SIm], bpm=90, vol=0.22, bateria=0, campanas=True)
    p.poner(ini('geoda'), colchon([midi(n) for n in (52, 59, 64, 68)], E['geoda']['d'] + 1, ataque=2), 0.32)
    acto_ritmo(p, ini('intercambio'), fin('plan'), [MI, DOsm, LA, SIm], bpm=90, vol=0.24, bateria=0.45, campanas=True)
    for j, n in enumerate((76, 80, 83, 88)):
        p.poner(ini('plan') + 10.4 + j * 0.07, campana(midi(n), 2.5), 0.24, pan=-0.4 + j * 0.25)

    # ACTO II (sigue): Blender y la web
    acto_ritmo(p, ini('blender'), fin('blender'), [DO, SOL, LAm, FA], bpm=100, vol=0.27, bateria=0.8)
    for j, n in enumerate((79, 84, 88)):
        p.poner(ini('blender') + 11.2 + j * 0.08, campana(midi(n), 2.0), 0.2)
    acto_ritmo(p, ini('web'), fin('web'), [FA, DO, SOL, LAm], bpm=100, vol=0.3, bateria=1.1)
    p.poner(ini('web'), colchon([midi(n) for n in (41, 48, 57, 60)], E['web']['d'] + 1, ataque=2.5), 0.4)

    # ACTO IV
    acto_intimo(p, ini('tres_semanas') + 0.2, ini('cierre') + 5.6, [DO, SOL, LAm, FA], bpm=80, vol=0.3, mayor=True)
    p.poner(ini('cierre') + 5.8, subida(1.0), 0.4)
    p.poner(ini('cierre') + 6.4, golpe(4), 0.85)
    p.poner(ini('cierre') + 6.4, colchon([midi(n) for n in (36, 48, 55, 64, 67, 71)], dur - ini('cierre') - 5.6, ataque=0.1, salida=4.5), 0.95)
    for j, n in enumerate((72, 76, 79, 83, 84)):
        p.poner(ini('cierre') + 6.6 + j * 0.22, campana(midi(n), 5), 0.32, pan=-0.4 + j * 0.2)

    # Efectos de transición
    for e in linea['escenas']:
        if e['entrada'] == 'barrido':
            p.poner(e['inicio'] - 0.55, soplido(1.1), 0.75)
        elif e['entrada'] == 'corte' and e['id'] != 'titulo':
            p.poner(e['inicio'], golpe(1.8), 0.45)
            p.poner(e['inicio'] - 0.6, soplido(0.6), 0.4)

    fin_total = int(dur * SR)
    l, r = reverberar(p.l[:fin_total + SR]), reverberar(p.r[:fin_total + SR])
    l, r = l[:fin_total], r[:fin_total]
    salida = np.minimum(1, (dur - np.arange(fin_total) / SR) / 2.0)  # se apaga en los últimos 2 s
    estereo = np.stack([l * salida, r * salida], axis=1)
    estereo = np.tanh(estereo / (np.max(np.abs(estereo)) * 0.62)) * 0.89  # compresión suave y techo
    return estereo


def main():
    linea = json.load(open(sys.argv[1], encoding='utf-8'))
    datos = (componer(linea) * 32767).astype('<i2')
    with wave.open(sys.argv[2], 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(datos.tobytes())
    print(f"{sys.argv[2]}: {len(datos) / SR:.1f} s")


if __name__ == '__main__':
    main()
