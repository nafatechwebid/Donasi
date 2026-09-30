"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function setNewPassword(formData: FormData): Promise<void> {
  const p1 = formData.get("password");
  const p2 = formData.get("confirm");
  const password = typeof p1 === "string" ? p1 : "";
  const confirm = typeof p2 === "string" ? p2 : "";

  const fail = (m: string) => redirect("/reset-sandi?error=" + encodeURIComponent(m));
  if (password.length < 8) fail("Kata sandi minimal 8 karakter.");
  if (password.length > 72) fail("Kata sandi maksimal 72 karakter.");
  if (password !== confirm) fail("Konfirmasi kata sandi tidak sama.");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/lupa-sandi?error=" + encodeURIComponent("Sesi reset berakhir. Minta tautan baru."));

  const { error } = await supabase.auth.updateUser({ password });
  if (error) fail("Gagal menyimpan kata sandi baru. Coba lagi.");

  redirect("/dashboard");
}
