"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";

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
  const { error } = await supabase
    .from("donations")
    .update({
      status,
      verified_by: verified ? user.id : null,
      verified_at: verified ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) {
    return redirect(`${backUrl}&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/donasi");
  revalidatePath("/admin");
  revalidatePath("/");
  const label =
    status === "verified" ? "Donasi diverifikasi" : status === "rejected" ? "Donasi ditolak" : "Donasi dikembalikan ke menunggu";
  return redirect(`${backUrl}&ok=${encodeURIComponent(label)}`);
}
