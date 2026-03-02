export type Product = {
  id: string;
  category: string;
  title: string;
  price: number;
  salePrice?: number;
  image?: string;
  inStock: boolean;
  unit?: "шт" | "кг";
};

export type CartItem = {
  id: string;
  title: string;
  price: number;
  salePrice?: number;
  qty: number;
};