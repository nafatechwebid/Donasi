"use client";

import { useEffect, useState } from "react";

function split(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

function Box({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 rounded-md bg-amber-50 py-2 text-center">
      <div className="text-xl font-semibold text-amber-800">{String(value).padStart(2, "0")}</div>
      <div className="text-[11px] text-amber-700">{label}</div>
    </div>
  );
}

export default function Countdown({ deadline }: { deadline: string }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(deadline).getTime();
    const tick = () => setLeft(end - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (left === null) return <div className="h-16" />;

  if (left <= 0) {
    return (
      <p className="rounded-md bg-neutral-100 px-3 py-2 text-center text-sm text-neutral-600">
        Penggalangan dana telah berakhir
      </p>
    );
  }

  const p = split(left);
  return (
    <div>
      <p className="mb-1 text-xs text-neutral-500">Sisa waktu penggalangan</p>
      <div className="flex gap-2">
        <Box value={p.d} label="Hari" />
        <Box value={p.h} label="Jam" />
        <Box value={p.m} label="Menit" />
        <Box value={p.s} label="Detik" />
      </div>
    </div>
  );
}
