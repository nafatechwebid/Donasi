import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";

type Row = {
  id: string;
  slug: string;
  title: string;
  status: string;
  collected_amount: number;
  spent: number;
};

export const metadata = { title: "Laporan Keuangan" };

export default async function LaporanKeuanganPage() {
  const supabase = createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id,slug,title,status,collected_amount")
    .in("status", ["active", "closed"])
    .order("created_at", { ascending: false });

  const { data: exp } = await supabase.from("expenditures").select("campaign_id,amount");

  const spentMap = new Map<string, number>();
  (exp ?? []).forEach((e) => {
    const key = e.campaign_id as string;
    spentMap.set(key, (spentMap.get(key) ?? 0) + Number(e.amount));
  });

  const rows: Row[] = (campaigns ?? []).map((c) => ({
    id: c.id as string,
    slug: c.slug as string,
    title: c.title as string,
    status: c.status as string,
    collected_amount: Number(c.collected_amount),
    spent: spentMap.get(c.id as string) ?? 0,
  }));

  const totalCollected = rows.reduce((s, r) => s + r.collected_amount, 0);
  const totalSpent = rows.reduce((s, r) => s + r.spent, 0);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-serif text-2xl text-brand-dark">Laporan Keuangan</h1>
          <a
            href="/api/laporan-keuangan/csv"
            className="rounded-md border border-brand px-3 py-2 text-sm text-brand hover:bg-brand-light"
          >
            Unduh CSV
          </a>
        </div>
        <p className="mt-1 text-sm text-neutral-600">
          Ringkasan dana masuk (donasi terverifikasi) dan dana keluar (pengeluaran tercatat) per kampanye.
          Laporan ini terbuka untuk siapa saja.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-neutral-200 p-4">
            <p className="text-sm text-neutral-500">Total dana masuk</p>
            <p className="mt-1 text-xl font-semibold text-brand-dark">{formatRupiah(totalCollected)}</p>
          </div>
          <div className="rounded-lg border border-neutral-200 p-4">
            <p className="text-sm text-neutral-500">Total dana keluar</p>
            <p className="mt-1 text-xl font-semibold text-neutral-900">{formatRupiah(totalSpent)}</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500">
                <th className="py-2 pr-3">Kampanye</th>
                <th className="py-2 pr-3 text-right">Dana masuk</th>
                <th className="py-2 pr-3 text-right">Dana keluar</th>
                <th className="py-2 text-right">Sisa</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-neutral-100">
                  <td className="py-2 pr-3">
                    <Link href={`/kampanye/${r.slug}`} className="text-brand hover:underline">
                      {r.title}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 text-right">{formatRupiah(r.collected_amount)}</td>
                  <td className="py-2 pr-3 text-right">{formatRupiah(r.spent)}</td>
                  <td className="py-2 text-right font-medium">
                    {formatRupiah(r.collected_amount - r.spent)}
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-neutral-500">
                    Belum ada data.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
