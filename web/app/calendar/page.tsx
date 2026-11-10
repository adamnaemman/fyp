import Link from "next/link";
import { getTracker } from "@/lib/data";
import { getViewer } from "@/lib/auth";
import { taskDue, todayIso } from "@/lib/date";
import TopBar from "@/components/TopBar";
import type { Task } from "@/lib/types";

export const instant = false;

const MON = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];
const DOW = ["Is", "Se", "Ra", "Kh", "Ju", "Sa", "Ah"];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

function shift(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}`;
}

export default async function Calendar({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const sp = await searchParams;
  const [tracker, viewer] = await Promise.all([getTracker(), getViewer()]);
  const today = todayIso();
  const ym = /^\d{4}-\d{2}$/.test(sp.m ?? "") ? (sp.m as string) : today.slice(0, 7);
  const [y, m] = ym.split("-").map(Number);

  const first = new Date(Date.UTC(y, m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7; // Isnin = 0
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();

  const byDay = new Map<string, Task[]>();
  for (const t of tracker.tasks) {
    const key = taskDue(t) || t.start_date;
    if (!key) continue;
    byDay.set(key, [...(byDay.get(key) ?? []), t]);
  }

  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => iso(y, m, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthTasks = tracker.tasks.filter((t) => {
    const k = taskDue(t) || t.start_date;
    return k ? k.startsWith(ym) : false;
  });
  const undated = tracker.tasks.filter((t) => !taskDue(t) && !t.start_date);

  return (
    <>
      <TopBar viewer={viewer} mode={tracker.mode} generated={tracker.generated} />
      <div className="wrap">
        <h2 className="sec">Kalendar</h2>
        <p className="secnote">
          Tugasan diletakkan pada <b>tarikh akhir</b>. Klik anak panah untuk bulan lain.
        </p>

        <div className="panel">
          <div className="ph">
            <h3>
              {MON[m - 1]} {y}
            </h3>
            <span className="cal-nav">
              <Link className="gbtn" href={`/calendar?m=${shift(ym, -1)}`}>
                ←
              </Link>
              <Link className="gbtn" href="/calendar">
                hari ini
              </Link>
              <Link className="gbtn" href={`/calendar?m=${shift(ym, 1)}`}>
                →
              </Link>
              <span className="stamp">{monthTasks.length} tugasan</span>
            </span>
          </div>
          <div className="pb">
            <div className="cal">
              {DOW.map((d) => (
                <div className="cal-dow" key={d}>
                  {d}
                </div>
              ))}
              {cells.map((day, i) => {
                const list = day ? byDay.get(day) ?? [] : [];
                const isToday = day === today;
                return (
                  <div className={`cal-cell ${day ? "" : "empty"} ${isToday ? "today" : ""}`} key={i}>
                    {day && <span className="cal-day">{+day.slice(8, 10)}</span>}
                    {list.slice(0, 3).map((t) => {
                      const due = taskDue(t);
                      const late = Boolean(due && due < today && t.status !== "siap");
                      return (
                        <span
                          key={t.id}
                          className={`cal-task st-${t.status} ${late ? "late" : ""}`}
                          title={`${t.task} · ${t.status}`}
                        >
                          {t.task}
                        </span>
                      );
                    })}
                    {list.length > 3 && (
                      <span className="cal-more">+{list.length - 3} lagi</span>
                    )}
                  </div>
                );
              })}
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
      </div>
    </>
  );
}
