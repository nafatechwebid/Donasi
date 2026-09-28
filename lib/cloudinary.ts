// Menyisipkan transformasi Cloudinary: format & kualitas otomatis, lebar dibatasi.
// Hasilnya gambar jauh lebih ringan (hemat kuota gratis dan cepat dibuka di HP).
export function cldUrl(url: string | null, width: number): string | null {
  if (!url) return null;
  if (!url.startsWith("https://res.cloudinary.com/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
}
