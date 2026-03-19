import Link from "next/link";
import { fetchProducts } from "../lib/products";

const categoryImages: Record<string, string> = {
  "Молочные продукты":
    "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=1200&auto=format&fit=crop",
  "Кефир и йогурты":
    "https://images.unsplash.com/photo-1571212515416-fca88fef1fc6?q=80&w=1200&auto=format&fit=crop",
  "Сметана Творог":
    "https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=1200&auto=format&fit=crop",
  "Масло Сливочные":
    "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=1200&auto=format&fit=crop",
  "Сыры":
    "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=1200&auto=format&fit=crop",
  "Мороженое":
    "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=1200&auto=format&fit=crop",
  "Чипсы Сухарики Семечки":
    "https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=1200&auto=format&fit=crop",
  "Шоколад и сладости":
    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=1200&auto=format&fit=crop",
  "Напитки":
    "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1200&auto=format&fit=crop",
  "Чай и кофе":
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop",
  "Хлеб и выпечка":
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop",
  "Крупы и макароны":
    "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?q=80&w=1200&auto=format&fit=crop",
  "Специи":
    "https://images.unsplash.com/photo-1532336414038-cf19250c5757?q=80&w=1200&auto=format&fit=crop",
  "Консервы":
    "https://images.unsplash.com/photo-1584263347416-85a696b4eda7?q=80&w=1200&auto=format&fit=crop",
};

function fallbackImage(category: string) {
  return (
    categoryImages[category] ||
    "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop"
  );
}

export default async function CategoriesPage() {
  const products = await fetchProducts();

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "ru"));

  return (
    <main className="main">
      <div className="catsTop">
        <Link href="/" className="catsBack">
          ← Назад
        </Link>
        <div className="catsTitle">Все категории</div>
      </div>

      <div className="catGrid">
        {categories.map((category) => (
          <Link
            key={category}
            href={`/?tab=${encodeURIComponent(category)}`}
            className="catCard"
          >
            <div className="catThumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fallbackImage(category)} alt={category} />
            </div>
            <div className="catName">{category}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}