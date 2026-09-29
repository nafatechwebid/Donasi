import { notFound } from "next/navigation";
import SubmitButton from "@/components/SubmitButton";
import { requireAdmin } from "@/lib/auth";
import CampaignForm, { type CampaignData, type CategoryOption } from "@/components/CampaignForm";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import { cldUrl } from "@/lib/cloudinary";
import { formatRupiah } from "@/lib/utils";
import { deleteCampaign, saveCampaign } from "@/app/admin/kampanye/actions";
import { addUpdate, deleteUpdate } from "@/app/admin/kabar/actions";
import { addExpenditure, deleteExpenditure } from "@/app/admin/pengeluaran/actions";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const inputCls =
  "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand";

type UpdateRow = { id: string; title: string; content: string; image_url: string | null; created_at: string };
type ExpRow = { id: string; description: string; amount: number; proof_url: string; spent_at: string };

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium" });
}

export default async function EditPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string; ok?: string };
}) {
  if (!UUID_RE.test(params.id)) notFound();

  const { supabase } = await requireAdmin();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      "id,title,category_id,short_description,story,cover_image_url,target_amount,deadline,is_deadline_active,status"
    )
    .eq("id", params.id)
    .maybeSingle();
  if (!campaign) notFound();

  const [{ data: cats }, { data: updates }, { data: expenditures }] = await Promise.all([
    supabase.from("program_categories").select("id,name").order("name"),
    supabase
      .from("campaign_updates")
      .select("id,title,content,image_url,created_at")
      .eq("campaign_id", params.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("expenditures")
      .select("id,description,amount,proof_url,spent_at")
      .eq("campaign_id", params.id)
      .order("spent_at", { ascending: false }),
  ]);

  const categories = (cats ?? []) as CategoryOption[];
  const c = campaign as CampaignData;
  const updateRows = (updates ?? []) as UpdateRow[];
  const expRows = (expenditures ?? []) as ExpRow[];
  const totalSpent = expRows.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="font-serif text-2xl text-brand-dark">Edit Kampanye</h1>

      {searchParams.error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{searchParams.error}</p>
      ) : null}
      {searchParams.ok ? (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{searchParams.ok}</p>
      ) : null}

      <CampaignForm action={saveCampaign} categories={categories} campaign={c} submitLabel="Simpan perubahan" />

      {/* Kabar Terbaru */}
      <section className="mt-12 border-t border-neutral-200 pt-8">
        <h2 className="font-serif text-xl text-brand-dark">Kabar Terbaru</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Perbarui perkembangan penyaluran dana kepada donatur secara berkala.
        </p>

        <ul className="mt-4 flex flex-col gap-3">
          {updateRows.length === 0 ? <li className="text-sm text-neutral-500">Belum ada kabar.</li> : null}
          {updateRows.map((u) => (
            <li key={u.id} className="rounded-lg border border-neutral-200 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-neutral-900">{u.title}</p>
                <form action={deleteUpdate}>
                  <input type="hidden" name="id" value={u.id} />
                  <input type="hidden" name="campaign_id" value={c.id} />
                  <button type="submit" className="text-xs text-red-600 underline">
                    Hapus
                  </button>
                </form>
              </div>
              <p className="text-xs text-neutral-500">{fmtDate(u.created_at)}</p>
              <p className="mt-1 whitespace-pre-line text-sm text-neutral-700">{u.content}</p>
            </li>
          ))}
        </ul>

        <form action={addUpdate} className="mt-4 flex flex-col gap-3 rounded-lg border border-neutral-200 p-4">
          <input type="hidden" name="campaign_id" value={c.id} />
          <p className="text-sm font-medium text-neutral-800">Tambah kabar</p>
          <label className="block">
            <span className="text-sm text-neutral-700">Judul</span>
            <input name="title" required maxLength={150} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-sm text-neutral-700">Isi kabar</span>
            <textarea name="content" required rows={4} maxLength={5000} className={inputCls} />
          </label>
          <CloudinaryUpload name="image_url" label="Foto (opsional)" />
          <SubmitButton className="rounded-md bg-brand px-4 py-3 text-white hover:bg-brand-dark disabled:opacity-60">
            Simpan laporan
          </SubmitButton>
        </form>
      </section>

      {/* Laporan Pengeluaran */}
      <section className="mt-12 border-t border-neutral-200 pt-8">
        <h2 className="font-serif text-xl text-brand-dark">Laporan Pengeluaran</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Catat ke mana dana disalurkan, lengkap dengan bukti foto. Total tersalurkan:{" "}
          <strong>{formatRupiah(totalSpent)}</strong>
        </p>

        <ul className="mt-4 flex flex-col gap-3">
          {expRows.length === 0 ? (
            <li className="text-sm text-neutral-500">Belum ada laporan pengeluaran.</li>
          ) : null}
          {expRows.map((e) => {
            const img = cldUrl(e.proof_url, 300);
            return (
              <li key={e.id} className="flex gap-3 rounded-lg border border-neutral-200 p-3">
                {img ? (
                  <a href={e.proof_url} target="_blank" rel="noopener noreferrer" className="flex-none">
                    <img src={img} alt="Bukti" className="h-16 w-16 rounded-md object-cover" />
                  </a>
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-neutral-900">{formatRupiah(Number(e.amount))}</p>
                    <form action={deleteExpenditure}>
                      <input type="hidden" name="id" value={e.id} />
                      <input type="hidden" name="campaign_id" value={c.id} />
                      <button type="submit" className="text-xs text-red-600 underline">
                        Hapus
                      </button>
                    </form>
                  </div>
                  <p className="text-xs text-neutral-500">{fmtDate(e.spent_at)}</p>
                  <p className="mt-1 text-sm text-neutral-700">{e.description}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <form
          action={addExpenditure}
          className="mt-4 flex flex-col gap-3 rounded-lg border border-neutral-200 p-4"
        >
          <input type="hidden" name="campaign_id" value={c.id} />
          <p className="text-sm font-medium text-neutral-800">Tambah laporan pengeluaran</p>
          <label className="block">
            <span className="text-sm text-neutral-700">Keterangan</span>
            <input
              name="description"
              required
              maxLength={300}
              placeholder="Contoh: Pembayaran SPP bulan Oktober"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="text-sm text-neutral-700">Nominal (Rp)</span>
            <input name="amount" required inputMode="numeric" className={inputCls} />
          </label>
          <label className="block">
            <span className="text-sm text-neutral-700">Tanggal</span>
            <input type="date" name="spent_at" required className={inputCls} />
          </label>
          <CloudinaryUpload name="proof_url" label="Bukti (kuitansi/nota/foto penyerahan)" />
          <button type="submit" className="rounded-md bg-brand px-4 py-3 text-white hover:bg-brand-dark">
            Simpan laporan
          </button>
        </form>
      </section>

      <details className="mt-12 rounded-lg border border-red-200 p-4">
        <summary className="cursor-pointer text-sm text-red-700">Zona berbahaya: hapus kampanye</summary>
        <p className="mt-2 text-sm text-neutral-600">
          Kampanye yang sudah menerima donasi tidak bisa dihapus. Ubah statusnya menjadi Ditutup.
        </p>
        <form action={deleteCampaign} className="mt-3">
          <input type="hidden" name="id" value={c.id} />
          <button type="submit" className="rounded-md bg-red-600 px-4 py-2 text-sm text-white">
            Hapus permanen
          </button>
        </form>
      </details>
    </main>
  );
}
