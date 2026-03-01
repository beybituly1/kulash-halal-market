"use client";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  salePrice?: number;
  qty: number;
};

const KEY = "kulash_cart_v1";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToCart(
  item: Omit<CartItem, "qty">,
  qty = 1
): CartItem[] {
  const cart = readCart();
  const idx = cart.findIndex((x) => x.id === item.id);

  if (idx >= 0) {
    cart[idx].qty += qty;
  } else {
    cart.push({ ...item, qty });
  }

  writeCart(cart);
  window.dispatchEvent(new Event("cartUpdated"));
  return cart;
}

export function setQty(id: string, qty: number): CartItem[] {
  const cart = readCart().map((x) =>
    x.id === id ? { ...x, qty } : x
  );

  const filtered = cart.filter((x) => x.qty > 0);
  writeCart(filtered);
  window.dispatchEvent(new Event("cartUpdated"));
  return filtered;
}

export function clearCart() {
  writeCart([]);
  window.dispatchEvent(new Event("cartUpdated"));
  }