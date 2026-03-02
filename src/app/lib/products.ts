import type { Product } from "./types";

function toNumber(v: unknown): number {
  const s = String(v ?? "").replace(/\s+/g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function toBool(v: unknown): boolean {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "false" || s === "0" || s === "нет" || s === "no") return false;
  return true;
}

function parseCSV(csv: string): any[] {
  const lines = csv
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj: any = {};

    headers.forEach((h, i) => {
      obj[h] = values[i]?.trim();
    });

    return obj;
  });
}

export async function fetchProducts(): Promise<Product[]> {
  const url = process.env.NEXT_PUBLIC_SHEET_CSV_URL;
  if (!url) throw new Error("Нет NEXT_PUBLIC_SHEET_CSV_URL в .env.local");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Не удалось загрузить CSV");

  const csv = await res.text();
  const rows = parseCSV(csv);

  const products: Product[] = rows
  .map((r) => {
    const id = String(r.id ?? "").trim();
    const category = String(r["категория"] ?? "").trim();
    const title = String(r["название"] ?? "").trim();
    const price = toNumber(r["цена"]);
    const saleRaw = String(r["цена_акции"] ?? "").trim();
    const salePrice = saleRaw ? toNumber(saleRaw) : undefined;
    const unit = String(r["unit"] ?? "").trim() as "шт" | "кг" | "";

    const image =
      String(r["image"] ?? r["фото"] ?? r["photo"] ?? "").trim() || undefined;

    const inStock = toBool(r["в_наличии"]);

    if (!id || !category || !title || !price) return null;

    return {
      id,
      category,
      title,
      price,
      salePrice,
      image,
      inStock,
      unit: unit === "кг" ? "кг" : "шт",
    };
  })
  .filter(Boolean) as Product[];

  // скрываем товары не в наличии
  return products.filter((p) => p.inStock);
}