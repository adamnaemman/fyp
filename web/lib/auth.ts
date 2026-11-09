import { getSupabase } from "./supabase/server";
import type { Viewer } from "./types";

/**
 * Siapa yang sedang melihat. null = tetamu (tiada sesi) atau Supabase belum disambung.
 * Peranan datang dari jadual `members`; RLS di Supabase tetap jadi penghalang terakhir
 * walaupun UI ini salah.
 */
export async function getViewer(): Promise<Viewer | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;

  let email: string | undefined;
  let row: { role: string | null; display_name: string | null } | null = null;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? undefined;
    if (!email) return null;

    const { data } = await supabase
      .from("members")
      .select("role, display_name")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    row = data;
  } catch {
    // Supabase tak dapat dihubungi: layan sebagai tetamu, halaman tetap terbuka.
    return null;
  }

  const role = (row?.role ?? "viewer") as Viewer["role"];
  return {
    email,
    name: row?.display_name ?? email,
    role,
    canWrite: role === "admin" || role === "member",
  };
}
