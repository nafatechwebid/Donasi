import { z } from "zod";

export const commentSchema = z.object({
  campaignId: z.string().uuid("Kampanye tidak valid"),
  displayName: z.string().trim().max(60, "Nama maksimal 60 karakter"),
  message: z
    .string()
    .trim()
    .min(3, "Pesan minimal 3 karakter")
    .max(300, "Pesan maksimal 300 karakter"),
  website: z.string().max(200),
});

export type CommentInput = z.infer<typeof commentSchema>;
