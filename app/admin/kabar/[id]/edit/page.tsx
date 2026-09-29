import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import SubmitButton from "@/components/SubmitButton";
import { updateUpdate } from "@/app/admin/kabar/actions";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const inputCls =
  "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand";

export default async function EditUpdatePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  if (!UUID_RE.test(params.id)) notFound();

  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("campaign_updates")
    .select("id,campaign_id,title,content,image_url")
    .eq("id", params.id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <main className="mx-auto max-w-xl px-6 py-8">
      <Link href={`/admin/kampanye/${data.campaign_id}`} className="text-sm text-brand underline">
        Kembali ke kampanye
      </Link>
      <h1 className="mt-3 font-serif text-2xl text-brand-dark">Edit Kabar</h1>

      {searchParams.error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{searchParams.error}</p>
      ) : null}

      <form action={updateUpdate} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="id" value={data.id} />
        <input type="hidden" name="campaign_id" value={data.campaign_id} />
        <label className="block">
          <span className="text-sm text-neutral-700">Judul</span>
          <input name="title" required maxLength={150} defaultValue={data.title} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-sm text-neutral-700">Isi kabar</span>
          <textarea
            name="content"
            required
            rows={6}
            maxLength={5000}
            defaultValue={data.content}
            className={inputCls}
          />
        </label>
        <CloudinaryUpload name="image_url" label="Foto (opsional)" defaultValue={data.image_url} />
        <SubmitButton className="rounded-md bg-brand px-4 py-3 text-white hover:bg-brand-dark disabled:opacity-60">
          Simpan perubahan
        </SubmitButton>
      </form>
    </main>
  );
}
