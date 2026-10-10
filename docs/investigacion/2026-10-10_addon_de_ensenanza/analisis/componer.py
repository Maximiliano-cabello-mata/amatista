from PIL import Image, ImageDraw, ImageFont, ImageFilter
D = 'concepto/'
INTER = '/usr/share/fonts/opentype/inter/Inter-%s.otf'
SYM = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def f(peso, t): return ImageFont.truetype(INTER % peso, t)
AMA = (155, 89, 182); AMAC = (195, 155, 211); SUP = (30, 30, 34); TXT = (236, 236, 240); SUAVE = (170, 170, 182)
AMBAR = (255, 170, 60); CORAL = (255, 110, 95); VERDE = (110, 231, 183); NEON = (0, 229, 255)

def capa(img):
    return Image.new('RGBA', img.size, (0, 0, 0, 0))

def tarjeta(img, x, y, w, h, borde=AMA, r=18):
    sombra = capa(img); ds = ImageDraw.Draw(sombra)
    ds.rounded_rectangle((x, y+8, x+w, y+h+8), r, fill=(0, 0, 0, 140))
    sombra = sombra.filter(ImageFilter.GaussianBlur(14))
    img.alpha_composite(sombra)
    c = capa(img); d = ImageDraw.Draw(c)
    d.rounded_rectangle((x, y, x+w, y+h), r, fill=SUP + (238,), outline=borde + (255,), width=2)
    img.alpha_composite(c)
    return ImageDraw.Draw(img)

def tecla(d, x, y, texto, color=TXT, fondo=(58, 58, 66), t=20):
    fu = f('SemiBold', t); w = d.textlength(texto, font=fu)
    d.rounded_rectangle((x, y, x+w+22, y+t+16), 7, fill=fondo, outline=(90, 90, 100), width=1)
    d.rounded_rectangle((x, y+t+12, x+w+22, y+t+16), 3, fill=(40, 40, 46))
    d.text((x+11, y+6), texto, font=fu, fill=color)
    return x + w + 32

def boton(d, x, y, texto, fondo=AMA, color=(255, 255, 255), t=19):
    fu = f('SemiBold', t); w = d.textlength(texto, font=fu)
    d.rounded_rectangle((x, y, x+w+36, y+t+20), 12, fill=fondo)
    d.text((x+18, y+9), texto, font=fu, fill=color)
    return x + w + 48

def chip(d, x, y, texto, color=AMAC, t=17):
    fu = f('SemiBold', t); w = d.textlength(texto, font=fu)
    d.rounded_rectangle((x, y, x+w+26, y+t+16), 99, fill=(20, 20, 24, 220), outline=color, width=2)
    d.text((x+13, y+7), texto, font=fu, fill=color)
    return x + w + 36

def puntos(d, x, y, n, hechos, actual):
    for i in range(n):
        cx = x + i*22
        if i < hechos: d.ellipse((cx, y, cx+12, y+12), fill=VERDE)
        elif i == actual: d.ellipse((cx-3, y-3, cx+15, y+15), outline=AMBAR, width=3)
        else: d.ellipse((cx, y, cx+12, y+12), outline=(110, 110, 120), width=2)

def base(nombre):
    return Image.open(D + nombre + '.png').convert('RGBA')

# A1: presentación
img = base('a_molde_vacio'); d = ImageDraw.Draw(img)
chip(d, 28, 26, 'Tren de juguete  ·  Principiante 1')
d = tarjeta(img, 330, 520, 620, 205)
d.text((360, 545), 'ESTE ES TU TREN', font=f('Bold', 16), fill=AMAC)
d.text((360, 570), 'Llena cada pieza del molde azul', font=f('Bold', 30), fill=TXT)
d.text((360, 614), '11 piezas · unos 10 minutos · tú eliges el orden', font=f('Medium', 19), fill=SUAVE)
x = boton(d, 360, 656, '¡Empezar!'); x = boton(d, x, 656, '▶  Mírame primero', fondo=(58, 58, 66))
img.convert('RGB').save(D + 'A1.png')

# A2: progreso
img = base('a_molde_progreso'); d = ImageDraw.Draw(img)
chip(d, 28, 26, 'Tren de juguete'); puntos(d, 40, 74, 11, 2, 2)
d = tarjeta(img, 300, 500, 680, 230, borde=AMBAR)
d.text((330, 522), 'PIEZA 3 DE 11  ·  LA CHIMENEA', font=f('Bold', 16), fill=AMBAR)
d.text((330, 548), 'Un cilindro de pie, encima de la locomotora', font=f('Bold', 27), fill=TXT)
d.text((330, 590), 'Agrégalo y llévalo al molde amarillo. Cuando encaje, se pinta solo.', font=f('Medium', 18), fill=SUAVE)
x = tecla(d, 330, 628, 'Shift A'); d.text((x-4, 634), '›  Cilindro', font=f('Medium', 18), fill=SUAVE); x += 104
x = tecla(d, x, 628, 'G'); x = tecla(d, x, 628, 'S')
x = boton(d, 330, 680, '▶  Mírame', fondo=(58, 58, 66), t=17); x = boton(d, x, 680, 'Pista', fondo=(58, 58, 66), t=17)
d.text((790, 688), 'Molde  2 / 11', font=f('SemiBold', 17), fill=VERDE)
d.rounded_rectangle((790, 712, 950, 718), 3, fill=(60, 60, 66)); d.rounded_rectangle((790, 712, 790+160*2/11, 718), 3, fill=VERDE)
img.convert('RGB').save(D + 'A2.png')

# A3: error con diagnóstico
img = base('a_molde_error'); d = ImageDraw.Draw(img)
chip(d, 28, 26, 'Tren de juguete'); puntos(d, 40, 74, 11, 2, 2)
d = tarjeta(img, 300, 520, 680, 200, borde=CORAL)
d.text((330, 542), 'CASI', font=f('Bold', 16), fill=CORAL)
d.text((330, 567), 'Eso es un cubo. La chimenea es redonda.', font=f('Bold', 27), fill=TXT)
d.text((330, 609), 'Bórralo y agrega un cilindro: el lugar y el tamaño ya están bien.', font=f('Medium', 18), fill=SUAVE)
x = tecla(d, 330, 650, 'X'); d.text((x-4, 656), 'borrar', font=f('Medium', 18), fill=SUAVE); x += 70
x = tecla(d, x, 650, 'Shift A'); d.text((x-4, 656), '›  Cilindro', font=f('Medium', 18), fill=SUAVE)
img.convert('RGB').save(D + 'A3.png')

# B: Mírame (demostración)
img = base('a_molde_progreso'); d = ImageDraw.Draw(img)
cap = capa(img); dc = ImageDraw.Draw(cap)
for i, (cx, cy) in enumerate(((660, 330), (760, 250), (865, 230))):
    dc.ellipse((cx-7, cy-7, cx+7, cy+7), fill=AMBAR + (200,))
dc.line([(660, 330), (760, 250), (865, 230)], fill=AMBAR + (170,), width=3)
img.alpha_composite(cap); d = ImageDraw.Draw(img)
chip(d, 28, 26, '▶  Mírame  ·  2 de 3', color=AMBAR)
# teclas al estilo «screencast»
x = 900; y = 160
tecla(d, 930, 140, 'Shift A', t=26); tecla(d, 930, 200, 'G', t=26); tecla(d, 1000, 200, 'Z', t=26, color=AMBAR)
d = tarjeta(img, 300, 540, 680, 180, borde=AMBAR)
d.text((330, 562), 'MIRA CÓMO SE HACE', font=f('Bold', 16), fill=AMBAR)
d.text((330, 588), 'G y luego Z: sube la chimenea sin moverla de lado', font=f('Bold', 25), fill=TXT)
d.rounded_rectangle((330, 640, 950, 646), 3, fill=(60, 60, 66)); d.rounded_rectangle((330, 640, 330+620*0.6, 646), 3, fill=AMBAR)
x = boton(d, 330, 664, 'Tu turno', t=17); boton(d, x, 664, '↻  Otra vez', fondo=(58, 58, 66), t=17)
img.convert('RGB').save(D + 'B.png')

# C: completo + colección
img = base('c_completo'); d = ImageDraw.Draw(img)
d = tarjeta(img, 340, 470, 600, 250, borde=VERDE)
d.text((370, 492), 'TREN TERMINADO', font=f('Bold', 16), fill=VERDE)
d.text((370, 518), '¡Tu tren está listo!', font=f('Bold', 34), fill=TXT)
d.text((370, 568), '★ ★ ★', font=ImageFont.truetype(SYM, 34), fill=AMBAR)
d.text((520, 576), 'lo armaste · sin pistas · sin flotar', font=f('Medium', 18), fill=SUAVE)
d.text((370, 620), 'Ya sabes:  agregar piezas · mover con G · estirar con S', font=f('Medium', 18), fill=TXT)
x = boton(d, 370, 662, 'Guardar en mi colección'); boton(d, x, 662, 'Siguiente', fondo=(58, 58, 66))
img.convert('RGB').save(D + 'C.png')
print('ok')
