import snapshot from "@/data/snapshot.json";
import { getSupabase } from "./supabase/server";
import { readLocalTasks } from "./local-store";
import { fmtRange, klStamp, todayIso } from "./date";
import type {
  BlockedItem, Evidence, FocusItem, Milestone, Plan, Spec, Task, Tracker, Week, WeekState,
} from "./types";

type SnapWeek = Omit<Week, "state" | "focus" | "evidence"> & {
  focus: Omit<FocusItem, "week_id">[];
  evidence: Omit<Evidence, "week_id"> | null;
};

type SnapFile = {
  generated: string;
  who?: string[];
  weeks: SnapWeek[];
  tasks: Task[];
  milestones: (Omit<Milestone, "id"> & { id?: string })[];
  blocked: (Omit<BlockedItem, "id" | "resolved"> & { id?: string; resolved?: boolean })[];
  specs: Spec[];
  plans: Plan[];
};

const SNAP = snapshot as unknown as SnapFile;

export function weekState(start: string | null, end: string | null, today = todayIso()): WeekState {
  if (!start || !end) return "akan";
  if (today < start) return "akan";
  if (today > end) return "lepas";
  return "kini";
}

export function daysBetween(from: string, to: string): number {
  const a = Date.UTC(+from.slice(0, 4), +from.slice(5, 7) - 1, +from.slice(8, 10));
  const b = Date.UTC(+to.slice(0, 4), +to.slice(5, 7) - 1, +to.slice(8, 10));
  return Math.round((b - a) / 86_400_000);
}

/** Tarikh tugas sentiasa ada sebagai `null` bila belum dijadualkan — jangan reka nilai. */
function normTask(t: Task): Task {
  return { ...t, start_date: t.start_date ?? null, end_date: t.end_date ?? null };
}

function fromSnapshotTasks(local: Task[]): Task[] {
  const base = SNAP.tasks.map(normTask);
  if (local.length === 0) return base;
  const out = base.map((t) => {
    const patch = local.find((l) => l.id === t.id);
    return patch ? normTask({ ...t, ...patch }) : t;
  });
  for (const l of local) if (!out.some((t) => t.id === l.id)) out.push(normTask(l));
  return out;
}

async function fromSnapshot(): Promise<Tracker> {
  return {
    mode: "snapshot",
    note: null,
    generated: SNAP.generated,
    who: SNAP.who ?? [],
    weeks: SNAP.weeks.map((w, i) => ({
      ...w,
      state: weekState(w.start, w.end),
      focus: w.focus.map((f, j) => ({
        ...f,
        id: f.id ?? `${w.id}-f${j}`,
        week_id: w.id,
      })),
      evidence: w.evidence ? { ...w.evidence, week_id: w.id } : null,
    })),
    tasks: fromSnapshotTasks(await readLocalTasks()),
    milestones: SNAP.milestones.map((m, i) => ({ ...m, id: m.id ?? `ms-${i}`, ord: m.ord ?? i })),
    blocked: SNAP.blocked.map((b, i) => ({
      ...b, id: b.id ?? `blk-${i}`, resolved: Boolean(b.resolved),
    })),
    specs: SNAP.specs,
    plans: SNAP.plans,
  };
}

/**
 * Baca dari Supabase bila env var ada; kalau tidak (atau query gagal),
 * jatuh balik ke snapshot JSON yang dijana dari fail projek.
 * Kegagalan rangkaian TIDAK boleh memaparkan halaman kosong — ia mesti degradasi.
 */
export async function getTracker(): Promise<Tracker> {
  const fallback = await fromSnapshot();
  const supabase = await getSupabase();
  if (!supabase) return fallback;

  try {
    const [weeksQ, focusQ, evQ, tasksQ, msQ, blkQ, specQ, planQ] = await Promise.all([
      supabase.from("weeks").select("*").order("sort", { ascending: true }),
      supabase.from("focus_items").select("*").order("ord", { ascending: true }),
      supabase.from("evidence").select("*"),
      supabase.from("tasks").select("*").order("batch_no", { ascending: true }),
      supabase.from("milestones").select("*").order("ord", { ascending: true }),
      supabase.from("blocked").select("*").order("ord", { ascending: true }),
      supabase.from("specs").select("*").order("ord", { ascending: true }),
      supabase.from("plans").select("*").order("ord", { ascending: true }),
    ]);

    const firstError = [weeksQ, focusQ, evQ, tasksQ, msQ, blkQ, specQ, planQ]
      .map((q) => q.error).find(Boolean);
    if (firstError) {
      return { ...fallback, note: `Supabase: ${firstError.message} — papar snapshot fail projek.` };
    }
    if (!weeksQ.data?.length) {
      return { ...fallback, note: "Supabase kosong — jalankan tracker/export_snapshot.py --push dulu. Papar snapshot." };
    }

    const focusByWeek = new Map<string, FocusItem[]>();
    for (const f of focusQ.data ?? []) {
      const arr = focusByWeek.get(f.week_id) ?? [];
      arr.push({
        id: f.id, week_id: f.week_id, ord: f.ord, text: f.text, done: Boolean(f.done),
      });
      focusByWeek.set(f.week_id, arr);
    }
    const evByWeek = new Map<string, Evidence>(
      (evQ.data ?? []).map((e) => [e.week_id, {
        week_id: e.week_id, docs: e.docs ?? 0, code: e.code ?? 0,
        report: e.report ?? 0, synced_at: e.synced_at ?? null,
      }]),
    );

    const weeks: Week[] = (weeksQ.data ?? []).map((w) => ({
      id: w.id, num: w.num, suffix: w.suffix ?? "", label: w.label,
      start: w.start_date, end: w.end_date,
      state: weekState(w.start_date, w.end_date),
      seminar: w.seminar ?? "", gate: w.gate ?? "",
      gate_status: w.gate_status ?? "belum", gate_note: w.gate_note ?? null,
      focus: (focusByWeek.get(w.id) ?? []).sort((a, b) => a.ord - b.ord),
      evidence: evByWeek.get(w.id) ?? null,
    }));

    return {
      mode: "supabase",
      note: null,
      generated: klStamp(),
      who: SNAP.who ?? [],
      weeks,
      tasks: ((tasksQ.data ?? []) as Task[]).map(normTask),
      milestones: (msQ.data ?? []) as Milestone[],
      blocked: (blkQ.data ?? []) as BlockedItem[],
      specs: (specQ.data ?? []) as Spec[],
      plans: (planQ.data ?? []) as Plan[],
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ralat tidak diketahui";
    return { ...fallback, note: `Gagal hubungi Supabase (${msg}) — papar snapshot fail projek.` };
  }
}

export type Stats = {
  weeksTotal: number; weeksPast: number; activeLabel: string;
  elapsed: number; span: string;
  focusDone: number; focusTotal: number;
  tasksDone: number; tasksTotal: number; tasksBrief: number; tasksBlocked: number;
  docs: number; code: number; report: number;
  blocked: number; nextLabel: string; nextDate: string | null; nextDays: number | null;
};

export function computeStats(t: Tracker): Stats {
  const today = todayIso();
  const dated = t.weeks.filter((w) => w.start && w.end);
  const starts = dated.map((w) => w.start!).sort();
  const ends = dated.map((w) => w.end!).sort();
  const spanStart = starts[0] ?? today;
  const spanEnd = ends[ends.length - 1] ?? today;
  const totalDays = Math.max(daysBetween(spanStart, spanEnd) + 1, 1);
  const elapsedDays = daysBetween(spanStart, today);
  const elapsed = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 1000) / 10));

  const focusAll = t.weeks.flatMap((w) => w.focus);
  const active = t.weeks.find((w) => w.state === "kini");
  const next = [...t.milestones].sort((a, b) => a.date.localeCompare(b.date))
    .find((m) => m.date >= today);

  return {
    weeksTotal: t.weeks.length,
    weeksPast: t.weeks.filter((w) => w.state === "lepas").length,
    activeLabel: active?.label ?? (t.weeks.every((w) => w.state === "lepas") ? "semua minggu lepas" : "—"),
    elapsed,
    span: fmtRange(spanStart, spanEnd),
    focusDone: focusAll.filter((f) => f.done).length,
    focusTotal: focusAll.length,
    tasksDone: t.tasks.filter((x) => x.status === "siap").length,
    tasksTotal: t.tasks.length,
    tasksBrief: t.tasks.filter((x) => x.status === "brief").length,
    tasksBlocked: t.tasks.filter((x) => x.status === "sekat").length,
    docs: t.weeks.reduce((n, w) => n + (w.evidence?.docs ?? 0), 0),
    code: t.weeks.reduce((n, w) => n + (w.evidence?.code ?? 0), 0),
    report: t.weeks.reduce((n, w) => n + (w.evidence?.report ?? 0), 0),
    blocked: t.blocked.filter((b) => !b.resolved).length,
    nextLabel: next?.label ?? "—",
    nextDate: next?.date ?? null,
    nextDays: next ? daysBetween(today, next.date) : null,
  };
}
