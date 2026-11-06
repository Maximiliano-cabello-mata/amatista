"""Pista de voz de la presentación: PRE s de silencio, la voz mejorada y un hueco de 52 s en el segundo 78.1
(ahí va «Nuestra historia»), hasta completar 5:00.   python3 voz.py <voz_mejorada.wav> <salida.wav>"""
import sys
import wave

import numpy as np

PRE, HUECO, D_HUECO, DUR = 4.0, 78.1, 52.0, 300.0

with wave.open(sys.argv[1]) as w:
    sr = w.getframerate()
    voz = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2')
corte = int(HUECO * sr)
pista = np.concatenate([np.zeros(int(PRE * sr), '<i2'), voz[:corte], np.zeros(int(D_HUECO * sr), '<i2'), voz[corte:]])
pista = np.concatenate([pista, np.zeros(max(0, int(DUR * sr) - len(pista)), '<i2')])[:int(DUR * sr)]
with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(sr)
    w.writeframes(pista.tobytes())
print(f"{sys.argv[2]}: {len(pista) / sr:.1f} s")
