import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";

type Row = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  campaigns: { title: string; slug: string } | null;
};

const BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: "Menunggu verifikasi", cls: "bg-amber-100 text-amber-800" },
  verified: { label: "Terverifikasi", cls: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Ditolak", cls: "bg-red-100 text-red-700" },
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data } = await supabase
    .from("donations")
    .select("id,amount,status,created_at,campaigns(title,slug)")
    .eq("donor_id", user.id)
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as unknown as Row[];

  const totalVerified = rows
    .filter((r) => r.status === "verified")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-serif text-2xl text-brand-dark">
          Halo, {(profile?.full_name as string | null) ?? user.email}
        </h1>

        <div className="mt-4 rounded-xl border border-neutral-200 p-4">
          <p className="text-sm text-neutral-500">Total donasi terverifikasi</p>
          <p className="mt-1 text-2xl font-semibold text-brand-dark">{formatRupiah(totalVerified)}</p>
        </div>

        <h2 className="mt-8 font-medium text-neutral-900">Riwayat donasi</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {rows.length === 0 ? (
            <li className="text-sm text-neutral-500">
              Belum ada donasi.{" "}
              <Link href="/" className="text-brand underline">
                Lihat kampanye aktif
              </Link>
              .
            </li>
          ) : null}
          {rows.map((r) => {
            const badge = BADGE[r.status] ?? BADGE.pending;
            return (
              <li key={r.id} className="rounded-lg border border-neutral-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {r.campaigns?.title ?? "(kampanye dihapus)"}
                    </p>
                    <p className="text-xs text-neutral-500">{fmtDate(r.created_at)}</p>
                  </div>
                  <span className={`flex-none rounded-full px-2 py-0.5 text-xs ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-900">
                    {formatRupiah(Number(r.amount))}
                  </p>
                  {r.status === "verified" ? (
                    <Link href={`/dashboard/donasi/${r.id}`} className="text-xs text-brand underline">
                      Lihat kuitansi
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
