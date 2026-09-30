import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");
  const supabase = createClient();

  if (tokenHash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}/reset-sandi`);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/reset-sandi`);
  }

  const msg = "Tautan tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.";
  return NextResponse.redirect(`${origin}/lupa-sandi?error=${encodeURIComponent(msg)}`);
}
