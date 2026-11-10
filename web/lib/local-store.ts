import { promises as fs } from "node:fs";
import path from "node:path";
import type { Batch, Task } from "./types";

/**
 * Storan tompokan untuk mod SNAPSHOT (tanpa Supabase).
 *
 * Mod snapshot pada asalnya baca sahaja — JSON dijana oleh tracker/export_snapshot.py.
 * Bila tiada Supabase, tiada sesi dan tiada jadual `members`, jadi tiada tempat untuk
 * menyimpan tugasan/batch baru. Dua fail JSON kecil ini ialah tempat itu: ditulis oleh
 * Server Action, dibaca semula oleh getTracker() dan digabung di atas snapshot.
 *
 * Bila Supabase ADA, fail ini tidak dibaca langsung — pangkalan data itu sumber
 * kebenaran. Jadi data setempat tak boleh mencemarkan deployment sebenar.
 *
 * Baris `deleted: true` ialah batu nisan: tugasan/batch dari fail projek tidak boleh
 * dibuang dari snapshot.json, jadi padam dicatat di sini dan disaring semasa membaca.
 */
const TASK_FILE = path.join(process.cwd(), "data", "local_tasks.json");
const BATCH_FILE = path.join(process.cwd(), "data", "local_batches.json");

export type LocalRow = Partial<Task> & { id: string; deleted?: boolean };
export type LocalBatch = Partial<Batch> & { id: string; deleted?: boolean };

async function readJson(file: string): Promise<unknown[]> {
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Tiada fail (kali pertama) atau JSON rosak: mod snapshot tetap berfungsi.
    return [];
  }
}

async function writeJson(file: string, rows: unknown[]): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(rows, null, 1)}\n`, "utf8");
}

/** Baris yang sah mesti objek dengan `id` teks. */
function withId<T extends { id: string }>(rows: unknown[]): T[] {
  return rows.filter(
    (r): r is T =>
      typeof r === "object" && r !== null && typeof (r as { id?: unknown }).id === "string",
  );
}

export async function readLocalTasks(): Promise<LocalRow[]> {
  return withId<LocalRow>(await readJson(TASK_FILE));
}

export async function upsertLocalTask(task: Task): Promise<void> {
  const rows = await readLocalTasks();
  const i = rows.findIndex((t) => t.id === task.id);
  if (i >= 0) {
    const prev = rows[i];
    rows[i] = {
      ...prev,
      ...task,
      // medan yang datang dari jadual `batches`, bukan dari borang: jangan kosongkan
      batch_date: task.batch_date ?? prev.batch_date ?? null,
      batch_note: task.batch_note || prev.batch_note || "",
      deleted: false,
    };
  } else {
    rows.push({ ...task, deleted: false });
  }
  await writeJson(TASK_FILE, rows);
}

/** id tugas baru dari web. Bentuk 'u-' membezakannya daripada id fail ('1-A', '3-C'). */
export function newTaskId(): string {
  return `u-${Date.now().toString(36)}`;
}

/** Padam satu tugasan: batu nisan, supaya tugasan dari snapshot tidak muncul balik. */
export async function removeLocalTask(id: string): Promise<void> {
  const rows = (await readLocalTasks()).filter((r) => r.id !== id);
  rows.push({ id, deleted: true });
  await writeJson(TASK_FILE, rows);
}

// ------------------------------------------------------------------ batch

export async function readLocalBatches(): Promise<LocalBatch[]> {
  return withId<LocalBatch>(await readJson(BATCH_FILE));
}

export async function upsertLocalBatch(batch: Batch): Promise<void> {
  const rows = (await readLocalBatches()).filter((b) => b.id !== batch.id);
  rows.push({ ...batch, deleted: false });
  await writeJson(BATCH_FILE, rows);
}

/** Padam batch: batu nisan + lepaskan tugasan setempat yang menunjuk kepadanya. */
export async function removeLocalBatch(id: string): Promise<void> {
  const batches = (await readLocalBatches()).filter((b) => b.id !== id);
  batches.push({ id, deleted: true });
  await writeJson(BATCH_FILE, batches);

  const tasks = await readLocalTasks();
  if (tasks.some((t) => t.batch_id === id)) {
    await writeJson(
      TASK_FILE,
      tasks.map((t) => (t.batch_id === id ? { ...t, batch_id: null } : t)),
    );
  }
}

export function newBatchId(): string {
  return `b-${Date.now().toString(36)}`;
}
