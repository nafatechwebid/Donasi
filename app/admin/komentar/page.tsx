import { requireAdmin } from "@/lib/auth";
import { deleteComment, toggleComment } from "./actions";

type Row = {
  id: string;
  display_name: string;
  message: string;
  is_hidden: boolean;
  created_at: string;
  campaigns: { title: string } | null;
};

const TABS: { key: string; label: string }[] = [
  { key: "visible", label: "Tampil" },
  { key: "hidden", label: "Disembunyikan" },
  { key: "all", label: "Semua" },
];

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" });
}

export default async function KomentarAdminPage({
  searchParams,
}: {
  searchParams: { tab?: string; error?: string; ok?: string };
}) {
  const { supabase } = await requireAdmin();
  const tab = TABS.some((t) => t.key === searchParams.tab) ? (searchParams.tab as string) : "visible";

  let q = supabase.from("comments").select("id,display_name,message,is_hidden,created_at,campaigns(title)");
  if (tab === "visible") q = q.eq("is_hidden", false);
  if (tab === "hidden") q = q.eq("is_hidden", true);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(100);
  const rows = (data ?? []) as unknown as Row[];

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="font-serif text-2xl text-brand-dark">Moderasi Doa &amp; Komentar</h1>

      <div className="mt-4 flex gap-2">
        {TABS.map((t) => (
          <a
            key={t.key}
            href={`/admin/komentar?tab=${t.key}`}
            className={`rounded-full border px-4 py-2 text-sm ${
              tab === t.key ? "border-brand bg-brand text-white" : "border-neutral-300 text-neutral-700"
            }`}
          >
            {t.label}
          </a>
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

      <ul className="mt-5 flex flex-col gap-3">
        {rows.length === 0 ? <li className="text-sm text-neutral-500">Tidak ada komentar di daftar ini.</li> : null}
        {rows.map((r) => (
          <li key={r.id} className="rounded-lg border border-neutral-200 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-neutral-900">{r.display_name}</p>
              {r.is_hidden ? (
                <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600">Disembunyikan</span>
              ) : null}
            </div>
            <p className="text-xs text-neutral-500">
              {r.campaigns?.title ?? "(kampanye dihapus)"} · {fmtDate(r.created_at)}
            </p>
            <p className="mt-1 text-sm text-neutral-700">{r.message}</p>
            <div className="mt-3 flex gap-4">
              <form action={toggleComment}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="hide" value={r.is_hidden ? "false" : "true"} />
                <button type="submit" className="text-xs text-brand underline">
                  {r.is_hidden ? "Tampilkan" : "Sembunyikan"}
                </button>
              </form>
              <form action={deleteComment}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="text-xs text-red-600 underline">
                  Hapus
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
