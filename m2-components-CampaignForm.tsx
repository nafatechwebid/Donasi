import CloudinaryUpload from "@/components/CloudinaryUpload";
import { toWibInput } from "@/lib/utils";

export type CategoryOption = { id: string; name: string };

export type CampaignData = {
  id: string;
  title: string;
  category_id: string | null;
  short_description: string | null;
  story: string | null;
  cover_image_url: string | null;
  target_amount: number;
  deadline: string | null;
  is_deadline_active: boolean;
  status: string;
};

type Props = {
  action: (formData: FormData) => Promise<void>;
  categories: CategoryOption[];
  campaign?: CampaignData;
  submitLabel: string;
};

const inputCls =
  "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm text-neutral-700">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-neutral-500">{hint}</span> : null}
    </label>
  );
}

export default function CampaignForm({ action, categories, campaign, submitLabel }: Props) {
  return (
    <form action={action} className="mt-6 flex flex-col gap-5">
      {campaign ? <input type="hidden" name="id" value={campaign.id} /> : null}

      <Field label="Judul kampanye">
        <input
          name="title"
          required
          minLength={5}
          maxLength={150}
          defaultValue={campaign?.title ?? ""}
          className={inputCls}
        />
      </Field>

      <Field label="Kategori">
        <select name="category_id" defaultValue={campaign?.category_id ?? ""} className={inputCls}>
          <option value="">- Tanpa kategori -</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Deskripsi singkat" hint="Tampil di daftar kampanye (maks. 300 karakter)">
        <textarea
          name="short_description"
          rows={2}
          maxLength={300}
          defaultValue={campaign?.short_description ?? ""}
          className={inputCls}
        />
      </Field>

      <Field label="Kisah lengkap" hint="Ceritakan latar belakang pihak yang membutuhkan bantuan">
        <textarea
          name="story"
          rows={10}
          maxLength={20000}
          defaultValue={campaign?.story ?? ""}
          className={inputCls}
        />
      </Field>

      <CloudinaryUpload
        name="cover_image_url"
        label="Foto sampul"
        defaultValue={campaign?.cover_image_url ?? null}
      />

      <Field label="Target dana (Rp)" hint="Contoh: 5000000 atau 5.000.000">
        <input
          name="target_amount"
          required
          inputMode="numeric"
          defaultValue={campaign ? String(Math.round(Number(campaign.target_amount))) : ""}
          className={inputCls}
        />
      </Field>

      <Field label="Batas waktu penggalangan" hint="Waktu Indonesia Barat (WIB). Boleh dikosongkan.">
        <input
          type="datetime-local"
          name="deadline"
          defaultValue={toWibInput(campaign?.deadline ?? null)}
          className={inputCls}
        />
      </Field>

      <label className="flex items-center gap-3 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="is_deadline_active"
          defaultChecked={campaign?.is_deadline_active ?? false}
          className="h-5 w-5 accent-brand"
        />
        Aktifkan hitung mundur (countdown) di halaman kampanye
      </label>

      <Field label="Status">
        <select name="status" defaultValue={campaign?.status ?? "active"} className={inputCls}>
          <option value="pending">Draf / menunggu approval</option>
          <option value="active">Aktif (tayang)</option>
          <option value="closed">Ditutup</option>
          <option value="rejected">Ditolak</option>
        </select>
      </Field>

      <button
        type="submit"
        className="rounded-md bg-brand px-4 py-3 text-white transition hover:bg-brand-dark"
      >
        {submitLabel}
      </button>
    </form>
  );
}
