"use client";

import { useState } from "react";
import type { Product } from "./lib/types";
import StoriesClient, { type Story } from "./components/StoriesClient";
import CatalogClient from "./components/CatalogClient";
import OrderBar from "./components/OrderBar";
import Toast from "./components/Toast";

export default function HomeClient({
  products,
  stories,
}: {
  products: Product[];
  stories: Story[];
}) {
  const [tab, setTab] = useState<string>("Акции");

  // fallback чтобы сторис точно появились, даже если API пустой
  const safeStories: Story[] =
    stories?.length > 0
      ? stories
      : [
          {
            id: "s1",
            title: "Что нового?",
            image:
              "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=60",
          },
          {
            id: "s2",
            title: "Для тёплых",
            image:
              "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=60",
          },
        ];

  return (
    <main className="main">
      <StoriesClient stories={safeStories} />

      <CatalogClient
        products={products}
        initialTab={tab}
        onTabChange={setTab}
      />

      <Toast />
      <OrderBar />
    </main>
  );
}