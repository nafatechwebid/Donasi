import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Countdown from "@/components/Countdown";
import { cldUrl } from "@/lib/cloudinary";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, progressPercent } from "@/lib/utils";

type Props = { params: { slug: string } };

type Detail = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  story: string | null;
  cover_image_url: string | null;
  target_amount: number;
  collected_amount: number;
  deadline: string | null;
  is_deadline_active: boolean;
  status: string;
  program_categories: { name: string; icon: string | null } | null;
};

async function getCampaign(slug: string): Promise<Detail | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("campaigns")
    .select(
      "id,slug,title,short_description,story,cover_image_url,target_amount,collected_amount,deadline,is_deadline_active,status,program_categories(name,icon)"
    )
    .eq("slug", slug)
    .in("status", ["active", "closed"])
    .maybeSingle();
  return data as unknown as Detail | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCampaign(params.slug);
  if (!c) return { title: "Kampanye tidak ditemukan" };
  const img = cldUrl(c.cover_image_url, 1200);
  const desc = c.short_description ?? undefined;
  return {
    title: c.title,
    description: desc,
    openGraph: {
      title: c.title,
      description: desc,
      images: img ? [img] : undefined,
    },
  };
}

export default async function CampaignPage({ params }: Props) {
  const c = await getCampaign(params.slug);
  if (!c) notFound();

  const img = cldUrl(c.cover_image_url, 1200);
  const collected = Number(c.collected_amount);
  const target = Number(c.target_amount);
  const pct = progressPercent(collected, target);
  const isClosed = c.status === "closed";

  const host = headers().get("host");
  const shareUrl = host ? `https://${host}/kampanye/${c.slug}` : "";
  const waText = encodeURIComponent(`${c.title}\n${shareUrl}`);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-6">
        {img ? (
          <img src={img} alt={c.title} className="aspect-[1200/630] w-full rounded-xl object-cover" />
        ) : (
          <div className="aspect-[1200/630] w-full rounded-xl bg-brand-light" />
        )}

        {c.program_categories ? (
          <p className="mt-4 text-sm text-brand">
            {c.program_categories.icon ? `${c.program_categories.icon} ` : ""}
            {c.program_categories.name}
          </p>
        ) : null}
        <h1 className="mt-1 font-serif text-2xl text-neutral-900">{c.title}</h1>

        <section className="mt-5 rounded-xl border border-neutral-200 p-4">
          <p className="text-2xl font-semibold text-brand-dark">{formatRupiah(collected)}</p>
          <p className="text-sm text-neutral-600">terkumpul dari target {formatRupiah(target)}</p>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-neutral-200">
            <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-xs text-neutral-500">{pct}% tercapai</p>

          {isClosed ? (
            <p className="mt-4 rounded-md bg-neutral-100 px-3 py-2 text-center text-sm text-neutral-600">
              Penggalangan dana ini telah ditutup
            </p>
          ) : c.is_deadline_active && c.deadline ? (
            <div className="mt-4">
              <Countdown deadline={c.deadline} />
            </div>
          ) : null}

          <button
            type="button"
            disabled
            className="mt-4 w-full rounded-md bg-neutral-300 px-4 py-3 text-white"
          >
            Donasi Sekarang (segera hadir)
          </button>

          {shareUrl ? (
            <a
              href={`https://wa.me/?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block w-full rounded-md border border-brand px-4 py-3 text-center text-sm text-brand hover:bg-brand-light"
            >
              Bagikan lewat WhatsApp
            </a>
          ) : null}
        </section>

        {c.story ? (
          <section className="mt-6">
            <h2 className="font-serif text-xl text-brand-dark">Kisah</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-neutral-800">{c.story}</p>
          </section>
        ) : null}
      </main>
    </>
  );
}
