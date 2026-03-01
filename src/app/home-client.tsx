"use client";

import type { Product } from "./lib/types";
import StoriesClient from "./components/StoriesClient";
import type { Story } from "./lib/stories";
import CatalogClient from "./components/CatalogClient";
import Toast from "./components/Toast";
import OrderBar from "./components/OrderBar";
import { useState } from "react";

export default function HomeClient({
  products,
  stories,
}: {
  products: Product[];
  stories: Story[];
}){<StoriesClient stories={stories} />

  const [tab, setTab] = useState<string>("Акции");
  return (
    <main className="main">
      <StoriesClient stories={stories} />
      <CatalogClient products={products} initialTab={tab} onTabChange={setTab} />
      <Toast />
      <OrderBar />
    </main>
  );
}
