"use client";

import { useActionState } from "react";
import { saveTask } from "@/lib/task-actions";
import type { ActionResult, Task, TaskStatus } from "@/lib/types";

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
 */
export default function TaskForm({
  task,
  canWrite,
  onSaved,
  compact,
}: {
  task?: Task;
  canWrite: boolean;
  onSaved?: () => void;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    async (prev, fd) => {
      const res = await saveTask(prev, fd);
      if (res.ok) onSaved?.();
      return res;
    },
    null,
  );

  return (
    <form className={`tform ${compact ? "compact" : ""}`} action={action}>
      {task && <input type="hidden" name="id" value={task.id} />}

      <label className="tf-wide">
        <span>Tugasan</span>
        <input name="task" required defaultValue={task?.task ?? ""} placeholder="Contoh: ujian bacaan 5 tag dalam cavity" />
      </label>

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
