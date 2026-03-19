"use client";

import { useState } from "react";
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

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  const categoryCards = categories.map((category) => {
    const firstWithImage = products.find(
      (p) => p.category === category && p.image
    );

    return {
      name: category,
      image: firstWithImage?.image || "",
    };
  });

  return (
    <main className="main">
      <StoriesClient stories={stories} />

      <div className="catGridHome">
        <button
          type="button"
          className={`catHomeCard ${tab === "Акции" ? "active" : ""}`}
          onClick={() => setTab("Акции")}
        >
          <div className="catHomeThumb fallback">🔥</div>
          <div className="catHomeName">Акции</div>
        </button>

        {categoryCards.map((c) => (
          <button
            key={c.name}
            type="button"
            className={`catHomeCard ${tab === c.name ? "active" : ""}`}
            onClick={() => setTab(c.name)}
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

      <CatalogClient
        products={products}
        initialTab={tab}
        onTabChange={setTab}
        hideTabs
      />

      <Toast />
      <OrderBar />
    </main>
  );
}