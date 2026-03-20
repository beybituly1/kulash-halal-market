"use client";

import { useMemo, useState } from "react";
import type { Product } from "./lib/types";
import type { Story } from "./lib/stories";
import StoriesClient from "./components/StoriesClient";
import CatalogClient from "./components/CatalogClient";
import Toast from "./components/Toast";
import OrderBar from "./components/OrderBar";

export default function HomeClient({
  products,
  stories,
  initialTab = "Акции",
}: {
  products: Product[];
  stories: Story[];
  initialTab?: string;
}) {
  const [tab, setTab] = useState<string>(initialTab);
  const [pickedCategory, setPickedCategory] = useState(false);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  }, [products]);

  const categoryCards = useMemo(() => {
    return categories.map((category) => {
      const firstWithImage = products.find(
        (p) => p.category === category && p.image
      );

      return {
        name: category,
        image: firstWithImage?.image || "",
      };
    });
  }, [categories, products]);

  const handlePick = (name: string) => {
    setTab(name);
    setPickedCategory(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTabChange = (name: string) => {
    setTab(name);
    setPickedCategory(true);
  };

  return (
    <main className="main">
      <StoriesClient stories={stories} />

      {!pickedCategory && (
        <div className="catGridHome">
          <button
            type="button"
            className={`catHomeCard ${tab === "Акции" ? "active" : ""}`}
            onClick={() => handlePick("Акции")}
          >
            <div className="catHomeThumb fallback">🔥</div>
            <div className="catHomeName">Акции</div>
          </button>

          {categoryCards.map((c) => (
            <button
              key={c.name}
              type="button"
              className={`catHomeCard ${tab === c.name ? "active" : ""}`}
              onClick={() => handlePick(c.name)}
            >
              <div className="catHomeThumb">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt={c.name} />
                ) : (
                  <div className="catHomeThumb fallback">🛒</div>
                )}
              </div>
              <div className="catHomeName">{c.name}</div>
            </button>
          ))}
        </div>
      )}
{pickedCategory && (
  <button
    className="backToCats"
    onClick={() => setPickedCategory(false)}
  >
    ← Все категории
  </button>
)}
      <CatalogClient
        products={products}
        initialTab={tab}
        onTabChange={handleTabChange}
        hideTabs={false}
        compactTabs={pickedCategory}
      />

      <Toast />
      <OrderBar />
    </main>
  );
}