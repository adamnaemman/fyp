"use client";

import { useActionState, useState } from "react";
import { saveTask } from "@/lib/task-actions";
import type { ActionResult, Batch, Task, TaskStatus } from "@/lib/types";

export const STATUS_LABEL: Record<TaskStatus, string> = {
  brief: "brief",
  jalan: "jalan",
  semak: "semak",
  siap: "siap",
  sekat: "sekat",
};

const STATUSES = Object.keys(STATUS_LABEL) as TaskStatus[];

/**
 * Borang tambah DAN kemas kini. Tarikh dibiarkan kosong secara lalai — app tidak
 * sekali-kali mengisi tarikh hari ini bagi pihak Adam. Kosong = belum dijadualkan.
 *
 * `batches` (pilihan): bila dihantar, medan batch jadi senarai pilihan dari jadual
 * `batches`. Tugasan lama yang hanya ada `batch_no` dipadankan ikut nombor itu.
 */
export default function TaskForm({
  task,
  canWrite,
  onSaved,
  compact,
  batches,
  defaultBatchId,
}: {
  task?: Task;
  canWrite: boolean;
  onSaved?: () => void;
  compact?: boolean;
  batches?: Batch[];
  defaultBatchId?: string;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    async (prev, fd) => {
      const res = await saveTask(prev, fd);
      if (res.ok) onSaved?.();
      return res;
    },
    null,
  );

  const [pick, setPick] = useState<string>(() => {
    if (task?.batch_id) return task.batch_id;
    if (task && task.batch_no > 0) {
      const match = batches?.find((b) => b.no === task.batch_no);
      if (match) return match.id;
    }
    return defaultBatchId ?? "";
  });
  const picked = batches?.find((b) => b.id === pick);
  const unknownPick = Boolean(pick) && !picked;

  return (
    <form className={`tform ${compact ? "compact" : ""}`} action={action}>
      {task && <input type="hidden" name="id" value={task.id} />}

      <label className="tf-wide">
        <span>Tugasan</span>
        <input name="task" required defaultValue={task?.task ?? ""} placeholder="Contoh: ujian bacaan 5 tag dalam cavity" />
      </label>

      {batches ? (
        <label>
          <span>Kumpulan (batch)</span>
          <select value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">— tanpa batch —</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                Batch {b.no}
                {b.label ? ` · ${b.label}` : ""}
              </option>
            ))}
            {unknownPick && <option value={pick}>Batch {task?.batch_no} · tiada dalam senarai</option>}
          </select>
          <input type="hidden" name="batch_id" value={pick} />
          <input type="hidden" name="batch_no" value={picked ? picked.no : (task?.batch_no ?? 0)} />
        </label>
      ) : (
        <label>
          <span>Kumpulan (batch)</span>
          <input
            name="batch_no"
            type="number"
            min="0"
            step="1"
            defaultValue={task?.batch_no ?? 0}
            title="0 = tanpa kumpulan"
          />
        </label>
      )}

      <label>
        <span>Pemilik / peranan</span>
        <input name="role" defaultValue={task?.role ?? ""} placeholder="Adam / Amru / SV" list="tf-roles" />
        <datalist id="tf-roles">
          <option value="Adam">Adam</option>
          <option value="Amru">Amru</option>
          <option value="SV">SV</option>
        </datalist>
      </label>

      <label>
        <span>Status</span>
        <select name="status" defaultValue={task?.status ?? "brief"}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Tarikh mula</span>
        <input type="date" name="start_date" defaultValue={task?.start_date ?? ""} />
      </label>

      <label>
        <span>Tarikh tamat</span>
        <input type="date" name="end_date" defaultValue={task?.end_date ?? ""} />
      </label>

      <label className="tf-wide">
        <span>Butiran</span>
        <textarea name="detail" rows={compact ? 2 : 3} defaultValue={task?.detail ?? ""} placeholder="Bukti / nota (boleh kosong)" />
      </label>

      <div className="tf-actions tf-wide">
        <button className="go" type="submit" disabled={pending}>
          {pending ? "menyimpan…" : task ? "Simpan perubahan" : "Tambah tugasan"}
        </button>
        {!canWrite && <span className="tf-hint">Anda bukan ahli — hantar akan ditolak.</span>}
        {state && (
          <span className={`tf-msg ${state.ok ? "ok" : "err"}`}>{state.message}</span>
        )}
      </div>
    </form>
  );
}
