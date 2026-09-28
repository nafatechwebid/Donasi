export function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function randomSuffix(len = 4): string {
  return Math.random().toString(36).slice(2, 2 + len);
}

export function progressPercent(collected: number, target: number): number {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((collected / target) * 100));
}

// Database menyimpan waktu dalam UTC. Form admin memakai WIB (UTC+7).
export function toWibInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 7 * 3600 * 1000);
  return d.toISOString().slice(0, 16);
}

export function fromWibInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(`${value}:00+07:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
