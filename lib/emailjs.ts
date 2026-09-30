export async function kirimKonfirmasiDonasi(p: {
  email?: string | null;
  nama?: string | null;
  nominal: number;
  kampanye: string;
}) {
  if (!p.email) return { ok: false, error: "Email donatur kosong" };
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY,
        template_params: {
          to_email: p.email,
          nama_donatur: p.nama || "Hamba Allah",
          nominal: "Rp " + Number(p.nominal).toLocaleString("id-ID"),
          kampanye: p.kampanye,
          status: "Terverifikasi",
        },
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.error("EmailJS gagal:", res.status, t);
      return { ok: false, error: t };
    }
    return { ok: true };
  } catch (e) {
    console.error("EmailJS error:", e);
    return { ok: false, error: "Gagal kirim email" };
  }
}
