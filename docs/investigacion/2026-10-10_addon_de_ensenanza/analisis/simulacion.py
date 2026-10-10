"""Simulación de alumnos (modelo BKT ajustado a datos reales + olvido) para comparar 4 diseños del add-on.

Lo que viene de datos: T, G, S por habilidad (ajuste BKT a ASSISTments y Cognitive Tutor) y que el
acierto cae tras más de un día sin practicar (Cognitive Tutor). Lo que es supuesto (se barre en rangos):
cuánto menos se aprende siguiendo teclas dictadas, cuánto ayuda una demostración, cuánto se olvida por
día y cuánto frena el olvido una recuperación exitosa. Cada corrida sortea esos supuestos de nuevo.
"""
import json, sys
import numpy as np
R = json.load(open('datos.json')); AUD = json.load(open('auditoria.json'))
TS = np.array([h['T'] for h in R['assist_bkt']['habilidades'] + R['ct_bkt']['habilidades']])
GS = np.array([h['G'] for h in R['assist_bkt']['habilidades'] + R['ct_bkt']['habilidades']])
SS = np.array([h['S'] for h in R['assist_bkt']['habilidades'] + R['ct_bkt']['habilidades']])
# Oportunidades reales por habilidad en el plan: prácticas que la usan × 2 misiones (generoso)
USOS = np.array(list(AUD['habilidades'].values())) * 2
rng = np.random.default_rng(10)
N_CORRIDAS, N_ALUMNOS = 400, 300

def correr(perfil_l0, supuestos):
    g, w, f, r = supuestos  # aprendizaje al dictar teclas, ayuda de la demo, olvido diario, freno del olvido
    H = len(USOS); res = {}
    T = rng.choice(TS, H); G = rng.choice(GS, H); S = rng.choice(SS, H)
    for diseno in ('A actual', 'B guía que se desvanece', 'C + dominio', 'D + repaso espaciado'):
        sabe = rng.random((N_ALUMNOS, H)) < perfil_l0
        olvido = np.full((N_ALUMNOS, H), f)
        est = np.full((N_ALUMNOS, H), 0.3)  # lo que el tutor cree (BKT)
        guiadas = np.zeros((N_ALUMNOS, H)); total = np.zeros((N_ALUMNOS, H))
        def oportunidad(m, tipo):
            nonlocal sabe, est
            if tipo == 'dictada':
                aprende = rng.random(sabe.shape) < T * g
                guiadas[m] += 1
            else:
                k = T * (w if tipo == 'demo' else 1.0)
                aprende = rng.random(sabe.shape) < k
                ok = np.where(sabe, rng.random(sabe.shape) > S, rng.random(sabe.shape) < G)
                post = np.where(ok, est * (1 - S) / (est * (1 - S) + (1 - est) * G), est * S / (est * S + (1 - est) * (1 - G)))
                est = np.where(m, post + (1 - post) * T, est)
                if tipo == 'repaso':
                    olvido[m & sabe & ok] *= r  # recuperar con éxito frena el olvido
                if diseno != 'A actual': guiadas[m & ~ok] += 0.5  # pidió pista
            sabe = sabe | (aprende & m); total[m] += 1
        def dias(n):
            nonlocal sabe
            for _ in range(n):
                sabe = sabe & ~(rng.random(sabe.shape) < olvido)
        todos = np.ones((N_ALUMNOS, H), bool)
        maxu = USOS.max()
        for i in range(maxu):
            m = todos & (USOS[None, :] > i)
            if diseno == 'A actual': oportunidad(m, 'dictada')
            else:
                if i == 0: oportunidad(m, 'demo')
                else:
                    if diseno != 'B guía que se desvanece': m = m & (est < 0.95)  # salta lo que ya domina
                    oportunidad(m, 'propia')
            dias(1)
        if diseno in ('C + dominio', 'D + repaso espaciado'):
            for i in range(10):  # variaciones cortas hasta dominar (tope 10)
                m = est < 0.95
                if not m.any(): break
                oportunidad(m, 'propia')
        if diseno == 'D + repaso espaciado':
            for gap in (1, 2, 4):  # repasos a los días 1, 3 y 7
                dias(gap); oportunidad(todos, 'repaso')
            dias(7)
        else:
            dias(14)
        res[diseno] = {'domina_dia_14': float(sabe.mean()), 'oportunidades': float(total.mean()), 'guiadas': float(guiadas.mean())}
    return res

salida = {}
for perfil, l0 in (('novato', 0.05), ('con experiencia', 0.8)):
    corridas = []
    for _ in range(N_CORRIDAS):
        sup = (rng.uniform(0.3, 0.9), rng.uniform(1.0, 1.5), rng.uniform(0.01, 0.05), rng.uniform(0.4, 0.8))
        corridas.append(correr(l0, sup))
    resumen = {}
    for d in corridas[0]:
        v = np.array([c[d]['domina_dia_14'] for c in corridas]); o = np.array([c[d]['oportunidades'] for c in corridas]); gd = np.array([c[d]['guiadas'] for c in corridas])
        resumen[d] = {'domina_dia_14_mediana': round(float(np.median(v)) * 100, 1), 'domina_p5': round(float(np.percentile(v, 5)) * 100, 1), 'domina_p95': round(float(np.percentile(v, 95)) * 100, 1),
                      'oportunidades_por_habilidad': round(float(np.median(o)), 1), 'pasos_guiados_por_habilidad': round(float(np.median(gd)), 1)}
    a = np.array([c['A actual']['domina_dia_14'] for c in corridas])
    for d in corridas[0]:
        resumen[d]['gana_a_A_en_pct_de_corridas'] = round(float(np.mean(np.array([c[d]['domina_dia_14'] for c in corridas]) > a)) * 100, 1)
    salida[perfil] = resumen
    print(perfil); [print('  ', d, r) for d, r in resumen.items()]
salida['nota'] = 'Simulación: no son alumnos reales. %d corridas × %d alumnos × %d habilidades por perfil.' % (N_CORRIDAS, N_ALUMNOS, len(USOS))
json.dump(salida, open('simulacion.json', 'w'), ensure_ascii=False, indent=1)
