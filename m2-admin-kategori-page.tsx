import { requireAdmin } from "@/lib/auth";
import { addCategory, deleteCategory } from "./actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
};

const inputCls =
  "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand";

export default async function KategoriPage({
  searchParams,
}: {
  searchParams: { error?: string; ok?: string };
}) {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("program_categories")
    .select("id,name,slug,icon,description")
    .order("name");
  const categories = (data ?? []) as Category[];

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-serif text-2xl text-brand-dark">Kategori Program</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Contoh: Bencana Alam, Pendidikan, Kesehatan, Panti Asuhan, Dana Kematian, Santunan Keluarga
        Kurang Mampu.
      </p>

      {searchParams.error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      ) : null}
      {searchParams.ok ? (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {searchParams.ok}
        </p>
      ) : null}

      <form action={addCategory} className="mt-6 flex flex-col gap-4 rounded-lg border border-neutral-200 p-4">
        <p className="text-sm font-medium text-neutral-800">Tambah kategori</p>
        <label className="block">
          <span className="text-sm text-neutral-700">Nama</span>
          <input name="name" required minLength={3} maxLength={60} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-sm text-neutral-700">Ikon (emoji, opsional)</span>
          <input name="icon" maxLength={8} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-sm text-neutral-700">Deskripsi (opsional)</span>
          <input name="description" maxLength={200} className={inputCls} />
        </label>
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-3 text-white transition hover:bg-brand-dark"
        >
          Simpan kategori
        </button>
      </form>

      <ul className="mt-6 flex flex-col gap-3">
        {categories.length === 0 ? (
          <li className="text-sm text-neutral-500">Belum ada kategori.</li>
        ) : null}
        {categories.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900">
                {c.icon ? `${c.icon} ` : ""}
                {c.name}
              </p>
              {c.description ? (
                <p className="truncate text-xs text-neutral-500">{c.description}</p>
              ) : null}
            </div>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={c.id} />
              <button type="submit" className="text-xs text-red-600 underline">
                Hapus
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
