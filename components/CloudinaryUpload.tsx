"use client";

import { useState, type ChangeEvent } from "react";

type Props = {
  name: string;
  label: string;
  defaultValue?: string | null;
  maxMB?: number;
};

export default function CloudinaryUpload({ name, label, defaultValue, maxMB = 8 }: Props) {
  const [url, setUrl] = useState<string>(defaultValue ?? "");
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar");
      input.value = "";
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      setError(`Ukuran maksimal ${maxMB} MB`);
      input.value = "";
      return;
    }

    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloud || !preset) {
      setError("Konfigurasi Cloudinary belum diisi di Vercel");
      return;
    }

    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("upload_preset", preset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
        method: "POST",
        body,
      });
      const json = (await res.json()) as { secure_url?: string; error?: { message?: string } };
      if (!res.ok || !json.secure_url) {
        throw new Error(json.error?.message ?? "Upload gagal");
      }
      setUrl(json.secure_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="text-sm text-neutral-700">{label}</span>
      <input type="hidden" name={name} value={url} />

      {url ? (
        <img src={url} alt="Pratinjau" className="mt-2 h-44 w-full rounded-md object-cover" />
      ) : null}

      <input
        type="file"
        accept="image/*"
        onChange={onFile}
        disabled={busy}
        className="mt-2 block w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-light file:px-3 file:py-2 file:text-brand-dark"
      />

      {busy ? <p className="mt-1 text-xs text-neutral-500">Mengunggah...</p> : null}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}

      {url && !busy ? (
        <button
          type="button"
          onClick={() => setUrl("")}
          className="mt-2 text-xs text-red-600 underline"
        >
          Hapus gambar
        </button>
      ) : null}
    </div>
  );
}
