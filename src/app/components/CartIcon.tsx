"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readCart } from "../lib/cart";

export default function CartBar() {
  const [sum, setSum] = useState(0);

  const update = () => {
    const cart = readCart();
    const total = cart.reduce(
      (acc, i) =>
        acc +
        (i.salePrice ? i.salePrice : i.price) * i.qty,
      0
    );
    setSum(total);
  };

  useEffect(() => {
    update();
    window.addEventListener("cartUpdated", update);
    return () => window.removeEventListener("cartUpdated", update);
  }, []);

  if (sum === 0) return null;

  return (
    <Link href="/cart" className="cartBar">
      <span>🛒 В корзине</span>
      <b>{sum} тг</b>
    </Link>
  );
}