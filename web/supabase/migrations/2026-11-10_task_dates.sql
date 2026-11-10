-- Tarikh per-tugasan untuk tab Gantt + Kalendar
-- Jalankan dalam Supabase → SQL Editor → New query → Run. Selamat dijalankan berulang.
--
-- PENTING: skrip ini TIDAK mengisi sebarang tarikh.
-- Tugasan yang belum dijadualkan kekal NULL dan muncul dalam senarai
-- "Belum dijadualkan" dalam app. Tiada tarikh batch, tiada "+6 hari", tiada hari ini —
-- tarikh hanya wujud bila Adam menaipnya.

alter table public.tasks add column if not exists start_date date;
alter table public.tasks add column if not exists end_date   date;

comment on column public.tasks.start_date is 'Tarikh mula pilihan. NULL = belum dijadualkan.';
comment on column public.tasks.end_date   is 'Tarikh tamat pilihan. NULL = belum dijadualkan.';

create index if not exists tasks_start_idx on public.tasks (start_date);

-- Draf awal ciri ini memakai nama kolum `due_date`. Skema akhir guna `end_date`.
-- Kalau kolum `due_date` tercipta pada DB ini dan masih kosong, ia boleh dibuang.
-- Semak dulu:
--   select count(*) from public.tasks where due_date is not null;
-- Kalau hasilnya 0:
-- alter table public.tasks drop column if exists due_date;

-- Semak selepas jalan:
select id, task, status, start_date, end_date
from public.tasks
order by batch_no, id;
