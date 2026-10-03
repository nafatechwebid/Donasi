import { requireAdmin } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import SubmitButton from "@/components/SubmitButton";
import { saveSettings } from "./actions";

const inputCls =
  "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand";

export default async function PengaturanPage({
  searchParams,
}: {
  searchParams: { error?: string; ok?: string };
}) {
  await requireAdmin();
  const s = await getSiteSettings();

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="font-serif text-2xl text-brand-dark">Pengaturan Situs</h1>
      <p className="mt-1 text-sm text-neutral-500">Ubah nama, logo, ikon tab browser, dan teks utama beranda.</p>

      {searchParams.error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{searchParams.error}</p>
      ) : null}
      {searchParams.ok ? (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{searchParams.ok}</p>
      ) : null}

      <form action={saveSettings} className="mt-6 flex flex-col gap-5">
        <label className="block">
          <span className="text-sm font-medium text-neutral-800">Nama situs</span>
          <input name="site_name" required maxLength={60} defaultValue={s.site_name} className={inputCls} />
          <span className="text-xs text-neutral-500">Tampil di header dan judul tab browser.</span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-800">Judul beranda</span>
          <input name="hero_title" required maxLength={120} defaultValue={s.hero_title} className={inputCls} />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-800">Deskripsi beranda</span>
          <textarea
            name="hero_subtitle"
            required
            rows={4}
            maxLength={400}
            defaultValue={s.hero_subtitle}
            className={inputCls}
          />
        </label>

        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="text-sm font-medium text-neutral-800">Logo</p>
          {s.logo_url ? (
            <div className="mt-2 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.logo_url} alt="Logo saat ini" className="h-12 w-auto rounded border border-neutral-200 bg-white p-1" />
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input type="checkbox" name="remove_logo" /> Hapus logo
              </label>
            </div>
          ) : (
            <p className="mt-1 text-xs text-neutral-500">Belum ada logo. Nama situs akan tampil sebagai teks.</p>
          )}
          <div className="mt-3">
            <CloudinaryUpload name="logo_url" label="Unggah logo baru (PNG transparan, rasio bebas)" />
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="text-sm font-medium text-neutral-800">Favicon (ikon di tab browser)</p>
          {s.favicon_url ? (
            <div className="mt-2 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.favicon_url} alt="Favicon saat ini" className="h-10 w-10 rounded border border-neutral-200 bg-white p-1" />
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input type="checkbox" name="remove_favicon" /> Hapus favicon
              </label>
            </div>
          ) : (
            <p className="mt-1 text-xs text-neutral-500">Belum diatur. Memakai ikon bawaan.</p>
          )}
          <div className="mt-3">
            <CloudinaryUpload name="favicon_url" label="Unggah favicon baru (PNG persegi, minimal 192×192)" />
          </div>
        </div>

        <SubmitButton className="rounded-md bg-brand px-4 py-3 text-white hover:bg-brand-dark disabled:opacity-60">
          Simpan pengaturan
        </SubmitButton>
      </form>
    </main>
  );
}
