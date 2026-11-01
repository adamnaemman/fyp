# Plan tugas supervisor — meeting Rabu 4 Nov 2026, 09:00

Draf v1. Ditulis 1 Nov 2026 12:55.
Sumber arahan: apa yang Adam sampaikan secara lisan (1 Nov 2026). **Belum ada salinan bertulis
daripada supervisor** — kalau ayat sebenar dia berbeza, fail ni kena betulkan, bukan laporan.

Status proposal sekarang: 4 objectives (`02_Proposal/..._CORRECTED.docx`, 29 Okt 12:33).
Supervisor minta 3. Fail tu akan jadi basi — jangan sunting di tempat asal, buat `_v2`.

---

## 0. Jam sebenar

| | |
|---|---|
| Sekarang | Ahad 1 Nov 2026, 12:55 |
| Deadline | Rabu 4 Nov 2026, 09:00 |
| Jam berbaki | 68.1 jam (2.8 hari) |
| Blok kerja praktikal | 38 j/orang — Ahad 10 j, Isnin 14 j, Selasa 12 j, Rabu pagi 2 j |
| Jumlah tenaga | 76 jam untuk 2 orang |

Anggaran kerja dalam plan ni: **~42 j**. Jadi ada buffer ~34 j. Buffer tu nampak besar tapi
sebahagian besarnya habis pada kerja yang **tak boleh jalan serentak** (blueprint tak boleh mula
sebelum beg diukur), dan pada kompilasi template yang selalu ambil masa dua kali ganda.

---

## 1. Lima arahan → enam deliverable

| # | Arahan supervisor | Deliverable | Owner | Jam |
|---|---|---|---|---|
| D1 | Problem statement **1 perenggan** | Teks siap, masuk template §Problem Description | Adam | 1.5 |
| D2 | Objectives **3 sahaja** (kini 4) | 3 objectives, setiap satu ada angka boleh ukur | Adam | 1 |
| D3 | **5 modul** dari objectives; 2 modul siap dalam FYP1 | Jadual 3 objectives → 5 modul + tanda mana siap FYP1/FYP2 | Adam | 2 |
| D4 | **Hardware design penuh** | Ukuran beg, blueprint berdimensi, BOM, 3D model, render penampilan, wiring diagram | Adam + Amru | 26 |
| D5 | **Market study 3 produk betul-betul** | Versi v2 `Commercial_Comparison` + lajur "apa reka bentuk produk ni ajar BagSense" | Amru | 6 |
| D6 | — | Kompilasi ke template IIUM, eksport PDF, page-check, senarai rajah/jadual | Adam | 6 |
| | | | **Jumlah** | **42.5** |

D6 bukan arahan supervisor, tapi tanpa ia kau bawa nota bertaburan ke meeting, bukan dokumen.

---

## 2. Empat benda tak konsisten yang aku nampak — bawa ke meeting

### 2.1 Tiga objectives, lima modul
Bukan masalah, **asal ada jadual pemetaan dalam laporan**. 5 modul dari 3 objectives bermaksud
dua objectives pecah kepada dua modul setiap satu. Kalau jadual tu tiada, soalan pertama
supervisor ialah "macam mana 3 jadi 5?" dan jawapan lisan hilang selepas meeting.

### 2.2 Modul 1 app + modul 2 hardware — tiada modul yang membuktikan bacaan tag
Ini lubang paling besar dalam rancangan sekarang.

- App Flutter tanpa firmware ESP32 = UI yang tiada sumber data. Demonya guna data palsu.
- Hardware tanpa bring-up reader = kotak dengan komponen dalam, tiada bukti UHF boleh baca
  tag dalam cavity fabrik.
- Klaim utama projek ni (baca tag tanpa line of sight dalam beg) jatuh **di antara** dua modul
  tu — ia kerja firmware + RF, iaitu modul 3 dalam senarai 5.

Tiga pilihan, dengan kos masing-masing:

| Pilihan | Maksud | Kos |
|---|---|---|
| **A (cadangan)** | Modul 2 "hardware" **termasuk** bring-up reader — satu tag dibaca dalam udara terbuka, log ke CSV | Firmware minimum masuk dalam modul hardware; kena tulis jelas dalam skop supaya tak nampak macam sorok kerja |
| B | 2 modul siap = app + firmware/RF; hardware tinggal **reka bentuk** sahaja | Tiada beg fizikal di showcase; tapi ini sepadan dengan apa yang supervisor minta (design, bukan build) |
| C | Ikut rancangan asal: app + hardware | FYP1 tiada angka bacaan langsung; semua pengukuran ke FYP2. Laporan FYP1 jadi lemah pada bab penilaian |

Aku cadang **A**, sebab modul "hardware" yang tiada satu bacaan pun ialah dakwaan, bukan hasil.
Satu tag dibaca dalam udara terbuka cukup untuk menukar status modul daripada "dibina" kepada
"disahkan".

### 2.3 "Hardware design fully" — dokumen atau benda fizikal?
Arahan dia sebut **design** (rupa beg, item, wireframe, blueprint, 3D model). Itu semua dokumen.
Tapi kalau tiada enclosure bercetak, blueprint kau masih teori yang belum diuji fit.
Cadangan: hantar design penuh seperti diminta, dan nyatakan dengan jujur dalam laporan bahawa
cetakan + test-fit jatuh ke minggu 7.

### 2.4 "Wireframe" — yang mana satu?
App wireframe **dah ada**: `Week05/Output/figures/fig3_wireframes.png`
(Design Pack W5 juga ada architecture, sequence, storyboard). Jadi kemungkinan besar yang dia
maksud ialah **wiring / susun atur dalam beg** — antenna loop, kedudukan modul, laluan kabel,
display bezel. Aku anggap begitu dalam plan ni. Kalau salah, D4 berubah bentuk.

---

## 3. Cadangan: 4 objectives → 3

Objectives sekarang dalam proposal:

| Lama | Bunyi asal |
|---|---|
| O1 | Multi-tag NLOS inventory engine — 15 item < 1.5 s |
| O2 | Dual-interface visualisation — E-paper + app Flutter |
| O3 | Power-aware edge firmware — deep sleep + Hall, > 5 hari |
| O4 | Read-zone confinement + field validation — liner, antenna placement, benchmark |

Cadangan baru:

| Baru | Bunyi | Dari mana |
|---|---|---|
| **OBJ1** | Reka bentuk dan sahkan enjin inventori UHF RFID dalam cavity beg, dengan read zone terkurung dalam beg | O1 + O4 digabung |
| **OBJ2** | Hasil status dua muka: E-paper luar beg + app Flutter untuk checklist dan sync BLE | O2 kekal |
| **OBJ3** | Operasi edge jimat tenaga: deep sleep dipacu zip (Hall-effect) dan bajet kuasa yang dikira | O3 kekal |

Sebab O1 dan O4 digabung: **confinement bukan deliverable berasingan, ia syarat yang membuatkan
bacaan inventori itu sah.** Mengukur recall tanpa mengukur berapa banyak tag luar beg ikut
terbaca ialah angka yang tak bermakna. Jadi ia satu objective dengan dua ukuran.

Nota penting: angka 15 item / 1.5 s / 5 hari dalam proposal ialah **sasaran**, bukan data
yang diukur. Jangan tulis dalam laporan seolah-olah sudah dicapai.

---

## 4. Lima modul

| Modul | Nama | Objective | Deliverable | FYP1? |
|---|---|---|---|---|
| **M1** | Mobile application (Flutter) | OBJ2 | Skrin checklist, pair BLE, papar status hadir/hilang | **SIAP** |
| **M2** | Bag hardware & pemasangan elektronik | OBJ1 (+ sokong OBJ3) | Beg, enclosure, antenna loop, liner, E-paper, bekalan kuasa, **+ satu tag dibaca (bring-up)** | **SIAP** |
| M3 | Enjin inventori RFID (firmware) | OBJ1 | Anti-collision scan, decode EPC, 15 tag < 1.5 s, ukur recall | FYP2 |
| M4 | Pengurusan kuasa & trigger event | OBJ3 | Deep sleep, Hall ISR, kira hari operasi dari profil arus | FYP2 |
| M5 | Validasi & penilaian | OBJ1 + OBJ3 | Recall, latency, confinement 0.5 m / 1.0 m, endurance | FYP2 |

Yang M2 ambil dari M3 hanyalah **slice minimum** (bring-up reader + satu bacaan). Tulis betul-betul
dalam jadual supaya tak nampak seperti kerja disembunyikan.

---

## 5. Hardware design — apa "penuh" bermaksud

Enam artefak. Yang pertama menyekat semua yang lain.

| # | Artefak | Isi | Status |
|---|---|---|---|
| 1 | **Ukuran beg** | 3 beg, dalaman (L×T×D mm), kedudukan poket, panjang zip, gambar dengan pembaris dalam frame | **BELUM — buat hari ini** |
| 2 | **Blueprint berdimensi** | 3 pandangan + 1 keratan: cavity, antenna loop, kedudukan modul, bezel E-paper, laluan kabel, poket bateri | belum |
| 3 | **Senarai item (BOM)** | 11 baris, RM557 jumlah, setiap satu ada spec + sebab dipilih | ada dalam plan induk §2, perlu dikemas jadi jadual laporan |
| 4 | **3D model Blender** | Greybox tepat ikut ukuran sebenar + 3 render (hadapan, sisi, dalaman) | belum |
| 5 | **Rupa beg** | Render/mockup: beg tutup, beg buka, E-paper dari luar | belum |
| 6 | **Wiring diagram** | ESP32-S3 ↔ YRM100 (UART), ↔ E-paper (SPI), ↔ Hall (GPIO), kuasa 5 V vs 3.3 V | belum |

**Peraturan keras:** blueprint dan 3D model guna ukuran #1. Kalau beg belum diukur, semua nombor
lain dalam D4 ialah rekaan, dan supervisor yang ambil pembaris akan nampak.

---

## 6. Market study — apa yang kurang dari yang ada

`Week05/Output/Commercial_Comparison.xlsx` (29 Okt) sudah ada: 3 produk, 12 atribut, 9 sumber
dengan URL dan tarikh akses, harga dalam RM dengan kadar FX 28 Okt. Itu asas yang kukuh.

Yang file tu sendiri kata **tiada**: tiada teardown, tiada pengukuran bebas. Jadi "study betul-betul"
bermakna tambah:

1. **Lajur baru: "apa reka bentuk produk ni ajar BagSense"** — ini yang membuat perbandingan jadi
   market study, bukan jadual harga. Contoh bentuk: kedudukan E-paper BAGTAG di luar beg, saiz
   fizikal AirTag, keperluan kuasa reader Impinj.
2. **Sahkan semula 3 harga** — semak semula halaman vendor, catat tarikh baru. Harga 29 Okt masih
   segar, tapi kena ada tarikh baharu untuk versi v2.
3. **Satu kelemahan yang kena diakui**: tiga produk tu bukan "barang yang sama" — AirTag penanda
   item, Impinj reader industri, BAGTAG tag penerbangan. Tiada satu pun **beg pintar yang tahu
   kandungannya**. Itu sebenarnya bagus untuk gap analysis, tapi supervisor minta 3 barang sama
   jenis. Tanya dia: kekalkan tiga paksi ni, atau tukar satu kepada beg pintar sebenar?
   (Aku tak senaraikan nama produk tanpa disahkan dulu.)

---

## 7. Jadual jam demi jam

**Ahad 1 Nov (10 j)**

| Masa | Adam | Amru |
|---|---|---|
| 13:00–14:00 | Ukur 2–3 beg + gambar dengan pembaris | Salin template IIUM jadi fail laporan, buang seksyen FYP2 |
| 14:00–17:00 | D1 problem statement + D2 three objectives + D3 modul | D5 market study: sahkan harga, tambah lajur design implication |
| 17:00–17:30 | **Sync 30 min** — Adam bentang D1–D3, Amru cabar | sama |
| 17:30–20:00 | Blueprint: lakaran tangan + dimensi (kertas dulu, bukan CAD) | 3D model greybox mula (Blender) dari ukuran tadi |
| 20:00–23:00 | BOM jadi jadual laporan + wiring diagram | 3D model sambung |

**Isnin 2 Nov (14 j)**

| Masa | Adam | Amru |
|---|---|---|
| 09:00–09:30 | **Order komponen** (kalau belum) — critical path, bukan pilihan | sama |
| 09:30–13:00 | Blueprint digital (draw.io/PowerPoint, skala mm) | Render 3D + rupa beg |
| 14:00–18:00 | Masukkan D1–D3 + D4 ke template IIUM (docx) | Kemas D5 jadi jadual + naratif ringkas |
| 19:00–23:00 | Sambung tulis §Scope, §Constraints, §Project Stages | Figur: captions, nombor rajah, saiz cetak |

**Selasa 3 Nov (12 j)**

| Masa | Adam | Amru |
|---|---|---|
| 09:00–12:00 | Tutup bahagian yang tinggal, senarai rajah/jadual | Semak silang: setiap angka ada sumber |
| 13:00–17:00 | Eksport PDF, page-check, buang seksyen FYP2 yang tertinggal | Baca sebagai pemeriksa — cari soalan yang tak boleh dijawab |
| 18:00–20:00 | **Dry-run**: Adam bentang macam depan supervisor, Amru tanya | sama |
| 21:00 | **FREEZE.** Tiada suntingan selepas ni | sama |

**Rabu 4 Nov** — 07:00 semak cetakan/PDF, 08:00 gerak, 09:00 meeting.

---

## 8. Apa yang TIDAK akan siap menjelang Rabu

Nyatakan sekarang supaya tak jadi kejutan:

- **3D model print-ready** dengan toleransi snap-fit — tidak. Greybox tepat dimensi + render: ya.
- **Enclosure dicetak dan test-fit** — tidak. Slot printer belum disahkan (tugasan W5 yang belum dibuat).
- **Laporan penuh Chapter 1–3** — tidak. Chapter 1 lengkap, Chapter 2 outline, Chapter 3 rangka.
- **Market study dengan teardown / ukuran bebas** — tidak. Kajian atas sumber vendor: ya.
- **Komponen di tangan** — tidak, belum diorder. Reka bentuk hardware setakat ni CAD sahaja.
- **Yang paling penting:** kalau modul 2 tak termasuk satu bacaan tag, FYP1 ni tiada satu pun
  angka yang diukur. Itu yang aku cuba elakkan dalam §2.2.

---

## 9. Dua soalan tertutup untuk supervisor (Rabu, 9:00)

1. **Modul mana yang membawa bukti bacaan tag dalam cavity** — firmware/bring-up masuk dalam modul
   hardware, atau ia modul 3 yang juga mesti siap dalam FYP1?
2. **"Hardware design fully"** — dokumen reka bentuk sahaja (blueprint + 3D + BOM), atau perlu
   enclosure bercetak dan test-fit dalam FYP1?

Kalau dia jawab dua ni, baki semester jadi jelas. Kalau tak tanya, kau akan teka sampai minggu 12.

---

## 10. Langkah pertama: hari ini, 30 minit

Ukur beg. Tiga beg, dalaman, dalam milimeter. Letak pembaris dalam gambar.

Semua yang lain dalam D4 bergantung pada nombor tu. Kalau kau mula dengan Blender, kau akan
model beg yang tiada kaitan dengan beg sebenar, dan buang 8 jam.

---

## 11. Risiko

| Risiko | Tanda awal | Tindakan |
|---|---|---|
| Blueprint direka tanpa ukuran sebenar | Mula CAD sebelum ukur | Ukur dulu — 30 minit hari ni |
| 3 vs 5 modul tak dipetakan | Supervisor tanya "macam mana 3 jadi 5" | Jadual §4 masuk dalam laporan, bukan jawab lisan |
| Proposal 4 objectives jadi basi | Ada dua versi beredar | Buat `_v2`, simpan `_CORRECTED` sebagai sejarah |
| Komponen tak diorder | Minggu 11 baru tiba | Order Isnin 09:00, seller Malaysia, tanya variant 919–923 MHz |
| Template IIUM tinggal seksyen FYP2 | Supervisor approval / certificate of originality tertinggal | Buang pada salinan pertama, Ahad |
| Tulis sampai pukul 3 pagi Selasa | PDF tak sempat page-check | Freeze 21:00 Selasa, tanpa pengecualian |
