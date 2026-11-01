# Reka bentuk hardware BagSense — set v10

Dibuat 1 Nov 2026 untuk meeting supervisor Rabu 4 Nov 2026, 09:00.

## AMARAN PALING PENTING

**Semua dimensi dalam fail ini ialah ANDAIAN**, bukan ukuran beg sebenar.
Beg diandaikan 320 × 160 × 460 mm (luar), cavity 300 × 140 × 450 mm.

Blueprint tanpa ukuran sebenar hanya rekaan yang kelihatan kemas. Ukur beg, tukar `DIM`
dalam `build_bagsense_model_v10.py` dan `make_figures_v1.py`, jana semula — semua imej
berubah ikut nombor baru.

## Fail mana yang dipakai (versi semasa)

| Fail | Apa dia |
|---|---|
| `sheet_hardware_design_v2.png` | Satu helaian 4 panel — yang tunjuk kepada supervisor dulu |
| `render_iso_v10.png` | Rupa beg, pandangan isometrik ortho |
| `render_front_v10.png` | Pandangan depan (elevation) — E-paper + poket |
| `render_side_v10.png` | Pandangan sisi — profil 160 mm |
| `render_top_v10.png` | Pandangan atas — susun atur dalam cavity |
| `render_interior_v10.png` | Pandangan menembusi bukaan atas |
| `render_section_v10.png` | Keratan depan (panel depan, poket, bezel disembunyikan) |
| `render_wireframe_iso_v10.png` | Wireframe struktur + komponen dalaman |
| `figure_blueprint_v1.png` | Blueprint berdimensi: 3 pandangan + jadual dimensi |
| `figure_wiring_v1.png` | Gambarajah blok + wayar (kuasa, UART, SPI, Hall, BLE) |
| `figure_layout_labelled_v1.png` | Render atas dengan label komponen |
| `bagsense_model_v10.blend` | Fail Blender — sumber sebenar, boleh dibuka dan disunting |
| `bagsense_model_v10.glb` | Model 3D untuk viewer / pembentangan |
| `bagsense_model_v10.obj` + `.mtl` | Model 3D format universal |

## Skrip (jana semula bila dimensi berubah)

```
"C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" --background \
   --python build_bagsense_model_v10.py          # render semua pandangan + .blend/.glb/.obj
python make_figures_v1.py                        # blueprint + wiring + layout berlabel
python make_sheet_v2.py                          # helaian 4 panel
```

## Versi lama — jangan dipadam

`render_*_v1..v9.png` dan `bagsense_model_v1..v9.*` ialah sejarah iterasi. Yang penting:

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
