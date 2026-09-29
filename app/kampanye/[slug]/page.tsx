import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Countdown from "@/components/Countdown";
import CommentForm from "@/components/CommentForm";
import LikeButton from "@/components/LikeButton";
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

type DonorRow = { display_name: string; amount: number; message: string | null; created_at: string };
type UpdateRow = { id: string; title: string; content: string; image_url: string | null; created_at: string };
type ExpRow = { id: string; description: string; amount: number; proof_url: string; spent_at: string };
type CommentRow = { id: string; display_name: string; message: string; created_at: string };

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
  return new Date(iso).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "long", year: "numeric" });
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "long", year: "numeric" });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCampaign(params.slug);
  if (!c) return { title: "Kampanye tidak ditemukan" };
  const img = cldUrl(c.cover_image_url, 1200);
  const desc = c.short_description ?? undefined;
  return {
    title: c.title,
    description: desc,
    openGraph: { title: c.title, description: desc, images: img ? [img] : undefined },
  };
}

export default async function CampaignPage({ params }: Props) {
  const c = await getCampaign(params.slug);
  if (!c) notFound();

  const supabase = createClient();
  const [donorsRes, countRes, updatesRes, expRes, commentsRes, userRes] = await Promise.all([
    supabase.rpc("get_campaign_donors", { p_campaign_id: c.id, p_limit: 20 }),
    supabase.rpc("get_campaign_donor_count", { p_campaign_id: c.id }),
    supabase
      .from("campaign_updates")
      .select("id,title,content,image_url,created_at")
      .eq("campaign_id", c.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("expenditures")
      .select("id,description,amount,proof_url,spent_at")
      .eq("campaign_id", c.id)
      .order("spent_at", { ascending: false }),
    supabase
      .from("comments")
      .select("id,display_name,message,created_at")
      .eq("campaign_id", c.id)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.auth.getUser(),
  ]);
  const donors = (donorsRes.data ?? []) as DonorRow[];
  const donorCount = Number(countRes.data ?? 0);
  const updates = (updatesRes.data ?? []) as UpdateRow[];
  const expenditures = (expRes.data ?? []) as ExpRow[];
  const comments = (commentsRes.data ?? []) as CommentRow[];

  let defaultName = "";
  const user = userRes.data.user;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
    defaultName = (p?.full_name as string | null) ?? "";
  }

  const img = cldUrl(c.cover_image_url, 1200);
  const collected = Number(c.collected_amount);
  const target = Number(c.target_amount);
  const pct = progressPercent(collected, target);
  const isClosed = c.status === "closed";
  const expired = Boolean(c.is_deadline_active && c.deadline && new Date(c.deadline).getTime() < Date.now());
  const totalSpent = expenditures.reduce((s, e) => s + Number(e.amount), 0);

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

        <div className="mt-3">
          <LikeButton campaignId={c.id} variant="detail" />
        </div>

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
            <button type="button" disabled className="mt-4 w-full rounded-md bg-neutral-300 px-4 py-3 text-white">
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

        {updates.length > 0 ? (
          <section className="mt-8">
            <h2 className="font-serif text-xl text-brand-dark">Kabar Terbaru</h2>
            <ul className="mt-3 flex flex-col gap-4">
              {updates.map((u) => {
                const uimg = cldUrl(u.image_url, 800);
                return (
                  <li key={u.id} className="rounded-lg border border-neutral-200 p-4">
                    <p className="text-xs text-neutral-500">{fmtDate(u.created_at)}</p>
                    <p className="mt-1 font-medium text-neutral-900">{u.title}</p>
                    {uimg ? <img src={uimg} alt={u.title} className="mt-2 w-full rounded-md object-cover" /> : null}
                    <p className="mt-2 whitespace-pre-line text-sm text-neutral-700">{u.content}</p>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {expenditures.length > 0 ? (
          <section className="mt-8">
            <h2 className="font-serif text-xl text-brand-dark">Bukti Penyaluran</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Total dana yang sudah disalurkan: <strong>{formatRupiah(totalSpent)}</strong>
            </p>
            <ul className="mt-3 flex flex-col gap-3">
              {expenditures.map((e) => {
                const eimg = cldUrl(e.proof_url, 400);
                return (
                  <li key={e.id} className="flex gap-3 rounded-lg border border-neutral-200 p-3">
                    {eimg ? (
                      <a href={e.proof_url} target="_blank" rel="noopener noreferrer" className="flex-none">
                        <img src={eimg} alt="Bukti penyaluran" className="h-20 w-20 rounded-md object-cover" />
                      </a>
                    ) : null}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900">{formatRupiah(Number(e.amount))}</p>
                      <p className="text-xs text-neutral-500">{fmtDate(e.spent_at)}</p>
                      <p className="mt-1 text-sm text-neutral-700">{e.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <section className="mt-8">
          <h2 className="font-serif text-xl text-brand-dark">Doa &amp; Dukungan</h2>
          <div className="mt-3">
            <CommentForm campaignId={c.id} defaultName={defaultName} />
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {comments.length === 0 ? (
              <li className="text-sm text-neutral-500">Jadilah yang pertama mengirim doa dan dukungan.</li>
            ) : null}
            {comments.map((cm) => (
              <li key={cm.id} className="rounded-lg border border-neutral-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-neutral-900">{cm.display_name}</p>
                  <p className="text-xs text-neutral-500">{timeAgo(cm.created_at)}</p>
                </div>
                <p className="mt-1 text-sm text-neutral-700">{cm.message}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-xl text-brand-dark">Donatur ({donorCount})</h2>
          {donors.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500">Belum ada donasi terverifikasi. Jadilah yang pertama berdonasi.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {donors.map((d, i) => (
                <li key={`${d.created_at}-${i}`} className="rounded-lg border border-neutral-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-neutral-900">{d.display_name}</p>
                    <p className="text-sm font-semibold text-brand-dark">{formatRupiah(Number(d.amount))}</p>
                  </div>
                  <p className="text-xs text-neutral-500">{timeAgo(d.created_at)}</p>
                  {d.message ? <p className="mt-2 text-sm italic text-neutral-700">&quot;{d.message}&quot;</p> : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
