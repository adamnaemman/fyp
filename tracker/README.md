# tracker/ — laman progres FYP1 BagSense

Satu halaman HTML yang dibaca terus dari fail projek. Tiada angka yang direka, tiada data
dimasukkan dua kali: kalau kau tukar README minggu, TASKBOARD atau FACTS, halaman ini ikut berubah
bila dijana semula.

## Buka

| Cara | Arahan | Bila guna |
|---|---|---|
| Fail statik | buka `tracker/index.html` (atau klik dua kali `mula.bat`) | nak tengok sekarang, nak hantar kepada orang |
| Hidup | `python tracker/build_tracker.py --serve` → http://127.0.0.1:9310 | sedang kerja: refresh = data terbaharu, tiada jana manual |
| Jana semula | `python tracker/build_tracker.py` | selepas tanda kotak / kemas kini TASKBOARD |
| Semak data mentah | `python tracker/build_tracker.py --json` | nak tahu skrip baca apa sebenarnya |

Python yang dipakai: `C:\Users\AHMAD ADAM HAKIMI\AppData\Local\Programs\Python\Python311\python.exe`.
Skrip guna stdlib sahaja (tiada pip install).

## Dari mana setiap angka datang

| Di halaman | Sumber sebenar |
|---|---|
| Minggu lepas / minggu aktif | tarikh dalam baris pertama `Week*/README.md`, dibandingkan dengan tarikh hari ini |
| Item fokus `n / 40` | kotak `- [ ]` / `- [x]` dalam `## Fokus minggu ini` setiap README |
| Tugasan `n / 12` | jadual `crew/TASKBOARD.md` (Batch 1–3), status = lajur terakhir |
| Tersekat | jadual `## Sekat — perlu Adam` dalam TASKBOARD |
| Tarikh penting | senarai `## Tarikh` dalam `crew/FACTS.md` |
| Bahan bukti | kiraan fail dalam `Week*/Output` dan `Week*/Report` |
| Spesifikasi terkunci | `## Spesifikasi yang dikunci` dalam FACTS |
| Plan B / Plan C | bahagian 5 `01_Planning/FYP1_Execution_Plan_W5-W13.md` |
| `% masa berlalu` | (hari ini − minggu pertama) ÷ (jumlah hari semua minggu bertarikh) |

## Perkara yang sengaja TIDAK dibuat

1. **Tiada lencana "gate lulus".** Skrip cuma tahu berapa fail ada dalam `Output/`. Ia tidak tahu
   sama ada ujian benar-benar dijalankan. Gate dilabel sebagai teks sahaja; penentuan lulus
   kekal pada Adam. Laman yang mengaku "gate lulus" tanpa bukti ialah laman yang menipu.
2. **Tiada borang / butang simpan.** Halaman ini baca sahaja, sama seperti peraturan dashboard:
   tulisan berlaku di fail sumber, bukan di halaman.
3. **Scaffolding Flutter tak dikira.** Folder `android/`, `ios/`, `web/`, `res/` dan seumpamanya
   dijana `flutter create` — kalau dikira, "138 bahan bukti" akan jadi 263 dan angka itu tak bermakna.
4. **Kotak tak ditanda = belum.** Kalau kerja sudah siap tetapi `- [x]` belum ditanda, ia dikira belum.
   Itu disengajakan: tracker patut mendorong fail dikemas kini, bukan meneka.

## Kemas kini biasa

```bash
# 1. tanda kotak dalam README minggu
python -c "print('edit Week07_09Nov-15Nov/README.md')"
# 2. tukar status dalam crew/TASKBOARD.md   (brief → jalan → semak → siap)
# 3. jana semula
python tracker/build_tracker.py
```

## Fail dalam folder ini

- `build_tracker.py` — satu-satunya sumber. Kumpul data (`collect()`) dan hasilkan HTML (`render()`).
- `index.html` — **dijana**, jangan edit tangan; akan ditimpa setiap kali jana semula.
  (Fail dijana dikecualikan daripada peraturan nama `YYYY-MM-DD_tajuk_vN`, sama seperti `FILE-INDEX.md`.)
- `mula.bat` — klik dua kali: jana semula, buka browser, hidang di port 9310.
- `README.md` — fail ini.

## Had yang diketahui

- Tarikh minggu dibaca dari baris pertama README. Kalau baris itu diubah bentuk, minggu itu
  akan tunjuk "tarikh tak terbaca" — bukan crash.
- Nama bulan Melayu dan Inggeris (`Dis`/`Dec`, `Ogo`/`Aug`) dua-dua diterima.
- Halaman tiada JavaScript: tiada penapis, tiada carian. Kalau bilangan minggu naik jauh,
  tambah penapis kemudian, bukan sekarang.
