"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { kirimKonfirmasiDonasi } from "@/lib/emailjs";

const UUID = z.string().uuid();
const STATUSES = ["pending", "verified", "rejected"] as const;
const FILTERS = ["pending", "verified", "rejected", "all"];

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

export async function setDonationStatus(formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdmin();

  const id = str(formData, "id");
  const status = str(formData, "status");
  const backRaw = str(formData, "back");
  const back = FILTERS.includes(backRaw) ? backRaw : "pending";
  const backUrl = `/admin/donasi?status=${back}`;

  if (!UUID.safeParse(id).success) return redirect(backUrl);
  if (!(STATUSES as readonly string[]).includes(status)) return redirect(backUrl);

  const verified = status === "verified";
  let query = supabase
    .from("donations")
    .update({
      status,
      verified_by: verified ? user.id : null,
      verified_at: verified ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (verified) query = query.neq("status", "verified");
  const { data: changed, error } = await query.select("id");
  if (error) {
    return redirect(`${backUrl}&error=${encodeURIComponent(error.message)}`);
  }

  if (verified && changed && changed.length > 0) {
    const { data: d } = await supabase
      .from("donations")
      .select("amount,donor_name,donor_email,campaigns(title)")
      .eq("id", id)
      .single();
    if (d) {
      const camp = d.campaigns as unknown as { title: string } | null;
      await kirimKonfirmasiDonasi({
        email: d.donor_email,
        nama: d.donor_name,
        nominal: Number(d.amount),
        kampanye: camp?.title ?? "kampanye kami",
      });
    }
  }
  
  revalidatePath("/admin/donasi");
  revalidatePath("/admin");
  revalidatePath("/");
  const label =
    status === "verified" ? "Donasi diverifikasi" : status === "rejected" ? "Donasi ditolak" : "Donasi dikembalikan ke menunggu";
  return redirect(`${backUrl}&ok=${encodeURIComponent(label)}`);
}
