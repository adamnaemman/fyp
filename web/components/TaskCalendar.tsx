"use client";

import Link from "next/link";
import { useState } from "react";
import { isoDay, monthTitle, shiftMonth } from "@/lib/date";
import type { Task } from "@/lib/types";
import TaskDetail from "./TaskDetail";

const DOW = ["Is", "Se", "Ra", "Kh", "Ju", "Sa", "Ah"];

/**
 * Kalendar bulanan. Tugasan muncul sebagai chip pada tarikh MULA dan tarikh TAMAT;
 * hari di antaranya ditanda sebagai julat. Tiada tarikh = tiada chip — app tidak
 * meletakkan tugas pada hari yang Adam tak pilih.
 */
export default function TaskCalendar({
  tasks,
  ym,
  today,
  canWrite,
}: {
  tasks: Task[];
  ym: string;
  today: string;
  canWrite: boolean;
}) {
  const [sel, setSel] = useState<string | null>(null);

  const y = +ym.slice(0, 4);
  const m = +ym.slice(5, 7);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7; // Isnin = lajur pertama
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();

  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => isoDay(y, m, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const startsOn = new Map<string, Task[]>();
  const endsOn = new Map<string, Task[]>();
  const inRange = new Map<string, Task[]>();
  const undated: Task[] = [];

  const push = (map: Map<string, Task[]>, k: string, t: Task) => {
    const arr = map.get(k) ?? [];
    arr.push(t);
    map.set(k, arr);
  };

  for (const t of tasks) {
    if (!t.start_date && !t.end_date) {
      undated.push(t);
      continue;
    }
    if (t.start_date) push(startsOn, t.start_date, t);
    if (t.end_date) push(endsOn, t.end_date, t);
    if (t.start_date && t.end_date && t.start_date !== t.end_date) {
      const a = Date.UTC(+t.start_date.slice(0, 4), +t.start_date.slice(5, 7) - 1, +t.start_date.slice(8, 10));
      const b = Date.UTC(+t.end_date.slice(0, 4), +t.end_date.slice(5, 7) - 1, +t.end_date.slice(8, 10));
      for (let ms = a + 86_400_000; ms < b; ms += 86_400_000) {
        const iso = new Date(ms).toISOString().slice(0, 10);
        if (iso.startsWith(ym)) push(inRange, iso, t);
      }
    }
  }

  const selected = tasks.find((t) => t.id === sel) ?? null;

  return (
    <>
      <div className="panel">
        <div className="ph">
          <h3>{monthTitle(ym)}</h3>
          <div className="cal-nav">
            <Link className="gbtn" href={`/calendar?m=${shiftMonth(ym, -1)}`} aria-label="bulan sebelum">
              ←
            </Link>
            <Link className="gbtn" href="/calendar">
              bulan ini
            </Link>
            <Link className="gbtn" href={`/calendar?m=${shiftMonth(ym, 1)}`} aria-label="bulan selepas">
              →
            </Link>
          </div>
        </div>

        <div className="cal-wrap">
          <div className="cal">
            {DOW.map((d) => (
              <div className="cal-dow" key={d}>
                {d}
              </div>
            ))}

            {cells.map((day, i) => {
              if (!day) return <div className="cal-cell empty" key={`e${i}`} />;
              const s = startsOn.get(day) ?? [];
              const e = endsOn.get(day) ?? [];
              const mid = inRange.get(day) ?? [];
              const isToday = day === today;
              return (
                <div className={`cal-cell ${isToday ? "today" : ""} ${mid.length ? "span" : ""}`} key={day}>
                  <span className="cal-day">{+day.slice(8, 10)}</span>
                  {s.map((t) => (
                    <button
                      key={`s${t.id}`}
                      className={`cal-chip ${t.status} start`}
                      onClick={() => setSel(t.id)}
                      title={`${t.task} · mula ${day}`}
                    >
                      <b>▸</b> {t.task}
                    </button>
                  ))}
                  {e.map((t) => (
                    <button
                      key={`e${t.id}`}
                      className={`cal-chip ${t.status} end ${t.end_date && t.end_date < today && t.status !== "siap" ? "late" : ""}`}
                      onClick={() => setSel(t.id)}
                      title={`${t.task} · tamat ${day}`}
                    >
                      <b>▪</b> {t.task}
                    </button>
                  ))}
                  {mid.length > 0 && (
                    <span className="cal-span" title={mid.map((t) => t.task).join(" · ")}>
                      {mid.length} dalam julat
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="ph">
          <h3>Belum dijadualkan</h3>
          <span className="stamp">{undated.length} tugasan</span>
        </div>
        <div className="pb">
          {undated.length === 0 && <p className="secnote">Semua tugasan sudah ada tarikh.</p>}
          {undated.map((t) => (
            <div className="task" key={t.id}>
              <span className="id">{t.id}</span>
              <button className="t as-btn" onClick={() => setSel(t.id)}>
                {t.task}
                <em>{t.role || "—"} · belum ada tarikh</em>
              </button>
              <span className={`st ${t.status}`}>{t.status}</span>
            </div>
          ))}
        </div>
      </div>

      {selected && <TaskDetail task={selected} canWrite={canWrite} onClose={() => setSel(null)} />}
    </>
  );
}
