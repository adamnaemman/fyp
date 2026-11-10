import { getTracker } from "@/lib/data";
import { getViewer } from "@/lib/auth";
import { fmtRange, taskDue, todayIso } from "@/lib/date";

const MON3 = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];
const short = (iso: string) => `${iso.slice(8, 10)} ${MON3[+iso.slice(5, 7) - 1]}`;
import TopBar from "@/components/TopBar";
import type { Task } from "@/lib/types";

export const instant = false;

const DAY = 86_400_000;
const toUTC = (iso: string) =>
  Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
const fromUTC = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => fromUTC(toUTC(iso) + n * DAY);
const daysBetween = (a: string, b: string) => Math.round((toUTC(b) - toUTC(a)) / DAY);

type Row = Task & { s: string; d: string };

export default async function Gantt({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const sp = await searchParams;
  const [tracker, viewer] = await Promise.all([getTracker(), getViewer()]);
  const canWrite = Boolean(viewer?.canWrite);
  const today = todayIso();

  const rows: Row[] = tracker.tasks
    .filter((t) => t.start_date && taskDue(t))
    .map((t) => ({ ...t, s: t.start_date as string, d: taskDue(t) as string }))
    .sort((a, b) => a.s.localeCompare(b.s));

  const undated = tracker.tasks.filter((t) => !t.start_date || !taskDue(t));

  const weekStarts = tracker.weeks.map((w) => w.start).filter(Boolean) as string[];
  const candidates = [today, ...rows.map((r) => r.s), ...weekStarts];
  const spanStart = candidates.sort()[0];
  const ends = [...rows.map((r) => r.d), ...tracker.weeks.map((w) => w.end).filter(Boolean)]
    .filter(Boolean) as string[];
  const spanEnd = ends.sort().slice(-1)[0] ?? addDays(today, 30);
  const total = Math.max(daysBetween(spanStart, spanEnd), 1);

  const pos = (iso: string) => (daysBetween(spanStart, iso) / total) * 100;
  const groups = [...new Set(rows.map((r) => r.batch_no))].sort((a, b) => a - b);

  return (
    <>
      <TopBar viewer={viewer} mode={tracker.mode} generated={tracker.generated} />
      <div className="wrap">
        {sp.err && <div className="banner err">{sp.err}</div>}
        {sp.ok && <div className="banner ok">Tugasan disimpan.</div>}

        <h2 className="sec">Carta Gantt</h2>
        <p className="secnote">
          Tempoh projek <b>{fmtRange(spanStart, spanEnd)}</b>. Setiap bar satu tugasan, di kedudukan
          tarikh mula dan tarikh akhirnya. Bar merah = tarikh akhir dah lepas tetapi status belum{" "}
          <code>siap</code>.
        </p>

        <div className="panel">
          <div className="ph">
            <h3>Susunan tugas</h3>
            <span className="stamp">
              {rows.length} bertarikh · {undated.length} belum
            </span>
          </div>
          <div className="pb">
            <div className="g-wrap">
              <div className="g-ticks">
                <div className="g-label" />
                <div className="g-track">
                  {tracker.weeks.map((w) =>
                    w.start ? (
                      <span
                        key={w.id}
                        className="g-tick"
                        style={{ left: `${pos(w.start)}%` }}
                        title={w.label}
                      >
                        <i>{w.label.replace("Minggu ", "M")}</i>
                      </span>
                    ) : null,
                  )}
                  <span className="g-now" style={{ left: `${pos(today)}%` }} title="hari ini" />
                </div>
              </div>

              {groups.map((g) => (
                <div key={g}>
                  <div className="g-group">Batch {g === 0 ? "—" : g}</div>
                  {rows
                    .filter((r) => r.batch_no === g)
                    .map((r) => {
                      const late = r.d < today && r.status !== "siap";
                      const left = Math.max(0, pos(r.s));
                      const width = Math.max(1.2, pos(r.d) - pos(r.s));
                      return (
                        <div className="g-row" key={r.id}>
                          <div className="g-label">
                            <b>{r.task}</b>
                            <em>
                              {r.id} · {r.role} · {short(r.s)} → {short(r.d)}
                            </em>
                          </div>
                          <div className="g-track">
                            <span
                              className={`g-bar st-${r.status} ${late ? "late" : ""}`}
                              style={{ left: `${left}%`, width: `${width}%` }}
                              title={`${r.task} · ${r.status}`}
                            >
                              <i>{r.status}</i>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}

              {rows.length === 0 && (
                <p className="secnote" style={{ padding: "14px 0" }}>
                  Tiada tugasan bertarikh lagi. Isi tarikh di bawah, atau jalankan migrasi{" "}
                  <code>web/supabase/migrations/2026-11-10_task_dates.sql</code>.
                </p>
              )}
            </div>
          </div>
        </div>

        {undated.length > 0 && (
          <div className="panel" style={{ marginTop: 14 }}>
            <div className="ph">
              <h3>Belum ada tarikh</h3>
              <span className="stamp">{undated.length} tugasan</span>
            </div>
            <div className="pb">
              {undated.map((t) => (
                <div className="task" key={t.id}>
                  <span className="id">{t.id}</span>
                  <span className="t">
                    {t.task}
                    <em>{t.role}</em>
                  </span>
                  <span className={`st ${t.status}`}>{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {canWrite ? (
          <div className="panel" style={{ marginTop: 14 }}>
            <div className="ph">
              <h3>Tambah tugasan</h3>
            </div>
            <div className="pb">
              <form className="addform" method="post" action="/api/task/add">
                <label>
                  Tugasan
                  <input name="task" required placeholder="Contoh: ujian bacaan 5 tag dalam cavity" />
                </label>
                <label>
                  Untuk siapa
                  <input name="role" placeholder="Adam / Amru" />
                </label>
                <label>
                  Mula
                  <input type="date" name="start_date" required defaultValue={today} />
                </label>
                <label>
                  Akhir
                  <input type="date" name="due_date" required defaultValue={addDays(today, 3)} />
                </label>
                <button className="go" type="submit">
                  Simpan
                </button>
              </form>
            </div>
          </div>
        ) : (
          <p className="secnote" style={{ marginTop: 14 }}>
            Log masuk sebagai ahli untuk menambah tugasan.
          </p>
        )}
      </div>
    </>
  );
}
