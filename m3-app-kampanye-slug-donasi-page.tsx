import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import DonationForm, { type Channel } from "@/components/DonationForm";
import { createClient } from "@/lib/supabase/server";

export default async function DonasiPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: c } = await supabase
    .from("campaigns")
    .select("id,slug,title,status,deadline,is_deadline_active")
    .eq("slug", params.slug)
    .eq("status", "active")
    .maybeSingle();
  if (!c) notFound();

  const expired = Boolean(
    c.is_deadline_active && c.deadline && new Date(c.deadline as string).getTime() < Date.now()
  );

  const { data: chans } = await supabase
    .from("payment_channels")
    .select("id,type,bank_name,account_number,account_name,qris_image_url")
    .eq("is_active", true)
    .order("sort_order")
    .order("created_at");
  const channels = (chans ?? []) as Channel[];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let defaultName = "";
  if (user) {
    const { data: p } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
    defaultName = (p?.full_name as string | null) ?? "";
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-6">
        <Link href={`/kampanye/${c.slug}`} className="text-sm text-brand underline">
          Kembali ke kampanye
        </Link>
        <h1 className="mt-3 font-serif text-2xl text-neutral-900">Donasi</h1>
        <p className="mt-1 text-sm text-neutral-600">{c.title}</p>

        {expired ? (
          <p className="mt-6 rounded-md bg-neutral-100 px-3 py-3 text-sm text-neutral-700">
            Penggalangan dana ini sudah berakhir.
          </p>
        ) : (
          <DonationForm
            campaignId={c.id as string}
            channels={channels}
            defaultName={defaultName}
            defaultEmail={user?.email ?? ""}
          />
        )}
      </main>
    </>
  );
}
