import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";


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
  if (!email) {
    return NextResponse.redirect(new URL("/login?err=Emel%20kosong", url), 303);
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${url.origin}/auth/callback` },
  });

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?err=${encodeURIComponent(error.message)}`, url),
      303,
    );
  }
  return NextResponse.redirect(new URL("/login?sent=1", url), 303);
}
