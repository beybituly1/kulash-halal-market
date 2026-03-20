"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "../lib/types";
import ProductCard from "./ProductCard";

export default function CatalogClient({
  products,
  initialTab = "Акции",
  onTabChange,
  hideTabs = false,
  compactTabs = false,
}: {
  products: Product[];
  initialTab?: string;
  onTabChange?: (tab: string) => void;
  hideTabs?: boolean;
  compactTabs?: boolean;
}) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<string>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["Акции", ...Array.from(set)];
  }, [products]);

  const categoryCards = useMemo(() => {
    return categories.map((category) => {
      if (category === "Акции") {
        return {
          name: "Акции",
          image: "",
        };
      }

      const firstWithImage = products.find(
        (p) => p.category === category && p.image
      );

      return {
        name: category,
        image: firstWithImage?.image || "",
      };
    });
  }, [categories, products]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    if (query) {
      return products.filter((p) => {
        const hay = `${p.title} ${p.category ?? ""}`.toLowerCase();
        return hay.includes(query);
      });
    }

    return products.filter((p) => {
      return tab === "Акции"
        ? typeof p.salePrice === "number" && p.salePrice > 0
        : p.category === tab;
    });
  }, [products, q, tab]);

  const setTabSafe = (t: string) => {
    setTab(t);
    onTabChange?.(t);
    setQ("");
  };

  return (
    <>
      <div className="search">
        <span>🔎</span>
        <input
          placeholder="Поиск товаров..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q ? (
          <button className="xBtn" onClick={() => setQ("")} type="button">
            ✕
          </button>
        ) : null}
      </div>

      {!hideTabs && (
        <div className={`tabs ${compactTabs ? "tabsCompact" : ""}`}>
          {categoryCards.map((c) => (
            <button
              key={c.name}
              type="button"
              className={`tabCard ${tab === c.name ? "active" : ""}`}
              onClick={() => setTabSafe(c.name)}
            >
              <div className="tabCardThumb">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt={c.name} />
                ) : (
                  <div className="tabCardFallback">🔥</div>
                )}
              </div>
              <div className="tabCardName">{c.name}</div>
            </button>
          ))}
        </div>
      )}

      <div className="grid">
        {filtered.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="muted" style={{ marginTop: 14 }}>
          Ничего не найдено
        </div>
      ) : null}
    </>
  );
}