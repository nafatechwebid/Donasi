import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Pemeriksaan admin berlapis: middleware + fungsi ini + RLS di database.
export async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  return { supabase, user };
}
