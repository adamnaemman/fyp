#!/usr/bin/env python
"""Gabung rajah aliran jadi SATU PDF: 2026-11-08_flow_register_barang_v2.pdf

Sumber:
  A = ../2026-11-08_flow_register_barang_v1.pdf      (3 halaman, landskap) — dijana oleh gen_v1
  B = ../../../01_Planning/bagsense-rfid-flow.pdf    (2 halaman, potret)  — rajah sedia ada, TIDAK diubah

Susunan akhir (6 halaman):
  1  muka depan + isi kandungan (landskap)
  2  A/p1  siapa bercakap dengan siapa
  3  B/p2  tiga lapisan komunikasi + had UHF
  4  A/p2  aliran register barang (9 langkah)
  5  B/p1  lima peringkat pemeriksaan beg
  6  A/p3  logik MISSING = katalog - bacaan

Jalankan: python 2026-11-08_gabung_flow_gen_v1.py
"""
import os

import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.normpath(os.path.join(HERE, "..", "2026-11-08_flow_register_barang_v1.pdf"))
B = os.path.normpath(os.path.join(HERE, "..", "..", "..", "01_Planning", "bagsense-rfid-flow.pdf"))
OUT = os.path.normpath(os.path.join(HERE, "..", "2026-11-08_flow_register_barang_v2.pdf"))

INK = (0.10, 0.10, 0.10)
MUTED = (0.37, 0.40, 0.42)
BLUE = (0.082, 0.396, 0.753)

# (fail sumber, indeks halaman sumber 0-based)
ORDER = [(A, 0), (B, 1), (A, 1), (B, 0), (A, 2)]

doc = pymupdf.open()

# ---------------------------------------------------------------- muka depan
cover = doc.new_page(width=841.89, height=595.28)  # A4 landskap, pt
cover.draw_rect(pymupdf.Rect(0, 0, 841.89, 595.28), color=None, fill=(1, 1, 1))
cover.draw_rect(pymupdf.Rect(48, 48, 793.89, 547.28), color=(0.78, 0.82, 0.86), width=1.2)

cover.insert_text((72, 108), "BagSense", fontsize=30, fontname="hebo", color=INK)
cover.insert_text((72, 140),
                  "Aliran data, pendaftaran barang, dan pengesanan barang tertinggal",
                  fontsize=15, fontname="helv", color=INK)
cover.insert_text((72, 166), "Rajah reka bentuk untuk Bab 3 (Metodologi)  ·  draf v1  ·  6 halaman",
                  fontsize=10.5, fontname="helv", color=MUTED)

cover.insert_text((72, 210), "Ahmad Adam Hakimi bin Naeman (2418711)", fontsize=11, fontname="helv", color=INK)
cover.insert_text((72, 228), "Amru Hazem bin Ahmad Tarmizi (2419467)", fontsize=11, fontname="helv", color=INK)
cover.insert_text((72, 246), "BICS 4321 Final Year Project 1  ·  IIUM KICT  ·  8 November 2026",
                  fontsize=10.5, fontname="helv", color=MUTED)

cover.insert_text((72, 296), "ISI KANDUNGAN", fontsize=11, fontname="hebo", color=BLUE)

toc = [
    ("2", "Siapa bercakap dengan siapa", "topologi fizikal: tag → reader → ESP32 → telefon; kenapa tiada laluan terus"),
    ("3", "Tiga lapisan komunikasi", "UHF, BLE, dan had fizikal RFID (logam, cecair, multipath)"),
    ("4", "Aliran register barang", "9 langkah: tampal tag, daftar, ikat EPC, simpan ke telefon + flash ESP32"),
    ("5", "Lima peringkat pemeriksaan beg", "persediaan → daftar → baseline → semakan → selesai"),
    ("6", "Logik MISSING = katalog − bacaan", "macam mana beg putuskan barang tak cukup + 3 perangkap"),
]
y = 322
for num, title, sub in toc:
    cover.insert_text((72, y), num, fontsize=11, fontname="hebo", color=BLUE)
    cover.insert_text((96, y), title, fontsize=11, fontname="hebo", color=INK)
    cover.insert_text((340, y), f"— {sub}", fontsize=9.5, fontname="helv", color=MUTED)
    y += 26

box = pymupdf.Rect(72, 460, 770, 520)
cover.draw_rect(box, color=(0.86, 0.42, 0.16), fill=(1, 0.97, 0.88), width=1.2)
provenance = [
    "Asal rajah: halaman 2, 4, 6 dijana oleh 2026-11-08_flow_register_barang_gen_v1.py;",
    "halaman 3 dan 5 ialah rajah sedia ada (01_Planning/bagsense-rfid-flow.pdf) yang digabungkan TANPA diubah.",
    "Rajah reka bentuk, bukan pengukuran hardware — semua angka julat mesti diukur semula bila komponen sampai.",
]
yy = 480
for line in provenance:
    cover.insert_text((86, yy), line, fontsize=8.8, fontname="helv", color=(0.45, 0.25, 0.05))
    yy += 15

# ---------------------------------------------------------------- halaman isi
for path, idx in ORDER:
    src = pymupdf.open(path)
    if idx >= src.page_count:
        raise SystemExit(f"{path} tiada halaman {idx + 1}")
    doc.insert_pdf(src, from_page=idx, to_page=idx)
    src.close()

# nombor halaman, kanan atas
total = doc.page_count
for i in range(1, total):
    page = doc[i]
    r = page.rect
    page.insert_text((r.width - 78, 20), f"{i + 1} / {total}",
                     fontsize=8, fontname="helv", color=MUTED)

doc.set_metadata({"title": "BagSense — aliran data dan pendaftaran barang (draf v1)",
                  "author": "Ahmad Adam Hakimi (2418711), Amru Hazem (2419467)",
                  "subject": "BICS 4321 FYP1 — rajah untuk Bab 3"})
doc.save(OUT, garbage=4, deflate=True)
doc.close()

print("ditulis:", OUT)
chk = pymupdf.open(OUT)
print("halaman:", chk.page_count)
for i, p in enumerate(chk):
    r = p.rect
    print(f"  {i + 1}: {r.width * 25.4 / 72:.0f} x {r.height * 25.4 / 72:.0f} mm")
print("saiz:", os.path.getsize(OUT), "bait")
