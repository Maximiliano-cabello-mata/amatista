"""Pista de voz de la presentación (5:00).   python3 voz.py <voz_mejorada.wav> <salida.wav>

1. Repara los empalmes del audio original (huecos digitales de 30–100 ms donde se unieron grabaciones):
   los rellena con ruido de sala de la misma grabación y les pone fundidos cortos, para que no se oiga el corte.
2. Abre las pausas con música (nuestra historia y las dos demostraciones). Dos de ellas caen justo en
   empalmes, así el cambio de grabación queda escondido detrás de la pausa.
3. Agrega PRE s al inicio y completa los 5:00.
"""
import sys
import wave

import numpy as np

PRE, DUR = 4.0, 300.0
PAUSAS = [(78.1, 16.0), (106.25, 18.0), (125.25, 20.0)]  # (segundo de la voz, duración)
EMPALMES = [21.09, 34.82, 55.15, 106.22, 125.21, 143.97, 166.94, 193.53]

with wave.open(sys.argv[1]) as w:
    sr = w.getframerate()
    voz = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float32)


def rampa(n, sube=True):
    r = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, n))
    return r if sube else r[::-1]


# Ruido de sala: la ventana de 0.4 s más tranquila que no sea silencio digital.
ventana = int(0.4 * sr)
mejor, ruido = 1e9, None
for i in range(0, len(voz) - ventana, ventana // 2):
    trozo = voz[i:i + ventana]
    rms = np.sqrt(np.mean(trozo ** 2))
    if 3 < rms < mejor and np.mean(np.abs(trozo) < 2) < 0.05:
        mejor, ruido = rms, trozo.copy()
print(f"ruido de sala: {20 * np.log10(mejor / 32768):.1f} dBFS")


def tono_de_sala(n):
    reps = int(np.ceil(n / len(ruido)))
    return np.tile(ruido, reps)[:n]


# 1. Empalmes: el hueco digital se llena con ruido de sala y los bordes se funden 12 ms.
f = int(0.012 * sr)
for t in EMPALMES:
    a, b = int((t - 0.15) * sr), int((t + 0.25) * sr)
    cero = np.abs(voz[a:b]) < 8
    # la racha más larga de casi-silencio digital en la ventana
    mejor_i, mejor_n, i = 0, 0, 0
    while i < len(cero):
        if cero[i]:
            j = i
            while j < len(cero) and cero[j]:
                j += 1
            if j - i > mejor_n:
                mejor_i, mejor_n = i, j - i
            i = j
        else:
            i += 1
    if mejor_n < int(0.005 * sr):
        print(f"empalme {t:7.2f} s: sin hueco digital")
        continue
    i0, i1 = a + mejor_i, a + mejor_i + mejor_n
    hueco = i1 - i0
    voz[i0 - f:i0] *= rampa(f, sube=False)
    voz[i1:i1 + f] *= rampa(f)
    relleno = tono_de_sala(hueco + 2 * f)
    relleno[:f] *= rampa(f)
    relleno[-f:] *= rampa(f, sube=False)
    voz[i0 - f:i1 + f] += relleno
    print(f"empalme {t:7.2f} s: hueco de {hueco / sr * 1000:.0f} ms reparado")

# 2. Pausas: la voz se corta (con fundido de 40 ms) en el punto exacto y vuelve después.
partes, desde = [], 0
g = int(0.04 * sr)
for t, d in PAUSAS:
    corte = int(t * sr)
    trozo = voz[desde:corte].copy()
    trozo[-g:] *= rampa(g, sube=False)
    if desde:
        trozo[:g] *= rampa(g)
    partes += [trozo, np.zeros(int(d * sr), np.float32)]
    desde = corte
ultimo = voz[desde:].copy()
ultimo[:g] *= rampa(g)
partes.append(ultimo)

pista = np.concatenate([np.zeros(int(PRE * sr), np.float32)] + partes)
pista = np.concatenate([pista, np.zeros(max(0, int(DUR * sr) - len(pista)), np.float32)])[:int(DUR * sr)]
with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(sr)
    w.writeframes(np.clip(pista, -32768, 32767).astype('<i2').tobytes())
print(f"{sys.argv[2]}: {len(pista) / sr:.1f} s")
