import { z } from "zod";

export const donationSchema = z.object({
  campaignId: z.string().uuid("Kampanye tidak valid"),
  amount: z
    .number()
    .int("Nominal harus berupa angka bulat")
    .min(5000, "Donasi minimal Rp5.000")
    .max(10000000000, "Nominal terlalu besar"),
  channelId: z.string().uuid("Pilih metode pembayaran"),
  isAnonymous: z.boolean(),
  donorName: z.string().trim().max(80, "Nama maksimal 80 karakter"),
  donorEmail: z
    .string()
    .trim()
    .max(120, "Email terlalu panjang")
    .refine((v) => v === "" || z.string().email().safeParse(v).success, "Format email tidak valid"),
  message: z.string().trim().max(300, "Doa atau pesan maksimal 300 karakter"),
  proofUrl: z
    .string()
    .url("Unggah bukti pembayaran terlebih dahulu")
    .startsWith("https://res.cloudinary.com/", "Bukti pembayaran harus diunggah lewat Cloudinary"),
  recurring: z.enum(["none", "weekly", "monthly"]),
  website: z.string().max(200),
});

export type DonationInput = z.infer<typeof donationSchema>;
