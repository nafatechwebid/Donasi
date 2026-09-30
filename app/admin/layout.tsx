import Link from "next/link";
import { signOut } from "@/lib/signout-action";

const links: { href: string; label: string }[] = [
  { href: "/admin", label: "Dasbor" },
  { href: "/admin/kampanye", label: "Kampanye" },
  { href: "/admin/donasi", label: "Donasi" },
  { href: "/admin/pembayaran", label: "Pembayaran" },
  { href: "/admin/kategori", label: "Kategori" },
  { href: "/admin/komentar", label: "Komentar" },
  { href: "/", label: "Beranda" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="sticky top-0 z-10 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-4xl gap-2 overflow-x-auto px-4 py-2 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-neutral-700 hover:bg-brand-light hover:text-brand-dark"
            >
              {l.label}
            </Link>
          ))}
          <form action={signOut}>
            <button
              type="submit"
              className="whitespace-nowrap rounded-md px-3 py-2 text-red-700 hover:bg-red-50"
            >
              Keluar
            </button>
          </form>
        </div>
      </nav>
      {children}
    </div>
  );
}
