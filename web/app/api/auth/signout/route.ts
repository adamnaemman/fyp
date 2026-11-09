import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";


export async function POST(req: Request) {
  const url = new URL(req.url);
  const supabase = await getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/", url), 303);
}
