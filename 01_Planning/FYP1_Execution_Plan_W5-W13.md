# BagSense — Pelan Perlaksanaan FYP1 (Minggu 5 → 13)

Keadaan sebenar: 7 minggu kerja, 2 orang, 1 prototaip. Supervisor belum bagi arahan.
Prinsip: **jangan tunggu arahan untuk mula**. Order hardware minggu ini (lead time 2–3 minggu
ialah satu-satunya benda yang tak boleh dipercepatkan kemudian), hantar pelan kepada supervisor
sebagai "mohon semakan", bukan sebagai soalan terbuka.

---

## 0. Kalendar rasmi (dari jadual seminar FYP1, bukan agakan)

| Minggu | Tarikh (Jumaat) | Seminar |
|---|---|---|
| 5 | 30 Okt | Seminar 3: AI research tool etika - Chapter 2 Lit Review & reference tool |
| 6 | 6 Nov | - |
| 7 | 13 Nov | Seminar 4: Chapter 3 Methodology |
| - | 16-22 Nov | **CUTI SEMESTER - ini buffer build, bukan cuti** |
| 8 | 27 Nov | Seminar 5: Development Framework |
| 9 | 4 Dis | Seminar 6: Prototype Design (UI/UX) |
| 10 | 11 Dis | - |
| 11 | 18 Dis | Seminar 7: Innovatex briefing |
| 12 | 25 Dis | - (semua deliverable mesti tutup) |
| 13 | 30 Dis | **INNOVATEX FYP Showcase** (TBC) |
| 14 | 8 Jan 2027 | - |

Dua akibat daripada jadual ni yang mengubah pelan asal:
1. Minggu 13 ialah showcase, bukan sekadar present. Jadi minggu 12 memang minggu beku -
   tiada ciri baru, hanya pepijat, slide, video sandaran dan poster.
2. Ada **dua minggu cuti** selepas minggu 7. Itu buffer yang menyelamatkan projek kalau
   komponen lambat sampai. Jangan anggap ia cuti - anggap ia minggu kecemasan yang belum digunakan.

---

## 1. Skop yang dipotong (keputusan, bukan pilihan)

Yang dikekalkan:
- Baca tag UHF dalam cavity bag → tahu apa ada, apa tak ada
- Zipper (hall-effect) trigger scan
- E-paper tunjuk status ringkas
- App Flutter: satu skrin, senarai checklist, terima status via BLE

Yang dibuang sampai FYP2:
- Push notification, schedule-based packing prompts, category filters
- CAD estetik (bezel cantik, cable conduit) — cukup kotak berfungsi
- VL53L0X / FSR sensor kedua
- Multi-bag profile, cloud sync, apa-apa "AI"

Sebab: 7 minggu cukup untuk satu aliran kerja hujung-ke-hujung. Setiap satu tambahan
ialah satu lagi benda yang boleh gagal pada minggu ke-12.

---

## 2. Bill of Materials — order dalam 48 jam

| Item | Spesifikasi penting | Qty | RM |
|---|---|---|---|
| ESP32-S3 devkit | 8MB flash | 1 | 35 |
| YRM100 / MagicRF Nano UHF | **MESTI 919–923 MHz (varian MY/US), BUKAN 865–868** | 1 | 240 |
| Antenna UHF | 50 Ω, tune 919–923 MHz | 1 | 45 |
| E-paper 2.9" SPI | 3-color atau mono | 1 | 58 |
| Tag UHF passive | Impinj Monza / Alien Higgs-3 sticker | 20–50 | 28 |
| Hall-effect + magnet | A3144 atau setara, untuk zipper | 2 set | 8 |
| Li-Po 3.7V 3000mAh + TP4056 | dengan protection | 1 | 38 |
| Shielding fabric + filament | untuk ujian lining | 1 lot | 45 |
| Wayar JST-PH, suis, butang | | 1 lot | 20 |
| Backpack ujian | kompartmen standard | 1 | 40 |
| **Jumlah** | | | **~557** |

Nota teknikal:
- Modul YRM100 perlukan **5 V** dan boleh tarik arus puncak ~0.9–1 A masa inventory round.
  Pastikan BMS/step-up mampu, dan tambah kapasitor 470–1000 µF dekat VCC modul.
- UART modul 3.3 V logic — terus ke ESP32-S3, jangan letak level shifter yang tak perlu.
- **Beli dari seller Malaysia yang ada stok tempatan** walaupun RM20–40 lebih mahal.
  Barang dari China yang sampai minggu ke-7 = projek habis.
- Tanya seller **sebelum bayar**: "boleh set frequency 920 MHz / ada varian Malaysia?"

---

## 3. Jadual mingguan

### Minggu 5 (sekarang) — Order + asas
- [ ] Order semua komponen (48 jam). Screenshot pengesahan pesanan.
- [ ] Hantar pelan ini kepada supervisor (template mesej di bahagian 6).
- [ ] Install PlatformIO + ESP-IDF. Uji: blink, baca hall sensor, tulis teks ke e-paper
      (kalau e-paper belum sampai, guna OLED/Serial dulu).
- [ ] Sahkan akses 3D printer + filament. Book slot lab.
- [ ] Ukur dimensi dalaman 2–3 beg untuk tetapkan saiz enclosure.

**Gate W5:** pesanan dibuat, toolchain jalan, akses printer disahkan.

### Minggu 6 — Plumbing firmware + app
- [ ] FreeRTOS tasks: UART driver (stub), hall ISR, e-paper render, BLE GATT service.
- [ ] Flutter: satu skrin, scan BLE, sambung, papar JSON diterima. Tiada database.
- [ ] CAD: enclosure v0 (ESP32 + modul + bateri), print dan test-fit.

**Gate W6:** ESP32 → BLE → Flutter nampak data; e-paper tulis teks; kotak v0 muat.

### Minggu 7 — Bring-up reader (komponen tiba)
- [ ] Sambung YRM100 ke UART, set 919–923 MHz, baca 1 tag.
- [ ] Ujian: 100 cubaan, kira success rate + masa per read.
- [ ] Log ke fail CSV — ini jadi data pertama laporan.

**Gate W7:** 1 tag dibaca dalam udara terbuka ≥ 95% cubaan.
**Kalau komponen belum tiba hujung W7 → aktifkan Plan B (bahagian 5) serta-merta.**

### Minggu 8 — Pilot dalam cavity (minggu paling penting)
- [ ] 5 tag, 3 kedudukan (dasar, tengah, poket sisi), 20 cubaan setiap satu.
- [ ] Ujian confinement: tag di luar bag pada 0.5 m dan 1.0 m — berapa kali terbaca?
- [ ] **Ini yang menetapkan angka kau.** Tulis apa yang keluar, jangan paksa ikut proposal.

**Gate W8:** ≥ 90% recall (5 tag) → teruskan.
70–90% → ubah kedudukan antenna, ulang sekali.
< 70% → tukar ke mod demonstrasi (bahagian 5), jangan buang masa mengejar angka.

### Minggu 9 — Integrasi aliran kerja
- [ ] Zip tutup → ISR → scan → keputusan, semua automatik.
- [ ] Enclosure v1: antenna mount dalam cavity, lining pada outer shell sahaja.
- [ ] Uji lining: adakah ia kurangkan bacaan tag luar tanpa membunuh bacaan dalam?

**Gate W9:** aliran zipper→scan→keputusan jalan tanpa sentuh laptop.

### Minggu 10 — Dua bahagian dicantum
- [ ] E-paper papar senarai hadir/hilang.
- [ ] App papar checklist yang sama, sync via BLE.
- [ ] Demo 5 kali berturut-turut tanpa restart.

**Gate W10:** demo hujung-ke-hujung stabil 5/5.

### Minggu 11 — Ukur + dokumen
- [ ] Ujian 15 tag: recall + latency (median, max).
- [ ] Profil arus: ukur µA masa deep sleep, mA masa scan. Kira hari = kapasiti ÷ (arus purata × 24).
      **Jangan cuba tunggu 5 hari sebenar.**
- [ ] Ujian usability: 10 orang, Google Form SUS (10 soalan).
- [ ] Semua angka masuk satu jadual.

**Gate W11:** setiap angka dalam laporan ada sumber (fail CSV / bacaan meter).

### Minggu 12 — Freeze
- [ ] **Tiada ciri baru.** Hanya pepijat, slide, video.
- [ ] 5 slaid: masalah → gap → reka bentuk → keputusan terukur → apa seterusnya.
- [ ] Rakam video demo 3 minit sebagai sandaran kalau hardware gagal masa pembentangan.
- [ ] Laporan siap, poster (kalau perlu).

### Minggu 13 — Bentang
- [ ] Bawa: prototaip, video sandaran, kabel kuasa, tag alat ganti, slide bercetak.

---

## 4. Pembahagian kerja (2 orang)

| Bidang | Student 1 (2418711 — Adam) | Student 2 (2419467 — Amru) |
|---|---|---|
| Firmware ESP32-S3, UART reader, hall ISR | ✔ utama | bantu ujian |
| BLE + integrasi | ✔ utama | — |
| CAD enclosure, 3D print, lining placement | bantu test-fit | ✔ utama |
| Flutter app | — | ✔ utama |
| Ujian + kutip data + analisis | ✔ utama | ✔ utama |
| Slide + laporan | §1–5, §9–10 | §6–8, rajah |

Setiap minggu: sync 30 minit (Ahad malam), satu dokumen kongsi, setiap item ada pemilik.
Kalau satu orang tertinggal, orang satu lagi tahu terus — bukan tahu pada minggu 12.

---

## 5. Plan B dan Plan C (tulis sekarang, bukan masa panik)

**Plan B — komponen lewat atau reader tak berfungsi:**
Demo aliran penuh guna simpanan tag yang dijana firmware (bukan bacaan sebenar) untuk
menunjukkan app + e-paper + trigger zipper berfungsi, dan laporkan ujian RF sebagai
"preliminary characterisation" dengan data yang ada. Nyatakan dengan jujur dalam laporan.
Panel FYP1 lebih hormat pada had yang diukur daripada angka yang direka.

**Plan C — bacaan dalam cavity teruk (<70%):**
Tukar fokus daripada "scan seluruh cavity" kepada "scan satu poket hadapan" (contohnya
poket laptop/tablet). Skop kecil yang berfungsi mengalahkan skop besar yang gagal, dan
masih menjawab soalan penyelia: bolehkah UHF baca tag tanpa line of sight dalam fabrik?

---

## 6. Mesej kepada supervisor (hantar minggu ini)

WhatsApp/email, ringkas, tiga soalan tertutup:

> Assalamualaikum Dr, saya Ahmad Adam (2418711) dan Amru Hazem (2419467), pelajar FYP1
> di bawah seliaan Dr untuk projek BagSense.
>
> Memandangkan kini minggu ke-5 dan pembentangan pada minggu ke-13, kami telah sediakan
> pelan perlaksanaan ringkas: pesanan komponen dibuat minggu ini (modul RFID 919–923 MHz,
> ESP32-S3, e-paper), ujian pilot bacaan tag dalam cavity pada minggu ke-8, dan demo
> bersepadu menjelang minggu ke-12.
>
> Mohon semakan Dr pada tiga perkara:
> 1. Adakah skop ini menepati jangkaan Dr untuk FYP1?
> 2. Adakah minggu ke-13 itu pembentangan proposal, atau demo prototaip?
> 3. Bolehkah kami hadir untuk perbincangan 15 minit minggu ini?
>
> Kami lampirkan pelan penuh untuk rujukan Dr. Terima kasih.

Tujuan: bukan minta kebenaran, tetapi tukar senyap kepada kelulusan bertulis. Kalau
supervisor tak balas dalam 3 hari, mula juga — dan simpan mesej itu sebagai bukti
inisiatif kalau timbul isu kemudian.

---

## 7. Tiga perkara yang paling mungkin menggagalkan projek ini

1. **Komponen lewat.** Itu sebabnya order minggu ini, seller tempatan, dan ada Plan B.
2. **Mengejar 98% recall.** Angka dalam proposal ialah target, bukan kontrak. Data sebenar
   yang diukur mengalahkan angka yang dijanjikan.
3. **Menunggu supervisor.** Tujuh minggu tidak cukup untuk menunggu arahan.
