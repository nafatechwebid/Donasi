import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-serif text-2xl text-brand-dark">
        Halo, {profile?.full_name ?? user.email}
      </h1>
      <p className="mt-2 text-neutral-600">
        Riwayat donasi & sertifikat digital akan tampil di sini pada modul berikutnya.
      </p>
    </main>
  );
}
