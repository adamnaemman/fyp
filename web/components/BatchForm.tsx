"use client";

import { useActionState } from "react";
import { saveBatch } from "@/lib/batch-actions";
import type { ActionResult, Batch } from "@/lib/types";

/**
 * Borang tambah DAN kemas kini batch. Satu jalan tulis, sama seperti TaskForm.
 * Tarikh dibiarkan kosong melainkan Adam menaipnya — app tidak mengisi tarikh hari ini.
 */
export default function BatchForm({
  batch,
  canWrite,
  nextNo,
  compact,
}: {
  batch?: Batch;
  canWrite: boolean;
  nextNo: number;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveBatch, null);

  return (
    <form className={`tform ${compact ? "compact" : ""}`} action={action}>
      {batch && <input type="hidden" name="id" value={batch.id} />}

      <label>
        <span>No batch</span>
        <input name="no" type="number" min="1" step="1" required defaultValue={batch?.no ?? nextNo} />
      </label>

      <label>
        <span>Label</span>
        <input
          name="label"
          required={!batch}
          defaultValue={batch?.label ?? ""}
          placeholder="contoh: audit bukti"
        />
      </label>

      <label>
        <span>Tarikh</span>
        <input type="date" name="date" defaultValue={batch?.date ?? ""} />
      </label>

      <label>
        <span>Nota</span>
        <input name="note" defaultValue={batch?.note ?? ""} placeholder="boleh kosong" />
      </label>

      <div className="tf-actions tf-wide">
        <button className="go" type="submit" disabled={pending}>
          {pending ? "menyimpan…" : batch ? "Simpan batch" : "Tambah batch"}
        </button>
        {!canWrite && <span className="tf-hint">Anda bukan ahli — hantar akan ditolak.</span>}
        {state && <span className={`tf-msg ${state.ok ? "ok" : "err"}`}>{state.message}</span>}
      </div>
    </form>
  );
}
