"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requestReset(formData: FormData): Promise<void> {
  const raw = formData.get("email");
  const email = typeof raw === "string" ? raw.trim() : "";
  if (!email || email.length > 120 || !email.includes("@")) {
    redirect("/lupa-sandi?error=" + encodeURIComponent("Masukkan alamat email yang valid."));
  }

  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";

  const supabase = createClient();
  // Hasil sengaja diabaikan agar orang tidak bisa menebak email mana yang terdaftar.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${proto}://${host}/auth/reset`,
  });
  redirect("/lupa-sandi?ok=1");
}
