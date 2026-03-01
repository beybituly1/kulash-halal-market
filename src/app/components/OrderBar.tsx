"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readCart } from "../lib/cart";

function calcSum() {
  const items = readCart();
  return items.reduce((s, i) => {
    const price = i.salePrice ?? i.price;
    return s + price * i.qty;
  }, 0);
}

export default function OrderBar() {
  const [sum, setSum] = useState(0);

  useEffect(() => {
    const sync = () => setSum(calcSum());
    sync();
    window.addEventListener("cartUpdated", sync);
    return () => window.removeEventListener("cartUpdated", sync);
  }, []);

  if (sum <= 0) return null;

  return (
    <Link href="/cart" className="orderBar">
      <span className="orderBarLeft">🛒 В корзине</span>
      <span className="orderBarRight">{sum} тг</span>
    </Link>
  );
}