-- Senarai beli komponen (BOM) FYP1 — tab "Pembelian"
-- Jalankan dalam Supabase → SQL Editor. Selamat dijalankan berulang.
--
-- Isi awal diambil dari 01_Planning/FYP1_Execution_Plan_W5-W13.md §2 (BOM).
-- Harga ialah anggaran dalam fail pelan itu, bukan harga sebenar yang dibayar —
-- kemas kini di web bila pesanan betul dibuat.

create table if not exists public.bom (
  id          text primary key,
  name        text not null,
  spec        text,
  qty         integer not null default 1,
  unit_price  numeric(10, 2),          -- RM seunit, anggaran atau sebenar
  seller      text,                    -- kedai / pembekal
  url         text,
  status      text not null default 'belum'
              check (status in ('belum', 'order', 'sampai', 'batal')),
  note        text,
  ord         integer not null default 0,
  updated_at  timestamptz not null default now(),
  updated_by  text
);

create index if not exists bom_ord_idx on public.bom (ord);

alter table public.bom enable row level security;

drop policy if exists bom_read on public.bom;
create policy bom_read on public.bom
  for select to anon, authenticated using (true);

drop policy if exists bom_write on public.bom;
create policy bom_write on public.bom
  for all to authenticated
  using (public.is_writer()) with check (public.is_writer());

grant select on public.bom to anon;
grant select, insert, update, delete on public.bom to authenticated;

-- Isi awal (harga anggaran dari pelan induk §2)
insert into public.bom (id, name, spec, qty, unit_price, status, note, ord) values
  ('bom-esp32',   'ESP32-S3 devkit',        '8 MB flash', 1, 35.00,  'belum', null, 1),
  ('bom-uhf',     'Modul UHF YRM100 / MagicRF Nano',
                  'MESTI 919–923 MHz (varian MY/US), bukan 865–868', 1, 240.00, 'belum',
                  'Perlukan 5 V, arus puncak ~0.9–1 A semasa inventory round', 2),
  ('bom-antenna', 'Antenna UHF',            '50 Ω, tune 919–923 MHz', 1, 45.00, 'belum', null, 3),
  ('bom-epaper',  'E-paper 2.9" SPI',       '3-color atau mono', 1, 58.00, 'belum', null, 4),
  ('bom-tag',     'Tag UHF passive',        'Impinj Monza / Alien Higgs-3 sticker', 20, 28.00, 'belum',
                  'Pelan tulis 20–50 keping; kuantiti di sini 20 — naikkan bila pesan', 5),
  ('bom-hall',    'Hall-effect + magnet',   'A3144 atau setara, untuk zipper', 2, 8.00, 'belum', null, 6),
  ('bom-bateri',  'Li-Po 3.7 V 3000 mAh + TP4056', 'dengan protection', 1, 38.00, 'belum', null, 7),
  ('bom-shield',  'Shielding fabric + filament', 'untuk ujian lining', 1, 45.00, 'belum', null, 8),
  ('bom-wayar',   'Wayar JST-PH, suis, butang', '1 lot', 1, 20.00, 'belum', null, 9),
  ('bom-beg',     'Backpack ujian',         'kompartmen standard', 1, 40.00, 'belum', null, 10)
on conflict (id) do nothing;

select count(*) as bilangan, coalesce(sum(qty * unit_price), 0) as jumlah_rm from public.bom;
