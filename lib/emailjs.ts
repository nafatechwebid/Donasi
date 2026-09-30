import emailjs from "@emailjs/browser";

export async function kirimKonfirmasiDonasi(p: {
  email?: string | null;
  nama?: string | null;
  nominal: number;
  kampanye: string;
}) {
  if (!p.email) return { ok: false, error: "Email donatur kosong" };
  try {
    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      {
        to_email: p.email,
        nama_donatur: p.nama || "Hamba Allah",
        nominal: "Rp " + Number(p.nominal).toLocaleString("id-ID"),
        kampanye: p.kampanye,
        status: "Terverifikasi",
      },
      { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY! }
    );
    return { ok: true };
  } catch (e: any) {
    console.error("EmailJS gagal:", e);
    return { ok: false, error: e?.text || "Gagal kirim email" };
  }
}
