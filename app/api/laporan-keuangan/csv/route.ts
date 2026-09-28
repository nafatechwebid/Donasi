import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const supabase = createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id,title,status,collected_amount")
    .in("status", ["active", "closed"])
    .order("created_at", { ascending: false });

  const { data: exp } = await supabase.from("expenditures").select("campaign_id,amount");
  const spentMap = new Map<string, number>();
  (exp ?? []).forEach((e) => {
    const key = e.campaign_id as string;
    spentMap.set(key, (spentMap.get(key) ?? 0) + Number(e.amount));
  });

  const header = ["Kampanye", "Status", "Dana Masuk", "Dana Keluar", "Sisa"];
  const lines = [header.join(",")];

  (campaigns ?? []).forEach((c) => {
    const collected = Number(c.collected_amount);
    const spent = spentMap.get(c.id as string) ?? 0;
    lines.push(
      [
        csvCell(c.title as string),
        csvCell(c.status === "active" ? "Aktif" : "Ditutup"),
        csvCell(collected),
        csvCell(spent),
        csvCell(collected - spent),
      ].join(",")
    );
  });

  const csv = "\uFEFF" + lines.join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="laporan-keuangan.csv"`,
    },
  });
}
