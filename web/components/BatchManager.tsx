"use client";

import { useActionState, useState } from "react";
import { deleteBatch } from "@/lib/batch-actions";
import { batchLabel, groupByBatch, nextBatchNo, type BatchGroup } from "@/lib/batches";
import { fmtDate, fmtRange } from "@/lib/date";
import type { Batch, Task } from "@/lib/types";
import BatchForm from "./BatchForm";
import TaskDetail from "./TaskDetail";
import TaskForm from "./TaskForm";

function when(t: Task): string {
  if (t.start_date && t.end_date) return fmtRange(t.start_date, t.end_date);
  if (t.start_date) return `mula ${fmtDate(t.start_date)}`;
  if (t.end_date) return `tamat ${fmtDate(t.end_date)}`;
  return "belum dijadualkan";
}

/**
 * Satu panel = satu batch (atau kumpulan "tanpa batch"). Padam batch dua langkah:
 * klik pertama hanya membuka pengesahan, tiada apa dipadam.
 */
function BatchPanel({
  group,
  batches,
  canWrite,
  onOpenTask,
}: {
  group: BatchGroup;
  batches: Batch[];
  canWrite: boolean;
  onOpenTask: (id: string) => void;
}) {
  const [delState, delAction, delPending] = useActionState(deleteBatch, null);
  const [confirm, setConfirm] = useState(false);
  const b = group.batch;
  const rows = [...group.tasks].sort(
    (a, c) => (a.start_date ?? "9999-99-99").localeCompare(c.start_date ?? "9999-99-99") || a.id.localeCompare(c.id),
  );

  return (
    <section className="panel">
      <div className="ph">
        <div>
          <h3>{b ? batchLabel(b) : group.fallback}</h3>
          <div className="bmeta">
            <span>{b ? (b.date ? fmtDate(b.date) : "tarikh belum ditetapkan") : "tiada dalam jadual batches"}</span>
            <span>{rows.length} tugasan</span>
            {b?.note && <span>{b.note}</span>}
          </div>
        </div>

        {canWrite && b && (
          <div className="bacts">
            {!confirm ? (
              <button type="button" className="btn danger" onClick={() => setConfirm(true)}>
                Padam batch
              </button>
            ) : (
              <form action={delAction} className="bacts">
                <input type="hidden" name="id" value={b.id} />
                <span className="tf-hint">Padam batch ni? Tugasan kekal, jadi tanpa batch.</span>
                <button className="btn danger" type="submit" disabled={delPending}>
                  {delPending ? "memadam…" : "Ya, padam"}
                </button>
                <button type="button" className="btn" onClick={() => setConfirm(false)}>
                  Batal
                </button>
              </form>
            )}
            {delState && !delState.ok && <p className="errline">{delState.message}</p>}
            {delState?.ok && <span className="okline">{delState.message}</span>}
          </div>
        )}
      </div>

      {(canWrite || rows.length === 0) && (
        <div className="tools">
          {canWrite && b && (
            <details className="bx">
              <summary>Ubah batch (nama, tarikh, nota)</summary>
              <div className="inner">
                <BatchForm batch={b} canWrite={canWrite} nextNo={b.no} compact />
              </div>
            </details>
          )}
        </div>
      )}

      <div className="pb" style={{ paddingTop: 10 }}>
        {rows.length === 0 && <p className="bempty">Belum ada tugasan dalam kumpulan ini.</p>}

        {rows.map((t) => (
          <div className="task" key={t.id}>
            <span className="id">{t.id}</span>
            <button type="button" className="t as-btn" onClick={() => onOpenTask(t.id)} title="buka butiran / sunting">
              {t.task}
              <em>
                {t.role || "—"} · {when(t)}
              </em>
            </button>
            <span className={`st ${t.status}`}>{t.status}</span>
          </div>
        ))}

        {canWrite && (
          <details className="bx" style={{ marginTop: 10 }}>
            <summary>Tambah tugasan dalam kumpulan ini</summary>
            <div className="inner">
              <TaskForm canWrite={canWrite} batches={batches} defaultBatchId={b?.id} compact />
            </div>
          </details>
        )}
      </div>
    </section>
  );
}

export default function BatchManager({
  batches,
  tasks,
  canWrite,
  batchesReady,
}: {
  batches: Batch[];
  tasks: Task[];
  canWrite: boolean;
  batchesReady: boolean;
}) {
  const [sel, setSel] = useState<string | null>(null);
  const groups = groupByBatch(tasks, batches);
  const selected = tasks.find((t) => t.id === sel) ?? null;

  return (
    <>
      {!batchesReady && (
        <div className="banner err">
          <span>
            Jadual <code>batches</code> belum ada dalam Supabase, jadi senarai ini dicantumkan dari
            nombor batch tugasan sahaja. Jalankan{" "}
            <code>web/supabase/migrations/2026-11-10_batches.sql</code> dalam SQL Editor untuk
            mengurus batch, kemudian muat semula halaman ini.
          </span>
        </div>
      )}

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="ph">
          <h3>Tambah batch</h3>
          <span className="stamp">
            {batches.length} batch · {tasks.length} tugasan
          </span>
        </div>
        <div className="pb" style={{ paddingTop: 12 }}>
          {canWrite ? (
            <BatchForm canWrite={canWrite} nextNo={nextBatchNo(batches)} />
          ) : (
            <p className="secnote" style={{ margin: 0 }}>
              Anda melihat sebagai <b>baca sahaja</b> — senarai boleh dibaca, tetapi tiada butang
              tulis dipaparkan dan hantar akan ditolak oleh pelayan.
            </p>
          )}
        </div>
      </div>

      <div className="bstack" style={{ marginTop: 14 }}>
        {groups.map((g) => (
          <BatchPanel
            key={g.batch?.id ?? g.fallback}
            group={g}
            batches={batches}
            canWrite={canWrite}
            onOpenTask={setSel}
          />
        ))}
      </div>

      {selected && (
        <TaskDetail
          task={selected}
          canWrite={canWrite}
          batches={batches}
          onClose={() => setSel(null)}
        />
      )}
    </>
  );
}
