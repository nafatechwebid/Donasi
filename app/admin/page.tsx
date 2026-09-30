import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";
import AdminCharts from "@/components/AdminCharts";

type Camp = { title: string } | null;
type VerRow = { amount: number; created_at: string; campaigns: unknown };
type RecentRow = {
  id: string;
  amount: number;
  donor_name: string | null;
  is_anonymous: boolean;
  status: string;
  created_at: string;
  campaigns: unknown;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu",
  verified: "Terverifikasi",
  rejected: "Ditolak",
};

const monthKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }).slice(0, 7);

export default async function AdminPage() {
  // Akses ke /admin sudah difilter role di middleware.ts.
  const supabase = createClient();

  const [pc, pd, ver, exp, recent] = await Promise.all([
    supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("donations").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("donations").select("amount,created_at,campaigns(title)").eq("status", "verified").limit(5000),
    supabase.from("expenditures").select("amount").limit(5000),
    supabase
      .from("donations")
      .select("id,amount,donor_name,is_anonymous,status,created_at,campaigns(title)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const verRows = (ver.data ?? []) as unknown as VerRow[];
  const totalCollected = verRows.reduce((s, r) => s + Number(r.amount), 0);
  const totalSpent = ((exp.data ?? []) as { amount: number }[]).reduce((s, r) => s + Number(r.amount), 0);
  const balance = totalCollected - totalSpent;

  // 12 bulan terakhir
  const now = new Date();
  const keys: string[] = [];
  for (let i = 11; i >= 0; i--) {
    keys.push(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 15)));
  }
  const byMonth = new Map<string, number>(keys.map((k) => [k, 0]));
  const byCampaign = new Map<string, number>();
  for (const r of verRows) {
    const k = monthKey(new Date(r.created_at));
    if (byMonth.has(k)) byMonth.set(k, (byMonth.get(k) ?? 0) + Number(r.amount));
    const title = (r.campaigns as Camp)?.title ?? "Tanpa kampanye";
    byCampaign.set(title, (byCampaign.get(title) ?? 0) + Number(r.amount));
  }
  const monthly = keys.map((k) => ({
    label: new Date(`${k}-15`).toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
    total: byMonth.get(k) ?? 0,
  }));
  const perCampaign = Array.from(byCampaign.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, total]) => ({ name: name.length > 18 ? name.slice(0, 17) + "…" : name, total }));

  const recentRows = (recent.data ?? []) as unknown as RecentRow[];

  const card = "rounded-lg border border-neutral-200 p-4";

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-serif text-2xl text-brand-dark">Dasbor Admin</h1>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className={card}>
          <p className="text-xs text-neutral-500">Total terkumpul</p>
          <p className="mt-1 text-lg font-semibold text-brand-dark">{formatRupiah(totalCollected)}</p>
        </div>
        <div className={card}>
          <p className="text-xs text-neutral-500">Donasi terverifikasi</p>
          <p className="mt-1 text-lg font-semibold">{verRows.length}</p>
        </div>
        <div className={card}>
          <p className="text-xs text-neutral-500">Sudah disalurkan</p>
          <p className="mt-1 text-lg font-semibold">{formatRupiah(totalSpent)}</p>
        </div>
        <div className={card}>
          <p className="text-xs text-neutral-500">Dana cadangan (belum disalurkan)</p>
          <p className="mt-1 text-lg font-semibold">{formatRupiah(balance)}</p>
        </div>
        <Link href="/admin/donasi?status=pending" className={card}>
          <p className="text-xs text-neutral-500">Donasi menunggu verifikasi</p>
          <p className="mt-1 text-lg font-semibold">{pd.count ?? 0}</p>
        </Link>
        <div className={card}>
          <p className="text-xs text-neutral-500">Kampanye menunggu approval</p>
          <p className="mt-1 text-lg font-semibold">{pc.count ?? 0}</p>
        </div>
      </div>

      <AdminCharts monthly={monthly} perCampaign={perCampaign} />

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-brand-dark">Donasi terbaru</h2>
          <Link href="/admin/donasi?status=all" className="text-sm text-brand underline">
            Lihat semua
          </Link>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {recentRows.length === 0 ? <li className="text-sm text-neutral-500">Belum ada donasi.</li> : null}
          {recentRows.map((d) => (
            <li key={d.id} className="rounded-lg border border-neutral-200 p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-neutral-900">{formatRupiah(Number(d.amount))}</span>
                <span className="text-xs text-neutral-500">{STATUS_LABEL[d.status] ?? d.status}</span>
              </div>
              <p className="text-neutral-700">
                {d.donor_name || "(tanpa nama)"}
                {d.is_anonymous ? " · anonim" : ""}
              </p>
              <p className="text-xs text-neutral-500">
                {(d.campaigns as Camp)?.title ?? "-"} ·{" "}
                {new Date(d.created_at).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium" })}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
