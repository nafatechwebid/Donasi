// Mengecilkan & mengompres gambar di browser SEBELUM diupload ke Cloudinary.
// Ini yang membuat upload dari HP jauh lebih cepat, karena file yang dikirim
// jauh lebih kecil daripada foto asli dari kamera (biasanya 3-8 MB).
export async function compressImage(
  file: File,
  maxDimension = 1600,
  quality = 0.82
): Promise<File> {
  // Bukan gambar (mis. sudah dikompres di tempat lain) → kirim apa adanya
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmapSafe(file);
  if (!bitmap) return file; // gagal decode → biarkan file asli yang diupload

  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) return file;

  // Kalau hasil kompresi ternyata lebih besar dari aslinya (jarang, tapi bisa
  // terjadi pada gambar kecil), pakai file asli saja.
  if (blob.size >= file.size) return file;

  const newName = file.name.replace(/\.\w+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}

async function createImageBitmapSafe(file: File): Promise<ImageBitmap | null> {
  try {
    return await createImageBitmap(file);
  } catch {
    return null;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
