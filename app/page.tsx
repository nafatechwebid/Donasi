import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import CampaignCard, { type PublicCampaign } from "@/components/CampaignCard";
import { createClient } from "@/lib/supabase/server";

type Category = { id: string; name: string; slug: string; icon: string | null };

export default async function HomePage({
  searchParams,
}: {
  searchParams: { kategori?: string };
}) {
  const supabase = createClient();

  const { data: cats } = await supabase
    .from("program_categories")
    .select("id,name,slug,icon")
    .order("name");
  const categories = (cats ?? []) as Category[];

  const activeSlug = searchParams.kategori ?? "";
  const activeCat = categories.find((c) => c.slug === activeSlug);

  let query = supabase
    .from("campaigns")
    .select(
      "id,slug,title,short_description,cover_image_url,target_amount,collected_amount,deadline,is_deadline_active,program_categories(name,icon)"
    )
    .eq("status", "active");
  if (activeCat) query = query.eq("category_id", activeCat.id);
  const { data } = await query.order("created_at", { ascending: false });
  const campaigns = (data ?? []) as unknown as PublicCampaign[];

  const chipBase = "whitespace-nowrap rounded-full border px-4 py-2 text-sm";
  const chipOn = "border-brand bg-brand text-white";
  const chipOff = "border-neutral-300 text-neutral-700 hover:bg-brand-light";

  return (
    <>
      <SiteHeader narrow />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <section className="rounded-2xl bg-brand-light px-6 py-8">
          <h1 className="font-serif text-3xl text-brand-dark">Bersama Meringankan Beban</h1>
          <p className="mt-2 max-w-xl text-neutral-700">
            Salurkan donasimu untuk program kemanusiaan, pendidikan, dan kesehatan. Setiap penyaluran
            dilaporkan secara terbuka.
          </p>
        </section>

        {categories.length > 0 ? (
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            <Link href="/" className={`${chipBase} ${activeCat ? chipOff : chipOn}`}>
              Semua
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/?kategori=${c.slug}`}
                className={`${chipBase} ${activeCat?.id === c.id ? chipOn : chipOff}`}
              >
                {c.icon ? `${c.icon} ` : ""}
                {c.name}
              </Link>
            ))}
          </div>
        ) : null}

        <h2 className="mt-6 font-serif text-xl text-brand-dark">Kampanye Aktif</h2>

        {campaigns.length === 0 ? (
          <p className="mt-4 text-neutral-500">Belum ada kampanye aktif di kategori ini.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {campaigns.map((c) => (
              <CampaignCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
