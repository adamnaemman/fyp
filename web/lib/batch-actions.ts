"use server";

import { revalidatePath } from "next/cache";
import { getSupabase, supabaseConfigured } from "./supabase/server";
import { getViewer } from "./auth";
import { newBatchId, removeLocalBatch, upsertLocalBatch } from "./local-store";
import type { ActionResult, Batch } from "./types";

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};

/** Hanya terima 'YYYY-MM-DD' yang sah. Kosong → null (BUKAN hari ini). */
const dateOrNull = (v: string): string | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) return null;
  return v;
};

function refresh() {
  revalidatePath("/");
  revalidatePath("/tugasan");
  revalidatePath("/gantt");
  revalidatePath("/calendar");
}

/**
 * Satu jalan tulis untuk tambah DAN kemas kini batch.
 *
 * Guard sama seperti saveTask: bila Supabase disambung, sesi mesti ada dan peranan
 * mesti admin/member (RLS jadi penghalang kedua). Bila Supabase tiada, batch ditulis
 * ke data/local_batches.json — mod snapshot satu mesin, bukan deployment berkongsi.
 * Semua penolakan dipulangkan sebagai mesej, tidak pernah gagal senyap.
 */
export async function saveBatch(
  _prev: ActionResult | null,
  fd: FormData,
): Promise<ActionResult> {
  const id = str(fd, "id");
  const label = str(fd, "label");
  const note = str(fd, "note");
  const date = dateOrNull(str(fd, "date"));
  const noRaw = Number.parseInt(str(fd, "no") || "0", 10);
  const no = Number.isFinite(noRaw) && noRaw > 0 ? noRaw : 0;

  if (no === 0) return { ok: false, message: "Nombor batch mesti 1 atau lebih (contoh: 4)." };
  if (!id && !label) return { ok: false, message: "Beri label batch (contoh: 'Audit bukti')." };

  const batch: Batch = { id: id || newBatchId(), no, label, date, note };

  if (supabaseConfigured) {
    const supabase = await getSupabase();
    if (!supabase) return { ok: false, message: "Supabase tidak dapat dihubungi — tiada perubahan disimpan." };

    const viewer = await getViewer();
    if (!viewer) {
      return { ok: false, message: "Baca sahaja: tiada sesi. Log masuk sebagai ahli untuk menyimpan batch." };
    }
    if (!viewer.canWrite) {
      return { ok: false, message: `Baca sahaja: akaun ${viewer.role} tiada kebenaran menulis batch.` };
    }

    const row = {
      no,
      label,
      date,
      note: note || null,
      updated_at: new Date().toISOString(),
    };
    const res = id
      ? await supabase.from("batches").update(row).eq("id", id).select("id").maybeSingle()
      : await supabase.from("batches").insert({ id: batch.id, ...row }).select("id").maybeSingle();

    if (res.error) {
      const hint = /batches|relation|schema cache/i.test(res.error.message)
        ? " — jalankan migrasi web/supabase/migrations/2026-11-10_batches.sql dalam SQL Editor."
        : "";
      return { ok: false, message: `Gagal simpan batch: ${res.error.message}${hint}` };
    }
    refresh();
    return { ok: true, message: id ? "Batch dikemas kini." : `Batch ${no} disimpan.` };
  }

  try {
    await upsertLocalBatch(batch);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ralat tidak diketahui";
    return { ok: false, message: `Gagal tulis fail setempat: ${msg}` };
  }
  refresh();
  return {
    ok: true,
    message: `${id ? "Batch dikemas kini" : `Batch ${no} disimpan`} (setempat).`,
  };
}

/** Padam satu batch. Tugasan di dalamnya tidak dipadam — pautannya dilepaskan. */
export async function deleteBatch(
  _prev: ActionResult | null,
  fd: FormData,
): Promise<ActionResult> {
  const id = str(fd, "id");
  if (!id) return { ok: false, message: "ID batch tiada." };

  if (supabaseConfigured) {
    const supabase = await getSupabase();
    if (!supabase) return { ok: false, message: "Supabase tidak dapat dihubungi — tiada perubahan." };

    const viewer = await getViewer();
    if (!viewer) return { ok: false, message: "Baca sahaja: tiada sesi. Log masuk sebagai ahli." };
    if (!viewer.canWrite) {
      return { ok: false, message: `Baca sahaja: akaun ${viewer.role} tiada kebenaran memadam batch.` };
    }

    // foreign key `tasks.batch_id ... on delete set null` melepaskan tugasan,
    // jadi tiada tugasan hilang bersama batch.
    const { error } = await supabase.from("batches").delete().eq("id", id);
    if (error) return { ok: false, message: `Gagal padam batch: ${error.message}` };
    refresh();
    return { ok: true, message: "Batch dipadam. Tugasannya jadi tanpa batch." };
  }

  try {
    await removeLocalBatch(id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ralat tidak diketahui";
    return { ok: false, message: `Gagal padam fail setempat: ${msg}` };
  }
  refresh();
  return { ok: true, message: "Batch dipadam (setempat). Tugasannya jadi tanpa batch." };
}
