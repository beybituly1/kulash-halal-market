import { NextResponse } from "next/server";

type Promo = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_total: number;
  start?: string;
  end?: string;
  active: boolean;
};

function toNumber(v: string) {
  const s = (v || "").replace(/\s+/g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}
function toBool(v: string) {
  const s = (v || "").trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "да";
}

function parseCSV(text: string): { rows: string[][]; delim: string } {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const firstLine = text.split(/\r?\n/)[0] || "";
  const delim = firstLine.includes(";") && !firstLine.includes(",") ? ";" : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && (ch === delim || ch === "\n" || ch === "\r")) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cur);
      cur = "";
      if (ch === "\n" || ch === "\r") {
        if (row.some((x) => x.trim() !== "")) rows.push(row);
        row = [];
      }
      continue;
    }

    cur += ch;
  }

  row.push(cur);
  if (row.some((x) => x.trim() !== "")) rows.push(row);

  return { rows, delim };
}

export async function GET() {
  const url = process.env.PROMO_CSV_URL;
  if (!url) return NextResponse.json({ promos: [] as Promo[] });

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return NextResponse.json({ promos: [] as Promo[] });

  const csv = await res.text();
  const { rows } = parseCSV(csv);
  if (rows.length < 2) return NextResponse.json({ promos: [] as Promo[] });

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const promos: Promo[] = [];

  for (const r of rows.slice(1)) {
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = (r[i] ?? "").trim()));

    const code = (row["code"] ?? "").trim();
    const type = (row["type"] ?? "").trim() as Promo["type"];
    const value = toNumber(row["value"] ?? "");
    const min_total = toNumber(row["min_total"] ?? "");
    const start = (row["start"] ?? "").trim();
    const end = (row["end"] ?? "").trim();
    const active = toBool(row["active"] ?? "");

    if (!code) continue;
    if (type !== "percent" && type !== "fixed") continue;
    if (value <= 0) continue;

    promos.push({
      code,
      type,
      value,
      min_total,
      start: start || undefined,
      end: end || undefined,
      active,
    });
  }

  return NextResponse.json({ promos });
}