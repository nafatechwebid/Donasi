"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function getDeviceId(): string {
  const KEY = "donasi_device_id";
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `d-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // localStorage tidak tersedia (mode privat dsb) → pakai id sementara per sesi
    return `d-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}rb`;
  return String(n);
}

export default function LikeButton({
  campaignId,
  variant = "card",
}: {
  campaignId: string;
  variant?: "card" | "detail";
}) {
  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    const deviceId = getDeviceId();
    supabase
      .rpc("get_campaign_like_status", { p_campaign_id: campaignId, p_device_id: deviceId })
      .then(({ data }) => {
        if (cancelled) return;
        const row = Array.isArray(data) ? data[0] : data;
        if (row) {
          setCount(Number(row.like_count));
          setLiked(Boolean(row.liked));
        } else {
          setCount(0);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  async function onTap(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);

    const prevLiked = liked;
    const prevCount = count ?? 0;
    // Optimistic update, biar terasa instan
    setLiked(!prevLiked);
    setCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const supabase = createClient();
      const deviceId = getDeviceId();
      const { data, error } = await supabase.rpc("toggle_campaign_like", {
        p_campaign_id: campaignId,
        p_device_id: deviceId,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        setCount(Number(row.like_count));
        setLiked(Boolean(row.liked));
      }
    } catch {
      // Gagal → kembalikan seperti semula
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setBusy(false);
    }
  }

  if (variant === "detail") {
    return (
      <button
        type="button"
        onClick={onTap}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 shadow-sm active:scale-95"
      >
        <span className={liked ? "text-red-500" : "text-neutral-400"}>{liked ? "❤️" : "🤍"}</span>
        <span className="text-sm text-neutral-700">
          {count === null ? "..." : `${formatCount(count)} orang mendukung`}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onTap}
      disabled={busy}
      className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1.5 shadow active:scale-95"
    >
      <span className={liked ? "text-red-500" : "text-neutral-400"}>{liked ? "❤️" : "🤍"}</span>
      <span className="text-xs font-medium text-neutral-700">{count === null ? "" : formatCount(count)}</span>
    </button>
  );
}
