export type Story = {
  id: string;
  title: string;
  image: string;
};

function parseCSV(text: string) {
  // простой CSV парсер (подойдёт для Google output=csv)
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    // поддержка запятых в кавычках
    const cells: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') inQ = !inQ;
      else if (ch === "," && !inQ) {
        cells.push(cur);
        cur = "";
      } else cur += ch;
    }
    cells.push(cur);

    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => (obj[h] = (cells[idx] ?? "").replace(/^"|"$/g, "").trim()));
    return obj;
  });
}

export async function fetchStories(): Promise<Story[]> {
  const url = process.env.NEXT_PUBLIC_STORIES_CSV_URL;
  if (!url) return [];

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];

  const csv = await res.text();
  const rows = parseCSV(csv);

  // В таблице должны быть колонки:
  // id | title | image
  // (можно и по-русски, см. ниже)
  return rows
    .map((r) => {
      const id = (r["id"] || r["айди"] || "").trim();
      const title = (r["title"] || r["название"] || r["текст"] || "").trim();
      const image = (r["image"] || r["картинка"] || r["фото"] || "").trim();
      if (!id || !image) return null;
      return { id, title: title || "Story", image };
    })
    .filter(Boolean) as Story[];
}