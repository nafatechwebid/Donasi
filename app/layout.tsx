import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/lib/site-settings";
import { deriveTheme } from "@/lib/theme";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: { default: `${s.site_name} — ${s.hero_title}`, template: `%s | ${s.site_name}` },
    description: s.hero_subtitle,
    manifest: "/manifest.json",
    icons: s.favicon_url ? { icon: s.favicon_url, apple: s.favicon_url } : undefined,
  };
}

export async function generateViewport(): Promise<Viewport> {
  const s = await getSiteSettings();
  return {
    themeColor: s.brand_color,
    width: "device-width",
    initialScale: 1,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSiteSettings();
  const t = deriveTheme(s.brand_color);
  // Warna tema disuntikkan sebagai CSS variable; Tailwind membacanya lewat tailwind.config
  const themeVars = {
    "--brand": t.brand,
    "--brand-dark": t.dark,
    "--brand-light": t.light,
  } as CSSProperties;

  return (
    <html lang="id" style={themeVars}>
      <body className={`${inter.variable} ${sourceSerif.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
