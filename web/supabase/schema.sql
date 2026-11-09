-- BagSense FYP1 tracker — skema Supabase
-- Jalankan sekali: Supabase → SQL Editor → New query → Run. Selamat dijalankan berulang.
--
-- Peranan:
--   anon          : baca sahaja (pautan tracker boleh dikongsi; SV tak perlu daftar)
--   authenticated : tulis, HANYA kalau e-mel ada dalam jadual `members`
--   service_role  : kunci penuh — hanya pada mesin Adam (web/scripts/sync_supabase.py --push),
--                   tidak pernah masuk pelayar
--
-- Dua sumber data, sengaja dipisahkan:
--   * minggu/tugasan/tarikh/spesifikasi : disalin dari FAIL projek oleh skrip sync
--   * focus_items.done, weeks.gate_status, tasks.status, blocked.resolved : ditulis MANUSIA
--   * evidence (kiraan fail) : hanya skrip, kerana angka itu hanya wujud pada cakera
--
-- Peraturan yang dipegang skema ini: bilangan fail TIDAK bermakna gate lulus.
-- gate_status ialah medan manusia, tiada trigger yang mengiranya.

begin;

-- ---------------------------------------------------------------- 1. jadual
create table if not exists public.members (
  email        text primary key check (email = lower(email)),
  role         text not null default 'viewer' check (role in ('admin', 'member', 'viewer')),
  display_name text,
  created_at   timestamptz not null default now()
);

create table if not exists public.weeks (
  id          text primary key,                    -- 'Week05_26Oct-01Nov'
  num         smallint not null,
  suffix      text not null default '',            -- 'B' untuk Week07B
  label       text not null,                       -- 'Minggu 7B'
  start_date  date,
  end_date    date,
  seminar     text,
  gate        text,                                -- syarat yang boleh diuji sendiri
  gate_status text not null default 'belum'
              check (gate_status in ('belum', 'lulus', 'gagal')),
  gate_note   text,
  gate_set_by text,
  gate_set_at timestamptz,
  sort        smallint not null default 0,
  updated_at  timestamptz not null default now()
);

create table if not exists public.focus_items (
  id      text primary key,                        -- 'Week07_09Nov-15Nov-<sha1 teks>'
  week_id text not null references public.weeks (id) on delete cascade,
  ord     smallint not null default 0,
  text    text not null,
  done    boolean not null default false,
  done_at timestamptz,
  done_by text
);
create index if not exists focus_items_week_idx on public.focus_items (week_id);

create table if not exists public.tasks (
  id         text primary key,                     -- '1-A', '2-F', '3-C'
  batch_no   smallint not null default 0,
  batch_date date,                                 -- null bila 'tarikh belum ditetapkan'
  batch_note text,
  role       text,
  task       text,
  status     text not null default 'brief'
             check (status in ('brief', 'jalan', 'semak', 'siap', 'sekat')),
  detail     text,
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists public.milestones (
  id     text primary key,
  label  text not null,
  "date" date not null,
  ord    smallint not null default 0
);

create table if not exists public.blocked (
  id          text primary key,
  what        text not null,
  why         text,
  resolved    boolean not null default false,
  resolved_at timestamptz,
  resolved_by text,
  ord         smallint not null default 0
);

create table if not exists public.specs (
  key   text primary key,
  value text not null,
  ord   smallint not null default 0
);

create table if not exists public.plans (
  name text primary key,
  text text not null,
  ord  smallint not null default 0
);

-- Kiraan fail HANYA wujud pada cakera — jadual ini ditulis skrip sync, bukan manusia.
create table if not exists public.evidence (
  week_id   text primary key references public.weeks (id) on delete cascade,
  docs      integer not null default 0,            -- Output/ dokumen + data
  code      integer not null default 0,            -- Output/ fail kod
  report    integer not null default 0,            -- Report/
  synced_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- 2. helper
create or replace function public.is_writer()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.members m
    where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and m.role in ('admin', 'member')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.members m
    where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and m.role = 'admin'
  );
$$;

-- security definer + search_path tetap: fungsi ini membaca `members` tanpa mencetuskan
-- RLS pada jadual itu sendiri. Tanpa ini, polisi members yang merujuk members = rekursi.
revoke all on function public.is_writer() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.is_writer() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists weeks_touch on public.weeks;
create trigger weeks_touch before update on public.weeks
  for each row execute function public.touch_updated_at();

drop trigger if exists tasks_touch on public.tasks;
create trigger tasks_touch before update on public.tasks
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- 3. RLS
alter table public.members     enable row level security;
alter table public.weeks       enable row level security;
alter table public.focus_items enable row level security;
alter table public.tasks       enable row level security;
alter table public.milestones  enable row level security;
alter table public.blocked     enable row level security;
alter table public.specs       enable row level security;
alter table public.plans       enable row level security;
alter table public.evidence    enable row level security;

do $$
declare t text;
begin
  foreach t in array array['weeks','focus_items','tasks','milestones',
                           'blocked','specs','plans','evidence']
  loop
    execute format('drop policy if exists %I_read on public.%I', t, t);
    execute format(
      'create policy %I_read on public.%I for select to anon, authenticated using (true)',
      t, t);

    execute format('drop policy if exists %I_write on public.%I', t, t);
    execute format(
      'create policy %I_write on public.%I for all to authenticated
         using (public.is_writer()) with check (public.is_writer())',
      t, t);
  end loop;
end $$;

-- members: tetamu TIDAK boleh baca senarai e-mel. Ahli nampak baris sendiri sahaja;
-- admin urus semua. Menambah ahli baru = tindakan pemilik projek melalui SQL Editor.
drop policy if exists members_read on public.members;
create policy members_read on public.members
  for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists members_admin on public.members;
create policy members_admin on public.members
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------- 4. hadiah
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- ------------------------------------------------------ 5. ahli (TUKAR EMEL!)
-- admin = Adam, member = Amru, viewer = penyelia (baca sahaja, boleh log masuk).
-- Hanya baris di sini boleh menulis. Ganti dengan emel sebenar.
insert into public.members (email, role, display_name) values
  ('adam@example.com', 'admin',  'Adam'),
  ('amru@example.com', 'member', 'Amru'),
  ('sv@example.com',   'viewer', 'Penyelia')
on conflict (email) do nothing;

commit;

-- ---------------------------------------------------------------- 6. semakan
-- Selepas `python tracker/export_snapshot.py --push`:
--   select count(*) from weeks;                                    -- 11
--   select count(*) from focus_items;                              -- 40
--   select count(*) from tasks;                                    -- 12
--   select count(*) from pg_policies where schemaname = 'public';  -- >= 17
--   select email, role from members;
--
-- Ujian RLS (mesti gagal/0 baris bila dijalankan sebagai anon):
--   set request.jwt.claims = '{"role":"anon"}';
--   update focus_items set done = true;
