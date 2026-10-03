import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/signout-action";
import { getSiteSettings } from "@/lib/site-settings";
import { cldUrl } from "@/lib/cloudinary";

// narrow = true: lebar header mengikuti halaman sempit (mis. detail kampanye, max-w-3xl).
// Tailwind butuh nama kelas utuh, jadi jangan disusun dari potongan string.
export default async function SiteHeader({ narrow = false }: { narrow?: boolean }) {
  const supabase = createClient();
  const [
    {
      data: { user },
    },
    settings,
  ] = await Promise.all([supabase.auth.getUser(), getSiteSettings()]);

  const width = narrow ? "max-w-3xl" : "max-w-5xl";
  const logo = settings.logo_url ? cldUrl(settings.logo_url, 200) ?? settings.logo_url : null;

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white">
      <div className={`mx-auto flex ${width} items-center justify-between px-4 py-3`}>
        <Link href="/" className="flex items-center gap-2 font-serif text-lg text-brand-dark">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="h-8 w-auto" />
          ) : null}
          <span>{settings.site_name}</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <Link href="/dashboard" className="rounded-md px-3 py-2 text-neutral-700 hover:bg-brand-light">
                Dasbor
              </Link>
              <form action={signOut}>
                <button type="submit" className="rounded-md px-3 py-2 text-neutral-700 hover:bg-brand-light">
                  Keluar
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-neutral-700 hover:bg-brand-light">
                Masuk
              </Link>
              <Link href="/register" className="rounded-md bg-brand px-3 py-2 text-white hover:bg-brand-dark">
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
