"use server";

import { revalidatePath } from "next/cache";
import { getSupabase, supabaseConfigured } from "./supabase/server";
import { getViewer } from "./auth";
import { newTaskId, upsertLocalTask } from "./local-store";
import type { ActionResult, Task, TaskStatus } from "./types";

const STATUSES: TaskStatus[] = ["brief", "jalan", "semak", "siap", "sekat"];

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
  revalidatePath("/gantt");
  revalidatePath("/calendar");
}

/**
 * Satu jalan tulis untuk tambah DAN kemas kini tugasan.
 *
 * Urutan pertahanan:
 *   1. Supabase disambung  → sesi mesti ada, peranan mesti admin/member (RLS jadi
 *      penghalang kedua walaupun semakan ini terlepas).
 *   2. Supabase tiada       → mod snapshot setempat, tulis ke data/local_tasks.json
 *      (satu pengguna, satu mesin; ini bukan deployment berkongsi).
 *
 * Semua penolakan dipulangkan sebagai mesej yang dipaparkan — tidak pernah gagal senyap.
 */
export async function saveTask(
  _prev: ActionResult | null,
  fd: FormData,
): Promise<ActionResult> {
  const id = str(fd, "id");
  const task = str(fd, "task");
  const status = (str(fd, "status") || "brief") as TaskStatus;
  const start = dateOrNull(str(fd, "start_date"));
  const end = dateOrNull(str(fd, "end_date"));
  const role = str(fd, "role");
  const detail = str(fd, "detail");

  if (!id && !task) return { ok: false, message: "Tajuk tugasan wajib diisi." };
  if (!STATUSES.includes(status)) return { ok: false, message: "Status tidak sah." };
  if (start && end && start > end) {
    return { ok: false, message: `Tarikh mula (${start}) selepas tarikh tamat (${end}).` };
  }

  if (supabaseConfigured) {
    const supabase = await getSupabase();
    if (!supabase) return { ok: false, message: "Supabase tidak dapat dihubungi — tiada perubahan disimpan." };

    const viewer = await getViewer();
    if (!viewer) return { ok: false, message: "Baca sahaja: tiada sesi. Log masuk sebagai ahli untuk menyimpan." };
    if (!viewer.canWrite) {
      return { ok: false, message: `Baca sahaja: akaun ${viewer.role} tiada kebenaran menulis.` };
    }

    const row = {
      task: task || null,
      role: role || null,
      status,
      detail: detail || null,
      start_date: start,
      end_date: end,
      updated_at: new Date().toISOString(),
      updated_by: viewer.email,
    };

    const res = id
      ? await supabase.from("tasks").update(row).eq("id", id).select("id").maybeSingle()
      : await supabase
          .from("tasks")
          .insert({ id: newTaskId(), batch_no: 0, batch_note: "ditambah dari web", ...row })
          .select("id")
          .maybeSingle();

    if (res.error) {
      const hint = /start_date|end_date|column/i.test(res.error.message)
        ? " — jalankan migration web/supabase/migrations/2026-11-10_task_dates.sql dalam SQL Editor."
        : "";
      return { ok: false, message: `Gagal simpan: ${res.error.message}${hint}` };
    }
    refresh();
    return { ok: true, message: id ? "Tugasan dikemas kini." : "Tugasan baru disimpan." };
  }

  // mod snapshot: tiada auth, tiada members — tulis setempat
  const stored: Task = {
    id: id || newTaskId(),
    batch_no: 0,
    batch_date: null,
    batch_note: "ditambah dari web (mod snapshot)",
    role,
    task,
    status,
    detail,
    start_date: start,
    end_date: end,
  };
  try {
    await upsertLocalTask(stored);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ralat tidak diketahui";
    return { ok: false, message: `Gagal tulis fail setempat: ${msg}` };
  }
  refresh();
  return { ok: true, message: `${id ? "Tugasan dikemas kini" : "Tugasan baru disimpan"} (setempat).` };
}
