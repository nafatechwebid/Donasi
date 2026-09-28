import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "long",
    timeStyle: "short",
  });
}

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  if (!UUID_RE.test(params.id)) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("donations")
    .select("id,amount,status,is_anonymous,message,verified_at,created_at,campaigns(title)")
    .eq("id", params.id)
    .eq("donor_id", user.id)
    .maybeSingle();
  if (!data || data.status !== "verified") notFound();

  const campaignTitle = (data.campaigns as unknown as { title: string } | null)?.title ?? "-";

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <Link href="/dashboard" className="print:hidden text-sm text-brand underline">
        Kembali ke dasbor
      </Link>

      <div className="mt-6 rounded-xl border border-neutral-300 p-6 text-center">
        <p className="text-4xl">🤲</p>
        <h1 className="mt-2 font-serif text-xl text-brand-dark">Kuitansi Donasi</h1>
        <p className="mt-1 text-xs text-neutral-500">No. Referensi: {data.id}</p>

        <div className="mt-6 rounded-lg bg-brand-light p-4 text-left">
          <p className="text-sm text-neutral-600">Nominal donasi</p>
          <p className="text-2xl font-semibold text-brand-dark">{formatRupiah(Number(data.amount))}</p>
        </div>

        <dl className="mt-4 space-y-2 text-left text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-neutral-500">Kampanye</dt>
            <dd className="text-right text-neutral-900">{campaignTitle}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-neutral-500">Tanggal donasi</dt>
            <dd className="text-neutral-900">{fmtDate(data.created_at as string)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-neutral-500">Diverifikasi pada</dt>
            <dd className="text-neutral-900">
              {data.verified_at ? fmtDate(data.verified_at as string) : "-"}
            </dd>
          </div>
        </dl>

        <p className="mt-6 text-xs leading-relaxed text-neutral-500">
          Kuitansi ini adalah bukti penerimaan donasi, bukan dokumen resmi untuk keperluan pengurangan pajak
          kecuali dinyatakan lain oleh pengelola.
        </p>
      </div>

      <div className="mt-6 text-center">
        <PrintButton />
      </div>
    </main>
  );
}
