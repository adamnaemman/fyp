#!/usr/bin/env python
"""Jana 2026-11-08_flow_register_barang_v1.pdf — 3 halaman rajah aliran register barang.

Halaman 1: siapa bercakap dengan siapa (topologi fizikal + data)
Halaman 2: aliran register barang (9 langkah, dua lajur, aktor ditanda)
Halaman 3: macam mana beg tahu barang tak cukup (MISSING = katalog - bacaan)

Jalankan: python 2026-11-08_flow_register_barang_gen_v1.py
Keluaran: ../2026-11-08_flow_register_barang_v1.pdf  (3 halaman A4 landskap)
"""
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "2026-11-08_flow_register_barang_v1.pdf"))
FIGS = []

# A4 landskap
FIG_W, FIG_H = 11.69, 8.27
XMAX, YMAX = 141.4, 100.0

INK = "#1a1a1a"
MUTED = "#5f6368"
BLUE = ("#E3F2FD", "#1565C0")
GREEN = ("#E8F5E9", "#2E7D32")
AMBER = ("#FFF8E1", "#EF6C00")
RED = ("#FFEBEE", "#C62828")
GREY = ("#F5F5F5", "#616161")
PURPLE = ("#F3E5F5", "#6A1B9A")

plt.rcParams["font.family"] = "DejaVu Sans"


def page(title, subtitle):
    fig = plt.figure(figsize=(FIG_W, FIG_H))
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, XMAX)
    ax.set_ylim(0, YMAX)
    ax.set_aspect("equal")
    ax.axis("off")
    ax.text(4, 94.0, title, fontsize=17, fontweight="bold", color=INK, va="top")
    if subtitle:
        ax.text(4, 88.5, subtitle, fontsize=10.5, color=MUTED, va="top")
    ax.text(4, 2.2,
            "BagSense  ·  BICS 4321 FYP1  ·  8 Nov 2026  ·  draf v1 — rajah reka bentuk, bukan pengukuran hardware",
            fontsize=7.5, color=MUTED)
    return fig, ax


def box(ax, x, y, w, h, text, colors, fs=9, weight="normal", align="center", pad=0.8):
    fc, ec = colors
    ax.add_patch(FancyBboxPatch((x, y), w, h,
                                boxstyle=f"round,pad={pad},rounding_size=1.2",
                                linewidth=1.4, edgecolor=ec, facecolor=fc, zorder=2))
    if align == "center":
        ax.text(x + w / 2, y + h / 2, text, ha="center", va="center",
                fontsize=fs, color=INK, fontweight=weight, zorder=3, linespacing=1.45)
    else:
        ax.text(x + 1.8, y + h / 2, text, ha="left", va="center",
                fontsize=fs, color=INK, fontweight=weight, zorder=3, linespacing=1.5)


def arrow(ax, p1, p2, color=MUTED, ls="-", lw=1.6, ms=14):
    ax.add_patch(FancyArrowPatch(p1, p2, arrowstyle="-|>", mutation_scale=ms,
                                 linewidth=lw, color=color, linestyle=ls, zorder=4))


def save(fig):
    FIGS.append(fig)
    plt.close(fig)


# ----------------------------------------------------------------- page 1
fig, ax = page("1.  Siapa bercakap dengan siapa",
               "App TIDAK bercakap dengan tag. Telefon biasa tiada radio UHF — semua bacaan mesti lalu ESP32.")

y0, h, w = 58.0, 18.0, 26.0
xs = [3.0, 39.0, 75.0, 111.0]
box(ax, xs[0], y0, w, h,
    "TAG UHF\n(sticker pada barang)\n\nEPC 96-bit\n24 aksara hex\ntanpa bateri", AMBER, fs=9)
box(ax, xs[1], y0, w, h,
    "MODUL READER UHF\ndalam beg\n\n919–923 MHz\n+ antena", BLUE, fs=9)
box(ax, xs[2], y0, w, h,
    "ESP32-S3\n(otak beg)\n\nkawal reader,\ne-paper,\nzip sensor", PURPLE, fs=9)
box(ax, xs[3], y0, w, h,
    "TELEFON\n(app Flutter)\n\nkatalog\n+ sejarah\n+ paparan", GREEN, fs=9)

ymid = y0 + h / 2
for i in range(3):
    arrow(ax, (xs[i] + w + 1.2, ymid), (xs[i + 1] - 1.2, ymid), color=MUTED, lw=1.8, ms=12)

labels = [("EPC + RSSI\n(radio 919–923 MHz)", 0), ("EPC\n(wayar)", 1), ("status + katalog\n(BLE 2.4 GHz)", 2)]
for txt, i in labels:
    cx = (xs[i] + w + xs[i + 1]) / 2
    ax.text(cx, y0 - 4.6, txt, ha="center", va="center", fontsize=7.6,
            color=MUTED, linespacing=1.4)

# tiada laluan telefon -> tag: garis lurus dalam ruang kosong, tiada kotak
ay = 45.0
arrow(ax, (131.0, ay), (16.0, ay), color=RED[1], ls=(0, (5, 3)), lw=1.8, ms=13)
ax.plot([64.0, 78.0], [ay - 2.4, ay + 2.4], color="white", lw=6, zorder=5)
ax.plot([65.0, 77.0], [ay - 2.2, ay + 2.2], color=RED[1], lw=2.8, zorder=6)
ax.plot([65.0, 77.0], [ay + 2.2, ay - 2.2], color=RED[1], lw=2.8, zorder=6)
ax.text(71.0, ay + 6.0, "TIADA LALUAN — telefon tak boleh baca tag UHF",
        fontsize=10, fontweight="bold", color=RED[1], ha="center", va="center", zorder=6)

box(ax, 3.0, 24.0, 63.0, 13.0,
    "Sebab telefon tak boleh jadi reader:\ntiada radio 860–960 MHz dalam telefon.\nTiada app, kamera atau wayarles boleh baca tag UHF.",
    RED, fs=9.2, align="left")
box(ax, 71.0, 24.0, 66.0, 13.0,
    "Sebab beg perlukan katalog sendiri:\nreader cuma nampak NOMBOR, bukan nama.\nESP32 tak tahu 'Laptop' — nama hidup dalam app.",
    GREY, fs=9.2, align="left")

box(ax, 3.0, 7.0, 134.0, 14.0,
    "Kenapa ini menentukan bentuk 'register barang':\n"
    "mendaftar = menulis pemetaan nama ↔ EPC di DUA tempat —\n"
    "(1) katalog dalam telefon,  (2) flash ESP32 dalam beg.\n"
    "Tanpa (2), beg buta bila telefon mati — dan beg memang mesti boleh kerja tanpa telefon.",
    BLUE, fs=10, align="left", weight="bold")
save(fig)

# ----------------------------------------------------------------- page 2
fig, ax = page("2.  Aliran register barang",
               "Sembilan langkah, ikut nombor. Aktor di kanan setiap kotak.")

steps = [
    ("1", "Tampal sticker tag pada barang.\nTag belum ada dalam sistem — app tak tahu apa-apa.",
     "PENGGUNA", AMBER),
    ("2", "Buka tab katalog  →  [+ DAFTAR BARANG]", "APP", GREEN),
    ("3", "Isi nama, poket A/B, tanda 'penting'.", "APP", GREEN),
    ("4", "Tekan [SCAN TAG] → hantar arahan\nlearning-mode ikut BLE.", "APP", GREEN),
    ("5", "Hidupkan reader, tangkap tag pertama,\npulangkan EPC 24 hex.", "ESP32", PURPLE),
    ("6", "EPC masuk borang. Tiada reader? Taip EPC\nbercetak pada label, atau guna mock.", "APP", GREEN),
    ("7", "Semak EPC mesti unik. Dah dipakai\nbarang lain → tolak.", "APP", GREEN),
    ("8", "Simpan: tulis katalog dalam telefon,\nHANTAR pemetaan ke flash ESP32.", "APP + ESP32", BLUE),
    ("9", "Beg kini tahu 'EPC ini = Laptop, mesti\ndalam beg'. Status app: dah diikat.", "ESP32", PURPLE),
]

col_w, bh, gap = 52.0, 11.5, 3.0
cols = [(5.0, steps[:5]), (75.0, steps[5:])]
for cx, group in cols:
    y_top = 84.0
    for i, (num, text, actor, colors) in enumerate(group):
        y = y_top - bh - i * (bh + gap)
        body = f"{num}.  {text}"
        box(ax, cx, y, col_w, bh, body, colors, fs=8.5, align="left")
        ax.text(cx + col_w + 2.2, y + bh / 2, actor, fontsize=7.8,
                color=colors[1], fontweight="bold", va="center", ha="left")
        if i < len(group) - 1:
            arrow(ax, (cx + col_w / 2, y - 0.4), (cx + col_w / 2, y - gap + 0.5),
                  color="#bdbdbd", lw=1.4, ms=10)

ax.text(5.0 + col_w / 2, 10.5, "sambung  →  langkah 6 di lajur kanan",
        fontsize=8.2, color=MUTED, ha="center", va="center")
ax.text(75.0 + col_w / 2, 10.5, "siap: barang ada dalam katalog beg",
        fontsize=8.2, color=GREEN[1], ha="center", va="center", fontweight="bold")

box(ax, 75.0, 15.0, col_w, 11.0,
    "Sebelum reader sampai:\nlangkah 5 ganti dengan MockBleService →\nEPC palsu unik selepas ~1.5 s.\nFlow sama, sumber EPC lain sahaja.",
    RED, fs=8.4, align="left")
save(fig)

# ----------------------------------------------------------------- page 3
fig, ax = page("3.  Macam mana beg tahu barang tak cukup",
               "Setiap kali zip ditutup, beg bandingkan apa yang patut ada dengan apa yang dia nampak.")

box(ax, 6.0, 77.0, 129.0, 8.0,
    "MISSING = KATALOG (jangkaan dalam flash)  −  TERKESAN (EPC yang reader baca masa zip tutup)",
    BLUE, fs=11.5, weight="bold")

cols = [
    ("KATALOG (jangkaan)", GREEN,
     "E280 6915 0001  →  Laptop\nE280 6915 0002  →  Charger\nE280 6915 0003  →  Kunci", 6.0),
    ("TERKESAN (bacaan)", AMBER,
     "E280 6915 0001  →  Laptop     ✓\nE280 6915 0002  →  (tiada)     ✗\nE280 6915 0003  →  Kunci      ✓", 51.0),
    ("KEPUTUSAN", RED,
     "MISSING = 1\nCharger\n\ne-paper: 'MISSING 1'\napp Skrin 3: alert merah", 96.0),
]
for title, colors, body, x in cols:
    box(ax, x, 64.0, 39.0, 3.4, title, colors, fs=9.2, weight="bold", pad=0.6)
    box(ax, x, 46.0, 39.0, 15.6, body, colors, fs=9.0, align="left", pad=0.6)

box(ax, 6.0, 37.5, 129.0, 5.2,
    "Sebab tu barang kena register dulu: beg tak boleh lapor 'Charger tak cukup' kalau dia tak pernah tahu tag mana satu Charger.",
    GREY, fs=9.4, align="left")

caveats = [
    ("Daftar masa barang di luar beg",
     "Round pertama memang akan lapor item itu missing.\nBetul, bukan bug — user kena masukkan barang,\ntutup zip, baru round seterusnya senyap.", AMBER, 6.0),
    ("Julat reader boleh terlebih keluar beg",
     "Tag di luar beg tapi dekat boleh terbaca → nampak\n'hadir' padahal tiada (false present).\nKena uji bila hardware sampai — bahan Chapter 4.", RED, 51.0),
    ("Tag yang dah tak dipakai",
     "Mesti boleh padam dari katalog.\nKalau tidak, alert untuk barang itu tak berhenti\nselama-lamanya.", PURPLE, 96.0),
]
for title, body, colors, x in caveats:
    box(ax, x, 28.0, 39.0, 3.4, title, colors, fs=8.5, weight="bold", pad=0.6)
    box(ax, x, 12.5, 39.0, 13.0, body, colors, fs=8.3, align="left", pad=0.6)

save(fig)

with PdfPages(OUT) as pdf:
    for f in FIGS:
        pdf.savefig(f)
    pdf.infodict()["Title"] = "BagSense — aliran register barang (draf v1)"

print("ditulis:", OUT)
print("halaman:", len(FIGS))
print("saiz:", os.path.getsize(OUT), "bait")
