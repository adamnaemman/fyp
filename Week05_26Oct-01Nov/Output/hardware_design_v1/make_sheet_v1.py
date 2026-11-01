# Gabung render jadi satu helaian untuk laporan / meeting
# Jalankan: python make_sheet_v1.py

import os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.dirname(os.path.abspath(__file__))
VER = "v1"

PANELS = [
    ("render_iso_v9.png", "1. Rupa beg - pandangan isometrik (ortho)"),
    ("figure_layout_labelled_v1.png", "2. Susun atur dalam cavity - pandangan atas"),
    ("render_section_v9.png", "3. Keratan hadapan - panel depan dibuang"),
    ("render_wireframe_iso_v9.png", "4. Wireframe - struktur dan komponen dalaman"),
]

CELL_W, CELL_H = 1000, 780
CAP_H = 46
MARGIN = 28
HEAD_H = 150

cols, rows = 2, 2
W = MARGIN * 3 + CELL_W * cols
H = HEAD_H + MARGIN + (CELL_H + CAP_H + MARGIN) * rows

sheet = Image.new("RGB", (W, H), (255, 255, 255))
dr = ImageDraw.Draw(sheet)


def font(sz, bold=False):
    for name in (("arialbd.ttf" if bold else "arial.ttf"), "DejaVuSans-Bold.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, sz)
        except Exception:
            continue
    return ImageFont.load_default()


f_title = font(44, True)
f_sub = font(24)
f_cap = font(26, True)
f_note = font(22)

dr.text((MARGIN, 26), "BagSense - helaian reka bentuk hardware", font=f_title, fill=(20, 22, 26))
dr.text((MARGIN, 84), "BICS 4321 FYP1  ·  Ahmad Adam Hakimi (2418711)  ·  Amru Hazem (2419467)  ·  1 Nov 2026",
        font=f_sub, fill=(70, 78, 88))
dr.text((MARGIN, 112), "AMARAN: dimensi masih ANDAIAN - belum diukur pada beg sebenar. Ganti DIM dalam skrip dan jana semula.",
        font=f_note, fill=(170, 72, 10))

for i, (fn, cap) in enumerate(PANELS):
    p = os.path.join(OUT, fn)
    if not os.path.exists(p):
        print("TIADA:", p)
        continue
    im = Image.open(p).convert("RGB")
    im.thumbnail((CELL_W, CELL_H), Image.LANCZOS)
    r, c = divmod(i, cols)
    x = MARGIN + c * (CELL_W + MARGIN)
    y = HEAD_H + MARGIN + r * (CELL_H + CAP_H + MARGIN)
    ox = x + (CELL_W - im.width) // 2
    oy = y + (CELL_H - im.height) // 2
    sheet.paste(im, (ox, oy))
    dr.rectangle([x, y, x + CELL_W, y + CELL_H], outline=(206, 214, 221), width=2)
    dr.text((x + 8, y + CELL_H + 10), cap, font=f_cap, fill=(30, 36, 44))

out = os.path.join(OUT, f"sheet_hardware_design_{VER}.png")
sheet.save(out)
print("SHEET:", out, sheet.size)
