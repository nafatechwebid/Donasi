import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  // Akses ke /admin sudah difilter role di middleware.ts —
  // halaman ini hanya bisa dicapai oleh user dengan role 'admin'.
  const supabase = createClient();
  const { count: pendingCampaigns } = await supabase
    .from("campaigns")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: pendingDonations } = await supabase
    .from("donations")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-serif text-2xl text-brand-dark">Dasbor Admin</h1>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="text-sm text-neutral-500">Kampanye menunggu approval</p>
          <p className="mt-1 text-2xl font-semibold">{pendingCampaigns ?? 0}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="text-sm text-neutral-500">Donasi menunggu verifikasi</p>
          <p className="mt-1 text-2xl font-semibold">{pendingDonations ?? 0}</p>
        </div>
      </div>
    </main>
  );
}
