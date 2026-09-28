import { requireAdmin } from "@/lib/auth";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import { cldUrl } from "@/lib/cloudinary";
import { addBank, addQris, deleteChannel, toggleChannel } from "./actions";

type Channel = {
  id: string;
  type: string;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  qris_image_url: string | null;
  is_active: boolean;
};

const inputCls =
  "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand";

function Row({ c }: { c: Channel }) {
  return (
    <li className="rounded-lg border border-neutral-200 p-3">
      <div className="flex items-start gap-3">
        {c.type === "qris" && c.qris_image_url ? (
          <img
            src={cldUrl(c.qris_image_url, 200) ?? c.qris_image_url}
            alt="QRIS"
            className="h-20 w-20 flex-none rounded-md object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-neutral-900">
            {c.bank_name}
            {!c.is_active ? (
              <span className="ml-2 rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600">
                Nonaktif
              </span>
            ) : null}
          </p>
          {c.type === "bank" ? (
            <p className="text-sm text-neutral-600">
              {c.account_number} · a.n. {c.account_name}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex gap-4">
        <form action={toggleChannel}>
          <input type="hidden" name="id" value={c.id} />
          <input type="hidden" name="active" value={c.is_active ? "false" : "true"} />
          <button type="submit" className="text-xs text-brand underline">
            {c.is_active ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </form>
        <form action={deleteChannel}>
          <input type="hidden" name="id" value={c.id} />
          <button type="submit" className="text-xs text-red-600 underline">
            Hapus
          </button>
        </form>
      </div>
    </li>
  );
}

export default async function PembayaranPage({
  searchParams,
}: {
  searchParams: { error?: string; ok?: string };
}) {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("payment_channels")
    .select("id,type,bank_name,account_number,account_name,qris_image_url,is_active")
    .order("created_at");
  const channels = (data ?? []) as Channel[];
  const banks = channels.filter((c) => c.type === "bank");
  const qris = channels.filter((c) => c.type === "qris");

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="font-serif text-2xl text-brand-dark">Metode Pembayaran</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Donatur transfer manual lalu mengunggah bukti. Maksimal 4 rekening bank dan 6 barcode QRIS.
      </p>

      {searchParams.error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{searchParams.error}</p>
      ) : null}
      {searchParams.ok ? (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{searchParams.ok}</p>
      ) : null}

      <h2 className="mt-8 font-medium text-neutral-900">Rekening bank ({banks.length}/4)</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {banks.length === 0 ? <li className="text-sm text-neutral-500">Belum ada rekening.</li> : null}
        {banks.map((c) => (
          <Row key={c.id} c={c} />
        ))}
      </ul>

      {banks.length < 4 ? (
        <form action={addBank} className="mt-4 flex flex-col gap-3 rounded-lg border border-neutral-200 p-4">
          <p className="text-sm font-medium text-neutral-800">Tambah rekening bank</p>
          <label className="block">
            <span className="text-sm text-neutral-700">Nama bank</span>
            <input name="bank_name" required maxLength={40} placeholder="BCA / BRI / Mandiri" className={inputCls} />
          </label>
          <label className="block">
            <span className="text-sm text-neutral-700">Nomor rekening</span>
            <input name="account_number" required inputMode="numeric" maxLength={30} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-sm text-neutral-700">Atas nama</span>
            <input name="account_name" required maxLength={80} className={inputCls} />
          </label>
          <button type="submit" className="rounded-md bg-brand px-4 py-3 text-white hover:bg-brand-dark">
            Simpan rekening
          </button>
        </form>
      ) : (
        <p className="mt-3 text-sm text-neutral-500">Batas 4 rekening tercapai. Hapus salah satu untuk menambah.</p>
      )}

      <h2 className="mt-10 font-medium text-neutral-900">Barcode QRIS / e-wallet ({qris.length}/6)</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {qris.length === 0 ? <li className="text-sm text-neutral-500">Belum ada barcode QRIS.</li> : null}
        {qris.map((c) => (
          <Row key={c.id} c={c} />
        ))}
      </ul>

      {qris.length < 6 ? (
        <form action={addQris} className="mt-4 flex flex-col gap-3 rounded-lg border border-neutral-200 p-4">
          <p className="text-sm font-medium text-neutral-800">Tambah barcode QRIS</p>
          <label className="block">
            <span className="text-sm text-neutral-700">Nama e-wallet</span>
            <input name="bank_name" required maxLength={30} placeholder="GoPay / OVO / Dana / ShopeePay" className={inputCls} />
          </label>
          <CloudinaryUpload name="qris_image_url" label="Gambar barcode QRIS" />
          <button type="submit" className="rounded-md bg-brand px-4 py-3 text-white hover:bg-brand-dark">
            Simpan QRIS
          </button>
        </form>
      ) : (
        <p className="mt-3 text-sm text-neutral-500">Batas 6 barcode tercapai. Hapus salah satu untuk menambah.</p>
      )}
    </main>
  );
}
