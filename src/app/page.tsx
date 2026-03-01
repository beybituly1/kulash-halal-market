import { fetchProducts } from "./lib/products";
import HomeClient from "./home-client";
import { fetchStories } from "./lib/stories";

export default async function Home() {
  const products = await fetchProducts();
  const stories = await fetchStories();

  return <HomeClient products={products} stories={stories} />;
}