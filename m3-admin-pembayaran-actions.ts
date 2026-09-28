"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";

const BACK = "/admin/pembayaran";
const MAX_BANK = 4;
const MAX_QRIS = 6;
const UUID = z.string().uuid();

const bankSchema = z.object({
  bank_name: z.string().trim().min(2, "Nama bank minimal 2 karakter").max(40, "Nama bank maksimal 40 karakter"),
  account_number: z
    .string()
    .trim()
    .regex(/^[0-9 -]{5,30}$/, "Nomor rekening hanya boleh angka (5-30 karakter)"),
  account_name: z
    .string()
    .trim()
    .min(2, "Nama pemilik rekening minimal 2 karakter")
    .max(80, "Nama pemilik rekening maksimal 80 karakter"),
});

const qrisSchema = z.object({
  bank_name: z.string().trim().min(2, "Nama e-wallet minimal 2 karakter").max(30, "Nama e-wallet maksimal 30 karakter"),
  qris_image_url: z
    .string()
    .url("Unggah gambar barcode QRIS terlebih dahulu")
    .startsWith("https://res.cloudinary.com/", "Gambar harus diunggah lewat Cloudinary"),
});

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

function fail(msg: string) {
  return redirect(`${BACK}?error=${encodeURIComponent(msg)}`);
}

function done(msg: string) {
  return redirect(`${BACK}?ok=${encodeURIComponent(msg)}`);
}

export async function addBank(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const parsed = bankSchema.safeParse({
    bank_name: str(formData, "bank_name"),
    account_number: str(formData, "account_number"),
    account_name: str(formData, "account_name"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Data tidak valid");

  const { count } = await supabase
    .from("payment_channels")
    .select("id", { count: "exact", head: true })
    .eq("type", "bank");
  if ((count ?? 0) >= MAX_BANK) return fail(`Maksimal ${MAX_BANK} rekening bank`);

  const { error } = await supabase
    .from("payment_channels")
    .insert({ type: "bank", ...parsed.data, is_active: true });
  if (error) return fail(`Gagal menyimpan: ${error.message}`);

  revalidatePath(BACK);
  return done("Rekening bank ditambahkan");
}

export async function addQris(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const parsed = qrisSchema.safeParse({
    bank_name: str(formData, "bank_name"),
    qris_image_url: str(formData, "qris_image_url"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Data tidak valid");

  const { count } = await supabase
    .from("payment_channels")
    .select("id", { count: "exact", head: true })
    .eq("type", "qris");
  if ((count ?? 0) >= MAX_QRIS) return fail(`Maksimal ${MAX_QRIS} barcode QRIS`);

  const { error } = await supabase
    .from("payment_channels")
    .insert({ type: "qris", ...parsed.data, is_active: true });
  if (error) return fail(`Gagal menyimpan: ${error.message}`);

  revalidatePath(BACK);
  return done("Barcode QRIS ditambahkan");
}

export async function toggleChannel(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const id = str(formData, "id");
  if (!UUID.safeParse(id).success) return redirect(BACK);
  const active = str(formData, "active") === "true";

  const { error } = await supabase.from("payment_channels").update({ is_active: active }).eq("id", id);
  if (error) return fail(error.message);

  revalidatePath(BACK);
  return done(active ? "Metode pembayaran diaktifkan" : "Metode pembayaran dinonaktifkan");
}

export async function deleteChannel(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const id = str(formData, "id");
  if (!UUID.safeParse(id).success) return redirect(BACK);

  const { error } = await supabase.from("payment_channels").delete().eq("id", id);
  if (error) {
    const msg =
      error.code === "23503"
        ? "Metode ini sudah dipakai donasi sehingga tidak bisa dihapus. Nonaktifkan saja."
        : error.message;
    return fail(msg);
  }

  revalidatePath(BACK);
  return done("Metode pembayaran dihapus");
}
