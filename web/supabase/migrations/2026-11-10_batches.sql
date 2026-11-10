-- Jadual `batches` + pautan `tasks.batch_id`
--
-- Kenapa: dulu batch hanya wujud sebagai nombor (tasks.batch_no) + nota/date yang
-- disalin pada setiap tugasan. Untuk urus batch dalam web (namakan semula, ubah tarikh,
-- padam), batch perlu jadi baris sendiri.
--
-- Jalankan dalam Supabase → SQL Editor → New query → Run. Selamat dijalankan berulang.
-- Skrip ini TIDAK mengisi tarikh yang tidak ada: batch sedia ada mewarisi tarikh/nota
-- yang memang sudah tertulis pada tugasan. Tiada tarikh baru direka.

begin;

create table if not exists public.batches (
  id         text primary key,
  no         smallint not null default 0,
  label      text not null default '',
  date       date,                                  -- NULL = tarikh belum ditetapkan
  note       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- kolum pautan pada tasks (nullable: tugasan lama boleh tiada batch)
alter table public.tasks add column if not exists batch_id text;

-- foreign key: padam batch → tugasannya jadi tanpa batch, bukan ikut terpadam.
do $$
begin
  alter table public.tasks
    add constraint tasks_batch_fk
    foreign key (batch_id) references public.batches (id) on delete set null;
exception
  when duplicate_object then null;
end $$;

create index if not exists tasks_batch_idx on public.tasks (batch_id);

-- trigger updated_at (fungsi sudah ada dari schema.sql; cipta kalau belum)
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists batches_touch on public.batches;
create trigger batches_touch before update on public.batches
  for each row execute function public.touch_updated_at();

-- RLS: tetamu baca, hanya ahli members (admin/member) tulis.
alter table public.batches enable row level security;

drop policy if exists batches_read on public.batches;
create policy batches_read on public.batches
  for select to anon, authenticated using (true);

drop policy if exists batches_write on public.batches;
create policy batches_write on public.batches
  for all to authenticated
  using (public.is_writer()) with check (public.is_writer());

grant select on public.batches to anon;
grant select, insert, update, delete on public.batches to authenticated;

-- Pindahkan batch yang sudah ada dalam tasks.batch_no jadi baris batches.
-- Tarikh/nota diambil daripada tugasannya sendiri (tiada nilai baru dicipta).
insert into public.batches (id, no, label, date, note)
select distinct on (t.batch_no)
       'batch-' || t.batch_no::text,
       t.batch_no,
       '',
       t.batch_date,
       t.batch_note
from public.tasks t
where t.batch_no > 0
order by t.batch_no, t.batch_date nulls last
on conflict (id) do nothing;

update public.tasks t
set batch_id = 'batch-' || t.batch_no::text
where t.batch_id is null
  and t.batch_no > 0;

commit;

-- Semak selepas jalan:
select id, no, label, date, note from public.batches order by no;
select count(*) filter (where batch_id is null) as tanpa_batch,
       count(*) filter (where batch_id is not null) as dengan_batch
from public.tasks;
