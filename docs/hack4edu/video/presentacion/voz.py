"""Pista de voz de la presentación (versión final, 3:59).   python3 voz.py <voz_mejorada.wav> <salida.wav>

1. Repara los empalmes del audio original (huecos digitales de 30–100 ms donde se unieron grabaciones):
   los rellena con ruido de sala de la misma grabación y les pone fundidos cortos, para que no se oiga el corte.
2. Quita cuatro frases (CORTES, igual que frontend/presentacion/tiempos.js). Cada corte va en un silencio o en
   el borde exacto de una palabra, con fundidos de 15 ms, y deja una pausa natural con ruido de sala.
3. Agrega PRE s al inicio (apertura sin voz de 19 s y la gema) y la tarjeta final.
"""
import sys
import wave

import numpy as np

PRE, DUR = 22.0, 239.4  # 19 s de apertura sin voz + 3 s de la gema
PAUSAS = []
CORTES = [(21.14, 28.56, 0.30), (125.262, 128.62, 0.18), (166.986, 171.454, 0.12), (187.15, 192.64, 0.32)]
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

# 2. Cortes: se quitan las frases y queda una pausa natural de ruido de sala; bordes con fundido de 15 ms.
f2 = int(0.015 * sr)
partes, desde = [], 0
for a, b, r in CORTES:
    trozo = voz[desde:int(a * sr)].copy()
    trozo[-f2:] *= rampa(f2, sube=False)
    if desde:
        trozo[:f2] *= rampa(f2)
    sala = tono_de_sala(int(r * sr))
    sala[:f2] *= rampa(f2)
    sala[-f2:] *= rampa(f2, sube=False)
    partes += [trozo, sala]
    desde = int(b * sr)
ultimo = voz[desde:].copy()
ultimo[:f2] *= rampa(f2)
partes.append(ultimo)
print(f"voz editada: {sum(len(x) for x in partes) / sr:.2f} s")

pista = np.concatenate([np.zeros(int(PRE * sr), np.float32)] + partes)
pista = np.concatenate([pista, np.zeros(max(0, int(DUR * sr) - len(pista)), np.float32)])[:int(DUR * sr)]
with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(sr)
    w.writeframes(np.clip(pista, -32768, 32767).astype('<i2').tobytes())
print(f"{sys.argv[2]}: {len(pista) / sr:.1f} s")
