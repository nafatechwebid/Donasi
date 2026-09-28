"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { fromWibInput, randomSuffix, slugify } from "@/lib/utils";

const UUID = z.string().uuid();

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Judul minimal 5 karakter")
    .max(150, "Judul maksimal 150 karakter"),
  category_id: UUID.nullable(),
  short_description: z.string().trim().max(300, "Deskripsi singkat maksimal 300 karakter"),
  story: z.string().trim().max(20000, "Kisah terlalu panjang"),
  cover_image_url: z
    .string()
    .url("Alamat gambar tidak valid")
    .startsWith("https://res.cloudinary.com/", "Foto sampul harus diunggah lewat Cloudinary")
    .nullable(),
  target_amount: z
    .number()
    .int("Target harus berupa angka bulat")
    .min(10000, "Target minimal Rp10.000")
    .max(100000000000, "Target terlalu besar"),
  status: z.enum(["pending", "active", "closed", "rejected"]),
});

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

export async function saveCampaign(formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdmin();

  const idRaw = str(formData, "id");
  const isEdit = idRaw !== "";
  if (isEdit && !UUID.safeParse(idRaw).success) {
    return redirect("/admin/kampanye");
  }

  const back = isEdit ? `/admin/kampanye/${idRaw}` : "/admin/kampanye/baru";
  const fail = (msg: string) => redirect(`${back}?error=${encodeURIComponent(msg)}`);

  const parsed = schema.safeParse({
    title: str(formData, "title"),
    category_id: str(formData, "category_id") || null,
    short_description: str(formData, "short_description"),
    story: str(formData, "story"),
    cover_image_url: str(formData, "cover_image_url") || null,
    target_amount: Number(str(formData, "target_amount").replace(/\D/g, "")),
    status: str(formData, "status"),
  });
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Data tidak valid");
  }
  const v = parsed.data;

  const deadlineInput = str(formData, "deadline");
  const deadline = fromWibInput(deadlineInput);
  if (deadlineInput && !deadline) {
    return fail("Format batas waktu tidak valid");
  }
  const deadlineActive = formData.get("is_deadline_active") === "on";
  if (deadlineActive && !deadline) {
    return fail("Isi batas waktu jika countdown diaktifkan");
  }

  const payload = {
    category_id: v.category_id,
    title: v.title,
    short_description: v.short_description || null,
    story: v.story || null,
    cover_image_url: v.cover_image_url,
    target_amount: v.target_amount,
    deadline,
    is_deadline_active: deadlineActive,
    status: v.status,
    updated_at: new Date().toISOString(),
    ...(v.status === "active" ? { approved_by: user.id } : {}),
  };

  if (isEdit) {
    const { error } = await supabase.from("campaigns").update(payload).eq("id", idRaw);
    if (error) {
      return fail(`Gagal menyimpan: ${error.message}`);
    }
  } else {
    const baseSlug = slugify(v.title) || "kampanye";
    let slug = baseSlug;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error } = await supabase
        .from("campaigns")
        .insert({ ...payload, slug, created_by: user.id });
      if (!error) break;
      if (error.code === "23505" && attempt < 2) {
        slug = `${baseSlug}-${randomSuffix()}`;
        continue;
      }
      return fail(`Gagal menyimpan: ${error.message}`);
    }
  }

  revalidatePath("/admin/kampanye");
  revalidatePath("/");
  redirect(`/admin/kampanye?ok=${encodeURIComponent(isEdit ? "Kampanye diperbarui" : "Kampanye dibuat")}`);
}

export async function deleteCampaign(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const id = str(formData, "id");
  if (!UUID.safeParse(id).success) {
    return redirect("/admin/kampanye");
  }

  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) {
    const msg =
      error.code === "23503"
        ? "Kampanye sudah punya donasi sehingga tidak bisa dihapus. Ubah statusnya menjadi Ditutup."
        : error.message;
    return redirect(`/admin/kampanye/${id}?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/admin/kampanye");
  revalidatePath("/");
  redirect(`/admin/kampanye?ok=${encodeURIComponent("Kampanye dihapus")}`);
}
