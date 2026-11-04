"""Texturas PBR procedurales y tileables (color, normal, rugosidad). Todo CC0: lo genera Amatista."""
import numpy as np


def ruido(n, beta, semilla, estirar=(1.0, 1.0)):
    """Ruido fractal tileable por síntesis espectral (1/f^beta): sin costuras al repetir la textura."""
    rng = np.random.default_rng(semilla)
    fy = np.fft.fftfreq(n)[:, None] * estirar[0]
    fx = np.fft.fftfreq(n)[None, :] * estirar[1]
    f = np.sqrt(fx ** 2 + fy ** 2)
    f[0, 0] = 1
    espectro = (rng.standard_normal((n, n)) + 1j * rng.standard_normal((n, n))) / f ** beta
    espectro[0, 0] = 0
    r = np.real(np.fft.ifft2(espectro))
    return (r - r.min()) / (r.max() - r.min() + 1e-9)


def mezclar(a, b, k):
    k = np.clip(k, 0, 1)[..., None]
    return a * (1 - k) + b * k


def color(rgb):
    return np.array(rgb, dtype=np.float32) / 255.0


def paleta(valor, colores):
    """valor 0..1 → degradado por varios colores."""
    puntos = np.linspace(0, 1, len(colores))
    canales = [np.interp(valor, puntos, [c[i] for c in colores]) for i in range(3)]
    return np.stack(canales, axis=-1) / 255.0


def celdas(n, cantidad, semilla, jitter=1.0):
    """Voronoi tileable: distancia al punto más cercano (f1), al segundo (f2) y el id de la celda."""
    rng = np.random.default_rng(semilla)
    lado = int(np.sqrt(cantidad))
    gy, gx = np.mgrid[0:lado, 0:lado]
    pts = (np.stack([gx.ravel(), gy.ravel()], 1) + 0.5 + (rng.random((lado * lado, 2)) - 0.5) * jitter) / lado
    yy, xx = np.mgrid[0:n, 0:n] / n
    f1 = np.full((n, n), 9.0)
    f2 = np.full((n, n), 9.0)
    ident = np.zeros((n, n), dtype=np.int32)
    for i, (px, py) in enumerate(pts):
        dx = np.abs(xx - px)
        dy = np.abs(yy - py)
        d = np.sqrt(np.minimum(dx, 1 - dx) ** 2 + np.minimum(dy, 1 - dy) ** 2)
        menor = d < f1
        f2 = np.where(menor, f1, np.minimum(f2, d))
        ident = np.where(menor, i, ident)
        f1 = np.where(menor, d, f1)
    return f1 * lado, f2 * lado, ident


def ladrillos(n, filas, columnas, junta, semilla):
    yy, xx = np.mgrid[0:n, 0:n] / n
    fila = np.floor(yy * filas)
    x = xx * columnas + (fila % 2) * 0.5
    col = np.floor(x)
    fx, fy = x - col, yy * filas - fila
    borde = np.minimum(np.minimum(fx, 1 - fx) / columnas * filas, np.minimum(fy, 1 - fy))
    rng = np.random.default_rng(semilla)
    tono = rng.random((filas + 1, columnas + 2))
    variacion = tono[fila.astype(int) % (filas + 1), col.astype(int) % (columnas + 2)]
    mortero = np.clip(borde / junta, 0, 1)
    return mortero, variacion


def mapa_normal(altura, fuerza):
    dx = (np.roll(altura, -1, 1) - np.roll(altura, 1, 1)) * fuerza
    dy = (np.roll(altura, -1, 0) - np.roll(altura, 1, 0)) * fuerza
    nrm = np.stack([-dx, dy, np.ones_like(altura)], -1)
    nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)
    return nrm * 0.5 + 0.5


def generar(id_, n=1024):
    """Devuelve (color HxWx3, altura HxW, rugosidad HxW, fuerza del relieve)."""
    s = sum(map(ord, id_))
    r1, r2, r3 = ruido(n, 1.4, s), ruido(n, 1.0, s + 1), ruido(n, 2.0, s + 2)
    if id_ == 'ladrillo_rojo':
        mortero, var = ladrillos(n, 16, 6, 0.08, s)
        base = paleta(var * 0.6 + r2 * 0.4, [(120, 40, 30), (160, 62, 42), (185, 88, 60)])
        col = mezclar(color((190, 182, 170)) * (0.8 + r1[..., None] * 0.3), base, mortero)
        return col, mortero * 0.8 + r2 * 0.2, 0.85 - mortero * 0.1, 6
    if id_ == 'ladrillo_gris':
        mortero, var = ladrillos(n, 12, 4, 0.06, s)
        base = paleta(var * 0.5 + r2 * 0.5, [(90, 92, 98), (128, 130, 136), (160, 160, 165)])
        return mezclar(color((70, 70, 72)), base, mortero), mortero * 0.8 + r2 * 0.2, 0.9 - mortero * 0.15, 6
    if id_ in ('baldosa_blanca', 'azulejo_azul', 'baldosa_barro'):
        lados = {'baldosa_blanca': 8, 'azulejo_azul': 12, 'baldosa_barro': 6}[id_]
        mortero, var = ladrillos(n, lados, lados, 0.05, s)
        tonos = {'baldosa_blanca': [(205, 205, 200), (235, 234, 228)], 'azulejo_azul': [(30, 80, 150), (70, 130, 200)], 'baldosa_barro': [(150, 75, 45), (190, 105, 65)]}[id_]
        base = paleta(var * 0.7 + r1 * 0.3, tonos)
        return mezclar(color((90, 88, 84)), base, mortero), mortero, 0.35 + (1 - mortero) * 0.5, 4
    if id_ == 'madera_roble' or id_ == 'madera_oscura' or id_ == 'madera_clara':
        yy, xx = np.mgrid[0:n, 0:n] / n
        distorsion = ruido(n, 1.6, s, estirar=(0.15, 1.0))
        anillos = np.sin((yy * 22 + distorsion * 6) * np.pi * 2) * 0.5 + 0.5
        tonos = {'madera_roble': [(110, 70, 38), (160, 108, 62), (190, 140, 88)], 'madera_oscura': [(50, 30, 18), (85, 52, 30), (110, 72, 44)], 'madera_clara': [(185, 150, 105), (215, 185, 140), (230, 205, 165)]}[id_]
        v = anillos * 0.6 + ruido(n, 1.2, s + 5, estirar=(0.05, 1.0)) * 0.4
        return paleta(v, tonos), v, 0.6 + r3 * 0.2, 2
    if id_ == 'tablones':
        mortero, var = ladrillos(n, 6, 1, 0.02, s)
        vetas = ruido(n, 1.3, s + 3, estirar=(0.05, 1.0))
        col = paleta(var * 0.4 + vetas * 0.6, [(105, 68, 40), (150, 100, 60), (175, 125, 80)])
        return col * (0.6 + 0.4 * mortero[..., None]), mortero * 0.6 + vetas * 0.4, 0.65, 3
    if id_ == 'marmol_blanco' or id_ == 'marmol_negro':
        yy, xx = np.mgrid[0:n, 0:n] / n
        v = np.abs(np.sin((xx * 3 + yy * 2 + ruido(n, 1.5, s) * 4) * np.pi))
        v = v ** 0.25
        tonos = [(140, 140, 145), (235, 235, 232), (250, 250, 248)] if 'blanco' in id_ else [(10, 10, 12), (40, 40, 44), (200, 195, 185)]
        if 'negro' in id_:
            v = 1 - v
        return paleta(v, tonos), v * 0.2, 0.15 + r1 * 0.1, 1
    if id_ in ('metal_cepillado', 'acero_oscuro'):
        v = ruido(n, 1.2, s, estirar=(1.0, 0.02))
        tonos = [(150, 152, 158), (190, 192, 198)] if id_ == 'metal_cepillado' else [(55, 58, 64), (85, 88, 95)]
        return paleta(v, tonos), v * 0.3, 0.3 + v * 0.2, 1
    if id_ == 'metal_oxidado':
        manchas = np.clip((r1 - 0.45) * 4, 0, 1)
        metal = paleta(r2, [(110, 112, 118), (150, 150, 155)])
        oxido = paleta(r3, [(90, 40, 20), (150, 70, 30), (190, 110, 50)])
        return mezclar(metal, oxido, manchas), manchas * 0.6 + r3 * 0.4, 0.4 + manchas * 0.5, 3
    if id_ == 'placa_metalica':
        yy, xx = np.mgrid[0:n, 0:n] / n
        rombos = (np.abs(((xx * 16) % 1) - 0.5) + np.abs(((yy * 32 + (np.floor(xx * 16) % 2) * 0.5) % 1) - 0.5)) < 0.18
        v = rombos * 1.0
        return paleta(v * 0.5 + r2 * 0.3, [(120, 122, 128), (175, 176, 180)]), v, 0.35, 4
    if id_ in ('pasto', 'musgo'):
        hojas = ruido(n, 0.7, s, estirar=(0.3, 1.0))
        tonos = [(40, 80, 25), (75, 125, 40), (120, 160, 60)] if id_ == 'pasto' else [(35, 60, 25), (70, 100, 40), (95, 120, 55)]
        v = hojas * 0.6 + r1 * 0.4
        return paleta(v, tonos), v, 0.85, 3
    if id_ in ('tierra', 'arena', 'nieve', 'barro'):
        tonos = {'tierra': [(70, 48, 30), (110, 78, 50), (135, 100, 68)], 'arena': [(190, 165, 120), (220, 195, 150), (235, 215, 175)],
                 'nieve': [(200, 210, 225), (235, 240, 248), (255, 255, 255)], 'barro': [(55, 40, 28), (85, 62, 42), (100, 75, 52)]}[id_]
        v = r1 * 0.5 + ruido(n, 0.5, s + 9) * 0.5
        return paleta(v, tonos), v, {'nieve': 0.6, 'arena': 0.9, 'tierra': 0.95, 'barro': 0.5}[id_], 3
    if id_ in ('roca', 'roca_volcanica', 'concreto', 'asfalto'):
        tonos = {'roca': [(70, 68, 64), (115, 110, 102), (150, 145, 135)], 'roca_volcanica': [(25, 22, 22), (50, 45, 44), (75, 68, 64)],
                 'concreto': [(120, 120, 118), (150, 150, 146), (170, 170, 166)], 'asfalto': [(35, 35, 38), (55, 55, 58), (80, 80, 82)]}[id_]
        grietas = np.clip(1 - np.abs(ruido(n, 1.8, s + 4) - 0.5) * 30, 0, 1) if id_ in ('roca', 'concreto') else 0
        v = r1 * 0.6 + ruido(n, 0.6, s + 7) * 0.4
        return paleta(v, tonos) * (1 - 0.35 * np.asarray(grietas)[..., None] if np.ndim(grietas) else 1), v - 0.3 * np.asarray(grietas), 0.9, 5
    if id_ in ('adoquin', 'empedrado', 'cristal_amatista', 'escamas'):
        cantidad = {'adoquin': 64, 'empedrado': 100, 'cristal_amatista': 49, 'escamas': 144}[id_]
        f1, f2, ident = celdas(n, cantidad, s)
        borde = np.clip((f2 - f1) * 6, 0, 1)
        rng = np.random.default_rng(s)
        tono = rng.random(cantidad + 1)[ident]
        tonos = {'adoquin': [(85, 82, 78), (130, 125, 118)], 'empedrado': [(95, 85, 70), (150, 135, 110)],
                 'cristal_amatista': [(70, 30, 110), (155, 89, 182), (210, 170, 240)], 'escamas': [(20, 90, 70), (60, 160, 120)]}[id_]
        col = paleta(tono * 0.7 + r2 * 0.3, tonos) * (0.35 + 0.65 * borde[..., None])
        alto = borde * (1 - f1 * 0.3) if id_ != 'cristal_amatista' else 1 - f1
        return col, alto, 0.2 if id_ == 'cristal_amatista' else 0.8, 6
    if id_ in ('tela_lona', 'tela_cuadros', 'alfombra', 'mezclilla'):
        yy, xx = np.mgrid[0:n, 0:n] / n
        tejido = np.sin(xx * n * np.pi / 4) * np.sin(yy * n * np.pi / 4) * 0.5 + 0.5
        if id_ == 'tela_cuadros':
            cuadro = ((np.floor(xx * 8) + np.floor(yy * 8)) % 2)
            col = mezclar(color((160, 30, 40)), color((30, 30, 40)), cuadro) * (0.8 + 0.2 * tejido[..., None])
        else:
            tonos = {'tela_lona': [(150, 135, 100), (185, 170, 130)], 'alfombra': [(110, 30, 40), (160, 60, 60)], 'mezclilla': [(30, 50, 90), (70, 95, 140)]}[id_]
            col = paleta(tejido * 0.5 + r1 * 0.5, tonos)
        return col, tejido * 0.7 + r3 * 0.3, 0.95, 2
    if id_ in ('cuero', 'papel', 'carton'):
        tonos = {'cuero': [(70, 40, 25), (110, 65, 38)], 'papel': [(225, 220, 205), (245, 242, 230)], 'carton': [(150, 115, 75), (180, 145, 100)]}[id_]
        v = ruido(n, 0.9 if id_ == 'cuero' else 0.4, s)
        return paleta(v * 0.7 + r1 * 0.3, tonos), v, 0.7 if id_ == 'cuero' else 0.95, 2
    if id_ in ('corteza',):
        v = ruido(n, 1.3, s, estirar=(0.08, 1.0))
        surcos = np.clip((v - 0.35) * 3, 0, 1)
        return paleta(surcos * 0.7 + r2 * 0.3, [(40, 28, 20), (85, 62, 45), (115, 88, 65)]), surcos, 0.9, 6
    if id_ in ('lava', 'agua', 'hielo'):
        f1, f2, _ = celdas(n, 36, s, jitter=1)
        v = np.clip((f2 - f1) * 3, 0, 1) * 0.5 + r1 * 0.5
        tonos = {'lava': [(20, 5, 5), (160, 30, 5), (255, 140, 20), (255, 230, 120)], 'agua': [(10, 40, 70), (20, 90, 130), (90, 170, 200)],
                 'hielo': [(150, 190, 220), (200, 230, 245), (240, 250, 255)]}[id_]
        return paleta(1 - v if id_ == 'lava' else v, tonos), v, {'lava': 0.7, 'agua': 0.05, 'hielo': 0.15}[id_], 3
    if id_ in ('panel_scifi', 'circuito'):
        yy, xx = np.mgrid[0:n, 0:n] / n
        rng = np.random.default_rng(s)
        celdas_x = (np.floor(xx * 8)).astype(int)
        celdas_y = (np.floor(yy * 8)).astype(int)
        tono = rng.random((8, 8))[celdas_y, celdas_x]
        lineas = np.minimum(np.abs(((xx * 8) % 1) - 0.5), np.abs(((yy * 8) % 1) - 0.5)) > 0.47
        if id_ == 'circuito':
            pistas = (np.abs(((xx * 32 + np.floor(yy * 8) * 0.37) % 1) - 0.5) < 0.06) & (r2 > 0.45)
            col = mezclar(color((10, 60, 40)), color((200, 170, 60)), pistas.astype(float))
            return col, pistas * 1.0, 0.5, 2
        col = mezclar(paleta(tono * 0.4 + r1 * 0.2, [(60, 64, 72), (95, 100, 110)]), color((0, 229, 255)), lineas * 0.8)
        return col, 1 - lineas * 0.8, 0.4, 4
    if id_ == 'plastico_rojo' or id_ == 'goma_negra':
        base = color((190, 35, 35)) if id_ == 'plastico_rojo' else color((25, 25, 28))
        return np.ones((n, n, 3)) * base * (0.92 + 0.08 * r1[..., None]), r1 * 0.1, 0.35 if id_ == 'plastico_rojo' else 0.9, 1
    if id_ == 'hexagonos':
        yy, xx = np.mgrid[0:n, 0:n] / n * 12
        q = xx * 2 / 3
        r = (-xx / 3 + np.sqrt(3) / 3 * yy)
        d = np.abs(np.sin(q * np.pi)) * np.abs(np.sin(r * np.pi)) * np.abs(np.sin((q + r) * np.pi))
        v = np.clip(d * 3, 0, 1)
        return mezclar(color((30, 25, 40)), color((155, 89, 182)), v), v, 0.5, 4
    raise KeyError(id_)


MATERIALES = [
    ('ladrillo_rojo', 'Ladrillo rojo', 'muros'), ('ladrillo_gris', 'Bloque gris', 'muros'), ('baldosa_blanca', 'Baldosa blanca', 'pisos'),
    ('azulejo_azul', 'Azulejo azul', 'pisos'), ('baldosa_barro', 'Baldosa de barro', 'pisos'), ('madera_roble', 'Madera de roble', 'madera'),
    ('madera_oscura', 'Madera oscura', 'madera'), ('madera_clara', 'Madera clara', 'madera'), ('tablones', 'Tablones', 'madera'),
    ('marmol_blanco', 'Mármol blanco', 'piedra'), ('marmol_negro', 'Mármol negro', 'piedra'), ('roca', 'Roca', 'piedra'),
    ('roca_volcanica', 'Roca volcánica', 'piedra'), ('adoquin', 'Adoquín', 'piedra'), ('empedrado', 'Empedrado', 'piedra'),
    ('concreto', 'Concreto', 'construcción'), ('asfalto', 'Asfalto', 'construcción'), ('metal_cepillado', 'Metal cepillado', 'metal'),
    ('acero_oscuro', 'Acero oscuro', 'metal'), ('metal_oxidado', 'Metal oxidado', 'metal'), ('placa_metalica', 'Placa antiderrapante', 'metal'),
    ('pasto', 'Pasto', 'naturaleza'), ('musgo', 'Musgo', 'naturaleza'), ('tierra', 'Tierra', 'naturaleza'), ('arena', 'Arena', 'naturaleza'),
    ('nieve', 'Nieve', 'naturaleza'), ('barro', 'Barro', 'naturaleza'), ('corteza', 'Corteza', 'naturaleza'), ('agua', 'Agua', 'naturaleza'),
    ('hielo', 'Hielo', 'naturaleza'), ('lava', 'Lava', 'fantasía'), ('cristal_amatista', 'Cristal de amatista', 'fantasía'),
    ('escamas', 'Escamas', 'fantasía'), ('hexagonos', 'Hexágonos', 'ciencia ficción'), ('panel_scifi', 'Panel sci-fi', 'ciencia ficción'),
    ('circuito', 'Circuito', 'ciencia ficción'), ('tela_lona', 'Lona', 'tela'), ('tela_cuadros', 'Tela a cuadros', 'tela'),
    ('alfombra', 'Alfombra', 'tela'), ('mezclilla', 'Mezclilla', 'tela'), ('cuero', 'Cuero', 'tela'), ('papel', 'Papel', 'otros'),
    ('carton', 'Cartón', 'otros'), ('plastico_rojo', 'Plástico rojo', 'otros'), ('goma_negra', 'Goma negra', 'otros'),
]
