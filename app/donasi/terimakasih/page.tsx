import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default function TerimaKasihPage({ searchParams }: { searchParams: { k?: string } }) {
  const slug = searchParams.k ?? "";
  const validSlug = /^[a-z0-9-]+$/.test(slug) ? slug : "";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-6 py-14 text-center">
        <p className="text-5xl">🤲</p>
        <h1 className="mt-4 font-serif text-2xl text-brand-dark">Terima kasih atas donasi Anda</h1>
        <p className="mt-3 text-neutral-700">
          Donasi Anda sudah kami terima dan sedang menunggu verifikasi admin. Setelah terverifikasi, donasi akan
          tampil di progres kampanye.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          {validSlug ? (
            <Link
              href={`/kampanye/${validSlug}`}
              className="rounded-md bg-brand px-4 py-3 text-white hover:bg-brand-dark"
            >
              Kembali ke kampanye
            </Link>
          ) : null}
          <Link href="/" className="rounded-md border border-brand px-4 py-3 text-brand hover:bg-brand-light">
            Lihat kampanye lainnya
          </Link>
        </div>
      </main>
    </>
  );
}
