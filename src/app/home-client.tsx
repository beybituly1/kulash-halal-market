"use client";

import { useState } from "react";
import type { Product } from "./lib/types";
import type { Story } from "./lib/stories";
import StoriesClient from "./components/StoriesClient";
import CatalogClient from "./components/CatalogClient";
import Toast from "./components/Toast";
import OrderBar from "./components/OrderBar";
import Link from "next/link";

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

  return (
    <main className="main">
      <StoriesClient stories={stories} />

      <div className="allCatsWrap">
        <Link href="/categories" className="allCatsBtn">
          Все категории
        </Link>
      </div>

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