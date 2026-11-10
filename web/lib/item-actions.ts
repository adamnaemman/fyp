"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase/server";
import { getViewer } from "@/lib/auth";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Viewer } from "@/lib/types";

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};

type Ctx = { supabase: SupabaseClient; viewer: Viewer };

async function guard(): Promise<Ctx | { error: string }> {
  const supabase = await getSupabase();
  if (!supabase) return { error: "Supabase belum disambung — mod baca sahaja." };
  const viewer = await getViewer();
  if (!viewer) return { error: "Sesi tamat. Log masuk semula." };
  if (!viewer.canWrite) return { error: `Akaun ${viewer.role} tiada kebenaran menulis.` };
  return { supabase, viewer };
}

const done = (msg: string) => {
  revalidatePath("/barang");
  redirect(`/barang?ok=${encodeURIComponent(msg)}`);
};
const fail = (msg: string) => redirect(`/barang?err=${encodeURIComponent(msg)}`);

/** Tambah atau kemas kini satu barang. */
export async function saveItem(fd: FormData) {
  const g = await guard();
  if ("error" in g) return fail(g.error);

  const id = str(fd, "id") || `i-${Date.now().toString(36)}`;
  const name = str(fd, "name");
  if (!name) return fail("Nama barang wajib diisi.");

  const qtyRaw = Number.parseInt(str(fd, "qty") || "1", 10);
  const qty = Number.isFinite(qtyRaw) && qtyRaw > 0 ? qtyRaw : 1;

  const { error } = await g.supabase.from("items").upsert(
    {
      id,
      name,
      category: str(fd, "category") || null,
      tag_epc: str(fd, "tag_epc") || null,
      qty,
      note: str(fd, "note") || null,
      baggage: str(fd, "baggage") || "utama",
      ord: Number.parseInt(str(fd, "ord") || "0", 10) || 0,
      updated_at: new Date().toISOString(),
      updated_by: g.viewer.email,
    },
    { onConflict: "id" },
  );

  if (error) {
    const hint = /does not exist|schema cache/i.test(error.message)
      ? " — jalankan migrasi web/supabase/migrations/2026-11-10_items.sql."
      : "";
    return fail(`${error.message}${hint}`);
  }
  return done(str(fd, "id") ? "Barang dikemas kini." : "Barang ditambah.");
}

/** Padam satu barang. */
export async function deleteItem(fd: FormData) {
  const g = await guard();
  if ("error" in g) return fail(g.error);

  const id = str(fd, "id");
  if (!id) return fail("ID barang tiada.");

  const { error } = await g.supabase.from("items").delete().eq("id", id);
  if (error) return fail(error.message);
  return done("Barang dipadam.");
}
