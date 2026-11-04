# Reka bentuk hardware BagSense — set v10

Dibuat 1 Nov 2026 untuk meeting supervisor Rabu 4 Nov 2026, 09:00.

## AMARAN PALING PENTING

**Semua dimensi dalam fail ini ialah ANDAIAN**, bukan ukuran beg sebenar.
Beg diandaikan 320 × 160 × 460 mm (luar), cavity 300 × 140 × 450 mm.

Blueprint tanpa ukuran sebenar hanya rekaan yang kelihatan kemas. Ukur beg, tukar `DIM`
dalam `v10/build_bagsense_model_v10.py` dan `figures/make_figures_v1.py`, jana semula — semua imej
berubah ikut nombor baru.

## Susunan folder (diasingkan ikut versi)

```
hardware_design_v1/
├── README.md                          fail ini
├── 2026-11-01_senarai_beli_komponen_v1.md
├── v1/  … v10/                        satu folder = satu iterasi reka bentuk
│     build_bagsense_model_vN.py       skrip penjana versi itu
│     bagsense_model_vN.blend/.glb/.obj/.mtl
│     render_*_vN.png                  render ortho versi itu
├── figures/                           output merentas versi (dibina dari render v9)
│     make_figures_v1.py, figure_blueprint_v1.png, figure_wiring_v1.png,
│     figure_layout_labelled_v1.png
└── sheets/                            helaian pembentangan
      make_sheet_v1.py, make_sheet_v2.py, sheet_hardware_design_v1.png,
      sheet_hardware_design_v2.png
```

Setiap skrip menulis output **di sebelah dirinya sendiri** (`OUT = dirname(__file__)`), jadi
skrip v3 dalam `v3/` sentiasa menjana semula `render_*_v3.png` dalam `v3/`. Skrip dalam
`figures/` dan `sheets/` membaca render daripada `../v9/`.

## Fail mana yang dipakai (versi semasa = v10)

| Fail | Apa dia |
|---|---|
| `sheets/sheet_hardware_design_v2.png` | Satu helaian 4 panel — yang tunjuk kepada supervisor dulu |
| `v10/render_iso_v10.png` | Rupa beg, pandangan isometrik ortho |
| `v10/render_front_v10.png` | Pandangan depan (elevation) — E-paper + poket |
| `v10/render_side_v10.png` | Pandangan sisi — profil 160 mm |
| `v10/render_top_v10.png` | Pandangan atas — susun atur dalam cavity |
| `v10/render_interior_v10.png` | Pandangan menembusi bukaan atas |
| `v10/render_section_v10.png` | Keratan depan (panel depan, poket, bezel disembunyikan) |
| `v10/render_wireframe_iso_v10.png` | Wireframe struktur + komponen dalaman |
| `figures/figure_blueprint_v1.png` | Blueprint berdimensi: 3 pandangan + jadual dimensi |
| `figures/figure_wiring_v1.png` | Gambarajah blok + wayar (kuasa, UART, SPI, Hall, BLE) |
| `figures/figure_layout_labelled_v1.png` | Render atas dengan label komponen |
| `v10/bagsense_model_v10.blend` | Fail Blender — sumber sebenar, boleh dibuka dan disunting |
| `v10/bagsense_model_v10.glb` | Model 3D untuk viewer / pembentangan |
| `v10/bagsense_model_v10.obj` + `.mtl` | Model 3D format universal |

## Skrip (jana semula bila dimensi berubah)

Jalankan dari mana-mana folder — semua skrip guna laluan relatif kepada failnya sendiri.

```
"C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" --background \
   --python Week05_26Oct-01Nov/Output/hardware_design_v1/v10/build_bagsense_model_v10.py
python Week05_26Oct-01Nov/Output/hardware_design_v1/figures/make_figures_v1.py
python Week05_26Oct-01Nov/Output/hardware_design_v1/sheets/make_sheet_v2.py
```

Bila mula versi baru: `cp -r v10 v11`, tukar `VER = "v10"` → `"v11"` dalam skrip dan dalam
`make_figures_v1.py`, kemudian jana semula. Jangan timpa folder versi lama.

## Versi lama — jangan dipadam

`v1/` … `v9/` (render + model setiap iterasi) ialah sejarah. Satu folder = satu versi.
Yang penting:

- **v1** fabrik hitam, cahaya terlalu kuat → imej melecur putih.
- **v2** boolean pada shell merosakkan geometri (silhouette jadi kon).
- **v3** panel shell betul, tetapi cavity gelap.
- **v4** kamera ortho, semua render **kosong**.
- **v5–v10** punca sebenar dibaiki: `camera clip_end` lalai 100 unit, manakala beg 460 unit
  tinggi dan kamera ~1500 unit jauh — semua geometri terpotong. `clip_end` dinaikkan 20000.
- **v6–v10** wireframe guna Wireframe modifier + emission (workbench WIREFRAME keluar kosong
  pada Blender 5.2 headless), kamera interior dinaikkan supaya nampak masuk cavity,
  pemegang beg ditambah, section disembunyikan panel hadapan.

Fail v1–v9 kekal di disk untuk sejarah, tetapi **tidak dimasukkan ke git** (saiz render
~2.4 MB setiap satu). Lihat `.gitignore`.

## Apa yang belum ada

- Ukuran beg sebenar (paling penting)
- Pengesahan pin ESP32-S3 → YRM100 daripada datasheet
- Cetakan enclosure + test-fit
- Beban / toleransi snap-fit
- Rupa estetik (dibuang sampai FYP2 mengikut pelan induk)
