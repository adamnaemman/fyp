"use client";

import { useEffect } from "react";
import { fmtRange } from "@/lib/date";
import type { Task } from "@/lib/types";
import TaskForm from "./TaskForm";

/**
 * Panel butiran satu tugasan. Dibuka dengan klik chip kalendar atau bar Gantt.
 * Panel yang sama memegang borang suntingan — satu jalan tulis untuk tarikh/status.
 */
export default function TaskDetail({
  task,
  canWrite,
  onClose,
}: {
  task: Task;
  canWrite: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const when =
    task.start_date && task.end_date
      ? fmtRange(task.start_date, task.end_date)
      : task.start_date
        ? `mula ${task.start_date}`
        : task.end_date
          ? `tamat ${task.end_date}`
          : "belum dijadualkan";

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
            {task.batch_no ? `Batch ${task.batch_no}` : "tanpa batch"}
            {task.batch_note ? ` · ${task.batch_note}` : ""}
          </dd>
          <dt>Butiran</dt>
          <dd>{task.detail || "tiada butiran"}</dd>
        </dl>

        <div className="drawer-f">
          <TaskForm task={task} canWrite={canWrite} compact onSaved={onClose} />
        </div>
      </aside>
    </>
  );
}
