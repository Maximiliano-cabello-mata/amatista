import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
R = json.load(open('datos.json')); S = json.load(open('simulacion.json')); A = json.load(open('auditoria.json'))
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 11, 'axes.spines.top': False, 'axes.spines.right': False, 'axes.grid': True, 'grid.alpha': .25, 'grid.linewidth': .6})
MORADO = '#7d3c98'; GRIS = '#8a8a96'; AMBAR = '#d68910'; VERDE = '#1e8449'; ROJO = '#c0392b'

# 1. ¿Qué pasa en el siguiente intento?
fig, ax = plt.subplots(1, 2, figsize=(11, 4.2), sharey=True)
for a_, (k, titulo, orden, n) in zip(ax, (('assist_siguiente_tras', 'ASSISTments 2009 (4 151 alumnos)', ['acierto', 'error sin pista', 'pista parcial', 'pista hasta la respuesta'], None),
                                          ('ct_siguiente_tras', 'Cognitive Tutor (587 alumnos)', ['acierto', 'error sin pista', 'con pista'], None))):
    v = [R[k][o][0] * 100 for o in orden]; c = [VERDE, GRIS, AMBAR, ROJO][:len(orden)]
    b = a_.bar(range(len(orden)), v, color=c, width=.62)
    a_.set_xticks(range(len(orden)), [o.replace(' hasta', '\nhasta').replace(' sin', '\nsin') for o in orden], fontsize=9.5)
    a_.bar_label(b, fmt='%.0f %%', padding=3); a_.set_title(titulo, fontsize=11.5); a_.set_ylim(0, 100)
ax[0].set_ylabel('% de acierto en el SIGUIENTE intento\nde la misma habilidad')
fig.suptitle('Recibir la respuesta no es aprenderla', fontsize=13.5, fontweight='bold', x=0.01, ha='left')
fig.tight_layout(); fig.savefig('graficas/1_siguiente_intento.png', dpi=150)

# 2. Olvido por tiempo sin practicar
fig, ax = plt.subplots(figsize=(7.5, 4))
h = R['ct_acierto_por_hueco']; k = list(h); v = [h[x][0] * 100 for x in k]
ax.plot(k, v, marker='o', color=MORADO, lw=2.4); [ax.annotate(f'{y:.0f} %\n(n={h[x][1]})', (i, y), textcoords='offset points', xytext=(0, 9), ha='center', fontsize=9) for i, (x, y) in enumerate(zip(k, v))]
ax.set_ylim(45, 70); ax.set_ylabel('% de acierto al volver'); ax.set_xlabel('Tiempo desde la última práctica de esa habilidad')
ax.set_title('Lo que no se repasa se pierde (Cognitive Tutor)', fontsize=13, fontweight='bold', loc='left')
fig.tight_layout(); fig.savefig('graficas/2_olvido.png', dpi=150)

# 3. Repeticiones en nuestro plan vs las que pide el modelo
fig, ax = plt.subplots(figsize=(10, 6.4))
hab = sorted(A['habilidades'].items(), key=lambda x: -x[1]); n = [x[1] * 2 for x in hab]
ax.barh([x[0].replace('bl-', '') for x in hab], n, color=MORADO)
for val, et, col in ((6, 'la mitad lo domina: 5–7', AMBAR), (13, '80 %: 11–15', '#b9770e'), (24, '95 %: 20–28', ROJO)):
    ax.axvline(val, color=col, ls='--', lw=1.6); ax.text(val + .3, len(hab) - .6, et, color=col, fontsize=9.5)
ax.invert_yaxis(); ax.set_xlabel('Oportunidades de practicar cada habilidad en todo el plan (prácticas × 2 misiones, generoso)\nLíneas: oportunidades que pide el modelo ajustado a datos reales para alguien que empieza de cero')
ax.set_title('Casi ninguna habilidad del plan se practica lo suficiente', fontsize=13, fontweight='bold', loc='left')
ax.tick_params(axis='y', labelsize=8.5); fig.tight_layout(); fig.savefig('graficas/3_repeticiones.png', dpi=150)

# 4. Simulación
fig, ax = plt.subplots(1, 2, figsize=(11, 4.4), sharey=True)
for a_, perfil in zip(ax, ('novato', 'con experiencia')):
    d = S[perfil]; k = list(d); m = [d[x]['domina_dia_14_mediana'] for x in k]
    lo = [d[x]['domina_dia_14_mediana'] - d[x]['domina_p5'] for x in k]; hi = [d[x]['domina_p95'] - d[x]['domina_dia_14_mediana'] for x in k]
    b = a_.bar(range(len(k)), m, yerr=[lo, hi], color=[GRIS, AMBAR, '#a569bd', MORADO], capsize=5, width=.62)
    a_.bar_label(b, fmt='%.0f %%', padding=14, fontsize=10)
    a_.set_xticks(range(len(k)), [x.replace('B guía que se desvanece', 'B guía que\nse desvanece').replace('D + repaso espaciado', 'D + repaso\nespaciado').replace('A actual', 'A actual\n(Motor 4)') for x in k], fontsize=9.5)
    a_.set_title(f'Alumno {perfil}', fontsize=11.5); a_.set_ylim(0, 100)
ax[0].set_ylabel('% de habilidades dominadas sin ayuda\na los 14 días (mediana y 90 %)')
fig.suptitle('Simulación con parámetros ajustados a datos reales (no son alumnos reales)', fontsize=12.5, fontweight='bold', x=0.01, ha='left')
fig.tight_layout(); fig.savefig('graficas/4_simulacion.png', dpi=150)
print('ok')
