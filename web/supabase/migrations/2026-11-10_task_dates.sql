-- Tarikh per-task untuk Gantt + Kalendar
-- Jalankan dalam Supabase → SQL Editor. Selamat dijalankan berulang.

alter table public.tasks add column if not exists start_date date;
alter table public.tasks add column if not exists due_date   date;

-- Isi tarikh dari batch untuk baris yang belum ada (anggaran: batch_date → batch_date+6)
update public.tasks
set start_date = coalesce(start_date, batch_date),
    due_date   = coalesce(due_date, batch_date + 6)
where batch_date is not null
  and (start_date is null or due_date is null);

-- Semak
select id, task, start_date, due_date from public.tasks order by batch_no, id;
