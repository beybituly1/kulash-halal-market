import { fetchProducts } from "./lib/products";
import HomeClient from "./home-client";
import type { Story } from "./components/StoriesClient";

async function fetchStories(): Promise<Story[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/stories`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Home() {
  const products = await fetchProducts();
  const stories = await fetchStories();
  return <HomeClient products={products} stories={stories} />;
}