import { requireAdmin } from "@/lib/auth";
import CampaignForm, { type CategoryOption } from "@/components/CampaignForm";
import { saveCampaign } from "@/app/admin/kampanye/actions";

export default async function BaruPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const { supabase } = await requireAdmin();

  const { data } = await supabase.from("program_categories").select("id,name").order("name");
  const categories = (data ?? []) as CategoryOption[];

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="font-serif text-2xl text-brand-dark">Kampanye Baru</h1>

      {searchParams.error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      ) : null}

      <CampaignForm action={saveCampaign} categories={categories} submitLabel="Simpan kampanye" />
    </main>
  );
}
