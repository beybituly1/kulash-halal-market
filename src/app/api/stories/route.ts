import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Story = { id: string; title: string; image: string };

// простой CSV парсер (держит кавычки и запятые внутри)
function splitCSVLine(line: string) {
  const out: string[] = [];
  let cur = "";
  let q = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      // двойные кавычки "" -> "
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        q = !q;
      }
      continue;
    }

    if (ch === "," && !q) {
      out.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const header = splitCSVLine(lines[0]).map((h) => h.replace(/^"|"$/g, ""));

  return lines.slice(1).map((line) => {
    const cells = splitCSVLine(line).map((c) => c.replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    header.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_STORIES_CSV_URL;
  if (!url) return NextResponse.json([]);

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return NextResponse.json([]);

    const csv = await res.text();
    const rows = parseCSV(csv);

    // ⚠️ ВАЖНО: заголовки в таблице должны быть: id, title, image
    // Если у тебя по-русски (например "название" / "картинка"), скажи — я подставлю.
    const stories: Story[] = rows
      .map((r) => {
        const id = String(r.id ?? "").trim();
        const title = String(r.title ?? "").trim();
        const image = String(r.image ?? "").trim();

        if (!id || !title || !image) return null;
        return { id, title, image };
      })
      .filter(Boolean) as Story[];

    return NextResponse.json(stories);
  } catch {
    return NextResponse.json([]);
  }
}