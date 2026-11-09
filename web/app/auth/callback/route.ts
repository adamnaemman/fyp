import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";


export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const supabase = await getSupabase();

  if (!supabase) {
    return NextResponse.redirect(new URL("/login?err=Supabase%20belum%20disambung", url), 303);
  }
  if (!code) {
    return NextResponse.redirect(new URL("/login?err=Pautan%20tidak%20sah", url), 303);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?err=${encodeURIComponent(error.message)}`, url),
      303,
    );
  }
  return NextResponse.redirect(new URL("/", url), 303);
}
