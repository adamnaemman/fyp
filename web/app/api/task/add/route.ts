import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { getViewer } from "@/lib/auth";

/** Tambah tugasan baharu dari halaman Gantt. */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const back = (msg: string, ok = false) =>
    NextResponse.redirect(
      new URL(ok ? "/gantt?ok=1" : `/gantt?err=${encodeURIComponent(msg)}`, url),
      303,
    );

  const supabase = await getSupabase();
  if (!supabase) return back("Supabase belum disambung — mod baca sahaja.");
  const viewer = await getViewer();
  if (!viewer) return back("Sesi tamat. Log masuk semula.");
  if (!viewer.canWrite) return back(`Akaun ${viewer.role} tiada kebenaran menulis.`);

  const fd = await req.formData();
  const task = String(fd.get("task") ?? "").trim();
  const role = String(fd.get("role") ?? "").trim() || viewer.name;
  const start = String(fd.get("start_date") ?? "").trim() || null;
  const due = String(fd.get("due_date") ?? "").trim() || null;

  if (!task) return back("Tajuk tugasan kosong.");
  if (start && due && due < start) return back("Tarikh akhir sebelum tarikh mula.");

  const id = `t-${Date.now().toString(36)}`;
  const { error } = await supabase.from("tasks").insert({
    id,
    batch_no: 0,
    batch_note: "ditambah dari web",
    role,
    task,
    status: "brief",
    detail: `dicipta ${viewer.email}`,
    start_date: start,
    due_date: due,
  });

  return error ? back(error.message) : back("ditambah", true);
}
