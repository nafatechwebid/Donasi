"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const UUID = z.string().uuid();

const schema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(60, "Nama maksimal 60 karakter"),
  icon: z.string().trim().max(8, "Ikon maksimal 8 karakter"),
  description: z.string().trim().max(200, "Deskripsi maksimal 200 karakter"),
});

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

export async function addCategory(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const parsed = schema.safeParse({
    name: str(formData, "name"),
    icon: str(formData, "icon"),
    description: str(formData, "description"),
  });
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Data tidak valid";
    return redirect(`/admin/kategori?error=${encodeURIComponent(msg)}`);
  }

  const v = parsed.data;
  const slug = slugify(v.name);
  if (!slug) {
    return redirect(`/admin/kategori?error=${encodeURIComponent("Nama tidak valid")}`);
  }

  const { error } = await supabase.from("program_categories").insert({
    name: v.name,
    slug,
    icon: v.icon || null,
    description: v.description || null,
  });
  if (error) {
    const msg = error.code === "23505" ? "Kategori dengan nama serupa sudah ada" : error.message;
    return redirect(`/admin/kategori?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/admin/kategori");
  redirect(`/admin/kategori?ok=${encodeURIComponent("Kategori ditambahkan")}`);
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const id = str(formData, "id");
  if (!UUID.safeParse(id).success) {
    return redirect("/admin/kategori");
  }

  const { error } = await supabase.from("program_categories").delete().eq("id", id);
  if (error) {
    return redirect(`/admin/kategori?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/kategori");
  redirect(`/admin/kategori?ok=${encodeURIComponent("Kategori dihapus")}`);
}
