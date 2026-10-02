"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Hanya terima alamat internal (diawali "/" tapi bukan "//") agar tidak jadi open redirect.
function safePath(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export async function login(formData: FormData) {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const target = safePath(formData.get("redirect"));

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    const msg = error?.message ?? "Gagal masuk. Silakan coba lagi.";
    const back = target ? `&redirect=${encodeURIComponent(target)}` : "";
    redirect(`/login?error=${encodeURIComponent(msg)}${back}`);
  }

  // Cek role untuk menentukan tujuan setelah login
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  const isAdmin = profile?.role === "admin";

  revalidatePath("/", "layout");

  if (isAdmin) {
    redirect(target ?? "/admin");
  }
  // Donatur biasa tidak boleh diarahkan ke /admin
  redirect(target && !target.startsWith("/admin") ? target : "/dashboard");
}
