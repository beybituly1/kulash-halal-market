"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "../lib/types";

function norm(s: string) {
  return s.toLowerCase().trim();
}

export default function SearchClient({ products }: { products: Product[] }) {
  const [q, setQ] = useState("");

  const query = norm(q);

  const results = useMemo(() => {
    if (!query) return [];
    return products.filter((p) => {
      const t = norm(p.title);
      const c = norm(p.category);
      return t.includes(query) || c.includes(query);
    });
  }, [products, query]);

  return (
    <>
      <div className="search">
        <span>🔎</span>
        <input
          placeholder="Быстрый поиск..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q && (
          <button className="clearBtn" onClick={() => setQ("")} type="button">
            ✕
          </button>
        )}
      </div>

      {query ? (
        <>
          <div className="sectionRow">
            <div className="sectionTitle">Результаты</div>
            <div className="muted">{results.length}</div>
          </div>

          {results.length === 0 ? (
            <div className="muted">Ничего не найдено</div>
          ) : (
            <div className="grid">
              {results.slice(0, 60).map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </>
      ) : null}
    </>
  );
}