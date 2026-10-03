"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

const text = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);
// Hanya terima alamat gambar https (hasil upload Cloudinary)
const httpsUrl = (v: string) => (/^https:\/\/\S+$/i.test(v) ? v : "");

function back(kind: "error" | "ok", msg: string): never {
  redirect(`/admin/pengaturan?${kind}=${encodeURIComponent(msg)}`);
}

export async function saveSettings(formData: FormData) {
  const { supabase } = await requireAdmin();

  const site_name = text(formData.get("site_name"), 60);
  const hero_title = text(formData.get("hero_title"), 120);
  const hero_subtitle = text(formData.get("hero_subtitle"), 400);
  if (!site_name || !hero_title || !hero_subtitle) back("error", "Nama situs, judul, dan deskripsi tidak boleh kosong.");

  // Gambar: bila tidak ada upload baru, pertahankan yang lama
  const { data: current } = await supabase
    .from("site_settings")
    .select("logo_url,favicon_url")
    .eq("id", 1)
    .maybeSingle();

  let logo_url: string | null = httpsUrl(text(formData.get("logo_url"), 600)) || current?.logo_url || null;
  let favicon_url: string | null = httpsUrl(text(formData.get("favicon_url"), 600)) || current?.favicon_url || null;
  if (formData.get("remove_logo")) logo_url = null;
  if (formData.get("remove_favicon")) favicon_url = null;

  const { data, error } = await supabase
    .from("site_settings")
    .update({ site_name, hero_title, hero_subtitle, logo_url, favicon_url, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select("id");

  if (error) back("error", error.message);
  if (!data || data.length === 0) back("error", "Gagal menyimpan. Pastikan SQL pengaturan sudah dijalankan dan akunmu admin.");

  revalidatePath("/", "layout");
  back("ok", "Pengaturan situs disimpan.");
}
