"use client";

import { useState } from "react";
import { diffDays, fmtDate, fmtRange } from "@/lib/date";
import type { Task } from "@/lib/types";
import TaskDetail from "./TaskDetail";

type Wk = { id: string; label: string; start: string | null; end: string | null };

type Row = { t: Task; s: string; e: string };

const STATUSES = ["brief", "jalan", "semak", "siap", "sekat"] as const;

/**
 * Carta Gantt: baris = tugasan ikut batch, lajur = minggu dari jadual `weeks`.
 *
 * Geometri dikira dari tarikh sebenar (hari), bukan daripada indeks minggu, jadi bar
 * yang mula pada hari Rabu berada di tengah-tengah lajur minggu itu. Tugasan yang
 * tarikhnya jatuh di luar 11 minggu projek MELEBARKAN paksi — paksi tidak pernah
 * memotong tarikh yang Adam isi.
 */
export default function GanttChart({
  tasks,
  weeks,
  today,
  canWrite,
}: {
  tasks: Task[];
  weeks: Wk[];
  today: string;
  canWrite: boolean;
}) {
  const [sel, setSel] = useState<string | null>(null);

  const rows: Row[] = tasks
    .filter((t) => t.start_date || t.end_date)
    .map((t) => ({
      t,
      s: (t.start_date ?? t.end_date) as string,
      e: (t.end_date ?? t.start_date) as string,
    }))
    .sort((a, b) => a.s.localeCompare(b.s) || a.t.id.localeCompare(b.t.id));

  const undated = tasks.filter((t) => !t.start_date && !t.end_date);

  const wkStart = weeks.map((w) => w.start).filter((x): x is string => Boolean(x));
  const wkEnd = weeks.map((w) => w.end).filter((x): x is string => Boolean(x));
  const lo = [today, ...wkStart, ...rows.map((r) => r.s)].sort()[0];
  const hi = [today, ...wkEnd, ...rows.map((r) => r.e)].sort().slice(-1)[0];
  const span = Math.max(diffDays(lo, hi) + 1, 1);

  const at = (iso: string) => (diffDays(lo, iso) / span) * 100;
  const wide = (a: string, b: string) => ((diffDays(a, b) + 1) / span) * 100;

  // kumpul ikut batch; batch 0 = tugas yang ditambah dari web (tiada nombor batch)
  const groups = new Map<number, Row[]>();
  for (const r of rows) {
    const g = groups.get(r.t.batch_no) ?? [];
    g.push(r);
    groups.set(r.t.batch_no, g);
  }
  const batchNos = [...groups.keys()].sort((a, b) => a - b);

  const selected = tasks.find((t) => t.id === sel) ?? null;
  const nowInside = today >= lo && today <= hi;

  return (
    <>
      <div className="panel">
        <div className="ph">
          <h3>Susunan ikut minggu</h3>
          <span className="stamp">
            {rows.length} bertarikh · {undated.length} belum · paksi {fmtRange(lo, hi)}
          </span>
        </div>

        <div className="g-legend">
          {STATUSES.map((s) => (
            <span key={s}>
              <i className={`sw ${s}`} />
              {s}
            </span>
          ))}
          <span>
            <i className="sw now" />
            hari ini
          </span>
        </div>

        <div className="gantt">
          <div className="g-row g-head">
            <div className="g-label">Tugasan</div>
            <div className="g-track">
              {weeks.map((w) =>
                w.start && w.end ? (
                  <div
                    key={w.id}
                    className="g-col"
                    style={{ left: `${at(w.start)}%`, width: `${wide(w.start, w.end)}%` }}
                  >
                    <i>{w.label.replace("Minggu ", "M")}</i>
                    <em>{w.start.slice(8, 10)}/{w.start.slice(5, 7)}</em>
                  </div>
                ) : null,
              )}
              {nowInside && (
                <div className="g-now" style={{ left: `${at(today)}%` }}>
                  <b>hari ini</b>
                </div>
              )}
            </div>
          </div>

          {batchNos.map((no) => (
            <div key={no} className="g-group">
              <div className="g-row g-batch">
                <div className="g-label">{no === 0 ? "Tanpa batch" : `Batch ${no}`}</div>
                <div className="g-track" />
              </div>
              {groups.get(no)!.map((r) => {
                const left = at(r.s);
                const width = Math.max(wide(r.s, r.e), 1.4);
                const late = r.e < today && r.t.status !== "siap";
                return (
                  <div className="g-row" key={r.t.id}>
                    <div className="g-label">
                      <button className="g-task" onClick={() => setSel(r.t.id)} title="buka butiran">
                        {r.t.task}
                      </button>
                      <em>
                        {r.t.id} · {r.t.role || "—"} · {fmtDate(r.s)} → {fmtDate(r.e)}
                      </em>
                    </div>
                    <div className="g-track">
                      {nowInside && <div className="g-now thin" style={{ left: `${at(today)}%` }} />}
                      <button
                        className={`g-bar ${r.t.status} ${late ? "late" : ""}`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        onClick={() => setSel(r.t.id)}
                        title={`${r.t.task} · ${r.t.status} · ${fmtDate(r.s)} → ${fmtDate(r.e)}${late ? " · lewat" : ""}`}
                      >
                        <i>{r.t.status}</i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {rows.length === 0 && (
            <p className="g-empty">
              Tiada tugasan bertarikh lagi. Isi tarikh pada tugasan di bawah, atau guna borang
              &ldquo;Tambah tugasan&rdquo; — tarikh kosong dibiarkan kosong, bukan diisi hari ini.
            </p>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="ph">
          <h3>Belum dijadualkan</h3>
          <span className="stamp">{undated.length} tugasan · tiada tarikh direka</span>
        </div>
        <div className="pb">
          {undated.length === 0 && <p className="secnote">Semua tugasan sudah ada tarikh.</p>}
          {undated.map((t) => (
            <div className="task" key={t.id}>
              <span className="id">{t.id}</span>
              <button className="t as-btn" onClick={() => setSel(t.id)}>
                {t.task}
                <em>
                  {t.role || "—"} · belum ada tarikh
                </em>
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
