"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { donationSchema, type DonationInput } from "@/lib/donation-schema";
import { kirimNotifikasiAdmin } from "@/lib/emailjs";

type Result = { ok: boolean; error?: string; slug?: string };

export async function submitDonation(input: DonationInput): Promise<Result> {
  const parsed = donationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const v = parsed.data;

  // Honeypot: kolom tersembunyi ini hanya diisi oleh bot. Pura-pura sukses agar bot tidak belajar.
  if (v.website !== "") {
    return { ok: true, slug: "" };
  }

  if (!v.isAnonymous && v.donorName.length < 2) {
    return { ok: false, error: "Isi nama Anda, atau centang donasi anonim" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id,slug,title,status,deadline,is_deadline_active")
    .eq("id", v.campaignId)
    .maybeSingle();
  if (!campaign || campaign.status !== "active") {
    return { ok: false, error: "Kampanye ini tidak menerima donasi" };
  }
  if (
    campaign.is_deadline_active &&
    campaign.deadline &&
    new Date(campaign.deadline as string).getTime() < Date.now()
  ) {
    return { ok: false, error: "Penggalangan dana ini sudah berakhir" };
  }

  const { data: channel } = await supabase
    .from("payment_channels")
    .select("id,type")
    .eq("id", v.channelId)
    .eq("is_active", true)
    .maybeSingle();
  if (!channel) {
    return { ok: false, error: "Metode pembayaran tidak tersedia" };
  }

  const { error } = await supabase.from("donations").insert({
    campaign_id: v.campaignId,
    donor_id: user?.id ?? null,
    is_anonymous: v.isAnonymous,
    donor_name: v.donorName || null,
    donor_email: v.donorEmail || null,
    amount: v.amount,
    payment_method: channel.type === "qris" ? "qris" : "bank_transfer",
    payment_channel_id: v.channelId,
    proof_url: v.proofUrl,
    status: "pending",
    is_recurring: v.recurring !== "none",
    recurring_interval: v.recurring === "none" ? null : v.recurring,
    message: v.message || null,
  });
  if (error) {
    console.error("submitDonation:", error.message);
    return { ok: false, error: "Gagal menyimpan donasi. Coba lagi beberapa saat." };
  }

  await kirimNotifikasiAdmin({
    nama: v.donorName
      ? v.isAnonymous
        ? `${v.donorName} (anonim di publik)`
        : v.donorName
      : "Tanpa nama",
    nominal: v.amount,
    kampanye: (campaign.title as string) ?? "kampanye",
    metode: channel.type === "qris" ? "QRIS" : "Transfer bank",
  });

  revalidatePath("/");
  return { ok: true, slug: campaign.slug as string };
}
