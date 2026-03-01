export type Product = {
  id: string;
  category: string;
  title: string;
  price: number;
  salePrice?: number;
  image?: string;
  inStock: boolean;
};

export type CartItem = {
  id: string;
  title: string;
  price: number;
  salePrice?: number;
  qty: number;
};