"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { commentSchema, type CommentInput } from "@/lib/comment-schema";

type Result = { ok: boolean; error?: string };

export async function submitComment(input: CommentInput): Promise<Result> {
  const parsed = commentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const v = parsed.data;

  // Honeypot: kolom tersembunyi ini hanya diisi bot. Pura-pura sukses agar bot tidak belajar.
  if (v.website !== "") {
    return { ok: true };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id,slug,status")
    .eq("id", v.campaignId)
    .maybeSingle();
  if (!campaign || !["active", "closed"].includes(campaign.status as string)) {
    return { ok: false, error: "Kampanye ini tidak ditemukan" };
  }

  const { error } = await supabase.from("comments").insert({
    campaign_id: v.campaignId,
    donor_id: user?.id ?? null,
    display_name: v.displayName || "Hamba Allah",
    message: v.message,
  });
  if (error) {
    console.error("submitComment:", error.message);
    return { ok: false, error: "Gagal mengirim pesan. Coba lagi." };
  }

  revalidatePath(`/kampanye/${campaign.slug}`);
  return { ok: true };
}
