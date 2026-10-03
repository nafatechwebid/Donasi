// Turunan warna tema dari satu warna utama (hex) milik klien.
export const DEFAULT_BRAND = "#0F6E5B";

const HEX = /^#[0-9a-f]{6}$/i;
export const isHex = (v: string) => HEX.test(v);

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}

const channels = (rgb: number[]) => rgb.map((v) => Math.max(0, Math.min(255, Math.round(v)))).join(" ");
const toHex = (rgb: number[]) =>
  "#" + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");

// Hasil: "r g b" untuk dipakai sebagai CSS variable Tailwind (rgb(var(--brand) / <alpha-value>))
export function deriveTheme(hex: string) {
  const base = isHex(hex) ? hex : DEFAULT_BRAND;
  const [r, g, b] = hexToRgb(base);
  const [h, s, l] = rgbToHsl(r, g, b);
  const dark = hslToRgb(h, s, Math.min(l * 0.7, 0.24)); // judul & hover tombol
  const light = hslToRgb(h, Math.min(s, 0.45), 0.94); // latar lembut
  return {
    hex: base,
    brand: channels([r, g, b]),
    dark: channels(dark),
    light: channels(light),
    darkHex: toHex(dark),
    lightHex: toHex(light),
  };
}

// Rasio kontras warna dengan teks putih (WCAG). Tombol hijau + teks putih butuh >= 4.5.
export function contrastWithWhite(hex: string): number {
  const [r, g, b] = hexToRgb(isHex(hex) ? hex : DEFAULT_BRAND).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return 1.05 / (lum + 0.05);
}
