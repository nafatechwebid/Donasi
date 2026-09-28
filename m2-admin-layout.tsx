import Link from "next/link";

const links: { href: string; label: string }[] = [
  { href: "/admin", label: "Dasbor" },
  { href: "/admin/kampanye", label: "Kampanye" },
  { href: "/admin/kategori", label: "Kategori" },
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
        </div>
      </nav>
      {children}
    </div>
  );
}
