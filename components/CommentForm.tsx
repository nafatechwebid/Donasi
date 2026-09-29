"use client";

import { useState, type FormEvent } from "react";
import { submitComment } from "@/lib/comment-actions";

const inputCls =
  "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand";

export default function CommentForm({
  campaignId,
  defaultName,
}: {
  campaignId: string;
  defaultName: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError("");

    const fd = new FormData(e.currentTarget);
    const text = (key: string): string => {
      const v = fd.get(key);
      return typeof v === "string" ? v : "";
    };

    setBusy(true);
    try {
      const res = await submitComment({
        campaignId,
        displayName: text("display_name"),
        message: text("message"),
        website: text("hp_ref"),
      });
      if (!res.ok) {
        setError(res.error ?? "Gagal mengirim pesan");
        setBusy(false);
        return;
      }
      setSent(true);
      e.currentTarget.reset();
      setBusy(false);
      setTimeout(() => setSent(false), 4000);
    } catch {
      setError("Terjadi gangguan jaringan. Coba lagi.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-neutral-200 p-4">
      <label className="block">
        <span className="text-sm text-neutral-700">Nama (opsional)</span>
        <input
          name="display_name"
          defaultValue={defaultName}
          maxLength={60}
          placeholder="Kosongkan untuk tampil sebagai Hamba Allah"
          className={inputCls}
        />
      </label>
      <label className="mt-3 block">
        <span className="text-sm text-neutral-700">Doa atau pesan dukungan</span>
        <textarea name="message" required rows={3} maxLength={300} className={inputCls} />
      </label>

      {/* Honeypot anti-bot: jangan diisi */}
      <input type="text" name="hp_ref" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {error ? <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {sent ? (
        <p className="mt-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Terima kasih, pesan Anda sudah terkirim.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="mt-3 rounded-md bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {busy ? "Mengirim..." : "Kirim pesan"}
      </button>
    </form>
  );
}
