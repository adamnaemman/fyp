# BagSense — jana figure kejuruteraan: blueprint berdimensi, wiring diagram, layout berlabel
# Jalankan:  python make_figures_v1.py
#
# Semua nombor datang dari DIM dalam build_bagsense_model_v9.py (ANDAIAN, belum diukur).
# Bila Adam ukur beg sebenar, tukar DIM di satu tempat dan semua figure boleh dijana semula.

import os
import json
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, FancyArrowPatch, Circle
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.dirname(os.path.abspath(__file__))
VER = "v1"

DIM = dict(
    bag_w=320, bag_d=160, bag_h=460,
    wall=10,
    pocket_w=260, pocket_d=35, pocket_h=200, pocket_z=200,
    bezel_w=110, bezel_h=70, bezel_d=12, bezel_z=385,
    panel_w=86, panel_h=48,
    loop_w=270, loop_d=120, loop_t=6, loop_z=150,
    rfid_w=62, rfid_d=38, rfid_h=14, rfid_x=-72, rfid_y=20, rfid_z=70,
    esp_w=60, esp_d=28, esp_h=7, esp_x=58, esp_y=26, esp_z=70,
    batt_w=90, batt_d=22, batt_h=120, batt_x=0, batt_y=44, batt_z=88,
    hall_x=90, hall_z=446,
)

GREY = "#3d454f"
INK = "#1b1f24"
ACC = "#c25e0a"
BLUE = "#1f4e79"
LIGHT = "#e9edf1"

# ---------------------------------------------------------------------------
# 1. BLUEPRINT — tiga pandangan + dimensi (mm)
# ---------------------------------------------------------------------------
def blueprint():
    fig = plt.figure(figsize=(16.5, 11.5), dpi=200)
    fig.patch.set_facecolor("white")
    gs = fig.add_gridspec(2, 2, width_ratios=[1, 1], height_ratios=[1.55, 1],
                          left=0.05, right=0.97, top=0.90, bottom=0.06,
                          wspace=0.16, hspace=0.14)

    def dim(ax, p1, p2, text, off=0.0, vertical=False, color=BLUE):
        """garis dimensi dua hujung dengan anak panah + label"""
        x1, y1 = p1
        x2, y2 = p2
        if not vertical:
            y = y1 + off
            ax.annotate("", xy=(x1, y), xytext=(x2, y),
                        arrowprops=dict(arrowstyle="<->", color=color, lw=0.9))
            ax.text((x1 + x2) / 2, y + 4, text, ha="center", va="bottom",
                    fontsize=8, color=color)
        else:
            x = x1 + off
            ax.annotate("", xy=(x, y1), xytext=(x, y2),
                        arrowprops=dict(arrowstyle="<->", color=color, lw=0.9))
            ax.text(x - 4, (y1 + y2) / 2, text, ha="right", va="center",
                    fontsize=8, color=color, rotation=90)

    def ext(ax, p1, p2, color=BLUE):
        ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color=color, lw=0.5, ls=":")

    def frame(ax, xlim, ylim, title):
        ax.set_xlim(*xlim)
        ax.set_ylim(*ylim)
        ax.set_aspect("equal")
        ax.set_title(title, fontsize=10, color=INK, loc="left", pad=8, fontweight="bold")
        ax.set_xticks([])
        ax.set_yticks([])
        for s in ax.spines.values():
            s.set_color("#b9c1c9")
        ax.grid(True, color="#eef1f4", lw=0.6)
        ax.set_axisbelow(True)

    W, H, D = DIM["bag_w"], DIM["bag_h"], DIM["bag_d"]
    bz = DIM["bezel_z"]

    # ---------- FRONT ELEVATION
    ax = fig.add_subplot(gs[0, 0])
    frame(ax, (-120, 560), (-110, 610), "A. FRONT ELEVATION  (mm)")
    ax.add_patch(Rectangle((0, 0), W, H, fc=LIGHT, ec=INK, lw=1.4))
    ax.add_patch(Rectangle(((W - DIM["bezel_w"]) / 2, bz - DIM["bezel_h"] / 2),
                           DIM["bezel_w"], DIM["bezel_h"], fc="white", ec=ACC, lw=1.6))
    ax.add_patch(Rectangle(((W - DIM["panel_w"]) / 2, bz - DIM["panel_h"] / 2),
                           DIM["panel_w"], DIM["panel_h"], fc="#f7f7f2", ec=GREY, lw=0.8))
    ax.add_patch(Rectangle(((W - DIM["pocket_w"]) / 2, DIM["pocket_z"] - DIM["pocket_h"] / 2),
                           DIM["pocket_w"], DIM["pocket_h"], fc="#dfe5ea", ec=GREY,
                           lw=1.0, ls="--"))
    # pemegang
    ax.add_patch(Rectangle((W / 2 - 44, H), 20, 46, fc="none", ec=GREY, lw=1.0))
    ax.add_patch(Rectangle((W / 2 + 24, H), 20, 46, fc="none", ec=GREY, lw=1.0))
    ax.plot([W / 2 - 44, W / 2 + 44], [H + 46, H + 46], color=GREY, lw=2.0)

    ext(ax, (0, 0), (-30, 0)); ext(ax, (W, 0), (W + 30, 0))
    dim(ax, (0, 0), (W, 0), f"{W}", off=-42)
    ext(ax, (0, 0), (0, -30)); ext(ax, (0, H), (-30, H))
    dim(ax, (0, 0), (0, H), f"{H}", off=-55, vertical=True)
    ax.text(W + 10, H - 24, "E-paper bezel\n110 x 70, z 385", fontsize=7.5, color=ACC,
            va="center")
    ax.annotate("", xy=(W, bz), xytext=(W + 46, H - 24),
                arrowprops=dict(arrowstyle="->", color=ACC, lw=0.9))
    ax.annotate("", xy=(W, DIM["pocket_z"] + 40), xytext=(W + 46, DIM["pocket_z"] - 10),
                arrowprops=dict(arrowstyle="->", color=GREY, lw=0.9))
    ax.text(W + 50, DIM["pocket_z"] - 22, "front pocket\n260 x 200", fontsize=7.5,
            color=GREY, va="center")
    ax.text(0, -95, "Muka depan: skrin E-paper di luar beg, poket depan berzip.",
            fontsize=7.5, color="#5a646e")

    # ---------- SIDE ELEVATION
    ax = fig.add_subplot(gs[0, 1])
    frame(ax, (-120, 470), (-110, 610), "B. SIDE ELEVATION  (mm)")
    ax.add_patch(Rectangle((0, 0), D, H, fc=LIGHT, ec=INK, lw=1.4))
    ax.add_patch(Rectangle((-DIM["pocket_d"] + 10, DIM["pocket_z"] - DIM["pocket_h"] / 2),
                           DIM["pocket_d"], DIM["pocket_h"], fc="#dfe5ea", ec=GREY,
                           lw=1.0, ls="--"))
    # tali beg di belakang
    ax.add_patch(Rectangle((D - 6, 100), 10, 300, fc="#cfd6dc", ec=GREY, lw=0.9))
    ax.plot([0, -8], [H, H], color=INK, lw=1.0)
    ext(ax, (0, 0), (-30, 0)); ext(ax, (D, 0), (D + 30, 0))
    dim(ax, (0, 0), (D, 0), f"{D}", off=-42)
    ext(ax, (0, 0), (0, -30)); ext(ax, (0, H), (-30, H))
    dim(ax, (0, 0), (0, H), f"{H}", off=-55, vertical=True)
    ax.text(D + 20, H * 0.55, "tali bahu\n(tidak ditentukan\ndalam model)", fontsize=7.5,
            color=GREY, va="center")
    ax.text(0, -95, "Profil: kedalaman 160 mm, E-paper menonjol 12 mm.",
            fontsize=7.5, color="#5a646e")

    # ---------- TOP VIEW (keratan)
    ax = fig.add_subplot(gs[1, 0])
    frame(ax, (-140, 480), (-130, 335), "C. TOP VIEW — susun atur dalam cavity  (mm)")
    ax.add_patch(Rectangle((0, 0), W, D, fc=LIGHT, ec=INK, lw=1.4))
    ax.add_patch(Rectangle((DIM["wall"], DIM["wall"]), W - 2 * DIM["wall"],
                           D - 2 * DIM["wall"], fc="white", ec=GREY, lw=0.9))
    cx, cy = W / 2, D / 2
    # antenna loop
    lw_, ld_ = DIM["loop_w"], DIM["loop_d"]
    ax.add_patch(Rectangle((cx - lw_ / 2, cy - ld_ / 2), lw_, ld_, fc="none",
                           ec=ACC, lw=2.4))
    ax.text(cx, D + 18, f"antenna loop {lw_} x {ld_}, z {DIM['loop_z']}",
            fontsize=7.5, color=ACC, ha="center")
    # komponen
    ax.add_patch(Rectangle((cx + DIM["rfid_x"] - DIM["rfid_w"] / 2,
                            cy + DIM["rfid_y"] - DIM["rfid_d"] / 2),
                           DIM["rfid_w"], DIM["rfid_d"], fc="#cfe3d6", ec="#1e7a44", lw=1.1))
    ax.text(cx + DIM["rfid_x"], cy + DIM["rfid_y"], "YRM100", fontsize=7, ha="center",
            va="center", color="#124d2a")
    ax.add_patch(Rectangle((cx + DIM["esp_x"] - DIM["esp_w"] / 2,
                            cy + DIM["esp_y"] - DIM["esp_d"] / 2),
                           DIM["esp_w"], DIM["esp_d"], fc="#cfe3d6", ec="#1e7a44", lw=1.1))
    ax.text(cx + DIM["esp_x"], cy + DIM["esp_y"], "ESP32-S3", fontsize=6.5, ha="center",
            va="center", color="#124d2a")
    ax.add_patch(Rectangle((cx + DIM["batt_x"] - DIM["batt_w"] / 2,
                            cy + DIM["batt_y"] - DIM["batt_d"] / 2),
                           DIM["batt_w"], DIM["batt_d"], fc="#d8dde2", ec=GREY, lw=1.0))
    ax.text(cx + DIM["batt_x"], cy + DIM["batt_y"], "bateri 3.7 V", fontsize=6.5,
            ha="center", va="center", color=GREY)
    for sgn, nm in ((-1, "Hall L"), (1, "Hall R")):
        ax.add_patch(Rectangle((cx + sgn * DIM["hall_x"] - 6, cy - 3.5), 12, 7,
                               fc="white", ec="#1e7a44", lw=1.0))
    ext(ax, (0, 0), (-30, 0)); ext(ax, (W, 0), (W + 30, 0))
    dim(ax, (0, 0), (W, 0), f"{W}", off=-45)
    ext(ax, (0, 0), (0, -40)); ext(ax, (0, D), (0, D + 40))
    dim(ax, (0, 0), (0, D), f"{D}", off=-60, vertical=True)
    ax.text(0, -105, "Cavity dalaman: 300 x 140 x 450 mm. Loop mendatar pada z 150 mm;\n"
                     "elektronik di dasar cavity; Hall sensor di bibir zip.",
            fontsize=7.5, color="#5a646e")

    # ---------- JADUAL + amaran
    ax = fig.add_subplot(gs[1, 1])
    ax.axis("off")
    rows = [
        ("Saiz luar beg", f"{W} x {D} x {H}"),
        ("Cavity dalaman", f"{W - 2*DIM['wall']} x {D - 2*DIM['wall']} x {H - 10}"),
        ("Tebal fabrik (andaian)", f"{DIM['wall']}"),
        ("Antenna loop", f"{DIM['loop_w']} x {DIM['loop_d']}, tinggi z {DIM['loop_z']}"),
        ("Bezel E-paper", f"{DIM['bezel_w']} x {DIM['bezel_h']} x {DIM['bezel_d']}"),
        ("Panel E-paper", f"{DIM['panel_w']} x {DIM['panel_h']}"),
        ("Poket depan", f"{DIM['pocket_w']} x {DIM['pocket_h']}"),
        ("Modul RFID YRM100", f"{DIM['rfid_w']} x {DIM['rfid_d']} x {DIM['rfid_h']}"),
        ("ESP32-S3", f"{DIM['esp_w']} x {DIM['esp_d']} x {DIM['esp_h']}"),
        ("Bateri Li-Po", f"{DIM['batt_w']} x {DIM['batt_d']} x {DIM['batt_h']}"),
    ]
    ax.text(0.0, 0.96, "D. JADUAL DIMENSI", fontsize=10, fontweight="bold", color=INK)
    y = 0.88
    for k, v in rows:
        ax.text(0.0, y, k, fontsize=8.2, color=GREY)
        ax.text(0.58, y, v, fontsize=8.2, color=INK, fontweight="bold")
        ax.plot([0.0, 0.95], [y - 0.022, y - 0.022], color="#e6eaee", lw=0.6)
        y -= 0.072
    ax.add_patch(Rectangle((0.0, 0.02), 0.95, 0.13, fc="#fff4e8", ec=ACC, lw=1.2))
    ax.text(0.02, 0.115, "AMARAN — ANGKA INI BELUM DIUKUR", fontsize=9, color=ACC,
            fontweight="bold")
    ax.text(0.02, 0.055, "Semua dimensi ialah andaian beg pelajar biasa.\nUkur beg sebenar, tukar DIM, jana semula.",
            fontsize=7.8, color=INK)

    fig.suptitle("BagSense — reka bentuk beg dan susun atur komponen (draf reka bentuk)",
                 fontsize=14, fontweight="bold", color=INK, x=0.05, ha="left", y=0.965)
    fig.text(0.05, 0.925, "BICS 4321 FYP1 · Ahmad Adam Hakimi (2418711) · Amru Hazem (2419467) · "
                          "dijana 1 Nov 2026 daripada build_bagsense_model_v9.py",
             fontsize=8.5, color=GREY)

    p = os.path.join(OUT, f"figure_blueprint_{VER}.png")
    fig.savefig(p, facecolor="white")
    plt.close(fig)
    print("BLUEPRINT:", p)


# ---------------------------------------------------------------------------
# 2. WIRING DIAGRAM
# ---------------------------------------------------------------------------
def wiring():
    fig, ax = plt.subplots(figsize=(14.5, 9.5), dpi=200)
    fig.patch.set_facecolor("white")
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 68)
    ax.axis("off")

    def blk(x, y, w, h, title, sub, fc="#f4f7fa", ec=GREY):
        ax.add_patch(Rectangle((x, y), w, h, fc=fc, ec=ec, lw=1.4, zorder=2))
        ax.text(x + w / 2, y + h - 3.2, title, ha="center", va="top", fontsize=9.5,
                fontweight="bold", color=INK, zorder=3)
        ax.text(x + w / 2, y + h - 8.0, sub, ha="center", va="top", fontsize=7.6,
                color="#4a545e", zorder=3)

    def wire(x1, y1, x2, y2, label, color="#2b6cb0", ls="-", style="->", dx=0, dy=1.4):
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle=style, color=color, lw=1.3, ls=ls),
                    zorder=1)
        ax.text((x1 + x2) / 2 + dx, (y1 + y2) / 2 + dy, label, ha="center", va="bottom",
                fontsize=7.4, color=color, zorder=4,
                bbox=dict(fc="white", ec="none", pad=0.8))

    # kuasa
    blk(4, 46, 20, 15, "Li-Po 3.7 V", "3000 mAh + TP4056\n(protection board)", "#fff4e8", ACC)
    blk(32, 46, 18, 15, "Boost 5 V", "step-up, ≥1 A\n+ cap 470–1000 µF", "#fff4e8", ACC)
    blk(58, 46, 20, 15, "YRM100 UHF", "5 V, puncak ~0.9–1 A\n919–923 MHz", "#e8f3ec", "#1e7a44")
    blk(84, 46, 13, 15, "Antenna", "loop 270 x 120", "#fff", "#1e7a44")

    # logik
    blk(20, 20, 26, 18, "ESP32-S3", "dual-core 240 MHz\nBLE 5.0 + Wi-Fi", "#eef2f7")
    blk(58, 20, 20, 18, "E-paper 2.9\"", "SPI, 3.3 V\n3-wire + BUSY", "#eef2f7")
    blk(4, 4, 22, 13, "Hall A3144 x2", "zip open/close\nGPIO interrupt", "#eef2f7")
    blk(36, 4, 20, 13, "Zipper magnet", "mekanikal", "#f7f8f9")
    blk(66, 4, 30, 13, "App Flutter", "BLE GATT client\n(telefon)", "#eef2f7")

    # wayar kuasa
    wire(24, 53, 32, 53, "3.7 V", ACC)
    wire(50, 53, 58, 53, "5 V", ACC)
    wire(78, 53, 84, 53, "RF out", "#1e7a44")
    wire(38, 46, 34, 38, "5 V → regulator 3.3 V", ACC, style="-")

    # wayar data
    wire(46, 29, 58, 29, "SPI  SCK / MOSI / CS / DC / RST / BUSY", "#2b6cb0", dy=-2.6)
    wire(25, 20, 25, 17, "GPIO in (x2)", "#2b6cb0")
    wire(36, 38, 64, 46, "UART  TX / RX  (3.3 V logic)", "#2b6cb0", dy=1.2)
    wire(80, 20, 81, 17, "BLE", "#2b6cb0")

    # anotasi penting
    ax.text(50, 63.5, "PENTING: modul YRM100 perlukan 5 V dan boleh tarik ~1 A masa satu "
                      "pusingan inventori.\nBekalan 3.3 V terus daripada papan ESP32 tidak cukup — "
                      "perlu boost + kapasitor dekat VCC modul.",
            fontsize=8.2, color="#8a3b00", ha="center",
            bbox=dict(fc="#fff4e8", ec=ACC, lw=1.0, pad=4))

    ax.text(2, 66, "BagSense — gambarajah blok dan wayar (draf)", fontsize=13,
            fontweight="bold", color=INK)
    ax.text(2, 1.0, "Semua aras voltan dan pin ialah reka bentuk cadangan, bukan hasil ujian. "
                    "Sahkan dengan datasheet sebelum menyolder.",
            fontsize=7.6, color="#5a646e")

    p = os.path.join(OUT, f"figure_wiring_{VER}.png")
    fig.savefig(p, facecolor="white", bbox_inches="tight")
    plt.close(fig)
    print("WIRING:", p)


# ---------------------------------------------------------------------------
# 3. LABEL pada render top view (unjuran ortho tepat)
# ---------------------------------------------------------------------------
def labelled_layout():
    src = os.path.join(OUT, "render_top_v9.png")
    dst = os.path.join(OUT, f"figure_layout_labelled_{VER}.png")
    im = Image.open(src).convert("RGB")
    dr = ImageDraw.Draw(im)

    Wd, Hd = im.size
    ORTHO = 430.0                 # ortho_scale (unit = mm)
    scale = Wd / ORTHO            # px per mm
    cam_x, cam_y = 0.0, 10.0
    cx, cy = Wd / 2, Hd / 2

    def proj(x, y):
        return (cx + (x - cam_x) * scale, cy - (y - cam_y) * scale)

    try:
        font = ImageFont.truetype("arialbd.ttf", 30)
        font_s = ImageFont.truetype("arial.ttf", 26)
        font_t = ImageFont.truetype("arialbd.ttf", 40)
    except Exception:
        font = font_s = font_t = ImageFont.load_default()

    D = DIM
    targets = [
        ((0, D["batt_y"]), "Bateri Li-Po 3.7 V\n3000 mAh", (560, 175)),
        ((0, D["loop_d"] / 2), "Antenna loop (belakang)", (1150, 150)),
        ((0, -D["loop_d"] / 2), "Antenna loop (depan)", (330, 1290)),
        ((D["rfid_x"], D["rfid_y"]), "Modul RFID YRM100\n919-923 MHz", (170, 600)),
        ((D["esp_x"], D["esp_y"]), "ESP32-S3", (1300, 620)),
        ((D["hall_x"], 0), "Hall sensor (bibir zip)", (1360, 860)),
        ((-140, -40), "Zip pull / mula scan", (120, 950)),
        ((0, -D["bag_d"] / 2 - 20), "Bezel E-paper (di luar beg)", (880, 1310)),
    ]

    for (wx, wy), text, (lx, ly) in targets:
        px, py = proj(wx, wy)
        dr.line([(px, py), (lx, ly)], fill=(200, 90, 10), width=4)
        dr.ellipse([px - 9, py - 9, px + 9, py + 9], fill=(200, 90, 10))
        for i, line in enumerate(text.split("\n")):
            dr.text((lx + 14, ly - 20 + i * 34), line, font=font, fill=(20, 22, 26))

    dr.text((30, 30), "BagSense — susun atur dalam cavity (pandangan atas, ortho)",
            font=font_t, fill=(20, 22, 26))
    dr.text((30, 80), "Dimensi dalam fail ini masih ANDAIAN — belum diukur pada beg sebenar.",
            font=font_s, fill=(160, 70, 10))

    im.save(dst)
    print("LABELLED:", dst)


if __name__ == "__main__":
    blueprint()
    wiring()
    labelled_layout()
