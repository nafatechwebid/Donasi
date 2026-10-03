import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type SiteSettings = {
  site_name: string;
  hero_title: string;
  hero_subtitle: string;
  logo_url: string | null;
  favicon_url: string | null;
};

// Dipakai bila tabel kosong / belum dibuat, supaya situs tidak error.
export const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "Donasi",
  hero_title: "Bersama Meringankan Beban",
  hero_subtitle:
    "Salurkan donasimu untuk program kemanusiaan, pendidikan, dan kesehatan. Setiap penyaluran dilaporkan secara terbuka.",
  logo_url: null,
  favicon_url: null,
};

// cache() = satu kali query per request, walau dipanggil dari header, beranda, dan metadata.
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("site_name,hero_title,hero_subtitle,logo_url,favicon_url")
    .eq("id", 1)
    .maybeSingle();

  const row = (data ?? {}) as Partial<SiteSettings>;
  return {
    site_name: row.site_name?.trim() || DEFAULT_SETTINGS.site_name,
    hero_title: row.hero_title?.trim() || DEFAULT_SETTINGS.hero_title,
    hero_subtitle: row.hero_subtitle?.trim() || DEFAULT_SETTINGS.hero_subtitle,
    logo_url: row.logo_url || null,
    favicon_url: row.favicon_url || null,
  };
});
