"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type MonthPoint = { label: string; total: number };
type CampaignPoint = { name: string; total: number };

const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");
const short = (n: number) =>
  n >= 1_000_000 ? `${+(n / 1_000_000).toFixed(1)} jt` : n >= 1000 ? `${Math.round(n / 1000)} rb` : String(n);

export default function AdminCharts({
  monthly,
  perCampaign,
}: {
  monthly: MonthPoint[];
  perCampaign: CampaignPoint[];
}) {
  return (
    <div className="mt-8 flex flex-col gap-8">
      <section>
        <h2 className="font-serif text-lg text-brand-dark">Donasi per bulan</h2>
        <div className="mt-3 h-64 w-full rounded-lg border border-neutral-200 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} minTickGap={8} />
              <YAxis tickFormatter={short} tick={{ fontSize: 11 }} width={44} />
              <Tooltip formatter={(v) => rp(Number(v))} />
              <Bar dataKey="total" name="Donasi" fill="#0f6b57" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-lg text-brand-dark">Donasi per kampanye</h2>
        {perCampaign.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">Belum ada donasi terverifikasi.</p>
        ) : (
          <div className="mt-3 w-full rounded-lg border border-neutral-200 p-2" style={{ height: 60 + perCampaign.length * 36 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perCampaign} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={short} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                <Tooltip formatter={(v) => rp(Number(v))} />
                <Bar dataKey="total" name="Donasi" fill="#0f6b57" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}
