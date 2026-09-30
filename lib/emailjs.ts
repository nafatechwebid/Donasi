async function kirim(params: Record<string, string>) {
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY,
        template_params: params,
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

const rp = (n: number) => "Rp " + Number(n).toLocaleString("id-ID");

export async function kirimKonfirmasiDonasi(p: {
  email?: string | null;
  nama?: string | null;
  nominal: number;
  kampanye: string;
}) {
  if (!p.email) {
    console.log("EmailJS dilewati: email donatur kosong");
    return { ok: false, error: "Email donatur kosong" };
  }
  return kirim({
    to_email: p.email,
    subject: `Donasi Anda untuk ${p.kampanye} telah diverifikasi`,
    label: "Bukti donasi",
    judul: "Terima Kasih atas Donasi Anda",
    sapaan: `Assalamualaikum ${p.nama || "Hamba Allah"},`,
    intro: "Donasi Anda telah kami verifikasi. Berikut ringkasannya:",
    kampanye: p.kampanye,
    nominal: rp(p.nominal),
    status: "Terverifikasi",
    penutup: "Semoga menjadi amal jariyah yang berkah.",
    footer: `Email ini dikirim ke ${p.email} karena Anda berdonasi di platform kami.`,
  });
}

export async function kirimNotifikasiAdmin(p: {
  nama?: string | null;
  nominal: number;
  kampanye: string;
  metode?: string | null;
}) {
  const admin = process.env.EMAILJS_ADMIN_EMAIL;
  if (!admin) {
    console.log("EmailJS admin dilewati: EMAILJS_ADMIN_EMAIL belum diisi");
    return { ok: false, error: "Email admin belum diatur" };
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://donasi-azure.vercel.app";
  return kirim({
    to_email: admin,
    subject: `Donasi baru ${rp(p.nominal)} untuk ${p.kampanye}`,
    label: "Notifikasi admin",
    judul: "Ada Donasi Baru",
    sapaan: `Donatur: ${p.nama || "Hamba Allah"} · Metode: ${p.metode || "-"}`,
    intro: "Donasi berikut menunggu verifikasi:",
    kampanye: p.kampanye,
    nominal: rp(p.nominal),
    status: "Menunggu verifikasi",
    penutup: `Buka halaman verifikasi: ${base}/admin/donasi`,
    footer: "Notifikasi otomatis untuk admin.",
  });
}
