-- Tambah Minggu 1–4 pada garis masa
--
-- Kenapa perlu: folder projek mula dari Week05, jadi minggu 1–4 tiada dalam DB.
-- Tarikh di sini BUKAN agakan bebas — ia dikira ke belakang dari minggu 5:
--   Week05 bermula Isnin 26 Okt 2026, jadi setiap minggu sebelumnya 7 hari lebih awal:
--   M1 28 Sep · M2 05 Okt · M3 12 Okt · M4 19 Okt (setiap satu 7 hari, Isnin–Ahad).
-- Kalau jadual sebenar semesta lain, tukar tarikh di bawah — tiada apa bergantung padanya
-- selain kedudukan bar dalam Gantt.
--
-- Jalankan dalam Supabase → SQL Editor. Selamat dijalankan berulang.

insert into public.weeks (id, num, suffix, label, start_date, end_date, seminar, gate, sort)
values
  ('Week01', 1, '', 'Minggu 1', '2026-09-28', '2026-10-04', null, '-', -4),
  ('Week02', 2, '', 'Minggu 2', '2026-10-05', '2026-10-11', null, '-', -3),
  ('Week03', 3, '', 'Minggu 3', '2026-10-12', '2026-10-18', null, '-', -2),
  ('Week04', 4, '', 'Minggu 4', '2026-10-19', '2026-10-25', null, '-', -1)
on conflict (id) do update
  set label      = excluded.label,
      start_date = excluded.start_date,
      end_date   = excluded.end_date,
      sort       = excluded.sort;

select id, label, start_date, end_date from public.weeks order by sort;
