"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";

const UUID = z.string().uuid();

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

export async function toggleComment(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  const hide = str(formData, "hide") === "true";
  if (!UUID.safeParse(id).success) return redirect("/admin/komentar");

  const { error } = await supabase.from("comments").update({ is_hidden: hide }).eq("id", id);
  if (error) {
    return redirect(`/admin/komentar?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/komentar");
  revalidatePath("/kampanye");
  return redirect(`/admin/komentar?ok=${encodeURIComponent(hide ? "Komentar disembunyikan" : "Komentar ditampilkan")}`);
}

export async function deleteComment(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  if (!UUID.safeParse(id).success) return redirect("/admin/komentar");

  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) {
    return redirect(`/admin/komentar?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/komentar");
  revalidatePath("/kampanye");
  return redirect(`/admin/komentar?ok=${encodeURIComponent("Komentar dihapus")}`);
}
