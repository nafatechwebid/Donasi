import Link from "next/link";
import LikeButton from "@/components/LikeButton";
import { cldUrl } from "@/lib/cloudinary";
import { formatRupiah, progressPercent } from "@/lib/utils";

export type PublicCampaign = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  cover_image_url: string | null;
  target_amount: number;
  collected_amount: number;
  deadline: string | null;
  is_deadline_active: boolean;
  program_categories: { name: string; icon: string | null } | null;
};

function daysLeft(deadline: string | null, active: boolean): string | null {
  if (!active || !deadline) return null;
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return "Berakhir";
  return `${Math.ceil(ms / 86400000)} hari lagi`;
}

// wide = true dipakai saat kampanye hanya satu: di layar tablet/desktop kartu
// tampil mendatar (foto kiri, teks kanan) agar tidak membesar berlebihan.
export default function CampaignCard({ c, wide = false }: { c: PublicCampaign; wide?: boolean }) {
  const img = cldUrl(c.cover_image_url, wide ? 900 : 600);
  const pct = progressPercent(Number(c.collected_amount), Number(c.target_amount));
  const left = daysLeft(c.deadline, c.is_deadline_active);
  const canDonate = left !== "Berakhir";
  const href = `/kampanye/${c.slug}`;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:shadow-md ${
        wide ? "md:flex" : ""
      }`}
    >
      {/* Foto */}
      <div className={`relative ${wide ? "md:w-1/2 md:flex-none" : ""}`}>
        <LikeButton campaignId={c.id} variant="card" />
        <Link href={href} tabIndex={-1} aria-hidden="true" className={`block ${wide ? "md:h-full" : ""}`}>
          {img ? (
            <img
              src={img}
              alt={c.title}
              className={`aspect-[16/9] w-full object-cover ${wide ? "md:aspect-auto md:h-full md:min-h-[260px]" : ""}`}
            />
          ) : (
            <div className={`aspect-[16/9] w-full bg-brand-light ${wide ? "md:aspect-auto md:h-full md:min-h-[260px]" : ""}`} />
          )}
        </Link>
      </div>

      {/* Teks + tombol */}
      <div className={wide ? "md:flex md:w-1/2 md:flex-col md:justify-center" : ""}>
        <Link href={href} className="block">
          <div className={`p-4 pb-3 ${wide ? "md:p-6 md:pb-4" : ""}`}>
            {c.program_categories ? (
              <p className="text-xs text-brand">
                {c.program_categories.icon ? `${c.program_categories.icon} ` : ""}
                {c.program_categories.name}
              </p>
            ) : null}
            <h3 className={`mt-1 line-clamp-2 font-medium text-neutral-900 ${wide ? "md:text-xl" : ""}`}>{c.title}</h3>
            {c.short_description ? (
              <p className={`mt-1 line-clamp-2 text-sm text-neutral-600 ${wide ? "md:line-clamp-4" : ""}`}>
                {c.short_description}
              </p>
            ) : null}
            {/* Teks biasa (bukan link terpisah) karena seluruh area ini sudah berupa link */}
            <span className="mt-1 inline-block text-sm font-medium text-brand">Baca selengkapnya →</span>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
              <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 flex items-end justify-between gap-2 text-xs text-neutral-600">
              <div>
                <p className="text-sm font-semibold text-neutral-900">{formatRupiah(Number(c.collected_amount))}</p>
                <p>terkumpul dari {formatRupiah(Number(c.target_amount))}</p>
              </div>
              {left ? <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-800">{left}</span> : null}
            </div>
          </div>
        </Link>

        {canDonate ? (
          <div className={`px-4 pb-4 ${wide ? "md:px-6 md:pb-6" : ""}`}>
            <Link
              href={`${href}/donasi`}
              className="block w-full rounded-md bg-brand px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-brand-dark"
            >
              Donasi Sekarang
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
