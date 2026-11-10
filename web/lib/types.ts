export type GateStatus = "belum" | "lulus" | "gagal";
export type TaskStatus = "brief" | "jalan" | "semak" | "siap" | "sekat";
export type WeekState = "lepas" | "kini" | "akan";

export type FocusItem = {
  id: string;
  week_id: string;
  ord: number;
  text: string;
  done: boolean;
};

export type Evidence = {
  week_id: string;
  docs: number;
  code: number;
  report: number;
  synced_at: string | null;
};

export type Week = {
  id: string;
  num: number;
  suffix: string;
  label: string;
  start: string | null;
  end: string | null;
  state: WeekState;
  seminar: string;
  gate: string;
  gate_status: GateStatus;
  gate_note: string | null;
  focus: FocusItem[];
  evidence: Evidence | null;
};

export type Task = {
  id: string;
  batch_no: number;
  batch_date: string | null;
  batch_note: string;
  role: string;
  task: string;
  status: TaskStatus;
  detail: string;
  /** untuk Gantt + Kalendar; null/tiada = belum dijadualkan (jangan reka tarikh) */
  start_date?: string | null;
  due_date?: string | null;
  end_date?: string | null;
};

export type ActionResult = { ok: boolean; message: string };

export type Milestone = {
  id: string;
  label: string;
  date: string;
  ord: number;
};

export type BlockedItem = {
  id: string;
  what: string;
  why: string;
  resolved: boolean;
};

export type Spec = { key: string; value: string; ord: number };
export type Plan = { name: string; text: string; ord: number };

export type Tracker = {
  mode: "supabase" | "snapshot";
  note: string | null;
  generated: string;
  who: string[];
  weeks: Week[];
  tasks: Task[];
  milestones: Milestone[];
  blocked: BlockedItem[];
  specs: Spec[];
  plans: Plan[];
};

export type Viewer = {
  email: string;
  name: string;
  role: "admin" | "member" | "viewer";
  canWrite: boolean;
};
