"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/server";
import { getViewer } from "@/lib/auth";
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

/** Tambah / kemas kini satu baris BOM. */
export async function saveBom(fd: FormData) {
  const g = await guard();
  if ("error" in g) return fail(g.error);

  const id = str(fd, "id") || `bom-${Date.now().toString(36)}`;
  const name = str(fd, "name");
  if (!name) return fail("Nama komponen wajib diisi.");

  const qtyRaw = Number.parseInt(str(fd, "qty") || "1", 10);
  const qty = Number.isFinite(qtyRaw) && qtyRaw > 0 ? qtyRaw : 1;
  const priceRaw = Number.parseFloat(str(fd, "unit_price").replace(",", "."));
  const unit_price = Number.isFinite(priceRaw) && priceRaw >= 0 ? priceRaw : null;

  const allowed = ["belum", "order", "sampai", "batal"];
  const status = allowed.includes(str(fd, "status")) ? str(fd, "status") : "belum";

  const { error } = await g.supabase.from("bom").upsert(
    {
      id,
      name,
      spec: str(fd, "spec") || null,
      qty,
      unit_price,
      seller: str(fd, "seller") || null,
      url: str(fd, "url") || null,
      status,
      note: str(fd, "note") || null,
      ord: Number.parseInt(str(fd, "ord") || "0", 10) || 0,
      updated_at: new Date().toISOString(),
      updated_by: g.viewer.email,
    },
    { onConflict: "id" },
  );

  if (error) {
    const hint = /does not exist|schema cache/i.test(error.message)
      ? " — jalankan migrasi web/supabase/migrations/2026-11-10_bom.sql."
      : "";
    return fail(`${error.message}${hint}`);
  }
  return done(str(fd, "id") ? "Komponen dikemas kini." : "Komponen ditambah.");
}

/** Tukar status laju: belum → order → sampai. */
export async function setBomStatus(fd: FormData) {
  const g = await guard();
  if ("error" in g) return fail(g.error);

  const id = str(fd, "id");
  const status = str(fd, "status");
  if (!id || !["belum", "order", "sampai", "batal"].includes(status)) {
    return fail("Status tidak sah.");
  }

  const { error } = await g.supabase
    .from("bom")
    .update({ status, updated_at: new Date().toISOString(), updated_by: g.viewer.email })
    .eq("id", id);
  if (error) return fail(error.message);
  return done(`Status: ${status}.`);
}

export async function deleteBom(fd: FormData) {
  const g = await guard();
  if ("error" in g) return fail(g.error);

  const id = str(fd, "id");
  if (!id) return fail("ID tiada.");

  const { error } = await g.supabase.from("bom").delete().eq("id", id);
  if (error) return fail(error.message);
  return done("Komponen dipadam.");
}
