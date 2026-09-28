"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import { cldUrl } from "@/lib/cloudinary";
import { formatRupiah } from "@/lib/utils";
import { submitDonation } from "@/lib/donation-actions";
import type { DonationInput } from "@/lib/donation-schema";

export type Channel = {
  id: string;
  type: string;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  qris_image_url: string | null;
};

type Props = {
  campaignId: string;
  channels: Channel[];
  defaultName: string;
  defaultEmail: string;
};

const PRESETS: number[] = [10000, 25000, 50000, 100000, 250000, 500000];

const inputCls =
  "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand";

export default function DonationForm({ campaignId, channels, defaultName, defaultEmail }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState<string>("");
  const [channelId, setChannelId] = useState<string>(channels[0]?.id ?? "");
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const selected = channels.find((c) => c.id === channelId);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard tidak tersedia, abaikan
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError("");

    const fd = new FormData(e.currentTarget);
    const text = (key: string): string => {
      const v = fd.get(key);
      return typeof v === "string" ? v : "";
    };
    const r = text("recurring");
    const recurring = r === "weekly" || r === "monthly" ? r : "none";

    const input: DonationInput = {
      campaignId,
      amount: Number(amount),
      channelId,
      isAnonymous: fd.get("is_anonymous") === "on",
      donorName: text("donor_name"),
      donorEmail: text("donor_email"),
      message: text("message"),
      proofUrl: text("proof_url"),
      recurring,
      website: text("hp_ref"),
    };

    setBusy(true);
    try {
      const res = await submitDonation(input);
      if (!res.ok) {
        setError(res.error ?? "Gagal mengirim donasi");
        setBusy(false);
        return;
      }
      router.push(`/donasi/terima-kasih?k=${encodeURIComponent(res.slug ?? "")}`);
    } catch {
      setError("Terjadi gangguan jaringan. Coba lagi.");
      setBusy(false);
    }
  }

  if (channels.length === 0) {
    return (
      <p className="mt-6 rounded-md bg-amber-50 px-3 py-3 text-sm text-amber-800">
        Metode pembayaran belum tersedia. Silakan hubungi pengelola.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-6">
      {/* 1. Nominal */}
      <section>
        <h2 className="font-medium text-neutral-900">1. Nominal donasi</h2>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(String(p))}
              className={`rounded-md border px-2 py-2 text-sm ${
                amount === String(p) ? "border-brand bg-brand text-white" : "border-neutral-300 text-neutral-700"
              }`}
            >
              {formatRupiah(p)}
            </button>
          ))}
        </div>
        <input
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
          placeholder="Atau ketik nominal lain"
          className={inputCls}
        />
        {amount ? <p className="mt-1 text-sm text-brand-dark">{formatRupiah(Number(amount))}</p> : null}
      </section>

      {/* 2. Data donatur */}
      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-neutral-900">2. Data donatur</h2>
        <label className="block">
          <span className="text-sm text-neutral-700">Nama</span>
          <input name="donor_name" defaultValue={defaultName} maxLength={80} className={inputCls} />
        </label>
        <label className="flex items-center gap-3 text-sm text-neutral-700">
          <input type="checkbox" name="is_anonymous" className="h-5 w-5 accent-brand" />
          Sembunyikan nama saya (tampil sebagai &quot;Hamba Allah&quot;)
        </label>
        <label className="block">
          <span className="text-sm text-neutral-700">Email (opsional, untuk tanda terima)</span>
          <input
            name="donor_email"
            type="email"
            defaultValue={defaultEmail}
            maxLength={120}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="text-sm text-neutral-700">Doa atau pesan dukungan (opsional)</span>
          <textarea name="message" rows={3} maxLength={300} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-sm text-neutral-700">Donasi rutin</span>
          <select name="recurring" defaultValue="none" className={inputCls}>
            <option value="none">Sekali saja</option>
            <option value="monthly">Ingatkan saya setiap bulan</option>
            <option value="weekly">Ingatkan saya setiap minggu</option>
          </select>
          <span className="mt-1 block text-xs text-neutral-500">
            Pembayaran tetap dilakukan manual. Kami hanya mengirim pengingat.
          </span>
        </label>
      </section>

      {/* 3. Metode pembayaran */}
      <section>
        <h2 className="font-medium text-neutral-900">3. Metode pembayaran</h2>
        <div className="mt-2 flex flex-col gap-2">
          {channels.map((c) => (
            <label
              key={c.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${
                channelId === c.id ? "border-brand bg-brand-light" : "border-neutral-300"
              }`}
            >
              <input
                type="radio"
                name="channel_id"
                value={c.id}
                checked={channelId === c.id}
                onChange={() => setChannelId(c.id)}
                className="accent-brand"
              />
              <span>{c.type === "qris" ? `QRIS - ${c.bank_name ?? ""}` : `Transfer ${c.bank_name ?? ""}`}</span>
            </label>
          ))}
        </div>

        {selected ? (
          <div className="mt-3 rounded-lg border border-neutral-200 p-4">
            {selected.type === "qris" ? (
              <div>
                <p className="text-sm text-neutral-600">Scan barcode berikut lewat aplikasi e-wallet atau mobile banking:</p>
                {selected.qris_image_url ? (
                  <img
                    src={cldUrl(selected.qris_image_url, 700) ?? selected.qris_image_url}
                    alt="Barcode QRIS"
                    className="mx-auto mt-3 w-full max-w-xs rounded-md"
                  />
                ) : null}
              </div>
            ) : (
              <div>
                <p className="text-xs text-neutral-500">Transfer ke rekening {selected.bank_name}</p>
                <p className="mt-1 text-xl font-semibold tracking-wide text-neutral-900">
                  {selected.account_number}
                </p>
                <p className="text-sm text-neutral-700">a.n. {selected.account_name}</p>
                <button
                  type="button"
                  onClick={() => copy(selected.account_number ?? "")}
                  className="mt-2 rounded-md border border-brand px-3 py-1 text-xs text-brand"
                >
                  {copied ? "Tersalin" : "Salin nomor rekening"}
                </button>
              </div>
            )}
            {amount ? (
              <p className="mt-3 text-sm text-neutral-700">
                Nominal yang ditransfer: <strong>{formatRupiah(Number(amount))}</strong>
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* 4. Bukti */}
      <section>
        <h2 className="font-medium text-neutral-900">4. Bukti pembayaran</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Setelah membayar, unggah screenshot atau foto bukti transfer.
        </p>
        <div className="mt-2">
          <CloudinaryUpload name="proof_url" label="Bukti transfer" />
        </div>
      </section>

      {/* Honeypot anti-bot: jangan diisi */}
      <input
        type="text"
        name="hp_ref"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-brand px-4 py-3 text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {busy ? "Mengirim..." : "Kirim donasi"}
      </button>
      <p className="text-center text-xs text-neutral-500">
        Donasi akan diverifikasi admin sebelum masuk ke progres kampanye.
      </p>
    </form>
  );
}
