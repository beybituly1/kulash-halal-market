import HomeClient from "./home-client";
import { fetchProducts } from "./lib/products";
import { fetchStories } from "./lib/stories";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const products = await fetchProducts();
  const stories = await fetchStories();

  const params = await searchParams;
  const initialTab = params?.tab ? decodeURIComponent(params.tab) : "Акции";

  return (
    <HomeClient
      products={products}
      stories={stories}
      initialTab={initialTab}
    />
  );
}