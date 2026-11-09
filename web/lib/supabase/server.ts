import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Env nama tanpa NEXT_PUBLIC_: semua akses Supabase dalam projek ini berlaku di pelayan,
// jadi nilai dibaca pada MASA JALAN, bukan dibekukan semasa build. Ini yang membolehkan
// env ditukar di Vercel tanpa deploy semula. (NEXT_PUBLIC_* masih diterima sebagai sandaran.)
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** true bila dua env var Supabase ada. Tanpa itu app jalan dalam mod snapshot (baca sahaja). */
export const supabaseConfigured = Boolean(url && anon);

/**
 * Klien Supabase untuk Server Component / Server Action / Route Handler.
 * Guna kunci anon + cookie sesi — RLS yang menentukan siapa boleh tulis.
 * Kunci service_role TIDAK pernah masuk di sini: ia melangkau RLS.
 */
export async function getSupabase() {
  // cookies() dipanggil tanpa syarat: ia yang menjadikan halaman ini dinamik
  // (Next 16 cacheComponents tidak benarkan `export const dynamic` lagi).
  const cookieStore = await cookies();
  if (!supabaseConfigured) return null;
  return createServerClient(url!, anon!, {
    // had 4s: kalau Supabase mati, halaman mesti jatuh ke snapshot dengan cepat,
    // bukan menggantung sampai Vercel function timeout.
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(4000) }),
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(items) {
        try {
          items.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // dipanggil dari Server Component (bukan action) — selamat diabaikan,
          // middleware/route handler yang akan menulis cookie.
        }
      },
    },
  });
}
