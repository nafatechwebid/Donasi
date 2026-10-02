import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/signout-action";

// narrow = true: lebar header mengikuti halaman sempit (mis. detail kampanye, max-w-3xl).
// Tailwind butuh nama kelas utuh, jadi jangan disusun dari potongan string.
export default async function SiteHeader({ narrow = false }: { narrow?: boolean }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const width = narrow ? "max-w-3xl" : "max-w-5xl";

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white">
      <div className={`mx-auto flex ${width} items-center justify-between px-4 py-3`}>
        <Link href="/" className="font-serif text-lg text-brand-dark">
          Donasi
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
