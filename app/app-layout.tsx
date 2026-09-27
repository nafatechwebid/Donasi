import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif" });

export const metadata: Metadata = {
  title: "Donasi — Bersama Meringankan Beban",
  description: "Platform donasi terpercaya untuk kampanye kemanusiaan, pendidikan, dan kesehatan.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0F6E5B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${sourceSerif.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
