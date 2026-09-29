"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";

const UUID = z.string().uuid();

const schema = z.object({
  campaign_id: UUID,
  description: z.string().trim().min(3, "Keterangan minimal 3 karakter").max(300, "Keterangan maksimal 300 karakter"),
  amount: z.number().int("Nominal harus angka bulat").min(1000, "Nominal minimal Rp1.000"),
  spent_at: z.string().min(1, "Tanggal wajib diisi"),
  proof_url: z
    .string()
    .url("Unggah bukti terlebih dahulu")
    .startsWith("https://res.cloudinary.com/", "Bukti harus diunggah lewat Cloudinary"),
});

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

export async function addExpenditure(formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdmin();
  const campaignId = str(formData, "campaign_id");
  const back = `/admin/kampanye/${campaignId}`;

  const parsed = schema.safeParse({
    campaign_id: campaignId,
    description: str(formData, "description"),
    amount: Number(str(formData, "amount").replace(/\D/g, "")),
    spent_at: str(formData, "spent_at"),
    proof_url: str(formData, "proof_url"),
  });
  if (!parsed.success) {
    return redirect(`${back}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Data tidak valid")}`);
  }
  const v = parsed.data;

  const { error } = await supabase.from("expenditures").insert({
    campaign_id: v.campaign_id,
    description: v.description,
    amount: v.amount,
    spent_at: v.spent_at,
    proof_url: v.proof_url,
    created_by: user.id,
  });
  if (error) {
    return redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/kampanye`);
  revalidatePath(`/laporan-keuangan`);
  revalidatePath(back);
  return redirect(`${back}?ok=${encodeURIComponent("Laporan pengeluaran ditambahkan")}`);
}

export async function updateExpenditure(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  const campaignId = str(formData, "campaign_id");
  const back = `/admin/kampanye/${campaignId}`;
  if (!UUID.safeParse(id).success) return redirect(back);

  const parsed = schema.safeParse({
    campaign_id: campaignId,
    description: str(formData, "description"),
    amount: Number(str(formData, "amount").replace(/\D/g, "")),
    spent_at: str(formData, "spent_at"),
    proof_url: str(formData, "proof_url"),
  });
  if (!parsed.success) {
    return redirect(
      `${back}/pengeluaran/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Data tidak valid")}`
    );
  }
  const v = parsed.data;

  const { error } = await supabase
    .from("expenditures")
    .update({
      description: v.description,
      amount: v.amount,
      spent_at: v.spent_at,
      proof_url: v.proof_url,
    })
    .eq("id", id);
  if (error) {
    return redirect(`${back}/pengeluaran/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/kampanye`);
  revalidatePath(`/laporan-keuangan`);
  revalidatePath(back);
  return redirect(`${back}?ok=${encodeURIComponent("Laporan pengeluaran diperbarui")}`);
}

export async function deleteExpenditure(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  const campaignId = str(formData, "campaign_id");
  const back = `/admin/kampanye/${campaignId}`;
  if (!UUID.safeParse(id).success) return redirect(back);

  const { error } = await supabase.from("expenditures").delete().eq("id", id);
  if (error) return redirect(`${back}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(back);
  revalidatePath(`/laporan-keuangan`);
  return redirect(`${back}?ok=${encodeURIComponent("Laporan pengeluaran dihapus")}`);
}
