import type { Batch, Task } from "./types";

/**
 * Peraturan batch, di satu tempat supaya /tugasan, /gantt, / dan laman Progres
 * tidak mengira kumpulan secara berbeza.
 *
 * Tugasan dari fail projek (TASKBOARD) tiada `batch_id` — ia hanya ada `batch_no`.
 * Jadi kumpulan dicari ikut id dahulu, kemudian ikut nombor. Itu yang membolehkan
 * data lama kekal dalam batch yang betul tanpa ditulis semula.
 */

export function batchLabel(b: Batch): string {
  return b.label ? `Batch ${b.no} · ${b.label}` : `Batch ${b.no}`;
}

/** Nombor batch seterusnya = tertinggi + 1. Tiada nombor direka selain daripada itu. */
export function nextBatchNo(batches: Batch[]): number {
  return batches.reduce((m, b) => Math.max(m, b.no), 0) + 1;
}

export function batchOf(task: Task, batches: Batch[]): Batch | null {
  if (task.batch_id) {
    const byId = batches.find((b) => b.id === task.batch_id);
    if (byId) return byId;
  }
  if (task.batch_no > 0) return batches.find((b) => b.no === task.batch_no) ?? null;
  return null;
}

export type BatchGroup = {
  /** null = tugasan tanpa batch, atau batch yang sudah tiada dalam senarai */
  batch: Batch | null;
  /** label untuk kumpulan yang tiada dalam jadual `batches` */
  fallback: string;
  tasks: Task[];
};

/** Susun tugasan ikut batch; kumpulan tanpa batch diletak paling akhir. */
export function groupByBatch(tasks: Task[], batches: Batch[]): BatchGroup[] {
  const groups: BatchGroup[] = batches.map((b) => ({ batch: b, fallback: "", tasks: [] }));
  const leftovers = new Map<string, BatchGroup>();

  for (const t of tasks) {
    const b = batchOf(t, batches);
    if (b) {
      groups.find((g) => g.batch?.id === b.id)!.tasks.push(t);
      continue;
    }
    const key = t.batch_no > 0 ? `no-${t.batch_no}` : "none";
    const g = leftovers.get(key) ?? {
      batch: null,
      fallback: t.batch_no > 0 ? `Batch ${t.batch_no} · tiada dalam senarai` : "Tanpa batch",
      tasks: [],
    };
    g.tasks.push(t);
    leftovers.set(key, g);
  }

  return [...groups, ...leftovers.values()];
}

/** Nombor batch untuk dipaparkan apabila dipilih dalam borang. */
export function noOf(batches: Batch[], id: string): number {
  return batches.find((b) => b.id === id)?.no ?? 0;
}
