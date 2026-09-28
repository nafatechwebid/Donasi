import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import CampaignForm, { type CampaignData, type CategoryOption } from "@/components/CampaignForm";
import { deleteCampaign, saveCampaign } from "@/app/admin/kampanye/actions";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
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

  const { data: cats } = await supabase.from("program_categories").select("id,name").order("name");
  const categories = (cats ?? []) as CategoryOption[];
  const c = campaign as CampaignData;

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="font-serif text-2xl text-brand-dark">Edit Kampanye</h1>

      {searchParams.error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      ) : null}

      <CampaignForm
        action={saveCampaign}
        categories={categories}
        campaign={c}
        submitLabel="Simpan perubahan"
      />

      <details className="mt-10 rounded-lg border border-red-200 p-4">
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
