import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { cldUrl } from "@/lib/cloudinary";
import { formatRupiah } from "@/lib/utils";
import { setDonationStatus } from "./actions";

type Row = {
  id: string;
  amount: number;
  status: string;
  is_anonymous: boolean;
  donor_name: string | null;
  donor_email: string | null;
  message: string | null;
  proof_url: string | null;
  payment_method: string;
  is_recurring: boolean;
  recurring_interval: string | null;
  created_at: string;
  campaigns: { title: string } | null;
  payment_channels: { bank_name: string | null } | null;
};

const TABS: { key: string; label: string }[] = [
  { key: "pending", label: "Menunggu" },
  { key: "verified", label: "Terverifikasi" },
  { key: "rejected", label: "Ditolak" },
  { key: "all", label: "Semua" },
];

const BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: "Menunggu", cls: "bg-amber-100 text-amber-800" },
  verified: { label: "Terverifikasi", cls: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Ditolak", cls: "bg-red-100 text-red-700" },
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatusButton({ id, status, back, label, cls }: { id: string; status: string; back: string; label: string; cls: string }) {
  return (
    <form action={setDonationStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="back" value={back} />
      <button type="submit" className={`rounded-md px-3 py-2 text-sm ${cls}`}>
        {label}
      </button>
    </form>
  );
}

export default async function DonasiAdminPage({
  searchParams,
}: {
  searchParams: { status?: string; error?: string; ok?: string };
}) {
  const { supabase } = await requireAdmin();

  const status = TABS.some((t) => t.key === searchParams.status) ? (searchParams.status as string) : "pending";

  let q = supabase
    .from("donations")
    .select(
      "id,amount,status,is_anonymous,donor_name,donor_email,message,proof_url,payment_method,is_recurring,recurring_interval,created_at,campaigns(title),payment_channels(bank_name)"
    );
  if (status !== "all") q = q.eq("status", status);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(100);
  const rows = (data ?? []) as unknown as Row[];

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-serif text-2xl text-brand-dark">Donasi Masuk</h1>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/donasi?status=${t.key}`}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm ${
              status === t.key ? "border-brand bg-brand text-white" : "border-neutral-300 text-neutral-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {searchParams.error || error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error ?? error?.message}
        </p>
      ) : null}
      {searchParams.ok ? (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{searchParams.ok}</p>
      ) : null}

      <ul className="mt-5 flex flex-col gap-4">
        {rows.length === 0 ? <li className="text-sm text-neutral-500">Tidak ada donasi di daftar ini.</li> : null}
        {rows.map((r) => {
          const badge = BADGE[r.status] ?? BADGE.pending;
          const proof = r.proof_url ? cldUrl(r.proof_url, 500) : null;
          return (
            <li key={r.id} className="rounded-xl border border-neutral-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-lg font-semibold text-neutral-900">{formatRupiah(Number(r.amount))}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs ${badge.cls}`}>{badge.label}</span>
              </div>
              <p className="mt-1 text-sm text-neutral-700">{r.campaigns?.title ?? "(kampanye dihapus)"}</p>
              <p className="mt-1 text-sm text-neutral-600">
                {r.donor_name || "(tanpa nama)"}
                {r.is_anonymous ? " · anonim di publik" : ""}
                {r.donor_email ? ` · ${r.donor_email}` : ""}
              </p>
              <p className="text-xs text-neutral-500">
                {fmtDate(r.created_at)} · {r.payment_method === "qris" ? "QRIS" : "Transfer"}{" "}
                {r.payment_channels?.bank_name ?? ""}
                {r.is_recurring ? ` · pengingat ${r.recurring_interval === "weekly" ? "mingguan" : "bulanan"}` : ""}
              </p>
              {r.message ? <p className="mt-2 text-sm italic text-neutral-700">&quot;{r.message}&quot;</p> : null}

              {proof && r.proof_url ? (
                <a href={r.proof_url} target="_blank" rel="noopener noreferrer" className="mt-3 block">
                  <img src={proof} alt="Bukti pembayaran" className="max-h-64 rounded-md border border-neutral-200 object-contain" />
                  <span className="mt-1 block text-xs text-brand underline">Buka bukti ukuran penuh</span>
                </a>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {r.status === "pending" ? (
                  <>
                    <StatusButton id={r.id} status="verified" back={status} label="Verifikasi" cls="bg-brand text-white" />
                    <StatusButton id={r.id} status="rejected" back={status} label="Tolak" cls="bg-red-600 text-white" />
                  </>
                ) : (
                  <StatusButton
                    id={r.id}
                    status="pending"
                    back={status}
                    label="Kembalikan ke menunggu"
                    cls="border border-neutral-300 text-neutral-700"
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
