import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/server";
import { getViewer } from "@/lib/auth";
import type { Viewer } from "@/lib/types";

type Ctx = { supabase: SupabaseClient; viewer: Viewer };

/** Guard dikongsi semua tulisan: sesi + peranan + Supabase dikonfigurasi. */
async function writable(): Promise<Ctx | { error: string }> {
  const supabase = await getSupabase();
  if (!supabase) return { error: "Supabase belum disambung — mod baca sahaja." };
  const viewer = await getViewer();
  if (!viewer) return { error: "Sesi tamat. Log masuk semula." };
  if (!viewer.canWrite) return { error: `Akaun ${viewer.role} tiada kebenaran menulis.` };
  return { supabase, viewer };
}

export function back(req: Request, msg: string, ok = false) {
  const url = new URL(ok ? "/?ok=1" : `/?err=${encodeURIComponent(msg)}`, req.url);
  return NextResponse.redirect(url, 303);
}

export async function handle(route: string, req: Request) {
  const g = await writable();
  if ("error" in g) return back(req, g.error);
  const fd = await req.formData();
  const id = String(fd.get("id") ?? "");
  if (!id) return back(req, "ID tiada dalam borang.");

  const stamp = new Date().toISOString();
  const who = g.viewer.email;

  if (route === "focus") {
    const done = String(fd.get("done")) === "1";
    const { error } = await g.supabase
      .from("focus_items")
      .update({ done: !done, done_at: !done ? stamp : null, done_by: !done ? who : null })
      .eq("id", id);
    return error ? back(req, error.message) : back(req, "ditanda", true);
  }

  if (route === "task") {
    const allowed = ["brief", "jalan", "semak", "siap", "sekat"];
    const status = String(fd.get("status") ?? "");
    if (!allowed.includes(status)) return back(req, "Status tugasan tidak sah.");
    const { error } = await g.supabase
      .from("tasks")
      .update({ status, updated_at: stamp, updated_by: who })
      .eq("id", id);
    return error ? back(req, error.message) : back(req, "status dikemas kini", true);
  }

  if (route === "gate") {
    const allowed = ["belum", "lulus", "gagal"];
    const status = String(fd.get("status") ?? "");
    if (!allowed.includes(status)) return back(req, "Status gate tidak sah.");
    const { error } = await g.supabase
      .from("weeks")
      .update({ gate_status: status, gate_note: `disahkan ${who} · ${stamp.slice(0, 10)}` })
      .eq("id", id);
    return error ? back(req, error.message) : back(req, "gate dikemas kini", true);
  }

  if (route === "blocked") {
    const { error } = await g.supabase
      .from("blocked")
      .update({ resolved: true, resolved_at: stamp, resolved_by: who })
      .eq("id", id);
    return error ? back(req, error.message) : back(req, "sekat ditutup", true);
  }

  return back(req, `Laluan tidak dikenali: ${route}`);
}
