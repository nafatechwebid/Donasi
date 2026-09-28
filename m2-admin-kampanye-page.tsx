import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatRupiah, progressPercent } from "@/lib/utils";

type Row = {
  id: string;
  title: string;
  status: string;
  target_amount: number;
  collected_amount: number;
  cover_image_url: string | null;
  program_categories: { name: string } | null;
};

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Draf", cls: "bg-amber-100 text-amber-800" },
  active: { label: "Aktif", cls: "bg-emerald-100 text-emerald-800" },
  closed: { label: "Ditutup", cls: "bg-neutral-200 text-neutral-700" },
  rejected: { label: "Ditolak", cls: "bg-red-100 text-red-700" },
};

export default async function KampanyePage({
  searchParams,
}: {
  searchParams: { error?: string; ok?: string };
}) {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("campaigns")
    .select("id,title,status,target_amount,collected_amount,cover_image_url,program_categories(name)")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as unknown as Row[];

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-2xl text-brand-dark">Kampanye</h1>
        <Link
          href="/admin/kampanye/baru"
          className="rounded-md bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dark"
        >
          + Kampanye baru
        </Link>
      </div>

      {searchParams.error || error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error ?? error?.message}
        </p>
      ) : null}
      {searchParams.ok ? (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {searchParams.ok}
        </p>
      ) : null}

      <ul className="mt-6 flex flex-col gap-3">
        {rows.length === 0 ? (
          <li className="text-sm text-neutral-500">
            Belum ada kampanye. Buat kategori dulu, lalu tekan &quot;Kampanye baru&quot;.
          </li>
        ) : null}
        {rows.map((r) => {
          const st = STATUS[r.status] ?? STATUS.pending;
          const pct = progressPercent(Number(r.collected_amount), Number(r.target_amount));
          return (
            <li key={r.id}>
              <Link
                href={`/admin/kampanye/${r.id}`}
                className="flex gap-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50"
              >
                {r.cover_image_url ? (
                  <img
                    src={r.cover_image_url}
                    alt=""
                    className="h-16 w-16 flex-none rounded-md object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 flex-none rounded-md bg-brand-light" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-medium text-neutral-900">{r.title}</p>
                    <span className={`flex-none rounded-full px-2 py-0.5 text-xs ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {r.program_categories?.name ?? "Tanpa kategori"}
                  </p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                    <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-neutral-600">
                    {formatRupiah(Number(r.collected_amount))} dari {formatRupiah(Number(r.target_amount))} ({pct}%)
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
