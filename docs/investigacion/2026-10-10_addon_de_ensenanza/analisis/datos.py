"""Exploración y modelado de datos reales de tutores: ASSISTments 2009-2010 y Cognitive Tutor (KDD)."""
import json, sys, time
import numpy as np, pandas as pd
from sklearn.metrics import roc_auc_score
from sklearn.linear_model import LogisticRegression
D = sys.argv[1]; OUT = sys.argv[2]
R = {}
t0 = time.time()
# ---------------- ASSISTments ----------------
a = pd.read_csv(D + '/as.csv', encoding='latin1', low_memory=False,
                usecols=['order_id', 'user_id', 'skill_name', 'correct', 'original', 'hint_count', 'bottom_hint', 'attempt_count', 'ms_first_response'])
a = a[(a.original == 1) & a.skill_name.notna()].sort_values(['user_id', 'skill_name', 'order_id'])
a['correct'] = a.correct.astype(int)
a['op'] = a.groupby(['user_id', 'skill_name']).cumcount() + 1
a['sig'] = a.groupby(['user_id', 'skill_name']).correct.shift(-1)
R['assist_filas'] = int(len(a)); R['assist_alumnos'] = int(a.user_id.nunique()); R['assist_habilidades'] = int(a.skill_name.nunique())
# curva de aprendizaje
curva = a[a.op <= 20].groupby('op').correct.agg(['mean', 'count'])
R['assist_curva'] = {int(k): [round(1 - v['mean'], 4), int(v['count'])] for k, v in curva.iterrows()}
x = np.log(curva.index.values); y = np.log(1 - curva['mean'].values)
b, la = np.polyfit(x, y, 1); R['assist_ley_potencia'] = {'a': round(float(np.exp(la)), 4), 'b': round(float(-b), 4)}
# dominio: 3 seguidas (criterio de los skill builders de ASSISTments)
def hasta_3(s):
    racha = 0
    for i, c in enumerate(s, 1):
        racha = racha + 1 if c else 0
        if racha == 3: return i
    return np.nan
dom = a.groupby(['user_id', 'skill_name']).correct.apply(lambda s: hasta_3(s.values))
R['assist_dominio_3_seguidas'] = {'secuencias': int(len(dom)), 'pct_lo_logran': round(float(dom.notna().mean() * 100), 1),
                                 'mediana_intentos': float(dom.median()), 'p75': float(dom.quantile(.75)), 'p90': float(dom.quantile(.9))}
# pistas → siguiente oportunidad
a['caso'] = np.select([a.correct == 1, (a.correct == 0) & (a.hint_count == 0), (a.hint_count > 0) & (a.bottom_hint != 1), a.bottom_hint == 1],
                      ['acierto', 'error sin pista', 'pista parcial', 'pista hasta la respuesta'], 'otro')
sig = a[a.sig.notna()].groupby('caso').sig.agg(['mean', 'count'])
R['assist_siguiente_tras'] = {k: [round(v['mean'], 4), int(v['count'])] for k, v in sig.iterrows()}
# alumnos que abusan de la pista final
pa = a.groupby('user_id').agg(n=('correct', 'size'), fondo=('bottom_hint', lambda s: (s == 1).mean()), acierto=('correct', 'mean'))
pa = pa[pa.n >= 30]
bins = pd.cut(pa.fondo, [-0.01, 0.05, 0.15, 0.3, 1.0], labels=['<5 %', '5–15 %', '15–30 %', '>30 %'])
R['assist_abuso_pistas'] = {str(k): [round(v, 4), int(c)] for k, v, c in zip(*[pa.groupby(bins, observed=True).acierto.mean().index, pa.groupby(bins, observed=True).acierto.mean().values, pa.groupby(bins, observed=True).size().values])}
# ganancia por oportunidad (pendiente) según uso de la pista final
def pendiente(df):
    df = df[df.op <= 10]
    if df.op.nunique() < 4: return np.nan
    return np.polyfit(df.op, df.correct, 1)[0]
a2 = a.merge(bins.rename('grupo'), left_on='user_id', right_index=True)
pend = a2.groupby('grupo', observed=True).apply(lambda g: pendiente(g.groupby('op').correct.mean().reset_index()))
R['assist_pendiente_por_grupo'] = {str(k): round(float(v), 4) for k, v in pend.items()}
print('assist listo', round(time.time() - t0, 1))

# ---------------- BKT por fuerza bruta (Baker et al. 2010) ----------------
G = np.array(np.meshgrid(np.linspace(0.05, 0.95, 10), np.linspace(0.02, 0.5, 13), np.linspace(0.05, 0.35, 7), np.linspace(0.05, 0.35, 7), indexing='ij')).reshape(4, -1).T  # L0, T, G, S
def secuencias(df, usuario, hab, corr, cap=40, maxseq=3000, rng=np.random.default_rng(1)):
    seqs = [g[corr].values[:cap] for _, g in df.groupby(usuario)]
    if len(seqs) > maxseq: seqs = [seqs[i] for i in rng.choice(len(seqs), maxseq, replace=False)]
    L = max(len(s) for s in seqs); M = np.full((len(seqs), L), -1, dtype=np.int8)
    for i, s in enumerate(seqs): M[i, :len(s)] = s
    return M
def loglik(M, P):
    L0, T, Gs, S = [P[:, i][:, None] for i in range(4)]
    pl = np.repeat(L0, M.shape[0], axis=1); ll = np.zeros_like(pl)
    for t in range(M.shape[1]):
        o = M[:, t][None, :]; v = o >= 0
        pc = pl * (1 - S) + (1 - pl) * Gs
        pr = np.where(o == 1, pc, 1 - pc)
        ll += np.where(v, np.log(np.clip(pr, 1e-9, 1)), 0)
        post = np.where(o == 1, pl * (1 - S) / pc, pl * S / np.clip(1 - pc, 1e-9, 1))
        pl = np.where(v, post + (1 - post) * T, pl)
    return ll.sum(axis=1)
def predecir(M, p):
    L0, T, Gs, S = p; pl = np.full(M.shape[0], L0); pred = []; obs = []
    for t in range(M.shape[1]):
        o = M[:, t]; v = o >= 0
        pc = pl * (1 - S) + (1 - pl) * Gs
        pred += list(pc[v]); obs += list(o[v])
        post = np.where(o == 1, pl * (1 - S) / pc, pl * S / np.clip(1 - pc, 1e-9, 1))
        pl = np.where(v, post + (1 - post) * T, pl)
    return np.array(pred), np.array(obs)
def ajustar(df, usuario, hab, corr, nombre, top=30):
    filas = []; preds = []; obs = []; base = []
    cuenta = df.groupby(hab)[usuario].nunique().sort_values(ascending=False)
    for h in cuenta.index[:top]:
        d = df[df[hab] == h]
        usuarios = d[usuario].unique(); rng = np.random.default_rng(2); rng.shuffle(usuarios)
        prueba = set(usuarios[: max(1, len(usuarios) // 5)])
        Mtr = secuencias(d[~d[usuario].isin(prueba)], usuario, hab, corr); Mte = secuencias(d[d[usuario].isin(prueba)], usuario, hab, corr)
        lls = np.zeros(len(G))
        for i in range(0, len(G), 1500): lls[i:i + 1500] = loglik(Mtr, G[i:i + 1500])
        p = G[int(np.argmax(lls))]
        pr, ob = predecir(Mte, p); preds += list(pr); obs += list(ob)
        media = (Mtr[Mtr >= 0]).mean(); base += [media] * len(ob)
        n95 = np.log(0.05 / max(1e-6, 1 - p[0])) / np.log(1 - p[1]) if p[0] < 0.95 else 0
        filas.append({'habilidad': str(h), 'alumnos': int(cuenta[h]), 'L0': round(float(p[0]), 3), 'T': round(float(p[1]), 3), 'G': round(float(p[2]), 3), 'S': round(float(p[3]), 3), 'oportunidades_95': round(float(max(0, n95)), 1)})
    auc = roc_auc_score(obs, preds); auc_b = roc_auc_score(obs, base)
    t = pd.DataFrame(filas)
    R[nombre + '_bkt'] = {'habilidades': filas, 'auc_bkt': round(float(auc), 4), 'auc_media_por_habilidad': round(float(auc_b), 4),
                          'mediana': {k: round(float(t[k].median()), 3) for k in ('L0', 'T', 'G', 'S', 'oportunidades_95')},
                          'p25_p75_T': [round(float(t['T'].quantile(.25)), 3), round(float(t['T'].quantile(.75)), 3)],
                          'p25_p75_n95': [round(float(t['oportunidades_95'].quantile(.25)), 1), round(float(t['oportunidades_95'].quantile(.75)), 1)]}
    print(nombre, 'bkt listo', round(time.time() - t0, 1), R[nombre + '_bkt']['mediana'], auc, auc_b)
ajustar(a, 'user_id', 'skill_name', 'correct', 'assist')

# ---------------- Cognitive Tutor ----------------
c = pd.read_csv(D + '/ct.csv', low_memory=False)
c = c.rename(columns={'Anon Student Id': 'u', 'KC(Default)': 'kc', 'Correct First Attempt': 'ok', 'Hints': 'pistas', 'Step Start Time': 't'})
c = c[c.kc.notna()].copy(); c['t'] = pd.to_datetime(c.t, errors='coerce'); c = c[c.t.notna()].sort_values(['u', 'kc', 't'])
c['ok'] = c.ok.astype(int); c['op'] = c.groupby(['u', 'kc']).cumcount() + 1
R['ct_filas'] = int(len(c)); R['ct_alumnos'] = int(c.u.nunique()); R['ct_habilidades'] = int(c.kc.nunique())
c['gap_h'] = c.groupby(['u', 'kc']).t.diff().dt.total_seconds() / 3600
cc = c[c.gap_h.notna()].copy()
cc['hueco'] = pd.cut(cc.gap_h, [-1, 5 / 60, 1, 24, 24 * 7, 1e9], labels=['<5 min', '5–60 min', '1–24 h', '1–7 días', '>7 días'])
R['ct_acierto_por_hueco'] = {str(k): [round(v, 4), int(n)] for k, v, n in zip(cc.groupby('hueco', observed=True).ok.mean().index, cc.groupby('hueco', observed=True).ok.mean().values, cc.groupby('hueco', observed=True).size().values)}
X = pd.get_dummies(cc.hueco, drop_first=True).astype(float); X['log_op'] = np.log(cc.op); X['ok_prev'] = cc.groupby(['u', 'kc']).ok.shift(1).fillna(0).values
lr = LogisticRegression(max_iter=1000).fit(X, cc.ok)
R['ct_regresion_hueco'] = {k: round(float(v), 4) for k, v in zip(X.columns, lr.coef_[0])}
R['ct_regresion_hueco']['nota'] = 'logit; categoría base <5 min; controla número de oportunidad y acierto anterior'
c['sig'] = c.groupby(['u', 'kc']).ok.shift(-1)
c['caso'] = np.select([c.ok == 1, (c.ok == 0) & (c.pistas == 0), c.pistas > 0], ['acierto', 'error sin pista', 'con pista'], 'otro')
s2 = c[c.sig.notna()].groupby('caso').sig.agg(['mean', 'count'])
R['ct_siguiente_tras'] = {k: [round(v['mean'], 4), int(v['count'])] for k, v in s2.iterrows()}
curva = c[c.op <= 20].groupby('op').ok.mean(); R['ct_curva'] = {int(k): round(1 - v, 4) for k, v in curva.items()}
ajustar(c, 'u', 'kc', 'ok', 'ct')
json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(json.dumps({k: v for k, v in R.items() if not k.endswith('_bkt')}, ensure_ascii=False, indent=0)[:4000])
