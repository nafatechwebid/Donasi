"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";

const UUID = z.string().uuid();

const schema = z.object({
  campaign_id: UUID,
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(150, "Judul maksimal 150 karakter"),
  content: z.string().trim().min(5, "Isi kabar minimal 5 karakter").max(5000, "Isi kabar maksimal 5000 karakter"),
  image_url: z
    .string()
    .url("Alamat gambar tidak valid")
    .startsWith("https://res.cloudinary.com/", "Gambar harus diunggah lewat Cloudinary")
    .nullable(),
});

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

export async function addUpdate(formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdmin();
  const campaignId = str(formData, "campaign_id");
  const back = `/admin/kampanye/${campaignId}`;

  const parsed = schema.safeParse({
    campaign_id: campaignId,
    title: str(formData, "title"),
    content: str(formData, "content"),
    image_url: str(formData, "image_url") || null,
  });
  if (!parsed.success) {
    return redirect(`${back}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Data tidak valid")}`);
  }
  const v = parsed.data;

  const { error } = await supabase.from("campaign_updates").insert({
    campaign_id: v.campaign_id,
    title: v.title,
    content: v.content,
    image_url: v.image_url,
    created_by: user.id,
  });
  if (error) {
    return redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/kampanye`);
  revalidatePath(back);
  return redirect(`${back}?ok=${encodeURIComponent("Kabar terbaru ditambahkan")}`);
}

export async function deleteUpdate(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  const campaignId = str(formData, "campaign_id");
  const back = `/admin/kampanye/${campaignId}`;
  if (!UUID.safeParse(id).success) return redirect(back);

  const { error } = await supabase.from("campaign_updates").delete().eq("id", id);
  if (error) return redirect(`${back}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(back);
  return redirect(`${back}?ok=${encodeURIComponent("Kabar dihapus")}`);
}
