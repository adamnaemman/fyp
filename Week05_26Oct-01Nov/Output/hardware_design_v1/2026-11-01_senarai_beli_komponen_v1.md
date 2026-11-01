# Senarai beli komponen BagSense — v1

Dibuat 1 Nov 2026. Semua pautan dibuka/disemak pada tarikh ini; harga pasaran bergerak,
semak semula masa checkout.

**Pengesahan:** baris bertanda ✅ = halaman produk dibuka dan tajuknya disahkan sendiri.
Baris bertanda ⚠️ = harga/tajuk dibaca daripada halaman carian platform, halaman produk
tidak dapat dibuka (Shopee sekat bot). Baris ❓ = belum jumpa pembekal Malaysia.

---

## 1. Tiga peraturan sebelum tekan beli

1. **Stok Malaysia sahaja.** Barang dari China yang sampai minggu ke-7 = projek habis.
   Bayar RM20–40 lebih untuk seller yang hantar dari MY.
2. **Tanya seller dulu sebelum bayar** (modul RFID ada dua versi frekuensi yang nampak sama).
   Template mesej di bahagian 4.
3. **Beli 2 modul RFID** kalau mampu. Satu rosak masa solder = 3 minggu hilang.

---

## 2. Jadual beli

### A. Wajib — teras projek

| # | Komponen | Spec yang mesti | Pautan | Harga dilihat (1 Nov 2026) | Status |
|---|---|---|---|---|---|
| 1 | Modul UHF RFID **YRM100** | TTL UART, **902–928 MHz / varian US**, antena terbina 35×40 mm | https://www.lazada.com.my/catalog/?q=yrm100 | RM253 – RM274 (seller China) | ⚠️ |
| 2 | **ESP32-S3 DevKit** | ESP32-S3-WROOM-1 **N16R8** (16MB flash, 8MB PSRAM), 44 pin, Type-C | https://shopee.com.my/ESP32-ESP32-S3-WiFi-Bluetooth-Internet-Of-Things-Dual-Type-C-Development-Board-Core-Board-ESP32-S3-DevKit-C-N16R8-For-Arduino-i.957629053.19875011226 | ~RM27 – RM31 | ✅ |
| 3 | **E-paper 2.9"** | 296×128, SPI, **dengan driver board** (jangan beli raw panel) | https://www.waveshare.com/2.9inch-e-Paper-Module.htm | USD 19.95 – 21.99 (rasmi Waveshare) | ⚠️ harga sah, bukan MY |
| 4 | **Tag UHF passive** | ISO18000-6C / EPC Gen2, cip U8/U9 atau Monza, 860–960 MHz, saiz 43×18 mm | https://shopee.com.my/search?keyword=UHF+RFID+sticker+915MHz | ~RM11.90 / 20 keping | ⚠️ |

### B. Sokongan

| # | Komponen | Spec | Pautan | Harga dilihat | Status |
|---|---|---|---|---|---|
| 5 | Hall sensor | **A3144** modul (3 pin: VCC/GND/DO), 5 V | https://shopee.com.my/A3144-Hall-Effect-Magnetic-Sensor-Module-i.78840338.7217705987 | RM3.60 / keping | ✅ |
| 6 | Bateri Li-Po | 3.7 V, **2500–3500 mAh**, ada protection, saiz kena masuk beg | https://shopee.com.my/product/1093247212/18885155280 | semak di halaman (ikut saiz) | ⚠️ |
| 7 | Papan cas TP4056 | Type-C, **with protection**, 1 A | https://shopee.com.my/USB-Type-C-Micro-USB-5V-1A-TP4056-3.7V-Lipo-18650-Li-ion-Battery-Lithium-Battery-Charger-Module-Charging-Board-i.33091591.2227344849 | RM3.50 – 4.50 | ✅ |
| 8 | Kain perisai RF | Faraday / nickel-copper cloth, sekurang-kurangnya 100 × 110 cm | https://shopee.com.my/Anti-Radiation-Antimagnetic-Lining-Cloth-Blocking-RFID-Shielding-Signal-Fabric-i.130096338.24073162147 | RM20 – RM56 (ikut saiz) | ✅ |
| 9 | Step-up 5 V | MT3608 atau setara, output ≥ 1 A | https://shopee.com.my/search?keyword=MT3608+step+up+5V | ~RM2 – RM5 | ⚠️ |
| 10 | Kapasitor | 470–1000 µF, 16 V, elektrolitik | https://shopee.com.my/search?keyword=470uF+16V+capacitor | ~RM1 – RM3 | ⚠️ |
| 11 | Wayar + JST-PH | JST-PH 2.0 set, jumper female-female, suis | https://shopee.com.my/search?keyword=JST-PH+2.0+connector+kit | ~RM10 – RM20 | ⚠️ |
| 12 | Filamen PLA | 1.75 mm, 1 kg (untuk printer lab/kampus) | https://shopee.com.my/search?keyword=PLA+filament+1.75mm+1kg | ~RM45 – RM70 | ⚠️ |
| 13 | Beg ujian | Beg pelajar standard, ada satu compartment besar + poket zip | https://shopee.com.my/search?keyword=beg+sekolah+komputer+riba | ~RM40 – RM90 | ⚠️ |

**Anggaran kasar semua sekali:** sekitar RM450–650, sepadan dengan BOM RM557 dalam pelan induk.
Ini anggaran, bukan sebut harga — harga berubah dan sesetengah baris belum ada harga.

---

## 3. Risiko paling mahal: varian frekuensi modul RFID

YRM100 dijual dalam dua versi yang **nampak sama pada gambar**:

- **865–868 MHz** — untuk Eropah. **Tidak sah** untuk Malaysia.
- **902–928 MHz** — untuk Amerika/Asia. Ini yang kau nak (Melayu: 919–923 MHz masuk dalam julat ni).

Kalau seller hantar yang salah, projek kau tidak boleh diuji pada frekuensi yang dibenarkan
MCMC, dan kerja firmware jadi sia-sia. Sebab itu beli 2 pun berbaloi.

---

## 4. Mesej untuk tanya seller (salin tampal)

> Hi, saya pelajar UPM/IIUM buat projek FYP guna modul ni.
> 1. Modul ni versi frekuensi mana — **902–928 MHz (US)** atau 865–868 MHz (EU)?
> 2. Boleh set ke **920 MHz** dari software?
> 3. Stok dari Malaysia atau China? Berapa lama sampai Selangor?
> 4. Ada contoh kod UART untuk ESP32?

Kalau seller jawab "boleh semua frekuensi" tanpa angka → curiga. Minta gambar label modul.

---

## 5. Pinduoduo — kenapa aku tak cadang

- Pinduoduo tidak hantar terus ke Malaysia; kena guna ejen barang (agent), tambah kos dan risiko.
- Masa sampai biasa 2–5 minggu. Kau ada 7 minggu.
- Kalau barang rosak atau salah varian, proses pulangan hampir mustahil dari Malaysia.

Guna Shopee/Lazada dengan seller yang ada stok MY. Pinduoduo hanya masuk akal untuk
barang murah yang tak kritikal (wayar, tag) dan kalau kau memang sudah biasa guna ejen.

---

## 6. Soalan kau: model 3D setakat tunjuk bentuk, atau print-ready?

Kau tanya sebab first time buat hardware. Ini bezanya:

| | Model paparan (yang kau ada sekarang) | Model print-ready |
|---|---|---|
| Apa ia tunjuk | Bentuk beg, kedudukan komponen, saiz | Benda yang boleh dicetak dan dipasang |
| Ketebalan dinding | Tidak ditentukan | 1.6–2.4 mm, ditentukan |
| Toleransi | Tiada | Jarak 0.2–0.4 mm supaya bahagian masuk tanpa paksa |
| Lubang skru | Tiada | M3 dengan boss, atau snap-fit clip |
| Ukuran | **Andaian** | Mesti dari beg sebenar + ukuran komponen sebenar |
| Masa buat | 6–8 jam (sudah siap) | 3–4 hari, dan hanya selepas komponen tiba |

**Cadangan aku:** jangan buat print-ready sekarang, atas tiga sebab:

1. **Komponen belum ada di tangan.** Print-ready mesti ikut saiz PCB sebenar. Kalau kau model
   ikut angka seller dan sampai barang saiz lain, fail tu jadi sampah.
2. **Printer belum disahkan.** Belum tahu saiz bed, filament jenis apa, toleransi printer tu.
3. **Supervisor minta design, bukan benda bercetak.** Arahan dia: rupa beg, item, wireframe,
   blueprint, 3D model. Semua itu dokumen.

Cara yang lebih selamat: **retrofit beg yang dibeli**, bukan beg custom. Kau beli beg standard
(RM40–90), ukur cavity dia, dan design *enclosure elektronik* sahaja (kotak ESP32 + RFID + bateri,
dan bezel E-paper). Kotak kecil lebih mudah dicetak, lebih mudah dibetulkan, dan tak perlu jahit.

Kalau supervisor kata "kena ada benda bercetak", baru naik ke print-ready — dan masa tu
komponen sudah tiba, jadi ukuran betul.

---

## 7. Apa yang belum ada pembekal

- Antena UHF berasingan (kalau YRM100 datang tanpa antena — banyak listing sudah termasuk)
- PLA/hosting printer: sahkan akses lab dulu sebelum beli filamen
- Tag anti-metal (tak perlu untuk beg kain, cuma kalau ada item logam)
