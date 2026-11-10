import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";

/** Log masuk kata laluan — jalan tanpa emel, jadi had SMTP Supabase tidak menghalang. */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const supabase = await getSupabase();
  if (!supabase) {
    return NextResponse.redirect(
      new URL("/login?err=Supabase%20belum%20disambung%20(env%20var%20tiada)", url),
      303,
    );
  }

  const fd = await req.formData();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");

  if (!email || !password) {
    return NextResponse.redirect(
      new URL("/login?err=Emel%20dan%20kata%20laluan%20wajib%20diisi", url),
      303,
    );
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?err=${encodeURIComponent(error.message)}`, url),
      303,
    );
  }
  return NextResponse.redirect(new URL("/", url), 303);
}
