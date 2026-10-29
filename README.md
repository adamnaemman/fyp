# BagSense - FYP1 working folder

Student: Ahmad Adam Hakimi bin Naeman (2418711) + Amru Hazem bin Ahmad Tarmizi (2419467)
Course: BICS 4321 Final Year Project 1
Showcase: INNOVATEX, Friday 30 Dec 2026 (TBC)

---

## Struktur folder

```
D:\FYP
├── 00_Reference\        bahan rujukan - tak berubah sepanjang semester
│   ├── Datasheets\      TRM ESP32-S3, datasheet modul
│   ├── Papers\          kertas akademik yang disitasi
│   ├── Template\        template progress report IIUM
│   └── Ideas_OtherProjects\  cadangan projek lain (bukan BagSense)
├── 01_Planning\         pelan, jadual, WBS
│   ├── FYP1_Execution_Plan_W5-W13.md   pelan induk
│   ├── BagSense_wbs_gantt.pod          Gantt (ProjectLibre)
│   └── Schedule\        jadual seminar rasmi
├── 02_Proposal\         proposal (versi pelajar + versi betul)
│   └── Archive\         draf lama
├── Week05_26Oct-01Nov\
├── Week06_02Nov-08Nov\
├── Week07_09Nov-15Nov\
├── Week07B_SemBreak_16Nov-22Nov\   cuti semester - waktu build
├── Week08_23Nov-29Nov\
├── Week09_30Nov-06Dec\
├── Week10_07Dec-13Dec\
├── Week11_14Dec-20Dec\
├── Week12_21Dec-27Dec\   semua mesti siap
├── Week13_28Dec-03Jan\   INNOVATEX showcase
└── Week14_05Jan-11Jan\   buffer
```

Setiap folder minggu ada:

- `Report\` - draf bab laporan untuk minggu itu
- `Output\` - hasil kerja minggu itu: kod, gambar rajah, CSV, gambar, video
- `README.md` - seminar minggu itu, fokus, dan **gate** (ujian yang korang boleh jalankan sendiri)

---

## Peraturan

1. **Setiap fail baru masuk folder minggu ia dibuat.** Bukan simpan di root.
2. **Nama fail: `YYYY-MM-DD_tajuk_vN`** - contoh `2026-11-05_pilot_cavity_5tag_v1.csv`.
   Jangan guna "final", "final2", "betul". Versi lama kekal, naikkan nombor saja.
3. **Angka mesti ada fail bukti.** Setiap nombor dalam laporan (recall, latency, hari bateri)
   mesti boleh dijejak ke CSV atau bacaan meter dalam `Output\` minggu berkenaan.
4. **Report vs Output:** `Report\` untuk teks yang masuk laporan; `Output\` untuk benda yang
   menjana atau menyokong teks itu.
5. **Jangan buat kerja minggu lain dalam minggu ini.** Kalau tertinggal, catat dalam README
   minggu itu dan bawa ke `Week07B` (cuti semester) sebagai buffer.

---

## Kalendar rasmi (dari jadual seminar FYP1)

| Minggu | Tarikh (Jumaat) | Seminar |
|---|---|---|
| 5 | 30 Okt 2026 | Seminar 3 - AI research tools ethically; Chapter 2 Literature Review & reference tool |
| 6 | 06 Nov 2026 | - |
| 7 | 13 Nov 2026 | Seminar 4 - Chapter 3 Methodology |
| - | 16-22 Nov 2026 | **Cuti semester** - buffer build, bukan cuti |
| 8 | 27 Nov 2026 | Seminar 5 - Development Framework |
| 9 | 04 Dis 2026 | Seminar 6 - Prototype Design (UI/UX) |
| 10 | 11 Dis 2026 | - |
| 11 | 18 Dis 2026 | Seminar 7 - Innovatex (FYP Showcase) briefing |
| 12 | 25 Dis 2026 | - (deliverables mesti tutup) |
| 13 | 30 Dis 2026 | **INNOVATEX - FYP Showcase** (tarikh TBC) |
| 14 | 08 Jan 2027 | - |

Jadual asal: `01_Planning\Schedule\FYP1_Seminar_Schedule_Official.png`

---

## Bahan belajar dan rujukan

   02_Proposal\References_IoT.md       18 kertas beranotasi, DOI disahkan Crossref, dipetakan ke bab
   01_Planning\IoT_Learning_Roadmap.md 38 jam belajar IoT, ikut lapis, ada proof-of-learning + checkpoint
   01_Planning\IoT_Glossary.md         32 istilah yang mesti boleh terangkan + 3 ayat sedia untuk Q&A

---

## Status sekarang (hujung minggu 5)

- [x] Proposal dikemas: objectives 5 → 4, band 865-868 → 919-923 MHz, kategori AI → IoT/Embedded, senarai rujukan ditambah
- [x] Design pack: architecture, sequence, wireframes, storyboard (`Week05\Output\`)
- [ ] Komponen belum diorder
- [ ] Mesej kepada supervisor belum dihantar

Rujuk `01_Planning\FYP1_Execution_Plan_W5-W13.md` untuk jadual penuh, Plan B/C dan template mesej supervisor.
