import type { Metadata } from "next";
import Link from "next/link";
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

type DonorRow = {
  display_name: string;
  amount: number;
  message: string | null;
  created_at: string;
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

function timeAgo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "baru saja";
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

  const supabase = createClient();
  const [donorsRes, countRes] = await Promise.all([
    supabase.rpc("get_campaign_donors", { p_campaign_id: c.id, p_limit: 20 }),
    supabase.rpc("get_campaign_donor_count", { p_campaign_id: c.id }),
  ]);
  const donors = (donorsRes.data ?? []) as DonorRow[];
  const donorCount = Number(countRes.data ?? 0);

  const img = cldUrl(c.cover_image_url, 1200);
  const collected = Number(c.collected_amount);
  const target = Number(c.target_amount);
  const pct = progressPercent(collected, target);
  const isClosed = c.status === "closed";
  const expired = Boolean(
    c.is_deadline_active && c.deadline && new Date(c.deadline).getTime() < Date.now()
  );

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
          <p className="mt-1 text-xs text-neutral-500">
            {pct}% tercapai · {donorCount} donatur
          </p>

          {isClosed ? (
            <p className="mt-4 rounded-md bg-neutral-100 px-3 py-2 text-center text-sm text-neutral-600">
              Penggalangan dana ini telah ditutup
            </p>
          ) : c.is_deadline_active && c.deadline ? (
            <div className="mt-4">
              <Countdown deadline={c.deadline} />
            </div>
          ) : null}

          {isClosed || expired ? (
            <button
              type="button"
              disabled
              className="mt-4 w-full rounded-md bg-neutral-300 px-4 py-3 text-white"
            >
              Penggalangan berakhir
            </button>
          ) : (
            <Link
              href={`/kampanye/${c.slug}/donasi`}
              className="mt-4 block w-full rounded-md bg-brand px-4 py-3 text-center text-white hover:bg-brand-dark"
            >
              Donasi Sekarang
            </Link>
          )}

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

        <section className="mt-8">
          <h2 className="font-serif text-xl text-brand-dark">Donatur ({donorCount})</h2>
          {donors.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500">
              Belum ada donasi terverifikasi. Jadilah yang pertama berdonasi.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {donors.map((d, i) => (
                <li key={`${d.created_at}-${i}`} className="rounded-lg border border-neutral-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-neutral-900">{d.display_name}</p>
                    <p className="text-sm font-semibold text-brand-dark">
                      {formatRupiah(Number(d.amount))}
                    </p>
                  </div>
                  <p className="text-xs text-neutral-500">{timeAgo(d.created_at)}</p>
                  {d.message ? (
                    <p className="mt-2 text-sm italic text-neutral-700">&quot;{d.message}&quot;</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
