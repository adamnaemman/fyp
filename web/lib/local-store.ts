import { promises as fs } from "node:fs";
import path from "node:path";
import type { Task } from "./types";

/**
 * Storan tompokan untuk mod SNAPSHOT (tanpa Supabase).
 *
 * Mod snapshot pada asalnya baca sahaja — JSON dijana oleh tracker/export_snapshot.py.
 * Bila tiada Supabase, tiada sesi dan tiada jadual `members`, jadi tiada tempat untuk
 * menyimpan tugasan baru. Fail ini ialah tempat itu: satu JSON kecil yang ditulis oleh
 * Server Action, dibaca semula oleh getTracker() dan digabung di atas snapshot.
 *
 * Bila Supabase ADA, fail ini tidak dibaca langsung — pangkalan data itu sumber
 * kebenaran. Jadi data setempat tak boleh mencemarkan deployment sebenar.
 */
const FILE = path.join(process.cwd(), "data", "local_tasks.json");

export async function readLocalTasks(): Promise<Task[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is Task => Boolean(t) && typeof t === "object" && "id" in t);
  } catch {
    // Tiada fail (kali pertama) atau JSON rosak: mod snapshot tetap berfungsi.
    return [];
  }
}

export async function upsertLocalTask(task: Task): Promise<void> {
  const tasks = await readLocalTasks();
  const i = tasks.findIndex((t) => t.id === task.id);
  if (i >= 0) tasks[i] = { ...tasks[i], ...task };
  else tasks.push(task);
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, `${JSON.stringify(tasks, null, 1)}\n`, "utf8");
}

/** id tugas baru dari web. Bentuk 'u-' membezakannya daripada id fail ('1-A', '3-C'). */
export function newTaskId(): string {
  return `u-${Date.now().toString(36)}`;
}
