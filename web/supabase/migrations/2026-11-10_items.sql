-- Jadual `items` — senarai barang yang dipilih untuk beg
-- Jalankan dalam Supabase → SQL Editor. Selamat dijalankan berulang.
--
-- Kosong pada mulanya: barang hanya wujud bila dimasukkan melalui tab Barang.
-- Tiada inventori direka di sini.

create table if not exists public.items (
  id         text primary key,
  name       text not null,
  category   text,
  tag_epc    text,                       -- id tag UHF (kosong = belum ditag)
  qty        integer not null default 1,
  note       text,
  baggage    text default 'utama',       -- poket / kompartmen
  ord        integer not null default 0,
  updated_at timestamptz not null default now(),
  updated_by text
);

create index if not exists items_ord_idx on public.items (ord);

alter table public.items enable row level security;

drop policy if exists items_read on public.items;
create policy items_read on public.items
  for select to anon, authenticated using (true);

drop policy if exists items_write on public.items;
create policy items_write on public.items
  for all to authenticated
  using (public.is_writer()) with check (public.is_writer());

grant select on public.items to anon;
grant select, insert, update, delete on public.items to authenticated;

select count(*) as bilangan_barang from public.items;
