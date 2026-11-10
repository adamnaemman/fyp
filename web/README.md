# web/ — tracker BagSense (Next.js + Supabase)

App yang Adam, Amru dan penyelia guna. Baca sahaja untuk tetamu; log masuk (pautan emel)
untuk menanda. Data status datang dari Supabase; kiraan fail bukti datang dari skrip sync
yang membaca fail projek pada cakera.

```
web/
├── app/
│   ├── page.tsx              halaman tracker (Server Component)
│   ├── tugasan/page.tsx      urus batch + tugasan (tulis melalui Server Action)
│   ├── panduan/page.tsx      penerangan satu halaman untuk SV/Amru
│   ├── login/page.tsx        log masuk pautan emel
│   ├── auth/callback/        tukar kod OTP -> sesi
│   ├── api/                  tulisan: /api/focus /api/task /api/gate /api/blocked (+ auth)
│   └── globals.css           semua gaya (tiada framework CSS, tiada CDN)
├── components/               kad statistik, kad minggu, senarai tugasan, tarikh, dsb
├── lib/
│   ├── data.ts               baca Supabase; jatuh balik ke data/snapshot.json bila gagal
│   ├── auth.ts               sesi + peranan dari jadual members
│   ├── mutations.ts          guard tulis (sesi + peranan) untuk semua endpoint
│   └── supabase/server.ts    klien SSR (kunci anon sahaja)
├── data/snapshot.json        DIJANA oleh tracker/export_snapshot.py - jangan edit tangan
└── supabase/schema.sql       jadual + RLS + seed ahli, jalankan sekali di SQL Editor
                              (migrasi tambahan: supabase/migrations/*.sql)
```

## Halaman

| Laluan | Guna |
|---|---|
| `/` | progres mingguan, gate, tugasan, tarikh penting, pautan laporan + repo |
| `/tugasan` | urus batch (tambah/ubah/padam) dan tugasan di dalamnya; tarikh mula/tamat |
| `/gantt` | bar tugasan ikut tarikh; panel "Belum dijadualkan" |
| `/calendar` | tugasan ikut hari (bulanan) |
| `/panduan` | penerangan untuk SV/Amru: peranan, log masuk, status, had laman |
| `/barang` | senarai barang + tag UHF (jadual `items`) |

Pautan luar (Laporan Google Docs, repo GitHub) ada di **satu tempat**: `lib/links.ts` —
dipakai oleh sidebar, footer semua halaman (`components/SiteFooter.tsx`) dan kad "Pautan" di `/`.

## Mod yang mungkin

| Keadaan | Apa yang berlaku |
|---|---|
| Env Supabase **tiada** | Baca `data/snapshot.json`. Semua kotak baca sahaja. Lencana `snapshot`. |
| Env ada, DB kosong | Snapshot dipaparkan + nota "jalankan sync". Tetap baca sahaja. |
| Env ada, DB berisi, tiada sesi | Data DB, tetamu — butang tulis disabled. |
| Log masuk sebagai `admin`/`member` | Boleh tanda fokus, gate, status tugasan, tutup sekat. |
| Log masuk sebagai `viewer` (SV) | Nampak semua, tiada butang tulis. |

## Setup (sekali sahaja)

1. **Supabase** — buat projek (Free). Simpan `Project URL` dan `anon public key` dari
   Settings → API.
2. **Skema** — SQL Editor → New query → tampal `web/supabase/schema.sql` → Run.
   Kemudian tukar tiga emel dalam blok `insert into public.members` kepada emel sebenar
   Adam (admin), Amru (member), penyelia (viewer). Jalankan semula blok itu.
3. **Emel magic link** — Authentication → Providers → Email mesti hidup. Untuk 3 pengguna,
   had emel lalai Supabase sudah cukup.
4. **Isi data** — pada mesin ini:
   ```bash
   export SUPABASE_URL="https://xxxx.supabase.co"
   export SUPABASE_SERVICE_KEY="<service_role key>"
   python tracker/export_snapshot.py --push
   ```
   Kunci service_role melangkau RLS: ia hanya di terminal, tidak pernah dalam kod pelayar.
5. **Lokal** — `cp .env.example .env.local`, isi dua nilai, `npm run dev` → http://localhost:3000
6. **Vercel** — Import repo GitHub → **Root Directory: `web`** → tambah dua env var
   `SUPABASE_URL` dan `SUPABASE_ANON_KEY` → Deploy.
7. **Kongsi dengan SV** — hantar URL Vercel. Baca sahaja tanpa log masuk; kalau SV mahu
   log masuk, emel dia mesti ada dalam `members` dengan role `viewer`.

## Peraturan yang dijaga kod ini

- **Gate bukan derivasi.** `weeks.gate_status` hanya berubah bila ada manusia menekan butang.
  Tiada trigger, tiada kiraan fail → lulus.
- **Tulisan disemak dua kali.** UI sembunyikan butang untuk `viewer`, dan RLS Supabase
  menolak tulisan itu juga. UI yang salah tidak boleh merosakkan data.
- **Gagal Supabase != halaman kosong.** `lib/data.ts` memaparkan snapshot fail projek dan
  menulis nota di atas — lebih baik data semalam daripada skrin putih pada hari pembentangan.
- **Sync tidak menimpa kerja manusia.** Payload `--push` sengaja tidak menghantar
  `gate_status`, `tasks.status`, `focus_items.done`. Tugasan pula dimasukkan sekali sahaja
  (insert-if-missing) — `start_date`, `end_date`, `batch_no`, `batch_id` yang diset dalam web
  tidak ditulis ganti. Batch (`batches`) diurus sepenuhnya dari halaman `/tugasan`.

## Perintah

```bash
npm run dev      # pembangunan
npm run build    # mesti lulus sebelum deploy
npm run start    # jalankan hasil build
```

## Had yang diketahui

- Supabase Free pause selepas 7 hari tiada aktiviti. Buka dashboard untuk hidupkan semula.
- Pautan magic link luput ~1 jam; kalau SV lambat klik, hantar semula.
- `data/snapshot.json` mesti dijana semula selepas fail projek berubah, kemudian commit —
  ia yang menyelamatkan halaman bila Supabase mati.
