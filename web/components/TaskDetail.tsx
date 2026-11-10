"use client";

import { useActionState, useEffect, useState } from "react";
import { fmtRange } from "@/lib/date";
import type { Batch, Task } from "@/lib/types";
import TaskForm from "./TaskForm";
import { deleteTask } from "@/lib/task-actions";

/**
 * Panel butiran satu tugasan. Dibuka dengan klik chip kalendar atau bar Gantt.
 * Panel yang sama memegang borang suntingan — satu jalan tulis untuk tarikh/status.
 * `batches` dihantar dari halaman yang mengurus batch (/tugasan); halaman lain
 * biarkan ia undefined dan borang guna nombor batch seperti dulu.
 */
export default function TaskDetail({
  task,
  canWrite,
  onClose,
  batches,
}: {
  task: Task;
  canWrite: boolean;
  onClose: () => void;
  batches?: Batch[];
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const [delState, delAction, delPending] = useActionState(deleteTask, null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (delState?.ok) onClose();
  }, [delState, onClose]);

  const when =
    task.start_date && task.end_date
      ? fmtRange(task.start_date, task.end_date)
      : task.start_date
        ? `mula ${task.start_date}`
        : task.end_date
          ? `tamat ${task.end_date}`
          : "belum dijadualkan";

  const batchRow = batches
    ? (batches.find((b) => b.id === task.batch_id) ?? batches.find((b) => b.no === task.batch_no))
    : undefined;
  const batchText = task.batch_no
    ? `Batch ${task.batch_no}${batchRow?.label ? ` · ${batchRow.label}` : ""}`
    : "tanpa batch";

  return (
    <>
      <div className="drawer-bg" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label="Butiran tugasan">
        <div className="drawer-h">
          <div>
            <span className="kicker" style={{ margin: 0 }}>
              {task.id}
            </span>
            <h3>{task.task}</h3>
          </div>
          <button className="btn" onClick={onClose} aria-label="Tutup">
            ✕
          </button>
        </div>

        <dl className="kv">
          <dt>Bila</dt>
          <dd>{when}</dd>
          <dt>Status</dt>
          <dd>
            <span className={`st ${task.status}`}>{task.status}</span>
          </dd>
          <dt>Pemilik</dt>
          <dd>{task.role || "—"}</dd>
          <dt>Batch</dt>
          <dd>
            {batchText}
            {task.batch_note ? ` · ${task.batch_note}` : ""}
          </dd>
          <dt>Butiran</dt>
          <dd>{task.detail || "tiada butiran"}</dd>
        </dl>

        <div className="drawer-f">
          <TaskForm task={task} canWrite={canWrite} compact onSaved={onClose} batches={batches} />

          {canWrite && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
              {!confirm ? (
                <button type="button" className="btn danger" onClick={() => setConfirm(true)}>
                  Padam tugasan
                </button>
              ) : (
                <form action={delAction} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <input type="hidden" name="id" value={task.id} />
                  <span style={{ fontSize: 12.5, color: "var(--dim)" }}>Padam terus?</span>
                  <button className="btn danger" type="submit" disabled={delPending}>
                    {delPending ? "memadam…" : "Ya, padam"}
                  </button>
                  <button type="button" className="btn" onClick={() => setConfirm(false)}>
                    Batal
                  </button>
                </form>
              )}
              {delState && !delState.ok && <p className="errline">{delState.message}</p>}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
